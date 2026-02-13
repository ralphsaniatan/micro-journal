import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const remotePatterns = [];

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    const hostname = new URL(supabaseUrl).hostname;
    remotePatterns.push({
      protocol: 'https' as const,
      hostname,
    });
  }
} catch (e) {
  // Ignore invalid URL in environment variable
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default withPWA(nextConfig);
