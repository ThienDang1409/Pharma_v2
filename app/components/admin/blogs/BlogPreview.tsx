"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { blogApi, type Blog, type BlogSection } from "@/lib/api";
import { apiFetch } from "@/lib/utils/api/apiHelper";
import {
  buildSectionMeta,
  getLocalizedText,
  getSectionLocalizedContent,
} from "@/lib/utils";
import { formatDateLong } from "@/lib/utils/string/format";

type PreviewLanguage = "vi" | "en";

interface BlogPreviewProps {
  content?: string;
  sections?: BlogSection[];
  title?: string;
  titleVi?: string;
  titleEn?: string;
  image?: string;
  author?: string;
  category?: string;
  categoryId?: string;
  publishedAt?: string;
  tags?: string[];
  isMobile?: boolean;
  language?: PreviewLanguage;
}

interface PreviewSection {
  index: number;
  anchor: string;
  displayTitle: string;
  hasDisplayTitle: boolean;
  contentHtml: string;
}

export default function BlogPreview({
  content = "",
  sections,
  title = "",
  titleVi,
  titleEn,
  author = "Admin",
  categoryId,
  publishedAt,
  tags = [],
  isMobile = false,
  language = "vi",
}: BlogPreviewProps) {
  const [relatedProducts, setRelatedProducts] = useState<Blog[]>([]);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const previewScrollRef = useRef<HTMLDivElement | null>(null);

  const resolvedTitle = useMemo(() => {
    const explicitTitle = title.trim();
    if (explicitTitle) return explicitTitle;

    const localizedTitle = getLocalizedText(
      (titleVi || "").trim(),
      (titleEn || "").trim(),
      language
    );

    return localizedTitle.trim() || "Tiêu đề bài viết";
  }, [language, title, titleEn, titleVi]);

  const previewDateText = useMemo(() => {
    const sourceDate = publishedAt || new Date().toISOString();
    return formatDateLong(sourceDate, language === "vi" ? "vi-VN" : "en-US");
  }, [language, publishedAt]);

  useEffect(() => {
    if (!categoryId) {
      setRelatedProducts([]);
      setRelatedBlogs([]);
      return;
    }

    apiFetch(
      () =>
        blogApi.getAll({
          informationId: categoryId,
          isProduct: true,
          status: "published",
          limit: 4,
        }),
      {
        onSuccess: (data) => setRelatedProducts(data?.items || []),
        onError: () => setRelatedProducts([]),
      }
    );

    apiFetch(
      () =>
        blogApi.getAll({
          informationId: categoryId,
          isProduct: false,
          status: "published",
          limit: 3,
        }),
      {
        onSuccess: (data) => setRelatedBlogs(data?.items || []),
        onError: () => setRelatedBlogs([]),
      }
    );
  }, [categoryId]);

  const renderRelatedProductsHtml = useMemo<string>(() => {
    if (!relatedProducts.length) {
      return "";
    }

    const cards = relatedProducts
      .map((product) => {
        const productTitle = getLocalizedText(product.title, product.title_en, language);
        const imageUrl =
          typeof product.image === "string"
            ? product.image
            : product.image?.cloudinaryUrl || "";
        const image = imageUrl
          ? `<img src=\"${imageUrl}\" alt=\"${productTitle}\" class=\"w-full h-full object-contain group-hover:scale-105 transition-transform duration-300\" />`
          : `<div class=\"w-full h-full flex items-center justify-center text-gray-300\"><svg class=\"w-16 h-16\" fill=\"currentColor\" viewBox=\"0 0 20 20\"><path fill-rule=\"evenodd\" d=\"M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z\" clip-rule=\"evenodd\" /></svg></div>`;

        return `<a href=\"/blog/${product.slug}\" class=\"group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col\"><div class=\"relative h-48 bg-gray-50 overflow-hidden flex items-center justify-center p-4\">${image}</div><div class=\"p-4 flex-1 flex flex-col\"><h3 class=\"font-bold text-lg text-gray-900 mb-1\">${productTitle}</h3><div class=\"text-primary-600 text-sm font-medium group-hover:text-primary-800 inline-flex items-center mt-auto\">Details</div></div></a>`;
      })
      .join("");

    return `<div class=\"py-2\"><div class=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">${cards}</div></div>`;
  }, [language, relatedProducts]);

  const renderRelatedArticlesHtml = useMemo<string>(() => {
    if (!relatedBlogs.length) {
      return "";
    }

    const items = relatedBlogs
      .map((relatedBlog) => {
        const relatedTitle = getLocalizedText(
          relatedBlog.title,
          relatedBlog.title_en,
          language
        );
        return `<a href=\"/blog/${relatedBlog.slug}\" class=\"group flex items-start gap-3 text-gray-700 hover:text-primary-600 transition-colors\"><span class=\"text-primary-600 mt-1 font-bold group-hover:translate-x-1 transition-transform\">&gt;&gt;</span><span class=\"text-base md:text-lg group-hover:underline\">${relatedTitle}</span></a>`;
      })
      .join("");

    return `<div class=\"py-2\"><div class=\"space-y-3\">${items}</div></div>`;
  }, [language, relatedBlogs]);

  const previewSections = useMemo<PreviewSection[]>(() => {
    if (sections && sections.length > 0) {
      return buildSectionMeta(sections, language).map((item) => ({
        index: item.index,
        anchor: item.anchor,
        displayTitle: item.displayTitle,
        hasDisplayTitle: item.hasDisplayTitle,
        contentHtml: getSectionLocalizedContent(item.section, language),
      }));
    }

    if (content.trim()) {
      return [
        {
          index: 0,
          anchor: "section-1",
          displayTitle: "",
          hasDisplayTitle: false,
          contentHtml: content,
        },
      ];
    }

    return [];
  }, [content, language, sections]);

  const navigationSections = useMemo(
    () => previewSections.filter((item) => item.hasDisplayTitle),
    [previewSections]
  );

  const navigableSectionAnchors = useMemo(
    () => new Set(navigationSections.map((item) => item.anchor)),
    [navigationSections]
  );

  const activeAnchor = activeSection || navigationSections[0]?.anchor || "";

  const applyEmbeds = (html: string): string => {
    return html
      .replace(
        /<p>\s*\[\[(RELATED_PRODUCTS|RELATED_PRODUCT|RELATEDPRODUCT)\]\]\s*<\/p>/gi,
        renderRelatedProductsHtml
      )
      .replace(
        /\[\[(RELATED_PRODUCTS|RELATED_PRODUCT|RELATEDPRODUCT)\]\]/gi,
        renderRelatedProductsHtml
      )
      .replace(
        /<p>\s*\[\[(RELATED_ARTICLES|RELATED_ARTICLE|RELATEDARTICLE)\]\]\s*<\/p>/gi,
        renderRelatedArticlesHtml
      )
      .replace(
        /\[\[(RELATED_ARTICLES|RELATED_ARTICLE|RELATEDARTICLE)\]\]/gi,
        renderRelatedArticlesHtml
      );
  };

  const scrollToSection = (sectionAnchor: string) => {
    if (!sectionAnchor) return;
    setActiveSection(sectionAnchor);

    const container = previewScrollRef.current;
    const element = document.getElementById(`preview-section-${sectionAnchor}`);
    if (!container || !element) return;

    const offset = 120;
    const elementTop = element.getBoundingClientRect().top;
    const containerTop = container.getBoundingClientRect().top;
    const targetTop = container.scrollTop + (elementTop - containerTop) - offset;

    container.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!previewSections.length) return;

    const container = previewScrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const sectionId = entry.target.id.replace("preview-section-", "");
          if (navigableSectionAnchors.has(sectionId)) {
            setActiveSection(sectionId);
          }
        });
      },
      {
        root: container,
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    previewSections.forEach(({ anchor }) => {
      const element = document.getElementById(`preview-section-${anchor}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [navigableSectionAnchors, previewSections]);

  return (
    <div
      className={`preview-wrapper h-full flex flex-col transition-all ${
        isMobile ? "max-w-[440px] mx-auto" : "w-full"
      }`}
    >
      <div
        className={`preview-container bg-white shadow-premium flex-1 flex flex-col ${
          isMobile
            ? "rounded-[3rem] border-[12px] border-gray-900 shadow-2xl"
            : "border border-gray-100"
        }`}
      >
        <div
          ref={previewScrollRef}
          className="h-full overflow-y-auto custom-scrollbar bg-white"
        >
          {navigationSections.length > 0 && (
            <div className="border-b border-t border-gray-200 pt-4 bg-white sticky top-0 z-20">
              <div className="container mx-auto px-6 md:px-8">
                <div className="flex items-center justify-center gap-8 md:gap-16 overflow-x-auto">
                  {navigationSections.map(({ anchor, displayTitle, index }) => (
                    <button
                      key={`${anchor}-${index}`}
                      type="button"
                      onClick={() => scrollToSection(anchor)}
                      className={`text-base md:text-md pb-2 border-b-4 transition-all whitespace-nowrap cursor-pointer ${
                        activeAnchor === anchor
                          ? "text-primary-800 border-primary-800 font-semibold"
                          : "text-primary-900 border-transparent hover:text-primary-800 hover:border-primary-800 hover:font-semibold"
                      }`}
                    >
                      {displayTitle}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="container mx-auto w-[70%] py-12 md:py-16">
            <div className="max-w-6xl mx-auto">
              <div>
                <div className="border-b border-gray-200 py-8 text-start">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight break-words [overflow-wrap:anywhere]">
                    {resolvedTitle}
                  </h1>
                </div>

                <div className="pt-8 pb-6 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4 text-gray-600">
                    {/* <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold">{author}</span>
                    </span>
                    <span className="text-gray-400">•</span> */}
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1h2a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2h2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {previewDateText}
                    </span>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-secondary-100 text-secondary-700 text-sm font-medium rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                

                {previewSections.length === 0 && (
                  <div className="py-10 border-b border-gray-200 text-sm text-gray-500 text-center">
                    Nội dung section sẽ hiển thị ở đây sau khi bạn nhập vào editor.
                  </div>
                )}

                {previewSections.map(({ index, anchor, displayTitle, hasDisplayTitle, contentHtml }) => {
                  const normalizedTitle = displayTitle.toLowerCase();
                  const hasLocalizedContent = Boolean(contentHtml?.trim());

                  if (!hasDisplayTitle && !hasLocalizedContent) {
                    return null;
                  }

                  const isSpecialSection = hasDisplayTitle && !hasLocalizedContent;
                  const isRelatedArticles =
                    normalizedTitle.includes("related articles") ||
                    normalizedTitle.includes("bài viết liên quan") ||
                    normalizedTitle.includes("tin liên quan");
                  const isRelatedProducts =
                    normalizedTitle.includes("related products") ||
                    normalizedTitle.includes("sản phẩm liên quan");

                  if (!isSpecialSection) {
                    return (
                      <div
                        key={`${anchor}-${index}`}
                        id={`preview-section-${anchor}`}
                        className="py-10 border-b border-gray-200 last:border-b-0"
                      >
                        {hasDisplayTitle && (
                          <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-6 break-words [overflow-wrap:anywhere]">
                            {displayTitle}
                          </h2>
                        )}

                        {hasLocalizedContent && (
                          <div
                            className="prose prose-lg md:prose-xl max-w-none rendered-content break-words [overflow-wrap:anywhere] [&_*]:break-words [&_*]:[overflow-wrap:anywhere]
                              prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
                              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                              prose-a:text-primary-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-primary-700 prose-a:transition-colors
                              prose-strong:text-gray-900 prose-strong:font-bold
                              prose-em:italic prose-em:text-gray-700
                              prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2 prose-ul:my-4
                              prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2 prose-ol:my-4
                              prose-li:text-gray-700 prose-li:leading-relaxed
                              prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-gray-50 prose-blockquote:my-6
                              prose-img:rounded-lg prose-img:shadow-md prose-img:my-6 prose-img:w-full
                              prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-primary-700
                              prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-6
                              prose-table:w-full prose-table:border-collapse prose-table:my-6 prose-table:table-fixed
                              prose-th:bg-gray-100 prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-gray-300
                              prose-td:p-3 prose-td:border prose-td:border-gray-300
                            "
                            dangerouslySetInnerHTML={{ __html: applyEmbeds(contentHtml) }}
                          />
                        )}
                      </div>
                    );
                  }

                  if (isRelatedArticles && relatedBlogs.length > 0) {
                    return (
                      <div
                        key={`${anchor}-${index}`}
                        id={`preview-section-${anchor}`}
                        className="py-10 border-b border-gray-200"
                      >
                        <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-8">
                          {displayTitle}
                        </h2>
                        <div
                          className="prose prose-base max-w-none rendered-content break-words [overflow-wrap:anywhere] [&_*]:break-words [&_*]:[overflow-wrap:anywhere]"
                          dangerouslySetInnerHTML={{ __html: renderRelatedArticlesHtml }}
                        />
                      </div>
                    );
                  }

                  if (isRelatedProducts && relatedProducts.length > 0) {
                    return (
                      <div
                        key={`${anchor}-${index}`}
                        id={`preview-section-${anchor}`}
                        className="py-10"
                      >
                        <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-8">
                          {displayTitle}
                        </h2>
                        <div
                          className="prose prose-base max-w-none rendered-content break-words [overflow-wrap:anywhere] [&_*]:break-words [&_*]:[overflow-wrap:anywhere]"
                          dangerouslySetInnerHTML={{ __html: renderRelatedProductsHtml }}
                        />
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
