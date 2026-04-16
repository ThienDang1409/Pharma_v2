"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  GripVertical,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  LayoutPanelTop,
  Columns2,
  Rows3,
  Monitor,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import TiptapEditor from "@/app/components/admin/editor/TiptapEditor";
import BlogPreview from "./BlogPreview";
import type { BlogSection } from "@/lib/api";

type Language = "vi" | "en";
type ModalViewMode = "editor" | "split-languages" | "split-preview" | "preview-only" | "triple";

interface SectionWorkspaceProps {
  sections: BlogSection[];
  sectionLanguages: Record<number, Language>;
  onSetSectionLanguage: (index: number, language: Language) => void;
  onAddSection: () => void;
  onRemoveSection: (index: number) => void;
  onReorderSections: (fromIndex: number, toIndex: number) => void;
  onSectionTitleChange: (index: number, title: string) => void;
  onSectionChange: (index: number, field: keyof BlogSection, value: string) => void;
  onCopyToEnglish: (index: number) => void;
  onCopyToVietnamese: (index: number) => void;
  onTranslateToEnglish: (index: number) => void;
  onTranslateToVietnamese: (index: number) => void;
  translatingSectionIndex: number | null;
  onImageUpload: (file: File) => Promise<string>;
  previewTitleVi: string;
  previewTitleEn?: string;
  previewAuthor: string;
  previewImage?: string;
  previewTags?: string[];
  previewCategoryId?: string;
  previewLanguage: Language;
}

const stripHtml = (html?: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

const countWords = (html?: string): number => {
  const text = stripHtml(html);
  if (!text) return 0;
  return text.split(" ").filter(Boolean).length;
};

export default function SectionWorkspace({
  sections,
  sectionLanguages,
  onSetSectionLanguage,
  onAddSection,
  onRemoveSection,
  onReorderSections,
  onSectionTitleChange,
  onSectionChange,
  onCopyToEnglish,
  onCopyToVietnamese,
  onTranslateToEnglish,
  onTranslateToVietnamese,
  translatingSectionIndex,
  onImageUpload,
  previewTitleVi,
  previewTitleEn,
  previewAuthor,
  previewImage,
  previewTags = [],
  previewCategoryId,
  previewLanguage,
}: SectionWorkspaceProps) {
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);
  const [modalViewMode, setModalViewMode] = useState<ModalViewMode>("editor");
  const [previewPanelLanguage, setPreviewPanelLanguage] = useState<Language>(previewLanguage);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const activeSection =
    activeSectionIndex !== null ? sections[activeSectionIndex] || null : null;

  const hasPreviewPane =
    modalViewMode === "split-preview" ||
    modalViewMode === "preview-only" ||
    modalViewMode === "triple";

  const effectivePreviewTitle =
    previewLanguage === "en"
      ? previewTitleEn || previewTitleVi || "Untitled"
      : previewTitleVi || previewTitleEn || "Untitled";

  const openSectionEditor = useCallback((index: number) => {
    setActiveSectionIndex(index);
    setPreviewPanelLanguage(sectionLanguages[index] || previewLanguage);
    setIsDeleteConfirmOpen(false);
    setShowViewMenu(false);
  }, [previewLanguage, sectionLanguages]);

  const handleAddAndOpen = useCallback(() => {
    const newIndex = sections.length;
    onAddSection();
    onSetSectionLanguage(newIndex, "vi");
    setPreviewPanelLanguage("vi");
    setActiveSectionIndex(newIndex);
    setModalViewMode("editor");
    setIsDeleteConfirmOpen(false);
    setShowViewMenu(false);
  }, [onAddSection, onSetSectionLanguage, sections.length]);

  const handlePrevSection = useCallback(() => {
    if (activeSectionIndex === null || activeSectionIndex <= 0) return;
    const targetIndex = activeSectionIndex - 1;
    setActiveSectionIndex(targetIndex);
    setPreviewPanelLanguage(sectionLanguages[targetIndex] || previewLanguage);
    setIsDeleteConfirmOpen(false);
    setShowViewMenu(false);
  }, [activeSectionIndex, previewLanguage, sectionLanguages]);

  const handleNextSection = useCallback(() => {
    if (activeSectionIndex === null) return;
    if (activeSectionIndex < sections.length - 1) {
      const targetIndex = activeSectionIndex + 1;
      setActiveSectionIndex(targetIndex);
      setPreviewPanelLanguage(sectionLanguages[targetIndex] || previewLanguage);
      setIsDeleteConfirmOpen(false);
      setShowViewMenu(false);
      return;
    }
    handleAddAndOpen();
  }, [activeSectionIndex, handleAddAndOpen, previewLanguage, sectionLanguages, sections.length]);

  const removeSectionAt = useCallback(
    (index: number) => {
      onRemoveSection(index);
      setIsDeleteConfirmOpen(false);
      if (activeSectionIndex === null) return;
      if (sections.length <= 1) { setActiveSectionIndex(null); return; }
      if (activeSectionIndex === index) { setActiveSectionIndex(Math.max(0, index - 1)); return; }
      if (activeSectionIndex > index) { setActiveSectionIndex(activeSectionIndex - 1); }
    },
    [activeSectionIndex, onRemoveSection, sections.length]
  );

  const requestRemoveSection = useCallback(
    (index: number) => {
      const title = sections[index]?.title || sections[index]?.title_en || `Section ${index + 1}`;
      if (window.confirm(`Xóa "${title}"? Hành động này không thể hoàn tác.`)) removeSectionAt(index);
    },
    [removeSectionAt, sections]
  );

  // Keyboard shortcuts inside modal
  useEffect(() => {
    if (activeSectionIndex === null) return;
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowViewMenu(false);
        setIsDeleteConfirmOpen(false);
        setActiveSectionIndex(null);
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        setActiveSectionIndex(null);
        return;
      }
      if (event.altKey && event.key === "ArrowLeft") { event.preventDefault(); handlePrevSection(); }
      if (event.altKey && event.key === "ArrowRight") { event.preventDefault(); handleNextSection(); }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [activeSectionIndex, handleNextSection, handlePrevSection]);

  // ── EDITOR PANEL ──────────────────────────────────────────────
  const renderEditorPanel = (language: Language) => {
    if (activeSectionIndex === null || !activeSection) return null;
    const isVi = language === "vi";
    const isFixedLanguageMode =
      modalViewMode === "split-languages" || modalViewMode === "triple";
    const activeLang = isFixedLanguageMode
      ? language
      : sectionLanguages[activeSectionIndex] || "vi";

    return (
      <div className="flex flex-col h-full min-h-0">
        {/* Lang switch + action buttons — sticky mini-bar inside panel */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 shrink-0">
          <div className="inline-flex bg-white rounded-lg p-0.5 border border-gray-200 shadow-sm">
            <button
              type="button"
              onClick={() => onSetSectionLanguage(activeSectionIndex, "vi")}
              disabled={isFixedLanguageMode}
              className={`px-2.5 py-1 text-[10px] font-black rounded-md transition-all ${activeLang === "vi" ? "bg-gray-900 text-white" : isFixedLanguageMode ? "text-gray-400" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"} ${isFixedLanguageMode ? "cursor-default" : ""}`}
            >
              VI
            </button>
            <button
              type="button"
              onClick={() => onSetSectionLanguage(activeSectionIndex, "en")}
              disabled={isFixedLanguageMode}
              className={`px-2.5 py-1 text-[10px] font-black rounded-md transition-all ${activeLang === "en" ? "bg-gray-900 text-white" : isFixedLanguageMode ? "text-gray-400" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"} ${isFixedLanguageMode ? "cursor-default" : ""}`}
            >
              EN
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {isVi ? (
              <>
                <button
                  type="button"
                  onClick={() => onCopyToVietnamese(activeSectionIndex)}
                  className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg text-primary-900 bg-primary-50 hover:bg-primary-100 transition-all"
                >
                  Copy EN
                </button>
                <button
                  type="button"
                  onClick={() => onTranslateToVietnamese(activeSectionIndex)}
                  disabled={translatingSectionIndex === activeSectionIndex}
                  className={`px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg inline-flex items-center gap-1 transition-all ${translatingSectionIndex === activeSectionIndex
                      ? "bg-primary-100 text-primary-900 animate-pulse"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                >
                  <Sparkles size={10} className={translatingSectionIndex === activeSectionIndex ? "animate-spin" : ""} />
                  EN→VI
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onCopyToEnglish(activeSectionIndex)}
                  className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg text-primary-900 bg-primary-50 hover:bg-primary-100 transition-all"
                >
                  Copy VI
                </button>
                <button
                  type="button"
                  onClick={() => onTranslateToEnglish(activeSectionIndex)}
                  disabled={translatingSectionIndex === activeSectionIndex}
                  className={`px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg inline-flex items-center gap-1 transition-all ${translatingSectionIndex === activeSectionIndex
                      ? "bg-primary-100 text-primary-900 animate-pulse"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                >
                  <Sparkles size={10} className={translatingSectionIndex === activeSectionIndex ? "animate-spin" : ""} />
                  VI→EN
                </button>
              </>
            )}
          </div>
        </div>

        {/* Editor fills remaining space */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <TiptapEditor
            content={isVi ? activeSection.content || "" : activeSection.content_en || ""}
            onChange={(value) =>
              onSectionChange(activeSectionIndex, isVi ? "content" : "content_en", value)
            }
            onImageUpload={onImageUpload}
            placeholder={
              isVi
                ? "Nhập nội dung tiếng Việt (bắt buộc)..."
                : "Enter section content in English (required)..."
            }
          />
        </div>
      </div>
    );
  };

  // ── SECTION LIST ──────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-gray-900 uppercase tracking-tighter">Nội dung bài viết</h2>
          <p className="text-[10px] font-black text-primary-900 mt-0.5 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded-md inline-block">
            {sections.length} section{sections.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddAndOpen}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
        >
          <Plus size={13} />
          Thêm section
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="admin-card p-10 border-2 border-dashed border-gray-200 text-center">
          <p className="text-sm font-bold text-gray-400 mb-4">Chưa có section nào. Bấm để bắt đầu soạn thảo.</p>
          <button
            type="button"
            onClick={handleAddAndOpen}
            className="px-8 py-3 bg-primary-900 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-gray-900"
          >
            Tạo section đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sections.map((section, index) => {
            const title = section.title || section.title_en || "";
            const words = countWords(section.content) || countWords(section.content_en);
            const hasContent = !!(section.content || section.content_en);

            return (
              <div
                key={`section-${index}-${section.slug || "no-slug"}`}
                draggable
                onDragStart={() => { setDraggingIndex(index); setDragOverIndex(index); }}
                onDragOver={(event) => { event.preventDefault(); if (dragOverIndex !== index) setDragOverIndex(index); }}
                onDragEnd={() => { setDraggingIndex(null); setDragOverIndex(null); }}
                onDrop={() => {
                  if (draggingIndex === null || draggingIndex === index) return;
                  onReorderSections(draggingIndex, index);
                  setDraggingIndex(null);
                  setDragOverIndex(null);
                }}
                className={`admin-card border transition-all duration-150 ${draggingIndex === index
                    ? "border-primary-200 bg-primary-50/40 opacity-70"
                    : dragOverIndex === index && draggingIndex !== index
                      ? "border-primary-400 bg-primary-50"
                      : "border-gray-200"
                  }`}
              >
                <div className="flex items-center gap-3 p-3">
                  {/* Drag handle */}
                  <GripVertical size={15} className="text-gray-300 shrink-0 cursor-grab" />

                  {/* Section number badge */}
                  <div className="w-6 h-6 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-black flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>

                  {/* Inline title input (VI) — editable directly on card */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => onSectionTitleChange(index, e.target.value)}
                      placeholder={`Tiêu đề section ${index + 1} (không bắt buộc)...`}
                      className="w-full text-sm font-black text-gray-900 bg-transparent border-none outline-none placeholder:text-gray-300 truncate"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {(words > 0 || hasContent) && (
                      <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                        ~{words} từ{section.content_en ? " · EN ✓" : ""}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openSectionEditor(index)}
                      className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-primary-700 hover:border-primary-200 bg-white inline-flex items-center justify-center transition-all"
                      title="Soạn thảo nội dung"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => requestRemoveSection(index)}
                      className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 bg-white inline-flex items-center justify-center transition-all"
                      title="Xóa section"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add section button at bottom */}
          <button
            type="button"
            onClick={handleAddAndOpen}
            className="w-full py-3.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-black text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Thêm section mới
          </button>
        </div>
      )}

      {/* ── FULLSCREEN SECTION EDITOR MODAL ── */}
      {activeSection && activeSectionIndex !== null && (
        <div className="fixed inset-0 z-[70] bg-black/50">
          <div className="absolute inset-0 flex flex-col bg-white">

            {/* ── 1. Modal top nav bar (sticky) ── */}
            <div className="shrink-0 px-4 py-4 border-b border-gray-200 bg-white flex items-center relative justify-between gap-3 shadow-sm">
              <button
                type="button"
                onClick={() => { setIsDeleteConfirmOpen(false); setActiveSectionIndex(null); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold text-xs hover:bg-gray-50 transition-all"
              >
                <ChevronLeft size={14} /> Quay lại
              </button>

              {/* <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <span className="px-2 py-1 bg-gray-100 rounded-lg font-black text-gray-700">
                  {activeSectionIndex + 1} / {sections.length}
                </span>
                <span className="hidden sm:block text-gray-400 truncate max-w-[200px]">
                  {activeSection.title || activeSection.title_en || "Section mới"}
                </span>
              </div> */}
              <div className="shrink-0 absolute left-1/2 transform -translate-x-1/2 py-2.5 border-b border-gray-100 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mx-auto">
                  <input
                    type="text"
                    value={activeSection.title || ""}
                    onChange={(e) => onSectionTitleChange(activeSectionIndex, e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                    placeholder="🇻🇳 Tiêu đề section (VI - không bắt buộc)"
                  />
                  <input
                    type="text"
                    value={activeSection.title_en || ""}
                    onChange={(e) => onSectionChange(activeSectionIndex, "title_en", e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="🇬🇧 Section title (EN - optional)"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasPreviewPane && (
                  <div className="inline-flex bg-white rounded-lg p-0.5 border border-gray-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setPreviewPanelLanguage("vi")}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-md transition-all ${previewPanelLanguage === "vi" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
                    >
                      Preview VI
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewPanelLanguage("en")}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-md transition-all ${previewPanelLanguage === "en" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
                    >
                      Preview EN
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePrevSection}
                  disabled={activeSectionIndex === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold text-xs hover:bg-gray-50 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft size={13} /> Trước
                </button>
                <button
                  type="button"
                  onClick={handleNextSection}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold text-xs hover:bg-gray-50 transition-all"
                >
                  Tiếp <ChevronRight size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => { setIsDeleteConfirmOpen(false); setActiveSectionIndex(null); }}
                  className="px-4 py-1.5 rounded-xl bg-primary-900 text-white font-black text-xs hover:bg-gray-900 transition-all"
                >
                  Xong
                </button>
              </div>
            </div>



            {/* ── 3. Editor area (flex-1, scrolls independently) ── */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {modalViewMode === "editor" && (
                <div className="flex-1 min-h-0 w-[70%] mx-auto overflow-hidden">
                  {renderEditorPanel(sectionLanguages[activeSectionIndex] || "vi")}
                </div>
              )}

              {modalViewMode === "split-languages" && (
                <div className="flex-1 min-h-0  min-h-0 w-[95%] mx-auto overflow-hidden grid grid-cols-1 xl:grid-cols-2 divide-x divide-gray-200">
                  <div className="min-h-0 overflow-hidden flex flex-col">{renderEditorPanel("vi")}</div>
                  <div className="min-h-0 overflow-hidden flex flex-col">{renderEditorPanel("en")}</div>
                </div>
              )}

              {modalViewMode === "split-preview" && (
                <div className="flex-1 min-h-0  min-h-0 w-[95%] mx-auto overflow-hidden grid grid-cols-1 xl:grid-cols-2 divide-x divide-gray-200">
                  <div className="min-h-0 overflow-hidden flex flex-col">
                    {renderEditorPanel(sectionLanguages[activeSectionIndex] || "vi")}
                  </div>
                  <div className="min-h-0 mt-12 overflow-y-auto custom-scrollbar bg-gray-50">
                    <BlogPreview
                      sections={sections}
                      title={effectivePreviewTitle}
                      titleVi={previewTitleVi}
                      titleEn={previewTitleEn}
                      author={previewAuthor}
                      image={previewImage}
                      tags={previewTags}
                      categoryId={previewCategoryId}
                      language={previewPanelLanguage}
                    />
                  </div>
                </div>
              )}

              {modalViewMode === "preview-only" && (
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-gray-50">
                  <BlogPreview
                    sections={sections}
                    title={effectivePreviewTitle}
                    titleVi={previewTitleVi}
                    titleEn={previewTitleEn}
                    author={previewAuthor}
                    image={previewImage}
                    tags={previewTags}
                    categoryId={previewCategoryId}
                    language={previewPanelLanguage}
                  />
                </div>
              )}

              {modalViewMode === "triple" && (
                <div className="flex-1 min-h-0 overflow-hidden  min-h-0 w-[95%] mx-auto grid grid-cols-1 2xl:grid-cols-3 divide-x divide-gray-200">
                  <div className="min-h-0 overflow-hidden flex flex-col">{renderEditorPanel("vi")}</div>
                  <div className="min-h-0 overflow-hidden flex flex-col">{renderEditorPanel("en")}</div>
                  <div className="min-h-0 overflow-y-auto custom-scrollbar bg-gray-50">
                    <BlogPreview
                      sections={sections}
                      title={effectivePreviewTitle}
                      titleVi={previewTitleVi}
                      titleEn={previewTitleEn}
                      author={previewAuthor}
                      image={previewImage}
                      tags={previewTags}
                      categoryId={previewCategoryId}
                      language={previewPanelLanguage}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── 4. Footer (sticky at bottom) ── */}
            <div className="shrink-0 px-4 py-2.5 border-t border-gray-200 bg-white flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 font-bold text-xs transition-all"
              >
                <Trash2 size={13} /> Xóa section này
              </button>
              <p className="hidden md:block text-[10px] text-gray-400 font-bold tracking-wide">
                Esc đóng · Ctrl+S lưu nhanh · Alt+←/→ chuyển section
              </p>
              <button
                type="button"
                onClick={() => { setIsDeleteConfirmOpen(false); setActiveSectionIndex(null); }}
                className="px-4 py-2 rounded-xl bg-primary-900 text-white font-black text-xs hover:bg-gray-900 transition-all"
              >
                Xong &amp; đóng
              </button>
            </div>

            {/* ── Delete confirm overlay ── */}
            {isDeleteConfirmOpen && (
              <div className="absolute inset-0 z-[90] bg-black/40 flex items-center justify-center p-4">
                <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-2xl p-6 space-y-4">
                  <h4 className="text-base font-black text-gray-900">Xác nhận xóa section</h4>
                  <p className="text-sm text-gray-600">Hành động này sẽ xóa section và không thể hoàn tác.</p>
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => setIsDeleteConfirmOpen(false)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50">
                      Hủy
                    </button>
                    <button type="button" onClick={() => removeSectionAt(activeSectionIndex)}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700">
                      Xóa ngay
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Float Eye button ── */}
            <div className="fixed bottom-20 right-5 z-[80]">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowViewMenu((prev) => !prev)}
                  className={`w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all ${showViewMenu ? "bg-gray-900 text-white" : "bg-primary-900 text-white hover:bg-primary-800"}`}
                  title="Chế độ xem"
                >
                  <Eye size={18} />
                </button>

                {showViewMenu && (
                  <div className="absolute right-0 bottom-14 bg-white border border-gray-200 rounded-2xl shadow-2xl p-2 w-56 space-y-1 animate-in slide-in-from-bottom-2">
                    {[
                      { mode: "editor" as ModalViewMode, icon: <LayoutPanelTop size={13} />, label: "1 màn soạn thảo" },
                      { mode: "split-languages" as ModalViewMode, icon: <Columns2 size={13} />, label: "2 màn VI / EN" },
                      { mode: "split-preview" as ModalViewMode, icon: <Monitor size={13} />, label: "Soạn + Preview" },
                      { mode: "preview-only" as ModalViewMode, icon: <Rows3 size={13} />, label: "Chỉ preview" },
                      { mode: "triple" as ModalViewMode, icon: <Rows3 size={13} />, label: "VI + EN + Preview" },
                    ].map(({ mode, icon, label }) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => { setModalViewMode(mode); setShowViewMenu(false); }}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 transition-all ${modalViewMode === mode ? "bg-primary-900 text-white" : "text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
