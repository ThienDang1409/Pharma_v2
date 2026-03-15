import { ApiResponse } from "../../types";

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
export function extractPaginationData<T>(data: unknown): {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} {
  const input = data as unknown;

  // Backend returns: { items, totalPages, currentPage, total }
  if (
    typeof input === "object" &&
    input !== null &&
    "items" in input &&
    Array.isArray((input as { items: unknown }).items)
  ) {
    const paginationData = input as {
      items: T[];
      currentPage?: number;
      total?: number;
      totalPages?: number;
    };

    const total = paginationData.total ?? 0;
    const totalPages = paginationData.totalPages ?? 0;

    return {
      items: paginationData.items,
      pagination: {
        page: paginationData.currentPage || 1,
        limit: totalPages > 0 ? Math.ceil(total / totalPages) || 10 : 10,
        total,
        totalPages,
      },
    };
  }

  // Fallback: return as array
  return {
    items: Array.isArray(input) ? (input as T[]) : [],
    pagination: {
      page: 1,
      limit: 10,
      total: Array.isArray(input) ? input.length : 0,
      totalPages: 1,
    },
  };
}

/**
 * Build query string from params
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  
  return query.toString();
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
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
