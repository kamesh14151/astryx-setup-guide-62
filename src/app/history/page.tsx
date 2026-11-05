'use client';

/**
 * Upload history: every image stored in Vercel Blob, grouped by gallery
 * category. Each category is a collapsible card with its own sortable table;
 * a row opens to a large preview with the file's link. Signed-in only (the
 * server wrapper in app/history/page.tsx redirects to /login).
 *
 * Built from the "connected accounts" template, simplified: the groups here
 * share one column set, sizes are real byte counts, and the time range
 * filters on upload date.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from 'react';
import {useRouter} from 'next/navigation';
import {SmartImage} from '../../components/smart-image';
import {cleanName} from '../../lib/image-meta';

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
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
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
  HomeIcon,
  PhotoIcon,
  SparklesIcon,
  SunIcon,
} from '@heroicons/react/24/outline';

// ============= DATA =============

type CategoryId = 'lifestyle' | 'scene' | 'home';

interface ImageRecord extends Record<string, unknown> {
  id: string;
  url: string;
  name: string;
  path: string;
  category: CategoryId;
  uploadedAt: number;
  sizeBytes: number;
}

interface ApiImage {
  url: string;
  pathname: string;
  category: string;
  uploadedAt: string;
  size?: number;
}

const CATEGORIES: {
  id: CategoryId;
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  {id: 'lifestyle', title: 'Lifestyle', icon: SparklesIcon},
  {id: 'scene', title: 'Scenery', icon: SunIcon},
  {id: 'home', title: 'Home', icon: HomeIcon},
];

const CATEGORY_IDS = CATEGORIES.map(c => c.id);

function isCategory(value: string): value is CategoryId {
  return (CATEGORY_IDS as string[]).includes(value);
}

/** Folder, size marker and Blob's random suffix removed. */
function displayName(pathname: string): string {
  return cleanName(pathname);
}

function toRecord(image: ApiImage): ImageRecord | null {
  if (!isCategory(image.category)) {
    return null;
  }
  return {
    id: image.pathname,
    url: image.url,
    name: displayName(image.pathname),
    path: image.pathname,
    category: image.category,
    uploadedAt: new Date(image.uploadedAt).getTime(),
    sizeBytes: image.size ?? 0,
  };
}

// ============= FORMATTING =============

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[unit]}`;
}

const dateFormat = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});

function relativeTime(timestamp: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 60) {
    return 'Just now';
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  if (days < 30) {
    return `${days}d ago`;
  }
  return dateFormat.format(timestamp);
}

// ============= TIME RANGE =============

const RANGES = [
  {id: '24H', label: '24H', ms: 24 * 60 * 60 * 1000},
  {id: '7D', label: '7D', ms: 7 * 24 * 60 * 60 * 1000},
  {id: '30D', label: '30D', ms: 30 * 24 * 60 * 60 * 1000},
  {id: 'ALL', label: 'All', ms: Infinity},
] as const;
type RangeId = (typeof RANGES)[number]['id'];

// ============= STYLES =============

const COMPACT_BELOW_PX = 640;

const tileStyle: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  width: 24,
  height: 24,
  flexShrink: 0,
  borderRadius: 'var(--radius-inner)',
  backgroundColor: 'var(--color-background-muted)',
};
const washStyle: CSSProperties = {
  backgroundColor: 'var(--color-background-body)',
};
const thumbBox = (w: number, h: number): CSSProperties => ({
  width: w,
  height: h,
  flexShrink: 0,
  overflow: 'hidden',
  borderRadius: 'var(--radius-inner)',
  backgroundColor: 'var(--color-background-muted)',
});
const previewImg: CSSProperties = {
  display: 'block',
  width: '100%',
  maxHeight: 320,
  objectFit: 'contain',
  borderRadius: 'var(--radius-inner)',
  backgroundColor: 'var(--color-background-muted)',
};

// ============= SMALL PIECES =============

function Figure({children}: {children: string}) {
  return <Text hasTabularNumbers>{children}</Text>;
}

/** Image that falls back to a plain block if the file cannot load. */
function Thumb({
  url,
  alt,
  width,
  height,
  isPreview,
}: {
  url: string;
  alt: string;
  width: number;
  height: number;
  isPreview?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (isPreview) {
    // Large preview: show the whole picture, nothing cropped.
    return failed ? null : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        loading="lazy"
        style={previewImg}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div style={thumbBox(width, height)}>
      {!failed && (
        <SmartImage src={url} alt={alt} onFail={() => setFailed(true)} />
      )}
    </div>
  );
}

function NameCell({item, showMeta, now}: {item: ImageRecord; showMeta?: boolean; now: number}) {
  return (
    <HStack gap={3} vAlign="center">
      <Thumb url={item.url} alt={item.name} width={56} height={40} />
      <VStack gap={0}>
        <Text>{item.name}</Text>
        <Text type="supporting">
          {showMeta
            ? `${formatBytes(item.sizeBytes)} · ${relativeTime(item.uploadedAt, now)}`
            : item.path}
        </Text>
      </VStack>
    </HStack>
  );
}

// ============= COLUMNS =============

function buildColumns({
  isCompact,
  now,
  deletingId,
  onDelete,
}: {
  isCompact: boolean;
  now: number;
  deletingId: string | null;
  onDelete: (item: ImageRecord) => void;
}): TableColumn<ImageRecord>[] {
  const actions: TableColumn<ImageRecord> = {
    key: 'actions',
    header: 'Actions',
    width: pixel(110),
    align: 'end',
    renderCell: item => (
      <HStack hAlign="end">
        <Button
          label="Delete"
          variant="ghost"
          size="sm"
          isLoading={deletingId === item.id}
          onClick={() => onDelete(item)}
        />
      </HStack>
    ),
  };

  if (isCompact) {
    return [
      {
        key: 'name',
        sortable: true,
        header: 'Image',
        width: proportional(2),
        renderCell: item => <NameCell item={item} now={now} showMeta />,
      },
      actions,
    ];
  }

  return [
    {
      key: 'name',
      sortable: true,
      header: 'Image',
      width: proportional(2),
      renderCell: item => <NameCell item={item} now={now} />,
    },
    {
      key: 'uploaded',
      sortable: true,
      header: 'Uploaded',
      width: pixel(190),
      renderCell: item => (
        <VStack gap={0}>
          <Text>{dateFormat.format(item.uploadedAt)}</Text>
          <Text type="supporting">
            {timeFormat.format(item.uploadedAt)} · {relativeTime(item.uploadedAt, now)}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'size',
      sortable: true,
      header: 'Size',
      width: pixel(110),
      align: 'end',
      renderCell: item => <Figure>{formatBytes(item.sizeBytes)}</Figure>,
    },
    actions,
  ];
}

const comparators: Partial<Record<string, TableSortComparator<ImageRecord>>> = {
  name: (a, b) => a.name.localeCompare(b.name),
  uploaded: (a, b) => a.uploadedAt - b.uploadedAt,
  size: (a, b) => a.sizeBytes - b.sizeBytes,
};

// ============= EXPANDED ROW =============

function DetailPanel({item}: {item: ImageRecord}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: the link below can still be opened */
    }
  };

  return (
    <VStack gap={3}>
      <Thumb url={item.url} alt={item.name} width={0} height={0} isPreview />
      <HStack gap={2} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <Text type="supporting" color="secondary" maxLines={1}>
            {item.url}
          </Text>
        </StackItem>
        <Button
          label={copied ? 'Copied' : 'Copy link'}
          variant="secondary"
          size="sm"
          onClick={copy}
        />
        <Button
          label="Open original"
          variant="secondary"
          size="sm"
          onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
        />
      </HStack>
    </VStack>
  );
}

// ============= GROUP =============

function CategoryGroup({
  icon,
  title,
  count,
  totalBytes,
  isOpen,
  onOpenChange,
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  count: number;
  totalBytes: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
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
              <div style={tileStyle}>
                <Icon icon={icon} size="sm" />
              </div>
              <Text weight="semibold">{title}</Text>
              <Badge variant="neutral" label={String(count)} />
            </HStack>
            <HStack gap={2} vAlign="center">
              <Text color="secondary">Total size</Text>
              <Text weight="semibold" hasTabularNumbers>
                {formatBytes(totalBytes)}
              </Text>
            </HStack>
          </HStack>
        }>
        <VStack paddingBlockStart={3}>{children}</VStack>
      </Collapsible>
    </Card>
  );
}

function GroupTable({
  data,
  columns,
  expandedRows,
  onToggleRow,
}: {
  data: ImageRecord[];
  columns: TableColumn<ImageRecord>[];
  expandedRows: Set<string>;
  onToggleRow: (key: string) => void;
}) {
  const {sortedData, sortConfig} = useTableSortableState<ImageRecord>({
    data,
    comparators,
  });
  const sort = useTableSortable<ImageRecord>(sortConfig);
  const expansion = useTableRowExpansion<ImageRecord>({
    expandedKeys: expandedRows,
    onToggle: onToggleRow,
    getRowKey: item => item.id,
    renderExpanded: item => <DetailPanel item={item} />,
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

/** Width of the box the cards sit in, so narrow screens get fewer columns. */
function useSurfaceWidth() {
  const ref = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    setWidth(node.offsetWidth);
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

// ============= PAGE =============

export default function UploadHistoryPage() {
  const router = useRouter();
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [now, setNow] = useState(() => Date.now());
  const [range, setRange] = useState<RangeId>('ALL');
  const [notice, setNotice] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Set<CategoryId>>(
    () => new Set(CATEGORY_IDS),
  );
  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    () => new Set(),
  );
  const [contentRef, contentWidth] = useSurfaceWidth();
  const isCompact = contentWidth > 0 && contentWidth < COMPACT_BELOW_PX;

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/gallery', {cache: 'no-store'});
      if (!res.ok) {
        throw new Error('Request failed');
      }
      const data = (await res.json()) as {images?: ApiImage[]};
      setImages(
        (data.images ?? [])
          .map(toRecord)
          .filter((r): r is ImageRecord => r !== null),
      );
      setNow(Date.now());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = useCallback(
    async (item: ImageRecord) => {
      if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) {
        return;
      }
      setDeletingId(item.id);
      setNotice('');
      try {
        const res = await fetch('/api/delete', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({url: item.url}),
        });
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setNotice(data.error ?? 'Delete failed.');
          return;
        }
        setImages(prev => prev.filter(img => img.id !== item.id));
        setExpandedRows(prev => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
        setNotice(`Deleted ${item.name}.`);
      } catch {
        setNotice('Network error. Try again.');
      } finally {
        setDeletingId(null);
      }
    },
    [router],
  );

  const handleSignOut = async () => {
    await fetch('/api/logout', {method: 'POST'});
    router.push('/login');
    router.refresh();
  };

  const rangeMs = RANGES.find(r => r.id === range)?.ms ?? Infinity;
  const visible = useMemo(
    () => images.filter(img => now - img.uploadedAt <= rangeMs),
    [images, now, rangeMs],
  );

  const byCategory = useMemo(() => {
    const map: Record<CategoryId, ImageRecord[]> = {
      lifestyle: [],
      scene: [],
      home: [],
    };
    for (const img of visible) {
      map[img.category].push(img);
    }
    return map;
  }, [visible]);

  const totalBytes = visible.reduce((sum, img) => sum + img.sizeBytes, 0);

  const columns = useMemo(
    () => buildColumns({isCompact, now, deletingId, onDelete: handleDelete}),
    [isCompact, now, deletingId, handleDelete],
  );

  const toggleRow = (key: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleGroup = (id: CategoryId) => (open: boolean) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (open) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const isEverythingOpen =
    openGroups.size === CATEGORY_IDS.length &&
    visible.length > 0 &&
    visible.every(img => expandedRows.has(img.id));

  const toggleEverything = () => {
    const open = !isEverythingOpen;
    setOpenGroups(open ? new Set(CATEGORY_IDS) : new Set());
    setExpandedRows(open ? new Set(visible.map(img => img.id)) : new Set());
  };

  const goUpload = () => router.push('/upload');

  let body: ReactNode;
  if (status === 'loading') {
    body = (
      <VStack gap={4}>
        {CATEGORY_IDS.map(id => (
          <Skeleton key={id} width="100%" height={120} radius={3} />
        ))}
      </VStack>
    );
  } else if (status === 'error') {
    body = (
      <Card padding={6}>
        <EmptyState
          title="Could not load your uploads"
          description="Check your connection and try again."
          actions={<Button label="Try again" variant="primary" onClick={load} />}
        />
      </Card>
    );
  } else if (images.length === 0) {
    body = (
      <Card padding={6}>
        <EmptyState
          icon={<Icon icon={PhotoIcon} size="lg" color="secondary" />}
          title="No uploads yet"
          description="Images you upload will be listed here, grouped by category."
          actions={
            <Button label="Upload images" variant="primary" onClick={goUpload} />
          }
        />
      </Card>
    );
  } else {
    body = (
      <VStack gap={4}>
        {CATEGORIES.map(cat => {
          const rows = byCategory[cat.id];
          return (
            <CategoryGroup
              key={cat.id}
              icon={cat.icon}
              title={cat.title}
              count={rows.length}
              totalBytes={rows.reduce((s, r) => s + r.sizeBytes, 0)}
              isOpen={openGroups.has(cat.id)}
              onOpenChange={toggleGroup(cat.id)}>
              {rows.length === 0 ? (
                <EmptyState
                  isCompact
                  title={`No ${cat.title.toLowerCase()} images`}
                  description={
                    range === 'ALL'
                      ? 'Upload some to see them here.'
                      : 'Nothing was uploaded in this time range.'
                  }
                />
              ) : (
                <GroupTable
                  data={rows}
                  columns={columns}
                  expandedRows={expandedRows}
                  onToggleRow={toggleRow}
                />
              )}
            </CategoryGroup>
          );
        })}
      </VStack>
    );
  }

  return (
    <Layout
      height="auto"
      contentWidth={1200}
      style={washStyle}
      header={
        <LayoutHeader padding={4}>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={0.5}>
                <Heading level={1}>Upload history</Heading>
                <Text type="supporting">
                  {status === 'ready'
                    ? `${visible.length} ${visible.length === 1 ? 'image' : 'images'} · ${formatBytes(totalBytes)} across ${CATEGORIES.length} categories`
                    : 'Everything stored in your gallery'}
                </Text>
              </VStack>
            </StackItem>
            {status === 'ready' && images.length > 0 && (
              <>
                <Button
                  label={isEverythingOpen ? 'Collapse all' : 'Expand all'}
                  variant="ghost"
                  onClick={toggleEverything}
                />
                <SegmentedControl
                  value={range}
                  onChange={value => setRange(value as RangeId)}
                  label="Uploaded within">
                  {RANGES.map(r => (
                    <SegmentedControlItem
                      key={r.id}
                      value={r.id}
                      label={r.label}
                    />
                  ))}
                </SegmentedControl>
              </>
            )}
            <Button label="Upload images" variant="primary" onClick={goUpload} />
            <Button label="Sign out" variant="ghost" onClick={handleSignOut} />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={4}>
          <VStack gap={4} ref={contentRef}>
            {notice && (
              <Text type="supporting" color="secondary">
                {notice}
              </Text>
            )}
            {body}
          </VStack>
        </LayoutContent>
      }
    />
  );
}
