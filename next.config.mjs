/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

// /archive/v1 is proxied to the archived v1 site by src/middleware.ts.
export default nextConfig;
