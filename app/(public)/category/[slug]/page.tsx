"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { getLocalizedText } from "@/lib/utils/i18n";
import { informationApi, blogApi, Blog, Information } from "@/lib/api";
import { BLOG_STATUS } from "@/lib/constants/api";
import NewsCard from "@/app/components/NewsCard";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";
import ProductCard from "@/app/components/ProductCard";

const translations = {
  en: enTranslations,
  vi: viTranslations,
};

type Product = Blog;

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { language } = useLanguage();

  const [category, setCategory] = useState<Information | null>(null);
  const [allCategories, setAllCategories] = useState<Information[]>([]);
  const [subcategories, setSubcategories] = useState<Information[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const t = translations[language];
  
  // Get root parent category to determine type
  const getRootParent = (cat: Information | null): Information | null => {
    if (!cat) return null;
    let root = cat;
    let current: Information | undefined = cat;
    
    while (current) {
      root = current;
      current = allCategories.find((c) => c._id === current?.parentId);
    }
    
    return root;
  };
  
  const rootCategory = getRootParent(category);
  
  // Detect if this is a news or products category based on root parent
  const isNewsCategory = rootCategory?.slug.includes('news') || false;
  const isProductsCategory = rootCategory?.slug.includes('products') || false;
  const hasSubcategories = subcategories.length > 0;
  
  // News categories show 10 items per page (1 featured + 9 grid), others show 12
  const productsPerPage = isNewsCategory && !hasSubcategories ? 10 : 12;

  useEffect(() => {
    if (slug) {
      fetchCategoryData();
    }
  }, [slug, selectedSubcategory]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);

      // Fetch all categories
      const categoriesResponse = await informationApi.getAll();
      const categoriesData = categoriesResponse.data?.items || [];
      setAllCategories(categoriesData);

      // Find current category by slug
      const currentCategory = categoriesData.find((cat) => cat.slug === slug);
      if (!currentCategory) {
        return;
      }
      setCategory(currentCategory);

      // Get direct children (subcategories)
      const children = categoriesData.filter(
        (cat) => cat.parentId === currentCategory._id
      );
      setSubcategories(children);

      // Fetch products (which are blogs) from this category and all descendants
      const productsResponse = await blogApi.getAll({
        informationId: currentCategory._id,
        includeDescendants: true,
        status: BLOG_STATUS.PUBLISHED
      });
      const allProducts = productsResponse.data?.items || [];

      // If subcategory is selected, filter to show only products from that branch
      let filteredProducts = allProducts;

      if (selectedSubcategory) {
        // Fetch products for selected subcategory with descendants
        const subProductsResponse = await blogApi.getAll({
          informationId: selectedSubcategory,
          includeDescendants: true,
          status: BLOG_STATUS.PUBLISHED
        });
        filteredProducts = subProductsResponse.data?.items || [];
      }

      setProducts(filteredProducts);
    } catch (error) {
      console.error("Error fetching category data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get all descendant category IDs (recursive)
  const getAllDescendantIds = (
    categoryId: string,
    allCategories: Information[]
  ): string[] => {
    const children = allCategories.filter((cat) => cat.parentId === categoryId);
    let descendantIds: string[] = [];

    children.forEach((child) => {
      descendantIds.push(child._id);
      descendantIds = descendantIds.concat(
        getAllDescendantIds(child._id, allCategories)
      );
    });

    return descendantIds;
  };

  // Get breadcrumb path
  const getBreadcrumbPath = (): Information[] => {
    if (!category) return [];
    const path: Information[] = [];
    let current: Information | undefined = category;

    while (current) {
      path.unshift(current);
      current = allCategories.find((cat) => cat._id === current?.parentId);
    }

    return path;
  };

  const breadcrumbPath = getBreadcrumbPath();

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleSubcategoryClick = (subcategory: Information) => {
    // Check if this subcategory has children
    const hasChildren = allCategories.some((cat) => cat.parentId === subcategory._id);
    
    if (hasChildren) {
      // Navigate to subcategory page if it has children
      window.location.href = `/category/${subcategory.slug}`;
    } else {
      // Filter products if it's a leaf category
      setSelectedSubcategory(subcategory._id === selectedSubcategory ? null : subcategory._id);
      setCurrentPage(1);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary-600"></div>
          <p className="mt-4 text-gray-600">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.pages.categoryNotFound}</h1>
          <Link href="/" className="text-primary-600 hover:underline">
            {t.pages.returnToHomepage}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative w-full h-[600px] bg-gray-100 overflow-hidden">
        {category.image && (
          <img
            src={category.image}
            alt={getLocalizedText(category.name, category.name_en, language)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-white/40" />
        
        {/* Title */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6 md:px-30">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 max-w-3xl">
              {getLocalizedText(category.name, category.name_en, language)}
            </h1>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-third-500 py-4 shadow-sm">
        <div className="container mx-auto px-6 md:px-30">
          <div className="flex items-center gap-2 text-white text-sm md:text-base flex-wrap">
            <Link href="/" className="hover:underline font-medium">
              {t.common.home}
            </Link>
            {breadcrumbPath.map((cat, index) => (
              <div key={cat._id} className="flex items-center gap-2">
                <span className="text-white/80">›</span>
                {index === breadcrumbPath.length - 1 ? (
                  <span className="font-medium">{getLocalizedText(cat.name, cat.name_en, language)}</span>
                ) : (
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:underline font-medium"
                  >
                    {getLocalizedText(cat.name, cat.name_en, language)}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 md:px-30 py-12">
        {!isNewsCategory && (
          <div className="mb-4 mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4">
              {getLocalizedText(category.name, category.name_en, language)}
            </h2>
          </div>
        )}
        {/* Description */}
        {!isNewsCategory && category.description && (
          <div className="mb-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">{getLocalizedText(category.description, category.description_en, language)}</p>
            </div>
          </div>
        )}

        {/* Subcategories Filter Grid */}
        {subcategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.pages.categories}</h2>
            <div className="flex flex-wrap gap-3">
              {subcategories.map((subcat) => {
                return (
                  <button
                    key={subcat._id}
                    onClick={() => handleSubcategoryClick(subcat)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 uppercase text-sm ${
                      selectedSubcategory === subcat._id
                        ? "bg-primary-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {getLocalizedText(subcat.name, subcat.name_en, language)}
                  </button>
                );
              })}
            </div>
            {selectedSubcategory && (
              <button
                onClick={() => {
                  setSelectedSubcategory(null);
                  setCurrentPage(1);
                }}
                className="mt-4 text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                ✕ {t.pages.clearFilter}
              </button>
            )}
          </div>
        )}

        {/* Products/News Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isProductsCategory ? t.pages.products : t.pages.latestNews}
              {selectedSubcategory && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({products.length} items)
                </span>
              )}
            </h2>
            {!selectedSubcategory && (
              <p className="text-gray-600">
                {products.length} {isProductsCategory ? t.common.products : t.common.articles} {t.common.found}
              </p>
            )}
          </div>

          {currentProducts.length > 0 ? (
            <>
              {/* Featured Post for News Categories (Page 1 Only) */}
              {isNewsCategory && !hasSubcategories && currentPage === 1 && currentProducts[0] && (
                <Link
                  href={`/blog/${currentProducts[0].slug}`}
                  className="block mb-8"
                >
                  <div className="grid md:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all">
                    <div className="relative h-100 bg-gray-100">
                      {currentProducts[0].image ? (
                        <img
                          src={currentProducts[0].image}
                          alt={currentProducts[0].title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <p className="text-gray-700 text-sm mb-2">
                        {new Date((currentProducts[0] as any).createdAt || Date.now()).toLocaleDateString('en-US', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 group-hover:text-primary-600 transition-colors">
                        {currentProducts[0].title}
                      </h3>
                      <p className="text-gray-600 mb-6 line-clamp-4">
                        {currentProducts[0].sections?.[0]?.content
                          ?.replace(/<[^>]*>/g, '')
                          .substring(0, 200) || t.pages.noDescription}
                      </p>
                      <span className="text-primary-900 hover:text-primary-800 font-semibold flex items-center gap-2">
                        → {t.pages.readMore}
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Products/News Grid */}
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                  isNewsCategory && !hasSubcategories
                    ? 'lg:grid-cols-3'
                    : 'lg:grid-cols-3 xl:grid-cols-4'
                } gap-6`}
              >
                {currentProducts
                  .slice(isNewsCategory && !hasSubcategories && currentPage === 1 ? 1 : 0)
                  .map((product) => (
                    isNewsCategory && !hasSubcategories ? (
                      <NewsCard 
                        key={product._id} 
                        article={product as any} 
                        formatDate={formatDate}
                      />
                    ) : (
                      <ProductCard key={product._id} product={product} />
                    )
                  ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 border rounded-lg transition-colors ${
                            currentPage === page
                              ? "bg-primary-600 text-white border-primary-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-5xl mb-3">
                {isNewsCategory && !hasSubcategories ? '📰' : '📦'}
              </div>
              <p className="text-gray-600 text-lg">
                {t.pages.noResultsFound}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
