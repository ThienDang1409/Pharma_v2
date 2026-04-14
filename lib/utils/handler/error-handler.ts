/**
 * Centralized Error Handler
 * Handle API errors và format error messages
 */

import type { AxiosError } from 'axios';

export type ErrorLanguage = 'vi' | 'en';

// ==================== ERROR MESSAGE CONSTANTS ====================

export const errorMessages = {
  // HTTP Status Codes
  400: {
    vi: 'Yêu cầu không hợp lệ',
    en: 'Bad request',
  },
  401: {
    vi: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',
    en: 'Session expired. Please login again',
  },
  403: {
    vi: 'Bạn không có quyền thực hiện thao tác này',
    en: 'You do not have permission to perform this action',
  },
  404: {
    vi: 'Không tìm thấy tài nguyên',
    en: 'Resource not found',
  },
  409: {
    vi: 'Dữ liệu bị trùng lặp',
    en: 'Data conflict - duplicate entry',
  },
  422: {
    vi: 'Dữ liệu không hợp lệ',
    en: 'Validation failed',
  },
  500: {
    vi: 'Lỗi máy chủ. Vui lòng thử lại sau',
    en: 'Server error. Please try again later',
  },
  502: {
    vi: 'Lỗi kết nối máy chủ',
    en: 'Bad gateway',
  },
  503: {
    vi: 'Dịch vụ tạm thời không khả dụng',
    en: 'Service temporarily unavailable',
  },
  504: {
    vi: 'Hết thời gian chờ kết nối',
    en: 'Gateway timeout',
  },
  // Network Errors
  network: {
    vi: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet',
    en: 'Network error. Please check your internet connection',
  },
  timeout: {
    vi: 'Hết thời gian chờ. Vui lòng thử lại',
    en: 'Request timeout. Please try again',
  },
  // Generic Errors
  unknown: {
    vi: 'Có lỗi xảy ra. Vui lòng thử lại',
    en: 'An error occurred. Please try again',
  },
};

// ==================== ERROR TYPES ====================

export interface ApiError {
  status?: number;
  message: string;
  errors?: Record<string, string>; // Validation errors
  code?: string;
}

export type ErrorCategory = 'auth' | 'permission' | 'validation' | 'notfound' | 'conflict' | 'network' | 'timeout' | 'server' | 'business' | 'unknown';

export type ErrorType = 'retryable' | 'non-retryable' | 'business' | 'system';

export interface FormattedError {
  message: string;
  validationErrors?: Record<string, string>;
  status?: number;
  code?: string;
  // Classification fields
  category?: ErrorCategory;
  type?: ErrorType;
  isAuthError?: boolean;
  isPermissionError?: boolean;
  isValidationError?: boolean;
  isRetryable?: boolean;
  isBusinessError?: boolean;
}

interface ErrorLike {
  response?: {
    status?: number;
    data?: unknown;
    headers?: unknown;
  };
  request?: unknown;
  message?: string;
  code?: string;
  config?: unknown;
}

interface ErrorResponseData {
  message?: string;
  error?: string;
  errors?: Record<string, string> | string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toErrorLike(error: unknown): ErrorLike {
  if (!isRecord(error)) {
    return {};
  }

  return {
    response: isRecord(error.response)
      ? {
          status: typeof error.response.status === 'number' ? error.response.status : undefined,
          data: error.response.data,
          headers: error.response.headers,
        }
      : undefined,
    request: error.request,
    message: typeof error.message === 'string' ? error.message : undefined,
    code: typeof error.code === 'string' ? error.code : undefined,
    config: error.config,
  };
}

function getErrorResponseData(error: unknown): ErrorResponseData | undefined {
  const errorLike = toErrorLike(error);
  if (!isRecord(errorLike.response?.data)) {
    return undefined;
  }

  const data = errorLike.response.data;
  const errorsValue = data.errors;
  const normalizedErrors =
    Array.isArray(errorsValue) || isRecord(errorsValue)
      ? (errorsValue as Record<string, string> | string[])
      : undefined;

  return {
    message: typeof data.message === 'string' ? data.message : undefined,
    error: typeof data.error === 'string' ? data.error : undefined,
    errors: normalizedErrors,
  };
}

// ==================== ERROR HANDLER FUNCTIONS ====================

/**
 * Get error message from API error response
 */
export function getApiErrorMessage(
  error: unknown,
  lang: ErrorLanguage = 'vi'
): string {
  // If error is already a string
  if (typeof error === 'string') {
    return error;
  }

  // Axios error
  const errorLike = toErrorLike(error);

  if (errorLike.response) {
    const responseData = getErrorResponseData(error);

    // Backend message (priority)
    if (responseData?.message) {
      return responseData.message;
    }

    // Status code message
    const status = errorLike.response.status;
    if (status && errorMessages[status as keyof typeof errorMessages]) {
      return errorMessages[status as keyof typeof errorMessages][lang];
    }
  }

  // Network error
  if (errorLike.code === 'ERR_NETWORK' || errorLike.message?.includes('Network Error')) {
    return errorMessages.network[lang];
  }

  // Timeout error
  if (errorLike.code === 'ECONNABORTED' || errorLike.message?.includes('timeout')) {
    return errorMessages.timeout[lang];
  }

  // Request error (no response)
  if (errorLike.request) {
    return errorMessages.network[lang];
  }

  // Generic error message
  if (errorLike.message) {
    return errorLike.message;
  }

  // Unknown error
  return errorMessages.unknown[lang];
}

/**
 * Extract error message from various error types
 * Consolidates error extraction from API responses, validation errors, and network errors
 */
export function extractErrorMessage(error: unknown): string {
  // API Error Response
  const errorLike = toErrorLike(error);
  const data = getErrorResponseData(error);

  if (errorLike.response) {

    if (data?.message) {
      return data.message;
    }

    if (data?.errors) {
      // Handle validation errors array
      if (Array.isArray(data.errors)) {
        return  data.errors[0] || 'Có lỗi xảy ra';
      }
      // Handle validation errors object
      if (!Array.isArray(data.errors) && typeof data.errors === 'object') {
        const firstKey = Object.keys(data.errors)[0];
        return data.errors[firstKey] || 'Có lỗi xảy ra';
      }
    }

    // HTTP Status messages
    const status = errorLike.response.status;
    if (status === 400) return 'Dữ liệu không hợp lệ';
    if (status === 401) return 'Vui lòng đăng nhập lại';
    if (status === 403) return 'Bạn không có quyền thực hiện thao tác này';
    if (status === 404) return 'Không tìm thấy dữ liệu';
    if (status === 409) return 'Dữ liệu đã tồn tại';
    if (status === 422) return 'Dữ liệu không hợp lệ';
    if (status && status >= 500) return 'Lỗi máy chủ, vui lòng thử lại sau';
  }

  // Standard Error
  if (error instanceof Error) {
    return error.message;
  }

  // String error
  if (typeof error === 'string') {
    return error;
  }

  return 'Có lỗi xảy ra';
}

/**
 * Extract validation errors from API response
 */
export function getValidationErrors(error: unknown): Record<string, string> | null {
  const responseData = getErrorResponseData(error);
  if (responseData?.errors && !Array.isArray(responseData.errors)) {
    return responseData.errors;
  }
  return null;
}

/**
 * Get error category for classification
 */
export function getErrorCategory(error: unknown): ErrorCategory {
  const errorLike = toErrorLike(error);
  const status = errorLike.response?.status;
  const code = errorLike.code;
  const responseData = getErrorResponseData(error);

  // Authentication errors (401)
  if (status === 401) return 'auth';
  // Permission errors (403)
  if (status === 403) return 'permission';
  // Validation errors (422)
  if (status === 422 || !!responseData?.errors) return 'validation';
  // Not found errors (404)
  if (status === 404) return 'notfound';
  // Conflict errors (409)
  if (status === 409) return 'conflict';
  // Server errors (5xx)
  if (status && status >= 500) return 'server';
  // Network errors
  if (code === 'ERR_NETWORK' || errorLike.message?.includes('Network Error') || !errorLike.response) {
    return 'network';
  }
  // Timeout errors
  if (code === 'ECONNABORTED' || errorLike.message?.includes('timeout')) return 'timeout';
  // Backend business error (has message)
  if (responseData?.message) return 'business';
  // Unknown
  return 'unknown';
}

/**
 * Get error type for retry/business classification
 */
export function getErrorType(error: unknown): ErrorType {
  const category = getErrorCategory(error);
  const hasBackendMessage = !!getErrorResponseData(error)?.message;

  // Retryable: network, timeout, server errors
  if (category === 'network' || category === 'timeout' || category === 'server') {
    return 'retryable';
  }

  // Non-retryable: auth, permission, validation, notfound, conflict
  if (['auth', 'permission', 'validation', 'notfound', 'conflict'].includes(category)) {
    return 'non-retryable';
  }

  // Business vs System
  if (hasBackendMessage) {
    return 'business';
  }

  return 'system';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const errorType = getErrorType(error);
  return errorType === 'retryable';
}

/**
 * Check if error is business error (has backend message)
 */
export function isBusinessError(error: unknown): boolean {
  return !!getErrorResponseData(error)?.message;
}

/**
 * Format error for display
 */
export function formatError(
  error: unknown,
  lang: ErrorLanguage = 'vi'
): FormattedError {
  const errorLike = toErrorLike(error);
  const message = getApiErrorMessage(error, lang);
  const validationErrors = getValidationErrors(error);
  const status = errorLike.response?.status;
  const code = errorLike.code;
  const category = getErrorCategory(error);
  const type = getErrorType(error);

  return {
    message,
    validationErrors: validationErrors || undefined,
    status,
    code,
    category,
    type,
    isAuthError: category === 'auth',
    isPermissionError: category === 'permission',
    isValidationError: category === 'validation',
    isRetryable: type === 'retryable',
    isBusinessError: isBusinessError(error),
  };
}

/**
 * Check if error is authentication error
 */
export function isAuthError(error: unknown): boolean {
  return toErrorLike(error).response?.status === 401;
}

/**
 * Check if error is forbidden error
 */
export function isForbiddenError(error: unknown): boolean {
  return toErrorLike(error).response?.status === 403;
}

/**
 * Check if error is validation error
 */
export function isValidationError(error: unknown): boolean {
  const errorLike = toErrorLike(error);
  const responseData = getErrorResponseData(error);
  return errorLike.response?.status === 422 || !!responseData?.errors;
}

/**
 * Check if error is network error
 */
export function isNetworkError(error: unknown): boolean {
  const errorLike = toErrorLike(error);
  return (
    errorLike.code === 'ERR_NETWORK' ||
    errorLike.message?.includes('Network Error') ||
    !errorLike.response
  );
}

/**
 * Check if error is timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  const errorLike = toErrorLike(error);
  return errorLike.code === 'ECONNABORTED' || !!errorLike.message?.includes('timeout');
}

/**
 * Get first validation error message
 */
export function getFirstValidationError(
  errors: Record<string, string> | null
): string | null {
  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }
  return Object.values(errors)[0];
}

/**
 * Convert validation errors to array format
 */
export function validationErrorsToArray(
  errors: Record<string, string> | null
): { field: string; message: string }[] {
  if (!errors) {
    return [];
  }
  return Object.entries(errors).map(([field, message]) => ({
    field,
    message,
  }));
}

// ==================== ERROR LOGGING ====================

/**
 * Log error to console (development only)
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    const errorLike = toErrorLike(error);
    console.group(`❌ Error${context ? ` in ${context}` : ''}`);
    console.error('Error:', error);
    if (errorLike.response) {
      console.error('Response:', errorLike.response);
      console.error('Status:', errorLike.response.status);
      console.error('Data:', errorLike.response.data);
    }
    console.groupEnd();
  }
}

/**
 * Log error with details
 */
export function logDetailedError(
  error: unknown,
  context?: string,
  additionalInfo?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === 'development') {
    const errorLike = toErrorLike(error);
    console.group(`❌ Detailed Error${context ? ` in ${context}` : ''}`);
    console.error('Error Object:', error);
    console.error('Message:', errorLike.message);
    console.error('Status:', errorLike.response?.status);
    console.error('Data:', errorLike.response?.data);
    console.error('Headers:', errorLike.response?.headers);
    console.error('Config:', errorLike.config);
    if (additionalInfo) {
      console.error('Additional Info:', additionalInfo);
    }
    console.groupEnd();
  }
}

// ==================== ERROR HANDLER CLASS ====================

/**
 * Error handler class for consistent error handling
 */
export class ErrorHandler {
  private lang: ErrorLanguage;

  constructor(lang: ErrorLanguage = 'vi') {
    this.lang = lang;
  }

  setLanguage(lang: ErrorLanguage): void {
    this.lang = lang;
  }

  getMessage(error: unknown): string {
    return getApiErrorMessage(error, this.lang);
  }

  getValidationErrors(error: unknown): Record<string, string> | null {
    return getValidationErrors(error);
  }

  format(error: unknown): FormattedError {
    return formatError(error, this.lang);
  }

  isAuth(error: unknown): boolean {
    return isAuthError(error);
  }

  isForbidden(error: unknown): boolean {
    return isForbiddenError(error);
  }

  isValidation(error: unknown): boolean {
    return isValidationError(error);
  }

  isNetwork(error: unknown): boolean {
    return isNetworkError(error);
  }

  log(error: unknown, context?: string): void {
    logError(error, context);
  }

  logDetailed(error: unknown, context?: string, additionalInfo?: Record<string, unknown>): void {
    logDetailedError(error, context, additionalInfo);
  }
}

// ==================== CUSTOM ERROR CLASSES ====================
// Merged from lib/errors.ts for centralized error handling

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    const errorCtor = Error as ErrorConstructor & {
      captureStackTrace?: (
        targetObject: object,
        constructorOpt?: (...args: never[]) => unknown
      ) => void;
    };
    errorCtor.captureStackTrace?.(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation Error') {
    super(message, 422);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error') {
    super(message, 500);
  }
}

/**
 * Parse error response and throw appropriate AppError
 */
export function parseApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const errorLike = toErrorLike(error);
  const responseData = getErrorResponseData(error);

  // Handle Axios error
  if (errorLike.response) {
    const status = errorLike.response.status;
    const message = responseData?.message || responseData?.error || 'An error occurred';

    switch (status) {
      case 400:
        return new BadRequestError(message);
      case 401:
        return new UnauthorizedError(message);
      case 403:
        return new ForbiddenError(message);
      case 404:
        return new NotFoundError(message);
      case 409:
        return new ConflictError(message);
      case 422:
        return new ValidationError(message);
      default:
        return new InternalServerError(message);
    }
  }

  // Handle network error
  if (errorLike.request && !errorLike.response) {
    return new AppError('Network Error - No response from server', 0, false);
  }

  // Handle client error
  if (error instanceof Error) {
    return new AppError(error.message || 'An unexpected error occurred', 500, false);
  }

  return new AppError('An unexpected error occurred', 500, false);
}

// ==================== EXPORTS ====================

export default {
  errorMessages,
  getApiErrorMessage,
  extractErrorMessage,
  getValidationErrors,
  getErrorCategory,
  getErrorType,
  isRetryableError,
  isBusinessError,
  formatError,
  isAuthError,
  isForbiddenError,
  isValidationError,
  isNetworkError,
  isTimeoutError,
  getFirstValidationError,
  validationErrorsToArray,
  logError,
  logDetailedError,
  ErrorHandler,
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  parseApiError,
};
