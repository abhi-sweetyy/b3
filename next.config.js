/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  serverExternalPackages: ['googleapis'],
  devIndicators: false
}

module.exports = nextConfig
