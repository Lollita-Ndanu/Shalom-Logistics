import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "thumb.wikimedia.org" },
      { protocol: "https", hostname: "shalom-movers-media.s3.eu-north-1.amazonaws.com" },
    ],
  },
};

export default nextConfig;
