import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getCurrentLanguageFromRequest } from "@/lib/seo/language";
import { getSeoRouteCopy } from "@/lib/seo/copy";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguageFromRequest();
  const copy = getSeoRouteCopy(language);

  return buildPageMetadata({
    title: copy.blogTitle,
    description: copy.blogDescription,
    path: "/blog",
    language,
  });
}

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
