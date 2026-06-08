import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/app/context/LanguageContext";
import { AuthProvider } from "@/app/context/AuthContext";
import { ToastProvider } from "@/app/context/ToastContext";
import ToastContainer from "@/app/components/common/ToastContainer";
import SmoothScroll from "@/app/components/common/SmoothScroll";
import GoogleAnalytics from "@/app/components/analytics/GoogleAnalytics";
import { siteMetadataBase } from "@/lib/seo/site";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getCurrentLanguageFromRequest } from "@/lib/seo/language";
import { getSeoRouteCopy } from "@/lib/seo/copy";
import { buildOrganizationJsonLd } from "@/lib/seo/schema";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguageFromRequest();
  const copy = getSeoRouteCopy(language);

  const localizedMetadata = buildPageMetadata({
    title: copy.homeTitle,
    description: copy.homeDescription,
    path: "/",
    language,
  });

  return {
    ...localizedMetadata,
    metadataBase: siteMetadataBase,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = await getCurrentLanguageFromRequest();
  const googleTagId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-L2V5M26ZWZ";
  const organizationJsonLd = JSON.stringify(
    buildOrganizationJsonLd(language)
  ).replace(/</g, "\\u003c");

  return (
    <html lang={language}>
      <body className="font-sans antialiased">
        <SmoothScroll />
        <ToastProvider>
          <AuthProvider>
            <LanguageProvider initialLanguage={language}>
              <GoogleAnalytics measurementId={googleTagId} />
              {children}
              <ToastContainer />
            </LanguageProvider>
          </AuthProvider>
        </ToastProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
        />
      </body>
    </html>
  );
}
