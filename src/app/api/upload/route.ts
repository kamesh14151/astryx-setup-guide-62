import {NextResponse} from 'next/server';
import {handleUpload, type HandleUploadBody} from '@vercel/blob/client';

const CATEGORIES = ['lifestyle', 'scene', 'home'];

// Issues a short-lived upload token to the browser so large files go
// straight to Vercel Blob (no 4.5 MB serverless body limit).
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const {password} = JSON.parse(clientPayload || '{}');
        if (!process.env.UPLOAD_PASSWORD || password !== process.env.UPLOAD_PASSWORD) {
          throw new Error('Wrong password');
        }

        // Only allow gallery/<category>/<file>
        const [root, category] = pathname.split('/');
        if (root !== 'gallery' || !CATEGORIES.includes(category)) {
          throw new Error('Invalid path');
        }

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB per image
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Nothing to store: the gallery is built by listing the blobs.
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({error: (error as Error).message}, {status: 400});
  }
}
