/**
 * Simplified API Helper
 * Three core patterns for common use cases
 *
 * Pattern 1: apiSubmit() - Form submission with validation
 * Pattern 2: apiFetch() - Silent data fetching
 * Pattern 3: apiMultiple() - Batch operations
 */

import { z, ZodError } from 'zod';
import type { ToastType } from '@/app/context/ToastContext';
import { extractErrorMessage } from './error-handler';
import { ApiResponse } from '../types';

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
    messages?: {
      success?: string;
      error?: string;
    };
  }
): Promise<{ success: true; data: TOutput } | { success: false; error: string }> {
  const { toast, onSuccess, onError, messages } = options || {};

  try {
    // 1. Validate input
    const validation = schema.safeParse(data);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      const errorMsg = firstError.message;

      if (toast) {
        normalizeToast(toast)('error', errorMsg);
      }
      onError?.(errorMsg);
      return { success: false, error: errorMsg };
    }

    // 2. Call API with validated data
    const result = await apiFunction(validation.data);

    // 3. Show success toast if message provided
    if (messages?.success && toast) {
      normalizeToast(toast)('success', messages.success);
    }

    onSuccess?.(result);
    return { success: true, data: result };
  } catch (error) {
    const errorMsg = messages?.error || extractErrorMessage(error);

    if (toast) {
      normalizeToast(toast)('error', errorMsg);
    }
    onError?.(errorMsg);

    return { success: false, error: errorMsg };
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
    onSuccess?: (data?: T) => void;
    onError?: (error: string) => void;
    logErrors?: boolean;
  }
): Promise<T | null> {
  const { onSuccess, onError, logErrors = true } = options || {};

  try {
    // Call API - http.ts already extracts .data from response
    // So apiFunction returns T directly, not wrapped
    const data = await apiFunction();

    onSuccess?.(data.data);
    console.log(data)

    return data.data ?? null;
  } catch (error) {
    const errorMsg = extractErrorMessage(error);

    if (logErrors) {
      console.error('[Fetch Error]', errorMsg, error);
    }

    onError?.(errorMsg);
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
      const errorMsg = extractErrorMessage(error);

      console.error(`[Batch Operation ${i}]`, errorMsg, error);

      if (toast) {
        normalizeToast(toast)('error', errorMsg);
      }

      onAnyError?.(errorMsg, i);
      results.push(null);

      if (stopOnError) break;
    }
  }

  if (!hasErrors && onAllSuccess) {
    onAllSuccess();
  }

  return { results, hasErrors };
}

// ==================== LEGACY EXPORTS (For Backward Compatibility) ====================

// Keep old functions for gradual migration
// These are wrapper around new patterns

export async function validateAndCall<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  data: unknown,
  apiFunction: (validatedData: TInput) => Promise<TOutput>,
  options?: {
    toast?: ToastCallback;
    successMessage?: string;
    errorMessage?: string;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    onSuccess?: (data: TOutput) => void;
    onError?: (error: string) => void;
  }
): Promise<{ success: true; data: TOutput } | { success: false; error: string }> {
  const {
    showSuccessToast = false,
    successMessage,
    errorMessage,
    ...rest
  } = options || {};

  return apiSubmit(schema, data, apiFunction, {
    ...rest,
    messages: {
      success: showSuccessToast ? successMessage : undefined,
      error: errorMessage,
    },
  });
}

export async function apiCall<T>(
  apiFunction: () => Promise<T>,
  options?: {
    toast?: ToastCallback;
    successMessage?: string;
    errorMessage?: string;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  const {
    toast,
    errorMessage,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
    onSuccess,
    onError,
  } = options || {};

  try {
    const data = await apiFunction();

    if (showSuccessToast && successMessage && toast) {
      normalizeToast(toast)('success', successMessage);
    }

    onSuccess?.(data);
    return { success: true, data };
  } catch (error) {
    const message = errorMessage || extractErrorMessage(error);

    if (showErrorToast && toast) {
      normalizeToast(toast)('error', message);
    }

    onError?.(message);
    return { success: false, error: message };
  }
}

export async function silentApiCall<T>(
  apiFunction: () => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    logErrors?: boolean;
  }
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await apiFunction();
    options?.onSuccess?.(data);
    return { success: true, data };
  } catch (error) {
    const message = extractErrorMessage(error);

    if (options?.logErrors !== false) {
      console.error('[API Error]', message, error);
    }

    options?.onError?.(message);
    return { success: false, error: message };
  }
}

export function handleFormSubmit<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  toast: ToastCallback
) {
  return async (
    data: unknown,
    apiFunction: (validatedData: TInput) => Promise<TOutput>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (data: TOutput) => void;
      onError?: (error: string) => void;
    }
  ): Promise<{ success: true; data: TOutput } | { success: false; error: string }> => {
    return validateAndCall(schema, data, apiFunction, {
      toast,
      showSuccessToast: true,
      showErrorToast: true,
      ...options,
    });
  };
}

// Utility functions
export function getZodErrors(error: unknown): Record<string, string> {
  if (error instanceof ZodError) {
    return error.issues.reduce((acc, issue) => {
      const fieldPath = issue.path.join('.');
      acc[fieldPath] = issue.message;
      return acc;
    }, {} as Record<string, string>);
  }
  return {};
}

export function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.issues[0];
  return { success: false, error: firstError.message };
}
