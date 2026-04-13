"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { informationApi, Information, blogApi, Blog } from "@/lib/api";
import { useLanguage } from "@/app/context/LanguageContext";
import { getLocalizedText } from "@/lib/utils/string/i18n";
import { extractImageUrl } from "@/lib/utils/image/image-handler";
import { apiFetch } from "@/lib/utils/api/apiHelper";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

// Translation dictionary
const translations = {
  en: enTranslations,
  vi: viTranslations,
};

export default function Header() {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const [categories, setCategories] = useState<Information[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [categoryBlogs, setCategoryBlogs] = useState<Record<string, Blog[]>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileOpenSubmenu, setMobileOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

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
    await apiFetch(
      () => informationApi.getAll(),
      {
        onSuccess: (data) => {
          setCategories(data?.items || []);
        },
        onError: () => setCategories([]),
      }
    );
  };

  const fetchBlogsForCategory = async (categoryId: string) => {
    // Skip if already fetched
    if (categoryBlogs[categoryId]) {
      return;
    }

    await apiFetch(
      () => blogApi.getAll({
        informationId: categoryId,
        status: 'published',
        limit: 10
      }),
      {
        onSuccess: (data) => {
          setCategoryBlogs(prev => ({
            ...prev,
            [categoryId]: data?.items || []
          }));
        },
        onError: () => {
          setCategoryBlogs(prev => ({
            ...prev,
            [categoryId]: []
          }));
        },
      }
    );
  };

  const fetchBlogsExactCategory = async (categoryId: string) => {
    // Skip if already fetched
    if (categoryBlogs[categoryId]) {
      return;
    }

    await apiFetch(
      () => blogApi.getAllExactCategory({
        informationId: categoryId,
        status: 'published',
        limit: 10
      }),
      {
        onSuccess: (data) => {
          setCategoryBlogs(prev => ({
            ...prev,
            [categoryId]: data?.items || []
          }));
        },
        onError: () => {
          setCategoryBlogs(prev => ({
            ...prev,
            [categoryId]: []
          }));
        },
      }
    );
  };

  // Get root categories (no parentId or parentId is null)
  // Exclude 'legal' and 'other' categories from public navigation
  const rootCategories = categories.filter(
    (cat) => (!cat.parentId || cat.parentId === null || cat.parentId === "null") && cat.slug !== "other" && cat.slug !== "legal"
  );

  // Get children of a category
  const getChildren = (parentId: string) => {
    return categories.filter((cat) => cat.parentId === parentId);
  };

  const getCategoryById = (id: string) => {
    return categories.find((cat) => cat._id === id);
  };

  const getDropdownImage = (item: Information, root: Information): string => {
    return (
      extractImageUrl(item.image) ||
      extractImageUrl(root.image) ||
      "/images/default-dropdown-bg.jpg"
    );
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
            {level === 0 && child.image?.cloudinaryUrl && (
              <div className="w-12 h-12 relative shrink-0 overflow-hidden rounded-md">
                <Image
                  src={child.image.cloudinaryUrl}
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

  const handleMouseEnter = (categoryId: string, hasChildren?: boolean) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setOpenDropdown(categoryId);

    const root = getCategoryById(categoryId);
    if (!root) {
      return;
    }

    const rootChildren = getChildren(root._id);

    // Case root has no child or only one child: fetch exact category blogs only (no descendants)
    if (rootChildren.length <= 1) {
      fetchBlogsExactCategory(root._id);
      // Backward compatibility for old call sites
      if (hasChildren === false) {
        fetchBlogsExactCategory(categoryId);
      }
      return;
    }

    // Preload blogs for leaf children (when root has multiple children)
    rootChildren.forEach((child) => {
      const grandChildren = getChildren(child._id);

      if (grandChildren.length === 0) {
        fetchBlogsForCategory(child._id);
        return;
      }

      grandChildren.forEach((grandChild) => {
        const greatGrandChildren = getChildren(grandChild._id);
        if (greatGrandChildren.length === 0) {
          fetchBlogsForCategory(grandChild._id);
        }
      });
    });
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
    <header className="md:hidden bg-white shadow-sm top-0 z-50 sticky">
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
            width={120}
            height={100}
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
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
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
                          key={blog.id}
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
      className={`hidden md:block bg-white shadow-sm top-0 z-50 sticky relative transition-all duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
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
              width={200}
              height={180}
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
                  const isOpen = openDropdown === category._id;
                  const directChildren = getChildren(category._id);
                  const rootBlogs = categoryBlogs[category._id];
                  const hasNoChildren = directChildren.length === 0;
                  const hasSingleChild = directChildren.length === 1;

                  return (
                    <div
                      key={category._id}
                      onMouseEnter={() => handleMouseEnter(category._id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div
                        className="text-gray-700 hover:text-secondary-800 text-sm uppercase font-medium transition-colors block py-2"
                      >
                        {getLocalizedText(category.name, category.name_en, language)}
                      </div>

                      {/* Dynamic Mega Dropdown */}
                      {isOpen && (
                        <div
                          className="absolute left-0 right-0 top-full -mt-px z-50"
                          onMouseEnter={() => handleMouseEnter(category._id)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="bg-[#ededed] shadow-2xl border-t border-[#d7d7d7]">
                            <div className="w-[92%] max-w-[1600px] mx-auto py-8 min-h-[440px]">
                              {hasNoChildren && (
                                <div className="flex gap-8 h-full">
                                  <div className="w-[64%] min-h-[360px] relative overflow-hidden">
                                    <Image
                                      src={getDropdownImage(category, category)}
                                      alt={getLocalizedText(category.name, category.name_en, language)}
                                      fill
                                      className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-white/35" />
                                  </div>

                                  <div className="w-[36%] px-4 py-3 border-y border-[#d1d1d1] self-center max-h-[360px] overflow-y-auto">
                                    <div className="space-y-3">
                                      {rootBlogs ? (
                                        rootBlogs.length > 0 ? (
                                          rootBlogs.map((blog) => (
                                            <Link
                                              key={blog.id}
                                              href={`/blog/${blog.slug}`}
                                              className="block text-xl leading-none font-light text-primary-900 hover:translate-x-1 transition-transform"
                                            >
                                              <span className="mr-3 align-middle">›</span>
                                              <span className="align-middle">{getLocalizedText(blog.title, blog.title_en, language)}</span>
                                            </Link>
                                          ))
                                        ) : (
                                          <p className="text-sm text-gray-500 italic">{t.common.noArticles}</p>
                                        )
                                      ) : (
                                        <p className="text-sm text-gray-500 italic">{t.common.loading}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {hasSingleChild && (
                                <div className="flex gap-8 h-full">
                                  {(() => {
                                    const child = directChildren[0];
                                    const grandChildren = getChildren(child._id);

                                    return (
                                      <div className="contents">
                                        <div className="w-[64%] min-h-[360px] relative overflow-hidden">
                                          <Image
                                            src={getDropdownImage(child, category)}
                                            alt={getLocalizedText(child.name, child.name_en, language)}
                                            fill
                                            className="object-cover"
                                          />
                                          <div className="absolute inset-0 bg-white/20" />
                                        </div>

                                        <div className="w-[36%] border-y border-[#d1d1d1] py-4 px-2 self-center max-h-[360px] overflow-y-auto">
                                          <div className="space-y-3">
                                            <Link
                                              href={`/category/${child.slug}`}
                                              className="block text-xl leading-none font-light text-primary-900 tracking-wide hover:translate-x-1 transition-transform"
                                            >
                                              <span className="mr-3 align-middle">›</span>
                                              <span className="align-middle">{getLocalizedText(child.name, child.name_en, language)}</span>
                                            </Link>

                                            {grandChildren.length > 0 && (
                                              <div className="space-y-2 pl-6 pb-2 border-b border-[#d1d1d1]">
                                                {grandChildren.map((grandChild) => (
                                                  <Link
                                                    key={grandChild._id}
                                                    href={`/category/${grandChild.slug}`}
                                                    className="block text-lg leading-none font-light text-gray-900 hover:translate-x-1 transition-transform"
                                                  >
                                                    <span className="mr-3 align-middle">›</span>
                                                    <span className="align-middle">{getLocalizedText(grandChild.name, grandChild.name_en, language)}</span>
                                                  </Link>
                                                ))}
                                              </div>
                                            )}

                                            {rootBlogs ? (
                                              rootBlogs.length > 0 ? (
                                                rootBlogs.map((blog) => (
                                                  <Link
                                                    key={blog.id}
                                                    href={`/blog/${blog.slug}`}
                                                    className="block text-xl leading-none font-light text-gray-900 hover:translate-x-1 transition-transform"
                                                  >
                                                    <span className="mr-3 align-middle">›</span>
                                                    <span className="align-middle">{getLocalizedText(blog.title, blog.title_en, language)}</span>
                                                  </Link>
                                                ))
                                              ) : (
                                                <p className="text-sm text-gray-500 italic">{t.common.noArticles}</p>
                                              )
                                            ) : (
                                              <p className="text-sm text-gray-500 italic">{t.common.loading}</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}

                              {!hasNoChildren && !hasSingleChild && (
                                <div className={`grid gap-6 ${directChildren.length >= 4 ? "grid-cols-4" : directChildren.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                                  {directChildren.map((child) => {
                                    const grandChildren = getChildren(child._id);
                                    const childBlogs = categoryBlogs[child._id];

                                    return (
                                      <div key={child._id} className="space-y-4">
                                        <div className="relative h-[220px] overflow-hidden">
                                          <Image
                                            src={getDropdownImage(child, category)}
                                            alt={getLocalizedText(child.name, child.name_en, language)}
                                            fill
                                            className="object-cover"
                                          />
                                          <div className="absolute inset-0 bg-white/20" />
                                        </div>

                                        <div className="border-y border-[#d1d1d1] py-4 max-h-[340px] overflow-y-auto">
                                          <Link
                                            href={`/category/${child.slug}`}
                                            className="block text-xl leading-none font-light text-primary-900 mb-4 tracking-wide hover:translate-x-1 transition-transform"
                                          >
                                            <span className="mr-3 align-middle">›</span>
                                            <span className="align-middle">{getLocalizedText(child.name, child.name_en, language)}</span>
                                          </Link>

                                          <div className="space-y-2 pl-6">
                                            {grandChildren.length > 0 ? (
                                              grandChildren.map((grandChild) => (
                                                <Link
                                                  key={grandChild._id}
                                                  href={`/category/${grandChild.slug}`}
                                                  className="block text-lg leading-none font-light text-gray-900 hover:translate-x-1 transition-transform"
                                                >
                                                  <span className="mr-3 align-middle">›</span>
                                                  <span className="align-middle">{getLocalizedText(grandChild.name, grandChild.name_en, language)}</span>
                                                </Link>
                                              ))
                                            ) : childBlogs ? (
                                              childBlogs.length > 0 ? (
                                                childBlogs.map((blog) => (
                                                  <Link
                                                    key={blog.id}
                                                    href={`/blog/${blog.slug}`}
                                                    className="block text-lg leading-none font-light text-gray-900 hover:translate-x-1 transition-transform"
                                                  >
                                                    <span className="mr-3 align-middle">›</span>
                                                    <span className="align-middle">{getLocalizedText(blog.title, blog.title_en, language)}</span>
                                                  </Link>
                                                ))
                                              ) : (
                                                <p className="text-sm text-gray-500 italic">{t.common.noArticles}</p>
                                              )
                                            ) : (
                                              <p className="text-sm text-gray-500 italic">{t.common.loading}</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
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