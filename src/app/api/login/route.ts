import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  checkCredentials,
  createSessionValue,
} from '../../../lib/auth';

export async function POST(request: Request) {
  const {email = '', password = ''} = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  if (!checkCredentials(String(email), String(password))) {
    // Small delay slows down password guessing.
    await new Promise(resolve => setTimeout(resolve, 700));
    return NextResponse.json({error: 'Incorrect email or password.'}, {status: 401});
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return NextResponse.json({ok: true});
}
