import { API_ENDPOINTS } from "@/lib/constants/api";
import type { ApiResponse, Blog, Information, PaginationResult } from "@/lib/types";

const DEFAULT_API_BASE_URL = "http://localhost:8080/api";

type QueryValue = string | number | boolean | undefined | null;
type QueryParams = Record<string, QueryValue>;

function getApiBaseUrl(): string {
  const candidate = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL).trim();
  return candidate.endsWith("/") ? candidate.slice(0, -1) : candidate;
}

function buildApiUrl(path: string, queryParams?: QueryParams): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${getApiBaseUrl()}${normalizedPath}`);

  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

function isApiResponse<T>(payload: ApiResponse<T> | T): payload is ApiResponse<T> {
  return typeof payload === "object" && payload !== null && "success" in payload;
}

async function fetchApiData<T>(path: string, queryParams?: QueryParams): Promise<T | null> {
  try {
    const response = await fetch(buildApiUrl(path, queryParams), {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiResponse<T> | T;

    if (isApiResponse<T>(payload)) {
      return payload.data ?? null;
    }

    return payload as T;
  } catch {
    return null;
  }
}

export async function fetchPublishedBlogsForSeo(limit = 5000): Promise<Blog[]> {
  const data = await fetchApiData<PaginationResult<Blog>>(API_ENDPOINTS.BLOGS, {
    status: "published",
    page: 1,
    limit,
  });

  return data?.items ?? [];
}

export async function fetchBlogBySlugForSeo(slug: string): Promise<Blog | null> {
  const endpoint = API_ENDPOINTS.BLOG_BY_SLUG.replace(":slug", encodeURIComponent(slug));
  const data = await fetchApiData<{ blog: Blog }>(endpoint);

  return data?.blog ?? null;
}

export async function fetchCategoriesForSeo(limit = 1000): Promise<Information[]> {
  const data = await fetchApiData<PaginationResult<Information>>(API_ENDPOINTS.INFORMATION, {
    page: 1,
    limit,
  });

  return data?.items ?? [];
}

export async function fetchCategoryBySlugForSeo(slug: string): Promise<Information | null> {
  const endpoint = API_ENDPOINTS.INFORMATION_BY_SLUG.replace(":slug", encodeURIComponent(slug));
  const data = await fetchApiData<{ information: Information }>(endpoint);

  return data?.information ?? null;
}
