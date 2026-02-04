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
  const [preview, setPreview] = useState<string | null>(null);
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
      await handleUpload(files);
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleUpload(Array.from(files));
    }
  };

  const handleUpload = async (files: File[]) => {
    // Validate files
    for (const file of files) {
      const validation = validateImageFile(file, { maxSize });
      if (!validation.valid) {
        toast.error(validation.error || "Invalid file");
        return;
      }
    }

    setUploading(true);
    setProgress(0);

    try {
      if (files.length === 1) {
        // Single file upload
        const file = files[0];
        
        // Create preview
        const previewUrl = await createImagePreview(file);
        setPreview(previewUrl);

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
          setPreview(null);
        }
      } else {
        // Multiple files upload
        const response = await imageApi.uploadMultiple(
          files,
          {
            folder,
            entityType,
            entityId,
            field,
          },
          (progressValue) => setProgress(progressValue)
        );

        if (response.data?.images) {
          toast.success(`${files.length} images uploaded successfully!`);
          response.data.images.forEach((image: ImageResponse) => {
            onUploadComplete?.(image);
          });
        }
      }
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="w-full">
      {/* Drag & Drop Area */}
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
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        {uploading ? (
          <div className="space-y-4">
            {preview && (
              <img
                src={preview}
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
          <>
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
          </>
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
    </div>
  );
}
