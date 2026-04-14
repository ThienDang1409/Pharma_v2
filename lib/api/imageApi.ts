import { API_ENDPOINTS } from "../constants/api";
import { http } from "./http";
import type { AxiosProgressEvent } from "axios";
import type {
  ApiResponse,
  PaginationResult,
  ImageResponse,
  ImageQueryParams,
  UploadImageDto,
  UpdateImageDto,
  AddReferenceDto,
  RemoveReferenceDto,
  TransformImageDto,
} from "../types";

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
      API_ENDPOINTS.IMAGE_UPLOAD,
      formData,
      onProgress
        ? (progressEvent: AxiosProgressEvent) => {
            const progress = Math.round(
              ((progressEvent.loaded ?? 0) * 100) / (progressEvent.total ?? 1)
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
      formData.append("files", file);
    });

    // Add optional metadata
    if (dto?.tags) formData.append("tags", JSON.stringify(dto.tags));
    if (dto?.description) formData.append("description", dto.description);
    if (dto?.folder) formData.append("folder", dto.folder);
    if (dto?.entityType) formData.append("entityType", dto.entityType);
    if (dto?.entityId) formData.append("entityId", dto.entityId);
    if (dto?.field) formData.append("field", dto.field);

    return http.uploadFile<ApiResponse<{ images: ImageResponse[] }>>(
      API_ENDPOINTS.IMAGE_UPLOAD_MULTIPLE,
      formData,
      onProgress
        ? (progressEvent: AxiosProgressEvent) => {
            const progress = Math.round(
              ((progressEvent.loaded ?? 0) * 100) / (progressEvent.total ?? 1)
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
      API_ENDPOINTS.IMAGES,
      { params }
    );
  },

  /**
   * Get single image by ID
   */
  getById: (id: string) => {
    return http.get<ApiResponse<{ image: ImageResponse }>>(
      API_ENDPOINTS.IMAGE_BY_ID.replace(":id", id)
    );
  },

  /**
   * Get images by entity (blog, information, etc.)
   */
  getByEntity: (entityType: string, entityId: string) => {
    return http.get<ApiResponse<{ images: ImageResponse[] }>>(
      API_ENDPOINTS.IMAGE_BY_ENTITY
        .replace(":entityType", entityType)
        .replace(":entityId", entityId)
    );
  },

  /**
   * Update image metadata
   */
  update: (id: string, data: UpdateImageDto) => {
    return http.put<ApiResponse<{ image: ImageResponse }>>(
      API_ENDPOINTS.IMAGE_BY_ID.replace(":id", id),
      data
    );
  },

  /**
   * Add reference to image (track where it's used)
   */
  addReference: (id: string, data: AddReferenceDto) => {
    return http.post<ApiResponse<{ image: ImageResponse }>>(
      API_ENDPOINTS.IMAGE_REFERENCE.replace(":id", id),
      data
    );
  },

  /**
   * Remove reference from image
   */
  removeReference: (id: string, data: RemoveReferenceDto) => {
    return http.delete<ApiResponse<{ image: ImageResponse }>>(
      API_ENDPOINTS.IMAGE_REFERENCE.replace(":id", id),
      { data }
    );
  },

  /**
   * Transform image (create thumbnail, resize, etc.)
   */
  transform: (id: string, data: TransformImageDto) => {
    return http.post<ApiResponse<{ transformation: Record<string, unknown> }>>(
      API_ENDPOINTS.IMAGE_TRANSFORM.replace(":id", id),
      data
    );
  },

  /**
   * Delete image
   */
  delete: (id: string) => {
    return http.delete<ApiResponse>(
      API_ENDPOINTS.IMAGE_BY_ID.replace(":id", id)
    );
  },

  /**
   * Cleanup unused images (refCount = 0)
   */
  cleanupUnused: () => {
    return http.post<ApiResponse<{ deletedCount: number }>>(
      API_ENDPOINTS.IMAGE_CLEANUP
    );
  },

  /**
   * Upload by URL (if needed)
   */
  uploadByUrl: (imageUrl: string, dto?: UploadImageDto) => {
    return http.post<ApiResponse<{ image: ImageResponse }>>(
      API_ENDPOINTS.IMAGE_UPLOAD,
      { imageUrl, ...dto }
    );
  },
};
