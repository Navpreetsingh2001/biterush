/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Removed TypeScript and ESLint ignores as they are less relevant for JS conversion
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/v1/create-qr-code/**',
      },
    ],
  },
};

module.exports = nextConfig;
