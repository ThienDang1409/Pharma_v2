"use client";

import { useEffect, useRef, useState } from "react";

export default function BackToTop() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const showBackToTopRef = useRef(false);
  const tickingRef = useRef(false);

  // Show button when page is scrolled down
  useEffect(() => {
    let rafId = 0;

    const updateVisibility = () => {
      const shouldShow = window.scrollY > 300;
      if (shouldShow !== showBackToTopRef.current) {
        showBackToTopRef.current = shouldShow;
        setShowBackToTop(shouldShow);
      }
      tickingRef.current = false;
    };

    const handleScroll = () => {
      if (tickingRef.current) {
        return;
      }

      tickingRef.current = true;
      rafId = window.requestAnimationFrame(updateVisibility);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      tickingRef.current = false;
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!showBackToTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 border-2 border-primary-900 bg-white p-3 text-primary-900 rounded-full shadow-lg transition-all duration-300 hover:bg-primary-800 hover:text-white hover:shadow-xl group cursor-pointer"
      aria-label="Back to top"
    >
      <svg
        className="w-6 h-6 group-hover:-translate-y-1 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}
