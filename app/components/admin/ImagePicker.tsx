/**
 * Image Picker Component
 * Select from existing images or upload new ones
 * Integrated with backend image reference tracking
 */

'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { ImageResponseDto, PaginationResult } from '@/lib/types/api.types';
import { http } from '@/lib/http';
import { usePagination } from '@/lib/hooks/usePagination';
import OptimizedImage from '@/app/components/OptimizedImage';

export interface ImagePickerProps {
  value?: string; // Current image ID
  onChange: (imageId: string, imageUrl: string) => void;
  onRemove?: () => void;
  allowUpload?: boolean;
  multiple?: boolean;
  className?: string;
}

export default function ImagePicker({
  value,
  onChange,
  onRemove,
  allowUpload = true,
  multiple = false,
  className = '',
}: ImagePickerProps) {
  const { language } = useLanguage();
  const lang = language as 'vi' | 'en';

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<ImageResponseDto[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Pagination
  const pagination = usePagination({
    initialPage: 1,
    initialLimit: 12,
  });

  // Translations
  const translations = {
    vi: {
      selectImage: 'Chọn ảnh',
      changeImage: 'Thay đổi ảnh',
      removeImage: 'Xóa ảnh',
      searchPlaceholder: 'Tìm kiếm ảnh...',
      uploadNew: 'Tải ảnh mới lên',
      noImages: 'Không có ảnh nào',
      loading: 'Đang tải...',
      cancel: 'Hủy',
      select: 'Chọn',
      uploading: 'Đang tải lên...',
      uploadSuccess: 'Tải ảnh lên thành công',
      uploadError: 'Tải ảnh lên thất bại',
      loadError: 'Không thể tải danh sách ảnh',
      usedBy: 'Được sử dụng bởi',
      references: 'tham chiếu',
    },
    en: {
      selectImage: 'Select Image',
      changeImage: 'Change Image',
      removeImage: 'Remove Image',
      searchPlaceholder: 'Search images...',
      uploadNew: 'Upload New',
      noImages: 'No images found',
      loading: 'Loading...',
      cancel: 'Cancel',
      select: 'Select',
      uploading: 'Uploading...',
      uploadSuccess: 'Image uploaded successfully',
      uploadError: 'Failed to upload image',
      loadError: 'Failed to load images',
      usedBy: 'Used by',
      references: 'references',
    },
  };

  const t = translations[lang];

  // Load current image
  useEffect(() => {
    if (value && !selectedImage) {
      loadImage(value);
    }
  }, [value]);

  // Load images when modal opens
  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen, pagination.page, pagination.limit, searchTerm]);

  /**
   * Load single image by ID
   */
  const loadImage = async (imageId: string) => {
    try {
      const image = await http.get<ImageResponseDto>(`/images/${imageId}`);
      setSelectedImage(image);
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  };

  /**
   * Load images list
   */
  const loadImages = async () => {
    setIsLoading(true);

    try {
      const result = await http.get<PaginationResult<ImageResponseDto>>('/images', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm || undefined,
        },
      });

      setImages(result.items);
      pagination.updateFromResponse(result);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle image upload
   */
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const uploadedImage = await http.uploadFile<ImageResponseDto>('/images/upload', formData);
      
      // Add to list and select
      setImages((prev) => [uploadedImage, ...prev]);
      handleSelect(uploadedImage);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  /**
   * Handle image selection
   */
  const handleSelect = (image: ImageResponseDto) => {
    setSelectedImage(image);
    onChange(image._id, image.cloudinaryUrl);
    setIsOpen(false);
  };

  /**
   * Handle search
   */
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    pagination.reset();
  };

  return (
    <div className={className}>
      {/* Selected Image Preview */}
      {selectedImage ? (
        <div className="space-y-2">
          <div className="relative w-full h-48 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <OptimizedImage
              src={selectedImage.cloudinaryUrl}
              alt={selectedImage.description || 'Selected image'}
              preset="cardMedium"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              {t.changeImage}
            </button>

            {onRemove && (
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  onRemove();
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                {t.removeImage}
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex items-center justify-center"
        >
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {t.selectImage}
            </p>
          </div>
        </button>
      )}

      {/* Image Picker Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t.selectImage}
                </h3>

                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search & Upload */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Upload Button */}
                  {allowUpload && (
                    <label className="relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={isUploading}
                        className="sr-only"
                      />
                      <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap">
                        {isUploading ? t.uploading : t.uploadNew}
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Images Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">{t.loading}</p>
                  </div>
                ) : images.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">{t.noImages}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image) => (
                      <button
                        key={image._id}
                        onClick={() => handleSelect(image)}
                        className="group relative aspect-square border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                      >
                        <OptimizedImage
                          src={image.cloudinaryUrl}
                          alt={image.description || 'Image'}
                          preset="thumbnail"
                          className="w-full h-full object-cover"
                        />

                        {/* Overlay with info */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs text-center p-2">
                            {image.refCount > 0 && (
                              <div>
                                {image.refCount} {t.references}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {!isLoading && images.length > 0 && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={pagination.prevPage}
                      disabled={!pagination.hasPrevPage}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>

                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {pagination.page} / {pagination.totalPages}
                    </span>

                    <button
                      onClick={pagination.nextPage}
                      disabled={!pagination.hasNextPage}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
