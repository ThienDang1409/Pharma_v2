import { ApiResponse } from "../types";

/**
 * Response Utilities - Handle API response parsing and transformation
 * Extracted data, pagination normalization, image URL helpers
 */

/**
 * Extract data from API response
 */
export function extractData<T>(response: ApiResponse<T>): T | undefined {
  return response.data;
}

/**
 * Check if API response is successful
 */
export function isSuccessResponse(response: ApiResponse): boolean {
  return response.success === true;
}

/**
 * Extract pagination data from backend format
 */
export function extractPaginationData<T>(data: any): {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} {
  // Backend returns: { items, totalPages, currentPage, total }
  if (data.items) {
    return {
      items: data.items,
      pagination: {
        page: data.currentPage || 1,
        limit: Math.ceil(data.total / data.totalPages) || 10,
        total: data.total || 0,
        totalPages: data.totalPages || 0,
      },
    };
  }

  // Fallback: return as array
  return {
    items: Array.isArray(data) ? data : [],
    pagination: {
      page: 1,
      limit: 10,
      total: Array.isArray(data) ? data.length : 0,
      totalPages: 1,
    },
  };
}

/**
 * Build query string from params
 */
export function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  
  return query.toString();
}

/**
 * Get image URL with transformation
 */
export function getImageUrl(
  url: string,
  transformation?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  }
): string {
  if (!url) return '';
  
  // If Cloudinary URL, apply transformations
  if (url.includes('cloudinary.com')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      const transforms: string[] = [];
      
      if (transformation?.width) transforms.push(`w_${transformation.width}`);
      if (transformation?.height) transforms.push(`h_${transformation.height}`);
      if (transformation?.quality) transforms.push(`q_${transformation.quality}`);
      if (transformation?.format) transforms.push(`f_${transformation.format}`);
      
      if (transforms.length > 0) {
        return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`;
      }
    }
  }
  
  return url;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate image file
 */
export function validateImageFile(
  file: File,
  options?: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  }
): { valid: boolean; error?: string } {
  const maxSize = options?.maxSize || 5 * 1024 * 1024; // 5MB default
  const allowedTypes = options?.allowedTypes || [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(maxSize)}`,
    };
  }

  return { valid: true };
}

/**
 * Create image preview URL
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
