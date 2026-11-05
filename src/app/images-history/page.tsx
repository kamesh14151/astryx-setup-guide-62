'use client';

/**
 * Four kinds of uploaded image assets on one page, each in a collapsible Card
 * with a table of its own — because a portrait headshot, an ultra-wide landscape,
 * an architectural interior, and an editorial lifestyle shoot do not share a column grid.
 *
 * ## Portrait Face Visibility Fix
 *
 * Standard portrait photography places faces in the upper 15-25% of the frame.
 * Default `object-cover` centers at 50% 50%, slicing off heads. This template
 * locks thumbnails and 4:5 cards to `objectPosition: 'center 20%'` so faces are
 * always visible.
 *
 * NOTE: No @stylexjs/stylex is used here — StyleX requires the Babel plugin at
 * build time and cannot be called at runtime. All styling uses inline CSSProperties
 * and plain Tailwind classes, which is consistent with the other pages in this project.
 */

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Icon} from '@astryxdesign/core/Icon';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Token} from '@astryxdesign/core/Token';
import {
  Table,
  pixel,
  proportional,
  useTableRowExpansion,
  useTableSortable,
  useTableSortableState,
} from '@astryxdesign/core/Table';
import type {TableColumn, TableSortComparator} from '@astryxdesign/core/Table';

import {
  UserGroupIcon,
  PhotoIcon,
  BuildingOffice2Icon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

import {Pattern as FileUploadPattern} from '@/components/file-upload-pattern';

// ============= SHARED VOCABULARY =============

export interface MediaRecord extends Record<string, unknown> {
  id: string;
  name: string;
  url: string;
  fileSizeBytes: number;
  dimensions: string;
  format: 'WebP' | 'PNG' | 'JPG' | 'AVIF';
  aspectRatio: string;
  trend: number;
  iso?: number;
  shutter?: string;
  aperture?: string;
  focalLength?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function sum<T>(rows: T[], pick: (row: T) => number): number {
  return rows.reduce((total, row) => total + pick(row), 0);
}

function Figure({children}: {children: string}) {
  return <Text hasTabularNumbers>{children}</Text>;
}

// ============= TIME RANGE =============

const RANGE_IDS = ['1W', '1M', '3M', 'YTD', '1Y'] as const;
type RangeId = (typeof RANGE_IDS)[number];

const RANGE_DAYS: Record<RangeId, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  YTD: 308,
  '1Y': 365,
};

const RangeContext = createContext<RangeId>('YTD');
const useRange = () => useContext(RangeContext);

const SERIES_DAYS = RANGE_DAYS['1Y'];

function seedFrom(id: string): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function historyFor<T extends MediaRecord>(
  rows: T[],
  pick: (row: T) => number,
  volatility: number,
): Array<[string, number[]]> {
  return rows.map(row => {
    let state = seedFrom(row.id) || 1;
    const random = () => {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return ((state >>> 0) % 10000) / 10000 - 0.5;
    };
    const series = new Array<number>(SERIES_DAYS);
    let value = pick(row);
    series[SERIES_DAYS - 1] = value;
    for (let day = SERIES_DAYS - 2; day >= 0; day--) {
      value /= 1 + row.trend + random() * volatility;
      series[day] = Math.max(1, Math.round(value));
    }
    return [row.id, series];
  });
}

function windowOf(id: string, range: RangeId): number[] {
  return HISTORY[id]?.slice(-RANGE_DAYS[range]) ?? [100, 120];
}

function changePercentOf(id: string, range: RangeId): number {
  const points = windowOf(id, range);
  const start = points[0];
  if (!start) return 0;
  return ((points[points.length - 1] - start) / Math.abs(start)) * 100;
}

const percentFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// ============= INLINE STYLE HELPERS =============
// (No stylex.create — it requires the Babel plugin and fails at SSR runtime)

const TEXT_UP_COLOR = 'var(--color-text-green, #0B991F)';
const TEXT_DOWN_COLOR = 'var(--color-text-red, #F5394F)';
const COMPACT_BELOW_PX = 720;
const TILE_SIZE = 28;

/** Wrapping div for the category icon tile in the collapsible trigger. */
const categoryTileStyle: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  width: TILE_SIZE,
  height: TILE_SIZE,
  flexShrink: 0,
  borderRadius: 'var(--radius-inner, 6px)',
  backgroundColor: 'var(--color-background-muted)',
};

/** Page wash background, using the CSS custom property directly. */
const pageWashStyle: CSSProperties = {
  backgroundColor: 'var(--color-background-body)',
};

/** 4:5 portrait container clip. AspectRatio itself handles the ratio. */
const portraitClipStyle: CSSProperties = {
  borderRadius: 'var(--radius-container, 16px)',
  overflow: 'hidden',
};

/** Fills the AspectRatio box with face-centered portrait framing. */
const portraitImgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center 20%', // Keeps face visible — not cropped at the neck!
};

/** Landscape / architecture images use standard center positioning. */
const landscapeImgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center center',
};

function useSurfaceWidth() {
  const ref = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    setWidth(node.offsetWidth);
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

// ============= CHANGE CELLS =============

function ChangeCell({id}: {id: string}) {
  const range = useRange();
  const percent = changePercentOf(id, range);
  const isUp = percent >= 0;
  return (
    <HStack hAlign="end">
      <Token
        size="sm"
        color={isUp ? 'green' : 'red'}
        label={`${isUp ? '+' : '−'}${percentFormat.format(Math.abs(percent))}%`}
      />
    </HStack>
  );
}

function CompactValueCell({
  id,
  fileSizeBytes,
}: {
  id: string;
  fileSizeBytes: number;
}) {
  const range = useRange();
  const percent = changePercentOf(id, range);
  const isUp = percent >= 0;
  return (
    <VStack gap={0} hAlign="end">
      <Figure>{formatBytes(fileSizeBytes)}</Figure>
      <HStack gap={0.5} vAlign="center">
        <span style={{color: isUp ? TEXT_UP_COLOR : TEXT_DOWN_COLOR, fontSize: 'var(--font-size-sm, 12px)'}}>
          {isUp ? '↑' : '↓'} {percentFormat.format(Math.abs(percent))}%
        </span>
      </HStack>
    </VStack>
  );
}

// ============= GROUP 1 — PORTRAITS & HEADSHOTS =============

interface PortraitRecord extends MediaRecord {
  subject: string;
  faceAnchor: string;
}

const PORTRAIT_ACCOUNTS: PortraitRecord[] = [
  {
    id: 'port-1',
    name: 'Elena Vance — Leadership Bio',
    subject: 'Executive Profile',
    faceAnchor: 'Top 20% (Face Centered)',
    url: '/template-assets/light-working-vertical-2.png',
    dimensions: '2400 × 3000',
    format: 'WebP',
    aspectRatio: '4:5 Portrait',
    fileSizeBytes: 4_850_000,
    trend: 0.00032,
    iso: 100,
    shutter: '1/500s',
    aperture: 'f/1.8',
    focalLength: '85mm',
  },
  {
    id: 'port-2',
    name: 'Marcus Cole — Studio Headshot',
    subject: 'Actor Portfolio',
    faceAnchor: 'Top 18% (Face Centered)',
    url: '/template-assets/light-working-vertical-2.png',
    dimensions: '2160 × 2700',
    format: 'WebP',
    aspectRatio: '4:5 Portrait',
    fileSizeBytes: 3_920_000,
    trend: 0.00015,
    iso: 200,
    shutter: '1/250s',
    aperture: 'f/2.0',
    focalLength: '85mm',
  },
  {
    id: 'port-3',
    name: 'Aria Tanaka — Natural Light',
    subject: 'Editorial Feature',
    faceAnchor: 'Top 22% (Face Centered)',
    url: '/template-assets/light-working-vertical-2.png',
    dimensions: '2800 × 3500',
    format: 'JPG',
    aspectRatio: '4:5 Portrait',
    fileSizeBytes: 5_120_000,
    trend: 0.00045,
    iso: 64,
    shutter: '1/800s',
    aperture: 'f/1.4',
    focalLength: '50mm',
  },
];

const portraitColumns: TableColumn<PortraitRecord>[] = [
  {
    key: 'name',
    sortable: true,
    header: 'Portrait Photo',
    width: proportional(2),
    renderCell: row => (
      <HStack gap={3} vAlign="center">
        {/* 4:5 thumbnail with face-visible top-20% anchor */}
        <div
          style={{
            width: 38,
            height: 48,
            borderRadius: 6,
            overflow: 'hidden',
            backgroundColor: '#171717',
            flexShrink: 0,
            border: '1px solid rgba(0,0,0,0.1)',
          }}>
          <img src={row.url} alt={row.name} style={portraitImgStyle} />
        </div>
        <VStack gap={0}>
          <Text weight="medium">{row.name}</Text>
          <Text type="supporting">{row.subject}</Text>
        </VStack>
      </HStack>
    ),
  },
  {
    key: 'framing',
    sortable: true,
    header: 'Framing & Ratio',
    width: pixel(180),
    renderCell: row => (
      <HStack gap={1} vAlign="center">
        <Badge variant="neutral" label="4:5" />
        <Text type="supporting">{row.faceAnchor}</Text>
      </HStack>
    ),
  },
  {
    key: 'dimensions',
    sortable: true,
    header: 'Resolution',
    width: pixel(140),
    align: 'end',
    renderCell: row => <Figure>{row.dimensions}</Figure>,
  },
  {
    key: 'fileSize',
    sortable: true,
    header: 'Size',
    width: pixel(120),
    align: 'end',
    renderCell: row => <Figure>{formatBytes(row.fileSizeBytes)}</Figure>,
  },
  {
    key: 'change',
    sortable: true,
    header: 'Views Trend',
    width: pixel(110),
    align: 'end',
    renderCell: row => <ChangeCell id={row.id} />,
  },
];

const portraitCompactColumns: TableColumn<PortraitRecord>[] = [
  portraitColumns[0],
  {
    key: 'fileSize',
    sortable: true,
    header: 'Size',
    width: pixel(130),
    align: 'end',
    renderCell: row => (
      <CompactValueCell id={row.id} fileSizeBytes={row.fileSizeBytes} />
    ),
  },
];

const portraitComparators: Partial<
  Record<string, TableSortComparator<PortraitRecord>>
> = {
  name: (a, b) => a.name.localeCompare(b.name),
  framing: (a, b) => a.faceAnchor.localeCompare(b.faceAnchor),
  dimensions: (a, b) => a.dimensions.localeCompare(b.dimensions),
  fileSize: (a, b) => a.fileSizeBytes - b.fileSizeBytes,
  change: (a, b) => a.trend - b.trend,
};

// ============= GROUP 2 — SCENERY & LANDSCAPES =============

interface LandscapeRecord extends MediaRecord {
  location: string;
  lighting: string;
}

const LANDSCAPE_ACCOUNTS: LandscapeRecord[] = [
  {
    id: 'land-1',
    name: 'Moody Nordic Fjord',
    location: 'Geirangerfjord, Norway',
    lighting: 'Golden Hour Mist',
    url: '/template-assets/moody-scene-horizontal-1.png',
    dimensions: '3840 × 2160',
    format: 'WebP',
    aspectRatio: '16:9 Landscape',
    fileSizeBytes: 8_620_000,
    trend: 0.00055,
    iso: 64,
    shutter: '1/125s',
    aperture: 'f/8.0',
    focalLength: '24mm',
  },
  {
    id: 'land-2',
    name: 'Pacific Ridge Twilight',
    location: 'Big Sur, California',
    lighting: 'Deep Twilight',
    url: '/template-assets/moody-scene-horizontal-1.png',
    dimensions: '4096 × 2304',
    format: 'WebP',
    aspectRatio: '16:9 Landscape',
    fileSizeBytes: 9_140_000,
    trend: 0.00038,
    iso: 400,
    shutter: '15s',
    aperture: 'f/2.8',
    focalLength: '16mm',
  },
  {
    id: 'land-3',
    name: 'Alpine Glacial Lake',
    location: 'Banff National Park',
    lighting: 'Overcast Soft',
    url: '/template-assets/moody-scene-horizontal-1.png',
    dimensions: '3200 × 1800',
    format: 'JPG',
    aspectRatio: '16:9 Landscape',
    fileSizeBytes: 6_240_000,
    trend: -0.00012,
    iso: 100,
    shutter: '1/320s',
    aperture: 'f/5.6',
    focalLength: '35mm',
  },
];

const landscapeColumns: TableColumn<LandscapeRecord>[] = [
  {
    key: 'name',
    sortable: true,
    header: 'Landscape Scene',
    width: proportional(2),
    renderCell: row => (
      <HStack gap={3} vAlign="center">
        <div
          style={{
            width: 48,
            height: 32,
            borderRadius: 6,
            overflow: 'hidden',
            backgroundColor: '#171717',
            flexShrink: 0,
          }}>
          <img src={row.url} alt={row.name} style={landscapeImgStyle} />
        </div>
        <VStack gap={0}>
          <Text weight="medium">{row.name}</Text>
          <Text type="supporting">{row.location}</Text>
        </VStack>
      </HStack>
    ),
  },
  {
    key: 'lighting',
    sortable: true,
    header: 'Atmosphere / Light',
    width: pixel(180),
    renderCell: row => <Text>{row.lighting}</Text>,
  },
  {
    key: 'dimensions',
    sortable: true,
    header: 'Resolution',
    width: pixel(140),
    align: 'end',
    renderCell: row => <Figure>{row.dimensions}</Figure>,
  },
  {
    key: 'fileSize',
    sortable: true,
    header: 'Size',
    width: pixel(120),
    align: 'end',
    renderCell: row => <Figure>{formatBytes(row.fileSizeBytes)}</Figure>,
  },
  {
    key: 'change',
    sortable: true,
    header: 'Views Trend',
    width: pixel(110),
    align: 'end',
    renderCell: row => <ChangeCell id={row.id} />,
  },
];

const landscapeCompactColumns: TableColumn<LandscapeRecord>[] = [
  landscapeColumns[0],
  {
    key: 'fileSize',
    sortable: true,
    header: 'Size',
    width: pixel(130),
    align: 'end',
    renderCell: row => (
      <CompactValueCell id={row.id} fileSizeBytes={row.fileSizeBytes} />
    ),
  },
];

const landscapeComparators: Partial<
  Record<string, TableSortComparator<LandscapeRecord>>
> = {
  name: (a, b) => a.name.localeCompare(b.name),
  lighting: (a, b) => a.lighting.localeCompare(b.lighting),
  dimensions: (a, b) => a.dimensions.localeCompare(b.dimensions),
  fileSize: (a, b) => a.fileSizeBytes - b.fileSizeBytes,
  change: (a, b) => a.trend - b.trend,
};

// ============= GROUP 3 — ARCHITECTURE & INTERIORS =============

interface InteriorRecord extends MediaRecord {
  spaceType: string;
  illumination: string;
}

const INTERIOR_ACCOUNTS: InteriorRecord[] = [
  {
    id: 'arch-1',
    name: 'Modernist Concrete Pavilion',
    spaceType: 'Commercial Gallery',
    illumination: 'Direct Daylight',
    url: '/template-assets/building.png',
    dimensions: '3200 × 2400',
    format: 'WebP',
    aspectRatio: '4:3 Architecture',
    fileSizeBytes: 6_120_000,
    trend: 0.00025,
    iso: 100,
    shutter: '1/250s',
    aperture: 'f/8.0',
    focalLength: '24mm',
  },
  {
    id: 'arch-2',
    name: 'Brutalist Atrium Stairwell',
    spaceType: 'Architectural Detail',
    illumination: 'High-Contrast Shadows',
    url: '/template-assets/building.png',
    dimensions: '3000 × 2250',
    format: 'WebP',
    aspectRatio: '4:3 Architecture',
    fileSizeBytes: 5_480_000,
    trend: 0.00018,
    iso: 200,
    shutter: '1/160s',
    aperture: 'f/5.6',
    focalLength: '35mm',
  },
  {
    id: 'arch-3',
    name: 'Minimalist Studio Loft',
    spaceType: 'Residential Interior',
    illumination: 'Warm Diffused',
    url: '/template-assets/building.png',
    dimensions: '2800 × 2100',
    format: 'JPG',
    aspectRatio: '4:3 Architecture',
    fileSizeBytes: 4_350_000,
    trend: -0.00008,
    iso: 400,
    shutter: '1/60s',
    aperture: 'f/4.0',
    focalLength: '28mm',
  },
];

const interiorColumns: TableColumn<InteriorRecord>[] = [
  {
    key: 'name',
    sortable: true,
    header: 'Space / Property',
    width: proportional(2),
    renderCell: row => (
      <HStack gap={3} vAlign="center">
        <div
          style={{
            width: 44,
            height: 33,
            borderRadius: 6,
            overflow: 'hidden',
            backgroundColor: '#171717',
            flexShrink: 0,
          }}>
          <img src={row.url} alt={row.name} style={landscapeImgStyle} />
        </div>
        <VStack gap={0}>
          <Text weight="medium">{row.name}</Text>
          <Text type="supporting">{row.spaceType}</Text>
        </VStack>
      </HStack>
    ),
  },
  {
    key: 'illumination',
    sortable: true,
    header: 'Illumination',
    width: pixel(180),
    renderCell: row => <Text>{row.illumination}</Text>,
  },
  {
    key: 'dimensions',
    sortable: true,
    header: 'Resolution',
    width: pixel(140),
    align: 'end',
    renderCell: row => <Figure>{row.dimensions}</Figure>,
  },
  {
    key: 'fileSize',
    sortable: true,
    header: 'Size',
    width: pixel(120),
    align: 'end',
    renderCell: row => <Figure>{formatBytes(row.fileSizeBytes)}</Figure>,
  },
  {
    key: 'change',
    sortable: true,
    header: 'Views Trend',
    width: pixel(110),
    align: 'end',
    renderCell: row => <ChangeCell id={row.id} />,
  },
];

const interiorCompactColumns: TableColumn<InteriorRecord>[] = [
  interiorColumns[0],
  {
    key: 'fileSize',
    sortable: true,
    header: 'Size',
    width: pixel(130),
    align: 'end',
    renderCell: row => (
      <CompactValueCell id={row.id} fileSizeBytes={row.fileSizeBytes} />
    ),
  },
];

const interiorComparators: Partial<
  Record<string, TableSortComparator<InteriorRecord>>
> = {
  name: (a, b) => a.name.localeCompare(b.name),
  illumination: (a, b) => a.illumination.localeCompare(b.illumination),
  dimensions: (a, b) => a.dimensions.localeCompare(b.dimensions),
  fileSize: (a, b) => a.fileSizeBytes - b.fileSizeBytes,
  change: (a, b) => a.trend - b.trend,
};

// ============= GROUP 4 — LIFESTYLE & EDITORIAL =============

interface LifestyleRecord extends MediaRecord {
  campaign: string;
  palette: string;
  swatchHex: string;
}

const LIFESTYLE_ACCOUNTS: LifestyleRecord[] = [
  {
    id: 'life-1',
    name: 'Autumn Artisan Workshop',
    campaign: 'Fall 2026 Collection',
    palette: 'Warm Amber & Ochre',
    swatchHex: '#C47B47',
    url: '/template-assets/light-working-vertical-2.png',
    dimensions: '2800 × 3500',
    format: 'WebP',
    aspectRatio: '4:5 Portrait',
    fileSizeBytes: 5_430_000,
    trend: 0.00042,
    iso: 200,
    shutter: '1/320s',
    aperture: 'f/2.2',
    focalLength: '50mm',
  },
  {
    id: 'life-2',
    name: 'Urban Commute Series',
    campaign: 'Transit Stories',
    palette: 'Cool Slate & Navy',
    swatchHex: '#4E6A82',
    url: '/template-assets/light-working-vertical-2.png',
    dimensions: '2400 × 3000',
    format: 'WebP',
    aspectRatio: '4:5 Portrait',
    fileSizeBytes: 4_680_000,
    trend: 0.00028,
    iso: 400,
    shutter: '1/500s',
    aperture: 'f/2.8',
    focalLength: '35mm',
  },
  {
    id: 'life-3',
    name: 'Ceramic Tabletop Still',
    campaign: 'Handmade Living',
    palette: 'Terracotta & Linen',
    swatchHex: '#D89A7A',
    url: '/template-assets/light-working-vertical-2.png',
    dimensions: '2600 × 3250',
    format: 'JPG',
    aspectRatio: '4:5 Portrait',
    fileSizeBytes: 4_210_000,
    trend: 0.00031,
    iso: 100,
    shutter: '1/125s',
    aperture: 'f/4.0',
    focalLength: '50mm',
  },
];

const lifestyleColumns: TableColumn<LifestyleRecord>[] = [
  {
    key: 'name',
    sortable: true,
    header: 'Shoot / Editorial',
    width: proportional(2),
    renderCell: row => (
      <HStack gap={3} vAlign="center">
        {/* Portrait lifestyle shoots: 4:5 thumbnail with face anchor */}
        <div
          style={{
            width: 38,
            height: 48,
            borderRadius: 6,
            overflow: 'hidden',
            backgroundColor: '#171717',
            flexShrink: 0,
          }}>
          <img src={row.url} alt={row.name} style={portraitImgStyle} />
        </div>
        <VStack gap={0}>
          <Text weight="medium">{row.name}</Text>
          <Text type="supporting">{row.campaign}</Text>
        </VStack>
      </HStack>
    ),
  },
  {
    key: 'palette',
    sortable: true,
    header: 'Palette & Mood',
    width: pixel(180),
    renderCell: row => (
      <HStack gap={2} vAlign="center">
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: row.swatchHex,
            flexShrink: 0,
            border: '1px solid rgba(0,0,0,0.1)',
            display: 'inline-block',
          }}
        />
        <Text>{row.palette}</Text>
      </HStack>
    ),
  },
  {
    key: 'dimensions',
    sortable: true,
    header: 'Resolution',
    width: pixel(140),
    align: 'end',
    renderCell: row => <Figure>{row.dimensions}</Figure>,
  },
  {
    key: 'fileSize',
    sortable: true,
    header: 'Size',
    width: pixel(120),
    align: 'end',
    renderCell: row => <Figure>{formatBytes(row.fileSizeBytes)}</Figure>,
  },
  {
    key: 'change',
    sortable: true,
    header: 'Views Trend',
    width: pixel(110),
    align: 'end',
    renderCell: row => <ChangeCell id={row.id} />,
  },
];

const lifestyleCompactColumns: TableColumn<LifestyleRecord>[] = [
  lifestyleColumns[0],
  {
    key: 'fileSize',
    sortable: true,
    header: 'Size',
    width: pixel(130),
    align: 'end',
    renderCell: row => (
      <CompactValueCell id={row.id} fileSizeBytes={row.fileSizeBytes} />
    ),
  },
];

const lifestyleComparators: Partial<
  Record<string, TableSortComparator<LifestyleRecord>>
> = {
  name: (a, b) => a.name.localeCompare(b.name),
  palette: (a, b) => a.palette.localeCompare(b.palette),
  dimensions: (a, b) => a.dimensions.localeCompare(b.dimensions),
  fileSize: (a, b) => a.fileSizeBytes - b.fileSizeBytes,
  change: (a, b) => a.trend - b.trend,
};

const ALL_ROW_IDS = [
  ...PORTRAIT_ACCOUNTS,
  ...LANDSCAPE_ACCOUNTS,
  ...INTERIOR_ACCOUNTS,
  ...LIFESTYLE_ACCOUNTS,
].map(r => r.id);

// ============= DERIVED HISTORY =============

const HISTORY: Record<string, number[]> = Object.fromEntries([
  ...historyFor(PORTRAIT_ACCOUNTS, r => r.fileSizeBytes / 1000, 0.012),
  ...historyFor(LANDSCAPE_ACCOUNTS, r => r.fileSizeBytes / 1000, 0.018),
  ...historyFor(INTERIOR_ACCOUNTS, r => r.fileSizeBytes / 1000, 0.015),
  ...historyFor(LIFESTYLE_ACCOUNTS, r => r.fileSizeBytes / 1000, 0.014),
]);

// ============= GROUP IDS =============

const GROUP_IDS = [
  'portraits',
  'landscapes',
  'interiors',
  'lifestyle',
] as const;
type GroupId = (typeof GROUP_IDS)[number];

// ============= DETAIL PANEL WITH PORTRAIT 4:5 PREVIEW =============

function ImageDetailPanel({
  record,
  isPortrait = true,
}: {
  record: MediaRecord;
  isPortrait?: boolean;
}) {
  return (
    <Card padding={4}>
      <HStack gap={5} vAlign="start" wrap="wrap">
        {/*
          Portrait 4:5 AspectRatio — matches the Astryx gallery hero standard (ratio={4/5}).
          objectPosition: 'center 20%' ensures the subject's face is never cropped.
        */}
        <div style={{width: 170, flexShrink: 0}}>
          <AspectRatio ratio={isPortrait ? 4 / 5 : 16 / 9} style={portraitClipStyle}>
            <img
              src={record.url}
              alt={record.name}
              style={isPortrait ? portraitImgStyle : landscapeImgStyle}
            />
          </AspectRatio>
          {isPortrait && (
            <div style={{marginTop: 8, textAlign: 'center'}}>
              <Badge variant="neutral" label="4:5 · Face Centered" />
            </div>
          )}
        </div>

        {/* Technical Specs */}
        <StackItem size="fill">
          <VStack gap={3}>
            <VStack gap={0.5}>
              <HStack gap={2} vAlign="center">
                <Text weight="semibold">{record.name}</Text>
                <Badge variant="neutral" label={record.format} />
              </HStack>
              <Text type="supporting">
                {record.dimensions} · {formatBytes(record.fileSizeBytes)}
              </Text>
            </VStack>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 10,
                backgroundColor: 'rgba(0,0,0,0.03)',
              }}>
              <VStack gap={0}>
                <Text type="supporting">Aperture</Text>
                <Text weight="medium">{record.aperture ?? 'f/2.8'}</Text>
              </VStack>
              <VStack gap={0}>
                <Text type="supporting">Shutter</Text>
                <Text weight="medium">{record.shutter ?? '1/250s'}</Text>
              </VStack>
              <VStack gap={0}>
                <Text type="supporting">ISO</Text>
                <Text weight="medium">{String(record.iso ?? 100)}</Text>
              </VStack>
              <VStack gap={0}>
                <Text type="supporting">Lens</Text>
                <Text weight="medium">{record.focalLength ?? '85mm'}</Text>
              </VStack>
            </div>

            <HStack gap={2} wrap="wrap">
              <Button
                label="Download Original"
                size="sm"
                variant="secondary"
                onClick={() => window.open(record.url, '_blank')}
              />
              <Button
                label="Copy CDN URL"
                size="sm"
                variant="ghost"
                onClick={() => navigator.clipboard.writeText(record.url)}
              />
            </HStack>
          </VStack>
        </StackItem>
      </HStack>
    </Card>
  );
}

// ============= GROUP CONTAINER =============

function MediaGroup({
  icon,
  title,
  count,
  summaryLabel,
  summaryValue,
  isOpen,
  onOpenChange,
  children,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  count: number;
  summaryLabel: string;
  summaryValue: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Card padding={2}>
      <Collapsible
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        trigger={
          <HStack
            gap={2}
            vAlign="center"
            hAlign="between"
            paddingBlock={2}
            paddingInline={2}>
            <HStack gap={2} vAlign="center">
              {/* Plain inline style instead of stylex.create */}
              <div style={categoryTileStyle}>
                <Icon icon={icon} size="sm" />
              </div>
              <Text weight="semibold">{title}</Text>
              <Badge variant="neutral" label={String(count)} />
            </HStack>
            <HStack gap={2} vAlign="center">
              <Text color="secondary">{summaryLabel}</Text>
              <Text weight="semibold" hasTabularNumbers>
                {summaryValue}
              </Text>
            </HStack>
          </HStack>
        }>
        <VStack paddingBlockStart={3}>{children}</VStack>
      </Collapsible>
    </Card>
  );
}

function GroupTable<T extends MediaRecord>({
  data,
  columns,
  comparators,
  expandedRows,
  onToggleRow,
  renderExpanded,
}: {
  data: T[];
  columns: TableColumn<T>[];
  comparators: Partial<Record<string, TableSortComparator<T>>>;
  expandedRows: Set<string>;
  onToggleRow: (key: string) => void;
  renderExpanded: (item: T) => React.ReactNode;
}) {
  const range = useRange();
  const rows = useMemo(() => data.slice(), [data, range]);

  const sortComparators = useMemo(
    () => ({
      ...comparators,
      change: (a: T, b: T) =>
        changePercentOf(a.id, range) - changePercentOf(b.id, range),
    }),
    [comparators, range],
  );

  const {sortedData, sortConfig} = useTableSortableState<T>({
    data: rows,
    comparators: sortComparators,
  });
  const sort = useTableSortable<T>(sortConfig);

  const expansion = useTableRowExpansion<T>({
    expandedKeys: expandedRows,
    onToggle: onToggleRow,
    getRowKey: item => item.id,
    renderExpanded,
  });

  return (
    <Table
      data={sortedData}
      columns={columns}
      idKey="id"
      density="compact"
      dividers="rows"
      plugins={{sort, expansion}}
    />
  );
}

// ============= MAIN PAGE =============

export default function ImagesUploadedHistoryTemplate() {
  const [openGroups, setOpenGroups] = useState<Set<GroupId>>(
    () => new Set(GROUP_IDS),
  );
  const [range, setRange] = useState<RangeId>('YTD');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    () => new Set(),
  );
  const [showUploader, setShowUploader] = useState(false);

  const toggleRow = (key: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleGroup = (id: GroupId) => (open: boolean) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const totals = useMemo(() => {
    const portraitBytes = sum(PORTRAIT_ACCOUNTS, p => p.fileSizeBytes);
    const landscapeBytes = sum(LANDSCAPE_ACCOUNTS, l => l.fileSizeBytes);
    const interiorBytes = sum(INTERIOR_ACCOUNTS, i => i.fileSizeBytes);
    const lifestyleBytes = sum(LIFESTYLE_ACCOUNTS, s => s.fileSizeBytes);
    return {
      portraitBytes,
      landscapeBytes,
      interiorBytes,
      lifestyleBytes,
      totalBytes:
        portraitBytes + landscapeBytes + interiorBytes + lifestyleBytes,
      totalFiles:
        PORTRAIT_ACCOUNTS.length +
        LANDSCAPE_ACCOUNTS.length +
        INTERIOR_ACCOUNTS.length +
        LIFESTYLE_ACCOUNTS.length,
    };
  }, []);

  const [contentRef, contentWidth] = useSurfaceWidth();
  const isCompact = contentWidth > 0 && contentWidth < COMPACT_BELOW_PX;

  const isEverythingOpen =
    openGroups.size === GROUP_IDS.length &&
    expandedRows.size === ALL_ROW_IDS.length;

  const toggleEverything = () => {
    const open = !isEverythingOpen;
    setOpenGroups(open ? new Set(GROUP_IDS) : new Set());
    setExpandedRows(open ? new Set(ALL_ROW_IDS) : new Set());
  };

  return (
    <RangeContext.Provider value={range}>
      {/* Wrap in a plain div with the wash background — avoids passing style to
          Layout's xstyle prop which only accepts StyleX objects, not CSSProperties. */}
      <div style={pageWashStyle}>
      <Layout
        height="auto"
        contentWidth={1200}
        header={
          <LayoutHeader padding={4}>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <VStack gap={0.5}>
                  <Heading level={1}>Uploaded Images History</Heading>
                  <Text type="supporting">
                    {formatBytes(totals.totalBytes)} total storage across{' '}
                    {totals.totalFiles} image assets
                  </Text>
                </VStack>
              </StackItem>
              <HStack gap={2} vAlign="center">
                <Button
                  label={showUploader ? 'Hide Uploader' : 'Upload Images'}
                  variant="primary"
                  onClick={() => setShowUploader(prev => !prev)}
                />
                <Button
                  label={isEverythingOpen ? 'Collapse all' : 'Expand all'}
                  variant="ghost"
                  onClick={toggleEverything}
                />
                <SegmentedControl
                  value={range}
                  onChange={value => setRange(value as RangeId)}
                  label="Time range">
                  {RANGE_IDS.map(id => (
                    <SegmentedControlItem key={id} value={id} label={id} />
                  ))}
                </SegmentedControl>
              </HStack>
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={4}>
            <VStack gap={4} ref={contentRef}>
              {showUploader && (
                <Card padding={4}>
                  <VStack gap={3}>
                    <Heading level={3}>Upload Portrait & Gallery Photos</Heading>
                    <Text type="supporting">
                      Portrait photos use a top-20% face anchor — faces are never
                      cropped off in avatar thumbnails or 4:5 cards.
                    </Text>
                    <FileUploadPattern />
                  </VStack>
                </Card>
              )}

              <MediaGroup
                icon={UserGroupIcon}
                title="Portraits & Headshots"
                count={PORTRAIT_ACCOUNTS.length}
                summaryLabel="Storage"
                summaryValue={formatBytes(totals.portraitBytes)}
                isOpen={openGroups.has('portraits')}
                onOpenChange={toggleGroup('portraits')}>
                <GroupTable<PortraitRecord>
                  data={PORTRAIT_ACCOUNTS}
                  columns={isCompact ? portraitCompactColumns : portraitColumns}
                  comparators={portraitComparators}
                  expandedRows={expandedRows}
                  onToggleRow={toggleRow}
                  renderExpanded={row => (
                    <ImageDetailPanel record={row} isPortrait />
                  )}
                />
              </MediaGroup>

              <MediaGroup
                icon={PhotoIcon}
                title="Scenery & Landscapes"
                count={LANDSCAPE_ACCOUNTS.length}
                summaryLabel="Storage"
                summaryValue={formatBytes(totals.landscapeBytes)}
                isOpen={openGroups.has('landscapes')}
                onOpenChange={toggleGroup('landscapes')}>
                <GroupTable<LandscapeRecord>
                  data={LANDSCAPE_ACCOUNTS}
                  columns={
                    isCompact ? landscapeCompactColumns : landscapeColumns
                  }
                  comparators={landscapeComparators}
                  expandedRows={expandedRows}
                  onToggleRow={toggleRow}
                  renderExpanded={row => (
                    <ImageDetailPanel record={row} isPortrait={false} />
                  )}
                />
              </MediaGroup>

              <MediaGroup
                icon={BuildingOffice2Icon}
                title="Architecture & Interiors"
                count={INTERIOR_ACCOUNTS.length}
                summaryLabel="Storage"
                summaryValue={formatBytes(totals.interiorBytes)}
                isOpen={openGroups.has('interiors')}
                onOpenChange={toggleGroup('interiors')}>
                <GroupTable<InteriorRecord>
                  data={INTERIOR_ACCOUNTS}
                  columns={isCompact ? interiorCompactColumns : interiorColumns}
                  comparators={interiorComparators}
                  expandedRows={expandedRows}
                  onToggleRow={toggleRow}
                  renderExpanded={row => (
                    <ImageDetailPanel record={row} isPortrait={false} />
                  )}
                />
              </MediaGroup>

              <MediaGroup
                icon={SparklesIcon}
                title="Lifestyle & Editorial"
                count={LIFESTYLE_ACCOUNTS.length}
                summaryLabel="Storage"
                summaryValue={formatBytes(totals.lifestyleBytes)}
                isOpen={openGroups.has('lifestyle')}
                onOpenChange={toggleGroup('lifestyle')}>
                <GroupTable<LifestyleRecord>
                  data={LIFESTYLE_ACCOUNTS}
                  columns={
                    isCompact ? lifestyleCompactColumns : lifestyleColumns
                  }
                  comparators={lifestyleComparators}
                  expandedRows={expandedRows}
                  onToggleRow={toggleRow}
                  renderExpanded={row => (
                    <ImageDetailPanel record={row} isPortrait />
                  )}
                />
              </MediaGroup>
            </VStack>
          </LayoutContent>
        }
      />
      </div>
    </RangeContext.Provider>
  );
}
