import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "paultan.org",
        port: "",
        pathname:
          "/image/2023/07/klang-valley-integrated-transit-map-1260x1817.jpg",
        search: "",
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
