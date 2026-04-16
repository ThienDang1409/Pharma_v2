import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { Blog } from "@/lib/api";
import OptimizedImage from "@/app/components/common/OptimizedImage";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

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
      <div className=" overflow-hidden group hover:shadow-xl transition-shadow">
        <div className="relative h-56 bg-gray-100 overflow-hidden">
          <OptimizedImage
            src={article.image?.cloudinaryUrl}
            alt={article.title}
            preset="cardMedium"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-6">
          <p className="text-gray-700 text-sm mb-2">{formatDate(article.publishedAt)}</p>
          <h3 className="text-lg font-bold text-gray-800 mb-4 group-hover:text-secondary-900 transition-colors line-clamp-2">
            {article.title}
          </h3>
          <div

            className="text-primary-900 hover:text-primary-800 font-semibold flex items-center gap-2"
          >
            <span>&#62; {t.pages.readMore}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
