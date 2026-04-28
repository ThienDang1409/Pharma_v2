"use client";

import React from "react";
import Link from "next/link";
import type { Blog } from "@/lib/types";
import { getLocalizedText, getBlogId } from "@/lib/utils";

interface RelatedArticlesListProps {
  articles: Blog[];
  language: "vi" | "en";
}

const labels = {
  vi: {
    title: "Bài viết liên quan",
  },
  en: {
    title: "Related Articles",
  },
} as const;

export default function RelatedArticlesList({ articles, language }: RelatedArticlesListProps) {
  if (!articles.length) return null;

  const t = labels[language];

  return (
    <div className="flex flex-col py-4">
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
        {t.title}
      </h3>
      <div className="flex flex-col gap-4">
        {articles.map((article) => (
          <Link
            key={getBlogId(article)}
            href={`/blog/${article.slug}`}
            className="group flex items-start gap-4 transition-all"
          >
            <span className="text-primary-900 font-bold text-lg leading-none shrink-0 mt-1">
              »
            </span>
            <span className="text-primary-900 font-medium text-base md:text-lg underline underline-offset-4 decoration-primary-200/60 group-hover:decoration-primary-900 transition-all leading-relaxed">
              {getLocalizedText(article.title, article.title_en, language)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
