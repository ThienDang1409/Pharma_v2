"use client";

import TiptapEditor from "@/app/components/admin/editor/TiptapEditor";
import { ImageField } from "@/app/components/admin/image";
import CustomSelect from "@/app/components/admin/CustomSelect";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { blogApi, informationApi, imageApi, Information, ImageResponse, BlogSection, CreateBlogDto } from "@/lib/api";
import { IMAGE_FOLDERS } from "@/lib/constants/api";
import { generateSlug } from "@/lib/utils/string/slug";
import { translateText, translateHtmlPreservingMedia } from "@/lib/utils/string/translate";
import { useToast } from "@/app/context/ToastContext";
import { CreateBlogSchema } from "@/lib/validators";
import { apiFetch, apiSubmit } from "@/lib/utils/api/apiHelper";
import {
  Eye,
  Settings,
  Monitor,
  Smartphone,
  Save,
  ChevronLeft,
  Sparkles,
  ArrowLeft,
  User,
  ImageIcon,
  PlusCircle,
  Newspaper,
  LogOut,
  FolderTree
} from "lucide-react";
import BlogPreview from "@/app/components/admin/editor-modern/BlogPreview";

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

  // Language state for form fields - Default to English for slug generation
  const [mainLanguage, setMainLanguage] = useState<"vi" | "en">("en");
  const [sectionLanguages, setSectionLanguages] = useState<{ [key: number]: "vi" | "en" }>({});
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("edit");
  const [isInfoCollapsed, setIsInfoCollapsed] = useState(false);
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);
  const [isTranslatingMain, setIsTranslatingMain] = useState(false);
  const [translatingSectionIndex, setTranslatingSectionIndex] = useState<number | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [sectionViewModes, setSectionViewModes] = useState<Record<number, "edit" | "preview" | "split">>({});

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      await apiFetch(
        () => informationApi.getAll(),
        {
          onSuccess: (response) => {
            const data = response?.items || [];
            setCategories(Array.isArray(data) ? data : []);
          },
        }
      );
    };
    fetchCategories();
  }, []);

  // Auto-generate slug from English title (preferred) or Vietnamese title
  useEffect(() => {
    const titleForSlug = formData.title_en || formData.title;
    if (titleForSlug) {
      const slug = generateSlug(titleForSlug);
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title_en, formData.title]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        {
          type: "text",
          title: prev.title,
          slug: prev.slug,
          content,
        },
      ],
    }));
  };

  const handleAddSection = () => {
    const newSection: BlogSection = {
      type: "text",
      title: "",
      title_en: "",
      slug: "",
      content: "",
      content_en: "",
    };
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));

    // Set default language for new section
    setSectionLanguages(prev => ({
      ...prev,
      [formData.sections.length]: "vi"
    }));
  };

  const handleSectionChange = (
    index: number,
    field: keyof BlogSection,
    value: string
  ) => {
    setFormData((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[index] = { ...updatedSections[index], [field]: value };
      return { ...prev, sections: updatedSections };
    });
  };

  const handleRemoveSection = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));

    // Clean up language state
    setSectionLanguages(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });

    // Remove from collapsed set
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleSectionTitleChange = (index: number, title: string) => {
    setFormData((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[index] = {
        ...updatedSections[index],
        title,
        slug: generateSlug(title),
      };
      return { ...prev, sections: updatedSections };
    });
  };

  // Copy VI content to EN
  const copyToEnglish = (index: number) => {
    setFormData((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[index] = {
        ...updatedSections[index],
        title_en: updatedSections[index].title,
        content_en: updatedSections[index].content,
      };
      return { ...prev, sections: updatedSections };
    });
  };

  const copyToVietnamese = (index: number) => {
    setFormData((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[index] = {
        ...updatedSections[index],
        title: updatedSections[index].title_en || updatedSections[index].title,
        content: updatedSections[index].content_en || updatedSections[index].content,
      };
      return { ...prev, sections: updatedSections };
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

      setFormData((prev) => ({
        ...prev,
        title_en: titleEn || prev.title_en,
        excerpt_en: excerptEn || prev.excerpt_en,
      }));

      toast.success("Đã dịch thông tin cơ bản sang tiếng Anh");
    } catch (error) {
      console.error("Main translation error:", error);
      toast.error("Không thể dịch tự động. Kiểm tra API key hoặc kết nối.");
    } finally {
      setIsTranslatingMain(false);
    }
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

      setFormData((prev) => ({
        ...prev,
        title: titleVi || prev.title,
        excerpt: excerptVi || prev.excerpt,
      }));

      toast.success("Đã dịch thông tin cơ bản sang tiếng Việt");
    } catch (error) {
      console.error("Main reverse translation error:", error);
      toast.error("Không thể dịch tự động. Kiểm tra API key hoặc kết nối.");
    } finally {
      setIsTranslatingMain(false);
    }
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
        section.content?.trim()
          ? translateHtmlPreservingMedia(section.content, { from: "vi", to: "en" })
          : Promise.resolve(""),
      ]);

      setFormData((prev) => {
        const updated = [...prev.sections];
        updated[index] = {
          ...updated[index],
          title_en: translatedTitle || updated[index].title_en,
          content_en: translatedContent || updated[index].content_en,
        };
        return { ...prev, sections: updated };
      });

      toast.success(`Đã dịch phần ${index + 1} sang tiếng Anh`);
    } catch (error) {
      console.error("Section translation error:", error);
      toast.error("Không thể dịch phần nội dung. Vui lòng thử lại.");
    } finally {
      setTranslatingSectionIndex(null);
    }
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
        section.content_en?.trim()
          ? translateHtmlPreservingMedia(section.content_en, { from: "en", to: "vi" })
          : Promise.resolve(""),
      ]);

      setFormData((prev) => {
        const updated = [...prev.sections];
        updated[index] = {
          ...updated[index],
          title: translatedTitle || updated[index].title,
          content: translatedContent || updated[index].content,
        };
        return { ...prev, sections: updated };
      });

      toast.success(`Đã dịch phần ${index + 1} sang tiếng Việt`);
    } catch (error) {
      console.error("Section reverse translation error:", error);
      toast.error("Không thể dịch phần nội dung. Vui lòng thử lại.");
    } finally {
      setTranslatingSectionIndex(null);
    }
  };

  // Toggle section collapse
  const toggleSectionCollapse = (index: number) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Helper functions for hierarchical category selector
  const getCategoryName = (id: string): string => {
    const category = categories.find((cat) => cat._id === id);
    return category?.name || "";
  };

  const getCategoryPath = (id: string): string => {
    const path: string[] = [];
    let current = categories.find((cat) => cat._id === id);

    while (current) {
      path.unshift(current.name);
      current = categories.find((cat) => cat._id === current?.parentId);
    }

    return path.join(" › ");
  };

  const getRootCategories = () => {
    return categories.filter((cat) => !cat.parentId);
  };

  const getChildren = (parentId: string) => {
    return categories.filter((cat) => cat.parentId === parentId);
  };

  const renderCategoryTree = (parentId: string | null = null, level: number = 0): React.ReactElement[] => {
    const items = parentId ? getChildren(parentId) : getRootCategories();

    return items.map((cat) => {
      const children = getChildren(cat._id);
      const hasChildren = children.length > 0;
      const isSelected = formData.informationId === cat._id;

      return (
        <div key={cat._id}>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, informationId: cat._id }));
              setShowCategoryDropdown(false);
            }}
            className={`w-full text-left px-4 py-2 hover:bg-primary-50 transition-colors text-sm ${isSelected ? "bg-primary-100 text-primary-900 font-semibold" : "text-gray-700"
              }`}
            style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
          >
            {hasChildren && <span className="text-secondary-600 mr-1">▸</span>}
            {cat.name}
          </button>
          {hasChildren && renderCategoryTree(cat._id, level + 1)}
        </div>
      );
    });
  };



  const handleTiptapImageUpload = async (file: File): Promise<string> => {
    try {
      const result = await imageApi.upload(file, { folder: IMAGE_FOLDERS.BLOGS });
      const imageData = result.data?.image;
      if (imageData?.cloudinaryUrl) {
        return imageData.cloudinaryUrl;
      }
      throw new Error("No image URL returned");
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent,
    publishStatus: "draft" | "published"
  ) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Submitting blog data:", formData);

    const payload = { ...formData, status: publishStatus };

    // Use API helper with automatic validation and toast
    const result = await apiSubmit(
      CreateBlogSchema,
      payload,
      (validatedData) => blogApi.create(validatedData),
      {
        toast,
        successMsg:
          publishStatus === "published"
            ? "Xuất bản bài viết thành công!"
            : "Lưu nháp thành công!",
        onSuccess: () => {
          // Redirect to admin dashboard
          setTimeout(() => {
            window.location.href = "/admin/blogs";
          }, 1000);
        },
      }
    );

    setIsSubmitting(false);
    return result;
  };


  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Compact View Switcher: hover to expand full controls */}
      <div className="fixed bottom-8 right-8 z-50 group">
        <button
          type="button"
          className="w-14 h-14 rounded-full bg-primary-900 text-white shadow-xl shadow-primary-900/30 flex items-center justify-center"
          title="Mở thanh công cụ view"
        >
          <Eye size={18} />
        </button>

        <div className="absolute right-14 bottom-0 origin-right scale-95 opacity-0 pointer-events-none group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
          <div className="flex whitespace-nowrap p-2 items-center bg-white/95  backdrop-blur-xl p-1.5 rounded-2xl shadow-premium border border-gray-100">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all rounded-xl ${viewMode === 'edit' ? 'bg-primary-900 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Settings size={12} /> Soạn thảo
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all rounded-xl ${viewMode === 'preview' ? 'bg-primary-900 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Eye size={12} /> Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`hidden lg:flex px-4 py-2 text-[10px] font-black uppercase tracking-widest items-center gap-2 transition-all rounded-xl ${viewMode === 'split' ? 'bg-primary-900 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Monitor size={12} /> Split
            </button>
            <button
              type="button"
              onClick={() => setIsInfoCollapsed((prev) => !prev)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest items-center gap-2 transition-all rounded-xl flex ${isInfoCollapsed ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <ArrowLeft size={12} className={`transition-transform ${isInfoCollapsed ? 'rotate-180' : ''}`} />
              {isInfoCollapsed ? 'Mở cột info' : 'Thu gọn info'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar ${viewMode === 'preview' ? 'hidden' : viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
          <div className={`${viewMode === 'split' ? 'w-full' : 'container mx-auto'} py-8 px-4`}>
            <form className={`grid grid-cols-1 ${(viewMode === 'split' || isInfoCollapsed) ? 'lg:grid-cols-1' : 'lg:grid-cols-4'} gap-8`}>
              {/* Left Sidebar - Metadata (Hidden in Split Mode) */}
              {(viewMode !== 'split' && !isInfoCollapsed) ? (
                <div className="lg:col-span-1 space-y-6">
                  {/* Publish Card */}
                  <div className="admin-card p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                        <Save size={18} />
                      </div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Xuất bản</h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="admin-label">Trạng thái</label>
                        <CustomSelect
                          options={[
                            { label: "Bản nháp", value: "draft" },
                            { label: "Công khai", value: "published" },
                          ]}
                          value={formData.status}
                          onChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              status: value as "draft" | "published",
                            }))
                          }
                          placeholder="Chọn trạng thái..."
                          className="font-bold"
                        />
                      </div>

                      <div className="p-4 bg-white rounded-2xl flex items-start gap-4 border border-gray-200 shadow-sm">
                        <input
                          type="checkbox"
                          name="isProduct"
                          id="isProduct"
                          checked={formData.isProduct}
                          onChange={(e) => setFormData(prev => ({ ...prev, isProduct: e.target.checked }))}
                          className="admin-checkbox"
                        />
                        <label htmlFor="isProduct" className="flex flex-col cursor-pointer">
                          <span className="text-sm font-black text-gray-900 leading-tight">Đây là sản phẩm</span>
                          <span className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">Gắn thẻ bài viết sản phẩm</span>
                        </label>
                      </div>

                      <div className="pt-2 space-y-3">
                        {isSubmitting && (
                          <div className="p-4 bg-primary-50 text-primary-900 rounded-2xl flex items-center gap-3 animate-pulse font-bold text-sm">
                            <Sparkles size={18} className="animate-spin" />
                            <span>Đang lưu dữ liệu...</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleSubmit(e, "published")}
                          disabled={isSubmitting}
                          className="w-full flex items-center justify-center gap-2 py-4 bg-primary-900 text-white font-black rounded-2xl hover:bg-gray-900 transition-all shadow-xl shadow-primary-900/20 disabled:opacity-50"
                        >
                          <Monitor size={18} />
                          {isSubmitting ? "Processing..." : "XUẤT BẢN NGAY"}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleSubmit(e, "draft")}
                          disabled={isSubmitting}
                          className="w-full py-4 bg-white text-gray-600 font-black rounded-2xl border border-gray-200 hover:border-gray-900 hover:text-gray-900 transition-all shadow-sm disabled:opacity-50"
                        >
                          LƯU BẢN NHÁP
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Author Card */}
                  <div className="admin-card p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <User size={18} />
                      </div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Tác giả</h3>
                    </div>
                    <input
                      type="text"
                      id="author"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      required
                      className="admin-input font-bold"
                      placeholder="Tên tác giả..."
                    />
                  </div>

                  {/* Category Card */}
                  <div className="admin-card p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <FolderTree size={18} />
                      </div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Danh mục</h3>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className="admin-input font-bold text-left flex items-center justify-between"
                      >
                        <span className={formData.informationId ? "text-gray-900" : "text-gray-400"}>
                          {formData.informationId ? getCategoryPath(formData.informationId) : "Chọn danh mục..."}
                        </span>
                        <ChevronLeft className={`w-4 h-4 transition-transform ${showCategoryDropdown ? "-rotate-90" : "rotate-180"}`} />
                      </button>

                      {showCategoryDropdown && (
                        <div className=" z-50 w-full mt-3 bg-white border border-gray-200 rounded-2xl shadow-premium max-h-80 overflow-y-auto p-2">
                          {renderCategoryTree()}
                        </div>
                      )}
                    </div>

                    {formData.informationId && (
                      <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Path</span>
                        <span className="text-xs font-bold text-indigo-900">{getCategoryPath(formData.informationId)}</span>
                      </div>
                    )}
                  </div>

                  {/* Featured Image Card */}
                  <div className="admin-card p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                        <ImageIcon size={18} />
                      </div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Hình đại diện</h3>
                    </div>
                    <ImageField
                      label="Kéo thả hoặc chọn ảnh"
                      value={formData.image}
                      onChange={(imageId, imageData) => {
                        setFormData((prev) => ({ ...prev, image: imageId || "" }));
                        setPreviewImageUrl(imageData?.cloudinaryUrl || "");
                      }}
                      required
                    />
                  </div>

                  {/* Tags Card */}
                  <div className="admin-card p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                        <Sparkles size={18} />
                      </div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Tags</h3>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="admin-input font-bold"
                        placeholder="Nhập tag..."
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase"
                      >
                        ADD
                      </button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-gray-50 text-gray-900 rounded-xl text-xs font-black uppercase border border-gray-200 flex items-center gap-2"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Main Content Area */}
              <div className={`${(viewMode === 'split' || isInfoCollapsed) ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-8`}>
                {/* Basic Info Card */}
                <div className="admin-card p-10">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-8 mb-8">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Thông tin cơ bản</h3>
                      <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-[0.2em]">TIÊU ĐỀ, MÔ TẢ VÀ URL</p>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner">
                      <button
                        type="button"
                        onClick={() => setMainLanguage("vi")}
                        className={`px-5 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${mainLanguage === "vi" ? "bg-white text-gray-900 shadow-md border border-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        🇻🇳 Tiếng Việt
                      </button>
                      <button
                        type="button"
                        onClick={() => setMainLanguage("en")}
                        className={`px-5 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${mainLanguage === "en" ? "bg-white text-gray-900 shadow-md border border-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        🇬🇧 English
                      </button>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {mainLanguage === "vi" ? (
                      <>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleTranslateMainToVietnamese}
                            disabled={isTranslatingMain}
                            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${isTranslatingMain
                              ? "bg-primary-100 text-primary-900 animate-pulse"
                              : "bg-primary-50 text-primary-900 hover:bg-primary-100"
                              }`}
                          >
                            <Sparkles size={12} className={isTranslatingMain ? "animate-spin" : ""} />
                            {isTranslatingMain ? "Đang dịch..." : "Dịch từ EN"}
                          </button>
                        </div>
                        <div>
                          <label className="admin-label">Tiêu đề bài viết (VI)</label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="admin-input text-2xl font-black leading-tight py-6"
                            placeholder="Nhập tiêu đề tiếng Việt..."
                          />
                        </div>
                        <div>
                          <label className="admin-label">Mô tả ngắn (VI)</label>
                          <textarea
                            name="excerpt"
                            value={formData.excerpt || ""}
                            onChange={handleInputChange}
                            rows={3}
                            className="admin-input font-bold resize-none"
                            placeholder="Mô tả nội dung bài viết..."
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleTranslateMainToEnglish}
                            disabled={isTranslatingMain}
                            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${isTranslatingMain
                              ? "bg-primary-100 text-primary-900 animate-pulse"
                              : "bg-primary-50 text-primary-900 hover:bg-primary-100"
                              }`}
                          >
                            <Sparkles size={12} className={isTranslatingMain ? "animate-spin" : ""} />
                            {isTranslatingMain ? "Đang dịch..." : "Dịch từ VI"}
                          </button>
                        </div>
                        <div>
                          <label className="admin-label">Blog Title (EN)</label>
                          <input
                            type="text"
                            name="title_en"
                            value={formData.title_en || ""}
                            onChange={handleInputChange}
                            className="admin-input text-2xl font-black leading-tight py-6"
                            placeholder="Enter English title..."
                          />
                        </div>
                        <div>
                          <label className="admin-label">Excerpt (EN)</label>
                          <textarea
                            name="excerpt_en"
                            value={formData.excerpt_en || ""}
                            onChange={handleInputChange}
                            rows={3}
                            className="admin-input font-bold resize-none"
                            placeholder="Enter short description..."
                          />
                        </div>
                      </>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <label className="admin-label text-primary-900">URL Slug</label>
                      <div className="flex items-center gap-3">
                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[10px] font-black text-gray-400 tracking-widest uppercase shadow-sm">/blog/</div>
                        <input
                          type="text"
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          required
                          className="admin-input font-black text-primary-900 border-primary-900/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Nội dung chi tiết</h2>
                      {formData.sections.length > 0 && (
                        <p className="text-[10px] font-black text-primary-900 mt-1 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded-md inline-block">
                          {formData.sections.length} PHẦN NỘI DUNG
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="flex items-center gap-3 px-6 py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all transform hover:scale-[1.02] active:scale-95 text-sm"
                    >
                      <PlusCircle size={18} />
                      THÊM PHẦN MỚI
                    </button>
                  </div>

                  {formData.sections.length === 0 ? (
                    <div className="admin-card p-20 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mb-6">
                        <Newspaper size={40} />
                      </div>
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Bắt đầu tạo nội dung</h3>
                      <p className="text-sm font-bold text-gray-400 mb-8 max-w-xs">Thêm các phần nội dung khác nhau để tạo nên bài viết chuyên sâu của bạn.</p>
                      <button
                        type="button"
                        onClick={handleAddSection}
                        className="px-10 py-4 bg-primary-900 text-white font-black rounded-2xl hover:bg-gray-900 transition-all shadow-xl shadow-primary-900/10"
                      >
                        THÊM PHẦN ĐẦU TIÊN
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {formData.sections.map((section, index) => {
                        const sectionLang = sectionLanguages[index] || "vi";
                        const isCollapsed = collapsedSections.has(index);
                        const sectionEditorMode = sectionViewModes[index] || "edit";

                        return (
                          <div key={index} className="admin-card overflow-hidden group">
                            {/* Section Header */}
                            <div className="px-8 py-6 flex items-center justify-between border-b border-gray-200 bg-gray-50/50 group-hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center justify-center w-10 h-10 bg-white border-2 border-primary-900/20 text-primary-900 font-black rounded-xl text-sm shadow-sm ring-4 ring-primary-50">
                                  {index + 1}
                                </span>
                                <div>
                                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                                    {section.title || `PHẦN NỘI DUNG ${index + 1}`}
                                  </h3>
                                  <div className="flex gap-2 mt-1">
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${section.title ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>VI</span>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${section.title_en ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>EN</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleSectionCollapse(index)}
                                  className="p-3 text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl transition-all"
                                >
                                  <ChevronLeft size={18} className={`transition-transform duration-300 ${isCollapsed ? "-rotate-90" : "rotate-90"}`} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSection(index)}
                                  className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <LogOut size={18} />
                                </button>
                              </div>
                            </div>

                            {/* Section Content */}
                            {!isCollapsed && (
                              <div className="p-8 space-y-8 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between">
                                  <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner">
                                    <button
                                      type="button"
                                      onClick={() => setSectionLanguages(prev => ({ ...prev, [index]: "vi" }))}
                                      className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${sectionLang === "vi" ? "bg-white text-gray-900 shadow-md border border-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                                    >
                                      VI Tiếng Việt
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSectionLanguages(prev => ({ ...prev, [index]: "en" }))}
                                      className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${sectionLang === "en" ? "bg-white text-gray-900 shadow-md border border-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                                    >
                                      EN English
                                    </button>
                                  </div>
                                  {sectionLang === "vi" && (
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => copyToVietnamese(index)}
                                        className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-primary-900 bg-primary-50 rounded-xl hover:bg-primary-100 transition-all uppercase tracking-widest"
                                      >
                                        <Newspaper size={14} /> COPY TỪ BẢN TIẾNG ANH
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleTranslateSectionToVietnamese(index)}
                                        disabled={translatingSectionIndex === index}
                                        className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${translatingSectionIndex === index
                                          ? "bg-primary-100 text-primary-900 animate-pulse"
                                          : "bg-green-50 text-green-700 hover:bg-green-100"
                                          }`}
                                      >
                                        <Sparkles size={14} className={translatingSectionIndex === index ? "animate-spin" : ""} />
                                        {translatingSectionIndex === index ? "ĐANG DỊCH..." : "DỊCH EN -> VI"}
                                      </button>
                                    </div>
                                  )}
                                  {sectionLang === "en" && (
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => copyToEnglish(index)}
                                        className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-primary-900 bg-primary-50 rounded-xl hover:bg-primary-100 transition-all uppercase tracking-widest"
                                      >
                                        <Newspaper size={14} /> COPY TỪ BẢN TIẾNG VIỆT
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleTranslateSectionToEnglish(index)}
                                        disabled={translatingSectionIndex === index}
                                        className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${translatingSectionIndex === index
                                          ? "bg-primary-100 text-primary-900 animate-pulse"
                                          : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                          }`}
                                      >
                                        <Sparkles size={14} className={translatingSectionIndex === index ? "animate-spin" : ""} />
                                        {translatingSectionIndex === index ? "ĐANG DỊCH..." : "DỊCH VI -> EN"}
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-gray-200 bg-gray-50">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Editor mode</span>
                                  <div className="flex bg-white border border-gray-200 rounded-xl p-1">
                                    <button
                                      type="button"
                                      onClick={() => setSectionViewModes((prev) => ({ ...prev, [index]: "edit" }))}
                                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-wider ${sectionEditorMode === "edit" ? "bg-primary-900 text-white" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSectionViewModes((prev) => ({ ...prev, [index]: "preview" }))}
                                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-wider ${sectionEditorMode === "preview" ? "bg-primary-900 text-white" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                      Preview
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSectionViewModes((prev) => ({ ...prev, [index]: "split" }))}
                                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-wider ${sectionEditorMode === "split" ? "bg-primary-900 text-white" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                      Split
                                    </button>
                                  </div>
                                </div>

                                {sectionLang === "vi" ? (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                      <div>
                                        <label className="admin-label">Tiêu đề phần (VI)</label>
                                        <input
                                          type="text"
                                          value={section.title}
                                          onChange={(e) => handleSectionTitleChange(index, e.target.value)}
                                          className="admin-input font-bold"
                                          placeholder="Tên phần nội dung..."
                                        />
                                      </div>
                                      <div>
                                        <label className="admin-label">Slug phần</label>
                                        <input
                                          type="text"
                                          value={section.slug}
                                          className="admin-input font-bold text-gray-400 cursor-not-allowed"
                                          readOnly
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="admin-label">Nội dung chi tiết (VI)</label>
                                      <div className={`mt-2 ${sectionEditorMode === "split" ? "grid grid-cols-1 xl:grid-cols-2 gap-4" : ""}`}>
                                        {sectionEditorMode !== "preview" && (
                                          <div className="rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                                            <TiptapEditor
                                              content={section.content}
                                              onChange={(content) => handleSectionChange(index, "content", content)}
                                              placeholder={`Nhập nội dung cho phần ${index + 1}...`}
                                              onImageUpload={handleTiptapImageUpload}
                                            />
                                          </div>
                                        )}
                                        {sectionEditorMode !== "edit" && (
                                          <div className="rounded-3xl border border-gray-200 bg-white p-5 overflow-y-auto max-h-[520px]">
                                            <div
                                              className="prose prose-sm md:prose-base max-w-none"
                                              dangerouslySetInnerHTML={{ __html: section.content || "<p class='text-gray-400'>Chưa có nội dung</p>" }}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-6">
                                    <div>
                                      <label className="admin-label">Section Title (EN)</label>
                                      <input
                                        type="text"
                                        value={section.title_en || ""}
                                        onChange={(e) => handleSectionChange(index, "title_en", e.target.value)}
                                        className="admin-input font-bold"
                                        placeholder="Section title in English..."
                                      />
                                    </div>
                                    <div>
                                      <label className="admin-label">Section Content (EN)</label>
                                      <div className={`mt-2 ${sectionEditorMode === "split" ? "grid grid-cols-1 xl:grid-cols-2 gap-4" : ""}`}>
                                        {sectionEditorMode !== "preview" && (
                                          <div className="rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                                            <TiptapEditor
                                              content={section.content_en || ""}
                                              onChange={(content) => handleSectionChange(index, "content_en", content)}
                                              placeholder={`Enter content for section ${index + 1} in English...`}
                                              onImageUpload={handleTiptapImageUpload}
                                            />
                                          </div>
                                        )}
                                        {sectionEditorMode !== "edit" && (
                                          <div className="rounded-3xl border border-gray-200 bg-white p-5 overflow-y-auto max-h-[520px]">
                                            <div
                                              className="prose prose-sm md:prose-base max-w-none"
                                              dangerouslySetInnerHTML={{ __html: section.content_en || "<p class='text-gray-400'>No content yet</p>" }}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </main>


        {/* Preview Area */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <section className={`flex-1 h-full bg-gray-100 relative overflow-y-auto custom-scrollbar border-l border-gray-200 ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
            {/* Preview Controls */}
            <div className="sticky top-10 right-10 z-30 flex justify-end px-10 pointer-events-none">
              <div className="flex items-center bg-white/90 backdrop-blur-xl p-1.5 rounded-2xl shadow-premium border border-white pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setIsPreviewMobile(false)}
                  className={`p-3 rounded-xl transition-all ${!isPreviewMobile ? 'bg-primary-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <Monitor size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewMobile(true)}
                  className={`p-3 rounded-xl transition-all ${isPreviewMobile ? 'bg-primary-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <Smartphone size={18} />
                </button>
              </div>
            </div>

            <BlogPreview
              content={formData.sections.map(s => (mainLanguage === 'en' ? s.content_en : s.content) || s.content).join('<div class="my-10 h-px bg-gray-100" />')}
              title={mainLanguage === 'en' ? formData.title_en : formData.title}
              author={formData.author}
              image={previewImageUrl}
              tags={formData.tags}
              isMobile={isPreviewMobile}
            />
          </section>
        )}
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