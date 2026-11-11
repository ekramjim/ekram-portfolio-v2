/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next's dev badge sits in the bottom-left corner, on top of the hero's scroll cue; the live site never shows it.
  devIndicators: false,
  // Shepherd's update feed moved to its own site (2026-11-05). Copies of Shepherd up to 0.13.0 still ask for it here,
  // so send them there: Sparkle follows the redirect, and the feed's newest item updates them to a build that asks
  // sphrd.dev directly. Keep this while anyone might still run 0.13.0 or earlier.
  async redirects() {
    return [
      {
        source: "/shepherd/appcast.xml",
        destination: "https://sphrd.dev/appcast.xml",
        permanent: true,
      },
    ];
  },
  // Walleta's App Store support and privacy pages are plain HTML in public/walleta. Next doesn't serve a folder's
  // index.html by itself, so map the clean URLs onto the files.
  async rewrites() {
    return [
      { source: "/walleta", destination: "/walleta/index.html" },
      { source: "/walleta/privacy", destination: "/walleta/privacy.html" },
    ];
  },
};

// /archive/v1 is proxied to the archived v1 site by src/middleware.ts.
export default nextConfig;
