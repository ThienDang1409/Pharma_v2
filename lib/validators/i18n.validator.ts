/**
 * Zod Validators with Internationalization (i18n)
 * Bilingual support: Vietnamese (vi) and English (en)
 * Migration from: lib/utils/validation.ts
 */

import { z } from 'zod';

// i18n message definitions
export const i18nMessages = {
  vi: {
    // Auth
    'email.required': 'Email là bắt buộc',
    'email.invalid': 'Email không hợp lệ',
    'password.required': 'Mật khẩu là bắt buộc',
    'password.minLength': 'Mật khẩu phải có ít nhất 6 ký tự',
    'password.maxLength': 'Mật khẩu không được vượt quá 255 ký tự',
    'name.required': 'Tên là bắt buộc',
    'name.minLength': 'Tên phải có ít nhất 2 ký tự',
    'name.maxLength': 'Tên không được vượt quá 100 ký tự',
    'phone.invalid': 'Số điện thoại không hợp lệ',
    'address.maxLength': 'Địa chỉ không được vượt quá 255 ký tự',

    // Blog
    'title.required': 'Tiêu đề là bắt buộc',
    'title.minLength': 'Tiêu đề phải có ít nhất 3 ký tự',
    'title.maxLength': 'Tiêu đề không được vượt quá 200 ký tự',
    'title_en.minLength': 'Tiêu đề tiếng Anh phải có ít nhất 3 ký tự',
    'title_en.maxLength': 'Tiêu đề tiếng Anh không được vượt quá 200 ký tự',
    'slug.required': 'URL slug là bắt buộc',
    'slug.invalid': 'URL slug chứa ký tự không hợp lệ',
    'excerpt.maxLength': 'Trích dẫn không được vượt quá 500 ký tự',
    'excerpt_en.maxLength': 'Trích dẫn tiếng Anh không được vượt quá 500 ký tự',
    'content.required': 'Nội dung là bắt buộc',
    'content.minLength': 'Nội dung phải có ít nhất 10 ký tự',
    'author.required': 'Tên tác giả là bắt buộc',
    'author.maxLength': 'Tên tác giả không được vượt quá 100 ký tự',
    'category.required': 'Danh mục là bắt buộc',
    'tags.minItems': 'Phải chọn ít nhất 1 tag',
    'published.invalid': 'Trạng thái công bố không hợp lệ',
    'publishedAt.invalid': 'Ngày công bố không hợp lệ',

    // Information
    'information.title.required': 'Tiêu đề thông tin là bắt buộc',
    'information.title.minLength': 'Tiêu đề phải có ít nhất 3 ký tự',
    'information.title.maxLength': 'Tiêu đề không được vượt quá 200 ký tự',
    'information.description.maxLength': 'Mô tả không được vượt quá 1000 ký tự',

    // Image
    'image.file.required': 'File hình ảnh là bắt buộc',
    'image.file.invalid': 'File không hợp lệ (chỉ hỗ trợ JPG, PNG, WebP)',
    'image.size.tooBig': 'Kích thước ảnh không được vượt quá 10MB',
    'image.width.invalid': 'Chiều rộng phải là số dương',
    'image.height.invalid': 'Chiều cao phải là số dương',
    'image.quality.invalid': 'Chất lượng phải từ 1 đến 100',

    // Change password
    'currentPassword.required': 'Mật khẩu hiện tại là bắt buộc',
    'newPassword.required': 'Mật khẩu mới là bắt buộc',
    'newPassword.minLength': 'Mật khẩu mới phải có ít nhất 6 ký tự',
    'confirmPassword.required': 'Xác nhận mật khẩu là bắt buộc',
    'confirmPassword.notMatch': 'Mật khẩu xác nhận không khớp',
    
    // Admin User Management
    'role.required': 'Vai trò là bắt buộc',
    'role.invalid': 'Vai trò không hợp lệ',
    'isActive.invalid': 'Trạng thái không hợp lệ',

    // Information Additional
    'information.name.required': 'Tên danh mục là bắt buộc',
    'information.name.minLength': 'Tên phải có ít nhất 2 ký tự',
    'information.name.maxLength': 'Tên không được vượt quá 200 ký tự',
    'information.description.minLength': 'Mô tả phải có ít nhất 10 ký tự',
    'information.order.invalid': 'Thứ tự phải là số nguyên dương',
    'information.parentId.invalid': 'ID danh mục cha không hợp lệ',

    // Image Additional
    'image.entityType.required': 'Loại thực thể là bắt buộc',
    'image.entityId.required': 'ID thực thể là bắt buộc',
    'image.field.required': 'Tên trường là bắt buộc',
    'image.tags.invalid': 'Tags phải là một mảng',
    'image.description.maxLength': 'Mô tả không được vượt quá 500 ký tự',

    // Blog Additional
    'blog.section.title.required': 'Tiêu đề phần là bắt buộc',
    'blog.section.slug.required': 'URL slug phần là bắt buộc',
    'blog.section.type.required': 'Loại phần là bắt buộc',
    'blog.sections.minItems': 'Phải có ít nhất 1 phần nội dung',
  },

  en: {
    // Auth
    'email.required': 'Email is required',
    'email.invalid': 'Invalid email format',
    'password.required': 'Password is required',
    'password.minLength': 'Password must be at least 6 characters',
    'password.maxLength': 'Password must not exceed 255 characters',
    'name.required': 'Name is required',
    'name.minLength': 'Name must be at least 2 characters',
    'name.maxLength': 'Name must not exceed 100 characters',
    'phone.invalid': 'Invalid phone number',
    'address.maxLength': 'Address must not exceed 255 characters',

    // Blog
    'title.required': 'Title is required',
    'title.minLength': 'Title must be at least 3 characters',
    'title.maxLength': 'Title must not exceed 200 characters',
    'title_en.minLength': 'English title must be at least 3 characters',
    'title_en.maxLength': 'English title must not exceed 200 characters',
    'slug.required': 'URL slug is required',
    'slug.invalid': 'URL slug contains invalid characters',
    'excerpt.maxLength': 'Excerpt must not exceed 500 characters',
    'excerpt_en.maxLength': 'English excerpt must not exceed 500 characters',
    'content.required': 'Content is required',
    'content.minLength': 'Content must be at least 10 characters',
    'author.required': 'Author name is required',
    'author.maxLength': 'Author name must not exceed 100 characters',
    'category.required': 'Category is required',
    'tags.minItems': 'At least one tag must be selected',
    'published.invalid': 'Invalid publish status',
    'publishedAt.invalid': 'Invalid publish date',

    // Information
    'information.title.required': 'Information title is required',
    'information.title.minLength': 'Title must be at least 3 characters',
    'information.title.maxLength': 'Title must not exceed 200 characters',
    'information.description.maxLength': 'Description must not exceed 1000 characters',

    // Image
    'image.file.required': 'Image file is required',
    'image.file.invalid': 'Invalid file (only JPG, PNG, WebP supported)',
    'image.size.tooBig': 'Image size must not exceed 10MB',
    'image.width.invalid': 'Width must be a positive number',
    'image.height.invalid': 'Height must be a positive number',
    'image.quality.invalid': 'Quality must be between 1 and 100',

    // Change password
    'currentPassword.required': 'Current password is required',
    'newPassword.required': 'New password is required',
    'newPassword.minLength': 'New password must be at least 6 characters',
    'confirmPassword.required': 'Password confirmation is required',
    'confirmPassword.notMatch': 'Passwords do not match',

    // Admin User Management
    'role.required': 'Role is required',
    'role.invalid': 'Invalid role',
    'isActive.invalid': 'Invalid status',

    // Information Additional
    'information.name.required': 'Category name is required',
    'information.name.minLength': 'Name must be at least 2 characters',
    'information.name.maxLength': 'Name must not exceed 200 characters',
    'information.description.minLength': 'Description must be at least 10 characters',
    'information.order.invalid': 'Order must be a positive integer',
    'information.parentId.invalid': 'Parent category ID is invalid',

    // Image Additional
    'image.entityType.required': 'Entity type is required',
    'image.entityId.required': 'Entity ID is required',
    'image.field.required': 'Field name is required',
    'image.tags.invalid': 'Tags must be an array',
    'image.description.maxLength': 'Description must not exceed 500 characters',

    // Blog Additional
    'blog.section.title.required': 'Section title is required',
    'blog.section.slug.required': 'Section URL slug is required',
    'blog.section.type.required': 'Section type is required',
    'blog.sections.minItems': 'At least one content section is required',
  },
};

export type I18nLanguage = 'vi' | 'en';

/**
 * Get i18n message by key and language
 */
export function getMessage(key: string, lang: I18nLanguage = 'vi'): string {
  const messages = i18nMessages[lang] as Record<string, string>;
  return messages[key] || key;
}

/**
 * Helper to create Zod messages with i18n
 */
export const createZodMessage = (key: string, lang: I18nLanguage = 'vi') => ({
  [key]: getMessage(key, lang),
});

// ==================== AUTH VALIDATORS ====================

export const RegisterSchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    email: z
      .string({ message: getMessage('email.required', lang) })
      .email(getMessage('email.invalid', lang)),
    password: z
      .string({ message: getMessage('password.required', lang) })
      .min(6, getMessage('password.minLength', lang))
      .max(255, getMessage('password.maxLength', lang)),
    name: z
      .string({ message: getMessage('name.required', lang) })
      .min(2, getMessage('name.minLength', lang))
      .max(100, getMessage('name.maxLength', lang)),
    phone: z.string().optional(),
    address: z.string().optional(),
  });

export const LoginSchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    email: z
      .string({ message: getMessage('email.required', lang) })
      .email(getMessage('email.invalid', lang)),
    password: z.string({ message: getMessage('password.required', lang) }),
  });

export const UpdateProfileSchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    name: z
      .string()
      .min(2, getMessage('name.minLength', lang))
      .max(100, getMessage('name.maxLength', lang))
      .optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  });

export const ChangePasswordSchemaI18n = (lang: I18nLanguage = 'vi') =>
  z
    .object({
      currentPassword: z.string({ message: getMessage('currentPassword.required', lang) }),
      newPassword: z
        .string({ message: getMessage('newPassword.required', lang) })
        .min(6, getMessage('newPassword.minLength', lang)),
      confirmPassword: z.string({ message: getMessage('confirmPassword.required', lang) }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: getMessage('confirmPassword.notMatch', lang),
      path: ['confirmPassword'],
    });

// ==================== BLOG VALIDATORS ====================

export const CreateBlogSchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    title: z
      .string({ message: getMessage('title.required', lang) })
      .min(3, getMessage('title.minLength', lang))
      .max(200, getMessage('title.maxLength', lang)),
    title_en: z
      .string()
      .min(3, getMessage('title_en.minLength', lang))
      .max(200, getMessage('title_en.maxLength', lang))
      .optional(),
    slug: z
      .string({ message: getMessage('slug.required', lang) })
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, getMessage('slug.invalid', lang)),
    excerpt: z
      .string()
      .max(500, getMessage('excerpt.maxLength', lang))
      .optional(),
    excerpt_en: z
      .string()
      .max(500, getMessage('excerpt_en.maxLength', lang))
      .optional(),
    content: z
      .string({ message: getMessage('content.required', lang) })
      .min(10, getMessage('content.minLength', lang)),
    author: z
      .string({ message: getMessage('author.required', lang) })
      .max(100, getMessage('author.maxLength', lang)),
    categoryId: z
      .number({ message: getMessage('category.required', lang) })
      .int(),
    tags: z.array(z.string()).optional(),
    published: z.boolean().optional(),
    publishedAt: z.string().datetime().optional(),
  });

export const UpdateBlogSchemaI18n = (lang: I18nLanguage = 'vi') =>
  CreateBlogSchemaI18n(lang).partial();

// Blog Section Schema
export const BlogSectionSchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    title: z.string({ message: getMessage('blog.section.title.required', lang) }),
    title_en: z.string().optional(),
    slug: z.string({ message: getMessage('blog.section.slug.required', lang) }),
    type: z.string({ message: getMessage('blog.section.type.required', lang) }),
    content: z
      .string({ message: getMessage('content.required', lang) })
      .min(10, getMessage('content.minLength', lang)),
    content_en: z.string().optional(),
  });

// Blog Query Schema
export const BlogQuerySchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).optional().default(1),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).optional().default(10),
    status: z.enum(['draft', 'published']).optional(),
    isProduct: z.string().optional(),
    search: z.string().optional(),
    tags: z.string().optional(),
  });

// ==================== USER VALIDATORS (Additional) ====================

export const UpdateUserSchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    email: z.string().email(getMessage('email.invalid', lang)).optional(),
    name: z
      .string()
      .min(2, getMessage('name.minLength', lang))
      .max(100, getMessage('name.maxLength', lang))
      .optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    role: z.enum(['user', 'admin'], { message: getMessage('role.invalid', lang) }).optional(),
    isActive: z.boolean({ message: getMessage('isActive.invalid', lang) }).optional(),
  });

export const UserQuerySchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)).default(1),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)).default(10),
    search: z.string().optional(),
    role: z.enum(['user', 'admin']).optional(),
    isActive: z.string().optional().transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  });

// ==================== INFORMATION VALIDATORS ====================

export const CreateInformationSchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    title: z
      .string({ message: getMessage('information.title.required', lang) })
      .min(3, getMessage('information.title.minLength', lang))
      .max(200, getMessage('information.title.maxLength', lang)),
    title_en: z
      .string()
      .min(3, getMessage('information.title.minLength', lang))
      .max(200, getMessage('information.title.maxLength', lang))
      .optional(),
    description: z
      .string()
      .max(1000, getMessage('information.description.maxLength', lang))
      .optional(),
    description_en: z.string().optional(),
    image: z.string().optional(),
    parentId: z.string().nullable().optional(),
    order: z.number({ message: getMessage('information.order.invalid', lang) }).int().min(0).optional(),
    isActive: z.boolean().optional(),
  });

export const UpdateInformationSchemaI18n = (lang: I18nLanguage = 'vi') =>
  CreateInformationSchemaI18n(lang).partial();

export const InformationQuerySchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)).default(1),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)).default(10),
    search: z.string().optional(),
    parentId: z.string().nullable().optional(),
    isActive: z.string().optional().transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
    lang: z.enum(['vi', 'en']).optional(),
  });

export const ReorderInformationSchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    items: z.array(
      z.object({
        id: z.string(),
        order: z.number({ message: getMessage('information.order.invalid', lang) }).int().min(0),
      })
    ),
  });

// ==================== IMAGE VALIDATORS ====================

export const UploadImageSchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    tags: z.array(z.string()).optional(),
    description: z.string().max(500, getMessage('image.description.maxLength', lang)).optional(),
    folder: z.string().optional(),
    entityType: z.enum(['blog', 'user', 'information', 'other'], { message: getMessage('image.entityType.required', lang) }).optional(),
    entityId: z.string({ message: getMessage('image.entityId.required', lang) }).optional(),
    field: z.string({ message: getMessage('image.field.required', lang) }).optional(),
  });

export const UpdateImageSchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    tags: z.array(z.string(), { message: getMessage('image.tags.invalid', lang) }).optional(),
    description: z.string().max(500, getMessage('image.description.maxLength', lang)).optional(),
  });

export const ImageQuerySchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)).default(1),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)).default(20),
    search: z.string().optional(),
    tags: z.string().optional(),
    folder: z.string().optional(),
    entityType: z.enum(['blog', 'user', 'information', 'other']).optional(),
    entityId: z.string().optional(),
    uploadedBy: z.string().optional(),
    unusedOnly: z.string().optional().transform((val) => val === 'true'),
  });

export const AddReferenceSchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    entityType: z.enum(['blog', 'user', 'information', 'other'], { message: getMessage('image.entityType.required', lang) }),
    entityId: z.string({ message: getMessage('image.entityId.required', lang) }),
    field: z.string({ message: getMessage('image.field.required', lang) }),
  });

export const RemoveReferenceSchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    entityType: z.enum(['blog', 'user', 'information', 'other'], { message: getMessage('image.entityType.required', lang) }),
    entityId: z.string({ message: getMessage('image.entityId.required', lang) }),
    field: z.string().optional(),
  });

export const TransformImageSchemaI18n = (lang: I18nLanguage = 'vi') =>
  z.object({
    width: z.number({ message: getMessage('image.width.invalid', lang) }).positive(getMessage('image.width.invalid', lang)).optional(),
    height: z.number({ message: getMessage('image.height.invalid', lang) }).positive(getMessage('image.height.invalid', lang)).optional(),
    quality: z
      .number({ message: getMessage('image.quality.invalid', lang) })
      .min(1, getMessage('image.quality.invalid', lang))
      .max(100, getMessage('image.quality.invalid', lang))
      .optional(),
    format: z.enum(['jpeg', 'png', 'webp']).optional(),
  });

// ==================== EXPORTS ====================

// Get all schemas for a language
export const getValidatorsForLang = (lang: I18nLanguage = 'vi') => ({
  // Auth
  RegisterSchema: RegisterSchemaI18n(lang),
  LoginSchema: LoginSchemaI18n(lang),
  UpdateProfileSchema: UpdateProfileSchemaI18n(lang),
  ChangePasswordSchema: ChangePasswordSchemaI18n(lang),

  // Blog
  CreateBlogSchema: CreateBlogSchemaI18n(lang),
  UpdateBlogSchema: UpdateBlogSchemaI18n(lang),
  BlogSectionSchema: BlogSectionSchemaI18n(lang),
  BlogQuerySchema: BlogQuerySchemaI18n(lang),

  // User
  UpdateUserSchema: UpdateUserSchemaI18n(lang),
  UserQuerySchema: UserQuerySchemaI18n(lang),

  // Information
  CreateInformationSchema: CreateInformationSchemaI18n(lang),
  UpdateInformationSchema: UpdateInformationSchemaI18n(lang),
  InformationQuerySchema: InformationQuerySchemaI18n(lang),
  ReorderInformationSchema: ReorderInformationSchemaI18n(lang),

  // Image
  UploadImageSchema: UploadImageSchemaI18n(lang),
  UpdateImageSchema: UpdateImageSchemaI18n(lang),
  ImageQuerySchema: ImageQuerySchemaI18n(lang),
  AddReferenceSchema: AddReferenceSchemaI18n(lang),
  RemoveReferenceSchema: RemoveReferenceSchemaI18n(lang),
  TransformImageSchema: TransformImageSchemaI18n(lang),
});

export default {
  i18nMessages,
  getMessage,
  getValidatorsForLang,

  // Default (Vietnamese) - Auth
  RegisterSchema: RegisterSchemaI18n('vi'),
  LoginSchema: LoginSchemaI18n('vi'),
  UpdateProfileSchema: UpdateProfileSchemaI18n('vi'),
  ChangePasswordSchema: ChangePasswordSchemaI18n('vi'),

  // Blog
  CreateBlogSchema: CreateBlogSchemaI18n('vi'),
  UpdateBlogSchema: UpdateBlogSchemaI18n('vi'),
  BlogSectionSchema: BlogSectionSchemaI18n('vi'),
  BlogQuerySchema: BlogQuerySchemaI18n('vi'),

  // User
  UpdateUserSchema: UpdateUserSchemaI18n('vi'),
  UserQuerySchema: UserQuerySchemaI18n('vi'),

  // Information
  CreateInformationSchema: CreateInformationSchemaI18n('vi'),
  UpdateInformationSchema: UpdateInformationSchemaI18n('vi'),
  InformationQuerySchema: InformationQuerySchemaI18n('vi'),
  ReorderInformationSchema: ReorderInformationSchemaI18n('vi'),

  // Image
  UploadImageSchema: UploadImageSchemaI18n('vi'),
  UpdateImageSchema: UpdateImageSchemaI18n('vi'),
  ImageQuerySchema: ImageQuerySchemaI18n('vi'),
  AddReferenceSchema: AddReferenceSchemaI18n('vi'),
  RemoveReferenceSchema: RemoveReferenceSchemaI18n('vi'),
  TransformImageSchema: TransformImageSchemaI18n('vi'),
};
