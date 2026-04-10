"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { informationApi, blogApi, imageApi, Information } from "@/lib/api";
import { BLOG_STATUS } from "@/lib/constants/api";
import { getApiErrorFeedback } from "@/lib/utils";
import { 
  FolderTree, 
  Newspaper, 
  ImageIcon, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  ChevronRight,
  PlusCircle,
  Activity,
  Database,
  ArrowUpRight
} from "lucide-react";

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
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="admin-card border border-gray-200/80 rounded-3xl p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Categories */}
        <div className="admin-card p-8 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FolderTree size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200">
                <FolderTree size={20} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Danh mục</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-gray-900 tracking-tighter">
                {stats.totalCategories}
              </p>
              <span className="text-xs font-bold text-gray-400">gốc</span>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <Link
                href="/admin/information"
                className="text-[10px] font-black text-primary-900 uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-1"
              >
                Chi tiết <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Total Blogs */}
        <div className="admin-card p-8 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Newspaper size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200">
                <Newspaper size={20} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Tổng bài viết</p>
            </div>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">
              {stats.totalBlogs}
            </p>
            <div className="mt-8">
              <Link
                href="/admin/blogs"
                className="text-[10px] font-black text-primary-900 uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-1"
              >
                Chi tiết <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Published Blogs */}
        <div className="admin-card p-8 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle2 size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-green-50 text-green-600 rounded-xl border border-green-100">
                <CheckCircle2 size={20} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none text-green-600">Đã xuất bản</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-gray-900 tracking-tighter">
                {stats.publishedBlogs}
              </p>
              <span className="text-xs font-bold text-green-600">
                {Math.round((stats.publishedBlogs / (stats.totalBlogs || 1)) * 100)}%
              </span>
            </div>
            <div className="mt-8 w-full bg-gray-100 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${(stats.publishedBlogs / (stats.totalBlogs || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Draft Blogs */}
        <div className="admin-card p-8 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Edit3 size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-xl border border-yellow-100">
                <Edit3 size={20} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none text-yellow-600">Bản nháp</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-gray-900 tracking-tighter">
                {stats.draftBlogs}
              </p>
              <span className="text-xs font-bold text-yellow-600">
                {Math.round((stats.draftBlogs / (stats.totalBlogs || 1)) * 100)}%
              </span>
            </div>
            <div className="mt-8 w-full bg-gray-100 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-yellow-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${(stats.draftBlogs / (stats.totalBlogs || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Images Stats - Second Row */}
      <div className="admin-card border border-gray-200/80 rounded-3xl p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Images */}
        <div className="admin-card p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <ImageIcon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Thư viện</p>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Hình ảnh</h3>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-gray-900 tracking-tighter">{stats.totalImages}</p>
            <Link
              href="/admin/images"
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-900 transition-colors"
            >
              Quản lý
            </Link>
          </div>
        </div>

        {/* Unused Images */}
        <div className="admin-card p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100">
              <Trash2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Dung lượng</p>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Chưa dùng</h3>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-orange-600 tracking-tighter">{stats.unusedImages}</p>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tỉ lệ dọn dẹp</p>
              <p className="text-xs font-bold text-gray-900">
                {stats.totalImages > 0 ? Math.round((stats.unusedImages / stats.totalImages) * 100) : 0}% tài nguyên
              </p>
            </div>
          </div>
        </div>

        {/* Storage Info */}
        <div className="admin-card p-8 bg-gray-900 text-white border-none shadow-premium">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/10 text-white rounded-2xl border border-white/10 backdrop-blur-sm">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Hiệu suất</p>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter">Đang hoạt động</h3>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-white tracking-tighter">{stats.totalImages - stats.unusedImages}</p>
            <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="bg-primary-500 h-full rounded-full" 
                style={{ width: `${stats.totalImages > 0 ? Math.round(((stats.totalImages - stats.unusedImages) / stats.totalImages) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="admin-card p-10 border border-gray-200/80">
        <div className="flex items-center justify-between border-b border-gray-200 pb-8 mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Cấu trúc danh mục</h2>
            <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-[0.2em]">PHÂN LOẠI NỘI DUNG GỐC</p>
          </div>
          <Link
            href="/admin/information"
            className="px-6 py-3 bg-primary-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-900/20 hover:bg-gray-900 transition-all"
          >
            Quản lý tất cả
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
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
                  className="p-6 bg-white rounded-3xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-gray-900 uppercase tracking-tight group-hover:text-primary-900 transition-colors">
                      {category.name}
                    </h3>
                    {childCount > 0 ? (
                      <span className="px-3 py-1 bg-primary-50 text-primary-900 text-[10px] font-black rounded-full border border-primary-100 uppercase">
                        {childCount} con
                      </span>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-6 line-clamp-2 leading-relaxed">
                    {category.description || "Không có mô tả chi tiết cho danh mục này."}
                  </p>
                  <Link
                    href={`/admin/information?parent=${category._id}`}
                    className="inline-flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors"
                  >
                    CHI TIẾT <ChevronRight size={14} />
                  </Link>
                </div>
              );
            })}
        </div>
      </div>

      {/* Quick Actions & System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 admin-card p-10">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-8">Hành động nhanh</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/admin/blogs/add"
              className="flex items-center justify-between p-6 bg-gray-50 hover:bg-primary-900 hover:text-white rounded-3xl transition-all group border border-gray-200"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white text-primary-900 rounded-2xl shadow-sm group-hover:bg-primary-800 group-hover:text-white transition-colors">
                  <PlusCircle size={24} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">Thêm bài viết</p>
                  <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-0.5">Soạn thảo mới</p>
                </div>
              </div>
              <ChevronRight size={20} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
            <Link
              href="/admin/information"
              className="flex items-center justify-between p-6 bg-gray-50 hover:bg-primary-900 hover:text-white rounded-3xl transition-all group border border-gray-200"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white text-primary-900 rounded-2xl shadow-sm group-hover:bg-primary-800 group-hover:text-white transition-colors">
                  <FolderTree size={24} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">Thêm danh mục</p>
                  <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-0.5">Phân cấp sản phẩm</p>
                </div>
              </div>
              <ChevronRight size={20} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* System Info */}
        <div className="admin-card p-10">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-8">Hệ thống</h2>
          <div className="space-y-4">
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">API Status</span>
                </div>
                <span className="text-[10px] font-black text-green-600 uppercase">Hoạt động</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Database</span>
                </div>
                <span className="text-[10px] font-black text-green-600 uppercase">Kết nối</span>
              </div>
            </div>
            
            <div className="p-6 bg-primary-900 text-white rounded-3xl shadow-lg shadow-primary-900/20">
              <div className="flex items-center gap-3 mb-2">
                <Database size={18} className="opacity-50" />
                <span className="text-[10px] font-black uppercase tracking-widest">Server Load</span>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-black tracking-tighter">Bình thường</p>
                <p className="text-[10px] font-black opacity-60 uppercase">Phản hồi 0.2s</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
