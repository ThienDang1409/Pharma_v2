/**
 * Application Constants
 * Match với backend_pattern structure
 */

// Blog Status
export const BLOG_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

export type BlogStatusType = typeof BLOG_STATUS[keyof typeof BLOG_STATUS];

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type UserRoleType = typeof USER_ROLES[keyof typeof USER_ROLES];

// Filter Values
export const FILTER_ALL = 'all';

// UI Messages (Vietnamese)
export const UI_MESSAGES = {
  ALL: 'Tất cả',
  PUBLISHED: '✓ Xuất bản',
  DRAFT: '✎ Bản nháp',
  LOADING: 'Đang tải...',
  NO_DATA: 'Không có dữ liệu',
  SUCCESS: 'Thành công',
  ERROR: 'Có lỗi xảy ra',
} as const;

// Entity Types
export const ENTITY_TYPES = {
  BLOG: 'blog',
  USER: 'user',
  INFORMATION: 'information',
  OTHER: 'other',
} as const;

export type EntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];

// Default values
export const DEFAULTS = {
  PAGINATION_LIMIT: 10,
  PAGINATION_PAGE: 1,
  BLOG_AUTHOR: 'Admin',
  BLOG_IMAGE: '/default-image.jpg',
  JSON_LIMIT: '10mb',
  TIMEOUT: 30000,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  BLOG_NOT_FOUND: 'Blog not found',
  INFORMATION_NOT_FOUND: 'Information not found',
  IMAGE_NOT_FOUND: 'Image not found',
  USER_NOT_FOUND: 'User not found',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  BAD_REQUEST: 'Bad Request',
  VALIDATION_ERROR: 'Validation Error',
  SERVER_ERROR: 'Internal Server Error',
  NETWORK_ERROR: 'Network Error - No response from server',
  ROUTE_NOT_FOUND: 'Route not found',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  SLUG_MIN_LENGTH: 3,
  SLUG_MAX_LENGTH: 200,
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  EXCERPT_MAX_LENGTH: 500,
  PASSWORD_MIN_LENGTH: 6,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// API Endpoints (relative)
export const API_ENDPOINTS = {
  HEALTH: '/',
  BLOGS: '/blog',
  BLOG_BY_ID: '/blog/:id',
  BLOG_BY_SLUG: '/blog/slug/:slug',
  BLOGS_SEARCH: '/blog/search',
  INFORMATION: '/informations',
  INFORMATION_BY_ID: '/informations/:id',
  INFORMATION_BY_SLUG: '/informations/slug/:slug',
  IMAGES: '/image',
  IMAGE_BY_ID: '/image/:id',
  IMAGE_UPLOAD: '/image/upload',
  IMAGE_UPLOAD_MULTIPLE: '/image/upload-multiple',
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_ME: '/auth/me',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',
  AUTH_CHANGE_PASSWORD: '/auth/change-password',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Folder Names for Images (Cloudinary)
export const IMAGE_FOLDERS = {
  UPLOADS: 'uploads',
  BLOGS: 'blogs',
  PROFILES: 'profiles',
  INFORMATION: 'info',
} as const;
