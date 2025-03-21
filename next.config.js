/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Next.js 14では appDir はもう experimental ではありません
};

module.exports = nextConfig;