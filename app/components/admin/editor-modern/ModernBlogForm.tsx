"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import ModernTiptapEditor from "./ModernTiptapEditor";
import BlogPreview from "./BlogPreview";
import {
  Save,
  Eye,
  Languages,
  Smartphone,
  Monitor,
  ArrowLeft,
  ChevronRight,
  Settings,
  Sparkles,
  History
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { generateSlug } from "@/lib/utils/string/slug";

interface ModernBlogFormProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  categories: any[];
}

export default function ModernBlogForm({
  initialData,
  onSave,
  categories = []
}: ModernBlogFormProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"vi" | "en" | "seo">("vi");
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("edit");
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    title_en: initialData?.title_en || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    excerpt_en: initialData?.excerpt_en || "",
    content: initialData?.sections?.[0]?.content || "",
    content_en: initialData?.sections?.[0]?.content_en || "",
    author: initialData?.author || "Admin",
    informationId: initialData?.informationId || "",
    tags: initialData?.tags || [],
    image: initialData?.image?.cloudinaryUrl || "",
    status: initialData?.status || "draft",
  });

  // Auto-generate slug
  useEffect(() => {
    if (!initialData) {
      const titleForSlug = formData.title_en || formData.title;
      if (titleForSlug) {
        setFormData(prev => ({ ...prev, slug: generateSlug(titleForSlug) }));
      }
    }
  }, [formData.title, formData.title_en, initialData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Lưu bài viết thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Header Bar */}
      <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <button className="p-3 hover:bg-gray-100 rounded-2xl transition-all group">
            <ArrowLeft size={24} className="text-gray-400 group-hover:text-gray-900" />
          </button>
          <div className="h-10 w-px bg-gray-200" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">
              <Sparkles size={12} />
              <span>Admin CMS / Blogs</span>
            </div>
            <h1 className="text-xl font-black text-gray-900 truncate max-w-[300px]">
              {formData.title || "Bài viết không tiêu đề"}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 bg-gray-100/50 p-1.5 rounded-[1.25rem] border border-gray-200/50">
          <div className="flex rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
            <button
              onClick={() => setViewMode("edit")}
              className={`px-5 py-2.5 text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'edit' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Settings size={16} /> Soạn thảo
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-5 py-2.5 text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'preview' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Eye size={16} /> Xem thử
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`hidden lg:flex px-5 py-2.5 text-sm font-bold items-center gap-2 transition-all ${viewMode === 'split' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Monitor size={16} /> Split View
            </button>
          </div>

          <div className="w-px h-8 bg-gray-300" />

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isSaving ? "Đang lưu..." : <><Save size={18} /> Lưu ngay</>}
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-8 gap-8">
          <button
            onClick={() => setActiveTab("vi")}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${activeTab === 'vi' ? 'bg-primary-100 text-primary-700 shadow-inner ring-2 ring-primary-500/20' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
            title="Tiếng Việt"
          >
            VI
          </button>
          <button
            onClick={() => setActiveTab("en")}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${activeTab === 'en' ? 'bg-primary-100 text-primary-700 shadow-inner ring-2 ring-primary-500/20' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
            title="English"
          >
            EN
          </button>
          <div className="w-8 h-px bg-gray-200" />
          <button
            onClick={() => setActiveTab("seo")}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'seo' ? 'bg-primary-100 text-primary-700 shadow-inner ring-2 ring-primary-500/20' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
            title="SEO & Tags"
          >
            <Settings size={22} />
          </button>
          <button
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 mt-auto"
            title="Version History"
          >
            <History size={22} />
          </button>
        </aside>

        {/* Editor Area */}
        <section className={`flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 ${viewMode === 'preview' ? 'hidden' : viewMode === 'split' ? 'w-1/2' : 'max-w-5xl mx-auto w-full'}`}>
          {activeTab === 'seo' ? (
            <div className="space-y-12 animate-in slide-in-from-right duration-500">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Cài đặt bài viết</h2>
                <p className="text-gray-500 font-medium">Quản lý các thông số kỹ thuật và SEO.</p>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 group-focus-within:text-primary-600 transition-colors">Đường dẫn bài viết (URL Slug)</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full bg-white border-2 border-gray-200 rounded-2xl p-5 text-lg font-bold text-gray-900 focus:border-primary-500 outline-none transition-all shadow-sm focus:shadow-xl focus:shadow-primary-100 group-hover:border-gray-300"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 group-focus-within:text-primary-600 transition-colors">Tác giả</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full bg-white border-2 border-gray-200 rounded-2xl p-5 text-lg font-bold text-gray-900 focus:border-primary-500 outline-none transition-all group-hover:border-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 group-focus-within:text-primary-600 transition-colors">Danh mục</label>
                    <select
                      value={formData.informationId}
                      onChange={(e) => setFormData(prev => ({ ...prev, informationId: e.target.value }))}
                      className="w-full bg-white border-2 border-gray-200 rounded-2xl p-5 text-lg font-bold text-gray-900 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer group-hover:border-gray-300"
                    >
                      <option value="">Chọn danh mục...</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in duration-700">
              <input
                type="text"
                autoFocus
                placeholder={activeTab === 'vi' ? "Nhập tiêu đề tiếng Việt..." : "Enter English title..."}
                value={activeTab === 'vi' ? formData.title : formData.title_en}
                onChange={(e) => setFormData(prev => ({ ...prev, [activeTab === 'vi' ? 'title' : 'title_en']: e.target.value }))}
                className="w-full bg-transparent border-none text-5xl md:text-6xl font-black text-gray-900 placeholder:text-gray-200 focus:outline-none tracking-tight leading-tight"
              />

              <textarea
                placeholder={activeTab === 'vi' ? "Mô tả ngắn cho bài viết của bạn..." : "Short description for your post..."}
                value={activeTab === 'vi' ? formData.excerpt : formData.excerpt_en}
                onChange={(e) => setFormData(prev => ({ ...prev, [activeTab === 'vi' ? 'excerpt' : 'excerpt_en']: e.target.value }))}
                className="w-full bg-transparent border-none text-xl font-medium text-gray-500 placeholder:text-gray-200 focus:outline-none resize-none h-24"
              />

              <ModernTiptapEditor
                content={activeTab === 'vi' ? formData.content : formData.content_en}
                onChange={(content) => setFormData(prev => ({ ...prev, [activeTab === 'vi' ? 'content' : 'content_en']: content }))}
              />
            </div>
          )}
        </section>

        {/* Preview Area */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <section className={`bg-gray-100 border-l border-gray-200 relative ${viewMode === 'preview' ? 'flex-1' : 'w-1/2'}`}>
            {/* Preview Controls */}
            <div className="absolute top-8 right-8 z-30 flex items-center bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-white">
              <button
                onClick={() => setIsPreviewMobile(false)}
                className={`p-3 rounded-xl transition-all ${!isPreviewMobile ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <Monitor size={20} />
              </button>
              <button
                onClick={() => setIsPreviewMobile(true)}
                className={`p-3 rounded-xl transition-all ${isPreviewMobile ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <Smartphone size={20} />
              </button>
            </div>

            <BlogPreview
              content={activeTab === 'en' ? formData.content_en : formData.content}
              title={activeTab === 'en' ? formData.title_en : formData.title}
              author={formData.author}
              image={formData.image}
              tags={formData.tags}
              isMobile={isPreviewMobile}
            />
          </section>
        )}
      </div>
    </div>
  );
}
