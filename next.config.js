/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['aws-s3-tuts.s3.us-east-2.amazonaws.com']
  }
}

module.exports = nextConfig
