"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { imageApi, ImageResponse, ImageQueryParams } from "@/lib/api";
import { IMAGE_FOLDERS } from "@/lib/constants/api";
import {
  Upload,
  Search,
  Trash2,
  RefreshCw,
  Image as LucideImage,
  Check,
  ExternalLink,
  Filter,
  Layers,
  CheckCircle2,
  Trash
} from "lucide-react";
import {
  formatFileSize,
  getImageUrl,
  apiFetch,
  apiMultiple,
} from "@/lib/utils";
import { useToast } from "@/app/context/ToastContext";
import CustomSelect from "@/app/components/admin/CustomSelect";

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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="admin-card border border-gray-200/80 rounded-3xl p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end justify-center gap-6">
          <label className="flex items-center gap-2 px-8 py-4 bg-primary-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl shadow-primary-900/20 active:scale-95 cursor-pointer">
          <Upload size={16} /> Tải ảnh lên
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
      </div>

      {/* Stats Quick Status */}
      <div className="admin-card border border-gray-200/80 rounded-3xl p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card p-6 border-l-4 border-primary-900">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng số ảnh</p>
          <p className="text-2xl font-black text-gray-900 tracking-tighter">{pagination.total}</p>
        </div>
        <div className="admin-card p-6 border-l-4 border-gray-900">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Đang chọn</p>
          <p className="text-2xl font-black text-gray-900 tracking-tighter">{selectedImages.length}</p>
        </div>
        <div className="admin-card p-6 border-l-4 border-gray-200">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Trang hiện tại</p>
          <p className="text-2xl font-black text-gray-900 tracking-tighter">
            {pagination.page} <span className="text-sm text-gray-400 font-bold">/ {pagination.totalPages}</span>
          </p>
        </div>
        <div className="admin-card p-6 bg-gray-50 flex items-center justify-center">
          <button
            onClick={handleCleanupUnused}
            className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-widest hover:text-orange-900 transition-colors"
          >
            <RefreshCw size={14} /> Dọn dẹp rác
          </button>
        </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="admin-card p-6 border border-gray-200/80">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search */}
          <div className="md:col-span-5 relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-900 transition-colors pointer-events-none">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm tài nguyên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input pl-14 h-12"
            />
          </div>

          {/* Folder Filter */}
          <div className="md:col-span-3 relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-900 transition-colors pointer-events-none z-10">
              <Layers size={18} />
            </div>
            <CustomSelect
              options={[
                { label: "Tất cả thư mục", value: "" },
                { label: "Tải lên", value: "uploads" },
                { label: "Bài viết", value: "blogs" },
                { label: "Danh mục", value: "categories" },
                { label: "Sản phẩm", value: "products" },
              ]}
              value={filterFolder}
              onChange={(value) => setFilterFolder(value as string)}
              placeholder="Chọn thư mục..."
              className="pl-14"
            />
          </div>

          {/* Configuration */}
          <div className="md:col-span-4 flex items-center justify-between pl-4 border-l border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filterUnused}
                onChange={(e) => setFilterUnused(e.target.checked)}
                className="admin-checkbox !w-5 !h-5"
              />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900">Ảnh chưa dùng</span>
            </label>

            {selectedImages.length > 0 && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
                <button
                  onClick={toggleSelectAll}
                  className="text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest"
                >
                  {selectedImages.length === images.length ? "Bỏ chọn" : "Tất cả"}
                </button>
                <div className="w-[1px] h-4 bg-gray-200 mx-1" />
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                >
                  <Trash size={12} /> Xóa {selectedImages.length}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Uploading Progress Overlay */}
      {uploading && (
        <div className="flex items-center gap-3 p-6 bg-primary-900 text-white rounded-2xl shadow-xl shadow-primary-900/20 animate-pulse">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <p className="text-[10px] font-black uppercase tracking-widest">Đang tải tài nguyên lên hệ thống...</p>
        </div>
      )}

      {/* Grid Section */}
      {loading ? (
        <div className="flex items-center justify-center py-40">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đang kết nối thư viện...</p>
          </div>
        </div>
      ) : images.length === 0 ? (
        <div className="admin-card p-40 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-200">
            <LucideImage size={40} className="text-gray-200" />
          </div>
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Thư viện trống</h3>
          <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">HÃY TẢI HÌNH ẢNH ĐẦU TIÊN LÊN</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {images.map((image) => {
            const isSelected = selectedImages.includes(image._id);
            return (
              <div
                key={image._id}
                className={`
                  admin-card p-0 overflow-hidden cursor-pointer group transition-all duration-300
                  ${isSelected ? "ring-2 ring-primary-900 shadow-xl" : "hover:shadow-2xl hover:-translate-y-1"}
                `}
              >
                {/* Media Container */}
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  <img
                    src={getImageUrl(image.cloudinaryUrl, { width: 400, quality: 80 })}
                    alt={image.fileName}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isSelected ? "opacity-75" : ""}`}
                    loading="lazy"
                  />

                  {/* Multi-select overlay */}
                  {/* Multi-select overlay */}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleImageSelection(image._id)}
                      className="admin-checkbox"
                    />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {image.refCount > 0 && (
                      <div className="bg-primary-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-lg">
                        DÙNG {image.refCount}x
                      </div>
                    )}
                  </div>

                  {/* Hover Actions Bottom */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); window.open(image.cloudinaryUrl, "_blank"); }}
                      className="flex-1 h-10 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-colors"
                    >
                      <ExternalLink size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(image._id); }}
                      className="flex-1 h-10 bg-red-500/80 backdrop-blur-md hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Metadata Area */}
                <div className="p-5">
                  <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-tight truncate leading-tight group-hover:text-primary-900 transition-colors" title={image.fileName}>
                    {image.fileName}
                  </h4>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatFileSize(image.fileSize)}</span>
                    <span className="text-[10px] font-bold text-gray-400 tracking-widest">{image.width}×{image.height}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-8 pb-12">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-primary-900 hover:border-primary-900 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            ←
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              const page = i + 1;
              const isActive = pagination.page === page;
              return (
                <button
                  key={page}
                  onClick={() => setPagination((prev) => ({ ...prev, page }))}
                  className={`
                    w-12 h-12 rounded-xl text-[10px] font-black transition-all
                    ${isActive
                      ? "bg-primary-900 text-white shadow-xl shadow-primary-900/20"
                      : "bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-900"
                    }
                  `}
                >
                  {page.toString().padStart(2, '0')}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-primary-900 hover:border-primary-900 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
