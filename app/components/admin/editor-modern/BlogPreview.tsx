"use client";

import React from "react";

interface BlogPreviewProps {
  content: string; // HTML string for now
  title?: string;
  image?: string;
  author?: string;
  tags?: string[];
  isMobile?: boolean;
}

export default function BlogPreview({
  content,
  title = "Tiêu đề bài viết",
  image,
  author = "Admin",
  tags = [],
  isMobile = false,
}: BlogPreviewProps) {
  return (
    <div className={`preview-wrapper p-4 md:p-14 min-h-screen transition-all ${isMobile ? 'max-w-[440px] mx-auto' : 'w-full'}`}>
      <div className={`preview-container bg-white shadow-premium min-h-full overflow-hidden ${isMobile ? 'rounded-[3rem] border-[12px] border-gray-900 shadow-2xl h-[840px] overflow-y-auto custom-scrollbar' : 'rounded-[3.5rem] border border-gray-100'}`}>
        
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

        <div className={`${isMobile ? 'p-8' : 'p-12 md:p-24 md:pt-20'} max-w-4xl mx-auto`}>
          {/* Category / Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] font-black text-primary-900 uppercase tracking-[0.2em] mb-8">
            <span className="bg-primary-50 px-2 py-1 rounded">Sức khỏe</span>
            <span className="text-gray-200">/</span>
            <span className="text-gray-400">Tin tức chuyên sâu</span>
          </div>

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
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Chief Medical Editor • 5 Min Read</div>
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
              prose-img:rounded-3xl prose-img:shadow-2xl"
            dangerouslySetInnerHTML={{ __html: content }}
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
