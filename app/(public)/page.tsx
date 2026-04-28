import type { Metadata } from "next";
import BlogSlider from "../components/home/BlogSlider";
import CompanyBanner from "../components/home/CompanyBanner";
import ProductCategories from "../components/home/ProductCategories";
import FeaturedProducts from "../components/home/FeaturedProducts";
import LatestNews from "../components/home/LatestNews";
import ConnectSection from "../components/home/ConnectSection";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getCurrentLanguageFromRequest } from "@/lib/seo/language";
import { getSeoRouteCopy } from "@/lib/seo/copy";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getCurrentLanguageFromRequest();
  const copy = getSeoRouteCopy(language);

  return buildPageMetadata({
    title: copy.homeTitle,
    description: copy.homeDescription,
    path: "/",
    language,
  });
}

export default function Home() {
  return (
    <>
      <BlogSlider />
      <CompanyBanner />
      <ProductCategories />
      <FeaturedProducts />
      <LatestNews />
      <ConnectSection />
    </>
  );
}
