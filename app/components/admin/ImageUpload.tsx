"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { imageApi, ImageResponse } from "@/lib/api";
import { useToast } from "@/app/context/ToastContext";
import { validateImageFile, createImagePreview, formatFileSize, extractErrorMessage } from "@/lib/utils";

interface ImageUploadProps {
  onUploadComplete?: (image: ImageResponse) => void;
  folder?: string;
  entityType?: 'blog' | 'user' | 'information' | 'other';
  entityId?: string;
  field?: string;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
}

export default function ImageUpload({
  onUploadComplete,
  folder = "uploads",
  entityType,
  entityId,
  field,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileSelection(files);
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileSelection(Array.from(files));
    }
  };

  const handleFileSelection = async (files: File[]) => {
    // Validate files
    for (const file of files) {
      const validation = validateImageFile(file, { maxSize });
      if (!validation.valid) {
        toast.error(validation.error || "Invalid file");
        return;
      }
    }

    // Create previews
    try {
      const previewUrls = await Promise.all(
        files.map((file) => createImagePreview(file))
      );
      setSelectedFiles(files);
      setPreviews(previewUrls);
    } catch (error) {
      toast.error("Failed to create preview");
    }
  };

  const handleConfirmUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      if (selectedFiles.length === 1) {
        // Single file upload
        const file = selectedFiles[0];

        const response = await imageApi.upload(
          file,
          {
            folder,
            entityType,
            entityId,
            field,
          },
          (progressValue) => setProgress(progressValue)
        );

        if (response.data?.image) {
          toast.success("Image uploaded successfully!");
          onUploadComplete?.(response.data.image);
          handleCancelUpload();
        }
      } else {
        // Multiple files upload
        const response = await imageApi.uploadMultiple(
          selectedFiles,
          {
            folder,
            entityType,
            entityId,
            field,
          },
          (progressValue) => setProgress(progressValue)
        );

        if (response.data?.images) {
          toast.success(`${selectedFiles.length} images uploaded successfully!`);
          response.data.images.forEach((image: ImageResponse) => {
            onUploadComplete?.(image);
          });
          handleCancelUpload();
        }
      }
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFiles([]);
    setPreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      {/* Show preview if files selected */}
      {selectedFiles.length > 0 && !uploading ? (
        <div className="space-y-4">
          {/* Preview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          {/* File Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{selectedFiles.length}</span> file(s) selected
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {selectedFiles.map((f) => f.name).join(", ")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirmUpload}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload ({selectedFiles.length})
            </button>
            <button
              onClick={handleCancelUpload}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : uploading ? (
        /* Upload Progress */
        <div className="space-y-4">
          {previews.length > 0 && previews[0] && (
            <img
              src={previews[0]}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg mx-auto"
            />
          )}
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="text-sm text-gray-600">Uploading... {progress}%</p>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      ) : (
        /* Drag & Drop Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragging
                ? "border-primary-500 bg-primary-50"
                : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
            }
          `}
        >
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragging ? "Drop images here" : "Click to upload or drag and drop"}
          </p>
          <p className="text-sm text-gray-500">
            {multiple ? "Multiple images" : "Single image"} • Max {formatFileSize(maxSize)}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            PNG, JPG, GIF, WEBP up to {formatFileSize(maxSize)}
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}
