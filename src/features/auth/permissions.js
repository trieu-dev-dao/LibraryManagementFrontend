export const ROLES={ADMIN:'Admin',LIBRARIAN:'Librarian',USER:'User'};
export const STAFF_ROLES=[ROLES.ADMIN,ROLES.LIBRARIAN];
export const canManageLibrary=role=>STAFF_ROLES.includes(role);
export function requireStaff(role){if(!canManageLibrary(role))throw new Error('Bạn không có quyền thực hiện thao tác này.');}
