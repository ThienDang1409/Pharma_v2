"use client";

import { useState } from "react";
import { ImageResponse } from "@/lib/api";
import ImageUpload from "./ImageUpload";
import ImageGallery from "./ImageGallery";

interface ImageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (image: ImageResponse) => void;
  currentImage?: ImageResponse | null;
  folder?: string;
  entityType?: 'blog' | 'user' | 'information' | 'other';
  entityId?: string;
  field?: string;
}

export default function ImageSelector({
  isOpen,
  onClose,
  onSelect,
  currentImage,
  folder,
  entityType,
  entityId,
  field,
}: ImageSelectorProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "gallery">("gallery");
  const [selectedImage, setSelectedImage] = useState<ImageResponse | null>(
    currentImage || null
  );

  if (!isOpen) return null;

  const handleSelect = (image: ImageResponse) => {
    setSelectedImage(image);
  };

  const handleConfirm = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      onClose();
    }
  };

  const handleUploadComplete = (image: ImageResponse) => {
    setSelectedImage(image);
    setActiveTab("gallery");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Select Image</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("gallery")}
            className={`
              flex-1 py-3 px-6 font-medium transition-colors
              ${
                activeTab === "gallery"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600 hover:text-gray-800"
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              Gallery
            </div>
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`
              flex-1 py-3 px-6 font-medium transition-colors
              ${
                activeTab === "upload"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600 hover:text-gray-800"
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
              </svg>
              Upload New
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "gallery" ? (
            <ImageGallery
              onSelect={handleSelect}
              selectedImage={selectedImage}
              folder={folder}
              entityType={entityType}
            />
          ) : (
            <ImageUpload
              onUploadComplete={handleUploadComplete}
              folder={folder}
              entityType={entityType}
              entityId={entityId}
              field={field}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          {selectedImage ? (
            <div className="flex items-center gap-3">
              <img
                src={selectedImage.cloudinaryUrl}
                alt={selectedImage.fileName}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="text-sm">
                <p className="font-medium text-gray-800">{selectedImage.fileName}</p>
                <p className="text-gray-500">
                  {selectedImage.width} × {selectedImage.height}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No image selected</div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedImage}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Select Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
