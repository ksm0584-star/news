import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // 매일경제 RSS의 media:content thumbnail host — a separate
        // subdomain from the article host (www.mk.co.kr). See
        // src/lib/news-rss.ts's NEWS_SOURCES comment for why only this
        // outlet's images are enabled.
        protocol: "https",
        hostname: "pimg.mk.co.kr",
      },
    ],
  },
};

export default nextConfig;
