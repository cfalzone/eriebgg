/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: "export",
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
