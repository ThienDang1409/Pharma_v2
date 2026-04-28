"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { blogApi, Blog, informationApi, PaginationResult, Information } from "@/lib/api";
import { BLOG_STATUS } from "@/lib/constants/api";
import { apiFetch } from "@/lib/utils/api/apiHelper";
import ProductCard from "../cards/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination, FreeMode } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const translations = {
  en: enTranslations,
  vi: viTranslations,
};

export default function FeaturedProducts() {
  const { language } = useLanguage();
  const [products, setProducts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    try {
      // Get categories to find products category
      const categoriesResult = await apiFetch(() => informationApi.getAll());
      const categories = (categoriesResult as unknown as PaginationResult<Information>)?.items || [];

      const productCategory = categories.find(
        (cat) => cat.slug === 'san-pham' || cat.slug === 'products' || cat.name.toLowerCase().includes('sản phẩm')
      );

      if (!productCategory) {
        setLoading(false);
        return;
      }

      // Fetch products in this category
      const blogsResult = await apiFetch(() => blogApi.getAll({
        informationId: productCategory._id,
        status: BLOG_STATUS.PUBLISHED,
        limit: 12
      }));

      if (blogsResult) {
        const items = (blogsResult as unknown as PaginationResult<Blog>)?.items || [];
        setProducts(items);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-20">
          <div className="h-10 bg-gray-100 rounded w-64 mx-auto mb-12 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-gray-50 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-white overflow-hidden" id="featured-products">
      <div className="container mx-auto px-4 md:px-20">
        {/* Section Title - Matching Home Page Structure */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px bg-primary-200 w-24 md:w-full"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 whitespace-nowrap px-4">
              {language === 'vi' ? 'Sản phẩm tiêu biểu' : 'Featured Products'}
            </h2>
            <div className="h-px bg-primary-200 w-24 md:w-full"></div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Custom Navigation Buttons */}
          <div className="absolute -top-12 right-0 flex items-center gap-3 z-10">
            <button className="swiper-prev-featured p-2.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-primary-600 hover:text-primary-600 hover:shadow-md transition-all disabled:opacity-20">
              <ChevronLeft size={20} />
            </button>
            <button className="swiper-next-featured p-2.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-primary-600 hover:text-primary-600 hover:shadow-md transition-all disabled:opacity-20">
              <ChevronRight size={20} />
            </button>
          </div>

          <Swiper
            modules={[Navigation, Autoplay, Pagination, FreeMode]}
            spaceBetween={24}
            slidesPerView={1}
            loop={products.length > 4}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: ".swiper-prev-featured",
              nextEl: ".swiper-next-featured",
            }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="pb-12"
          >
            {products.map((product) => (
              <SwiperSlide key={product._id} className=" !h-auto">
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/category/products"
            className="inline-flex items-center gap-2 border-2 border-primary-900 text-primary-900 px-8 py-3 rounded hover:bg-primary-900 hover:text-white transition-all font-semibold"
          >
            {language === 'vi' ? 'Xem tất cả sản phẩm' : 'View All Products'}
          </Link>
        </div>
      </div>
    </section>
  );
}
