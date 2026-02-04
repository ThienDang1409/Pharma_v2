"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateAndCall } from "@/lib/utils/apiHelper_backup";
import { ChangePasswordSchemaI18n } from "@/lib/validators/i18n.validator";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

const translations = {
  en: enTranslations,
  vi: viTranslations,
};

export default function ChangePasswordPage() {
  const { user, isAuthenticated, changePassword } = useAuth();
  const { language } = useLanguage();
  const { addToast } = useToast();
  const router = useRouter();
  const t = translations[language];

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const schema = ChangePasswordSchemaI18n(language as 'vi' | 'en');

    const result = await validateAndCall(
      schema,
      {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      },
      (validatedData) =>
        changePassword(validatedData.currentPassword, validatedData.newPassword),
      {
        toast: addToast,
        successMessage:
          language === "vi" ? "Đổi mật khẩu thành công!" : "Password changed successfully!",
        showSuccessToast: true,
        showErrorToast: true,
        onSuccess: () => {
          // Reset form
          setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setShowPassword(false);
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile" className="text-sm text-primary-600 hover:text-primary-500 mb-4 inline-block">
            {language === "vi" ? "← Quay lại trang cá nhân" : "← Back to Profile"}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === "vi" ? "Đổi mật khẩu" : "Change Password"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {language === "vi" 
              ? "Cập nhật mật khẩu của bạn để giữ tài khoản an toàn"
              : "Update your password to keep your account secure"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="px-6 py-8">
            <div className="space-y-6">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "vi" ? "Mật khẩu hiện tại" : "Current Password"}
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder={language === "vi" ? "Nhập mật khẩu hiện tại" : "Enter current password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "vi" ? "Mật khẩu mới" : "New Password"}
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder={language === "vi" ? "Nhập mật khẩu mới (tối thiểu 6 ký tự)" : "Enter new password (min 6 characters)"}
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "vi" ? "Xác nhận mật khẩu mới" : "Confirm New Password"}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder={language === "vi" ? "Nhập lại mật khẩu mới" : "Re-enter new password"}
                />
              </div>
            </div>

            {/* Password Requirements */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                {language === "vi" ? "Yêu cầu mật khẩu:" : "Password requirements:"}
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {language === "vi" ? "Ít nhất 6 ký tự" : "At least 6 characters"}
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {language === "vi" ? "Khác với mật khẩu hiện tại" : "Different from current password"}
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading 
                  ? (language === "vi" ? "Đang cập nhật..." : "Updating...")
                  : (language === "vi" ? "Đổi mật khẩu" : "Change Password")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
