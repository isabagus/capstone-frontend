import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
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
