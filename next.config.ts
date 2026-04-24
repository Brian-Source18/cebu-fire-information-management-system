import type { NextConfig } from "next";

const FALLBACK_API_URL = "https://firebackend-tsi7.onrender.com";

const nextConfig: NextConfig = {
  turbopack: {},
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_URL,
  },
};

export default nextConfig;
