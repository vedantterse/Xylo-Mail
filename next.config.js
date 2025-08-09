/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ico|png|jpg|jpeg|gif)$/i,
      type: 'asset/resource',
    })
    return config
  },
};

module.exports = nextConfig;