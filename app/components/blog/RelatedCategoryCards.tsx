"use client";

import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import OptimizedImage from "@/app/components/common/OptimizedImage";
import RelatedProductsCarousel from "@/app/components/blog/RelatedProductsCarousel";
import type { Blog } from "@/lib/types";
import {
  formatDateLong,
  getBlogExcerpt,
  getBlogId,
  getBlogImageUrl,
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
    detail: "Xem chi tiết",
    readMore: "Đọc bài",
  },
  en: {
    sectionTitle: "Explore more from this category",
    productTitle: "Related products",
    articleTitle: "Related articles",
    detail: "Details",
    readMore: "Read article",
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
  const articles = relatedBlogs.slice(0, 3);
  const hasAnyRelated = products.length > 0 || articles.length > 0;
  const text = labels[language];

  if (!hasAnyRelated) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-gray-200 pt-10">
      <div className="rounded-2xl border border-gray-200 bg-linear-to-br from-gray-50 to-white p-6 md:p-8">
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
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              {text.productTitle}
            </h3>
            <div className="overflow-hidden">
              <RelatedProductsCarousel products={products} language={language} />
            </div>
          </div>
        )}

        {articles.length > 0 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              {text.articleTitle}
            </h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => {
                const articleTitle = getLocalizedText(
                  article.title,
                  article.title_en,
                  language
                );
                const excerpt = getBlogExcerpt(article, language, 120);
                const articleDate = formatDateLong(
                  article.createdAt,
                  language === "vi" ? "vi-VN" : "en-US"
                );
                const imageUrl = getBlogImageUrl(article);

                return (
                  <Link
                    key={getBlogId(article)}
                    href={`/blog/${article.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-40 overflow-hidden bg-gray-100">
                      {imageUrl ? (
                        <OptimizedImage
                          src={imageUrl}
                          alt={articleTitle}
                          preset="cardMedium"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <svg
                            className="h-10 w-10"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l2 2h5a2 2 0 012 2v12a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <span className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                        {articleDate}
                      </span>
                      <h4 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-primary-700">
                        {articleTitle}
                      </h4>
                      {excerpt && (
                        <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                          {excerpt}
                        </p>
                      )}
                      <span className="mt-auto inline-flex items-center text-sm font-medium text-primary-700">
                        {text.readMore}
                        <svg
                          className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}