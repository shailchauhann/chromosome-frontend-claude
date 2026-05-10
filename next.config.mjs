/**
 * Build configuration.
 *
 * Two build modes:
 *   - default       — full Next.js server build (dev + Vercel-style hosting)
 *   - static export — `output: 'export'` for S3 + CloudFront deployment.
 *                     Triggered by `NEXT_BUILD_TARGET=s3` (set by
 *                     `npm run build:s3`). next/image is downgraded to
 *                     unoptimized in this mode because S3 has no image
 *                     optimization service.
 *
 * The `/api/contact` route is intentionally absent — for the S3 target the
 * contact handler lives as a standalone AWS Lambda under `lambda/contact/`.
 */

const isS3Target = process.env.NEXT_BUILD_TARGET === 's3';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(isS3Target
    ? {
        output: 'export',
        images: { unoptimized: true },
        // Trailing slashes make S3 + CloudFront default-root behaviour
        // play nicely with directory-style URLs (/work/foo/ → /work/foo/index.html).
        trailingSlash: true,
      }
    : {
        images: {
          formats: ['image/avif', 'image/webp'],
          remotePatterns: [],
        },
      }),
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

export default nextConfig;
