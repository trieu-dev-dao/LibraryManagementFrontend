
import { ROLES } from '@/features/auth/permissions';
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // Admin
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_BOOKS: '/admin/books',
  ADMIN_AUTHORS: '/admin/authors',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_MEMBERS: '/admin/members',
  ADMIN_BORROWS: '/admin/borrows',

  // User
  USER: '/user',
  USER_DASHBOARD: '/user/dashboard',
  USER_BOOKS: '/user/books',
  USER_BOOK_DETAIL: '/user/books/:id',
  USER_BORROWS: '/user/borrows',
  USER_PROFILE: '/user/profile',

  // Other
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
}

export { ROLES } from '@/features/auth/permissions';

export const ROLE_HOME = {
  [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
  [ROLES.LIBRARIAN]: ROUTES.ADMIN_DASHBOARD,
  [ROLES.USER]: ROUTES.USER_DASHBOARD,
}
