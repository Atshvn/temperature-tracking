/**
 * Next.js Middleware
 * Protects routes and handles authentication redirects
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    "your-super-secret-jwt-key-change-this-in-production",
);

// Public routes that don't require authentication
const publicRoutes = ["/login"];

// Routes that regular users can access
const userAllowedRoutes = [
  "/",
  "/dashboard",
  "/temperature",
  "/settings/password",
  "/no-permission",
  "/under-construction",
];

// Check if pathname is allowed for regular users
function isUserAllowedRoute(pathname: string): boolean {
  return userAllowedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get auth token from cookie
  const token = request.cookies.get("auth_token")?.value;

  // Check if route is public
  const isPublicRoute = publicRoutes.includes(pathname);

  // If no token and route is not public, redirect to login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists, verify it
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const user = payload as { id: string; email: string; role: string };

      // If on login page and authenticated, redirect to home
      if (isPublicRoute) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Check permissions for regular users
      if (user.role !== "ADMIN") {
        // Regular user - check if route is allowed
        if (!isUserAllowedRoute(pathname)) {
          return NextResponse.redirect(new URL("/no-permission", request.url));
        }
      }

      return NextResponse.next();
    } catch (error) {
      // Token is invalid, clear it and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("auth_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
