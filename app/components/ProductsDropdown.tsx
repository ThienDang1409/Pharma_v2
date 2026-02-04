"use client";

import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

const translations = {
  en: enTranslations,
  vi: viTranslations,
};

interface ProductsDropdownProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function ProductsDropdown({
  onMouseEnter,
  onMouseLeave,
}: ProductsDropdownProps) {
  const { language } = useLanguage();
  const t = translations[language];
  return (
    <div
      className="fixed left-0 right-0 top-14 z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-white border-t-4 border-red-700 shadow-xl">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 p-8">
            {/* Left Column - Galenic Instruments */}
            <div>
              <div className="mb-6">
                <div className="relative h-32 bg-linear-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-40">💊</span>
                  </div>
                </div>
                <Link
                  href="/products/galenic-instruments"
                  className="text-lg font-bold text-gray-800 hover:text-red-600 flex items-center gap-2"
                >
                  <span className="text-red-600">›</span>
                  Galenic Instruments
                </Link>
              </div>
              <ul className="space-y-2 ml-4">
                <li>
                  <Link
                    href="/products/tablet-disintegration"
                    className="text-sm text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Tablet Disintegration Testing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/suppository-testing"
                    className="text-sm text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Suppository Testing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/tablet-hardness"
                    className="text-sm text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Tablet Hardness Testing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/ampoule-testing"
                    className="text-sm text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Ampoule Testing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/tablet-friability"
                    className="text-sm text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Tablet Friability Testing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/powder-testing"
                    className="text-sm text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Powder Testing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/leak-testing"
                    className="text-sm text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Leak Testing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Right Column - Dissolution Testing */}
            <div>
              <div className="mb-6">
                <div className="relative h-32 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-40">🧪</span>
                  </div>
                </div>
                <Link
                  href="/products/dissolution-testing"
                  className="text-lg font-bold text-gray-800 hover:text-red-600 flex items-center gap-2"
                >
                  <span className="text-red-600">›</span>
                  Dissolution Testing
                </Link>
              </div>
              <ul className="space-y-2 ml-4">
                <li>
                  <Link
                    href="/products/tablet-dissolution"
                    className="text-sm text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Tablet Dissolution Testing Instruments
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/offline-dissolution"
                    className="text-sm text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Offline Automated Dissolution Systems
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/online-dissolution"
                    className="text-sm text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Online Automated Dissolution Systems
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/media-preparation"
                    className="text-sm text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Media Preparation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/uv-vis-spectrometers"
                    className="text-sm text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    UV/VIS Spectrometers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Link */}
        <div className="border-t border-gray-200 p-4 text-center">
          <Link
            href="/products"
            className="text-sm text-gray-700 hover:text-red-600 flex items-center justify-center gap-2"
          >
            <span className="text-red-600">›</span>
            {t.pages.overviewAllProducts}
          </Link>
        </div>
      </div>
    </div>
  );
}
