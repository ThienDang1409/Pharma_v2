"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { getLocalizedText } from "@/lib/utils/string/i18n";
import { blogApi, Blog, informationApi, PaginationResult, Information } from "@/lib/api";
import { BLOG_STATUS } from "@/lib/constants/api";
import { apiFetch } from "@/lib/utils/api/apiHelper";
import { formatDateLong } from "@/lib/utils/string/format";
import { getBlogExcerpt, getBlogImageUrl } from "@/lib/utils";
import OptimizedImage from "@/app/components/common/OptimizedImage";
import NewsCard from "../cards/NewsCard";
import { FeaturedNewsCardSkeleton, NewsCardSkeleton } from "../common/Skeletons";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

const translations = {
  en: enTranslations,
  vi: viTranslations,
};

const LATEST_NEWS_CACHE_KEY = "pharma:latest-news:v1";
const LATEST_NEWS_CACHE_TTL = 5 * 60 * 1000;

interface LatestNewsCachePayload {
  expiresAt: number;
  items: Blog[];
}

const readLatestNewsCache = (): Blog[] | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(LATEST_NEWS_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as LatestNewsCachePayload;
    if (!parsed?.expiresAt || !Array.isArray(parsed.items)) return null;

    if (Date.now() > parsed.expiresAt) {
      window.sessionStorage.removeItem(LATEST_NEWS_CACHE_KEY);
      return null;
    }

    return parsed.items;
  } catch {
    return null;
  }
};

const writeLatestNewsCache = (items: Blog[]) => {
  if (typeof window === "undefined") return;

  const payload: LatestNewsCachePayload = {
    expiresAt: Date.now() + LATEST_NEWS_CACHE_TTL,
    items,
  };

  window.sessionStorage.setItem(LATEST_NEWS_CACHE_KEY, JSON.stringify(payload));
};

export default function LatestNews() {
  const { language } = useLanguage();
  const [newsArticles, setNewsArticles] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const t = translations[language];
  
  const articlesPerPage = 4; // 1 featured + 3 regular

  useEffect(() => {
    fetchLatestNews();
  }, []);

  const fetchLatestNews = async () => {
    setLoading(true);

    const cached = readLatestNewsCache();
    if (cached) {
      setNewsArticles(cached);
      setLoading(false);
      return;
    }
    
    try {
      // Get categories
      const categoriesResult = await apiFetch(
        () => informationApi.getAll(),
        {
          onError: () => setNewsArticles([]),
        }
      );
      
      if (!categoriesResult) {
        setNewsArticles([]);
        setLoading(false);
        return;
      }
      
      const categories = (categoriesResult as unknown as PaginationResult<Information>)?.items || [];
      
      // Find News category
      const newsCategory = categories.find(
        (cat) => cat.slug === 'news' || cat.name.toLowerCase().includes('news')
      );
      
      if (!newsCategory) {
        console.error('News category not found');
        setNewsArticles([]);
        setLoading(false);
        return;
      }
      
      // Fetch blogs
      const blogsResult = await apiFetch(
        () => blogApi.getAll({
          informationId: newsCategory._id,
          status: BLOG_STATUS.PUBLISHED
        }),
        {
          onError: () => setNewsArticles([]),
        }
      );
      
      if (blogsResult) {
        const blogs = (blogsResult as unknown as PaginationResult<Blog>)?.items || [];
        
        // Sort by createdAt descending (newest first)
        const sortedBlogs = blogs.sort((a: Blog, b: Blog) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        
        setNewsArticles(sortedBlogs);
        writeLatestNewsCache(sortedBlogs);
      }
    } catch (error) {
      console.error('Error fetching latest news:', error);
      setNewsArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return '';
    return formatDateLong(dateInput, language === "vi" ? "vi-VN" : "en-US");
  };

  const getExcerpt = (blog: Blog): string => {
    return getBlogExcerpt(blog, language, 200);
  };

  // Pagination logic
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = newsArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(newsArticles.length / articlesPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to the section
    const section = document.getElementById('latest-news-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <section>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px bg-primary-200 w-24 md:w-64"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary-900 whitespace-nowrap">
                {t.pages.latestNews}
              </h2>
              <div className="h-px bg-primary-200 w-24 md:w-64"></div>
            </div>
          </div>
          
          {/* Featured Skeleton */}
          <FeaturedNewsCardSkeleton />
          
          {/* Grid Skeletons */}
          <div className="grid gap-8 mt-12">
            {[...Array(3)].map((_, i) => (
              <NewsCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (newsArticles.length === 0) {
    return null;
  }

  return (
    <section id="latest-news-section">
      <div className="container mx-auto px-4 md:px-20">
        {/* Section Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px bg-primary-200 w-24 md:w-full"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 whitespace-nowrap">
              {t.pages.latestNews}
            </h2>
            <div className="h-px bg-primary-200 w-24 md:w-full"></div>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid gap-8">
          {/* Featured Article */}
          {currentArticles[0] && (
            <div className=" md:grid-cols-8 hidden md:grid gap-8 overflow-hidden group hover:shadow-xl transition-all">
              <div className="relative col-span-5 md:h-130 bg-gray-100 overflow-hidden">
                <OptimizedImage
                  src={getBlogImageUrl(currentArticles[0]) || '/images/placeholder.jpg'}
                  alt={getLocalizedText(currentArticles[0].title, currentArticles[0].title_en, language)}
                  preset="cardLarge"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 md:p-8 col-span-3 flex flex-col justify-start">
                <p className="text-primary-700 text-sm mb-2">
                  {formatDate(currentArticles[0].createdAt)}
                </p>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 group-hover:text-primary-600 transition-colors">
                  {getLocalizedText(currentArticles[0].title, currentArticles[0].title_en, language)}
                </h3>
                <p className="text-gray-600 mb-6 line-clamp-4">
                  {getExcerpt(currentArticles[0]) || t.pages.noDescription}
                </p>
                <Link
                  href={`/blog/${currentArticles[0].slug}`}
                  className="text-primary-900 text-sm group-hover:text-gray-800 font-semibold flex items-center gap-2"
                >
                  <span>&#62;  {t.pages.readMore}</span>
                </Link>
              </div>
            </div>
          )}

          <div className="md:hidden"> 
            <NewsCard 
              article={currentArticles[0]} 
              formatDate={formatDate} 
            />
          </div>

          {/* Regular Articles Grid */}
          {currentArticles.length > 1 && (
            <div className="grid md:grid-cols-3 gap-8">
              {currentArticles.slice(1, 4).map((article) => (
                <NewsCard 
                  key={article._id} 
                  article={article} 
                  formatDate={formatDate} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t.common.previous || 'Previous'}
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-primary-600 text-white border-primary-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t.common.next || 'Next'}
            </button>
          </div>
        )}

        {/* More News Button */}
        <div className="text-center mt-12">
          <Link
            href="/category/news-1"
            className="inline-flex items-center gap-2 border-2 border-primary-900 text-primary-900 px-8 py-3 rounded hover:bg-primary-800 hover:text-white transition-all font-semibold"
          >
            <span> {t.pages.moreNews}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
