/**
 * Locale types and utilities
 */

export type Language = "en" | "vi";

export const LANGUAGES = {
  EN: "en" as const,
  VI: "vi" as const,
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

export const DEFAULT_LANGUAGE: Language = "vi";
