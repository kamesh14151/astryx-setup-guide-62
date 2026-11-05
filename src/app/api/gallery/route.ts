import {NextResponse} from 'next/server';
import {list} from '@vercel/blob';

export const dynamic = 'force-dynamic';

// Returns every image in the Blob store under gallery/<category>/<file>,
// newest first. The category comes from the folder name.
export async function GET() {
  const images: {
    url: string;
    pathname: string;
    category: string;
    uploadedAt: string;
    size: number;
  }[] = [];
  let cursor: string | undefined;

  do {
    const page = await list({prefix: 'gallery/', cursor, limit: 1000});
    for (const blob of page.blobs) {
      const category = blob.pathname.split('/')[1];
      if (!category) continue;
      images.push({
        url: blob.url,
        pathname: blob.pathname,
        category,
        uploadedAt: blob.uploadedAt.toISOString(),
        size: blob.size,
      });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  images.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  return NextResponse.json({images});
}
