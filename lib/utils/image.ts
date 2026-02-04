import { ImagePreview } from "../types";

/**
 * Get image URL with optional Cloudinary transformations
 * Handles both ImagePreview objects and string URLs
 * 
 * @param image - ImagePreview object or URL string
 * @param transformation - Optional Cloudinary transformation parameters
 * @returns Transformed or extracted image URL
 * 
 * @example
 * // Extract URL from object
 * getImageUrl(imageObject)
 * 
 * // Apply transformations
 * getImageUrl(url, { width: 300, height: 200, quality: 80 })
 */
export function getImageUrl(
  image?: string | ImagePreview,
  transformation?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  }
): string {
  if (!image) return "";

  // Extract URL from ImagePreview object or use string directly
  let url: string;
  if (typeof image === "string") {
    url = image;
  } else {
    url = image.cloudinaryUrl || "";
  }

  if (!url) return "";

  // Apply Cloudinary transformations if provided
  if (transformation && url.includes("cloudinary.com")) {
    const parts = url.split("/upload/");
    if (parts.length === 2) {
      const transforms: string[] = [];

      if (transformation.width) transforms.push(`w_${transformation.width}`);
      if (transformation.height) transforms.push(`h_${transformation.height}`);
      if (transformation.quality) transforms.push(`q_${transformation.quality}`);
      if (transformation.format) transforms.push(`f_${transformation.format}`);

      if (transforms.length > 0) {
        return `${parts[0]}/upload/${transforms.join(",")}/${parts[1]}`;
      }
    }
  }

  return url;
}
