import {ROUTES} from '@/app/router/routePaths';
import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {BookOpen, Menu, LogOut} from 'lucide-react';

const navigationItems = [
  {
    title: "Trang chủ",
    path: ROUTES.USER_DASHBOARD,
  },
  {
    title: "Danh sách sách",
    path: ROUTES.USER_BOOKS,
  },
  {
    title: "Phiếu mượn",
    path: ROUTES.USER_BORROWS,
  },
  {
    title: "Hồ sơ",
    path: ROUTES.USER_PROFILE,
  },
];

function UserNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to={ROUTES.USER_DASHBOARD} className="inline-flex items-center gap-2 text-lg font-bold text-navy-900">
          <span className="rounded-xl bg-navy-900 p-2 text-white"><BookOpen size={19} aria-hidden="true"/></span> Thư viện
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Điều hướng độc giả" className="hidden items-center gap-1 md:flex">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-sage-100 text-navy-900"
                    : "text-slate-600 hover:bg-workspace hover:text-navy-900"
                }`
              }
            >
              {item.title}
            </NavLink>
          ))}
        </nav>

        {/* User actions */}
        <div className="hidden items-center gap-4 md:flex">
          <span className="max-w-40 truncate text-sm font-medium text-slate-700">
            Xin chào, {user?.fullName || user?.username || "Bạn"}
          </span>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink hover:bg-workspace"
          >
            <LogOut size={16} aria-hidden="true"/> Đăng xuất
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Mở menu"
          aria-expanded={menuOpen}
        >
          <Menu size={22} aria-hidden="true"/>
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="border-t border-line bg-white px-4 py-4 md:hidden">
          <nav aria-label="Điều hướng độc giả trên điện thoại" className="flex flex-col gap-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-sage-100 text-navy-900"
                      : "text-slate-600 hover:bg-workspace"
                  }`
                }
              >
                {item.title}
              </NavLink>
            ))}

            <div className="border-t border-slate-200 pt-3">
              <p className="mb-3 text-sm text-slate-600">
                {user?.fullName || user?.username || user?.email}
              </p>

              <button
                onClick={logout}
                className="w-full rounded-lg bg-red-50 px-3 py-2 text-left text-sm font-medium text-red-600"
              >
                Đăng xuất
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default UserNavbar;
