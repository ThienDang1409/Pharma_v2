"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateAndCall } from "@/lib/utils/apiHelper_backup";
import { UpdateProfileSchemaI18n } from "@/lib/validators";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

const translations = {
  en: enTranslations,
  vi: viTranslations,
};

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { language } = useLanguage();
  const { addToast } = useToast();
  const router = useRouter();
  const t = translations[language];

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    avatar: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      });
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await validateAndCall(
      UpdateProfileSchemaI18n(language as 'vi' | 'en'),
      {
        name: formData.name || undefined,
        phone: formData.phone || undefined,
        address: formData.avatar || undefined, // Use avatar as address proxy
      },
      (validatedData) => updateProfile(formData),
      {
        toast: addToast,
        successMessage: language === "vi" 
          ? "Cập nhật thông tin thành công!" 
          : "Profile updated successfully!",
        showSuccessToast: true,
        showErrorToast: true,
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );

    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {language === "vi" ? "Thông tin cá nhân" : "Profile"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {language === "vi" 
              ? "Quản lý thông tin cá nhân và cài đặt tài khoản"
              : "Manage your personal information and account settings"}
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white shadow rounded-lg">
          {/* User Info Header */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className={`inline-flex mt-2 items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === "admin" 
                    ? "bg-purple-100 text-purple-800" 
                    : "bg-green-100 text-green-800"
                }`}>
                  {user.role === "admin" 
                    ? (language === "vi" ? "Quản trị viên" : "Administrator")
                    : (language === "vi" ? "Người dùng" : "User")}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                {language === "vi" ? "Email không thể thay đổi" : "Email cannot be changed"}
              </p>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {language === "vi" ? "Họ và tên" : "Full Name"}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={`block w-full px-3 py-2 border border-gray-300 rounded-lg sm:text-sm ${
                  isEditing ? "focus:outline-none focus:ring-primary-500 focus:border-primary-500" : "bg-gray-50 text-gray-500 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                {language === "vi" ? "Số điện thoại" : "Phone Number"}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={`block w-full px-3 py-2 border border-gray-300 rounded-lg sm:text-sm ${
                  isEditing ? "focus:outline-none focus:ring-primary-500 focus:border-primary-500" : "bg-gray-50 text-gray-500 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                {language === "vi" ? "URL ảnh đại diện" : "Avatar URL"}
              </label>
              <input
                id="avatar"
                name="avatar"
                type="url"
                value={formData.avatar}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="https://example.com/avatar.jpg"
                className={`block w-full px-3 py-2 border border-gray-300 rounded-lg sm:text-sm ${
                  isEditing ? "focus:outline-none focus:ring-primary-500 focus:border-primary-500" : "bg-gray-50 text-gray-500 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Last Login */}
            {user.lastLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "vi" ? "Đăng nhập lần cuối" : "Last Login"}
                </label>
                <p className="text-sm text-gray-500">
                  {new Date(user.lastLogin).toLocaleString(language === "vi" ? "vi-VN" : "en-US")}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              {!isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                    }}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    {language === "vi" ? "Chỉnh sửa" : "Edit Profile"}
                  </button>
                  <Link
                    href="/profile/change-password"
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center"
                  >
                    {language === "vi" ? "Đổi mật khẩu" : "Change Password"}
                  </Link>
                </>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {isLoading 
                      ? (language === "vi" ? "Đang lưu..." : "Saving...")
                      : (language === "vi" ? "Lưu thay đổi" : "Save Changes")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user.name || "",
                        phone: user.phone || "",
                        avatar: user.avatar || "",
                      });
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    {language === "vi" ? "Hủy" : "Cancel"}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/"
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium text-gray-900">
              {language === "vi" ? "← Quay về trang chủ" : "← Back to Home"}
            </h3>
          </Link>
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-gray-900">
                {language === "vi" ? "Trang quản trị →" : "Admin Dashboard →"}
              </h3>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
