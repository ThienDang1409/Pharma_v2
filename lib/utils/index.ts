/**
 * Export all utility functions
 * 
 * IMPORTANT: error-handler.ts is the single source of truth for error handling
 * Includes custom error classes, parsing, formatting, and validation errors
 * All errors handled through error-handler
 * 
 * IMPORTANT: Use lib/validators/ for all validation (Zod + i18n)
 */

export * from "./handler/error-handler"; // Primary error handler (includes AppError classes)
export * from "./string/format";
export * from "./string/slug";
export * from "./string/i18n";
export * from "./response/response"; // Response extraction, pagination helpers
export * from "./image/image"; // Image URL extraction and Cloudinary transformations
export * from "./api/apiHelper"; // API call wrapper, validation helpers
export * from "./auth/auth"; // Token management
export * from "./image/cloudinary"; // Cloudinary utilities
export * from "./handler/type-guards"; // Runtime type guards
export * from "./image/image-handler"; // Image extraction helpers
