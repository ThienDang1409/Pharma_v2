"use client";

import Layout from "@/app/components/Layout";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { blogApi, Blog, ImagePreview } from "@/lib/api";
import { useLanguage } from "@/app/context/LanguageContext";
import { getLocalizedText } from "@/lib/utils/i18n";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

const translations = {
  en: enTranslations,
  vi: viTranslations,
};

type FilterType = "all" | "products" | "news";

// Helper function to get image URL
const getImageUrl = (image?: string | ImagePreview): string => {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.cloudinaryUrl || "";
};

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { language } = useLanguage();
  const t = translations[language];
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setBlogs([]);
        setFilteredBlogs([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Search with query parameter and only published status
        const response = await blogApi.getAll({
          search: query,
          status: "published",
        });
        
        // Handle response - extract data array
        let blogsArray: any[] = [];
        if ('data' in response && response.data) {
          const responseData = response.data as any;
          if ('items' in responseData) {
            blogsArray = responseData.items;
          } else if (Array.isArray(responseData)) {
            blogsArray = responseData;
          }
        } else {
          const responseAny = response as any;
          if ('items' in responseAny) {
            blogsArray = responseAny.items;
          } else if (Array.isArray(responseAny)) {
            blogsArray = responseAny;
          }
        }
        
        setBlogs(blogsArray);
        setFilteredBlogs(blogsArray);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setBlogs([]);
        setFilteredBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
    setCurrentPage(1); // Reset to first page on new search
  }, [query]);

  // Filter blogs based on active filter
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredBlogs(blogs);
    } else if (activeFilter === "products") {
      setFilteredBlogs(blogs.filter((blog) => blog.isProduct === true));
    } else if (activeFilter === "news") {
      setFilteredBlogs(blogs.filter((blog) => blog.isProduct !== true));
    }
    setCurrentPage(1); // Reset to first page when filter changes
  }, [activeFilter, blogs]);

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getExcerpt = (blog: Blog) => {
    const firstSection = blog.sections?.[0];
    if (!firstSection?.content) return "";
    
    // Strip HTML tags and get first 150 characters
    const text = firstSection.content.replace(/<[^>]*>/g, "");
    return text.substring(0, 150) + (text.length > 150 ? "..." : "");
  };

  const productsCount = blogs.filter((b) => b.isProduct === true).length;
  const newsCount = blogs.filter((b) => b.isProduct !== true).length;

  return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-primary-50/30 py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t.pages.search.title}
            </h1>
            {query && (
              <p className="text-xl text-gray-600">
                {t.pages.search.searchFor} <span className="font-semibold text-primary-600">"{query}"</span>
              </p>
            )}
            {!loading && (
              <p className="text-sm text-gray-500 mt-2">
                {t.pages.search.resultsFound.replace('{{count}}', filteredBlogs.length.toString())}
              </p>
            )}
          </div>

          {/* Filter Tabs */}
          {blogs.length > 0 && (
            <div className="flex justify-center mb-12">
              <div className="inline-flex bg-white rounded-full shadow-lg p-1.5 border border-gray-200">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeFilter === "all"
                      ? "bg-linear-to-r from-primary-600 to-primary-700 text-white shadow-md"
                      : "text-gray-600 hover:text-primary-600 hover:bg-primary-50"
                  }`}
                >
                  {t.pages.search.all} ({blogs.length})
                </button>
                <button
                  onClick={() => setActiveFilter("products")}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeFilter === "products"
                      ? "bg-linear-to-r from-secondary-600 to-secondary-700 text-white shadow-md"
                      : "text-gray-600 hover:text-secondary-600 hover:bg-secondary-50"
                  }`}
                >
                  {t.pages.search.products} ({productsCount})
                </button>
                <button
                  onClick={() => setActiveFilter("news")}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeFilter === "news"
                      ? "bg-linear-to-r from-third-600 to-third-700 text-white shadow-md"
                      : "text-gray-600 hover:text-third-600 hover:bg-third-50"
                  }`}
                >
                  {t.pages.search.news} ({newsCount})
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
            </div>
          )}

          {/* No Query */}
          {!loading && !query && (
            <div className="text-center py-20">
              <svg
                className="w-24 h-24 text-gray-300 mx-auto mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                {t.pages.search.typeKeyword}
              </h2>
              <p className="text-gray-500">
                {t.pages.search.useSearchBar}
              </p>
            </div>
          )}

          {/* No Results */}
          {!loading && query && filteredBlogs.length === 0 && (
            <div className="text-center py-20">
              <svg
                className="w-24 h-24 text-gray-300 mx-auto mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                {t.pages.search.noResults}
              </h2>
              <p className="text-gray-500 mb-6">
                {t.pages.search.noResultsDesc} "{query}"
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t.pages.search.backToHome}
              </Link>
            </div>
          )}

          {/* Results Grid */}
          {!loading && currentBlogs.length > 0 && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {currentBlogs.map((blog) => (
                  <Link
                    key={blog._id}
                    href={`/blog/${blog.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden bg-linear-to-br from-gray-100 to-gray-200">
                      {blog.image ? (
                        <img
                          src={getImageUrl(blog.image)}
                          alt={getLocalizedText(blog.title, blog.title_en, language)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-20 h-20 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      {/* Badge */}
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            blog.isProduct
                              ? "bg-secondary-600 text-white"
                              : "bg-third-600 text-white"
                          }`}
                        >
                          {blog.isProduct ? t.pages.search.products : t.pages.search.news}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Category & Date */}
                      <div className="flex items-center gap-3 mb-3">
                        {blog.informationId && typeof blog.informationId !== 'string' && (
                          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                            {getLocalizedText(
                              blog.informationId.name,
                              blog.informationId.name_en,
                              language
                            )}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {blog.createdAt && formatDate(blog.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {getLocalizedText(blog.title, blog.title_en, language)}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                        {getExcerpt(blog)}
                      </p>

                      {/* Author & Read More */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="text-sm text-gray-500">
                            {blog.author}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-primary-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          {t.pages.search.viewMore}
                          <svg
                            className="w-4 h-4"
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
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-primary-50 hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {t.pages.search.previous}
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                        currentPage === page
                          ? "bg-linear-to-r from-primary-600 to-primary-700 text-white shadow-lg scale-110"
                          : "bg-white border-2 border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-600"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-primary-50 hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {t.pages.search.next}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div></div>}>
      <SearchPageContent />
    </Suspense>
  );
}
