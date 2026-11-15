import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: basePath || undefined,
  devIndicators: false,
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/inventory/:path*",
        destination: "/dashboard/inventory/:path*",
      },
      {
        source: "/master/:path*",
        destination: "/dashboard/master/:path*",
      },
    ];
  },
};

export default nextConfig;
