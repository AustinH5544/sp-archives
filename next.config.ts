import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    // A custom loader is the one way to get real srcset out of a static
    // export -- "unoptimized: true" shipped a single file to every device,
    // which capped a full-bleed hero at whatever one size we picked.
    // Documented as supported alongside output: "export".
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    // Fixed ladder. Cloudflare Images bills per *unique* transformation, so
    // viewport-derived widths would mint a new one per visitor; this keeps
    // the whole archive to roughly 163 x 8 well inside the 5,000/month free
    // tier. AVIF is served up to 1200 and WebP above it -- Cloudflare caps
    // AVIF by resolution and will not honour format=avif past that.
    deviceSizes: [480, 640, 800, 1080, 1200, 1600, 2048, 2560],
    imageSizes: [160, 240, 320, 400],
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "img.sp-archives.com" },
    ],
  },
};

export default nextConfig;
