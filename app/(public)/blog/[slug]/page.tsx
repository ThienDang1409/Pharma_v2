"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { getLocalizedText } from "@/lib/utils/i18n";

interface BlogSection {
  title: string;
  title_en?: string;
  slug: string;
  type: string;
  content: string;
  content_en?: string;
}

interface BlogInformation {
  _id: string;
  name: string;
  name_en?: string;
  slug: string;
}

interface Blog {
  _id: string;
  title: string;
  title_en?: string;
  slug: string;
  author: string;
  image: string;
  informationId: BlogInformation;
  tags: string[];
  sections: BlogSection[];
  isProduct: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  title: string;
  title_en?: string;
  slug: string;
  image: string;
  sections?: any[];
  informationId?: {
    _id: string;
    name: string;
    name_en?: string;
    slug: string;
  } | string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isNavSticky, setIsNavSticky] = useState(false);
  const [isProductCategory, setIsProductCategory] = useState(false);

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
    blog.sections.forEach((section) => {
      const element = document.getElementById(`section-${section.slug}`);
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
    try {
      setLoading(true);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

      // Fetch all blogs and find by slug
      const response = await fetch(`${apiUrl}/blog?status=published`);
      if (!response.ok) throw new Error("Failed to fetch blogs");

      const responseData = await response.json();
      // Handle both paginated and non-paginated responses
      const blogs: Blog[] = 'data' in responseData ? responseData.data : responseData;
      const currentBlog = blogs.find((b) => b.slug === slug);

      if (!currentBlog) {
        router.push("/blog");
        return;
      }

      setBlog(currentBlog);

      // Use isProduct field from blog data
      setIsProductCategory(currentBlog.isProduct || false);

      // Get related blogs from same category
      const related = blogs
        .filter(
          (b) =>
            b.isProduct === false &&
            b._id !== currentBlog._id
          // &&
          // b.informationId?._id === currentBlog.informationId?._id
        )
        .slice(0, 3);
      setRelatedBlogs(related);

      // If this is a product blog, fetch related products from same category
      if (currentBlog.isProduct && currentBlog.informationId?._id) {
        try {
          // Fetch all products (blogs marked as isProduct) from same category
          const allProducts = blogs.filter(
            (b) =>
              b.isProduct === true &&
              b._id !== currentBlog._id &&
              b.informationId?._id === currentBlog.informationId?._id
          );
          setRelatedProducts(allProducts.slice(0, 4));
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
      router.push("/blog");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
      {blog.image && (<div className="relative w-full h-[600px] bg-gray-100 overflow-hidden">

        <img
          src={blog.image}
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
              .map((section, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(section.slug)}
                  className={`text-base md:text-md pb-2 border-b-4 transition-all whitespace-nowrap cursor-pointer ${activeSection === section.slug
                    ? "text-primary-800 border-primary-800 font-semibold"
                    : "text-primary-900 border-transparent hover:text-primary-800 hover:border-primary-800 hover:font-semibold"
                    }`}
                >
                  {section.title}
                </button>
              ))}
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
              if (!isSpecialSection) {
                return (
                  <div
                    key={index}
                    id={`section-${section.slug}`}
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
                        className="prose prose-lg max-w-none
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
                          prose-table:w-full prose-table:border-collapse prose-table:my-6
                          prose-th:bg-gray-100 prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-gray-300
                          prose-td:p-3 prose-td:border prose-td:border-gray-300
                        "
                        dangerouslySetInnerHTML={{ __html: getLocalizedText(section.content, section.content_en, language) }}
                      />
                    )}
                  </div>
                );
              }

              // Special section: Related Articles
              if (isRelatedArticles && relatedBlogs.length > 0) {
                return (
                  <div key={index} id={`section-${section.slug}`} className="py-10 border-b border-gray-200">
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
                  <div key={index} id={`section-${section.slug}`} className="py-10">
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
                              {product.image ? (
                                <img
                                  src={product.image}
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
