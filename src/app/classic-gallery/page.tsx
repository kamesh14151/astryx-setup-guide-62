'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {SmartImage} from '../../components/smart-image';
import {
  SHAPE_ASPECT,
  parseDims,
  shapeOf,
  type Shape,
} from '../../lib/image-meta';

// ─── Types ──────────────────────────────────────────────────────────────────

type Category = 'all' | 'lifestyle' | 'scene' | 'home';

interface GalleryImage {
  src: string;
  alt: string;
  category: string;
  /** Known from the file name; undefined for photos uploaded before that. */
  shape?: Shape;
}

const TABS: {value: Category; label: string}[] = [
  {value: 'all', label: 'All'},
  {value: 'lifestyle', label: 'Lifestyle'},
  {value: 'scene', label: 'Scenery'},
  {value: 'home', label: 'Home'},
];

const ALT_BY_CATEGORY: Record<string, string> = {
  lifestyle: 'Lifestyle photo',
  scene: 'Scenery photo',
  home: 'Home interior photo',
};

// ─── Image card ─────────────────────────────────────────────────────────────

function GalleryCard({
  image,
  onOpen,
}: {
  image: GalleryImage;
  onOpen: (image: GalleryImage) => void;
}) {
  const [failed, setFailed] = useState(false);
  // Older uploads carry no size in their name, so learn it once the photo loads.
  const [loadedShape, setLoadedShape] = useState<Shape | undefined>();
  const shape = image.shape ?? loadedShape ?? 'landscape';

  return (
    <button
      type="button"
      onClick={() => onOpen(image)}
      aria-label={`Open ${image.alt}`}
      style={{aspectRatio: SHAPE_ASPECT[shape]}}
      className="relative mb-4 block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-[20px] bg-gradient-to-br from-neutral-800 to-neutral-950 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
      {!failed && (
        <SmartImage
          src={image.src}
          alt={image.alt}
          onFail={() => setFailed(true)}
          onDimensions={(w, h) => {
            if (!image.shape) setLoadedShape(shapeOf(w, h));
          }}
          className="absolute inset-0"
        />
      )}
    </button>
  );
}

// Full-size view, so a portrait photo can be seen whole (nothing cropped).
function Lightbox({
  image,
  onClose,
}: {
  image: GalleryImage;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-8">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white hover:bg-white/25 focus-visible:ring-3 focus-visible:ring-white/50 focus-visible:outline-none">
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        onClick={e => e.stopPropagation()}
        className="max-h-full max-w-full rounded-xl object-contain"
      />
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ClassicGalleryTemplate() {
  const [filter, setFilter] = useState<Category>('all');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<GalleryImage | null>(null);

  // Load the images that were uploaded on /upload (stored in Vercel Blob).
  useEffect(() => {
    let cancelled = false;
    fetch('/api/gallery', {cache: 'no-store'})
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        setImages(
          (data.images ?? []).map(
            (img: {url: string; pathname: string; category: string}) => {
              const dims = parseDims(img.pathname);
              return {
                src: img.url,
                alt: ALT_BY_CATEGORY[img.category] ?? 'Gallery photo',
                category: img.category,
                shape: dims ? shapeOf(dims.width, dims.height) : undefined,
              };
            },
          ),
        );
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredImages =
    filter === 'all' ? images : images.filter(img => img.category === filter);

  return (
    <main className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-6 py-12">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <span className="text-sm font-medium tracking-tight">Classic Gallery</span>
          <div className="flex items-center gap-3">
            <Link
              href="/images-history"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              Images History
            </Link>
            <Link
              href="/upload"
              className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90">
              Upload
            </Link>
          </div>
        </div>

        {/* Header */}
        <header className="mx-auto flex max-w-[680px] flex-col items-center gap-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-balance text-[32px] font-semibold leading-tight tracking-tight text-foreground md:text-[36px]">
              Make every day a little more delightful, one detail at a time.
            </h1>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground">
              We believe the smallest details are the ones that matter most. A
              little color, a thoughtful touch, a moment that catches your eye
              and makes you pause; that&apos;s what turns an ordinary day into
              something worth remembering.
            </p>
          </div>

          {/* Category tabs */}
          <nav role="tablist" aria-label="Gallery categories" className="flex items-center gap-2">
            {TABS.map(tab => {
              const active = filter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(tab.value)}
                  className={[
                    'relative cursor-pointer rounded-xl px-4 py-2.5 text-base transition-colors',
                    active
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  ].join(' ')}>
                  {tab.label}
                  {active && (
                    <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-foreground" />
                  )}
                </button>
              );
            })}
          </nav>
        </header>

        {/* Gallery grid: 4 columns on desktop, fewer on smaller screens */}
        {loading ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({length: 8}).map((_, i) => (
              <div key={i} className="aspect-[3/2] animate-pulse rounded-[20px] bg-muted" />
            ))}
          </section>
        ) : filteredImages.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No images yet. Add some on the /upload page.
          </p>
        ) : (
          <section className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {filteredImages.map(image => (
              <GalleryCard key={image.src} image={image} onOpen={setOpen} />
            ))}
          </section>
        )}
      </div>
      {open && <Lightbox image={open} onClose={() => setOpen(null)} />}
    </main>
  );
}
