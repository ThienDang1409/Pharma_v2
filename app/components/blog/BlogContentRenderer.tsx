"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import RelatedProductsCarousel from "./RelatedProductsCarousel";
import RelatedArticlesList from "./RelatedArticlesList";
import PublicImageSlider from "./PublicImageSlider";
import { blogApi } from "@/lib/api";
import type { Blog } from "@/lib/types";

interface BlogContentRendererProps {
  html: string;
  language: "vi" | "en";
}

type RelatedType = "related-products" | "related-articles";

interface ImageSliderItem {
  id: string;
  url: string;
  caption: string;
}

interface RelatedComponentProps {
  type: RelatedType;
  ids: string[];
  limit: number;
  style: string;
  language: "vi" | "en";
}

export default function BlogContentRenderer({ html, language }: BlogContentRendererProps) {
  const [renderedContent, setRenderedContent] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const parseContent = async () => {
      // Split content by our custom tags
      // Regex to find: <div data-type="related-products" ...></div> or <div data-type="related-articles" ...></div>
      const regex = /<div[^>]*data-type="(related-products|related-articles|image-slider)"[^>]*>[\s\S]*?<\/div>/g;
      const splitRegex = /<div[^>]*data-type="(?:related-products|related-articles|image-slider)"[^>]*>[\s\S]*?<\/div>/g;
      const parts = html.split(splitRegex);
      const matches = Array.from(html.matchAll(regex));

      const newContent: React.ReactNode[] = [];

      for (let i = 0; i < parts.length; i++) {
        // Add the HTML part
        if (parts[i]) {
          newContent.push(
            <div
              key={`html-${i}`}
              dangerouslySetInnerHTML={{ __html: parts[i] }}
              className="prose-content-block"
            />
          );
        }

        // Add the matched component
        if (i < matches.length) {
          const match = matches[i];
          const fullTag = match[0];
          const type = match[1];

          // Parse attributes
          const idsMatch = fullTag.match(/data-ids="([^"]*)"/);
          const limitMatch = fullTag.match(/data-limit="([^"]*)"/);
          const styleMatch = fullTag.match(/data-style="([^"]*)"/);

          const ids = idsMatch ? JSON.parse(idsMatch[1].replace(/&quot;/g, '"')) : [];
          const limit = limitMatch ? parseInt(limitMatch[1], 10) : (type === 'related-products' ? 8 : 3);
          const style = styleMatch ? styleMatch[1] : (type === 'related-products' ? 'slide' : 'list');

          if (type === 'image-slider') {
            const images = fullTag.match(/data-images="([^"]*)"/);
            const autoplay = fullTag.match(/data-autoplay="true"/);
            const pagination = fullTag.match(/data-pagination="false"/) === null;

            const imageData = images
              ? (JSON.parse(images[1].replace(/&quot;/g, '"')) as ImageSliderItem[])
              : [];

            if (imageData.length > 0) {
              newContent.push(
                <div key={`slider-${i}`}>
                  <PublicImageSlider
                    images={imageData}
                    autoplay={!!autoplay}
                    showPagination={pagination}
                  />
                </div>
              );
            }
          } else if (ids.length > 0) {
            newContent.push(
              <div key={`comp-${i}`} className="my-12">
                <RelatedComponent
                  type={type as RelatedType}
                  ids={ids}
                  limit={limit}
                  style={style}
                  language={language}
                />
              </div>
            );
          }
        }
      }

      setRenderedContent(newContent);
    };

    parseContent();
  }, [html, language]);

  return <div className="rendered-blog-content">{renderedContent}</div>;
}

function RelatedComponent({ type, ids, limit, style, language }: RelatedComponentProps) {
  const [data, setData] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          ids.slice(0, limit).map(async (id: string) => {
            try {
              const res = await blogApi.getById(id);
              return res.data?.blog;
            } catch {
              return null;
            }
          })
        );
        setData(results.filter(Boolean) as Blog[]);
      } catch (error) {
        console.error("Error fetching related items for public page:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ids, limit]);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-shrink-0 w-64 h-48 bg-gray-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (data.length === 0) return null;

  if (type === 'related-products') {
    if (style === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map(product => (
            <Link key={product.id || product._id} href={`/blog/${product.slug}`} className="group bg-white rounded-3xl border border-gray-100 p-4 hover:shadow-2xl transition-all">
              <div className="aspect-square bg-gray-50 rounded-2xl mb-4 overflow-hidden p-4">
                <img src={product.image?.cloudinaryUrl} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h4 className="font-bold text-gray-900 group-hover:text-primary-600 line-clamp-2">{product.title}</h4>
            </Link>
          ))}
        </div>
      );
    }
    return <RelatedProductsCarousel products={data} language={language} />;
  }

  return <RelatedArticlesList articles={data} language={language} />;
}
