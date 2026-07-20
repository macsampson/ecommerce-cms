const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

// Routes that must keep working even in demo mode: logging in/out isn't a data
// mutation, Stripe webhooks and the cron job are system-triggered, not a visitor
// clicking around the dashboard.
const ALWAYS_ALLOWED_PATHS = ['/api/auth/login', '/api/auth/logout', '/api/webhook', '/api/cron']

export function isDemoModeEnabled(): boolean {
  return process.env.DEMO_MODE === 'true'
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
