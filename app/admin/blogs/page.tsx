"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { blogApi, informationApi, Blog, Information } from "@/lib/api";
import { BLOG_STATUS } from "@/lib/constants/api";
import Pagination from "@/app/components/Pagination";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [allCategories, setAllCategories] = useState<Information[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, statusFilter, selectedCategoryPath]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params: any = {
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

      const [blogsResponse, categoriesResponse] = await Promise.all([
        blogApi.getAll(params),
        informationApi.getAll(),
      ]);
      
      // Extract blogs from response
      const blogs = blogsResponse.data?.items || [];
      setBlogs(blogs);
      applySearch(blogs);
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
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [statusFilter, selectedCategoryPath]);

  useEffect(() => {
    // Apply search filter when search query changes
    applySearch(blogs);
  }, [searchQuery]);

  const applySearch = (blogsData: Blog[]) => {
    if (!searchQuery.trim()) {
      setFilteredBlogs(blogsData);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = blogsData.filter(blog => 
      blog.title?.toLowerCase().includes(query) ||
      blog.title_en?.toLowerCase().includes(query) ||
      blog.slug?.toLowerCase().includes(query)
    );
    setFilteredBlogs(filtered);
  };

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

    try {
      await blogApi.delete(id);
      await fetchData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Lỗi xóa bài viết");
    }
  };

  const getCategory = (infoId?: string | Information) => {
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
  let currentLevel = getChildCategories();
  filterLevels.push(currentLevel);

  for (let i = 0; i < selectedCategoryPath.length; i++) {
    const children = getChildCategories(selectedCategoryPath[i]);
    if (children.length > 0) {
      filterLevels.push(children);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý bài viết</h1>
          <p className="text-gray-600 mt-1">
            Quản lý tất cả blog/news của website
            {searchQuery && (
              <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-semibold">
                🔍 {filteredBlogs.length} kết quả
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/blogs/add"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors shadow-md hover:shadow-lg"
        >
          ➕ Thêm bài viết mới
        </Link>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder=" Tìm kiếm theo tiêu đề (VI/EN) hoặc slug..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 placeholder-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="shrink-0 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold text-sm"
            >
              ✕ Xóa
            </button>
          )}
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">📊 Lọc theo trạng thái:</span>
          <div className="flex gap-2">
            {(["all", "published", "draft"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border-2 ${
                  statusFilter === status
                    ? "bg-primary-600 text-white border-primary-700 shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-secondary-100 border-gray-300 hover:border-secondary-300"
                }`}
              >
                {status === "all" ? "Tất cả" : status === "published" ? "✓ Xuất bản" : "✎ Bản nháp"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter - Hierarchical */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🔍 Lọc theo danh mục</h3>
        <div className="space-y-4">
          {filterLevels.map((level, levelIndex) => (
            <div key={levelIndex} className="space-y-2">
              <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">
                {levelIndex === 0 ? "📁 Cấp 1 - Danh mục gốc" : `📁 Cấp ${levelIndex + 1}`}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {level.map((category) => {
                  const isSelected = selectedCategoryPath.includes(category._id);
                  const hasChildren = allCategories.some(
                    (cat) => cat.parentId === category._id
                  );
                  const canHaveChildren = levelIndex === selectedCategoryPath.length;

                  return (
                    <button
                      key={category._id}
                      onClick={() =>
                        canHaveChildren && handleSelectCategory(category._id, levelIndex)
                      }
                      disabled={!canHaveChildren}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors border-2 ${
                        isSelected
                          ? "bg-primary-600 text-white border-primary-700 shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-secondary-50 border-gray-200 hover:border-secondary-300"
                      } ${!canHaveChildren ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="font-semibold">{category.name}</div>
                      {hasChildren && (
                        <div className="text-xs mt-1 opacity-75">
                          {allCategories.filter((c) => c.parentId === category._id).length} con
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {selectedCategoryPath.length > 0 && (
          <button
            onClick={() => setSelectedCategoryPath([])}
            className="mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold text-sm transition-colors"
          >
            ✕ Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Blogs List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b-2 border-secondary-200 flex items-center justify-between bg-linear-to-r from-primary-50 to-secondary-50">
          <h2 className="text-lg font-bold text-gray-800">
            📰 Danh sách bài viết ({pagination.total || filteredBlogs.length})
          </h2>
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-600">Không có bài viết nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Tiêu đề
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Danh mục
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBlogs.map((blog) => {
                    const category = getCategory(blog.informationId);
                    return (
                      <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800 truncate">
                            {blog.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{blog.slug}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {category?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              blog.status === "published"
                                ? "bg-third-100 text-third-800"
                                : "bg-secondary-100 text-secondary-800"
                            }`}
                          >
                            {blog.status === "published" ? "✓ Xuất bản" : "✎ Bản nháp"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {blog.createdAt
                            ? new Date(blog.createdAt).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/blogs/edit/${blog._id}`}
                              className="px-3 py-1 bg-primary-100 text-primary-700 rounded text-sm hover:bg-primary-200 font-semibold border border-primary-200 transition-colors"
                            >
                              ✏️ Sửa
                            </Link>
                            <button
                              onClick={() => blog._id && handleDelete(blog._id)}
                              className={`px-3 py-1 rounded text-sm font-semibold transition-colors border ${
                                deleteConfirm === blog._id
                                  ? "bg-red-700 text-white border-red-800"
                                  : "bg-red-100 text-red-700 hover:bg-red-200 border-red-300"
                              }`}
                            >
                              {deleteConfirm === blog._id ? "⚠️ Xác nhận?" : "🗑️ Xóa"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={setCurrentPage}
                labels={{
                  previous: "← Trước",
                  next: "Sau →",
                  showing: "Hiển thị",
                  of: "của",
                  items: "mục",
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
