import {NextResponse} from 'next/server';
import {del} from '@vercel/blob';
import {isAuthenticated} from '../../../lib/auth';

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {url} = (await request.json()) as {url?: string};
  if (!url || !url.includes('blob.vercel-storage.com')) {
    return NextResponse.json({error: 'Invalid url'}, {status: 400});
  }

  await del(url);
  return NextResponse.json({ok: true});
}
