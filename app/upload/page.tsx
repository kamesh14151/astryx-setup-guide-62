import { redirect } from 'next/navigation'
import { isAuthenticated } from '../../src/lib/auth'
import UploadPage from '../../src/app/upload/page'

export const dynamic = 'force-dynamic'

// Server-side gate: signed-out visitors are sent to /login before any HTML is sent.
export default async function Page() {
  if (!(await isAuthenticated())) {
    redirect('/login')
  }
  return <UploadPage />
}
