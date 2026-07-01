import type { NextConfig } from "next";

const projectRoot = process.cwd();

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.mywillbuddy.com" }],
        destination: "https://mywillbuddy.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
