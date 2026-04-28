"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Package,
  FileText,
  Filter,
  CheckCircle2,
  Settings2,
  Trash2
} from "lucide-react";
import { blogApi, informationApi } from "@/lib/api";
import type { Blog, Information } from "@/lib/types";

interface RelatedSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { ids: string[]; limit: number; style: string }) => void;
  type: "products" | "articles";
  initialIds?: string[];
  initialLimit?: number;
  initialStyle?: string;
  defaultCategoryId?: string;
}

export default function RelatedSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  initialIds = [],
  initialLimit,
  initialStyle,
  defaultCategoryId
}: RelatedSelectionModalProps) {
  const [items, setItems] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Information[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(defaultCategoryId || "");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);
  const [displayLimit, setDisplayLimit] = useState(initialLimit || (type === "products" ? 8 : 3));
  const [displayStyle, setDisplayStyle] = useState(initialStyle || (type === "products" ? "slide" : "list"));

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialIds);
      setDisplayLimit(initialLimit || (type === "products" ? 8 : 3));
      setDisplayStyle(initialStyle || (type === "products" ? "slide" : "list"));
      if (defaultCategoryId && !selectedCategoryId) {
        setSelectedCategoryId(defaultCategoryId);
      }
      fetchCategories();
      fetchItems();
    }
  }, [isOpen, initialIds, initialLimit, initialStyle, type, defaultCategoryId]);

  const fetchCategories = async () => {
    try {
      const response = await informationApi.getAll();
      setCategories(response.data?.items || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await blogApi.getAll({
        isProduct: type === "products",
        search: search || undefined,
        informationId: selectedCategoryId || undefined,
        page,
        limit: 12,
        status: "published"
      });
      setItems(response.data?.items || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  }, [type, search, selectedCategoryId, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) fetchItems();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategoryId, page, isOpen, fetchItems]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onConfirm({
      ids: selectedIds,
      limit: displayLimit,
      style: displayStyle
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${type === 'products' ? 'bg-primary-50 text-primary-900' : 'bg-secondary-50 text-secondary-800'}`}>
              {type === 'products' ? <Package size={24} /> : <FileText size={24} />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Chọn {type === 'products' ? "Sản phẩm" : "Bài viết"} liên quan
              </h2>
              <p className="text-sm text-gray-500 font-medium italic">
                Đã chọn <span className="text-primary-900 font-bold">{selectedIds.length}</span> {type === 'products' ? "sản phẩm" : "bài viết"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filters & Config */}
        <div className="px-8 py-4 bg-gray-50/50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-900 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary-900 outline-none transition-all text-sm font-bold shadow-sm"
            />
          </div>

          <div className="md:col-span-1 relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-900 transition-colors" size={18} />
            <select
              value={selectedCategoryId}
              onChange={(e) => { setSelectedCategoryId(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary-900 outline-none transition-all text-sm font-bold shadow-sm appearance-none cursor-pointer"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1 flex items-center gap-2 bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 shadow-sm group">
            <Settings2 className="text-gray-400 group-focus-within:text-primary-900" size={18} />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Limit:</span>
            <input
              type="number"
              min={1}
              max={24}
              value={displayLimit}
              onChange={(e) => setDisplayLimit(parseInt(e.target.value) || 1)}
              className="w-full bg-transparent border-none outline-none text-sm font-black text-gray-900"
            />
          </div>

          <div className="md:col-span-1 flex items-center gap-2 bg-white border-2 border-gray-200 rounded-2xl p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setDisplayStyle(type === "products" ? "slide" : "list")}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${displayStyle === (type === "products" ? "slide" : "list") ? 'bg-primary-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              {type === "products" ? "Slide" : "List"}
            </button>
            {type === "products" && (
              <button
                type="button"
                onClick={() => setDisplayStyle("grid")}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${displayStyle === "grid" ? 'bg-primary-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                Grid
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-3xl h-64 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {items.map((item) => {
                const isSelected = selectedIds.includes(item.id || item._id as string);
                return (
                  <button
                    key={item.id || item._id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSelect(item.id || item._id as string);
                    }}
                    className={`relative group flex flex-col text-left rounded-xl border-2 transition-all overflow-hidden bg-white hover:shadow-xl ${isSelected ? 'border-primary-900 ring-4 ring-primary-900/10 shadow-primary-100' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}
                  >
                    <div className="aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center p-3">
                      {item.image?.cloudinaryUrl ? (
                        <img
                          src={item.image.cloudinaryUrl}
                          alt={item.title}
                          className={`w-full h-full object-contain transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}
                        />
                      ) : (
                        <div className="text-gray-200">
                          {type === 'products' ? <Package size={48} /> : <FileText size={48} />}
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-primary-900 text-white p-1 rounded-full shadow-lg animate-in zoom-in duration-300">
                          <Check size={16} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="text-[10px] font-black text-primary-900 uppercase tracking-widest mb-1 opacity-60">
                        {typeof item.informationId === 'object' ? item.informationId.name : 'Uncategorized'}
                      </div>
                      <h4 className="text-xs font-black text-gray-900 line-clamp-2 leading-relaxed">
                        {item.title}
                      </h4>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
              <div className="bg-gray-100 p-8 rounded-full">
                <Search size={48} className="opacity-20" />
              </div>
              <p className="font-bold text-lg">Không tìm thấy {type === 'products' ? "sản phẩm" : "bài viết"} nào.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-3 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="px-6 py-2 bg-gray-50 rounded-2xl text-sm font-black text-gray-600 border border-gray-200">
              Trang <span className="text-primary-900">{page}</span> / {totalPages}
            </div>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-3 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedIds([])}
              className="px-6 py-3 text-sm font-black text-rose-500 hover:bg-rose-50 rounded-2xl transition-all flex items-center gap-2"
            >
              <Trash2 size={18} /> Xóa hết
            </button>
            <div className="h-10 w-px bg-gray-200" />
            <button
              type="button"
              onClick={handleConfirm}
              className="px-8 py-4 bg-primary-900 text-white rounded-2xl text-sm font-black flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-primary-100/50 active:scale-95"
            >
              <CheckCircle2 size={20} /> Xác nhận lựa chọn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
