import { auth } from "@/lib/auth";

// Next.js 16+ uses proxy.ts with a named "proxy" export (replaces middleware.ts).
// This refreshes the session expiry on every request to matched routes.
export const proxy = auth;

export const config = {
  matcher: [
    // Match all routes except static files, images, and auth API
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
