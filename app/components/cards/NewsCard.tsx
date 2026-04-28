import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { Blog } from "@/lib/api";
import OptimizedImage from "@/app/components/common/OptimizedImage";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";
import { getLocalizedText } from "@/lib/utils/string/i18n";

const translations = {
  en: enTranslations,
  vi: viTranslations,
};

interface NewsCardProps {
  article: Blog;
  formatDate: (dateInput?: string | Date) => string;
}

export default function NewsCard({ article, formatDate }: NewsCardProps) {
  const { language } = useLanguage();
  const t = translations[language];
  return (
    <Link href={`/blog/${article.slug}`}>
      <div className=" overflow-hidden group hover:shadow-xl transition-shadow flex flex-col h-full">
        <div className="relative h-56 bg-gray-100 overflow-hidden">
          <OptimizedImage
            src={article.image?.cloudinaryUrl}
            alt={getLocalizedText(article.title, article.title_en, language)}
            preset="cardMedium"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <p className="text-gray-700 text-sm mb-2">{formatDate(article.publishedAt)}</p>
          <h3 className="flex-1 text-lg font-bold text-gray-800 mb-4 group-hover:text-secondary-900 transition-colors line-clamp-2">
            {getLocalizedText(article.title, article.title_en, language)}
          </h3>
          <div
            className="text-primary-900 text-sm font-medium group-hover:text-primary-800 inline-flex items-center mt-auto"
          >
            {t.pages.readMore}
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
      </div>
    </Link>
  );
}
