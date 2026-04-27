import type { Metadata } from "next";
import { fetchBlogBySlugForSeo } from "@/lib/seo/api";
import { buildBlogMetadata, buildPageMetadata } from "@/lib/seo/metadata";
import { getCurrentLanguageFromRequest } from "@/lib/seo/language";
import { getSeoRouteCopy } from "@/lib/seo/copy";
import {
  buildBlogArticleJsonLd,
  buildBlogBreadcrumbJsonLd,
  buildProductJsonLd,
} from "@/lib/seo/schema";

interface BlogSlugLayoutMetadataProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  props: BlogSlugLayoutMetadataProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const language = await getCurrentLanguageFromRequest();
  const copy = getSeoRouteCopy(language);
  const blog = await fetchBlogBySlugForSeo(slug);

  if (!blog) {
    return buildPageMetadata({
      title: copy.blogNotFoundTitle,
      description: copy.blogNotFoundDescription,
      path: `/blog/${slug}`,
      language,
      noIndex: true,
    });
  }

  return buildBlogMetadata(blog, slug, language);
}

interface BlogSlugLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function BlogSlugLayout({
  children,
  params,
}: Readonly<BlogSlugLayoutProps>) {
  const { slug } = await params;
  const language = await getCurrentLanguageFromRequest();
  const blog = await fetchBlogBySlugForSeo(slug);
  const articleJsonLd = blog
    ? JSON.stringify(buildBlogArticleJsonLd(blog, slug, language)).replace(
        /</g,
        "\\u003c"
      )
    : null;
  const breadcrumbJsonLd = blog
    ? JSON.stringify(buildBlogBreadcrumbJsonLd(blog, slug, language)).replace(
        /</g,
        "\\u003c"
      )
    : null;
  const productJsonLd = blog?.isProduct
    ? JSON.stringify(buildProductJsonLd(blog, slug, language)).replace(
        /</g,
        "\\u003c"
      )
    : null;

  return (
    <>
      {articleJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: articleJsonLd }}
        />
      ) : null}
      {breadcrumbJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
        />
      ) : null}
      {productJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: productJsonLd }}
        />
      ) : null}
      {children}
    </>
  );
}
