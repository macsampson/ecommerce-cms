const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

// Routes that must keep working even in demo mode: logging in/out isn't a data
// mutation, Stripe webhooks and the cron job are system-triggered, not a visitor
// clicking around the dashboard.
const ALWAYS_ALLOWED_PATHS = ['/api/auth/login', '/api/auth/logout', '/api/webhook', '/api/cron']

export function isDemoModeEnabled(): boolean {
  return process.env.DEMO_MODE === 'true'
}

// Client components can't read the server-only DEMO_MODE var. The Cloudinary upload
// path in particular goes straight from the browser to Cloudinary — it never hits our
// /api/... routes, so the middleware write-block (isDemoWriteBlocked) never sees it.
// (Vercel Blob uploads do hit /api/upload and are covered by that block, but the
// upload widget is still gated here too so it's never even mounted in demo mode.)
// This is the one place client code needs to know demo mode is on, hence the
// separate NEXT_PUBLIC_ var.
export function isPublicDemoModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}

/**
 * Returns true if this request should be rejected because the deployment is running
 * in read-only demo mode. Kept as a pure function (no NextRequest/NextResponse) so it
 * can be unit tested without spinning up the Edge runtime.
 */
export function isDemoWriteBlocked(method: string, pathname: string): boolean {
  if (!isDemoModeEnabled()) return false
  if (!WRITE_METHODS.has(method.toUpperCase())) return false
  if (!pathname.startsWith('/api/')) return false
  if (ALWAYS_ALLOWED_PATHS.some((allowed) => pathname.startsWith(allowed))) return false
  return true
}
