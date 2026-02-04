/**
 * API Response Types - Match với Backend DTOs
 * Synced with backend_ts/src/modules/**
 **/

// Standard API Response format
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

// Pagination Result - Match Backend
export interface PaginationResult<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  total: number;
}

// ==================== IMAGE TYPES ====================
// Match: backend_ts/src/modules/image/image.dto.ts

export interface ImagePreview {
  _id: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
}

export interface ImageUsage {
  entityType: string;
  entityId: string;
  field: string;
  addedAt: Date;
}

export interface ImageTransformation {
  name: string;
  url: string;
  width?: number;
  height?: number;
}

export interface ImageResponseDto {
  _id: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  format?: string;
  folder: string;
  fileHash: string;
  refCount: number;
  usedBy: ImageUsage[];
  transformations: ImageTransformation[];
  tags?: string[];
  description?: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Alias for compatibility
export interface ImageResponse extends ImageResponseDto {}

export interface UploadImageDto {
  tags?: string[];
  description?: string;
  folder?: string;
  entityType?: 'blog' | 'user' | 'information' | 'other';
  entityId?: string;
  field?: string;
}

export interface UpdateImageDto {
  tags?: string[];
  description?: string;
}

export interface ImageQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string;
  folder?: string;
  entityType?: string;
  entityId?: string;
  uploadedBy?: string;
  unusedOnly?: boolean;
}

// Alias for compatibility
export interface ImageQueryParams extends ImageQueryDto {}

export interface AddReferenceDto {
  entityType: 'blog' | 'user' | 'information' | 'other';
  entityId: string;
  field: string;
}

export interface RemoveReferenceDto {
  entityType: 'blog' | 'user' | 'information' | 'other';
  entityId: string;
  field?: string;
}

export interface TransformImageDto {
  name: string;
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'limit' | 'pad' | 'thumb';
  quality?: number;
  format?: 'jpg' | 'png' | 'webp' | 'avif';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
}

// ==================== INFORMATION PREVIEW DTO ====================
// Used in Blog responses when informationId is populated

export interface InformationPreviewDto {
  _id: string;
  name: string;
  name_en: string;
  slug: string;
}

// ==================== BLOG TYPES ====================
// Match: backend_ts/src/modules/blog/blog.dto.ts

export interface BlogSection {
  title: string;
  title_en?: string;
  slug: string;
  type: string;
  content: string;
  content_en?: string;
}

export interface BlogResponseDto {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  author: string;
  image?: ImagePreview | null;
  excerpt?: string;
  excerpt_en?: string;
  informationId: InformationPreviewDto | string;
  tags: string[];
  sections: BlogSection[];
  isProduct: boolean;
  status: 'draft' | 'published';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Alias for compatibility
export interface Blog extends BlogResponseDto {
  _id?: string;
}

export interface CreateBlogDto {
  title: string;
  title_en?: string;
  author?: string;
  image?: string;
  excerpt?: string;
  excerpt_en?: string;
  informationId: string;
  tags?: string[];
  sections?: BlogSection[];
  isProduct?: boolean;
  status?: 'draft' | 'published';
}

export interface UpdateBlogDto {
  title?: string;
  title_en?: string;
  author?: string;
  image?: string;
  excerpt?: string;
  excerpt_en?: string;
  informationId?: string;
  tags?: string[];
  sections?: BlogSection[];
  isProduct?: boolean;
  status?: 'draft' | 'published';
}

export interface BlogQueryDto {
  page?: string;
  limit?: string;
  status?: 'draft' | 'published';
  isProduct?: string;
  search?: string;
  tags?: string;
}

// Alias for compatibility
export interface BlogQueryParams {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published';
  isProduct?: boolean | string;
  search?: string;
  tags?: string;
  informationId?: string;
  includeDescendants?: boolean;
}

// ==================== INFORMATION/CATEGORY TYPES ====================
// Match: backend_ts/src/modules/information/information.dto.ts

export interface InformationResponseDto {
  _id: string;
  name: string;
  name_en: string;
  slug: string;
  description?: string;
  description_en?: string;
  image?: ImagePreview | null;
  parentId?: string | null;
  order: number;
  isActive: boolean;
  children?: InformationResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InformationTreeDto extends InformationResponseDto {
  children: InformationTreeDto[];
}

// Alias for compatibility
export interface Information extends InformationResponseDto {
  id?: string;
}

export interface CreateInformationDto {
  name: string;
  name_en: string;
  description?: string;
  description_en?: string;
  image?: string;
  parentId?: string | null;
  order?: number;
  isActive?: boolean;
}

export interface UpdateInformationDto {
  name?: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  image?: string;
  parentId?: string | null;
  order?: number;
  isActive?: boolean;
}

export interface InformationQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string | null;
  isActive?: boolean;
  lang?: 'vi' | 'en';
}

// Alias for compatibility
export interface InformationQueryParams extends InformationQueryDto {}

// ==================== USER & AUTH TYPES ====================
// Match: backend_ts/src/modules/user/user.dto.ts

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Alias for compatibility
export interface User extends UserResponseDto {
  _id?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'user' | 'admin';
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
  phone?: string;
  avatar?: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserQueryDto {
  page?: string;
  limit?: string;
  role?: 'user' | 'admin';
  isActive?: string;
  search?: string;
}

// Alias for compatibility
export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: 'user' | 'admin';
  isActive?: boolean | string;
  search?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Alias for compatibility
export interface LoginCredentials extends LoginDto {}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

// Alias for compatibility
export interface RegisterData extends RegisterDto {}

export interface AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
}

// Alias for compatibility
export interface AuthResponse {
  user: User;
  token: string;
  accessToken?: string;
  refreshToken?: string;
}

// ==================== LEGACY TYPES (For Backward Compatibility) ====================

// // News Types (if needed)
// export interface NewsArticle {
//   _id?: string;
//   title: string;
//   category: string;
//   excerpt: string;
//   content: string;
//   featuredImage: string;
//   author: string;
//   publishDate: string;
//   status: "draft" | "published" | "archived";
//   createdAt?: string;
//   updatedAt?: string;
// }

// // Events Types
// export interface Event {
//   _id?: string;
//   name: string;
//   date: string;
//   location: string;
//   city: string;
//   country: string;
//   booth: string;
//   website: string;
//   logo?: string;
//   isPast?: boolean;
// }

// // Products Types
// export interface Product {
//   _id?: string;
//   name: string;
//   category: string;
//   description: string;
//   price?: number;
//   images: string[];
//   specifications?: Record<string, any>;
// }
