"use client";

import TiptapEditor from "@/app/components/TiptapEditor";
import { ImageField } from "@/app/components/admin";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { blogApi, informationApi, imageApi, Information, ImageResponse } from "@/lib/api";
import { IMAGE_FOLDERS } from "@/lib/constants/api";
import { generateSlug } from "@/lib/utils/slug";
import { useToast } from "@/app/context/ToastContext";
import { CreateBlogSchema, type CreateBlogInput } from "@/lib/validators";
import { handleFormSubmit, silentApiCall } from "@/lib/utils/apiHelper_backup";

interface BlogSection {
  type: string;
  title: string;
  title_en?: string;
  slug: string;
  content: string;
  content_en?: string;
}

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

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const result = await silentApiCall(
        () => informationApi.getAll(),
        {
          onSuccess: (response) => {
            const data = response?.data?.items || [];
            setCategories(Array.isArray(data) ? data : []);
          }
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
    const slug = generateSlug(title);

    setFormData((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[index] = {
        ...updatedSections[index],
        title,
        slug,
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

  // Initialize form submit handler with validation
  const submitBlog = handleFormSubmit<CreateBlogInput, any>(CreateBlogSchema, toast);

  const handleSubmit = async (
    e: React.FormEvent,
    publishStatus: "draft" | "published"
  ) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = { ...formData, status: publishStatus };

    // Remove informationId if empty (backend doesn't accept empty string for ObjectId)
    if (!submitData.informationId || submitData.informationId === "") {
      delete (submitData as any).informationId;
    }

    // Use API helper with automatic validation and toast
    const result = await submitBlog(
      submitData,
      (validatedData) => blogApi.create(validatedData),
      {
        successMessage:
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
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Thêm bài viết mới</h1>
          <p className="text-gray-600 mt-1">Thêm blog/news cho website</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto py-8">
        <form className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Metadata */}
          <div className="lg:col-span-1 space-y-6">
            {/* Publish Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="font-semibold text-gray-800">Xuất bản</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-600 transition-all text-sm text-black"
                  >
                    <option value="draft">Nháp</option>
                    <option value="published">Xuất bản</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isProduct"
                      checked={formData.isProduct}
                      onChange={(e) => setFormData(prev => ({ ...prev, isProduct: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Đây là sản phẩm
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Đánh dấu nếu đây là bài viết về sản phẩm
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  {isSubmitting && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm font-medium text-yellow-800">Đang xử lý...</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, "published")}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-linear-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Đang xuất bản...
                      </span>
                    ) : (
                      "🚀 Xuất bản ngay"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, "draft")}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    💾 Lưu nháp
                  </button>
                </div>
              </div>
            </div>

            {/* Author Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5 text-secondary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <h3 className="font-semibold text-gray-800">Tác giả <span className="text-red-600">*</span></h3>
              </div>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-600 transition-all text-sm text-black"
                placeholder="Tên tác giả"
              />
            </div>

            {/* Category Card - Hierarchical Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <h3 className="font-semibold text-gray-800">Danh mục <span className="text-red-600">*</span></h3>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-600 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className={formData.informationId ? "text-gray-900 font-medium" : "text-gray-500"}>
                    {formData.informationId ? getCategoryPath(formData.informationId) : "Chọn danh mục..."}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showCategoryDropdown && (
                  <div className="absolute z-50 w-full mt-2 bg-white border-2 border-primary-300 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                    {renderCategoryTree()}
                  </div>
                )}
              </div>

              {formData.informationId && (
                <p className="mt-3 text-sm text-secondary-700 bg-secondary-50 px-3 py-2 rounded border-l-4 border-secondary-500">
                  📁 Đã chọn: <strong>{getCategoryPath(formData.informationId)}</strong>
                </p>
              )}
            </div>

            {/* Featured Image Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5 text-third-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="font-semibold text-gray-800">Hình đại diện</h3>
              </div>
              <ImageField
                label="Chọn hình ảnh đại diện"
                value={formData.image}
                onChange={(imageUrl) => setFormData((prev) => ({ ...prev, image: imageUrl || "" }))}
                required
              />
            </div>

            {/* Tags Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5 text-secondary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
                <h3 className="font-semibold text-gray-800">Tags</h3>
              </div>
              <div className="flex gap-2 mb-3">
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
                  className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-600 text-sm text-black"
                  placeholder="Nhập tag..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors text-sm font-medium"
                >
                  Thêm
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-secondary-100 text-secondary-800 rounded-full text-xs font-medium flex items-center gap-2 border border-secondary-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-secondary-700 hover:text-secondary-900 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Blog Title & Slug with i18n */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                {/* Language Toggle */}
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Thông tin cơ bản</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMainLanguage("vi")}
                      className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${mainLanguage === "vi"
                          ? "bg-primary-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      🇻🇳 Tiếng Việt
                    </button>
                    <button
                      type="button"
                      onClick={() => setMainLanguage("en")}
                      className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${mainLanguage === "en"
                          ? "bg-primary-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      🇬🇧 English
                      {formData.title_en && (
                        <span className="ml-1 text-xs">✓</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Vietnamese Title */}
                {mainLanguage === "vi" && (
                  <>
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Tiêu đề (VI) *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 text-xl font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-black"
                        placeholder="Nhập tiêu đề tiếng Việt..."
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="excerpt"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Mô tả ngắn (VI)
                      </label>
                      <textarea
                        id="excerpt"
                        name="excerpt"
                        value={formData.excerpt || ""}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-black resize-none"
                        placeholder="Mô tả ngắn cho bài viết..."
                      />
                    </div>
                  </>
                )}

                {/* English Title */}
                {mainLanguage === "en" && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label
                          htmlFor="title_en"
                          className="block text-sm font-semibold text-gray-700"
                        >
                          Title (EN)
                        </label>
                        {formData.title && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, title_en: prev.title }))}
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                          >
                            📋 Copy từ VI
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        id="title_en"
                        name="title_en"
                        value={formData.title_en || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-xl font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-black"
                        placeholder="Enter English title..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Optional - Falls back to Vietnamese if empty</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label
                          htmlFor="excerpt_en"
                          className="block text-sm font-semibold text-gray-700"
                        >
                          Excerpt (EN)
                        </label>
                        {formData.excerpt && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, excerpt_en: prev.excerpt }))}
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                          >
                            📋 Copy từ VI
                          </button>
                        )}
                      </div>
                      <textarea
                        id="excerpt_en"
                        name="excerpt_en"
                        value={formData.excerpt_en || ""}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-black resize-none"
                        placeholder="Enter short description..."
                      />
                    </div>
                  </>
                )}

                <div>
                  <label
                    htmlFor="slug"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    URL Slug *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">/blog/</span>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-black"
                      placeholder="auto-generated-slug"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Tự động tạo từ tiêu đề. Dùng trong URL.
                  </p>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Nội dung
                  {formData.sections.length > 0 && (
                    <span className="text-sm font-normal text-gray-500">
                      ({formData.sections.length})
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-4 py-2.5 bg-linear-to-r from-primary-600 to-primary-800 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Thêm phần
                </button>
              </div>

              {formData.sections.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Chưa có phần nào
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Thêm phần đầu tiên để bắt đầu tạo nội dung
                  </p>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Thêm phần đầu tiên
                  </button>
                </div>
              )}

              {formData.sections.map((section, index) => {
                const sectionLang = sectionLanguages[index] || "vi";
                const isCollapsed = collapsedSections.has(index);

                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    {/* Section Header */}
                    <div className="bg-linear-to-r from-primary-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-linear-to-r from-primary-600 to-indigo-600 text-white font-bold rounded-lg text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {section.title || `Section ${index + 1}`}
                          </h3>
                          <div className="flex gap-2 mt-1">
                            {section.title && (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                🇻🇳 VI ✓
                              </span>
                            )}
                            {section.title_en && (
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                🇬🇧 EN ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSectionCollapse(index)}
                          className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                          title={isCollapsed ? "Expand" : "Collapse"}
                        >
                          <svg
                            className={`w-5 h-5 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove section"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Section Content */}
                    {!isCollapsed && (
                      <div className="p-6 space-y-4">
                        {/* Language Toggle for Section */}
                        <div className="flex items-center justify-between pb-3 border-b">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setSectionLanguages(prev => ({ ...prev, [index]: "vi" }))}
                              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${sectionLang === "vi"
                                  ? "bg-primary-600 text-white shadow-sm"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                              🇻🇳 VI
                            </button>
                            <button
                              type="button"
                              onClick={() => setSectionLanguages(prev => ({ ...prev, [index]: "en" }))}
                              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${sectionLang === "en"
                                  ? "bg-primary-600 text-white shadow-sm"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                              🇬🇧 EN
                              {section.title_en && (
                                <span className="ml-1 text-xs">✓</span>
                              )}
                            </button>
                          </div>
                          {sectionLang === "en" && (
                            <button
                              type="button"
                              onClick={() => copyToEnglish(index)}
                              className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy từ VI
                            </button>
                          )}
                        </div>

                        {/* Vietnamese Fields */}
                        {sectionLang === "vi" && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Tiêu đề phần (VI) *
                                </label>
                                <input
                                  type="text"
                                  value={section.title}
                                  onChange={(e) =>
                                    handleSectionTitleChange(index, e.target.value)
                                  }
                                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-black"
                                  placeholder="Nhập tiêu đề phần..."
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Slug
                                </label>
                                <input
                                  type="text"
                                  value={section.slug}
                                  onChange={(e) =>
                                    handleSectionChange(index, "slug", e.target.value)
                                  }
                                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 text-black"
                                  placeholder="auto-generated"
                                  required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nội dung (VI) *
                              </label>
                              <TiptapEditor
                                content={section.content}
                                onChange={(content) =>
                                  handleSectionChange(index, "content", content)
                                }
                                placeholder={`Nhập nội dung phần ${index + 1}...`}
                                onImageUpload={handleTiptapImageUpload}
                              />
                            </div>
                          </>
                        )}

                        {/* English Fields */}
                        {sectionLang === "en" && (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Title (EN)
                              </label>
                              <input
                                type="text"
                                value={section.title_en || ""}
                                onChange={(e) =>
                                  handleSectionChange(index, "title_en", e.target.value)
                                }
                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-black"
                                placeholder="Enter English title..."
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Optional - Falls back to Vietnamese if empty
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Content (EN)
                              </label>
                              <TiptapEditor
                                content={section.content_en || ""}
                                onChange={(content) =>
                                  handleSectionChange(index, "content_en", content)
                                }
                                placeholder={`Enter English content for section ${index + 1}...`}
                                onImageUpload={handleTiptapImageUpload}
                              />
                              <p className="text-xs text-gray-500 mt-2">
                                Optional - Falls back to Vietnamese if empty
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </form>
      </main>
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