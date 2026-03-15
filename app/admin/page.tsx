"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { informationApi, blogApi, imageApi, Information, ImageQueryParams } from "@/lib/api";
import { BLOG_STATUS } from "@/lib/constants/api";
import { getApiErrorFeedback } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalImages: 0,
    unusedImages: 0,
  });
  const [categories, setCategories] = useState<Information[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const categoriesResponse = await informationApi.getAll();
      const categories = categoriesResponse.data?.items || [];
      setCategories(categories);

      // Fetch blogs
      const blogsResponse = await blogApi.getAll();
      const blogs = blogsResponse.data?.items || [];
      
      // Fetch images
      const imagesResponse = await imageApi.getAll({ limit: 1 });
      const imagePagination = imagesResponse.data;
      
      // Fetch unused images count
      const unusedImagesResponse = await imageApi.getAll({ unusedOnly: true, limit: 1 });
      const unusedImagePagination = unusedImagesResponse.data;
      
      const rootCategories = (categories || []).filter(
        (cat) => !cat.parentId || cat.parentId === null || cat.parentId === "null"
      );

      const publishedCount = (blogs || []).filter(
        (b) => b.status === BLOG_STATUS.PUBLISHED
      ).length;
      const draftCount = (blogs || []).filter(
        (b) => b.status === BLOG_STATUS.DRAFT
      ).length;

      setStats({
        totalCategories: rootCategories.length,
        totalBlogs: blogs?.length || 0,
        publishedBlogs: publishedCount,
        draftBlogs: draftCount,
        totalImages: imagePagination?.total || 0,
        unusedImages: unusedImagePagination?.total || 0,
      });
    } catch (error) {
      const feedback = getApiErrorFeedback(error);
      console.error("Error fetching stats:", feedback.message, error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Tổng quan quản lý nội dung</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Categories */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Danh mục</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.totalCategories}
              </p>
            </div>
            <div className="text-5xl">📁</div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              href="/admin/information"
              className="text-primary-600 hover:text-primary-800 text-sm font-semibold"
            >
              Quản lý →
            </Link>
          </div>
        </div>

        {/* Total Blogs */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Tổng bài viết</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.totalBlogs}
              </p>
            </div>
            <div className="text-5xl">📰</div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              href="/admin/blogs"
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
            >
              Quản lý →
            </Link>
          </div>
        </div>

        {/* Published Blogs */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Đã xuất bản</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.publishedBlogs}
              </p>
            </div>
            <div className="text-5xl">✅</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round((stats.publishedBlogs / (stats.totalBlogs || 1)) * 100)}% of total
          </p>
        </div>

        {/* Draft Blogs */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Bản nháp</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.draftBlogs}
              </p>
            </div>
            <div className="text-5xl">📝</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round((stats.draftBlogs / (stats.totalBlogs || 1)) * 100)}% of total
          </p>
        </div>
      </div>

      {/* Images Stats - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Images */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Tổng hình ảnh</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.totalImages}
              </p>
            </div>
            <div className="text-5xl">🖼️</div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              href="/admin/images"
              className="text-purple-600 hover:text-purple-800 text-sm font-semibold"
            >
              Quản lý →
            </Link>
          </div>
        </div>

        {/* Unused Images */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Hình chưa sử dụng</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {stats.unusedImages}
              </p>
            </div>
            <div className="text-5xl">🗑️</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalImages > 0 
              ? Math.round((stats.unusedImages / stats.totalImages) * 100) 
              : 0}% chưa dùng
          </p>
        </div>

        {/* Storage Info */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Images đang sử dụng</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {stats.totalImages - stats.unusedImages}
              </p>
            </div>
            <div className="text-5xl">✨</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalImages > 0 
              ? Math.round(((stats.totalImages - stats.unusedImages) / stats.totalImages) * 100) 
              : 0}% đang dùng
          </p>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Cấu trúc danh mục</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {categories
            .filter(
              (cat) =>
                !cat.parentId ||
                cat.parentId === null ||
                cat.parentId === "null"
            )
            .map((category) => {
              const childCount = categories.filter(
                (c) => c.parentId === category._id
              ).length;
              return (
                <div
                  key={category._id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {category.name}
                    </h3>
                    {childCount > 0 && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded">
                        {childCount} con
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {category.description || "Không có mô tả"}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/information?parent=${category._id}`}
                      className="text-xs px-3 py-1 bg-secondary-100 text-secondary-800 rounded hover:bg-secondary-200 transition-colors font-medium"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href="/admin/information"
            className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
          >
            Quản lý tất cả danh mục
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Hành động nhanh
          </h2>
          <div className="space-y-3">
            <Link
              href="/admin/blogs/add"
              className="block w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-center transition-colors"
            >
              ➕ Thêm bài viết mới
            </Link>
            <Link
              href="/admin/information"
              className="block w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-center transition-colors"
            >
              ➕ Thêm danh mục mới
            </Link>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Tình trạng hệ thống
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">API Status</span>
              </div>
              <span className="text-xs font-semibold text-green-700">
                Hoạt động
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Database</span>
              </div>
              <span className="text-xs font-semibold text-green-700">
                Kết nối
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
