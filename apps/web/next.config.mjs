/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cf.geekdo-images.com",
        port: "",
      },
    ],
  },
  transpilePackages: ["games-data"],
  assetPrefix: "./",
};

export default nextConfig;
