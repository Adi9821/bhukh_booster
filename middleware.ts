import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Only run this middleware for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Add a response header to ensure JSON content type
    const response = NextResponse.next()
    response.headers.set("Content-Type", "application/json")
    return response
  }

  return NextResponse.next()
}

// Only run middleware on API routes
export const config = {
  matcher: "/api/:path*",
}

