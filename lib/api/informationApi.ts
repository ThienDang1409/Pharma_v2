import { API_ENDPOINTS } from "../constants/api";
import { http } from "./http";
import type {
  ApiResponse,
  PaginationResult,
  Information,
  CreateInformationDto,
  UpdateInformationDto,
  InformationQueryParams,
} from "../types";

export const informationApi = {
  /**
   * Get all categories
   */
  getAll: (params?: InformationQueryParams) => {
    const finalParams: InformationQueryParams = {
      page: 1,
      limit: 1000,
      ...params,
    };  

    return http.get<ApiResponse<PaginationResult<Information>>>(
      API_ENDPOINTS.INFORMATION,
      { params: finalParams }
    );
  },

  /**
   * Get single category by ID
   */
  getById: (id: string) => {
    return http.get<ApiResponse<{ information: Information }>>(
      `${API_ENDPOINTS.INFORMATION_BY_ID.replace(":id", id)}`
    );
  },

  /**
   * Get category by slug
   */
  getBySlug: (slug: string) => {
    return http.get<ApiResponse<{ information: Information }>>(
      `${API_ENDPOINTS.INFORMATION_BY_SLUG.replace(":slug", slug)}`
    );
  },

  /**
   * Get categories by parent ID
   */
  getByParentId: (parentId: string) => {
    return http.get<ApiResponse<Information[]>>(
      API_ENDPOINTS.INFORMATION_BY_PARENT.replace(":parentId", parentId)
    );
  },

  /**
   * Create new category
   */
  create: (data: CreateInformationDto) => {
    return http.post<ApiResponse<{ information: Information }>>(
      API_ENDPOINTS.INFORMATION,
      data
    );
  },

  /**
   * Update category
   */
  update: (id: string, data: UpdateInformationDto) => {
    return http.put<ApiResponse<{ information: Information }>>(
      `${API_ENDPOINTS.INFORMATION_BY_ID.replace(":id", id)}`,
      data
    );
  },

  /**
   * Delete category
   */
  delete: (id: string) => {
    return http.delete<ApiResponse>(
      `${API_ENDPOINTS.INFORMATION_BY_ID.replace(":id", id)}`
    );
  },

  /**
   * Reorder categories
   */
  reorder: (items: Array<{ id: string; order: number }>) => {
    return http.put<ApiResponse>(
      API_ENDPOINTS.INFORMATION_REORDER,
      { items }
    );
  },
};
