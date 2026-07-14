"use client";

import Image, { type ImageProps } from "next/image";
import { publicImageSources } from "@/lib/publicImagePath";

type OptimizedPublicImageProps = Omit<ImageProps, "src"> & {
  /** Path under /public, e.g. /crystals/photos/amethyst.png */
  src: string;
  /** When true, try .webp first via onError fallback to PNG */
  preferWebp?: boolean;
};

/**
 * PERFORMANCE ARCHITECTURE — Lazy public folder images with optional WebP preference.
 */
export function OptimizedPublicImage({
  src,
  preferWebp = true,
  alt,
  loading = "lazy",
  ...rest
}: OptimizedPublicImageProps) {
  const { webp, png } = publicImageSources(src);

  if (!preferWebp || !/\.(png|jpe?g)$/i.test(src)) {
    return <Image src={png} alt={alt} loading={loading} {...rest} />;
  }

  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <Image src={png} alt={alt} loading={loading} {...rest} />
    </picture>
  );
}
