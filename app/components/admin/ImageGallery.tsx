"use client";

import { useState, useEffect } from "react";
import { imageApi, ImageResponse, ImageQueryParams } from "@/lib/api";
import { useToast } from "@/app/context/ToastContext";
import { 
  getOptimizedImageUrl,
  imagePresets,
  formatFileSize, 
  extractData, 
  extractPaginationData,
  extractErrorMessage 
} from "@/lib/utils";

interface ImageGalleryProps {
  onSelect: (image: ImageResponse) => void;
  selectedImage?: ImageResponse | null;
  folder?: string;
  entityType?: 'blog' | 'user' | 'information' | 'other';
}

export default function ImageGallery({
  onSelect,
  selectedImage,
  folder,
  entityType,
}: ImageGalleryProps) {
  const [images, setImages] = useState<ImageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  useEffect(() => {
    fetchImages();
  }, [currentPage, searchQuery, folder, entityType]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      
      const params: ImageQueryParams = {
        page: currentPage,
        limit: 12,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (folder) params.folder = folder;
      if (entityType) params.entityType = entityType;

      const response = await imageApi.getAll(params);
      const data = extractData(response);
      
      if (data) {
        const extracted = extractPaginationData<ImageResponse>(data);
        setImages(extracted.items);
        setTotalPages(extracted.pagination.totalPages);
      }
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search images..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12">
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
          <p className="text-gray-600">No images found</p>
          <p className="text-gray-500 text-sm mt-1">Try different search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
          {images.map((image) => (
            <button
              key={image._id}
              onClick={() => onSelect(image)}
              className={`
                relative aspect-square bg-gray-100 rounded-lg overflow-hidden
                transition-all hover:ring-2 hover:ring-primary-400
                ${
                  selectedImage?._id === image._id
                    ? "ring-2 ring-primary-600"
                    : ""
                }
              `}
            >
              <img
                src={getImageUrl(image.cloudinaryUrl, { width: 200, quality: 80 })}
                alt={image.fileName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Selected Checkmark */}
              {selectedImage?._id === image._id && (
                <div className="absolute inset-0 bg-primary-600/20 flex items-center justify-center">
                  <div className="bg-primary-600 rounded-full p-1">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Image Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs truncate">{image.fileName}</p>
                <p className="text-white/80 text-xs">{formatFileSize(image.fileSize)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4 border-t">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Previous
          </button>
          
          <span className="px-3 py-1 text-sm text-gray-600">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
