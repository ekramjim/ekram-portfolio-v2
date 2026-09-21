// The previous (v1) portfolio lives in its own Vercel project, built with basePath "/archive/v1".
// Proxying the path keeps it on this domain: ekram.tech/archive/v1. ARCHIVE_V1_ORIGIN overrides the target for local testing.
const ARCHIVE_V1_ORIGIN = process.env.ARCHIVE_V1_ORIGIN ?? "https://ekram-portfolio-mu.vercel.app";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/archive/v1", destination: `${ARCHIVE_V1_ORIGIN}/archive/v1` },
      { source: "/archive/v1/:path*", destination: `${ARCHIVE_V1_ORIGIN}/archive/v1/:path*` },
    ];
  },
};

export default nextConfig;
