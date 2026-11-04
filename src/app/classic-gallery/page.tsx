'use client';

import {useEffect, useState} from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

type Category = 'all' | 'lifestyle' | 'scene' | 'home';

interface GalleryImage {
  src: string;
  alt: string;
  category: string;
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

function GalleryCard({image}: {image: GalleryImage}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative aspect-[3/2] overflow-hidden rounded-[20px] bg-gradient-to-br from-neutral-800 to-neutral-950">
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          onError={() => setFailed(true)}
          ref={el => {
            // Catches images that failed before the page hydrated.
            if (el && el.complete && el.naturalWidth === 0) setFailed(true);
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ClassicGalleryTemplate() {
  const [filter, setFilter] = useState<Category>('all');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Load the images that were uploaded on /upload (stored in Vercel Blob).
  useEffect(() => {
    let cancelled = false;
    fetch('/api/gallery', {cache: 'no-store'})
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        setImages(
          (data.images ?? []).map((img: {url: string; category: string}) => ({
            src: img.url,
            alt: ALT_BY_CATEGORY[img.category] ?? 'Gallery photo',
            category: img.category,
          })),
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
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-6 py-16">
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
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredImages.map(image => (
              <GalleryCard key={image.src} image={image} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
