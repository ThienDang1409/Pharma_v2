/**
 * Optimized Image Component
 * Automatically applies Cloudinary transformations and responsive loading
 */

'use client';

import React from 'react';
import { getOptimizedImageUrl, imagePresets, ImageTransformOptions } from '@/lib/utils/cloudinary';

export interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | undefined | null;
  alt: string;
  preset?: keyof typeof imagePresets;
  transformation?: ImageTransformOptions;
  fallback?: React.ReactNode;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  preset,
  transformation,
  fallback,
  onError,
  loading = 'lazy',
  className = '',
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = React.useState(false);

  // Handle missing src
  if (!src || hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}>
        <svg
          className="w-12 h-12 text-gray-400 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  // Get transformation options
  let transformOptions: ImageTransformOptions = {};
  
  if (preset) {
    transformOptions = imagePresets[preset]();
  }
  
  if (transformation) {
    transformOptions = { ...transformOptions, ...transformation };
  }

  // Generate optimized URL
  const optimizedSrc = getOptimizedImageUrl(src, transformOptions);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      loading={loading}
      onError={handleError}
      className={className}
      {...props}
    />
  );
}
