"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

const EXCLUDED_PATH_PREFIXES = ["/admin", "/auth", "/profile"];

function isExcludedPath(pathname: string | null): boolean {
  if (!pathname) return true;

  return EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

export default function GoogleAnalytics({
  measurementId,
}: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAdmin, isLoading } = useAuth();
  const lastTrackedPathRef = useRef<string | null>(null);
  const shouldTrack =
    Boolean(measurementId) && !isLoading && !isAdmin && !isExcludedPath(pathname);

  useEffect(() => {
    if (!measurementId) return;

    window[`ga-disable-${measurementId}`] = !shouldTrack;
  }, [measurementId, shouldTrack]);

  useEffect(() => {
    if (!shouldTrack || typeof window.gtag !== "function") return;

    const queryString = searchParams.toString();
    const pagePath = `${pathname}${queryString ? `?${queryString}` : ""}`;

    if (!lastTrackedPathRef.current) {
      lastTrackedPathRef.current = pagePath;
      return;
    }

    if (lastTrackedPathRef.current === pagePath) {
      return;
    }

    lastTrackedPathRef.current = pagePath;

    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams, shouldTrack]);

  if (!shouldTrack) {
    return null;
  }

  return (
    <>
      <Script
        id="google-analytics-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
          gtag('event', 'page_view', {
            page_path: window.location.pathname + window.location.search,
            page_location: window.location.href,
            page_title: document.title,
          });
        `}
      </Script>
    </>
  );
}
