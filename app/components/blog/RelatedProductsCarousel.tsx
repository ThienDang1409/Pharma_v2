"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel, Autoplay, Navigation } from "swiper/modules";
import type { Blog } from "@/lib/types";
import { getBlogId } from "@/lib/utils";

import ProductCard from "@/app/components/cards/ProductCard";

import "swiper/css";
import "swiper/css/navigation";

interface RelatedProductsCarouselProps {
  products: Blog[];
  language: "vi" | "en";
}

export default function RelatedProductsCarousel({
  products,
  language,
}: RelatedProductsCarouselProps) {
  if (!products.length) {
    return null;
  }

  const canScroll = products.length > 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative group"
    >
      {/* Custom Navigation Buttons */}
      <div className="absolute -top-12 right-0 flex items-center gap-3 z-30">
        <button className="swiper-prev-products p-2.5 rounded-full border border-primary-100 bg-white text-primary-900 hover:bg-primary-900 hover:text-white hover:border-primary-900 transition-all shadow-sm disabled:opacity-20 disabled:cursor-not-allowed">
          <ChevronLeft size={20} />
        </button>
        <button className="swiper-next-products p-2.5 rounded-full border border-primary-100 bg-white text-primary-900 hover:bg-primary-900 hover:text-white hover:border-primary-900 transition-all shadow-sm disabled:opacity-20 disabled:cursor-not-allowed">
          <ChevronRight size={20} />
        </button>
      </div>

      <Swiper
        modules={[FreeMode, Mousewheel, Autoplay, Navigation]}
        slidesPerView="auto"
        spaceBetween={24}
        loop={true}
        loopAdditionalSlides={3}
        grabCursor={canScroll}
        watchOverflow
        mousewheel={canScroll ? { forceToAxis: true, releaseOnEdges: true } : false}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={{
          prevEl: ".swiper-prev-products",
          nextEl: ".swiper-next-products",
        }}
        freeMode={{
          enabled: true,
          sticky: false,
          momentum: true,
          momentumRatio: 0.45,
          momentumVelocityRatio: 0.7,
        }}
        className="relative"
      >
        {products.map((product) => (
          <SwiperSlide key={getBlogId(product)} className="!w-[280px] md:!w-[300px] lg:!w-[320px] !h-auto">
            <div className="h-full py-4">
              <ProductCard product={product} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
}
