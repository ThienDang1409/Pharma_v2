"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ImageField } from "@/app/components/admin/image";
import { informationApi, Information, ImagePreview } from "@/lib/api";
import type { InformationFormData } from "@/lib/types/form.types";
import { generateSlug } from "@/lib/utils/string/slug";
import { apiFetch, apiSubmit } from "@/lib/utils/api/apiHelper";
import { getImageUrl } from "@/lib/utils";
import { translateText } from "@/lib/utils/string/translate";
import { useLanguage } from "@/app/context/LanguageContext";
import { useToast } from "@/app/context/ToastContext";
import { CreateInformationSchemaI18n, UpdateInformationSchemaI18n } from "@/lib/validators";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Folder,
  Plus,
  Edit3,
  Trash2,
  GripVertical,
  ChevronRight,
  Globe,
  Layout,
  Check,
  Image as ImageIcon,
  ArrowRight,
  CheckCircle2,
  Trash,
  Sparkles,
  Search,
  FileText
} from "lucide-react";

// Sortable Category Card Component
interface SortableCategoryCardProps {
  category: Information;
  currentLevel: number;
  childCount: number;
  canViewChildren: boolean;
  deleteConfirm: string | null;
  onViewChildren: (id: string) => void;
  onEdit: (category: Information) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  getImageUrl: (
    image?: string | ImagePreview,
    transformation?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: string;
    }
  ) => string;
}

function SortableCategoryCard({
  category,
  currentLevel,
  childCount,
  canViewChildren,
  deleteConfirm,
  onViewChildren,
  onEdit,
  onDelete,
  onAddChild,
  getImageUrl,
}: SortableCategoryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`admin-card p-0 overflow-hidden transition-all duration-300 group border border-gray-200/80 ${isDragging ? "shadow-2xl scale-[1.02] border-primary-900/50 ring-2 ring-primary-900/15" : "hover:border-gray-300 hover:shadow-xl"}`}
      onClick={() => onViewChildren(category._id)}
    >
      <div className="flex items-stretch min-h-[120px]">
        {/* Drag Handle Column */}
        <div
          {...attributes}
          {...listeners}
          className="w-12 bg-gray-50 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing border-r border-gray-200 hover:bg-primary-900 hover:text-white transition-colors group"
        >
          <GripVertical size={20} className="text-gray-300 group-hover:text-white/50 transition-colors" />
        </div>

        {/* content Area */}
        <div className="flex-1 flex items-center p-6 gap-6">
          {/* Preview Image */}
          <div className="shrink-0 group/img relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shadow-inner">
              {category.image ? (
                <img
                  src={getImageUrl(category.image, { width: 100, quality: 80 })}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <ImageIcon size={24} />
                </div>
              )}
            </div>
            {childCount > 0 && (
              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-primary-900 text-white text-[8px] font-black uppercase rounded shadow-lg border border-white/20">
                {childCount}
              </div>
            )}
          </div>

          {/* Texts */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Cấp {currentLevel}</span>
              <div className="w-1 h-1 rounded-full bg-gray-200" />
              <span className="text-[10px] font-black text-primary-900/40 uppercase tracking-widest leading-none">ORDER: {category.order || 0}</span>
            </div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight truncate group-hover:text-primary-900 transition-colors">
              {category.name_en || category.name}
            </h3>
            <p className="text-[10px] font-medium text-gray-400 mt-0.5 italic truncate">{category.slug}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {canViewChildren && (
              <button
                type="button"
                onClick={() => onViewChildren(category._id)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-900 transition-all shadow-lg shadow-gray-900/10 active:scale-95"
              >
                {childCount > 0 ? "Mở rộng" : "Thêm con"} <ArrowRight size={12} />
              </button>
            )}

            <div className="w-[1px] h-8 bg-gray-200 mx-2" />

            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              <button
                type="button"
                onClick={() => onEdit(category)}
                className="p-3 bg-white text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-950 hover:text-white transition-all shadow-sm"
              >
                <Edit3 size={16} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(category._id)}
                className={`p-3 rounded-xl transition-all shadow-sm border ${deleteConfirm === category._id
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-300 border-gray-200 hover:text-red-600 hover:border-red-200"
                  }`}
              >
                <Trash2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => onAddChild(category._id)}
                className="p-3 bg-white text-gray-900 border border-gray-200 rounded-xl hover:bg-green-600 hover:text-white hover:border-green-600 transition-all shadow-sm"
                title="Tạo danh mục con"
              >
                <Plus size={16} />
              </button>
              <Link
                href={`/admin/blogs/add?categoryId=${category._id}`}
                className="p-3 bg-white text-gray-900 border border-gray-200 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                title="Viết bài cho danh mục này"
              >
                <FileText size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InformationPage() {
  const { language } = useLanguage();
  const toast = useToast();
  const [allCategories, setAllCategories] = useState<Information[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Information | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isTranslating, setIsTranslating] = useState(false);

  const [formData, setFormData] = useState<InformationFormData>({
    name: "",
    name_en: "",
    slug: "",
    parentId: null,
    description: "",
    description_en: "",
    image: "",
    order: 0,
    isActive: true,
  });

  const [categoryLanguage, setCategoryLanguage] = useState<"vi" | "en">("en");

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    await apiFetch(
      () => informationApi.getAll(),
      {
        onSuccess: (data) => {
          console.log(data)
          const items = Array.isArray(data?.items) ? data.items : [];
          setAllCategories(items);
        },
        onError: (error) => {
          console.error("Error fetching categories:", error);
        },
      }
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenModal = (category?: Information) => {
    if (category) {
      setModalMode("edit");
      setEditingCategory(category);
      const imageId =
        typeof category.image === "string"
          ? category.image
          : category.image?._id || "";
      setFormData({
        name: category.name,
        name_en: category.name_en || "",
        slug: category.slug,
        parentId: category.parentId || null,
        description: category.description || "",
        description_en: category.description_en || "",
        image: imageId,
        order: 0,
        isActive: true,
      });
    } else {
      setModalMode("create");
      setEditingCategory(null);
      setFormData({
        name: "",
        name_en: "",
        slug: "",
        parentId: selectedParentId || null,
        description: "",
        description_en: "",
        image: "",
        order: 0,
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      name_en: "",
      slug: "",
      parentId: null,
      description: "",
      description_en: "",
      image: "",
      order: 0,
      isActive: true,
    });
  };

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev: InformationFormData) => ({
      ...prev,
      name: newName,
      slug: generateSlug(prev.name_en || newName),
    }));
  }, []);

  const handleNameEnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newNameEn = e.target.value;
    setFormData((prev: InformationFormData) => ({
      ...prev,
      name_en: newNameEn,
      slug: generateSlug(newNameEn || prev.name),
    }));
  }, []);

  const handleTranslate = useCallback(async () => {
    const textToTranslate = formData.name;
    const descToTranslate = formData.description;

    if (!textToTranslate && !descToTranslate) {
      toast.error("Vui lòng nhập tên hoặc mô tả tiếng Việt trước");
      return;
    }

    setIsTranslating(true);
    try {
      const results = await Promise.all([
        textToTranslate ? translateText(textToTranslate) : Promise.resolve(""),
        descToTranslate ? translateText(descToTranslate) : Promise.resolve("")
      ]);

      setFormData((prev: InformationFormData) => ({
        ...prev,
        name_en: results[0] || prev.name_en,
        description_en: results[1] || prev.description_en,
        // Also regenerate slug if name was translated
        slug: results[0] ? generateSlug(results[0]) : prev.slug
      }));

      toast.success("Đã dịch sang tiếng Anh thành công");
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Lỗi khi dịch tự động. Kiểm tra lại API Key.");
    } finally {
      setIsTranslating(false);
    }
  }, [formData.name, formData.description, toast]);


  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      name: formData.name,
      name_en: formData.name_en,
      slug: formData.slug,
      description: formData.description || undefined,
      description_en: formData.description_en || undefined,
      image: formData.image || undefined,
      parentId: formData.parentId || undefined,
    };

    const schema = editingCategory
      ? UpdateInformationSchemaI18n(language)
      : CreateInformationSchemaI18n(language);

    if (editingCategory) {
      await apiSubmit(
        schema,
        submitData,
        () => informationApi.update(editingCategory._id, submitData),
        {
          toast,
          onSuccess: async () => {
            await fetchCategories();
            handleCloseModal();
          },
        }
      );
    } else {
      await apiSubmit(
        schema,
        submitData,
        () => informationApi.create(submitData),
        {
          toast,
          onSuccess: async () => {
            await fetchCategories();
            handleCloseModal();
          },
        }
      );
    }
  }, [editingCategory, formData, fetchCategories, toast]);

  const handleDelete = useCallback(async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    await apiFetch(
      () => informationApi.delete(id),
      {
        onSuccess: async () => {
          await fetchCategories();
          setDeleteConfirm(null);
        },
        onError: (error) => {
          console.error("Error deleting category:", error);
          alert("Lỗi xóa danh mục");
        },
      }
    );
  }, [deleteConfirm, fetchCategories]);

  // Get category by id
  const getCategory = useCallback((id: string) => {
    return allCategories.find((cat) => cat._id === id);
  }, [allCategories]);

  // Get children of a category
  const getChildren = useCallback((parentId: string) => {
    return allCategories.filter((cat) => cat.parentId === parentId);
  }, [allCategories]);

  // Root categories
  const rootCategories = allCategories.filter(
    (cat) => !cat.parentId || cat.parentId === null || cat.parentId === "null"
  );

  // Get current level categories to display
  const currentLevelCategories = selectedParentId
    ? getChildren(selectedParentId)
    : rootCategories;

  const currentParent = selectedParentId
    ? allCategories.find((cat) => cat._id === selectedParentId)
    : null;

  // Get breadcrumb path (chain of parent categories)
  const getBreadcrumbPath = useCallback((): Information[] => {
    const path: Information[] = [];
    let current = currentParent;
    while (current) {
      path.unshift(current);
      const parent = getCategory(current.parentId || "");
      current = parent || null;
    }
    return path;
  }, [currentParent, getCategory]);

  const breadcrumbPath = getBreadcrumbPath();
  const currentLevel = breadcrumbPath.length + 1;

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = currentLevelCategories.findIndex((cat: Information) => cat._id === active.id);
    const newIndex = currentLevelCategories.findIndex((cat: Information) => cat._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic update
    const newOrder = arrayMove(currentLevelCategories, oldIndex, newIndex);

    // Map to reorder dto
    const items = newOrder.map((cat: Information, index: number) => ({
      id: cat._id,
      order: index
    }));

    await apiFetch(
      () => informationApi.reorder(items),
      {
        onSuccess: async () => {
          await fetchCategories();
          toast.success('Đã thay đổi vị trí danh mục');
        },
        onError: (error) => {
          console.error("Error reordering:", error);
          toast.error('Lỗi thay đổi vị trí');
          // Revert on error
          fetchCategories();
        },
      }
    );
  }, [currentLevelCategories, fetchCategories, toast]);

  // Get category level (1, 2, or 3)
  const getCategoryLevel = useCallback((category: Information): number => {
    let level = 1;
    let current = category;
    while (current && current.parentId) {
      const parent = getCategory(current.parentId);
      if (!parent) break;
      current = parent;
      level++;
    }
    return level;
  }, [getCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="admin-card border border-gray-200/80 rounded-3xl p-5 md:p-6 bg-white">
        <div className="flex flex-col md:flex-row md:items-end justify-center gap-6">
        <div className="flex gap-2">
          {selectedParentId && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-900 transition-all shadow-xl shadow-gray-900/10 active:scale-95"
            >
              <Plus size={16} /> Tạo danh mục con
            </button>
          )}
          <button
            onClick={() => {
              setModalMode("create");
              setEditingCategory(null);
              setFormData({
                name: "",
                name_en: "",
                slug: "",
                parentId: null,
                description: "",
                description_en: "",
                image: "",
                order: 0,
                isActive: true,
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-8 py-4 bg-primary-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl shadow-primary-900/20 active:scale-95"
          >
            <Layout size={16} /> Danh mục gốc mới
          </button>
        </div>
        </div>
      </div>

      {/* Navigation & Context Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 admin-card bg-gray-50 border border-gray-200/80 rounded-3xl">
        <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2 md:pb-0 w-full md:w-auto">
          <button
            onClick={() => setSelectedParentId(null)}
            className={`shrink-0 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!selectedParentId
              ? "bg-primary-900 text-white shadow-lg"
              : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
              }`}
          >
            ROOT
          </button>
          {breadcrumbPath.map((cat, idx) => (
            <div key={cat._id} className="flex items-center gap-2 shrink-0">
              <ChevronRight size={14} className="text-gray-300" />
              <button
                onClick={() => setSelectedParentId(cat._id)}
                className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentParent?._id === cat._id
                  ? "bg-gray-900 text-white shadow-lg"
                  : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                  }`}
              >
                {cat.name_en || cat.name}
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-primary-900 animate-pulse" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">MỨC {currentLevel}</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 gap-6 admin-card border border-gray-200/80 rounded-3xl p-4 md:p-6 bg-white">
        {currentLevelCategories.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={currentLevelCategories.map(cat => cat._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {currentLevelCategories.map((category) => {
                  const childCount = getChildren(category._id).length;
                  const canViewChildren = true; // Bỏ giới hạn level 3, cho phép xem vô hạn cấp

                  return (
                    <SortableCategoryCard
                      key={category._id}
                      category={category}
                      currentLevel={currentLevel}
                      childCount={childCount}
                      canViewChildren={canViewChildren}
                      deleteConfirm={deleteConfirm}
                      onViewChildren={setSelectedParentId}
                      onEdit={handleOpenModal}
                      onDelete={handleDelete}
                      onAddChild={(parentId) => {
                        setModalMode("create");
                        setEditingCategory(null);
                        setFormData({
                          name: "",
                          name_en: "",
                          slug: "",
                          parentId,
                          description: "",
                          description_en: "",
                          image: "",
                          order: 0,
                          isActive: true,
                        });
                        setShowModal(true);
                      }}
                      getImageUrl={getImageUrl}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="admin-card p-40 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-200">
              <Folder size={40} className="text-gray-200" />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Trống</h3>
            <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">CHƯA CÓ DANH MỤC NÀO Ở CẤP ĐỘ NÀY</p>
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="mt-8 px-8 py-4 bg-primary-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl shadow-primary-900/20"
            >
              Tạo danh mục đầu tiên
              </button>
          </div>
        )}
</div>
      {/* Modal Section - Styled like blogs/add modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-10 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <p className="text-[10px] font-black text-primary-900 uppercase tracking-[0.3em] mb-1">Editor</p>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                  {modalMode === "edit" ? "Cập nhật danh mục" : "Tạo danh mục mới"}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-12 h-12 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Modal content */}
            <div className="overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                {/* Image Upload Area */}
                <div className="admin-card p-10 bg-gray-50/50 border-dashed border-2 border-gray-300 rounded-3xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white text-gray-900 rounded-xl shadow-sm">
                      <ImageIcon size={18} />
                    </div>
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Hình ảnh đại diện</h3>
                  </div>
                  <ImageField
                    label="Kéo thả ảnh hoặc click để chọn"
                    value={formData.image}
                    onChange={(imageId: string | null) => setFormData((prev: InformationFormData) => ({ ...prev, image: imageId || "" }))}
                  />
                </div>

                {/* Main Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 admin-card p-10 space-y-8 border border-gray-200/90 rounded-3xl bg-white">
                    {/* Header with Language Toggle */}
                    <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-50 text-primary-900 rounded-xl">
                          <Globe size={18} />
                        </div>
                        <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Nội dung hiển thị</h3>
                      </div>
                      <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-200">
                        <button
                          type="button"
                          onClick={() => setCategoryLanguage("vi")}
                          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${categoryLanguage === "vi" ? "bg-white text-primary-900 shadow-sm" : "text-gray-400 hover:text-gray-900"
                            }`}
                        >
                          🇻🇳 VI
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryLanguage("en")}
                          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${categoryLanguage === "en" ? "bg-white text-primary-900 shadow-sm" : "text-gray-400 hover:text-gray-900"
                            }`}
                        >
                          🇬🇧 EN
                        </button>
                      </div>
                    </div>

                    {categoryLanguage === "vi" ? (
                      <div className="space-y-6">
                        <div>
                          <label className="admin-label">Tên danh mục (VI)</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={handleNameChange}
                            className="admin-input h-14"
                            placeholder="VNDC v.v..."
                            required
                          />
                        </div>
                        <div>
                          <label className="admin-label">Mô tả chi tiết (VI)</label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="admin-input min-h-[120px] py-4"
                            placeholder="Nhập mô tả cho danh mục này..."
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="admin-label !mb-0">Translation Name (EN)</label>
                            <button
                              type="button"
                              onClick={() => setFormData((prev: InformationFormData) => ({ ...prev, name_en: prev.name }))}
                              className="text-[10px] font-black text-primary-900 uppercase tracking-widest hover:text-gray-900 transition-colors"
                            >
                              Sync from VI
                            </button>
                            <button
                              type="button"
                              onClick={handleTranslate}
                              disabled={isTranslating}
                              className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${isTranslating ? "text-primary-900 animate-pulse" : "text-primary-900/60 hover:text-primary-900"
                                }`}
                            >
                              <Sparkles size={12} className={isTranslating ? "animate-spin" : ""} />
                              {isTranslating ? "Translating..." : "Auto Translate"}
                            </button>
                          </div>
                          <input
                            type="text"
                            value={formData.name_en}
                            onChange={handleNameEnChange}
                            className="admin-input h-14"
                            placeholder="English Name..."
                          />
                        </div>
                        <div>
                          <label className="admin-label">English Description</label>
                          <textarea
                            value={formData.description_en}
                            onChange={(e) => setFormData((prev: InformationFormData) => ({ ...prev, description_en: e.target.value }))}
                            className="admin-input min-h-[120px] py-4"
                            placeholder="Enter English description..."
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Slug Area */}
                  <div className="md:col-span-2 admin-card p-10 border border-gray-200/90 rounded-3xl bg-white">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
                        <Sparkles size={18} />
                      </div>
                      <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Cấu hình kỹ thuật</h3>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="admin-label">Đường dẫn tĩnh (Slug)</label>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          className="admin-input h-14 font-mono text-gray-400 focus:text-gray-900"
                          placeholder="alias-path-here"
                          required
                        />
                      </div>

                      {/* Structure Indicator */}
                      <div className="p-6 bg-gray-50 rounded-3xl border border-gray-200">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-3">Vị trí cấu trúc</p>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border ${selectedParentId ? "bg-secondary-50 border-secondary-100 text-secondary-900" : "bg-primary-50 border-primary-100 text-primary-900"}`}>
                            <Layout size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-tight">
                              {selectedParentId ? `Con của: ${currentParent?.name}` : "Danh mục ROOT"}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Mức {currentLevel}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-20" /> {/* Spacer */}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-10 border-t border-gray-200 bg-gray-50/50 flex items-center justify-end gap-3 sticky bottom-0 z-10 backdrop-blur-md">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-10 py-4 bg-primary-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-950 transition-all shadow-xl shadow-primary-900/20 active:scale-95"
              >
                {modalMode === "edit" ? "Lưu thay đổi" : "Khởi tạo ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
