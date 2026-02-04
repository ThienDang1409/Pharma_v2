import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { Blog } from "@/lib/api";
import OptimizedImage from "@/app/components/OptimizedImage";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

const translations = {
  en: enTranslations,
  vi: viTranslations,
};

interface NewsCardProps {
  article: Blog;
  formatDate: (dateString?: string) => string;
}

export default function NewsCard({ article, formatDate }: NewsCardProps) {
  const { language } = useLanguage();
  const t = translations[language];
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <OptimizedImage
          src={article.image}
          alt={article.title}
          preset="cardMedium"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <p className="text-gray-700 text-sm mb-2">{formatDate(article.createdAt)}</p>
        <h3 className="text-lg font-bold text-gray-800 mb-4 group-hover:text-secondary-900 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <Link
          href={`/blog/${article.slug}`}
          className="text-primary-900 hover:text-primary-800 font-semibold flex items-center gap-2"
        >
          <span>→ {t.pages.readMore}</span>
        </Link>
      </div>
    </div>
  );
}
