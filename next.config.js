/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  images: {
    domains: ['raw.githubusercontent.com', 'avatars.githubusercontent.com']
  }
};

export default nextConfig;
