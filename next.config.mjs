/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['spoonacular.com', 'images.spoonacular.com'],
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    USE_FALLBACK_AI: process.env.USE_FALLBACK_AI || 'false',
  },
};

export default nextConfig;

