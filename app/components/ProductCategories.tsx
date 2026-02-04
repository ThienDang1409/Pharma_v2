"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { informationApi } from "@/lib/api";
import { silentApiCall } from "@/lib/utils/apiHelper_backup";
import type { Information } from "@/lib/api";
import { useLanguage } from "@/app/context/LanguageContext";
import { getLocalizedText } from "@/lib/utils/i18n";
import OptimizedImage from "@/app/components/OptimizedImage";
import { CategoryGridSkeleton } from "./Skeletons";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

const translations = {
  en: enTranslations,
  vi: viTranslations,
};

export default function ProductCategories() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<Information[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      
      const result = await silentApiCall(() => informationApi.getAll(), {
        onSuccess: (response) => {
          const allCategories = response.data?.items || [];
          
          // Find PRODUCTS root category
          const productsRoot = allCategories.find(
            (cat) => cat.slug === "products" && !cat.parentId
          );

          if (productsRoot) {
            // Get level 2 categories (children of PRODUCTS)
            const level2Categories = allCategories.filter(
              (cat) => cat.parentId === productsRoot._id
            );
            setCategories(level2Categories);
          }
        }
      });
      
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const displayedCategories = showAll ? categories : categories.slice(0, 2);

  const getCategoryIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("galenic")) return "💊";
    if (nameLower.includes("dissolution")) return "🧪";
    if (nameLower.includes("tablet")) return "💉";
    if (nameLower.includes("coating")) return "🎨";
    if (nameLower.includes("friability")) return "🔬";
    if (nameLower.includes("disintegration")) return "⚗️";
    return "🔬";
  };

  if (loading) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px bg-gray-300 w-24 md:w-64"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-700">
                {t.pages.productCategories}
              </h2>
              <div className="h-px bg-gray-300 w-24 md:w-64"></div>
            </div>
          </div>
          <CategoryGridSkeleton count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px bg-gray-300 w-24 md:w-64"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-700">
              {t.pages.productCategories}
            </h2>
            <div className="h-px bg-gray-300 w-24 md:w-64"></div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {displayedCategories.map((category) => (
            <div
              key={category._id}
              className="relative group overflow-hidden rounded-lg shadow-lg"
            >
              <div className="relative h-96">
                {/* Background image */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                  {category.image && category.image !== "/default-image.jpg" ? (
                    <OptimizedImage
                      src={category.image}
                      alt={category.name}
                      preset="hero"
                      transformation={{ quality: 70 }}
                      className="w-full h-full object-cover opacity-60"
                      fallback={
                        <div className="absolute inset-0 flex items-center justify-center opacity-40">
                          <span className="text-9xl">
                            {getCategoryIcon(category.name)}
                          </span>
                        </div>
                      }
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                      <span className="text-9xl">
                        {getCategoryIcon(category.name)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all"></div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
                  <h3 className="text-3xl font-bold mb-6 text-center px-4">
                    {getLocalizedText(category.name, category.name_en, language)}
                  </h3>
                  {category.description && (
                    <p className="text-white/90 mb-6 text-center px-8 line-clamp-2">
                      {getLocalizedText(category.description, category.description_en, language)}
                    </p>
                  )}
                  <Link
                    href={`/category/${category.slug}`}
                    className="bg-primary-900 text-white px-8 py-3 rounded hover:bg-primary-800 transition-colors font-semibold"
                  >
                    {t.pages.viewAll}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {categories.length > 2 && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setShowAll(!showAll)}
              className="border-2 border-primary-900 text-gray-700 px-10 py-3 rounded-md hover:bg-primary-800 hover:text-white transition-colors font-semibold uppercase tracking-wider cursor-pointer "
            >
              {showAll ? `→ ${t.pages.showLess}` : `→ ${t.pages.readMore}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
