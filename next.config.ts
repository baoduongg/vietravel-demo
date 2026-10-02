import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "s3-cmc.travel.com.vn" }],
  },
}

export default nextConfig
