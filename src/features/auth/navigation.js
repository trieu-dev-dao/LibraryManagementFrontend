import {ROLES, canManageLibrary} from './permissions.js';

export function loginDestination(role, from, routes, homes) {
  const home = Object.hasOwn(homes, role) ? homes[role] : null;
  if (!home) return routes.UNAUTHORIZED;
  const prefix = role === ROLES.USER ? routes.USER : canManageLibrary(role) ? routes.ADMIN : null;
  if (!prefix || typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) return home;
  const pathname = from.split(/[?#]/)[0];
  if (/[\\\\%]/.test(pathname) || pathname.includes('..')) return home;
  const allowed = Object.values(routes).filter(p => p.startsWith(prefix + '/') && !p.includes(':'));
  if (allowed.includes(pathname)) return from;
  if (role === ROLES.USER && pathname.startsWith(routes.USER_BOOKS + '/')) {
    const id = pathname.slice(routes.USER_BOOKS.length + 1);
    if (/^[1-9][0-9]*$/.test(id) && Number(id) <= 2147483647) return from;
  }
  return home;
}
