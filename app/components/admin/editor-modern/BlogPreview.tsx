"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useMemo, useState } from "react";
import { blogApi, Blog } from "@/lib/api";
import { apiFetch } from "@/lib/utils/api/apiHelper";

interface BlogPreviewProps {
  content: string; // HTML string for now
  title?: string;
  image?: string;
  author?: string;
  category?: string;
  categoryId?: string;
  publishedAt?: string;
  tags?: string[];
  isMobile?: boolean;
}

export default function BlogPreview({
  content,
  title = "Tiêu đề bài viết",
  image,
  author = "Admin",
  category = "Sức khỏe",
  categoryId,
  publishedAt,
  tags = [],
  isMobile = false,
}: BlogPreviewProps) {
  const [relatedProducts, setRelatedProducts] = useState<Blog[]>([]);

  useEffect(() => {
    if (!categoryId) {
      setRelatedProducts([]);
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
  }, [categoryId]);

  const renderRelatedProductsHtml = useMemo(() => {
    if (!relatedProducts.length) {
      return `
        <div class="my-8 p-5 border border-gray-200 rounded-2xl bg-gray-50">
          <p class="text-sm text-gray-500">Chưa có sản phẩm cùng danh mục để hiển thị preview.</p>
        </div>
      `;
    }

    const cards = relatedProducts
      .map((product) => {
        const name = product.title || "Sản phẩm";
        const imageUrl = product.image?.cloudinaryUrl;
        const excerpt = product.excerpt || "";

        return `
          <div class="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            <div class="h-36 bg-gray-50 flex items-center justify-center overflow-hidden">
              ${
                imageUrl
                  ? `<img src="${imageUrl}" alt="${name}" class="w-full h-full object-contain" />`
                  : `<div class="text-xs text-gray-400">No image</div>`
              }
            </div>
            <div class="p-4">
              <h4 class="text-sm font-bold text-gray-900 line-clamp-2">${name}</h4>
              ${excerpt ? `<p class="text-xs text-gray-500 mt-2 line-clamp-2">${excerpt}</p>` : ""}
            </div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="my-8 p-5 border border-gray-200 rounded-2xl bg-gray-50">
        <h3 class="text-base font-bold text-gray-900 mb-4">Sản phẩm liên quan</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${cards}</div>
      </div>
    `;
  }, [relatedProducts]);

  const previewHtml = useMemo(() => {
    const relatedProductPattern = /<p>\s*\[\[(RELATED_PRODUCTS?|RELATEDPRODUCT)\]\]\s*<\/p>|\[\[(RELATED_PRODUCTS?|RELATEDPRODUCT)\]\]/gi;
    return content.replace(relatedProductPattern, renderRelatedProductsHtml);
  }, [content, renderRelatedProductsHtml]);

  const formatReadTime = () => Math.max(1, Math.ceil(content.split(' ').length / 200));

  return (
    <div className={`preview-wrapper h-full flex flex-col transition-all ${isMobile ? 'max-w-[440px] mx-auto' : 'w-full'}`}>
      <div className={`preview-container bg-white shadow-premium flex-1 flex flex-col ${isMobile ? 'rounded-[3rem] border-[12px] border-gray-900 shadow-2xl overflow-y-auto custom-scrollbar' : ' border border-gray-100 overflow-y-auto custom-scrollbar'}`}>
        
        {/* Header Image (Optional) */}
        {image && !isMobile && (
          <div className="w-full h-[400px] overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        )}

        <div className={`${isMobile ? 'p-8' : 'p-8'} max-w-4xl mx-auto`}>
          {/* Title */}
          <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl md:text-7xl'} font-black text-gray-900 leading-[1.1] mb-10 tracking-tighter`}>
            {title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-5 mb-14 pb-10 border-b border-gray-50">
            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-gray-900/10">
              {author.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-black text-gray-900 text-lg leading-none mb-1">{author}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                {publishedAt && <span>{publishedAt} • </span>}
                <span>{formatReadTime()} Min Read</span>
              </div>
            </div>
          </div>

          {/* Mobile Image */}
          {image && isMobile && (
            <div className="mb-10">
              <img
                src={image}
                alt={title}
                className="w-full h-auto rounded-2xl shadow-xl object-cover aspect-video"
              />
            </div>
          )}

          {/* Main Content Rendered from Tiptap */}
          <div
            className="prose prose-lg md:prose-xl max-w-none rendered-content 
              prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-gray-900
              prose-p:text-gray-600 prose-p:leading-relaxed prose-p:font-medium
              prose-img:rounded-3xl prose-img:shadow-2xl
              prose-table:w-full prose-table:table-fixed"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-20 pt-10 border-t border-gray-50 flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="px-5 py-2.5 bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary-900 hover:text-white transition-all cursor-pointer border border-transparent hover:border-primary-900">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
