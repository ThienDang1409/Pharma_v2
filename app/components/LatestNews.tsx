"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { getLocalizedText } from "@/lib/utils/i18n";
import { blogApi, Blog, informationApi } from "@/lib/api";
import { BLOG_STATUS } from "@/lib/constants/api";
import { silentApiCall } from "@/lib/utils/apiHelper_backup";
import OptimizedImage from "@/app/components/OptimizedImage";
import NewsCard from "./NewsCard";
import { FeaturedNewsCardSkeleton, NewsCardSkeleton } from "./Skeletons";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

const translations = {
  en: enTranslations,
  vi: viTranslations,
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
    
    // Get categories - response.data is PaginationResult<Information> | Information[]
    const categoriesResult = await silentApiCall(() => informationApi.getAll());
    
    if (!categoriesResult.success) {
      setNewsArticles([]);
      setLoading(false);
      return;
    }
    
    const categories = categoriesResult.data?.data?.items;
    
    // Find News category
    const newsCategory = categories?.find(
      cat => cat.slug === 'news' || cat.name.toLowerCase().includes('news')
    );
    
    if (!newsCategory) {
      console.error('News category not found');
      setNewsArticles([]);
      setLoading(false);
      return;
    }
    
    // Fetch blogs - response.data is PaginationResult<Blog>
    const blogsResult = await silentApiCall(() => blogApi.getAll({
      informationId: newsCategory._id,
      status: BLOG_STATUS.PUBLISHED
    }));
    
    if (blogsResult.success) {
      const blogs = blogsResult.data?.data?.items || [];
      
      // Sort by createdAt descending (newest first)
      const sortedBlogs = blogs.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      setNewsArticles(sortedBlogs);
    } else {
      setNewsArticles([]);
    }
    
    setLoading(false);
  };

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return '';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getExcerpt = (blog: Blog) => {
    if (!blog.sections || blog.sections.length === 0) return '';
    const content = getLocalizedText(
      blog.sections[0]?.content || '',
      blog.sections[0]?.content_en,
      language
    );
    return content.replace(/<[^>]*>/g, '').substring(0, 200);
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
              <div className="h-px bg-gray-300 w-24 md:w-64"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-700">
                {t.pages.latestNews}
              </h2>
              <div className="h-px bg-gray-300 w-24 md:w-64"></div>
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
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px bg-gray-300 w-24 md:w-64"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-700">
              {t.pages.latestNews}
            </h2>
            <div className="h-px bg-gray-300 w-24 md:w-64"></div>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid gap-8">
          {/* Featured Article */}
          {currentArticles[0] && (
            <div className="grid md:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all">
              <div className="relative h-100 bg-gray-100 overflow-hidden">
                <OptimizedImage
                  src={currentArticles[0].image}
                  alt={getLocalizedText(currentArticles[0].title, currentArticles[0].title_en, language)}
                  preset="cardLarge"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <p className="text-gray-700 text-sm mb-2">
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
                  className="text-primary-900 hover:text-primary-800 font-semibold flex items-center gap-2"
                >
                  <span>→ {t.pages.readMore}</span>
                </Link>
              </div>
            </div>
          )}

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
            href="/category/news"
            className="inline-flex items-center gap-2 border-2 border-primary-900 text-gray-700 px-8 py-3 rounded hover:bg-primary-800 hover:text-white transition-all font-semibold"
          >
            <span>→ {t.pages.moreNews}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
