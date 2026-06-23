import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/',          // Khi người dùng vào đường dẫn này
        destination: '/assets', // Sẽ bị tự động chuyển sang đây
        permanent: true,     // true nếu bạn muốn chuyển hướng vĩnh viễn (SEO 301)
      },
    ];
  },
};

export default nextConfig;
