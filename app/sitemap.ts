import type { MetadataRoute } from "next";
import { fetchCategoriesForSeo, fetchPublishedBlogsForSeo } from "@/lib/seo/api";
import { absoluteUrl } from "@/lib/seo/site";

export const revalidate = 300;

const STATIC_ROUTES = [
  {
    path: "/",
    changeFrequency: "daily" as const,
    priority: 1,
  },
  {
    path: "/blog",
    changeFrequency: "daily" as const,
    priority: 0.9,
  },
  {
    path: "/events",
    changeFrequency: "weekly" as const,
    priority: 0.7,
  },
];

function toDate(value: string | Date | undefined): Date | undefined {
  if (!value) return undefined;

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, categories] = await Promise.all([
    fetchPublishedBlogsForSeo(),
    fetchCategoriesForSeo(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories
    .filter((category) => Boolean(category.slug) && category.isActive !== false)
    .map((category) => ({
      url: absoluteUrl(`/category/${category.slug}`),
      lastModified: toDate(category.updatedAt) || new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const blogEntries: MetadataRoute.Sitemap = blogs
    .filter((blog) => Boolean(blog.slug))
    .map((blog) => ({
      url: absoluteUrl(`/blog/${blog.slug}`),
      lastModified:
        toDate(blog.updatedAt) ||
        toDate(blog.publishedAt) ||
        toDate(blog.createdAt) ||
        new Date(),
      changeFrequency: "weekly",
      priority: blog.isProduct ? 0.7 : 0.8,
    }));

  const seenUrls = new Set<string>();

  return [...staticEntries, ...categoryEntries, ...blogEntries].filter((entry) => {
    if (seenUrls.has(entry.url)) {
      return false;
    }

    seenUrls.add(entry.url);
    return true;
  });
}
