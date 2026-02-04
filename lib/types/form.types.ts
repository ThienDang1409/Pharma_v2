/**
 * Form Types - Centralized form data structures
 * Eliminates duplicate type definitions across components
 */

import type { BlogSection } from './api.types';

/**
 * Blog Form Data
 * Used in: admin/blogs/add, admin/blogs/edit
 */
export interface BlogFormData {
    title: string;
    title_en: string;
    author: string;
    excerpt: string;
    excerpt_en: string;
    informationId: string;
    tags: string[];
    sections: BlogSection[];
    isProduct: boolean;
    status: "draft" | "published";
    featuredImage?: string;
}

/**
 * Blog Form Handlers
 * Common handler signatures for blog forms
 */
export interface BlogFormHandlers {
    handleSubmit: (publishStatus: "draft" | "published") => Promise<void>;
    handleCancel: () => void;
    handleAddSection: () => void;
    handleRemoveSection: (index: number) => void;
    handleSectionChange: (index: number, field: string, value: string) => void;
}

/**
 * Image Upload Form Data
 */
export interface ImageUploadFormData {
    file: File | null;
    tags: string[];
    description: string;
    folder: string;
}

/**
 * Information/Category Form Data
 */
export interface InformationFormData {
    name: string;
    name_en: string;
    description?: string;
    description_en?: string;
    image?: string;
    parentId?: string | null;
    order?: number;
    isActive: boolean;
}
