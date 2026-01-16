/** @type {import('next').NextConfig} */
const nextConfig = {
  // Improve file watching and CSS hot reloading in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Better file watching for CSS changes
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
};

export default nextConfig;
