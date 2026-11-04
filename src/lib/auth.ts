import {createHash, createHmac, timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';

export const SESSION_COOKIE = 'gallery_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  const s = process.env.AUTH_SECRET || process.env.BLOB_READ_WRITE_TOKEN;
  if (!s) throw new Error('Set AUTH_SECRET in your environment variables.');
  return s;
}

function sign(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

/** Cookie value: "<expiry-unix-seconds>.<hmac>". Tamper-proof without a database. */
export function createSessionValue(): string {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE);
  return `${exp}.${sign(exp)}`;
}

export function verifySessionValue(value?: string | null): boolean {
  if (!value) return false;
  const [exp, sig] = value.split('.');
  if (!exp || !sig) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(exp));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  return Number(exp) > Date.now() / 1000;
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionValue(store.get(SESSION_COOKIE)?.value);
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Password is UPLOAD_PASSWORD. If ADMIN_EMAIL is set, the email must match too. */
export function checkCredentials(email: string, password: string): boolean {
  const expectedPassword = process.env.UPLOAD_PASSWORD;
  if (!expectedPassword) return false;
  const passwordOk = safeEqual(password, expectedPassword);

  const expectedEmail = process.env.ADMIN_EMAIL;
  const emailOk = expectedEmail
    ? safeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase())
    : true;

  return passwordOk && emailOk;
}
