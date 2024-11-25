/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://121.133.17.22:8089/:path*",
      },
    ];
  },
};

export default nextConfig;
