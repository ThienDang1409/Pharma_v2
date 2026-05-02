"use client";

import React, { useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Images, Trash2, Edit2, ChevronLeft, ChevronRight, Type } from "lucide-react";

interface ImageItem {
  id: string;
  url: string;
  caption: string;
}

interface ImageSliderNodeAttrs {
  images?: ImageItem[];
  autoplay?: boolean;
  showPagination?: boolean;
}

interface ImageSliderNode {
  attrs: ImageSliderNodeAttrs;
}

interface ImageSliderNodeViewProps {
  node: ImageSliderNode;
}

export default function ImageSliderNodeView(props: ReactNodeViewProps) {
  const { node, deleteNode, getPos } = props;
  const typedNode = node as typeof node & ImageSliderNodeViewProps["node"];
  const images = typedNode.attrs.images || [];
  const [activeIndex, setActiveIndex] = useState(0);

  const handleEdit = () => {
    const event = new CustomEvent("editor:open-image-slider-modal", {
      detail: {
        images,
        pos: getPos(),
        autoplay: typedNode.attrs.autoplay,
        showPagination: typedNode.attrs.showPagination,
      }
    });
    window.dispatchEvent(event);
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <NodeViewWrapper className="image-slider-node my-12 group relative">
      <div className="bg-white rounded-[32px] border-2 border-dashed border-gray-100 p-8 transition-all hover:border-primary-200 hover:bg-primary-50/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary-50 text-primary-900">
              <Images size={24} />
            </div>
            <div>
              <h4 className="text-lg font-black text-gray-950 uppercase tracking-tight">
                Slide Hình Ảnh
                <span className="ml-3 text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                  {images.length} ảnh
                </span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEdit}
              className="p-2.5 bg-white text-gray-600 rounded-xl shadow-sm border border-gray-100 hover:text-primary-900 hover:border-primary-200 hover:bg-primary-50 transition-all"
              title="Chỉnh sửa slide"
            >
              <Edit2 size={18} />
            </button>
            <button
              type="button"
              onClick={() => deleteNode()}
              className="p-2.5 bg-white text-rose-500 rounded-xl shadow-sm border border-gray-100 hover:bg-rose-50 hover:border-rose-200 transition-all"
              title="Xóa slide"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {images.length > 0 ? (
          <div className="relative aspect-video bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-inner group/slider">
            <img
              src={images[activeIndex].url}
              alt={images[activeIndex].caption}
              className="w-full h-full object-contain"
            />

            {images[activeIndex].caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/60 to-transparent">
                <p className="text-white text-sm font-medium text-center drop-shadow-md flex items-center justify-center gap-2">
                  <Type size={14} className="opacity-70" />
                  {images[activeIndex].caption}
                </p>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white transition-all shadow-lg opacity-0 group-hover/slider:opacity-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white transition-all shadow-lg opacity-0 group-hover/slider:opacity-100"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm">
                  {activeIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-400 font-bold italic py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
            Chưa có hình ảnh nào. Nhấn biểu tượng bút chì để thêm ảnh vào slide.
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
