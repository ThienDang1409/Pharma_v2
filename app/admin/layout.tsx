"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/app/components/ProtectedRoute";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: "📊",
  },
  {
    name: "Quản lý danh mục",
    href: "/admin/information",
    icon: "📁",
  },
  {
    name: "Quản lý bài viết / tin tức",
    href: "/admin/blogs",
    icon: "📰",
  },
  {
    name: "Quản lý hình ảnh",
    href: "/admin/images",
    icon: "🖼️",
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const isActive = (href: string) => {
    // Special case for dashboard: exact match only
    if (href === "/admin") {
      return pathname === "/admin";
    }
    // Other pages: exact match or starts with the href
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-linear-to-b from-primary-900 to-primary-950 text-white transition-all duration-300 ease-in-out fixed h-full z-40 shadow-2xl`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-primary-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-between text-lg font-bold"
          >
            {sidebarOpen ? (
              <>
                <span className="text-secondary-400 font-bold">Pharma Test</span>
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </>
            ) : (
              <span className="text-secondary-400 mx-auto text-xl">💊</span>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? "bg-secondary-500 text-white shadow-lg font-semibold"
                  : "text-gray-300 hover:bg-primary-800"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-700">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-primary-800 hover:text-white transition-all"
          >
            <span className="text-xl">🏠</span>
            {sidebarOpen && <span>View Site</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        {/* Top Header */}
        <header className="bg-white shadow-md sticky top-0 z-30 border-b-2 border-secondary-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-linear-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <div className="flex items-center gap-4">
              {/* <button className="px-4 py-2 text-gray-600 hover:text-primary-600 font-medium transition-colors">
                🔔
              </button> */}
              
              {/* User Menu */}
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-gray-700">{user?.name}</span>
                  <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    <Link 
                      href="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      👤 Profile
                    </Link>
                    <Link 
                      href="/profile/change-password"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      🔒 Change Password
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 overflow-auto h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
