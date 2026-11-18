import {STAFF_ROLES} from '@/features/auth/permissions';
import {lazy,Suspense} from 'react';

import { Routes, Route, Navigate } from 'react-router-dom'

import { ROUTES, ROLES } from './routePaths'

import ProtectedRoute from './ProtectedRoute'
import RoleBasedRoute from './RoleBasedRoute'

// Layouts
import AdminLayout from '@/app/layouts/AdminLayout'
import UserLayout from '@/app/layouts/UserLayout'

// Auth pages
const LoginPage=lazy(()=>import('@/features/auth/pages/LoginPage'));
const RegisterPage=lazy(()=>import('@/features/auth/pages/RegisterPage'));
const HomePage=lazy(()=>import('@/features/home/pages/HomePage'));

// Admin pages
const AdminDashboardPage=lazy(()=>import('@/features/dashboard/pages/AdminDashboardPage'));
const AuthorManagementPage=lazy(()=>import('@/features/authors/pages/AuthorManagementPage'));
const BookManagementPage=lazy(()=>import('@/features/books/pages/BookManagementPage'));
const CategoryManagementPage=lazy(()=>import('@/features/categories/pages/CategoryManagementPage'));
const MemberManagementPage=lazy(()=>import('@/features/members/pages/MemberManagementPage'));
const BorrowManagementPage=lazy(()=>import('@/features/borrows/pages/BorrowManagementPage'));

// User pages
const UserDashboardPage=lazy(()=>import('@/features/dashboard/pages/UserDashboardPage'));
const BookListPage=lazy(()=>import('@/features/books/pages/BookListPage'));
const BookDetailPage=lazy(()=>import('@/features/books/pages/BookDetailPage'));
const MyBorrowsPage=lazy(()=>import('@/features/borrows/pages/MyBorrowsPage'));
const ProfilePage=lazy(()=>import('@/features/profile/pages/ProfilePage'));

// 404 Page
function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="mt-3 text-gray-500">
        Không tìm thấy trang bạn yêu cầu.
      </p>
    </div>
  )
}

// Access Denied
function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-red-600">
        403 - Không có quyền truy cập
      </h1>
      <p className="mt-3 text-gray-500">
        Bạn không có quyền truy cập trang này.
      </p>
      <button
        onClick={() => window.history.back()}
        className="mt-5 rounded-lg bg-navy-800 px-5 py-2 text-white hover:bg-navy-900"
      >
        Quay lại
      </button>
    </div>
  )
}

function AppRouter() {
  return (
    <Suspense fallback={<p role="status">Đang tải trang…</p>}><Routes>

      {/* Public Routes */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>

        {/* Admin + Librarian */}
        <Route
          element={
            <RoleBasedRoute
              allowedRoles={STAFF_ROLES}
            />
          }
        >
          <Route path={ROUTES.ADMIN} element={<AdminLayout />}>
            <Route
              index
              element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />}
            />

            <Route
              path={ROUTES.ADMIN_DASHBOARD}
              element={<AdminDashboardPage />}
            />

            <Route
              path={ROUTES.ADMIN_AUTHORS}
              element={<AuthorManagementPage />}
            />

            <Route
              path={ROUTES.ADMIN_BOOKS}
              element={<BookManagementPage />}
            />

            <Route
              path={ROUTES.ADMIN_CATEGORIES}
              element={<CategoryManagementPage />}
            />

            <Route
              path={ROUTES.ADMIN_MEMBERS}
              element={<MemberManagementPage />}
            />

            <Route
              path={ROUTES.ADMIN_BORROWS}
              element={<BorrowManagementPage />}
            />
          </Route>
        </Route>

        {/* User */}
        <Route
          element={
            <RoleBasedRoute allowedRoles={[ROLES.USER]} />
          }
        >
          <Route path={ROUTES.USER} element={<UserLayout />}>
            <Route
              index
              element={<Navigate to={ROUTES.USER_DASHBOARD} replace />}
            />

            <Route
              path={ROUTES.USER_DASHBOARD}
              element={<UserDashboardPage />}
            />

            <Route
              path={ROUTES.USER_BOOKS}
              element={<BookListPage />}
            />

            <Route
              path={ROUTES.USER_BOOK_DETAIL}
              element={<BookDetailPage />}
            />

            <Route
              path={ROUTES.USER_BORROWS}
              element={<MyBorrowsPage />}
            />

            <Route
              path={ROUTES.USER_PROFILE}
              element={<ProfilePage />}
            />
          </Route>
        </Route>

      </Route>

      {/* Other Routes */}
      <Route
        path={ROUTES.UNAUTHORIZED}
        element={<UnauthorizedPage />}
      />

      <Route path="*" element={<NotFoundPage />} />

    </Routes></Suspense>
  )
}

export default AppRouter
