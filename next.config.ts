import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      { protocol: 'https',
         hostname: 'res.cloudinary.com' }
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    imgOptTimeoutInSeconds: 30,
  },
};

export default nextConfig;