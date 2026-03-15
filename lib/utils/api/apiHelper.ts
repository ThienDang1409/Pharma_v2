/**
 * Simplified API Helper
 * Three core patterns for common use cases
 *
 * Pattern 1: apiSubmit() - Form submission with validation
 * Pattern 2: apiFetch() - Silent data fetching
 * Pattern 3: apiMultiple() - Batch operations
 * 
 * ⚠️ MESSAGE HANDLING STRATEGY:
 * - Frontend ONLY uses HTTP status code to decide message
 * - Backend message is for logging/debugging only
 * - Frontend message is UX-optimized and unchanging
 * - Never show backend message directly in toast
 */

import { z } from 'zod';
import type { ToastType } from '@/app/context/ToastContext';
import { errorMessages, parseApiError } from '../handler/error-handler';
import { ApiResponse } from '../../types';

// ==================== STATUS CODE → MESSAGE MAPPING ====================

const SUCCESS_STATUS_MESSAGES: Record<number, string> = {
  200: 'Thao tác thành công!',
  201: 'Tạo thành công!',
  204: 'Thao tác thành công!',
};

/**
 * Get FE-defined message based on HTTP status code
 */
function getMessageByStatusCode(statusCode: number): { type: ToastType; message: string } {
  if (SUCCESS_STATUS_MESSAGES[statusCode]) {
    return {
      type: 'success',
      message: SUCCESS_STATUS_MESSAGES[statusCode],
    };
  }

  if (statusCode === 409) {
    return {
      type: 'warning',
      message: errorMessages[409].vi,
    };
  }

  const statusEntry = errorMessages[statusCode as keyof typeof errorMessages];

  if (statusEntry && typeof statusEntry === 'object' && 'vi' in statusEntry) {
    return {
      type: 'error',
      message: statusEntry.vi,
    };
  }

  if (statusCode === 0) {
    return {
      type: 'error',
      message: errorMessages.network.vi,
    };
  }

  return {
    type: 'error',
    message: errorMessages.unknown.vi,
  };
}

/**
 * Resolve error details through centralized parser to avoid axios/app-error mismatch.
 */
function resolveApiError(error: unknown): {
  status: number;
  type: ToastType;
  message: string;
} {
  const parsedError = parseApiError(error);
  const status = parsedError.statusCode || 500;
  const statusMessage = getMessageByStatusCode(status);

  if (parsedError.message) {
    console.debug(`[API] Status ${status}:`, parsedError.message);
  }

  return {
    status,
    type: statusMessage.type,
    message: statusMessage.message,
  };
}

/**
 * Public helper for places that still call APIs directly (without apiFetch/apiSubmit).
 */
export function getApiErrorFeedback(error: unknown): {
  status: number;
  type: ToastType;
  message: string;
} {
  return resolveApiError(error);
}

// ==================== TYPES ====================

export type ToastCallback =
  | ((type: ToastType, message: string, duration?: number) => void)
  | { addToast: (type: ToastType, message: string, duration?: number) => void };

/**
 * Normalize toast callback - accept both function and context object
 */
function normalizeToast(toast: ToastCallback): (type: ToastType, message: string, duration?: number) => void {
  if (typeof toast === 'function') {
    return toast;
  }
  return toast.addToast;
}

// ==================== PATTERN 1: FORM SUBMISSION ====================

/**
 * apiSubmit - Validate data, call API, show toast
 *
 * @example
 * ```tsx
 * const result = await apiSubmit(UpdateProfileSchema, formData,
 *   () => updateProfile(formData),
 *   { toast: addToast, onSuccess: () => setIsEditing(false) }
 * );
 * if (result.success) { // do something }
 * ```
 *
 * @param schema - Zod schema for validation
 * @param data - Data to validate
 * @param apiFunction - Function that calls the API with validated data
 * @param options - Configuration
 * @returns Result object with success flag and data/error
 */
export async function apiSubmit<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  data: unknown,
  apiFunction: (validatedData: TInput) => Promise<TOutput>,
  options?: {
    toast?: ToastCallback;
    onSuccess?: (data: TOutput) => void;
    onError?: (error: string) => void;
    successMsg?: string;
  }
): Promise<{ success: true; data: TOutput } | { success: false; error: string }> {
  const { toast, onSuccess, onError, successMsg } = options || {};

  try {
    // 1. Validate input with Zod (Frontend validation)
    const validation = schema.safeParse(data);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      const msg = firstError.message;

      // Show validation error (FE-defined message, not from backend)
      if (toast) {
        normalizeToast(toast)('error', msg);
      }
      onError?.(msg);
      return { success: false, error: msg };
    }

    // 2. Call API with validated data
    const result = await apiFunction(validation.data);

    // 3. Show success toast with FE-defined message
    if (toast) {
      const message = successMsg || 'Thao tác thành công!';
      normalizeToast(toast)('success', message);
    }

    onSuccess?.(result);
    return { success: true, data: result };
  } catch (error) {
    // 4. Handle API error based on status code, not backend message
    const { status, type, message } = resolveApiError(error);
    
    // Log full error for debugging
    console.error(`[API Error] Status ${status}:`, error);

    if (toast) {
      normalizeToast(toast)(type, message);
    }
    onError?.(message);

    return { success: false, error: message };
  }
}

// ==================== PATTERN 2: SILENT DATA FETCH ====================

/**
 * apiFetch - Fetch data without toast notifications
 * 
 * Use for GET requests that shouldn't interrupt user experience
 * Only logs errors to console
 *
 * @example
 * ```tsx
 * const categories = await apiFetch(
 *   () => informationApi.getAll(),
 *   { onSuccess: setCategories }
 * );
 * ```
 *
 * @param apiFunction - Function that calls the API
 * @param options - Configuration
 * @returns Data on success, null on error
 */
export async function apiFetch<T>(
  apiFunction: () => Promise<ApiResponse<T>>,
  options?: {
    onSuccess?: (data: T | undefined) => void;
    onError?: (error: string) => void;
    toast?: ToastCallback;
    logErrors?: boolean;
  }
): Promise<T | null> {
  const { onSuccess, onError, toast, logErrors = true } = options || {};

  try {
    // Call API - http.ts already extracts .data from response
    const data = await apiFunction();
    onSuccess?.(data.data);
    return data.data ?? null;
  } catch (error) {
    // Handle error based on status code, not backend message
    const { status, type, message } = resolveApiError(error);

    // Log error details for debugging
    if (logErrors) {
      console.error(`[Fetch Error] Status ${status}:`, error);
    }

    // Show toast if provided
    if (toast) {
      normalizeToast(toast)(type, message);
    }

    onError?.(message);
    return null;
  }
}

// ==================== PATTERN 3: BATCH OPERATIONS ====================

/**
 * apiMultiple - Execute multiple API calls in sequence
 *
 * @example
 * ```tsx
 * const { results, hasErrors } = await apiMultiple(
 *   [
 *     () => api.update(data1),
 *     () => api.update(data2),
 *   ],
 *   { toast, stopOnError: true }
 * );
 * ```
 *
 * @param operations - Array of API functions to execute
 * @param options - Configuration
 * @returns Results array and error flag
 */
export async function apiMultiple<T>(
  operations: Array<() => Promise<T>>,
  options?: {
    toast?: ToastCallback;
    stopOnError?: boolean;
    onAllSuccess?: () => void;
    onAnyError?: (error: string, index: number) => void;
  }
): Promise<{ results: (T | null)[]; hasErrors: boolean }> {
  const { toast, stopOnError = false, onAllSuccess, onAnyError } = options || {};
  const results: (T | null)[] = [];
  let hasErrors = false;

  for (let i = 0; i < operations.length; i++) {
    try {
      const result = await operations[i]();
      results.push(result);
    } catch (error) {
      hasErrors = true;
      const { status, type, message } = resolveApiError(error);

      // Log error for debugging
      console.error(`[Batch Operation ${i}] Status ${status}:`, error);

      if (toast) {
        normalizeToast(toast)(type, message);
      }

      onAnyError?.(message, i);
      results.push(null);

      if (stopOnError) break;
    }
  }

  if (!hasErrors && onAllSuccess) {
    onAllSuccess();
  }

  return { results, hasErrors };
}
