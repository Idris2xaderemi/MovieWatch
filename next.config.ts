/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // for Google avatars
    ],
    domains: ['localhost'],
  },
  serverExternalPackages: ['mongoose', 'mongodb', 'bson'],
};

module.exports = nextConfig;