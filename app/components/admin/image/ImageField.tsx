"use client";

import { useState } from "react";
import { ImageResponse, ImagePreview } from "@/lib/api";
import ImageSelector from "./ImageSelector";
import { getOptimizedImageUrl, imagePresets } from "@/lib/utils";

interface ImageFieldProps {
  label?: string;
  value?: ImagePreview | string | null;
  onChange: (imageId: string | null, imageData?: ImageResponse) => void;
  folder?: string;
  entityType?: 'blog' | 'user' | 'information' | 'other';
  entityId?: string;
  field?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

export default function ImageField({
  label = "Image",
  value,
  onChange,
  folder,
  entityType,
  entityId,
  field,
  required = false,
  error,
  helperText,
}: ImageFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<ImageResponse | null>(null);

  // Convert value to ImagePreview format
  const imagePreview: ImagePreview | null = value
    ? typeof value === "string"
      ? { _id: value, cloudinaryUrl: value, cloudinaryPublicId: "" }
      : value
    : null;

  const handleSelect = (image: ImageResponse) => {
    setCurrentImage(image);
    onChange(image._id, image);
  };

  const handleRemove = () => {
    setCurrentImage(null);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Image Preview or Placeholder */}
      <div className="space-y-3">
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={getOptimizedImageUrl(imagePreview.cloudinaryUrl, imagePresets.cardMedium())}
              alt="Selected"
              className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-200"
            />
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`
              w-full max-w-md h-48 border-2 border-dashed rounded-lg
              flex flex-col items-center justify-center gap-3
              transition-all
              ${
                error
                  ? "border-red-300 bg-red-50 hover:bg-red-100"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-primary-400"
              }
            `}
          >
            <svg
              className={`w-12 h-12 ${error ? "text-red-400" : "text-gray-400"}`}
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
            <div>
              <p className={`font-medium ${error ? "text-red-600" : "text-gray-700"}`}>
                Click to select image
              </p>
              <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
            </div>
          </button>
        )}
      </div>

      {/* Helper Text or Error */}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && helperText && <p className="text-sm text-gray-500">{helperText}</p>}

      {/* Image Selector Modal */}
      <ImageSelector
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelect}
        currentImage={currentImage}
        folder={folder}
        entityType={entityType}
        entityId={entityId}
        field={field}
      />
    </div>
  );
}
