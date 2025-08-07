/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This enables the standalone output mode, crucial for smaller Docker images.
  output: 'standalone',
};

module.exports = nextConfig;