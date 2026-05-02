"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Check,
  Settings2,
  Type
} from "lucide-react";
import { DndContext, closestCenter, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ImageSelector from "../../image/ImageSelector";
import { ImageResponse } from "@/lib/api";

interface ImageItem {
  id: string;
  url: string;
  caption: string;
}

interface ImageSliderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { images: ImageItem[], autoplay: boolean, showPagination: boolean }) => void;
  initialImages?: ImageItem[];
  initialAutoplay?: boolean;
  initialShowPagination?: boolean;
}

function SortableImageItem({ item, onRemove, onUpdateCaption }: {
  item: ImageItem,
  onRemove: (id: string) => void,
  onUpdateCaption: (id: string, caption: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 bg-white p-4 rounded-2xl border ${isDragging ? 'border-primary-500 shadow-xl' : 'border-gray-100 shadow-sm'} mb-3 transition-all`}
    >
      <button type="button" {...attributes} {...listeners} className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
        <GripVertical size={20} />
      </button>

      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
        <img src={item.url} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
            <Type size={16} />
          </div>
          <input
            type="text"
            value={item.caption}
            onChange={(e) => onUpdateCaption(item.id, e.target.value)}
            placeholder="Thêm chú thích cho ảnh này..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent border focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-primary-500/5 rounded-xl text-sm transition-all outline-none"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="p-2.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
        title="Xóa ảnh"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default function ImageSliderModal({
  isOpen,
  onClose,
  onConfirm,
  initialImages = [],
  initialAutoplay = false,
  initialShowPagination = true,
}: ImageSliderModalProps) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [autoplay, setAutoplay] = useState(initialAutoplay);
  const [showPagination, setShowPagination] = useState(initialShowPagination);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddImage = (image: ImageResponse) => {
    const newItem: ImageItem = {
      id: `slide-${image._id}-${Math.random().toString(36).substring(2, 11)}`,
      url: image.cloudinaryUrl,
      caption: "",
    };
    setImages(prev => [...prev, newItem]);
  };

  const handleRemoveImage = (id: string) => {
    setImages((currentImages) => currentImages.filter((img) => img.id !== id));
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    setImages((currentImages) =>
      currentImages.map((img) => (img.id === id ? { ...img, caption } : img))
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirm({ images, autoplay, showPagination });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-50 rounded-2xl text-primary-900 shadow-sm">
              <ImageIcon size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Cấu hình Slide Hình Ảnh</h2>
              <p className="text-sm text-gray-500 font-medium">Kéo thả để sắp xếp và thêm chú thích</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-3 hover:bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50">
          <div className="space-y-8">
            {/* Settings */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold">
                <Settings2 size={18} />
                <span>Cài đặt Slide</span>
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={autoplay}
                      onChange={(e) => setAutoplay(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6 shadow-inner" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-primary-900 transition-colors">Tự động chuyển slide</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={showPagination}
                      onChange={(e) => setShowPagination(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600 transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6 shadow-inner" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-primary-900 transition-colors">Hiển thị chấm phân trang</span>
                </label>
              </div>
            </div>

            {/* Images List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon size={18} />
                  Danh sách hình ({images.length})
                </h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPickerOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-900 text-white rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-primary-900/20 text-sm font-bold active:scale-95"
                >
                  <Plus size={18} />
                  Thêm hình ảnh
                </button>
              </div>

              {images.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={images.map(img => img.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1">
                      {images.map((item) => (
                        <SortableImageItem
                          key={item.id}
                          item={item}
                          onRemove={handleRemoveImage}
                          onUpdateCaption={handleUpdateCaption}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div
                  onClick={() => setIsPickerOpen(true)}
                  className="py-16 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer group"
                >
                  <div className="p-5 bg-gray-50 rounded-full group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                    <Plus size={32} />
                  </div>
                  <p className="font-bold">Chưa có hình ảnh nào được chọn</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {images.length} hình ảnh • {autoplay ? 'Auto' : 'Manual'}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-white hover:border-gray-300 transition-all"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-8 py-3 bg-primary-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl shadow-primary-900/20 flex items-center gap-2 active:scale-95"
            >
              <Check size={20} />
              Cập nhật Slide
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-[60]">
        <ImageSelector
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          onSelect={handleAddImage}
          folder="blogs/content"
        />
      </div>
    </div>
  );
}
