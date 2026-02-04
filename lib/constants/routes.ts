/**
 * Application-wide constants
 */

export * from './locales';
export * from './admin-i18n';

// Routes
export const ROUTES = {
  HOME: "/",
  ADMIN: "/admin",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_NEWS: "/admin/news",
  ADMIN_NEWS_ADD: "/admin/news/add",
  BLOG: "/blog",
  NEWS: "/news",
  EVENTS: "/events",
} as const;

// API endpoints (adjust based on your backend)
export const API_ENDPOINTS = {
  CATEGORIES: "/api/categories",
  NEWS: "/api/news",
  ANNOUNCEMENTS: "/api/announcements",
  PRODUCTS: "/api/products",
  EVENTS: "/api/events",
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  API_REQUEST: 10000,
  DEBOUNCE: 300,
  ANIMATION: 300,
} as const;
