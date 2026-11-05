'use client';

import {useCallback, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {upload} from '@vercel/blob/client';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ImageUpIcon,
  XIcon,
} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {formatBytes, useFileUpload} from '@/hooks/use-file-upload';
import {SmartImage} from '../../components/smart-image';
import {readDimensions, withDims} from '../../lib/image-meta';

type Category = 'lifestyle' | 'scene' | 'home';
type FileState = {status: 'queued' | 'uploading' | 'done' | 'error'; progress: number; error?: string};

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

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB per image
const MAX_FILES = 20;

export default function UploadPage() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>('scene');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [fileStates, setFileStates] = useState<Record<string, FileState>>({});
  const [images, setImages] = useState<RemoteImage[]>([]);

  const [
    {files, isDragging, errors},
    {
      removeFile,
      clearFiles,
      clearErrors,
      openFileDialog,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
    },
  ] = useFileUpload({
    accept: 'image/jpeg,image/png,image/webp,image/avif',
    multiple: true,
    maxFiles: MAX_FILES,
    maxSize: MAX_SIZE,
  });

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

  const setFileState = (id: string, patch: Partial<FileState>) =>
    setFileStates(prev => ({
      ...prev,
      [id]: {...(prev[id] ?? {status: 'queued', progress: 0}), ...patch},
    }));

  async function handleUpload() {
    const pending = files.filter(f => fileStates[f.id]?.status !== 'done');
    if (pending.length === 0) {
      return setStatus('Choose at least one image.');
    }

    setBusy(true);
    setStatus('');
    clearErrors();
    let done = 0;
    let failed = 0;

    for (const item of pending) {
      const file = item.file as File;
      setFileState(item.id, {status: 'uploading', progress: 0, error: undefined});
      try {
        const dims = await readDimensions(file);
        await upload(`gallery/${category}/${withDims(file.name, dims)}`, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          multipart: file.size > 8 * 1024 * 1024,
          onUploadProgress: ({percentage}) =>
            setFileState(item.id, {progress: Math.round(percentage)}),
        });
        setFileState(item.id, {status: 'done', progress: 100});
        done++;
      } catch (err) {
        const message = (err as Error).message;
        if (message.includes('Unauthorized')) {
          router.push('/login');
          return;
        }
        setFileState(item.id, {status: 'error', error: message});
        failed++;
      }
    }

    setBusy(false);
    setStatus(
      failed === 0
        ? `Done. Uploaded ${done} image${done === 1 ? '' : 's'}.`
        : `Uploaded ${done}, ${failed} failed. Fix the marked files and try again.`,
    );
    await refresh();
  }

  function handleClear() {
    clearFiles();
    setFileStates({});
    setStatus('');
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

  const allDone = files.length > 0 && files.every(f => fileStates[f.id]?.status === 'done');

  return (
    <main className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-10 px-6 py-16">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] font-semibold tracking-tight">Upload gallery images</h1>
            <p className="text-muted-foreground">
              Pick a category, drop your photos, and they appear on the gallery page right away.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="secondary" onClick={() => router.push('/history')}>
              History
            </Button>
            <Button variant="secondary" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </header>

        <section className="flex flex-col gap-6 rounded-[20px] border border-border p-6">
          <div className="flex flex-col gap-2 text-sm font-medium">
            Category
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Category">
              {CATEGORY_OPTIONS.map(opt => (
                <Button
                  key={opt.value}
                  role="radio"
                  aria-checked={category === opt.value}
                  variant={category === opt.value ? 'default' : 'secondary'}
                  size="lg"
                  onClick={() => setCategory(opt.value)}>
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            onClick={openFileDialog}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openFileDialog();
              }
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            data-dragging={isDragging || undefined}
            className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input px-4 py-8 text-center transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none data-[dragging=true]:border-ring data-[dragging=true]:bg-muted/60">
            <input
              {...getInputProps()}
              className="sr-only"
              aria-label="Upload image files"
              tabIndex={-1}
            />
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background"
              aria-hidden="true">
              <ImageUpIcon className="size-4 opacity-60" />
            </div>
            <p className="text-sm font-medium">
              {isDragging ? 'Drop images here' : 'Drop images here or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP or AVIF · up to {formatBytes(MAX_SIZE, 0)} each · max {MAX_FILES} at a time
            </p>
          </div>

          {errors.length > 0 && (
            <div className="flex flex-col gap-1 text-xs text-destructive" role="alert">
              {errors.map(error => (
                <p key={error} className="flex items-center gap-1.5">
                  <AlertCircleIcon className="size-3 shrink-0" />
                  {error}
                </p>
              ))}
            </div>
          )}

          {/* Selected files */}
          {files.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {files.map(item => {
                const st = fileStates[item.id];
                return (
                  <li
                    key={item.id}
                    className="group relative flex flex-col gap-2 rounded-xl border border-border p-2">
                    <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-muted">
                      {item.preview && (
                        <SmartImage src={item.preview} alt={item.file.name} />
                      )}
                      {st?.status === 'uploading' && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
                          <div
                            className="h-full bg-foreground transition-[width]"
                            style={{width: `${st.progress}%`}}
                          />
                        </div>
                      )}
                      {st?.status === 'done' && (
                        <span className="absolute right-1.5 bottom-1.5 rounded-full bg-background p-0.5">
                          <CheckCircle2Icon className="size-4 text-green-600" />
                        </span>
                      )}
                      {!busy && st?.status !== 'done' && (
                        <button
                          type="button"
                          onClick={() => removeFile(item.id)}
                          aria-label={`Remove ${item.file.name}`}
                          className="absolute top-1.5 right-1.5 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-100 transition-opacity focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100">
                          <XIcon className="size-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <p className="truncate text-xs font-medium">{item.file.name}</p>
                      <p
                        className={
                          st?.status === 'error'
                            ? 'truncate text-xs text-destructive'
                            : 'truncate text-xs text-muted-foreground'
                        }>
                        {st?.status === 'error'
                          ? st.error
                          : st?.status === 'uploading'
                            ? `Uploading ${st.progress}%`
                            : st?.status === 'done'
                              ? 'Uploaded'
                              : formatBytes(item.file.size)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={handleUpload} disabled={busy || files.length === 0 || allDone}>
              {busy
                ? 'Uploading…'
                : files.length > 1
                  ? `Upload ${files.length} images`
                  : 'Upload'}
            </Button>
            {files.length > 0 && !busy && (
              <Button size="lg" variant="ghost" onClick={handleClear}>
                {allDone ? 'Clear list' : 'Remove all'}
              </Button>
            )}
            {status && (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {status}
              </p>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Uploaded images ({images.length})</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map(img => (
              <div key={img.url} className="group relative aspect-[3/2] overflow-hidden rounded-2xl bg-muted">
                <SmartImage src={img.url} alt={img.pathname} />
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                  {img.category}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(img.url)}
                  className="absolute right-2 top-2 cursor-pointer rounded-full bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
