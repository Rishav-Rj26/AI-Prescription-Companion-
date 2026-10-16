import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows isolated CI or local verification builds without touching a running dev cache.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
