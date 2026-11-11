/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  outputFileTracingIncludes: {
    "/api/recommendations": ["./data/embeddings/listings-multilingual-e5-small-384.json"],
  },
}

export default nextConfig
