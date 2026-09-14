"use client";

import { getImageProps } from "next/image";

/**
 * Full-bleed series header image, art-directed by screen shape.
 *
 * The header is object-cover at the viewport's own aspect ratio, so a 2:3
 * portrait cover on a 16:9 monitor shows only the middle third of the
 * frame; on red-thread that cut her head off. When a series has a landscape
 * `wideSrc`, landscape screens get that and portrait screens keep the
 * cover. Client component because the custom image loader is one.
 *
 * Eager + high fetch priority instead of `preload`: a preload link can only
 * name one candidate, and would fetch the wrong frame on half of devices.
 */
export default function SeriesCover({
  src,
  wideSrc,
  alt,
}: {
  src: string;
  wideSrc?: string;
  alt: string;
}) {
  const common = {
    alt,
    fill: true,
    sizes: "100vw",
    loading: "eager",
    fetchPriority: "high",
  } as const;
  const { props: tall } = getImageProps({ ...common, src });
  const wide = wideSrc
    ? getImageProps({ ...common, src: wideSrc }).props
    : null;

  return (
    <picture>
      {wide && (
        <source
          media="(min-aspect-ratio: 1/1)"
          srcSet={wide.srcSet}
          sizes={wide.sizes}
        />
      )}
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt is in the spread */}
      <img {...tall} className="object-cover" />
    </picture>
  );
}
