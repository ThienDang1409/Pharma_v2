"use client";

import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import type { Blog } from "@/lib/api";
import OptimizedImage from "@/app/components/common/OptimizedImage";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";
import { extractImageUrl } from "@/lib/utils/image/image-handler";

const translations = {
  en: enTranslations,
  vi: viTranslations,
};

interface ProductCardProps {
  product: Blog;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { language } = useLanguage();
  const t = translations[language];
  // Extract description from first section if available
  const description = product.sections?.[0]?.content
    ? product.sections[0].content.replace(/<[^>]*>/g, '').substring(0, 150)
    : '';

  return (
    <Link
      href={`/blog/${product.slug}`}
      className="group hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Product Image */}
      <div className="relative h-56  overflow-hidden flex items-center justify-center">
        <OptimizedImage
          src={extractImageUrl(product.image)}
          alt={product.title}
          preset="product"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {product.title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
            {description}
          </p>
        )}

        {/* Details Link */}
        <div className="text-primary-600 text-sm font-medium group-hover:text-primary-800 inline-flex items-center mt-auto">
          {t.pages.details}
          <svg
            className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
