import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

async function setupDevelopmentEnvironment() {
  if (process.env.NODE_ENV === 'development') {
    await setupDevPlatform();
  }
}

setupDevelopmentEnvironment();

export default nextConfig;
