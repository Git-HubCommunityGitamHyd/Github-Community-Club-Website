/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The redesign was previewed at /v2 before it replaced the homepage. Links
  // to it were shared, so they land on / instead of a 404.
  async redirects() {
    return [{ source: "/v2", destination: "/", permanent: true }]
  },
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    minimumCacheTTL: 3600, // Cache for 1 hour instead of 1 minute
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
    qualities: [75, 95],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      // Seed and placeholder imagery only. Real content goes to Cloudinary
      // through the signed-upload flow; this is here so a freshly seeded
      // local database renders instead of 400ing on every image.
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },
}

module.exports = nextConfig

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev())
