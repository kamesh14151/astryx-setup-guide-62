'use client';

import {useCallback, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {upload} from '@vercel/blob/client';
import {Pattern as FileUploadPattern} from '@/components/file-upload-pattern';

type Category = 'lifestyle' | 'scene' | 'home';

interface RemoteImage {
  url: string;
  pathname: string;
  category: string;
}

const CATEGORY_OPTIONS: {value: Category; label: string}[] = [
  {value: 'lifestyle', label: 'Lifestyle'},
  {value: 'scene', label: 'Scenery'},
  {value: 'home', label: 'Home'},
];

export default function UploadPage() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>('scene');
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [images, setImages] = useState<RemoteImage[]>([]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/gallery', {cache: 'no-store'});
      const data = await res.json();
      setImages(data.images ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleUpload() {
    if (files.length === 0) return setStatus('Choose at least one image.');

    setBusy(true);
    let done = 0;

    try {
      for (const file of files) {
        setStatus(`Uploading ${done + 1} of ${files.length}: ${file.name}`);
        await upload(`gallery/${category}/${file.name}`, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          multipart: file.size > 8 * 1024 * 1024, // faster for big files
        });
        done++;
      }
      setStatus(`Done. Uploaded ${done} image${done > 1 ? 's' : ''}.`);
      setFiles([]);
      await refresh();
    } catch (err) {
      const message = (err as Error).message;
      if (message.includes('Unauthorized')) {
        router.push('/login');
        return;
      }
      setStatus(`Failed after ${done} upload(s): ${message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(url: string) {
    if (!confirm('Delete this image?')) return;

    const res = await fetch('/api/delete', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({url}),
    });
    if (res.status === 401) {
      router.push('/login');
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return setStatus(data.error ?? 'Delete failed');
    }
    setStatus('Deleted.');
    await refresh();
  }

  async function handleSignOut() {
    await fetch('/api/logout', {method: 'POST'});
    router.push('/login');
    router.refresh();
  }

  return (
    <main className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-10 px-6 py-16">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] font-semibold tracking-tight">Upload gallery images</h1>
            <p className="text-muted-foreground">
              Pick a category, choose your photos, and they appear on the gallery page right away.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/images-history"
              className="shrink-0 rounded-xl border border-border bg-background px-4 py-2 text-base font-medium text-foreground transition-colors hover:bg-muted">
              View History
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="shrink-0 rounded-xl bg-muted px-4 py-2 text-base text-foreground transition-colors hover:bg-muted/70">
              Sign out
            </button>
          </div>
        </header>

        <section className="flex flex-col gap-5 rounded-[20px] border border-border p-6">
          <div className="flex flex-col gap-2 text-sm font-medium">
            Category
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCategory(opt.value)}
                  className={[
                    'rounded-xl px-4 py-2 text-base font-normal transition-colors',
                    category === opt.value
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-foreground hover:bg-muted/70',
                  ].join(' ')}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium">
            Images (JPG, PNG, WebP, AVIF, up to 50 MB each)
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={e => setFiles(Array.from(e.target.files ?? []))}
              className="rounded-xl border border-dashed border-input px-4 py-6 text-base font-normal"
            />
          </label>

          {files.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {files.length} file{files.length > 1 ? 's' : ''} selected:{' '}
              {files.map(f => f.name).join(', ')}
            </p>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={busy}
            className="self-start rounded-xl bg-foreground px-6 py-2.5 text-base font-medium text-background transition-opacity disabled:opacity-50">
            {busy ? 'Uploading…' : 'Upload'}
          </button>

          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Uploaded images ({images.length})</h2>
            <span className="text-xs text-muted-foreground">
              Portraits displayed in 4:5 with face-centering
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {images.map(img => {
              const isPortraitCategory = img.category === 'lifestyle';
              return (
                <div
                  key={img.url}
                  className={[
                    'group relative overflow-hidden rounded-2xl bg-muted border border-border shadow-xs transition-transform duration-200 hover:scale-[1.01]',
                    isPortraitCategory ? 'aspect-[4/5]' : 'aspect-[3/2]',
                  ].join(' ')}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.pathname}
                    className={[
                      'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
                      // Face-visible position for portraits:
                      isPortraitCategory ? 'object-[center_20%]' : 'object-center',
                    ].join(' ')}
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-xs">
                    {img.category}
                    {isPortraitCategory ? ' · 4:5 Face' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(img.url)}
                    className="absolute right-2 top-2 rounded-full bg-red-600/80 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600">
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
