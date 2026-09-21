import { NextResponse, type NextRequest } from "next/server";

// The previous (v1) portfolio lives in its own Vercel project, built with basePath "/archive/v1".
// This proxies it onto ekram.tech. It is middleware rather than a next.config rewrite because the archive's own Next.js
// links send router headers (Next-Url, Next-Router-State-Tree) that a rewrite never gets to see: v2's router 404s them first.
// ARCHIVE_V1_ORIGIN overrides the target for local testing.
const ARCHIVE_V1_ORIGIN = process.env.ARCHIVE_V1_ORIGIN ?? "https://ekram-portfolio-mu.vercel.app";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  return NextResponse.rewrite(new URL(`${pathname}${search}`, ARCHIVE_V1_ORIGIN));
}

export const config = { matcher: ["/archive/v1", "/archive/v1/:path*"] };
