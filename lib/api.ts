import { API_ENDPOINTS } from "./constants/api";
import { http } from "./http";
import type {
  ApiResponse,
  PaginationResult,
  ImageResponse,
  ImagePreview,
  ImageQueryParams,
  UploadImageDto,
  UpdateImageDto,
  AddReferenceDto,
  RemoveReferenceDto,
  TransformImageDto,
  Blog,
  CreateBlogDto,
  UpdateBlogDto,
  BlogQueryParams,
  Information,
  CreateInformationDto,
  UpdateInformationDto,
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  InformationQueryParams,
} from "./types";

// Re-export types for convenience
export type {
  ApiResponse,
  PaginationResult,
  ImageResponse,
  ImagePreview,
  ImageQueryParams,
  UploadImageDto,
  UpdateImageDto,
  AddReferenceDto,
  RemoveReferenceDto,
  TransformImageDto,
  Blog,
  CreateBlogDto,
  UpdateBlogDto,
  BlogQueryParams,
  Information,
  CreateInformationDto,
  UpdateInformationDto,
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
};

// News API
// export const newsApi = {
//   // Get all news
//   getAll: (params?: {
//     page?: number;
//     limit?: number;
//     category?: string;
//     status?: string;
//   }) => {
//     return http.get<ApiResponse<NewsArticle[]>>("/news", { params });
//   },

//   // Get single news by ID
//   getById: (id: string) => {
//     return http.get<ApiResponse<NewsArticle>>(`/news/${id}`);
//   },

//   // Create news
//   create: (data: Omit<NewsArticle, "_id" | "createdAt" | "updatedAt">) => {
//     return http.post<ApiResponse<NewsArticle>>("/news", data);
//   },

//   // Update news
//   update: (id: string, data: Partial<NewsArticle>) => {
//     return http.put<ApiResponse<NewsArticle>>(`/news/${id}`, data);
//   },

//   // Delete news
//   delete: (id: string) => {
//     return http.delete<ApiResponse>(`/news/${id}`);
//   },
// };

// ============================================================================
// IMAGE API - Complete Integration with Backend
// ============================================================================
export const imageApi = {
  /**
   * Upload single image
   */
  upload: (
    file: File,
    dto?: UploadImageDto,
    onProgress?: (progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    // Add optional metadata
    if (dto?.tags) formData.append("tags", JSON.stringify(dto.tags));
    if (dto?.description) formData.append("description", dto.description);
    if (dto?.folder) formData.append("folder", dto.folder);
    if (dto?.entityType) formData.append("entityType", dto.entityType);
    if (dto?.entityId) formData.append("entityId", dto.entityId);
    if (dto?.field) formData.append("field", dto.field);

    return http.uploadFile<ApiResponse<{ image: ImageResponse }>>(
      "/images/upload",
      formData,
      onProgress
        ? (progressEvent: any) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
        : undefined
    );
  },

  /**
   * Upload multiple images
   */
  uploadMultiple: (
    files: File[],
    dto?: UploadImageDto,
    onProgress?: (progress: number) => void
  ) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    // Add optional metadata
    if (dto?.tags) formData.append("tags", JSON.stringify(dto.tags));
    if (dto?.description) formData.append("description", dto.description);
    if (dto?.folder) formData.append("folder", dto.folder);
    if (dto?.entityType) formData.append("entityType", dto.entityType);
    if (dto?.entityId) formData.append("entityId", dto.entityId);
    if (dto?.field) formData.append("field", dto.field);

    return http.uploadFile<ApiResponse<{ images: ImageResponse[] }>>(
      "/images/upload-multiple",
      formData,
      onProgress
        ? (progressEvent: any) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
        : undefined
    );
  },

  /**
   * Get all images with filters and pagination
   */
  getAll: (params?: ImageQueryParams) => {
    return http.get<ApiResponse<PaginationResult<ImageResponse>>>(
      "/images",
      { params }
    );
  },

  /**
   * Get single image by ID
   */
  getById: (id: string) => {
    return http.get<ApiResponse<{ image: ImageResponse }>>(`/images/${id}`);
  },

  /**
   * Get images by entity (blog, information, etc.)
   */
  getByEntity: (entityType: string, entityId: string) => {
    return http.get<ApiResponse<{ images: ImageResponse[] }>>(
      `/images/entity/${entityType}/${entityId}`
    );
  },

  /**
   * Update image metadata
   */
  update: (id: string, data: UpdateImageDto) => {
    return http.put<ApiResponse<{ image: ImageResponse }>>(
      `/images/${id}`,
      data
    );
  },

  /**
   * Add reference to image (track where it's used)
   */
  addReference: (id: string, data: AddReferenceDto) => {
    return http.post<ApiResponse<{ image: ImageResponse }>>(
      `/images/${id}/reference`,
      data
    );
  },

  /**
   * Remove reference from image
   */
  removeReference: (id: string, data: RemoveReferenceDto) => {
    return http.delete<ApiResponse<{ image: ImageResponse }>>(
      `/images/${id}/reference`,
      { data }
    );
  },

  /**
   * Transform image (create thumbnail, resize, etc.)
   */
  transform: (id: string, data: TransformImageDto) => {
    return http.post<ApiResponse<{ transformation: any }>>(
      `/images/${id}/transform`,
      data
    );
  },

  /**
   * Delete image
   */
  delete: (id: string) => {
    return http.delete<ApiResponse>(`/images/${id}`);
  },

  /**
   * Cleanup unused images (refCount = 0)
   */
  cleanupUnused: () => {
    return http.delete<ApiResponse<{ deletedCount: number }>>(
      "/images/cleanup"
    );
  },

  /**
   * Upload by URL (if needed)
   */
  uploadByUrl: (imageUrl: string, dto?: UploadImageDto) => {
    return http.post<ApiResponse<{ image: ImageResponse }>>(
      "/images/upload",
      { imageUrl, ...dto }
    );
  },
};

// ============================================================================
// AUTHENTICATION API
// ============================================================================
export const authApi = {
  login: (credentials: LoginCredentials) => {
    return http.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials
    );
  },

  logout: () => {
    http.removeAuthToken();
    return Promise.resolve();
  },

  register: (userData: RegisterData) => {
    return http.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      userData
    );
  },

  getCurrentUser: () => {
    return http.get<ApiResponse<{ user: User }>>("/auth/me");
  },

  refreshToken: (refreshToken: string) => {
    return http.post<ApiResponse<{ token: string; refreshToken: string }>>(
      "/auth/refresh",
      { refreshToken }
    );
  },

  forgotPassword: (email: string) => {
    return http.post<ApiResponse>("/auth/forgot-password", { email });
  },

  resetPassword: (token: string, password: string) => {
    return http.post<ApiResponse>("/auth/reset-password", {
      token,
      password,
    });
  },

  changePassword: (oldPassword: string, newPassword: string) => {
    return http.post<ApiResponse>("/auth/change-password", {
      oldPassword,
      newPassword,
    });
  },

  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => {
    return http.put<ApiResponse<{ user: User }>>("/auth/profile", data);
  },
};

// Events API (example)
export interface Event {
  _id?: string;
  name: string;
  date: string;
  location: string;
  city: string;
  country: string;
  booth: string;
  website: string;
  logo?: string;
  isPast?: boolean;
}

export const eventsApi = {
  getAll: (params?: { isPast?: boolean }) => {
    return http.get<ApiResponse<Event[]>>("/events", { params });
  },

  getById: (id: string) => {
    return http.get<ApiResponse<Event>>(`/events/${id}`);
  },

  create: (data: Omit<Event, "_id">) => {
    return http.post<ApiResponse<Event>>("/events", data);
  },

  update: (id: string, data: Partial<Event>) => {
    return http.put<ApiResponse<Event>>(`/events/${id}`, data);
  },

  delete: (id: string) => {
    return http.delete<ApiResponse>(`/events/${id}`);
  },
};

// Products API (example)
export interface Product {
  _id?: string;
  name: string;
  category: string;
  description: string;
  price?: number;
  images: string[];
  specifications?: Record<string, any>;
}

export const productsApi = {
  getAll: (params?: { category?: string; page?: number; limit?: number }) => {
    return http.get<ApiResponse<Product[]>>("/products", { params });
  },

  getById: (id: string) => {
    return http.get<ApiResponse<Product>>(`/products/${id}`);
  },

  create: (data: Omit<Product, "_id">) => {
    return http.post<ApiResponse<Product>>("/products", data);
  },

  update: (id: string, data: Partial<Product>) => {
    return http.put<ApiResponse<Product>>(`/products/${id}`, data);
  },

  delete: (id: string) => {
    return http.delete<ApiResponse>(`/products/${id}`);
  },
};

// ============================================================================
// BLOG API - Aligned with Backend
// ============================================================================
export const blogApi = {
  /**
   * Get all blogs with pagination
   */
  getAll: (params?: BlogQueryParams) => {
    return http.get<ApiResponse<PaginationResult<Blog>>>(
      "/blog",
      { params }
    );
  },

  /**
   * Get single blog by ID
   */
  getById: (id: string) => {
    return http.get<ApiResponse<{ blog: Blog }>>(`${API_ENDPOINTS.BLOG_BY_ID.replace(":id", id)}`);
  },

  /**
   * Get blog by slug
   */
  getBySlug: (slug: string) => {
    return http.get<ApiResponse<{ blog: Blog }>>(`${API_ENDPOINTS.BLOG_BY_SLUG.replace(":slug", slug)}`);
  },

  /**
   * Create blog
   */
  create: (data: CreateBlogDto) => {
    return http.post<ApiResponse<{ blog: Blog }>>(API_ENDPOINTS.BLOGS, data);
  },

  /**
   * Update blog
   */
  update: (id: string, data: UpdateBlogDto) => {
    return http.put<ApiResponse<{ blog: Blog }>>(`${API_ENDPOINTS.BLOG_BY_ID.replace(":id", id)}`, data);
  },

  /**
   * Delete blog
   */
  delete: (id: string) => {
    return http.delete<ApiResponse>(`${API_ENDPOINTS.BLOG_BY_ID.replace(":id", id)}`);
  },
};

// ============================================================================
// INFORMATION/CATEGORY API - Aligned with Backend
// ============================================================================
export const informationApi = {
  /**
   * Get all categories
   */
  getAll: (params?: InformationQueryParams) => {
    return http.get<ApiResponse<PaginationResult<Information>>>(
      API_ENDPOINTS.INFORMATION,
      { params }
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
      `${API_ENDPOINTS.INFORMATION}/parent/${parentId}`
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
    return http.delete<ApiResponse>(`${API_ENDPOINTS.INFORMATION_BY_ID.replace(":id", id)}`);
  },
};
