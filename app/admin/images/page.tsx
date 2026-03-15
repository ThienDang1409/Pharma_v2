"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { imageApi, ImageResponse, ImageQueryParams } from "@/lib/api";
import { IMAGE_FOLDERS } from "@/lib/constants/api";
import { useToast } from "@/app/context/ToastContext";
import {
  formatFileSize,
  getImageUrl,
  apiFetch,
  apiMultiple,
} from "@/lib/utils";

export default function AdminImagesPage() {
  const [images, setImages] = useState<ImageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFolder, setFilterFolder] = useState("");
  const [filterUnused, setFilterUnused] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const toast = useToast();

  const fetchImages = useCallback(async () => {
    setLoading(true);
    const params: ImageQueryParams = {
      page: pagination.page,
      limit: pagination.limit,
    };

    if (searchQuery) params.search = searchQuery;
    if (filterFolder) params.folder = filterFolder;
    if (filterUnused) params.unusedOnly = true;

    await apiFetch(
      () => imageApi.getAll(params),
      {
        onSuccess: (data) => {
          if (data?.items) {
            setImages(data.items);
            setPagination((prev) => ({
              ...prev,
              total: data.total || 0,
              totalPages: data.totalPages || 0,
            }));
          }
        },
        onError: (error) => {
          console.error("Error fetching images:", error);
        },
      }
    );
    setLoading(false);
  }, [pagination.page, pagination.limit, searchQuery, filterFolder, filterUnused]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const fileArray = Array.from(files);

    try {
      if (fileArray.length === 1) {
        await apiFetch(
          () => imageApi.upload(fileArray[0], { folder: IMAGE_FOLDERS.UPLOADS }),
          {
            onSuccess: () => {
              toast.success("Image uploaded successfully!");
              fetchImages();
            },
            onError: (error) => {
              toast.error(error);
            },
          }
        );
      } else {
        await apiFetch(
          () => imageApi.uploadMultiple(fileArray, { folder: IMAGE_FOLDERS.UPLOADS }),
          {
            onSuccess: () => {
              toast.success(`${fileArray.length} images uploaded successfully!`);
              fetchImages();
            },
            onError: (error) => {
              toast.error(error);
            },
          }
        );
      }
    } finally {
      setUploading(false);
    }
  }, [fetchImages, toast]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    await apiFetch(
      () => imageApi.delete(id),
      {
        onSuccess: () => {
          toast.success("Image deleted successfully!");
          fetchImages();
        },
        onError: (error) => {
          toast.error(error);
        },
      }
    );
  }, [fetchImages, toast]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedImages.length === 0) return;
    if (!confirm(`Delete ${selectedImages.length} selected images?`)) return;

    await apiMultiple(
      selectedImages.map((id) => () => imageApi.delete(id)),
      {
        onAllSuccess: () => {
          toast.success(`${selectedImages.length} images deleted successfully!`);
          setSelectedImages([]);
          fetchImages();
        },
        onAnyError: (error) => {
          console.error("Delete error:", error);
        },
      }
    );
  }, [selectedImages, fetchImages, toast]);

  const handleCleanupUnused = useCallback(async () => {
    if (!confirm("Delete all unused images? This cannot be undone.")) return;

    await apiFetch(
      () => imageApi.cleanupUnused(),
      {
        onSuccess: (data) => {
          toast.success(`Deleted ${data?.deletedCount || 0} unused images`);
          fetchImages();
        },
        onError: (error) => {
          toast.error(error);
        },
      }
    );
  }, [fetchImages, toast]);

  const toggleImageSelection = useCallback((id: string) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedImages.length === images.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(images.map((img) => img._id));
    }
  }, [selectedImages.length, images]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Image Management</h1>
          <p className="text-gray-600 mt-1">
            Upload and manage images for your content
          </p>
        </div>

        {/* Upload Button */}
        <label className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors inline-flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Images
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Total Images</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{pagination.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Selected</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{selectedImages.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium">Current Page</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {pagination.page} / {pagination.totalPages}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <button
            onClick={handleCleanupUnused}
            className="text-sm text-orange-600 hover:text-orange-800 font-semibold"
          >
            🗑️ Cleanup Unused
          </button>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Folder Filter */}
          <div>
            <select
              value={filterFolder}
              onChange={(e) => setFilterFolder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Folders</option>
              <option value="uploads">Uploads</option>
              <option value="blogs">Blogs</option>
              <option value="categories">Categories</option>
              <option value="products">Products</option>
            </select>
          </div>

          {/* Unused Filter */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterUnused}
                onChange={(e) => setFilterUnused(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Unused Only</span>
            </label>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedImages.length > 0 && (
          <div className="mt-4 flex items-center gap-4 pt-4 border-t">
            <button
              onClick={toggleSelectAll}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {selectedImages.length === images.length ? "Deselect All" : "Select All"}
            </button>
            <button
              onClick={handleBulkDelete}
              className="text-sm text-red-600 hover:text-red-800 font-semibold"
            >
              Delete Selected ({selectedImages.length})
            </button>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-800">Uploading images...</p>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-600 text-lg">No images found</p>
          <p className="text-gray-500 text-sm mt-2">Upload your first image to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((image) => (
            <div
              key={image._id}
              className={`
                bg-white rounded-lg shadow-md overflow-hidden cursor-pointer
                transition-all hover:shadow-lg
                ${selectedImages.includes(image._id) ? "ring-2 ring-primary-500" : ""}
              `}
            >
              {/* Image Preview */}
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={getImageUrl(image.cloudinaryUrl, { width: 300, quality: 80 })}
                  alt={image.fileName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Checkbox Overlay */}
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedImages.includes(image._id)}
                    onChange={() => toggleImageSelection(image._id)}
                    className="w-5 h-5 text-primary-600 border-2 border-white rounded shadow-lg"
                  />
                </div>

                {/* Usage Badge */}
                {image.refCount > 0 && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    Used {image.refCount}x
                  </div>
                )}
              </div>

              {/* Image Info */}
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 truncate" title={image.fileName}>
                  {image.fileName}
                </p>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{formatFileSize(image.fileSize)}</span>
                  <span>
                    {image.width} × {image.height}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => window.open(image.cloudinaryUrl, "_blank")}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs py-1.5 rounded transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(image._id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs py-1.5 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setPagination((prev) => ({ ...prev, page }))}
                  className={`
                    px-4 py-2 rounded-lg font-medium
                    ${pagination.page === page
                      ? "bg-primary-600 text-white"
                      : "bg-white border border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
