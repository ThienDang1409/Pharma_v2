/**
 * i18n (Internationalization) hook for language support
 * Usage: const t = useI18n(); // Use with language from context/store
 */

import { useMemo } from "react";
import enLocale from "@/locales/en.json";
import viLocale from "@/locales/vi.json";

type Language = "en" | "vi";

const locales: Record<Language, typeof enLocale> = {
  en: enLocale,
  vi: viLocale,
};

export function useI18n(language: Language = "vi") {
  return useMemo(() => locales[language], [language]);
}

/**
 * Get translation value from locale object
 * Usage: getTranslation(locale, 'header.company')
 */
export function getTranslation(
  locale: typeof enLocale,
  path: string,
  defaultValue: string = ""
): string {
  return path.split(".").reduce((obj: any, key) => obj?.[key], locale) || defaultValue;
}
