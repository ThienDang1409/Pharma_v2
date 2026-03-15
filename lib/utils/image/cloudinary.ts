/**
 * Cloudinary Image Optimization Utilities
 * Provides responsive image URLs with transformations
 */

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'thumb';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  dpr?: number | 'auto';
  fetchFormat?: 'auto';
}

/**
 * Transform Cloudinary URL with optimizations
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  options: ImageTransformOptions = {}
): string {
  if (!url) return '';
  
  // If not a Cloudinary URL, return as is
  if (!url.includes('cloudinary.com') && !url.includes('res.cloudinary.com')) {
    return url;
  }
  
  // Default optimizations
  const defaults: ImageTransformOptions = {
    quality: 'auto',
    format: 'auto',
    fetchFormat: 'auto',
  };
  
  const transforms = { ...defaults, ...options };
  
  // Split URL at /upload/
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  
  // Build transformation string
  const transformParts: string[] = [];
  
  if (transforms.width) transformParts.push(`w_${transforms.width}`);
  if (transforms.height) transformParts.push(`h_${transforms.height}`);
  if (transforms.quality) transformParts.push(`q_${transforms.quality}`);
  if (transforms.format) transformParts.push(`f_${transforms.format}`);
  if (transforms.crop) transformParts.push(`c_${transforms.crop}`);
  if (transforms.gravity) transformParts.push(`g_${transforms.gravity}`);
  if (transforms.dpr) transformParts.push(`dpr_${transforms.dpr}`);
  if (transforms.fetchFormat) transformParts.push(`f_${transforms.fetchFormat}`);
  
  // If no transformations, return original
  if (transformParts.length === 0) return url;
  
  // Construct optimized URL
  return `${parts[0]}/upload/${transformParts.join(',')}/${parts[1]}`;
}

/**
 * Preset transformation configurations
 */
export const imagePresets = {
  // Thumbnails
  thumbnail: (options?: Partial<ImageTransformOptions>): ImageTransformOptions => ({
    width: 150,
    height: 150,
    crop: 'fill',
    gravity: 'auto',
    quality: 80,
    format: 'auto',
    ...options,
  }),
  
  // Small card images
  cardSmall: (options?: Partial<ImageTransformOptions>): ImageTransformOptions => ({
    width: 300,
    height: 200,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
    ...options,
  }),
  
  // Medium card images
  cardMedium: (options?: Partial<ImageTransformOptions>): ImageTransformOptions => ({
    width: 500,
    height: 350,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
    ...options,
  }),
  
  // Large card/featured images
  cardLarge: (options?: Partial<ImageTransformOptions>): ImageTransformOptions => ({
    width: 800,
    height: 500,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
    ...options,
  }),
  
  // Hero/Banner images
  hero: (options?: Partial<ImageTransformOptions>): ImageTransformOptions => ({
    width: 1920,
    height: 800,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
    ...options,
  }),
  
  // Product images (maintain aspect ratio)
  product: (options?: Partial<ImageTransformOptions>): ImageTransformOptions => ({
    width: 600,
    crop: 'fit',
    quality: 'auto',
    format: 'auto',
    ...options,
  }),
  
  // Avatar/Profile images
  avatar: (options?: Partial<ImageTransformOptions>): ImageTransformOptions => ({
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'face',
    quality: 80,
    format: 'auto',
    ...options,
  }),
  
  // Gallery/lightbox images
  gallery: (options?: Partial<ImageTransformOptions>): ImageTransformOptions => ({
    width: 1200,
    quality: 'auto',
    format: 'auto',
    ...options,
  }),
  
  // Background images
  background: (options?: Partial<ImageTransformOptions>): ImageTransformOptions => ({
    width: 1920,
    quality: 70,
    format: 'auto',
    ...options,
  }),
};

/**
 * Get responsive srcSet for image
 */
export function getResponsiveSrcSet(
  url: string | undefined | null,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536, 1920]
): string {
  if (!url) return '';
  
  return widths
    .map((width) => {
      const optimizedUrl = getOptimizedImageUrl(url, { width, quality: 'auto', format: 'auto' });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function getResponsiveSizes(breakpoints?: Record<string, string>): string {
  const defaultBreakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  };
  
  const bp = breakpoints || defaultBreakpoints;
  
  return `(max-width: ${bp.sm}) 100vw, (max-width: ${bp.md}) 50vw, (max-width: ${bp.lg}) 33vw, 25vw`;
}

/**
 * OptimizedImage component props helper
 */
export interface OptimizedImageProps {
  src: string | undefined | null;
  alt: string;
  preset?: keyof typeof imagePresets;
  transformation?: ImageTransformOptions;
  responsive?: boolean;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Get props for optimized image
 */
export function getOptimizedImageProps(props: OptimizedImageProps) {
  const { src, preset, transformation, responsive = true } = props;
  
  if (!src) {
    return { src: '', srcSet: '', sizes: '' };
  }
  
  // Get transformation options
  let transformOptions: ImageTransformOptions = {};
  
  if (preset && imagePresets[preset]) {
    transformOptions = imagePresets[preset]();
  }
  
  if (transformation) {
    transformOptions = { ...transformOptions, ...transformation };
  }
  
  // Generate URLs
  const optimizedSrc = getOptimizedImageUrl(src, transformOptions);
  const srcSet = responsive ? getResponsiveSrcSet(src) : '';
  const sizes = responsive ? getResponsiveSizes() : '';
  
  return {
    src: optimizedSrc,
    srcSet,
    sizes,
  };
}

/**
 * Check if URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
}

/**
 * Extract Cloudinary public ID from URL
 */
export function extractPublicId(url: string): string | null {
  if (!isCloudinaryUrl(url)) return null;
  
  const parts = url.split('/upload/');
  if (parts.length !== 2) return null;
  
  // Remove transformations if present
  const pathParts = parts[1].split('/');
  const fileName = pathParts[pathParts.length - 1];
  
  // Remove file extension
  return fileName.split('.')[0];
}

/**
 * Blur placeholder for lazy loading
 */
export function getBlurDataUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  return getOptimizedImageUrl(url, {
    width: 10,
    quality: 10,
    format: 'auto',
  });
}
