import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**": ["./prisma/dev.db", "./dev.db"],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  },
};

export default nextConfig;
