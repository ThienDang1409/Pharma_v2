"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { useLanguage } from "@/app/context/LanguageContext";
import { blogApi, informationApi } from "@/lib/api";
import type { Blog } from "@/lib/api";
import { BLOG_STATUS } from "@/lib/constants/api";
import { apiFetch } from "@/lib/utils/api/apiHelper";
import OptimizedImage from "@/app/components/common/OptimizedImage";
import { PageLoadingSpinner } from "../common/Skeletons";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

const translations = {
  en: enTranslations,
  vi: viTranslations,
};

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function BlogSlider() {
  const { language } = useLanguage();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    const resolveNewsCategoryId = async (): Promise<string | null> => {
      const newsBySlug = await apiFetch(() => informationApi.getBySlug("news"), {
        logErrors: false,
      });

      const newsBySlugId = newsBySlug?.information?._id;
      if (newsBySlugId) {
        return newsBySlugId;
      }

      const categoriesResult = await apiFetch(() => informationApi.getAll(), {
        logErrors: false,
      });
      const categories = categoriesResult?.items || [];

      const fallbackNewsCategory = categories.find((category) => {
        const slug = category.slug?.toLowerCase();
        const viName = category.name?.toLowerCase();
        const enName = category.name_en?.toLowerCase();

        return slug === "news" || viName?.includes("news") || enName?.includes("news");
      });

      return fallbackNewsCategory?._id || null;
    };

    const fetchLatestBlogs = async () => {
      setLoading(true);

      const newsCategoryId = await resolveNewsCategoryId();
      if (!newsCategoryId) {
        setBlogs([]);
        setLoading(false);
        return;
      }
      
      await apiFetch(
        () => blogApi.getAll({
          informationId: newsCategoryId,
          includeDescendants: true,
          status: BLOG_STATUS.PUBLISHED,
          limit: 20,
        }),
        {
          onSuccess: (response) => {
            const items = response?.items || [];
            const latestBlogs = [...items]
              .sort((a, b) => {
                const aDate = new Date(a.createdAt || 0).getTime();
                const bDate = new Date(b.createdAt || 0).getTime();
                return bDate - aDate;
              })
              .slice(0, 7);
            setBlogs(latestBlogs);
          },
          onError: () => setBlogs([]),
        }
      );
      
      setLoading(false);
    };

    void fetchLatestBlogs();
  }, []);

  if (loading) {
    return <PageLoadingSpinner text={language === "vi" ? "Đang tải..." : "Loading..."} />;
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full bg-[#edf4f8] md:h-[700px]">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={1000}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet",
          bulletActiveClass: "swiper-pagination-bullet-active",
        }}
        navigation={true}
        loop={true}
        className="h-auto w-full md:h-full"
      >
        {blogs.map((blog) => (
          <SwiperSlide key={blog._id}>
            <div className="relative w-full h-auto md:h-full">
              {/* Background Image */}
              <div className="relative h-[380px] w-full md:absolute md:inset-0 md:h-full">
                <OptimizedImage
                  src={typeof blog.image === 'string' ? blog.image : blog.image?.cloudinaryUrl}
                  alt={blog.title}
                  preset="hero"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="relative px-12 py-12 md:absolute md:inset-0 md:flex md:items-start ">
                <div className="container mx-auto md:px-8">
                  <div className="max-w-[550px] md:ml-12 md:bg-white/80 md:p-10 md:shadow-sm">
                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 md:mb-6 leading-tight">
                      {blog.title}
                    </h2>

                    {/* Excerpt from first section */}
                    {blog.sections && blog.sections.length > 0 && (
                      <p className="hidden md:block text-gray-700 text-base md:text-lg mb-6 md:mb-8 line-clamp-2">
                        {blog.sections[0].content
                          ?.replace(/<[^>]*>/g, "")
                          .substring(0, 150)}
                        ...
                      </p>
                    )}

                    {/* Read More Button */}
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="inline-flex items-center gap-2 bg-primary-900 hover:bg-primary-800 text-white font-semibold px-6 md:px-8 py-2 md:py-3 transition-colors duration-300 uppercase text-sm tracking-wider"
                    >
                      <span>›</span>
                      {t.pages.readMore}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Optional: Category badge */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="hidden md:block absolute top-8 left-8 bg-primary-900 text-white px-4 py-2 rounded-sm text-sm font-semibold">
                  {blog.tags[0]}
                </div>
              )}  
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: #881a44 !important;
          background: none !important;
          padding: 8px !important;
          border-radius: 50% !important;
          width: 40px !important;
          height: 40px !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          transform: scale(1.1);
        }

        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 20px !important;
          font-weight: 900 !important;
          line-height: 1 !important;
        }

        .swiper-button-disabled {
          opacity: 0.3 !important;
        }

        .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.5;
          width: 10px !important;
          height: 10px !important;
        }

        .swiper-pagination-bullet-active {
          background: #881a44 !important;
          opacity: 1;
        }

        .swiper-pagination {
          bottom: 10px !important;
        }

        @media (max-width: 767px) {
          .swiper-button-next,
          .swiper-button-prev {
            display: none !important;
          }

          .swiper-pagination {
            bottom: 370px !important;
          }
        }
      `}</style>
    </div>
  );
}
