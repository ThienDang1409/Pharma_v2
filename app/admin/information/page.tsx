"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ImageField } from "@/app/components/admin/image";
import { informationApi, Information, ImagePreview } from "@/lib/api";
import { generateSlug } from "@/lib/utils/string/slug";
import { apiFetch, apiSubmit } from "@/lib/utils/api/apiHelper";
import { getImageUrl } from "@/lib/utils";
import { useLanguage } from "@/app/context/LanguageContext";
import { useToast } from "@/app/context/ToastContext";
import { CreateInformationSchemaI18n, UpdateInformationSchemaI18n } from "@/lib/validators";
import type { InformationFormData } from "@/lib/types/form.types";
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-gray-200 hover:border-primary-400"
    >
      <div className="flex items-start gap-4 p-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="shrink-0 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing bg-linear-to-br from-gray-100 to-gray-200 hover:from-primary-100 hover:to-primary-200 rounded-lg p-3 transition-all group border border-gray-300"
        >
          <svg className="w-6 h-6 text-gray-500 group-hover:text-primary-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
          <span className="text-xs font-medium text-gray-500 group-hover:text-primary-600 mt-1">Kéo</span>
        </div>

        {/* Image */}
        {category.image && (
          <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={getImageUrl(category.image)}
              alt={category.name_en || category.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Info Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              {/* Level Badge */}
              <div className="inline-block px-2 py-1 bg-secondary-100 text-secondary-700 rounded text-xs font-semibold mb-2">
                Cấp {currentLevel}
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
                {category.name_en || category.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {category.description_en || category.description || "No description"}
              </p>
            </div>

            {/* Child Count Badge */}
            {childCount > 0 && (
              <div className="shrink-0 px-3 py-2 bg-secondary-50 rounded-lg border border-secondary-200">
                <p className="text-xs text-secondary-700 font-medium whitespace-nowrap">
                  📁 {childCount} con
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="shrink-0 flex flex-wrap gap-2">
          {canViewChildren && (
            <button
              type="button"
              onClick={() => onViewChildren(category._id)}
              className="px-3 py-2 bg-secondary-100 text-secondary-700 rounded font-semibold text-sm hover:bg-secondary-200 transition-colors border border-secondary-200 whitespace-nowrap"
            >
              📁 Xem con
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="px-3 py-2 bg-primary-100 text-primary-700 rounded font-semibold text-sm hover:bg-primary-200 transition-colors border border-primary-200"
          >
            ✏️ Sửa
          </button>
          <button
            type="button"
            onClick={() => onDelete(category._id)}
            className={`px-3 py-2 rounded font-semibold text-sm transition-colors whitespace-nowrap ${
              deleteConfirm === category._id
                ? "bg-red-700 text-white"
                : "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
            }`}
          >
            {deleteConfirm === category._id ? "⚠️ Xác nhận?" : "🗑️ Xóa"}
          </button>
          <Link
            href={`/admin/blogs/add?categoryId=${category._id}`}
            className="px-3 py-2 bg-third-100 text-third-800 rounded font-semibold text-sm hover:bg-third-200 transition-colors border border-third-200 text-center"
          >
            📝 Viết bài
          </Link>
          <button
            type="button"
            onClick={() => onAddChild(category._id)}
            className="px-3 py-2 bg-green-100 text-green-700 rounded font-semibold text-sm hover:bg-green-200 transition-colors border border-green-200 whitespace-nowrap"
          >
            ➕ Tạo con
          </button>
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
      const imageUrl = category.image ? getImageUrl(category.image) : "";
      setFormData({
        name: category.name,
        name_en: category.name_en || "",
        slug: category.slug,
        parentId: category.parentId || null,
        description: category.description || "",
        description_en: category.description_en || "",
        image: imageUrl,
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
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: generateSlug(prev.name_en || newName),
    }));
  }, []);

  const handleNameEnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newNameEn = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name_en: newNameEn,
      slug: generateSlug(newNameEn || prev.name),
    }));
  }, []);


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

    const oldIndex = currentLevelCategories.findIndex(cat => cat._id === active.id);
    const newIndex = currentLevelCategories.findIndex(cat => cat._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic update
    const newOrder = arrayMove(currentLevelCategories, oldIndex, newIndex);
    
    // Map to reorder dto
    const items = newOrder.map((cat, index) => ({
      id: cat._id,
      order: index
    }));

    await apiFetch(
      () => informationApi.reorder(items),
      {
        onSuccess: async () => {
          await fetchCategories();
          toast?.success('Đã thay đổi vị trí danh mục');
        },
        onError: (error) => {
          console.error("Error reordering:", error);
          toast?.error('Lỗi thay đổi vị trí');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Danh mục sản phẩm</h1>
          <p className="text-gray-600 mt-1">
            Quản lý hệ thống phân loại sản phẩm (vô hạn cấp bậc)
          </p>
        </div>
        <div className="flex gap-2">
          {selectedParentId && (
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              ➕ Thêm con
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
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            ➕ Danh mục gốc mới
          </button>
        </div>
      </div>

      {/* Level Indicator */}
      <div className="bg-linear-to-r from-primary-50 to-secondary-50 border-l-4 border-primary-600 rounded-lg p-4">
        <p className="text-sm font-semibold text-gray-700">
          📊 <span className="text-primary-700 font-bold">Mức {currentLevel}</span>
          {currentLevel === 1 && " - Danh mục gốc"}
          {currentLevel > 1 && ` - Danh mục ${Array(currentLevel - 1).fill("con").join(" ")}`}
        </p>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedParentId(null)}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            !selectedParentId
              ? "bg-primary-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📁 Cấp 1
        </button>
        {breadcrumbPath.map((cat, idx) => (
          <div key={cat._id} className="flex items-center gap-2">
            <span className="text-gray-400">→</span>
            <button
              onClick={() => setSelectedParentId(cat._id)}
              className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                currentParent?._id === cat._id
                  ? "bg-secondary-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📁 {cat.name_en || cat.name}
            </button>
          </div>
        ))}
      </div>

      {/* Categories List */}
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
            <div className="space-y-3">
              {currentLevelCategories.map((category) => {
                const childCount = getChildren(category._id).length;
                const canViewChildren = childCount > 0;

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
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-5xl mb-3">📁</div>
          <p className="text-gray-600 mb-4">Không có danh mục nào ở cấp này</p>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold shadow-md"
          >
            Tạo danh mục đầu tiên
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b-2 border-secondary-200 sticky top-0 bg-linear-to-r from-primary-50 to-secondary-50">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalMode === "edit" ? "✏️ Chỉnh sửa danh mục" : "➕ Tạo danh mục mới"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {modalMode === "edit"
                  ? `Cấp ${breadcrumbPath.length + 1}`
                  : selectedParentId
                  ? `Danh mục con của: ${currentParent?.name}`
                  : "Danh mục gốc"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Language Toggle */}
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Thông tin danh mục</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryLanguage("vi")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      categoryLanguage === "vi"
                        ? "bg-primary-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    🇻🇳 VI
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryLanguage("en")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      categoryLanguage === "en"
                        ? "bg-primary-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    🇬🇧 EN {formData.name_en && "✓"}
                  </button>
                </div>
              </div>
              
              {/* Vietnamese Fields */}
              {categoryLanguage === "vi" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên danh mục (VI) *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={handleNameChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-gray-900"
                      placeholder="Nhập tên danh mục tiếng Việt"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mô tả (VI)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-gray-900"
                      rows={3}
                      placeholder="Mô tả danh mục bằng tiếng Việt"
                    />
                  </div>
                </>
              )}
              
              {/* English Fields */}
              {categoryLanguage === "en" && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Category Name (EN)
                      </label>
                      {formData.name && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, name_en: prev.name }))}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                        >
                          📋 Copy từ VI
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.name_en}
                      onChange={handleNameEnChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-gray-900"
                      placeholder="Enter English category name"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional - Falls back to Vietnamese if empty</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Description (EN)
                      </label>
                      {formData.description && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, description_en: prev.description }))}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                        >
                          📋 Copy từ VI
                        </button>
                      )}
                    </div>
                    <textarea
                      value={formData.description_en}
                      onChange={(e) =>
                        setFormData({ ...formData, description_en: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-gray-900"
                      rows={3}
                      placeholder="Enter English description"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent font-mono text-sm text-gray-900"
                  placeholder="danh-muc-slug"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">💡 Slug tự động sinh từ tên, bạn có thể chỉnh sửa nếu cần</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📊 Cấp bậc danh mục
                </label>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {/* Parent Info */}
                  {selectedParentId && (
                    <div className="bg-secondary-50 border-l-4 border-secondary-600 p-4 rounded">
                      <p className="text-sm text-secondary-900 font-medium">
                        <strong>📍 Danh mục cha:</strong> {currentParent?.name}
                      </p>
                      <p className="text-xs text-secondary-700 mt-1">
                        Danh mục mới sẽ được tạo dưới mục này
                      </p>
                    </div>
                  )}
                  
                  {!selectedParentId && (
                    <div className="bg-third-50 border-l-4 border-third-600 p-4 rounded">
                      <p className="text-sm text-third-900 font-medium">
                        <strong>📍 Loại:</strong> Danh mục gốc (không có cha)
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-gray-600 mt-2 p-2 bg-white rounded border-l-2 border-secondary-500">
                    💡 Danh mục mới sẽ được tạo ở <span className="font-bold text-secondary-600">Mức {selectedParentId ? currentLevel + 1 : 1}</span>
                  </p>
                </div>
              </div>

              <div>
                <ImageField
                  label="Hình ảnh danh mục"
                  value={formData.image}
                  onChange={(imageUrl) => setFormData((prev) => ({ ...prev, image: imageUrl || "" }))}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors shadow-md hover:shadow-lg"
                >
                  {editingCategory ? "Cập nhật" : "Tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
