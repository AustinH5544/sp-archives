"use client";

// next/image loader backed by Cloudflare Images transformations.
//
// App Router requires "use client" here: the loader is a function passed
// through to client components, so it has to be serialisable as client code.
//
// Three source kinds arrive here and only two get transformed:
//
//   1. R2 masters on img.sp-archives.com  -> transformed
//   2. Local files under /work, /icon...  -> transformed (same zone)
//   3. picsum.photos placeholders          -> passed through untouched,
//      because the zone is configured "This zone only" and Cloudflare will
//      refuse a source it does not own.
//
// Transformations only exist on the deployed zone, so dev passes everything
// through as well. Without that, `next dev` would render /cdn-cgi/image
// URLs against localhost and every image would 404.

const PHOTOS = "https://img.sp-archives.com";
const SITE = "https://sp-archives.com";

/**
 * quality=85 is a floor, not a default worth tuning down.
 *
 * Skyelar's edits carry film grain. Grain is the first thing a lossy encoder
 * discards, and measured side by side at 1:1, q95 and q85 are near identical
 * while q78 visibly smooths skin texture and flattens fabric. Dropping below
 * 85 does not just compress the photograph, it removes something he put
 * there on purpose. Raise it if anything, never lower it.
 */
const DEFAULT_QUALITY = 85;

export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Placeholders live on someone else's origin; the zone would reject them.
  if (src.includes("picsum.photos")) return src;

  // No transformation layer on localhost.
  if (process.env.NODE_ENV !== "production") return src;

  const opts = `width=${width},format=auto,quality=${quality ?? DEFAULT_QUALITY}`;

  // R2 photograph. Use the relative source form so the URL carries the key
  // once rather than repeating the whole origin inside itself.
  if (src.startsWith(PHOTOS)) {
    const key = src.slice(PHOTOS.length).replace(/^\//, "");
    return `${PHOTOS}/cdn-cgi/image/${opts}/${key}`;
  }

  // Local asset served by the Worker, same zone, so it can be transformed.
  if (src.startsWith("/")) {
    return `${SITE}/cdn-cgi/image/${opts}${src}`;
  }

  return src;
}
