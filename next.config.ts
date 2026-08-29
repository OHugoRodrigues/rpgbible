import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Os sprites são pixel art servida por <img> de public/; o otimizador do
  // Next reamostraria e borraria a arte, então ele fica fora do caminho.
  images: { unoptimized: true },
};

export default nextConfig;
