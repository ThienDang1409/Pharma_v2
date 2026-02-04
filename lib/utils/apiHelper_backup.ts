/**
 * API Helper Functions
 * Centralized error handling, validation, and toast integration
 */

import { z, ZodError } from 'zod';
import type { PaginationResult, ApiResponse } from '../types';
import type { ToastType } from '@/app/context/ToastContext';
import { extractErrorMessage } from './error-handler';

// ==================== FORM VALIDATION HELPERS ====================

/**
 * Convert Zod validation errors to field-level errors object
 * Used for displaying inline errors under form fields
 * 
 * @example
 * try {
 *   schema.parse(data);
 * } catch (error) {
 *   const fieldErrors = getZodErrors(error);
 *   setFieldErrors(fieldErrors);
 *   // fieldErrors: { email: "Invalid email", password: "Min 6 chars" }
 * }
 */
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

/**
 * Check if error is a Zod validation error
 */
export function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

/**
 * Check if data is PaginationResult
 * Used in components that need runtime type checking
 */
export function isPaginationResult<T>(data: any): data is PaginationResult<T> {
  return (
    data &&
    typeof data === 'object' &&
    'items' in data &&
    Array.isArray(data.items) &&
    'totalPages' in data &&
    'currentPage' in data &&
    'total' in data
  );
}

/**
 * Toast Callback Type
 * Can be either a function or ToastContext object
 */
export type ToastCallback = 
  | ((type: ToastType, message: string, duration?: number) => void)
  | { addToast: (type: ToastType, message: string, duration?: number) => void };

/**
 * Helper to normalize toast callback
 * Accepts both function and context object
 */
function normalizeToast(toast: ToastCallback): (type: ToastType, message: string, duration?: number) => void {
  if (typeof toast === 'function') {
    return toast;
  }
  return toast.addToast;
}


/**
 * Validate data with Zod schema
 * Throws with user-friendly Vietnamese messages
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  fieldName: string = 'Dữ liệu'
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      throw new Error(firstError.message || `${fieldName} không hợp lệ`);
    }
    throw error;
  }
}

/**
 * Safe validate - returns result instead of throwing
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: 'Dữ liệu không hợp lệ' };
  }
}

/**
 * Wrapper for API calls with automatic error handling and toast
 * Use this in components/pages to eliminate try-catch blocks
 */
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
    successMessage,
    errorMessage,
    showSuccessToast = false,
    showErrorToast = true,
    onSuccess,
    onError,
  } = options || {};

  try {
    const data = await apiFunction();
    
    // Show success toast if requested
    if (showSuccessToast && successMessage && toast) {
      const toastFn = normalizeToast(toast);
      toastFn('success', successMessage);
    }
    
    // Call success callback
    if (onSuccess) {
      onSuccess(data);
    }
    
    return { success: true, data };
  } catch (error) {
    const message = errorMessage || extractErrorMessage(error);
    
    // Show error toast
    if (showErrorToast && toast) {
      const toastFn = normalizeToast(toast);
      toastFn('error', message);
    }
    
    // Call error callback
    if (onError) {
      onError(message);
    }
    
    return { success: false, error: message };
  }
}

/**
 * Validate and call API in one step
 * Validates form data before making API call
 */
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
  const { toast, showErrorToast = true } = options || {};

  // Validate data first
  const validation = safeValidate(schema, data);
  if (!validation.success) {
    if (showErrorToast && toast) {
      const toastFn = normalizeToast(toast);
      toastFn('error', validation.error);
    }
    return { success: false, error: validation.error };
  }

  // Call API with validated data
  return apiCall(() => apiFunction(validation.data), options);
}

/**
 * Helper to handle form submission with validation
 * Common pattern for admin forms
 */
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

/**
 * Silent API call - for fetch/get operations
 * Only logs errors to console, no toast notifications
 * Use for data fetching that shouldn't interrupt user
 */
export async function silentApiCall<T>(
  apiFunction: () => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    logErrors?: boolean;
  }
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  const { onSuccess, onError, logErrors = true } = options || {};

  try {
    const data = await apiFunction();
    
    if (onSuccess) {
      onSuccess(data);
    }
    
    return { success: true, data };
  } catch (error) {
    const message = extractErrorMessage(error);
    
    // Only console.error, no toast
    if (logErrors) {
      console.error('[API Error]', message, error);
    }
    
    if (onError) {
      onError(message);
    }
    
    return { success: false, error: message };
  }
}

/**
 * Fetch with response validation
 * Silent operation with optional Zod validation of response
 * Use for GET requests that need type safety
 */
export async function fetchWithValidation<T>(
  apiFunction: () => Promise<any>,
  schema?: z.ZodSchema<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    logErrors?: boolean;
  }
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  const { onSuccess, onError, logErrors = true } = options || {};

  try {
    const response = await apiFunction();
    
    // Extract data from API response structure
    const rawData = response?.data || response;
    
    // Validate if schema provided
    let validatedData: T;
    if (schema) {
      const validation = safeValidate(schema, rawData);
      if (!validation.success) {
        throw new Error(`Response validation failed: ${validation.error}`);
      }
      validatedData = validation.data;
    } else {
      validatedData = rawData as T;
    }
    
    if (onSuccess) {
      onSuccess(validatedData);
    }
    
    return { success: true, data: validatedData };
  } catch (error) {
    const message = extractErrorMessage(error);
    
    if (logErrors) {
      console.error('[Fetch Error]', message, error);
    }
    
    if (onError) {
      onError(message);
    }
    
    return { success: false, error: message };
  }
}
