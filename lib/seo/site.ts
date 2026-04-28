import { siteConfig } from "@/config/site";

const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(url: string): string {
  const candidate = (url || "").trim() || DEFAULT_SITE_URL;

  try {
    return new URL(candidate).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const siteUrl = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url
);

export const siteMetadataBase = new URL(siteUrl);

export function absoluteUrl(path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}
