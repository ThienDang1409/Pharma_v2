"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ImageItem {
  id: string;
  url: string;
  caption: string;
}

interface PublicImageSliderProps {
  images: ImageItem[];
  autoplay?: boolean;
  showPagination?: boolean;
}

export default function PublicImageSlider({
  images,
  autoplay = false,
  showPagination = true
}: PublicImageSliderProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="public-image-slider overflow-hidden group">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={images.length > 1}
        autoplay={autoplay ? {
          delay: 4000,
          disableOnInteraction: false,
        } : false}
        navigation={{
          prevEl: ".slider-prev",
          nextEl: ".slider-next",
        }}
        pagination={showPagination ? {
          clickable: true,
          dynamicBullets: true,
        } : false}
        className="aspect-video w-full"
      >
        {images.map((item, index) => (
          <SwiperSlide key={item.id || index}>
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={item.url}
                alt={item.caption || "Slide image"}
                className="max-w-full max-h-full object-contain"
              />
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-6  text-center">
                  <p className="text-white text-lg font-medium drop-shadow-md">
                    {item.caption}
                  </p>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}

        {images.length > 1 && (
          <>
            <button className="slider-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 text-gray-900 shadow-xl flex items-center justify-center hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="slider-next absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 text-gray-900 shadow-xl flex items-center justify-center hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </Swiper>
    </div>
  );
}
