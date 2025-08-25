import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3001',
  'https://your-production-domain.com'
]

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Handle store-scoped API routes with CORS validation
  if (pathname.match(/^\/api\/[a-f0-9-]+\//)) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    // Allow same-origin requests (no origin header) or authorized origins
    // Also allow requests from the same host (for same-origin requests from the CMS itself)
    if (origin && !ALLOWED_ORIGINS.includes(origin) && origin !== `https://${host}` && origin !== `http://${host}`) {
      console.log(`CORS blocked origin: ${origin}, allowed: ${ALLOWED_ORIGINS.join(', ')}, host: ${host}`)
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    // Add CORS headers to response
    const response = NextResponse.next()
    if (origin && (ALLOWED_ORIGINS.includes(origin) || origin === `https://${host}` || origin === `http://${host}`)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }
    
    return response
  }
  
  // Allow other public routes
  if (
    pathname.startsWith("/api/webhook") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/login") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("cms_session")
  
  if (!sessionCookie || !sessionCookie.value) {
    // Redirect to login page
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // For now, assume valid cookie means authenticated
  // The actual session validation happens in getSession()
  return NextResponse.next()
}
