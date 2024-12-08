/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // destination: "http://121.133.17.22:8089/:path*",
        destination: "http://hdc-attendance.click:8089/:path*",
      },
    ];
  },
  images: {
    domains: [
      'hdcl-csp-stg.s3.ap-northeast-2.amazonaws.com'
    ]
  }
};

export default nextConfig;
