import type { ImagePreview } from "@/lib/types";
import { isImagePreview } from "@/lib/utils/handler/type-guards";

export type ImageSource = string | ImagePreview | null | undefined;

export function extractImageUrl(image: ImageSource): string {
  if (!image) return "";
  if (typeof image === "string") return image;
  if (isImagePreview(image)) return image.cloudinaryUrl;
  return "";
}

export function withFallbackImage(image: ImageSource, fallback: string): string {
  const url = extractImageUrl(image);
  return url || fallback;
}
