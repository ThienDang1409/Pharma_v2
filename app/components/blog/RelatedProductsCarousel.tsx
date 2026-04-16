"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import OptimizedImage from "@/app/components/common/OptimizedImage";
import type { Blog } from "@/lib/types";
import {
  getBlogExcerpt,
  getBlogId,
  getBlogImageUrl,
  getLocalizedText,
} from "@/lib/utils";

import "swiper/css";

interface RelatedProductsCarouselProps {
  products: Blog[];
  language: "vi" | "en";
}

const labels = {
  vi: {
    details: "Xem chi tiết",
  },
  en: {
    details: "Details",
  },
} as const;

export default function RelatedProductsCarousel({
  products,
  language,
}: RelatedProductsCarouselProps) {
  if (!products.length) {
    return null;
  }

  const text = labels[language];

  const canScroll = products.length > 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden"
    >
      <Swiper
        modules={[FreeMode, Mousewheel]}
        slidesPerView="auto"
        spaceBetween={16}
        grabCursor={canScroll}
        watchOverflow
        mousewheel={canScroll ? { forceToAxis: true, releaseOnEdges: true } : false}
        freeMode={{
          enabled: true,
          sticky: false,
          momentum: true,
          momentumRatio: 0.45,
          momentumVelocityRatio: 0.7,
        }}
        className="pb-2"
      >
        {products.map((product) => {
          const productTitle = getLocalizedText(
            product.title,
            product.title_en,
            language
          );
          const description = getBlogExcerpt(product, language, 100);
          const imageUrl = getBlogImageUrl(product);

          return (
            <SwiperSlide key={getBlogId(product)} className="!w-[260px] md:!w-[290px] xl:!w-[320px]">
              <Link
                href={`/blog/${product.slug}`}
                className="group flex h-full min-h-[320px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-44 overflow-hidden bg-gray-100 p-4">
                  {imageUrl ? (
                    <OptimizedImage
                      src={imageUrl}
                      alt={productTitle}
                      preset="product"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <svg
                        className="h-14 w-14"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h4 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-primary-700">
                    {productTitle}
                  </h4>
                  {description && (
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">{description}</p>
                  )}

                  <span className="mt-auto inline-flex items-center text-sm font-medium text-primary-700">
                    {text.details}
                    <svg
                      className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
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
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </motion.div>
  );
}
