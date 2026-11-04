import {NextResponse} from 'next/server';
import {del} from '@vercel/blob';

export async function POST(request: Request) {
  const {password, url} = (await request.json()) as {password?: string; url?: string};

  if (!process.env.UPLOAD_PASSWORD || password !== process.env.UPLOAD_PASSWORD) {
    return NextResponse.json({error: 'Wrong password'}, {status: 401});
  }
  if (!url || !url.includes('blob.vercel-storage.com')) {
    return NextResponse.json({error: 'Invalid url'}, {status: 400});
  }

  await del(url);
  return NextResponse.json({ok: true});
}
