"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

const translations = {
  en: enTranslations,
  vi: viTranslations,
};

export default function HeroSlider() {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const t = translations[language];

  const slides = [
    {
      title: "On/Offline Dissolution System:",
      subtitle: "Amazing Flexibility Yet",
      subtitle2: "Accurate Results either Way",
      buttonText: t.pages.readMore,
      image: "/dissolution-system.jpg",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative bg-gradient-to-b from-gray-100 to-gray-200 overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left side - Text content */}
          <div className="flex-1 max-w-xl">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-700 mb-4">
              {slides[currentSlide].title}
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-2">
              {slides[currentSlide].subtitle}
            </h2>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-8">
              {slides[currentSlide].subtitle2}
            </h2>
            <button className="bg-primary-900 text-white px-8 py-3 rounded hover:bg-primary-800 transition-colors font-semibold">
              {slides[currentSlide].buttonText}
            </button>
          </div>

          {/* Right side - Product image */}
          <div className="flex-1 relative">
            <div className="relative w-full h-[400px] flex items-center justify-center">
              {/* Placeholder for product images */}
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-8 shadow-xl">
                <div className="flex items-center gap-4">
                  {/* Main dissolution equipment */}
                  <div className="w-64 h-48 bg-white rounded-lg shadow-lg flex items-center justify-center">
                    <div className="text-gray-700 text-center">
                      <div className="text-6xl mb-2">⚗️</div>
                      <p className="text-sm">Dissolution System</p>
                    </div>
                  </div>
                  {/* Additional equipment */}
                  <div className="flex flex-col gap-4">
                    <div className="w-32 h-20 bg-white rounded-lg shadow-lg flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="w-32 h-20 bg-white rounded-lg shadow-lg flex items-center justify-center">
                      <span className="text-2xl">🔬</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
          aria-label="Previous slide"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
          aria-label="Next slide"
        >
          <svg
            className="w-6 h-6"
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
        </button>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "bg-primary" : "bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
