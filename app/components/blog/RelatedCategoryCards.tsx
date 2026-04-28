"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import RelatedProductsCarousel from "@/app/components/blog/RelatedProductsCarousel";
import RelatedArticlesList from "@/app/components/blog/RelatedArticlesList";
import type { Blog } from "@/lib/types";
import {
  getCategoryPreview,
  getLocalizedText,
} from "@/lib/utils";
import type { CategoryRef } from "@/lib/utils";

interface RelatedCategoryCardsProps {
  category: CategoryRef;
  relatedBlogs: Blog[];
  relatedProducts: Blog[];
}

const labels = {
  vi: {
    sectionTitle: "Khám phá thêm trong cùng danh mục",
    productTitle: "Sản phẩm liên quan",
    articleTitle: "Bài viết liên quan",
  },
  en: {
    sectionTitle: "Explore more from this category",
    productTitle: "Related products",
    articleTitle: "Related articles",
  },
} as const;

export default function RelatedCategoryCards({
  category,
  relatedBlogs,
  relatedProducts,
}: RelatedCategoryCardsProps) {
  const { language } = useLanguage();
  const categoryPreview = getCategoryPreview(category);
  const categoryName = categoryPreview
    ? getLocalizedText(
      categoryPreview.name || "",
      categoryPreview.name_en || "",
      language
    )
    : "";

  const products = relatedProducts.slice(0, 12);
  const articles = relatedBlogs.slice(0, 12);
  const hasAnyRelated = products.length > 0 || articles.length > 0;
  const text = labels[language];

  if (!hasAnyRelated) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-primary-600 pt-10">
      <div className=" p-6 md:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-5">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
            {text.sectionTitle}
          </h2>
          {categoryName && (
            <span className="inline-flex items-center rounded-full border border-primary-200 bg-white px-3 py-1 text-sm font-medium text-primary-800">
              {categoryName}
            </span>
          )}
        </div>

        {products.length > 0 && (
          <div className="mb-10">
            <h3 className="mb-8 text-lg font-semibold text-gray-900">
              {text.productTitle}
            </h3>
            <div className="relative ">
              <RelatedProductsCarousel products={products} language={language} />
            </div>
          </div>
        )}

        {articles.length > 0 && (
          <div className="mt-8 border-t border-gray-100 pt-8">
            <RelatedArticlesList articles={articles} language={language} />
          </div>
        )}
      </div>
    </section>
  );
}