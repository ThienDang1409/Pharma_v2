import { cookies } from "next/headers";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE_NAME,
  normalizeLanguage,
  type SupportedLanguage,
} from "@/lib/constants/language";

export async function getCurrentLanguageFromRequest(
  fallback: SupportedLanguage = DEFAULT_LANGUAGE
): Promise<SupportedLanguage> {
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  return normalizeLanguage(cookieLanguage, fallback);
}
