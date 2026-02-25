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

// Wrap with Sentry config if Sentry is installed
// This will be automatically used when @sentry/nextjs is installed
// For now, export the base config
let exportedConfig = nextConfig;

try {
  // Attempt to use Sentry wrapper if installed
  const { withSentryConfig } = require('@sentry/nextjs');
  exportedConfig = withSentryConfig(
    nextConfig,
    {
      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options

      // Suppresses source map uploading logs during build
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    },
    {
      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Transpiles SDK to be compatible with IE11 (increases bundle size)
      transpileClientSDK: false,

      // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
      tunnelRoute: "/monitoring",

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,
    }
  );
} catch (e) {
  // Sentry not installed yet, use base config
  console.log('Sentry not installed - using base Next.js config');
}

module.exports = exportedConfig;
