"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/app/context/ToastContext";
import { apiSubmit } from "@/lib/utils/api/apiHelper";
import { z } from "zod";
import { blogApi, informationApi } from "@/lib/api";
import type { Blog, Information, BlogQueryParams, InformationPreviewDto } from "@/lib/types";
import { BLOG_STATUS } from "@/lib/constants/api";
import { getApiErrorFeedback } from "@/lib/utils";
import Pagination from "@/app/components/common/Pagination";
import CustomSelect from "@/app/components/admin/CustomSelect";
import {
  Search,
  Plus,
  Filter,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Edit3,
  Trash2,
  ExternalLink,
  ArrowRight,
  Folder,
  Newspaper
} from "lucide-react";

export default function AdminBlogsPage() {
  const toast = useToast();
  const [allCategories, setAllCategories] = useState<Information[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, [currentPage, statusFilter, selectedCategoryPath, debouncedSearchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Build query params
      const params: BlogQueryParams = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (selectedCategoryPath.length > 0) {
        const selectedCategoryId = selectedCategoryPath[selectedCategoryPath.length - 1];
        params.informationId = selectedCategoryId;
      }

      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery;
      }

      const [blogsResponse, categoriesResponse] = await Promise.all([
        blogApi.getAll(params),
        informationApi.getAll(),
      ]);

      // Extract blogs from response
      const blogs = blogsResponse.data?.items || [];
      setFilteredBlogs(blogs);
      setPagination({
        page: blogsResponse.data?.currentPage || 1,
        limit: 10,
        total: blogsResponse.data?.total || 0,
        totalPages: blogsResponse.data?.totalPages || 0,
      });

      // Extract categories data
      const categories = categoriesResponse.data?.items || [];
      setAllCategories(Array.isArray(categories) ? categories : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 when filters or keyword change
    setCurrentPage(1);
  }, [statusFilter, selectedCategoryPath, debouncedSearchQuery]);

  const handleSelectCategory = (categoryId: string, level: number) => {
    const newPath = selectedCategoryPath.slice(0, level + 1);
    if (newPath[newPath.length - 1] === categoryId) {
      newPath.pop();
    } else {
      newPath[level] = categoryId;
    }
    setSelectedCategoryPath(newPath);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    // Use apiSubmit for consistent validation/toast/error handling
    const result = await apiSubmit(z.any(), {}, () => blogApi.delete(id), {
      toast,
      successMsg: "Xóa bài viết thành công!",
      onSuccess: () => {
        fetchData();
        setDeleteConfirm(null);
      },
    });

    if (!result.success) {
      // apiSubmit already showed toast; log for debugging
      console.debug("Delete failed:", result.error);
    }
  };

  const getCategory = (infoId?: string | Information | InformationPreviewDto) => {
    if (!infoId) return null;
    // If it's already a populated object, return it
    if (typeof infoId === "object" && "name" in infoId) {
      return infoId;
    }
    // Otherwise, find it in allCategories
    return allCategories.find((cat) => cat._id === infoId);
  };

  const getChildCategories = (parentId?: string) => {
    if (!parentId) {
      return allCategories.filter(
        (cat) => !cat.parentId || cat.parentId === null || cat.parentId === "null"
      );
    }
    return allCategories.filter((cat) => cat.parentId === parentId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Build category filter levels
  const filterLevels = [];
  const currentLevel = getChildCategories();
  filterLevels.push(currentLevel);

  for (let i = 0; i < selectedCategoryPath.length; i++) {
    const children = getChildCategories(selectedCategoryPath[i]);
    if (children.length > 0) {
      filterLevels.push(children);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-end gap-6">
        <Link
          href="/admin/blogs/add"
          className="flex items-center gap-2 px-8 py-4 bg-primary-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl shadow-primary-900/20 active:scale-95"
        >
          <Plus size={16} /> Thêm bài viết mới
        </Link>
      </div>

      {/* Primary Filters Row */}
      <div className="admin-card border border-gray-200/80 rounded-3xl p-4 md:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-2 relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-900 transition-colors pointer-events-none">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề, slug, hoặc nội dung..."
              className="admin-input pl-14 h-14"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-900 transition-colors pointer-events-none z-10">
              <Filter size={18} />
            </div>
            <CustomSelect
              options={[
                { label: "Tất cả bài viết", value: "all" },
                { label: "Đã xuất bản", value: "published" },
                { label: "Bản nháp", value: "draft" },
              ]}
              value={statusFilter}
              onChange={(value) =>
                setStatusFilter(value as "all" | "published" | "draft")
              }
              placeholder="Lọc theo trạng thái..."
              className="pl-14"
            />
          </div>

          {/* Categories Breadcrumb/Indicator */}
          <div className="flex items-center gap-2 px-5 h-14 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden truncate">
            <Folder size={14} className="text-gray-400 shrink-0" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">
              {selectedCategoryPath.length > 0
                ? getCategory(selectedCategoryPath[selectedCategoryPath.length - 1])?.name
                : "Tất cả danh mục"}
            </span>
            {selectedCategoryPath.length > 0 && (
              <button
                onClick={() => setSelectedCategoryPath([])}
                className="ml-auto text-primary-900 hover:text-red-600 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="admin-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-200">
                <Folder size={18} />
              </div>
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Bộ lọc danh mục</h3>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
              {filterLevels.map((level, levelIndex) => (
                <div key={levelIndex} className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {levelIndex === 0 ? "Cấp 1" : `Cấp ${levelIndex + 1}`}
                  </p>
                  <div className="flex flex-col gap-1">
                    {level.map((category) => {
                      const isSelected = selectedCategoryPath.includes(category._id);
                      return (
                        <button
                          key={category._id}
                          onClick={() => handleSelectCategory(category._id, levelIndex)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSelected
                            ? "bg-primary-900 text-white shadow-lg"
                            : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
                            }`}
                        >
                          <span className="truncate">{category.name}</span>
                          {isSelected && <ChevronRight size={12} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main List Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="admin-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-8 py-5 text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Biên tập viên / Tiêu đề</p>
                    </th>
                    <th className="px-8 py-5 text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</p>
                    </th>
                    <th className="px-8 py-5 text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian</p>
                    </th>
                    <th className="px-8 py-5 text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thao tác</p>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBlogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-6 bg-gray-50 rounded-full border border-gray-200">
                            <Newspaper size={40} className="text-gray-200" />
                          </div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Không tìm thấy bài viết nào phù hợp</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBlogs.map((blog) => {
                      const blogId = blog._id || blog.id;
                      const category = getCategory(blog.informationId);
                      const isPublished = blog.status === "published";
                      return (
                        <tr key={blogId} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 border border-gray-200 group-hover:border-primary-900/20 group-hover:scale-105 transition-all">
                                <span className="text-xs font-black text-gray-900">{blog.author?.charAt(0).toUpperCase() || 'P'}</span>
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={blogId ? `/admin/blogs/edit/${blogId}` : "#"}
                                  className="text-sm font-black text-gray-900 uppercase tracking-tight hover:text-primary-900 line-clamp-1 transition-colors"
                                >
                                  {blog.title}
                                </Link>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{category?.name || "Uncategorized"}</span>
                                  <div className="w-1 h-1 rounded-full bg-gray-200" />
                                  <span className="text-[10px] font-medium text-gray-400 lowercase italic">/{blog.slug}</span>
                                  {blog.slug && (
                                    <>
                                      <div className="w-1 h-1 rounded-full bg-gray-200" />
                                      <Link
                                        href={`/blog/${blog.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary-900 hover:text-primary-700"
                                        title="Mở bài viết public"
                                      >
                                        Public
                                        <ExternalLink size={10} />
                                      </Link>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex">
                              <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${isPublished
                                ? "bg-green-50 text-green-600 border-green-100"
                                : "bg-gray-50 text-gray-400 border-gray-200"
                                }`}>
                                {isPublished ? "Đã duyệt" : "Bản nháp"}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2 text-gray-400">
                              <Calendar size={14} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">
                                {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("vi-VN") : "--/--"}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                              <Link
                                href={blogId ? `/admin/blogs/edit/${blogId}` : "#"}
                                className="p-3 bg-white text-gray-900 border border-gray-200 rounded-xl hover:bg-primary-900 hover:text-white hover:border-primary-900 transition-all shadow-sm"
                                title="Chỉnh sửa"
                              >
                                <Edit3 size={16} />
                              </Link>
                              <button
                                onClick={() => blogId && handleDelete(blogId)}
                                className={`p-3 rounded-xl transition-all shadow-sm border ${deleteConfirm === blogId
                                  ? "bg-red-600 text-white border-red-600"
                                  : "bg-white text-gray-300 border-gray-200 hover:text-red-600 hover:border-red-200"
                                  }`}
                                title="Xóa bài viết"
                              >
                                {deleteConfirm === blogId ? <CheckCircle2 size={16} /> : <Trash2 size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50/30">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  limit={pagination.limit}
                  onPageChange={setCurrentPage}
                  labels={{
                    previous: "PHÍA TRƯỚC",
                    next: "TIẾP THEO",
                    showing: "HIỂN THỊ",
                    of: "/",
                    items: "BẢN GHI",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
