import { API_ENDPOINTS } from "../constants/api";
import { http } from "./http";
import type {
  ApiResponse,
  PaginationResult,
  Blog,
  CreateBlogDto,
  UpdateBlogDto,
  BlogQueryParams,
} from "../types";

export const blogApi = {
  /**
   * Get all blogs with pagination
   */
  getAll: (params?: BlogQueryParams) => {
    return http.get<ApiResponse<PaginationResult<Blog>>>(
      API_ENDPOINTS.BLOGS,
      { params }
    );
  },

  /**
   * Get blogs for exact category only (no descendant categories)
   */
  getAllExactCategory: (params?: BlogQueryParams) => {
    return http.get<ApiResponse<PaginationResult<Blog>>>(
      API_ENDPOINTS.BLOG_EXACT_CATEGORY,
      { params }
    );
  },

  /**
   * Get single blog by ID
   */
  getById: (id: string) => {
    return http.get<ApiResponse<{ blog: Blog }>>(
      `${API_ENDPOINTS.BLOG_BY_ID.replace(":id", id)}`
    );
  },

  /**
   * Get blog by slug
   */
  getBySlug: (slug: string) => {
    return http.get<ApiResponse<{ blog: Blog }>>(
      `${API_ENDPOINTS.BLOG_BY_SLUG.replace(":slug", slug)}`
    );
  },

  /**
   * Create blog
   */
  create: (data: CreateBlogDto) => {
    return http.post<ApiResponse<{ blog: Blog }>>(
      API_ENDPOINTS.BLOGS,
      data
    );
  },

  /**
   * Update blog
   */
  update: (id: string, data: UpdateBlogDto) => {
    return http.put<ApiResponse<{ blog: Blog }>>(
      `${API_ENDPOINTS.BLOG_BY_ID.replace(":id", id)}`,
      data
    );
  },

  /**
   * Delete blog
   */
  delete: (id: string) => {
    return http.delete<ApiResponse>(
      `${API_ENDPOINTS.BLOG_BY_ID.replace(":id", id)}`
    );
  },
};
