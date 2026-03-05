/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bỏ qua lint + type check khi build (đã check lúc dev, tăng tốc build trên EC2)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Whitelist domains cho next/image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/auth', destination: '/auth/signin', permanent: false },
      { source: '/user', destination: '/user/home', permanent: false },
      { source: '/', destination: '/user/home', permanent: false },
    ];
  },
  i18n: {
    locales: ['en', 'cn'],
    defaultLocale: 'en',
  },
};

module.exports = nextConfig;
