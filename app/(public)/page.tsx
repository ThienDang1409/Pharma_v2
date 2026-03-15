import BlogSlider from "../components/home/BlogSlider";
import CompanyBanner from "../components/home/CompanyBanner";
import ProductCategories from "../components/home/ProductCategories";
import LatestNews from "../components/home/LatestNews";
import ConnectSection from "../components/home/ConnectSection";

export default function Home() {
  return (
    <>
      <BlogSlider />
      <CompanyBanner />
      <ProductCategories />
      <LatestNews />
      <ConnectSection />
    </>
  );
}
