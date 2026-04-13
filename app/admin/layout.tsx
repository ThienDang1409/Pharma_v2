"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";

interface AdminLayoutProps {
  children: React.ReactNode;
}

import {
  LayoutDashboard,
  FolderTree,
  Newspaper,
  Image as ImageIcon,
  LogOut,
  User,
  Settings,
  Bell,
  History,
  HelpCircle,
  Search,
  ChevronLeft,
  Home,
  PlusCircle
} from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard size={20} />,
  },
  {
    name: "Danh mục",
    href: "/admin/information",
    icon: <FolderTree size={20} />,
  },
  {
    name: "Bài viết",
    href: "/admin/blogs",
    icon: <Newspaper size={20} />,
  },
  {
    name: "Hình ảnh",
    href: "/admin/images",
    icon: <ImageIcon size={20} />,
  },
  {
    name: "Hỗ trợ",
    href: "/admin/help-center",
    icon: <HelpCircle size={20} />,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (!pathname) return "Pharma Admin";
    if (pathname === "/admin") return "Dashboard";
    if (pathname.startsWith("/admin/information")) return "Quản lý Danh mục";
    if (pathname.startsWith("/admin/blogs/add")) return "Viết bài mới";
    if (pathname.startsWith("/admin/blogs")) return "Quản lý Bài viết";
    if (pathname.startsWith("/admin/images")) return "Thư viện Hình ảnh";
    if (pathname.startsWith("/admin/help-center")) return "Trung tâm Hỗ trợ";
    return "Pharma Admin";
  };

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
      <div className="flex h-screen bg-gray-50 font-sans antialiased text-gray-900">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "w-72" : "w-24"
            } bg-white border-r border-gray-200 transition-all duration-500 ease-in-out fixed h-full z-40 shadow-soft`}
        >
          {/* Logo / Brand */}
          <div className="p-8 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-900/20">
                <span className="text-xl font-bold italic">P</span>
              </div>
              {sidebarOpen && (
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter text-gray-900 leading-none">Pharma Test</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Medical Editorial V2.0</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-5 space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all duration-300 ${active
                    ? "bg-primary-50 text-primary-900 shadow-sm border-primary-200"
                    : "text-gray-400 border-transparent hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200"
                    }`}
                >
                  <span className={`transition-colors duration-300 ${active ? "text-primary-700" : "group-hover:text-gray-900"}`}>
                    {item.icon}
                  </span>
                  {sidebarOpen && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
                  {active && sidebarOpen && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-700 shadow-sm" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar CTA */}
          {sidebarOpen && (
            <div className="absolute bottom-32 left-0 right-0 px-8">
              <Link
                href="/admin/blogs/add"
                className="w-full flex items-center justify-center gap-2 py-4 bg-primary-900 text-white rounded-2xl font-bold shadow-xl shadow-primary-900/30 hover:bg-primary-800 transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                <PlusCircle size={20} />
                <span>Viết bài mới</span>
              </Link>
            </div>
          )}

          {/* Sidebar Footer / User Profile Summary */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className={`flex items-center ${sidebarOpen ? "gap-3" : "justify-center"}`}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-2xl object-cover shadow-sm border-2 border-white" />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-900 font-black shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {sidebarOpen && (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 leading-tight truncate max-w-[120px]">{user?.name}</span>
                  <span className="text-[10px] font-semibold text-gray-400 truncate max-w-[120px]">System Admin</span>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="ml-auto p-2 text-gray-400 hover:text-gray-900 transition-colors"
                title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                <ChevronLeft size={18} className={`transition-transform duration-500 ${sidebarOpen ? "" : "rotate-180"}`} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col ${sidebarOpen ? "ml-72" : "ml-24"} transition-all duration-500 ease-in-out`}>
          {/* Top Header */}
          <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-200 px-10 py-5">
            <div className="flex items-center justify-between gap-10">
              {/* Search Bar */}
              <div className="flex flex-col">
                <h2 className="admin-header-title">{getPageTitle()}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
                  <span className="admin-header-subtitle !mt-0 !tracking-widest">Hệ thống đang hoạt động</span>
                </div>
              </div>

              {/* Utility Actions */}
              <div className="flex items-center gap-6">
                {/* <div className="flex items-center gap-2">
                  <button className="p-3 bg-white text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all active:scale-95 border border-transparent hover:border-gray-200 relative">
                    <Bell size={20} />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  </button>
                  <button className="p-3 bg-white text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all active:scale-95 border border-transparent hover:border-gray-200">
                    <History size={20} />
                  </button>
                </div> */}

                <div className="h-8 w-px bg-gray-200 mx-2" />

                <Link href="/admin/help-center" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                  Help Center
                </Link>
                <span className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">{user?.name}</span>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 group"
                  >
                    <div className="p-0.5 rounded-2xl border-2 border-transparent group-hover:border-primary-900/20 transition-all">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-[14px] object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-[14px] bg-primary-50 flex items-center justify-center text-primary-900 font-bold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-premium border border-gray-200 py-3 px-3 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="px-4 py-4 mb-2 border-b border-gray-200">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Signed in as</span>
                        <span className="text-sm font-bold text-gray-900 block truncate">{user?.name}</span>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-2xl transition-all"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={18} />
                        Profile
                      </Link>
                      <Link
                        href="/profile/change-password"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-2xl transition-all"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={18} />
                        Settings
                      </Link>
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-10 flex-1 overflow-auto custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
