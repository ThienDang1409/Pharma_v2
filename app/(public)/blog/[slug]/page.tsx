"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { getLocalizedText } from "@/lib/utils/string/i18n";
import { formatDateLong } from "@/lib/utils/string/format";
import { blogApi, type Blog } from "@/lib/api";
import { apiFetch } from "@/lib/utils/api/apiHelper";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isNavSticky, setIsNavSticky] = useState(false);
  const [isProductCategory, setIsProductCategory] = useState(false);

  const buildRelatedProductsEmbedHtml = () => {
    if (!relatedProducts.length) {
      return "";
    }

    const cards = relatedProducts
      .map((product) => {
        const title = getLocalizedText(product.title, product.title_en, language);
        const image = product.image?.cloudinaryUrl
          ? `<img src=\"${product.image.cloudinaryUrl}\" alt=\"${title}\" class=\"w-full h-full object-contain group-hover:scale-105 transition-transform duration-300\" />`
          : `<div class=\"w-full h-full flex items-center justify-center text-gray-300\"><svg class=\"w-16 h-16\" fill=\"currentColor\" viewBox=\"0 0 20 20\"><path fill-rule=\"evenodd\" d=\"M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z\" clip-rule=\"evenodd\" /></svg></div>`;

        return `<a href=\"/blog/${product.slug}\" class=\"group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col\"><div class=\"relative h-48 bg-gray-50 overflow-hidden flex items-center justify-center p-4\">${image}</div><div class=\"p-4 flex-1 flex flex-col\"><h3 class=\"font-bold text-lg text-gray-900 mb-1\">${title}</h3><div class=\"text-primary-600 text-sm font-medium group-hover:text-primary-800 inline-flex items-center mt-auto\">Details</div></div></a>`;
      })
      .join("");

    return `<div class=\"py-2\"><div class=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">${cards}</div></div>`;
  };

  const buildRelatedArticlesEmbedHtml = () => {
    if (!relatedBlogs.length) {
      return "";
    }

    const items = relatedBlogs
      .map((relatedBlog) => {
        const title = getLocalizedText(relatedBlog.title, relatedBlog.title_en, language);
        return `<a href=\"/blog/${relatedBlog.slug}\" class=\"group flex items-start gap-3 text-gray-700 hover:text-primary-600 transition-colors\"><span class=\"text-primary-600 mt-1 font-bold group-hover:translate-x-1 transition-transform\">&gt;&gt;</span><span class=\"text-base md:text-lg group-hover:underline\">${title}</span></a>`;
      })
      .join("");

    return `<div class=\"py-2\"><div class=\"space-y-3\">${items}</div></div>`;
  };

  const applySlashEmbeds = (htmlContent: string) => {
    return htmlContent
      .replace(/<p>\s*\[\[(RELATED_PRODUCTS|RELATED_PRODUCT|RELATEDPRODUCT)\]\]\s*<\/p>/gi, buildRelatedProductsEmbedHtml())
      .replace(/\[\[(RELATED_PRODUCTS|RELATED_PRODUCT|RELATEDPRODUCT)\]\]/gi, buildRelatedProductsEmbedHtml())
      .replace(/<p>\s*\[\[(RELATED_ARTICLES|RELATED_ARTICLE|RELATEDARTICLE)\]\]\s*<\/p>/gi, buildRelatedArticlesEmbedHtml())
      .replace(/\[\[(RELATED_ARTICLES|RELATED_ARTICLE|RELATEDARTICLE)\]\]/gi, buildRelatedArticlesEmbedHtml());
  };

  // Scroll to section
  const scrollToSection = (sectionSlug: string) => {
    setActiveSection(sectionSlug);
    const element = document.getElementById(`section-${sectionSlug}`);
    if (element) {
      const offset = 120; // Offset for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Suppress browser extension errors
  useEffect(() => {
    const handleError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const error = "error" in event ? event.error : event.reason;
      // Suppress errors from browser extensions
      if (
        error?.message?.includes("permission error") ||
        error?.message?.includes("extension") ||
        error?.originalError?.stack?.includes("chrome-extension")
      ) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener("error", handleError as any);
    window.addEventListener("unhandledrejection", handleError as any);

    return () => {
      window.removeEventListener("error", handleError as any);
      window.removeEventListener("unhandledrejection", handleError as any);
    };
  }, []);

  useEffect(() => {
    if (slug) {
      fetchBlogBySlug();
    }
  }, [slug]);

  // IntersectionObserver to detect active section
  useEffect(() => {
    if (!blog) return;

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // Active when section is in middle of viewport
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id.replace("section-", "");
          setActiveSection(sectionId);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    blog.sections.forEach((section, index) => {
      const sectionAnchor = section.slug || `section-${index + 1}`;
      const element = document.getElementById(`section-${sectionAnchor}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [blog]);

  // Detect if navigation is sticky
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsNavSticky(scrollY > 700); // Sticky after hero section
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchBlogBySlug = async () => {
    setLoading(true);

    // Fetch current blog by slug
    await apiFetch(
      () => blogApi.getBySlug(slug),
      {
        onSuccess: async (data) => {
          const currentBlog = data?.blog;

          if (!currentBlog) {
            router.push("/blog");
            return;
          }

          setBlog(currentBlog);
          setIsProductCategory(currentBlog.isProduct || false);

          // Fetch all published blogs for related content
          await apiFetch(
            () => blogApi.getAll({ status: 'published', limit: 1000 }),
            {
              onSuccess: (paginationData) => {
                const allBlogs = paginationData?.items || [];
                const categoryId = typeof currentBlog.informationId === 'string'
                  ? currentBlog.informationId
                  : currentBlog.informationId?._id;
                const sameCategoryBlogs = allBlogs.filter(
                  (b) =>
                    b.id !== currentBlog.id &&
                    (typeof b.informationId === 'string'
                      ? b.informationId === categoryId
                      : b.informationId?._id === categoryId)
                );

                // Related blogs in same category (non-product)
                const related = sameCategoryBlogs
                  .filter((b) => b.isProduct === false)
                  .slice(0, 3);
                setRelatedBlogs(related);

                // Related products in same category
                const relatedProductsList = sameCategoryBlogs.filter((b) => b.isProduct === true);
                setRelatedProducts(relatedProductsList.slice(0, 4));
              },
              onError: () => {
                setRelatedBlogs([]);
                setRelatedProducts([]);
              },
            }
          );
        },
        onError: () => {
          router.push("/blog");
        },
      }
    );

    setLoading(false);
  };

  const formatDate = (dateInput: string | Date) => {
    return formatDateLong(dateInput, language === "vi" ? "vi-VN" : "en-US");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner with Title */}
      {blog.image?.cloudinaryUrl && (
        <div className="relative w-full h-[600px] bg-gray-100 overflow-hidden">
          <img
            src={blog.image.cloudinaryUrl}
            alt={blog.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/40" />

          {/* Title */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6 md:px-30">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 max-w-3xl">
                {blog.title}
              </h1>
            </div>
          </div>
        </div>)}

      {/* Breadcrumb Navigation - Golden Yellow Background */}
      <div className="bg-third-500 py-4 shadow-sm mb-10">
        <div className="container mx-auto px-6 md:px-30">
          <div className="flex items-center gap-2 text-white text-sm md:text-base">
            <Link href="/" className="hover:underline font-medium">
              Home
            </Link>
            <span className="text-white/80">›</span>
            <span className="font-medium">{getLocalizedText(blog.title, blog.title_en, language)}</span>
          </div>
        </div>
      </div>

      {/* Section Tabs Navigation - Sticky */}
      <div className={`border-b-2 border-t-2 border-gray-200 bg-white sticky top-[60px] md:top-0 z-40 transition-all duration-300 ${isNavSticky ? "shadow-md" : ""
        }`}>
        <div className="container mx-auto px-6 md:px-12">
          {/* Title - Shows when sticky */}
          {isNavSticky && (
            <div className="py-3 ">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 text-center line-clamp-1">
                {getLocalizedText(blog.title, blog.title_en, language)}
              </h2>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center justify-center gap-8 md:gap-16 overflow-x-auto">
            {blog.sections
              .filter((section) => section.title) // Only show sections with titles
              .map((section, index) => {
                const sectionAnchor = section.slug || `section-${index + 1}`;
                return <button
                  key={index}
                  onClick={() => scrollToSection(sectionAnchor)}
                  className={`text-base md:text-md pb-2 border-b-4 transition-all whitespace-nowrap cursor-pointer ${activeSection === sectionAnchor
                    ? "text-primary-800 border-primary-800 font-semibold"
                    : "text-primary-900 border-transparent hover:text-primary-800 hover:border-primary-800 hover:font-semibold"
                    }`}
                >
                  {section.title}
                </button>
              })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto w-[70%] py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Main Content Container */}
          <div className=" ">
            {/* Author and Date Info at Top */}
            <div className="pt-8 pb-6 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">{blog.author}</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1h2a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2h2z" clipRule="evenodd" />
                  </svg>
                  {formatDate(blog.createdAt)}
                </span>
              </div>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-secondary-100 text-secondary-700 text-sm font-medium rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}


            </div>

            <div className=" mx-auto">
              {/* Show blog title if first section has no title */}
              {blog.sections[0] && !blog.sections[0].title && (
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-8">
                  {getLocalizedText(blog.title, blog.title_en, language)}
                </h2>
              )}
            </div>

            {/* All Sections */}
            {blog.sections.map((section, index) => {
              // Check if this is a special section (only title, no content)
              const isSpecialSection = section.title && !section.content;
              const isRelatedArticles = section.title?.toLowerCase().includes('related articles');
              const isRelatedProducts = section.title?.toLowerCase().includes('related products');

              // Regular section with content
              const sectionAnchor = section.slug || `section-${index + 1}`;

              if (!isSpecialSection) {
                return (
                  <div
                    key={index}
                    id={`section-${sectionAnchor}`}
                    className="py-10 border-b border-gray-200 last:border-b-0"
                  >
                    {/* Section Title - only show if exists */}
                    {section.title && (
                      <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-6">
                        {getLocalizedText(section.title, section.title_en, language)}
                      </h2>
                    )}

                    {/* Section Content with Rich Formatting */}
                    {section.content && (
                      <div
                        className="prose prose-lg md:prose-xl max-w-none rendered-content
                          prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
                          prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                          prose-a:text-primary-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-primary-700 prose-a:transition-colors
                          prose-strong:text-gray-900 prose-strong:font-bold
                          prose-em:italic prose-em:text-gray-700
                          prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2 prose-ul:my-4
                          prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2 prose-ol:my-4
                          prose-li:text-gray-700 prose-li:leading-relaxed
                          prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-gray-50 prose-blockquote:my-6
                          prose-img:rounded-lg prose-img:shadow-md prose-img:my-6 prose-img:w-full
                          prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-primary-700
                          prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-6
                          prose-table:w-full prose-table:border-collapse prose-table:my-6 prose-table:table-fixed
                          prose-th:bg-gray-100 prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-gray-300
                          prose-td:p-3 prose-td:border prose-td:border-gray-300
                        "
                        dangerouslySetInnerHTML={{ __html: applySlashEmbeds(getLocalizedText(section.content, section.content_en, language)) }}
                      />
                    )}
                  </div>
                );
              }

              // Special section: Related Articles
              if (isRelatedArticles && relatedBlogs.length > 0) {
                return (
                  <div key={index} id={`section-${sectionAnchor}`} className="py-10 border-b border-gray-200">
                    <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-8">
                      {getLocalizedText(section.title, section.title_en, language)}
                    </h2>
                    <div className="space-y-3">
                      {relatedBlogs.map((relatedBlog) => (
                        <Link
                          key={relatedBlog._id}
                          href={`/blog/${relatedBlog.slug}`}
                          className="group flex items-start gap-3 text-gray-700 hover:text-primary-600 transition-colors"
                        >
                          <span className="text-primary-600 mt-1 font-bold group-hover:translate-x-1 transition-transform">
                            &gt;&gt;
                          </span>
                          <span className="text-base md:text-lg group-hover:underline">
                            {getLocalizedText(relatedBlog.title, relatedBlog.title_en, language)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              // Special section: Related Products
              if (isRelatedProducts && relatedProducts.length > 0) {
                return (
                  <div key={index} id={`section-${sectionAnchor}`} className="py-10">
                    <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-8">
                      {getLocalizedText(section.title, section.title_en, language)}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {relatedProducts.map((product) => {
                        const contentToUse = getLocalizedText(
                          product.sections?.[0]?.content || '',
                          product.sections?.[0]?.content_en,
                          language
                        );
                        const description = contentToUse
                          ? contentToUse.replace(/<[^>]*>/g, '').substring(0, 100)
                          : '';

                        return (
                          <Link
                            key={product._id}
                            href={`/blog/${product.slug}`}
                            className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                          >
                            <div className="relative h-48 bg-gray-50 overflow-hidden flex items-center justify-center p-4">
                              {product.image?.cloudinaryUrl ? (
                                <img
                                  src={product.image.cloudinaryUrl}
                                  alt={getLocalizedText(product.title, product.title_en, language)}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <h3 className="font-bold text-lg text-gray-900 mb-1">
                                {getLocalizedText(product.title, product.title_en, language)}
                              </h3>
                              {description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
                                  {description}
                                </p>
                              )}
                              <div className="text-primary-600 text-sm font-medium group-hover:text-primary-800 inline-flex items-center mt-auto">
                                Details
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // Don't render anything if special section but no data
              return null;
            })}
          </div>

          {/* Back Button */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 border  border-primary-900 text-gray-700 font-semibold rounded-lg hover:bg-primary-900 hover:text-white transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              BACK TO HOME
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
