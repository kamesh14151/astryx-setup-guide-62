import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '../../src/lib/auth'
import HistoryPage from '../../src/app/history/page'

export const metadata: Metadata = {
  title: 'Upload history',
}

export const dynamic = 'force-dynamic'

// Server-side gate: signed-out visitors go to /login before any HTML is sent.
export default async function Page() {
  if (!(await isAuthenticated())) {
    redirect('/login')
  }
  return <HistoryPage />
}
