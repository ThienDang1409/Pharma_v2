import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getCurrentLanguageFromRequest } from "@/lib/seo/language";
import { getSeoRouteCopy } from "@/lib/seo/copy";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguageFromRequest();
  const copy = getSeoRouteCopy(language);

  return buildPageMetadata({
    title: copy.searchTitle,
    description: copy.searchDescription,
    path: "/search",
    language,
    noIndex: true,
  });
}

export default function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
