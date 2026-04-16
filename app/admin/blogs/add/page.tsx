"use client";

import { ImageField } from "@/app/components/admin/image";
import CustomSelect from "@/app/components/admin/CustomSelect";
import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { blogApi, informationApi, imageApi, Information, BlogSection, CreateBlogDto } from "@/lib/api";
import { IMAGE_FOLDERS } from "@/lib/constants/api";
import { generateSlug } from "@/lib/utils/string/slug";
import { translateText, translateHtmlPreservingMedia } from "@/lib/utils/string/translate";
import { useToast } from "@/app/context/ToastContext";
import { CreateBlogSchema } from "@/lib/validators";
import { apiFetch, apiSubmit } from "@/lib/utils/api/apiHelper";
import SectionWorkspace from "@/app/components/admin/blogs/SectionWorkspace";
import {
  Save,
  ChevronLeft,
  Sparkles,
  User,
  ImageIcon,
  FolderTree,
  Tag,
  FileText,
  Link2,
} from "lucide-react";

interface BlogFormData {
  title: string;
  title_en?: string;
  slug: string;
  excerpt?: string;
  excerpt_en?: string;
  sections: BlogSection[];
  author: string;
  informationId: string;
  image: string;
  tags: string[];
  isProduct: boolean;
  status: "draft" | "published";
}

function AdminAddNewsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategoryId = searchParams.get("categoryId");
  const toast = useToast();

  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    slug: "",
    sections: [],
    author: "",
    informationId: preselectedCategoryId || "",
    image: "",
    tags: [],
    isProduct: false,
    status: "draft",
  });

  const [categories, setCategories] = useState<Information[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(new Set());
  const [sectionLanguages, setSectionLanguages] = useState<{ [key: number]: "vi" | "en" }>({});
  const [isTranslatingMain, setIsTranslatingMain] = useState(false);
  const [translatingSectionIndex, setTranslatingSectionIndex] = useState<number | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");

  useEffect(() => {
    apiFetch(() => informationApi.getAll(), {
      onSuccess: (response) => {
        const data = response?.items || [];
        setCategories(Array.isArray(data) ? data : []);
      },
    });
  }, []);

  useEffect(() => {
    const titleForSlug = formData.title_en || formData.title;
    if (titleForSlug) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(titleForSlug) }));
    }
  }, [formData.title_en, formData.title]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSection = () => {
    const newSection: BlogSection = { type: "text", title: "", title_en: "", slug: "", content: "", content_en: "" };
    setFormData((prev) => ({ ...prev, sections: [...prev.sections, newSection] }));
    setSectionLanguages((prev) => ({ ...prev, [formData.sections.length]: "vi" }));
  };

  const handleSectionChange = (index: number, field: keyof BlogSection, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.sections];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sections: updated };
    });
  };

  const handleRemoveSection = (index: number) => {
    setFormData((prev) => ({ ...prev, sections: prev.sections.filter((_, i) => i !== index) }));
    setSectionLanguages((prev) => {
      const next: { [key: number]: "vi" | "en" } = {};
      Object.entries(prev)
        .filter(([key]) => Number(key) !== index)
        .forEach(([key, value]) => {
          const k = Number(key);
          next[k > index ? k - 1 : k] = value as "vi" | "en";
        });
      return next;
    });
  };

  const handleSectionTitleChange = (index: number, title: string) => {
    setFormData((prev) => {
      const updated = [...prev.sections];
      updated[index] = { ...updated[index], title, slug: generateSlug(title) };
      return { ...prev, sections: updated };
    });
  };

  const handleReorderSections = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const current = formData.sections;
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= current.length || toIndex >= current.length) return;

    const reordered = [...current];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setFormData((prev) => ({ ...prev, sections: reordered }));

    const langs = current.map((_, i) => sectionLanguages[i] || "vi");
    const [movedLang] = langs.splice(fromIndex, 1);
    langs.splice(toIndex, 0, movedLang);
    const reorderedLangs: { [key: number]: "vi" | "en" } = {};
    langs.forEach((l, i) => { reorderedLangs[i] = l as "vi" | "en"; });
    setSectionLanguages(reorderedLangs);
  };

  const copyToEnglish = (index: number) => {
    setFormData((prev) => {
      const updated = [...prev.sections];
      updated[index] = { ...updated[index], title_en: updated[index].title, content_en: updated[index].content };
      return { ...prev, sections: updated };
    });
  };

  const copyToVietnamese = (index: number) => {
    setFormData((prev) => {
      const updated = [...prev.sections];
      updated[index] = {
        ...updated[index],
        title: updated[index].title_en || updated[index].title,
        content: updated[index].content_en || updated[index].content,
      };
      return { ...prev, sections: updated };
    });
  };

  const handleTranslateMainToEnglish = async () => {
    if (!formData.title?.trim() && !formData.excerpt?.trim()) {
      toast.error("Vui lòng nhập tiêu đề hoặc mô tả tiếng Việt trước");
      return;
    }
    setIsTranslatingMain(true);
    try {
      const [titleEn, excerptEn] = await Promise.all([
        formData.title?.trim() ? translateText(formData.title, { from: "vi", to: "en" }) : Promise.resolve(""),
        formData.excerpt?.trim() ? translateText(formData.excerpt, { from: "vi", to: "en" }) : Promise.resolve(""),
      ]);
      setFormData((prev) => ({ ...prev, title_en: titleEn || prev.title_en, excerpt_en: excerptEn || prev.excerpt_en }));
      toast.success("Đã dịch thông tin cơ bản sang tiếng Anh");
    } catch { toast.error("Không thể dịch tự động."); } finally { setIsTranslatingMain(false); }
  };

  const handleTranslateMainToVietnamese = async () => {
    if (!formData.title_en?.trim() && !formData.excerpt_en?.trim()) {
      toast.error("Vui lòng nhập tiêu đề hoặc mô tả tiếng Anh trước");
      return;
    }
    setIsTranslatingMain(true);
    try {
      const [titleVi, excerptVi] = await Promise.all([
        formData.title_en?.trim() ? translateText(formData.title_en, { from: "en", to: "vi" }) : Promise.resolve(""),
        formData.excerpt_en?.trim() ? translateText(formData.excerpt_en, { from: "en", to: "vi" }) : Promise.resolve(""),
      ]);
      setFormData((prev) => ({ ...prev, title: titleVi || prev.title, excerpt: excerptVi || prev.excerpt }));
      toast.success("Đã dịch thông tin cơ bản sang tiếng Việt");
    } catch { toast.error("Không thể dịch tự động."); } finally { setIsTranslatingMain(false); }
  };

  const handleTranslateSectionToEnglish = async (index: number) => {
    const section = formData.sections[index];
    if (!section?.title?.trim() && !section?.content?.trim()) {
      toast.error("Vui lòng nhập tiêu đề hoặc nội dung tiếng Việt trước");
      return;
    }
    setTranslatingSectionIndex(index);
    try {
      const [translatedTitle, translatedContent] = await Promise.all([
        section.title?.trim() ? translateText(section.title, { from: "vi", to: "en" }) : Promise.resolve(""),
        section.content?.trim() ? translateHtmlPreservingMedia(section.content, { from: "vi", to: "en" }) : Promise.resolve(""),
      ]);
      setFormData((prev) => {
        const updated = [...prev.sections];
        updated[index] = { ...updated[index], title_en: translatedTitle || updated[index].title_en, content_en: translatedContent || updated[index].content_en };
        return { ...prev, sections: updated };
      });
      toast.success(`Đã dịch phần ${index + 1} sang tiếng Anh`);
    } catch { toast.error("Không thể dịch phần nội dung."); } finally { setTranslatingSectionIndex(null); }
  };

  const handleTranslateSectionToVietnamese = async (index: number) => {
    const section = formData.sections[index];
    if (!section?.title_en?.trim() && !section?.content_en?.trim()) {
      toast.error("Vui lòng nhập tiêu đề hoặc nội dung tiếng Anh trước");
      return;
    }
    setTranslatingSectionIndex(index);
    try {
      const [translatedTitle, translatedContent] = await Promise.all([
        section.title_en?.trim() ? translateText(section.title_en, { from: "en", to: "vi" }) : Promise.resolve(""),
        section.content_en?.trim() ? translateHtmlPreservingMedia(section.content_en, { from: "en", to: "vi" }) : Promise.resolve(""),
      ]);
      setFormData((prev) => {
        const updated = [...prev.sections];
        updated[index] = { ...updated[index], title: translatedTitle || updated[index].title, content: translatedContent || updated[index].content };
        return { ...prev, sections: updated };
      });
      toast.success(`Đã dịch phần ${index + 1} sang tiếng Việt`);
    } catch { toast.error("Không thể dịch phần nội dung."); } finally { setTranslatingSectionIndex(null); }
  };

  const getCategoryPath = (id: string): string => {
    const path: string[] = [];
    let current = categories.find((c) => c._id === id);
    while (current) {
      path.unshift(current.name);
      current = categories.find((c) => c._id === current?.parentId);
    }
    return path.join(" › ");
  };

  const getRootCategories = () => categories.filter((c) => !c.parentId);
  const getChildren = (parentId: string) => categories.filter((c) => c.parentId === parentId);

  const expandParentChain = useCallback((categoryId: string) => {
    if (!categoryId) return;
    const expanded = new Set<string>();
    let current = categories.find((c) => c._id === categoryId);
    while (current?.parentId) {
      expanded.add(current.parentId);
      current = categories.find((c) => c._id === current?.parentId);
    }
    setExpandedCategoryIds((prev) => {
      const merged = new Set(prev);
      expanded.forEach((item) => merged.add(item));
      return merged;
    });
  }, [categories]);

  const toggleCategoryExpand = (id: string) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useEffect(() => {
    if (formData.informationId) expandParentChain(formData.informationId);
  }, [expandParentChain, formData.informationId]);

  const renderCategoryTree = (parentId: string | null = null, level = 0): React.ReactElement[] => {
    const items = parentId ? getChildren(parentId) : getRootCategories();
    return items.map((cat) => {
      const children = getChildren(cat._id);
      const hasChildren = children.length > 0;
      const isSelected = formData.informationId === cat._id;
      const isExpanded = expandedCategoryIds.has(cat._id);
      return (
        <div key={cat._id}>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, informationId: cat._id }));
              if (hasChildren) { toggleCategoryExpand(cat._id); return; }
              setShowCategoryDropdown(false);
            }}
            className={`w-full text-left px-4 py-2 hover:bg-primary-50 transition-colors text-sm ${isSelected ? "bg-primary-100 text-primary-900 font-semibold" : "text-gray-700"}`}
            style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
          >
            {hasChildren && <span className={`text-secondary-600 mr-1 inline-block transition-transform ${isExpanded ? "rotate-90" : ""}`}>▸</span>}
            {cat.name}
          </button>
          {hasChildren && isExpanded && renderCategoryTree(cat._id, level + 1)}
        </div>
      );
    });
  };

  const handleTiptapImageUpload = async (file: File): Promise<string> => {
    const result = await imageApi.upload(file, { folder: IMAGE_FOLDERS.BLOGS_CONTENT });
    const imageData = result.data?.image;
    if (imageData?.cloudinaryUrl) return imageData.cloudinaryUrl;
    throw new Error("No image URL returned");
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent, publishStatus: "draft" | "published") => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = { ...formData, status: publishStatus };
    await apiSubmit(CreateBlogSchema, payload, (validatedData) => blogApi.create(validatedData), {
      toast,
      successMsg: publishStatus === "published" ? "Xuất bản bài viết thành công!" : "Lưu nháp thành công!",
      onSuccess: () => { setTimeout(() => { window.location.href = "/admin/blogs"; }, 1000); },
    });
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm supports-[backdrop-filter]:bg-white/92 supports-[backdrop-filter]:backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/blogs"
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all inline-flex"
            >
              <ChevronLeft size={16} />
            </Link>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin / Blogs / Thêm mới</p>
              <p className="text-sm font-black text-gray-900 leading-tight truncate max-w-[280px]">
                {formData.title || formData.title_en || "Bài viết mới"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSubmitting && (
              <span className="text-[10px] font-black text-primary-700 animate-pulse uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={11} className="animate-spin" /> Đang lưu...
              </span>
            )}
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "draft")}
              disabled={isSubmitting}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-200 text-gray-700 bg-white hover:border-gray-400 disabled:opacity-50 transition-all"
            >
              Lưu nháp
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "published")}
              disabled={isSubmitting}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary-900 text-white hover:bg-gray-900 disabled:opacity-50 transition-all"
            >
              Xuất bản
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="container mx-auto py-5 px-4">
          <form className="space-y-5">

            {/* ── Metadata row (compact 5 cards) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

              {/* 1. Publish */}
              <div className="admin-card p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-50 text-green-600 rounded-lg"><Save size={13} /></div>
                  <h3 className="text-[11px] font-extrabold text-gray-600 uppercase tracking-widest">Xuất bản</h3>
                  <span className="text-[10px] font-bold text-gray-400">Không bắt buộc</span>
                </div>
                <div className="flex justify-between gap-2">
                  <div className="flex-1">
                    <CustomSelect
                    options={[
                      { label: "Bản nháp", value: "draft" },
                      { label: "Công khai", value: "published" },
                    ]}
                    value={formData.status}
                    onChange={(value) => setFormData((prev) => ({ ...prev, status: value as "draft" | "published" }))}
                    placeholder="Trạng thái (không bắt buộc)..."
                    className="font-bold text-sm"
                  />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="isProduct"
                      id="isProduct"
                      checked={formData.isProduct}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isProduct: e.target.checked }))}
                      className="admin-checkbox"
                    />
                    <span className="text-xs font-bold text-gray-600">Là sản phẩm</span>
                  </label>
                </div>
              </div>

              {/* 2. Author */}
              <div className="admin-card p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><User size={13} /></div>
                  <h3 className="text-[11px] font-extrabold text-gray-600 uppercase tracking-widest">Tác giả</h3>
                  <span className="text-[10px] font-bold text-gray-400">Không bắt buộc</span>
                </div>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="admin-input font-bold text-sm py-2"
                  placeholder="Tên tác giả (không bắt buộc)..."
                />
              </div>

              {/* 3. Category */}
              <div className="admin-card p-4 flex flex-col gap-3 relative">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><FolderTree size={13} /></div>
                  <h3 className="text-[11px] font-extrabold text-gray-600 uppercase tracking-widest">Danh mục</h3>
                  <span className="text-[10px] font-bold text-red-500">Bắt buộc</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="admin-input font-bold text-sm py-2 text-left flex items-center justify-between"
                >
                  <span className={`truncate ${formData.informationId ? "text-gray-900" : "text-gray-400"}`}>
                    {formData.informationId ? getCategoryPath(formData.informationId) : "Chọn danh mục (bắt buộc)..."}
                  </span>
                  <ChevronLeft className={`w-4 h-4 shrink-0 transition-transform ${showCategoryDropdown ? "-rotate-90" : "rotate-180"}`} />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto p-2">
                    {renderCategoryTree()}
                  </div>
                )}
              </div>


              {/* 4. Tags */}
              <div className="admin-card p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-teal-50 text-teal-600 rounded-lg"><Tag size={13} /></div>
                  <h3 className="text-[11px] font-extrabold text-gray-600 uppercase tracking-widest">Tags</h3>
                  <span className="text-[10px] font-bold text-gray-400">Không bắt buộc</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                    className="admin-input font-bold text-sm py-2 min-w-0"
                    placeholder="Nhập tag (không bắt buộc)..."
                  />
                  <button type="button" onClick={handleAddTag} className="px-3 bg-gray-900 text-white rounded-xl font-black text-xs uppercase shrink-0">+</button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {formData.tags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-lg text-[11px] font-black uppercase border border-gray-200 flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="text-red-400 hover:text-red-600 leading-none">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Basic info: VI + EN side-by-side ── */}
            <div className="flex flex-wrap gap-3">
              <div className="admin-card p-5 flex-[2.5] gap-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-1.5 bg-primary-50 text-primary-700 rounded-lg"><FileText size={13} /></div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Thông tin cơ bản</h3>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTranslateMainToVietnamese}
                      disabled={isTranslatingMain}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest ${isTranslatingMain ? "bg-primary-100 text-primary-900 animate-pulse" : "bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-900"}`}
                    >
                      <Sparkles size={10} className={isTranslatingMain ? "animate-spin" : ""} />
                      EN→VI
                    </button>
                    <button
                      type="button"
                      onClick={handleTranslateMainToEnglish}
                      disabled={isTranslatingMain}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest ${isTranslatingMain ? "bg-primary-100 text-primary-900 animate-pulse" : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-900"}`}
                    >
                      <Sparkles size={10} className={isTranslatingMain ? "animate-spin" : ""} />
                      VI→EN
                    </button>
                  </div>
                </div>

                {/* Titles 2 cột */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="admin-label text-md mb-1">🇻🇳 Tiêu đề (VI) <span className="text-red-500">(bắt buộc)</span></label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="admin-input text-base py-2.5"
                      placeholder="Nhập tiêu đề tiếng Việt..."
                    />
                  </div>
                  <div>
                    <label className="admin-label text-md mb-1">🇬🇧 Title (EN) <span className="text-gray-400">(không bắt buộc)</span></label>
                    <input
                      type="text"
                      name="title_en"
                      value={formData.title_en || ""}
                      onChange={handleInputChange}
                      className="admin-input text-base py-2.5"
                      placeholder="Enter English title..."
                    />
                  </div>
                </div>

                {/* Excerpts 2 cột */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="admin-label text-md mb-1">Mô tả ngắn (VI) <span className="text-gray-400">(không bắt buộc)</span></label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt || ""}
                      onChange={handleInputChange}
                      rows={2}
                      className="admin-input font-medium resize-none text-sm"
                      placeholder="Mô tả nội dung bài viết..."
                    />
                  </div>
                  <div>
                    <label className="admin-label text-md mb-1">Excerpt (EN) <span className="text-gray-400">(không bắt buộc)</span></label>
                    <textarea
                      name="excerpt_en"
                      value={formData.excerpt_en || ""}
                      onChange={handleInputChange}
                      rows={2}
                      className="admin-input font-medium resize-none text-sm"
                      placeholder="Enter short description..."
                    />
                  </div>
                </div>

                {/* Slug */}
                <div className="border-t border-gray-100 pt-4">
                  <label className="admin-label text-md mb-1 flex items-center gap-1 text-primary-700">
                    <Link2 size={11} /> URL Slug <span className="text-gray-400">(không bắt buộc)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-black text-gray-400 tracking-widest uppercase shadow-sm shrink-0">/blog/</div>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="admin-input font-black text-primary-900 border-primary-900/20 py-2 text-sm"
                      placeholder="tu-dong-tu-tieu-de (không bắt buộc)"
                    />
                  </div>
                </div>
              </div>
              {/* 4. Featured Image */}
              <div className="admin-card flex-1 p-5 gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><ImageIcon size={13} /></div>
                  <h3 className="text-[11px] font-extrabold text-gray-600 uppercase tracking-widest">Ảnh đại diện</h3>
                  <span className="text-[10px] font-bold text-gray-400">Không bắt buộc</span>
                </div>
                <ImageField
                  label="Kéo thả hoặc chọn ảnh (không bắt buộc)"
                  value={formData.image}
                  onChange={(imageId, imageData) => {
                    setFormData((prev) => ({ ...prev, image: imageId || "" }));
                    setPreviewImageUrl(imageData?.cloudinaryUrl || "");
                  }}
                />
              </div>
            </div>

            {/* ── Content Sections ── */}
            <SectionWorkspace
              sections={formData.sections}
              sectionLanguages={sectionLanguages}
              onSetSectionLanguage={(index, language) => setSectionLanguages((prev) => ({ ...prev, [index]: language }))}
              onAddSection={handleAddSection}
              onRemoveSection={handleRemoveSection}
              onReorderSections={handleReorderSections}
              onSectionTitleChange={handleSectionTitleChange}
              onSectionChange={handleSectionChange}
              onCopyToEnglish={copyToEnglish}
              onCopyToVietnamese={copyToVietnamese}
              onTranslateToEnglish={handleTranslateSectionToEnglish}
              onTranslateToVietnamese={handleTranslateSectionToVietnamese}
              translatingSectionIndex={translatingSectionIndex}
              onImageUpload={handleTiptapImageUpload}
              previewTitleVi={formData.title}
              previewTitleEn={formData.title_en}
              previewAuthor={formData.author}
              previewImage={previewImageUrl}
              previewTags={formData.tags}
              previewCategoryId={formData.informationId}
              previewLanguage="vi"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminAddNewsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div></div>}>
      <AdminAddNewsPageContent />
    </Suspense>
  );
}