"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { informationApi, Information, blogApi, Blog } from "@/lib/api";
import { useLanguage } from "@/app/context/LanguageContext";
import { getLocalizedText } from "@/lib/utils/i18n";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

// Translation dictionary
const translations = {
  en: enTranslations,
  vi: viTranslations,
};

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const [categories, setCategories] = useState<Information[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [headerHeight, setHeaderHeight] = useState(140);
  const [categoryBlogs, setCategoryBlogs] = useState<Record<string, Blog[]>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileOpenSubmenu, setMobileOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, [isSearchOpen]);

  useEffect(() => {
    return () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
    };
  }, [closeTimeout]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide header unless search is open
        if (!isSearchOpen) {
          setIsHeaderVisible(false);
        }
      } else {
        // Scrolling up - always show header
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isSearchOpen]);

  const fetchCategories = async () => {
    try {
      const response = await informationApi.getAll();
      // Response is the array directly
      setCategories(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  const fetchBlogsForCategory = async (categoryId: string) => {
    // Skip if already fetched
    if (categoryBlogs[categoryId]) {
      return;
    }

    try {
      // Use blogApi from lib/api.ts
      const response = await blogApi.getAll({
        informationId: categoryId,
        status: 'published',
        limit: 10
      });
      
      // Handle both paginated and non-paginated responses
      const blogs = 'data' in response ? response.data : response;
      
      setCategoryBlogs(prev => ({
        ...prev,
        [categoryId]: Array.isArray(blogs) ? blogs : []
      }));
    } catch (err) {
      console.error("Error fetching blogs for category:", err);
      setCategoryBlogs(prev => ({
        ...prev,
        [categoryId]: []
      }));
    }
  };

  // Get root categories (no parentId or parentId is null)
  const rootCategories = categories.filter(
    (cat) => (!cat.parentId || cat.parentId === null || cat.parentId === "null") && cat.slug !== "other"
  );

  // Get children of a category
  const getChildren = (parentId: string) => {
    return categories.filter((cat) => cat.parentId === parentId);
  };

  // Recursive function to render nested categories with indentation
  const renderNestedCategories = (parentId: string, level: number = 0): React.ReactElement[] => {
    const children = getChildren(parentId);
    const result: React.ReactElement[] = [];

    children.forEach((child) => {
      const grandChildren = getChildren(child._id);
      
      result.push(
        <div key={child._id} style={{ paddingLeft: `${level * 20}px` }} className="mb-2">
          <Link
            href={`/category/${child.slug}`}
            className="flex items-center gap-2 text-gray-700 hover:text-secondary-800 transition-colors group"
          >
            {level === 0 && child.image && (
              <div className="w-12 h-12 relative shrink-0 overflow-hidden rounded-md">
                <Image
                  src={child.image}
                  alt={getLocalizedText(child.name, child.name_en, language)}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform"
                />
              </div>
            )}
            <span className={`${level === 0 ? 'font-semibold' : 'text-sm'}`}>
              {level > 0 && '› '}
              {getLocalizedText(child.name, child.name_en, language)}
            </span>
          </Link>
          {grandChildren.length > 0 && (
            <div className="mt-1">
              {renderNestedCategories(child._id, level + 1)}
            </div>
          )}
        </div>
      );
    });

    return result;
  };

  const handleToggleLanguage = () => {
    toggleLanguage();
  };

  const t = translations[language];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleMouseEnter = (categoryId: string, hasChildren: boolean) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setOpenDropdown(categoryId);
    
    // If category has no children, fetch blogs
    if (!hasChildren) {
      fetchBlogsForCategory(categoryId);
    }
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setOpenDropdown(null);
    }, 150); // 150ms delay
    setCloseTimeout(timeout);
  };

  const toggleMobileSubmenu = (categoryId: string) => {
    setMobileOpenSubmenu(mobileOpenSubmenu === categoryId ? null : categoryId);
  };

  // ==================== MOBILE VERSION ====================
  const renderMobileHeader = () => (
    <header
      ref={headerRef}
      className="md:hidden bg-white shadow-sm top-0 z-50 sticky"
    >
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Search Icon - Left */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Search"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Logo - Center */}
        <Link href="/" className="absolute left-1/2 transform -translate-x-1/2">
          <Image
            src="/images/logo_pharma_test.svg"
            alt="Pharma Test Logo"
            width={100}
            height={80}
          />
        </Link>

        {/* Hamburger Menu - Right */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors z-50"
          aria-label="Menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder={t.header.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary-800 focus:ring-1 focus:ring-secondary-800"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary-900 text-white rounded-lg hover:bg-secondary-800 transition-colors font-medium"
            >
              {t.header.search}
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Sliding Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Language & Company Info */}
          <div className="mb-6 pt-8 pb-4 border-b border-gray-200">
            <button
              onClick={handleToggleLanguage}
              className="flex items-center gap-2 text-gray-700 hover:text-secondary-800 transition-colors mb-3 w-full"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-lg">{language.toUpperCase()}</span>
            </button>
            <div className="text-gray-700">
              <span className="font-semibold">{t.header.company}</span>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="space-y-2">
            {rootCategories.map((category) => {
              const children = getChildren(category._id);
              const hasChildren = children.length > 0;
              const isOpen = mobileOpenSubmenu === category._id;

              return (
                <div key={category._id} className="border-b border-gray-100 pb-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/category/${category.slug}`}
                      className="flex-1 py-3 text-gray-800 hover:text-secondary-800 font-medium transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {getLocalizedText(category.name, category.name_en, language)}
                    </Link>
                    
                    {/* Toggle button for both hasChildren and no children */}
                    <button
                      onClick={() => {
                        toggleMobileSubmenu(category._id);
                        if (!hasChildren && !categoryBlogs[category._id]) {
                          fetchBlogsForCategory(category._id);
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <svg
                        className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Submenu for categories with children */}
                  {hasChildren && isOpen && (
                    <div className="pl-4 space-y-1 mt-2">
                      {children.map((child) => (
                        <Link
                          key={child._id}
                          href={`/category/${child.slug}`}
                          className="block py-2 text-sm text-gray-600 hover:text-secondary-800 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          › {getLocalizedText(child.name, child.name_en, language)}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Blogs list for categories without children */}
                  {!hasChildren && isOpen && categoryBlogs[category._id] && categoryBlogs[category._id].length > 0 && (
                    <div className="pl-4 space-y-1 mt-2 max-h-48 overflow-y-auto">
                      {categoryBlogs[category._id].map((blog) => (
                        <Link
                          key={blog._id}
                          href={`/blog/${blog.slug}`}
                          className="block py-2 text-sm text-gray-600 hover:text-secondary-800 transition-colors truncate"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                           {getLocalizedText(blog.title, blog.title_en, language)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="bg-primary-900 h-2"></div>
    </header>
  );

  // ==================== DESKTOP VERSION ====================
  const renderDesktopHeader = () => (
    <header
      ref={headerRef}
      className={`hidden md:block bg-white shadow-sm top-0 z-50 sticky transition-all duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      onMouseEnter={() => setIsHeaderVisible(true)}
    >
      <div className="container w-[70%] mx-auto">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo_pharma_test.svg"
              alt="Pharma Test Logo"
              width={130}
              height={110}
              className=""
            />
          </Link>



          {/* Right side - Language, Phone and Login */}
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <button
                onClick={handleToggleLanguage}
                className="flex items-center text-sm text-gray-700 hover:text-secondary-800 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">{language.toUpperCase()}</span>
              </button>

              <div className="text-sm text-gray-700">
                <span className="font-semibold">{t.header.company}</span>
              </div>
              <button className="md:hidden">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center">
              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                {rootCategories.map((category) => {
                  const children = getChildren(category._id);
                  const hasChildren = children.length > 0;
                  const isProduct = category.slug === "products" || category.name.toLowerCase().includes("products");
                  const isContact = category.slug === "contact" || category.name.toLowerCase().includes("liên hệ");

                  return (
                    <div
                      key={category._id}
                      className="relative"
                      onMouseEnter={() => handleMouseEnter(category._id, hasChildren)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Link
                        href={`/category/${category.slug}`}
                        className="text-gray-700 hover:text-secondary-800 text-sm uppercase font-medium transition-colors block py-2"
                      >
                        {getLocalizedText(category.name, category.name_en, language)}
                      </Link>

                      {/* Product Dropdown - Full width with grid layout */}
                      {isProduct && hasChildren && openDropdown === category._id && (
                        <div 
                          className="fixed left-0 right-0 z-50 pt-0"
                          style={{ top: `${headerHeight}px` }}
                          onMouseEnter={() => handleMouseEnter(category._id, hasChildren)}
                          onMouseLeave={handleMouseLeave}
                        >
                            <div className="bg-white shadow-2xl">
                              <div className="container mx-auto px-4 py-8">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                  {renderNestedCategories(category._id)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Blog Dropdown - When category has no children */}
                      {!hasChildren && openDropdown === category._id && (
                        <div 
                          className="fixed left-0 right-0 z-50 pt-0"
                          style={{ top: `${headerHeight}px` }}
                          onMouseEnter={() => handleMouseEnter(category._id, hasChildren)}
                          onMouseLeave={handleMouseLeave}
                        >
                            <div className="bg-white shadow-2xl">
                              <div className="flex min-h-[350px]">
                                {/* Left side - Background Image (3/4 width) */}
                                <div 
                                  className="w-3/4 bg-cover bg-center relative"
                                  style={{ 
                                    backgroundImage: category.image 
                                      ? `url(${category.image})` 
                                      : "url('/images/default-dropdown-bg.jpg')" 
                                  }}
                                >
                                  <div className="absolute inset-0 bg-linear-to-r from-black/80 to-transparent"></div>
                                </div>
                                
                                {/* Right side - Blog List (1/4 width) */}
                                <div className="w-1/4 bg-white p-6 overflow-y-auto max-h-[500px]">
                                  <h3 className="text-lg font-bold text-primary-900 mb-4">{getLocalizedText(category.name, category.name_en, language)}</h3>
                                  {categoryBlogs[category._id] && categoryBlogs[category._id].length > 0 ? (
                                    categoryBlogs[category._id].map((blog) => (
                                      <Link
                                        key={blog._id}
                                        href={`/blog/${blog.slug}`}
                                        className="block py-2 text-sm text-gray-700 hover:text-secondary-800 hover:translate-x-1 transition-all"
                                      >
                                        › {getLocalizedText(blog.title, blog.title_en, language)}
                                      </Link>
                                    ))
                                  ) : categoryBlogs[category._id] ? (
                                    <p className="text-sm text-gray-500 italic">{t.common.noArticles}</p>
                                  ) : (
                                    <p className="text-sm text-gray-500 italic">{t.common.loading}</p>
                                  )}
                                </div>
                              </div>
                          </div>
                        </div>
                      )}

                      {/* Contact Dropdown - Image + Menu + Contact Info */}
                      {isContact && hasChildren && openDropdown === category._id && (
                        <div 
                          className="fixed left-0 right-0 z-50 pt-0"
                          style={{ top: `${headerHeight}px` }}
                          onMouseEnter={() => handleMouseEnter(category._id, hasChildren)}
                          onMouseLeave={handleMouseLeave}
                        >
                            <div className="bg-white shadow-2xl">
                              <div className="flex min-h-[400px]">
                                {/* Left side - Background Image (3/4 width) */}
                                <div 
                                  className="w-3/4 bg-cover bg-center relative"
                                  style={{ backgroundImage: "url('/images/contact-bg.jpg')" }}
                                >
                                  <div className="absolute inset-0 bg-primary-900/20"></div>
                                </div>
                                
                                {/* Right side - Menu + Contact Info (1/4 width) */}
                                <div className="w-1/4 bg-white p-6 flex flex-col">
                                  {/* Menu Items */}
                                  <div className="flex-1">
                                    <h3 className="text-lg font-bold text-primary-900 mb-4">{getLocalizedText(category.name, category.name_en, language)}</h3>
                                    {children.map((child) => (
                                      <Link
                                        key={child._id}
                                        href={`/category/${child.slug}`}
                                        className="block py-2 text-sm text-gray-700 hover:text-secondary-800 hover:translate-x-1 transition-all"
                                      >
                                        › {getLocalizedText(child.name, child.name_en, language)}
                                      </Link>
                                    ))}
                                  </div>

                                  {/* Contact Info */}
                                  <div className="border-t border-gray-200 pt-4 mt-4">
                                    <p className="text-sm text-gray-600 mb-2">
                                      📧 contact@pharmatest.com
                                    </p>
                                    <p className="text-sm text-gray-600 mb-4">
                                      📞 +84 123 456 789
                                    </p>
                                    
                                    {/* Social Media Icons */}
                                    <div className="flex gap-3">
                                      <a href="#" className="w-8 h-8 rounded-full bg-third-100 flex items-center justify-center hover:bg-secondary-500 hover:text-white transition-colors">
                                        <span className="text-sm">f</span>
                                      </a>
                                      <a href="#" className="w-8 h-8 rounded-full bg-third-100 flex items-center justify-center hover:bg-secondary-500 hover:text-white transition-colors">
                                        <span className="text-sm">in</span>
                                      </a>
                                      <a href="#" className="w-8 h-8 rounded-full bg-third-100 flex items-center justify-center hover:bg-secondary-500 hover:text-white transition-colors">
                                        <span className="text-sm">tw</span>
                                      </a>
                                      <a href="#" className="w-8 h-8 rounded-full bg-third-100 flex items-center justify-center hover:bg-secondary-500 hover:text-white transition-colors">
                                        <span className="text-sm">yt</span>
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* General Dropdown - Image (3/4) + Menu (1/4) */}
                      {!isProduct && !isContact && hasChildren && openDropdown === category._id && (
                        <div 
                          className="fixed left-0 right-0 z-50 pt-0"
                          style={{ top: `${headerHeight}px` }}
                          onMouseEnter={() => handleMouseEnter(category._id, hasChildren)}
                          onMouseLeave={handleMouseLeave}
                        >
                            <div className="bg-white shadow-2xl">
                              <div className="flex min-h-[350px]">
                                {/* Left side - Background Image (3/4 width) */}
                                <div 
                                  className="w-3/4 bg-cover bg-center relative"
                                  style={{ 
                                    backgroundImage: category.image 
                                      ? `url(${category.image})` 
                                      : "url('/images/default-dropdown-bg.jpg')" 
                                  }}
                                >
                                  <div className="absolute inset-0 bg-linear-to-r from-black/80 to-transparent"></div>
                                </div>
                                
                                {/* Right side - Menu (1/4 width) */}
                                <div className="w-1/4 bg-white p-6">
                                  <h3 className="text-lg font-bold text-primary-900 mb-4">{getLocalizedText(category.name, category.name_en, language)}</h3>
                                  {children.map((child) => (
                                    <Link
                                      key={child._id}
                                      href={
                                        category.slug === "news"
                                          ? `/news/category/${child.slug}`
                                          : `/category/${child.slug}`
                                      }
                                      className="block py-2 text-sm text-gray-700 hover:text-secondary-800 hover:translate-x-1 transition-all"
                                    >
                                      › {getLocalizedText(child.name, child.name_en, language)}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Search Icon */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="ml-6 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                aria-label="Search"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="bg-gray-50 border-t border-gray-200 transition-all duration-300">
          <div className="container mx-auto px-4 py-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder={t.header.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary-800 focus:ring-1 focus:ring-secondary-800"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary-900 text-white rounded-lg hover:bg-secondary-800 transition-colors font-medium"
              >
                {t.header.search}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-primary-900 h-4"></div>
    </header>
  );

  // ==================== MAIN RETURN ====================
  return (
    <>
      {renderMobileHeader()}
      {renderDesktopHeader()}
    </>
  );
} 
