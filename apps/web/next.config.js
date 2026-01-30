/** @type {import('next').NextConfig} */

// Validate required environment variables in production
const isProduction = process.env.NODE_ENV === 'production';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (isProduction && !apiUrl) {
  console.warn(
    '\x1b[33m%s\x1b[0m',
    'WARNING: NEXT_PUBLIC_API_URL is not set. Using default production URL.'
  );
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.gospellibrary.org',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: apiUrl || (isProduction
      ? 'https://api.bomstudytools.org/graphql'
      : 'http://localhost:4000/graphql'),
  },
};

module.exports = nextConfig;
