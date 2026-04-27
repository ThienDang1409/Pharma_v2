import type { Metadata } from "next";
import { fetchCategoriesForSeo, fetchCategoryBySlugForSeo } from "@/lib/seo/api";
import { buildCategoryMetadata, buildPageMetadata } from "@/lib/seo/metadata";
import { getCurrentLanguageFromRequest } from "@/lib/seo/language";
import { getSeoRouteCopy } from "@/lib/seo/copy";
import { buildCategoryBreadcrumbJsonLd } from "@/lib/seo/schema";

interface CategorySlugLayoutMetadataProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  props: CategorySlugLayoutMetadataProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const language = await getCurrentLanguageFromRequest();
  const copy = getSeoRouteCopy(language);
  const category = await fetchCategoryBySlugForSeo(slug);

  if (!category) {
    return buildPageMetadata({
      title: copy.categoryNotFoundTitle,
      description: copy.categoryNotFoundDescription,
      path: `/category/${slug}`,
      language,
      noIndex: true,
    });
  }

  return buildCategoryMetadata(category, slug, language);
}

interface CategorySlugLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function CategorySlugLayout({
  children,
  params,
}: Readonly<CategorySlugLayoutProps>) {
  const { slug } = await params;
  const language = await getCurrentLanguageFromRequest();
  const [category, categories] = await Promise.all([
    fetchCategoryBySlugForSeo(slug),
    fetchCategoriesForSeo(),
  ]);

  const breadcrumbJsonLd = category
    ? JSON.stringify(buildCategoryBreadcrumbJsonLd(category, categories, language)).replace(
        /</g,
        "\\u003c"
      )
    : null;

  return (
    <>
      {breadcrumbJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
        />
      ) : null}
      {children}
    </>
  );
}
