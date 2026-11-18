import {useEffect, useRef} from 'react';
import {NavLink} from 'react-router-dom';
import {BookOpen, ChartNoAxesCombined, ChevronLeft, ChevronRight, FileClock, LibraryBig, Tags, Users, X} from 'lucide-react';
import {ROUTES} from '@/app/router/routePaths';
import {STAFF_ROLES} from '@/features/auth/permissions';
import {useAuth} from '@/features/auth/hooks/useAuth';

const groups = [
  {label: 'Tổng quan', items: [{title: 'Tổng quan', path: ROUTES.ADMIN_DASHBOARD, icon: ChartNoAxesCombined}]},
  {label: 'Danh mục', items: [
    {title: 'Sách', path: ROUTES.ADMIN_BOOKS, icon: BookOpen},
    {title: 'Tác giả', path: ROUTES.ADMIN_AUTHORS, icon: Users},
    {title: 'Thể loại', path: ROUTES.ADMIN_CATEGORIES, icon: Tags},
  ]},
  {label: 'Độc giả', items: [{title: 'Độc giả', path: ROUTES.ADMIN_MEMBERS, icon: Users}]},
  {label: 'Mượn / Trả', items: [{title: 'Mượn / Trả', path: ROUTES.ADMIN_BORROWS, icon: FileClock}]},
];

function SidebarContent({collapsed, onNavigate}) {
  const {user} = useAuth();
  if (!STAFF_ROLES.includes(user?.role)) return null;
  return <>
    <div className="flex h-18 items-center gap-3 border-b border-white/10 px-4">
      <span className="rounded-xl bg-white/10 p-2 text-sage-200"><LibraryBig size={22} aria-hidden="true"/></span>
      {!collapsed && <div><p className="font-semibold leading-tight">Thư viện</p><p className="text-xs text-slate-300">Không gian quản lý</p></div>}
    </div>
    <nav aria-label="Điều hướng quản lý" className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
      {groups.map(group => <div key={group.label}>
        {!collapsed && <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">{group.label}</p>}
        <div className="space-y-1">{group.items.map(({title,path,icon: Icon}) => <NavLink key={path} to={path} onClick={onNavigate}
          title={collapsed ? title : undefined} aria-label={collapsed ? title : undefined}
          className={({isActive}) => `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${isActive ? 'bg-white text-navy-900' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}>
          <Icon size={19} aria-hidden="true"/><span className={collapsed ? 'sr-only' : ''}>{title}</span>
        </NavLink>)}</div>
      </div>)}
    </nav>
    {!collapsed && <div className="border-t border-white/10 px-5 py-4 text-xs text-slate-300">{user?.role === 'Admin' ? 'Quản trị viên' : 'Thủ thư'}</div>}
  </>;
}

export default function AdminSidebar({isOpen, onClose, collapsed, onToggle}) {
  const dialog = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const node = dialog.current;
    node.showModal();
    return () => node.close();
  }, [isOpen]);
  return <>
    <aside className={`fixed inset-y-0 left-0 z-40 hidden flex-col bg-navy-900 text-white lg:flex ${collapsed ? 'w-20' : 'w-64'}`}>
      <SidebarContent collapsed={collapsed}/>
      <button type="button" onClick={onToggle} aria-label={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
        className="absolute -right-3 top-22 rounded-full border border-slate-200 bg-white p-1 text-navy-900 shadow-sm focus-visible:outline-2 focus-visible:outline-navy-700">
        {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
      </button>
    </aside>
    {isOpen && <dialog ref={dialog} onCancel={onClose} className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-navy-900 p-0 text-white shadow-xl backdrop:bg-slate-950/60 lg:hidden">
      <button type="button" onClick={onClose} aria-label="Đóng menu" className="absolute right-3 top-4 rounded-lg p-2 text-white hover:bg-white/10"><X size={20}/></button>
      <div className="flex h-full flex-col"><SidebarContent collapsed={false} onNavigate={onClose}/></div>
    </dialog>}
  </>;
}
