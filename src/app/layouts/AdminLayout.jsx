import {useRef, useState} from 'react';
import {Outlet, useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {LogOut, Menu, Search, UserRound} from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import Footer from './Footer';
import {useAuth} from '@/features/auth/hooks/useAuth';
import {ROUTES} from '@/app/router/routePaths';

const pageTitles = {
  [ROUTES.ADMIN_DASHBOARD]: 'Tổng quan', [ROUTES.ADMIN_BOOKS]: 'Sách',
  [ROUTES.ADMIN_AUTHORS]: 'Tác giả', [ROUTES.ADMIN_CATEGORIES]: 'Thể loại',
  [ROUTES.ADMIN_MEMBERS]: 'Độc giả', [ROUTES.ADMIN_BORROWS]: 'Mượn / Trả',
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuButton = useRef(null);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('library-sidebar-collapsed') === 'true');
  const {user, logout} = useAuth();
  const location = useLocation(), navigate = useNavigate(), [params] = useSearchParams();
  const searchType = location.pathname === ROUTES.ADMIN_BOOKS ? 'sách' : location.pathname === ROUTES.ADMIN_MEMBERS ? 'độc giả' : null;
  const toggle = () => setCollapsed(value => {localStorage.setItem('library-sidebar-collapsed', String(!value)); return !value;});
  return <div className="min-h-screen bg-workspace text-ink">
    <AdminSidebar isOpen={sidebarOpen} onClose={() => {setSidebarOpen(false); requestAnimationFrame(() => menuButton.current?.focus());}} collapsed={collapsed} onToggle={toggle}/>
    <div className={`flex min-h-screen min-w-0 flex-col transition-[margin] ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6">
        <div className="flex min-h-18 items-center gap-3">
          <button ref={menuButton} type="button" onClick={() => setSidebarOpen(true)} aria-label="Mở menu" aria-expanded={sidebarOpen}
            className="rounded-lg p-2 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-navy-700 lg:hidden"><Menu size={22}/></button>
          <div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-500">Quản lý thư viện</p><h1 className="truncate text-lg font-semibold">{pageTitles[location.pathname] || 'Thư viện'}</h1></div>
          {searchType && <form role="search" onSubmit={event => {event.preventDefault(); const q = new FormData(event.currentTarget).get('q').trim(); const next = new URLSearchParams(params); if(q)next.set('q',q);else next.delete('q'); next.set('page','1'); navigate(location.pathname+'?'+next);}}
            className="hidden w-64 items-center gap-2 rounded-xl border border-line bg-workspace px-3 focus-within:border-navy-700 focus-within:ring-2 focus-within:ring-navy-700/20 md:flex xl:w-80">
            <Search size={17} className="text-slate-500" aria-hidden="true"/><input key={location.pathname + params.get('q')} name="q" defaultValue={params.get('q') || ''} aria-label={`Tìm tên ${searchType}`} placeholder={`Tìm tên ${searchType}…`} className="w-full bg-transparent py-2.5 text-sm outline-none"/>
          </form>}
          <div className="hidden items-center gap-2 border-l border-line pl-4 sm:flex"><span className="rounded-full bg-sage-100 p-2 text-sage-800"><UserRound size={18}/></span><div className="max-w-32 text-sm"><p className="truncate font-semibold">{user?.fullName || user?.username || user?.email}</p><p className="text-xs text-slate-500">{user?.role === 'Admin' ? 'Quản trị viên' : 'Thủ thư'}</p></div></div>
          <button type="button" onClick={logout} aria-label="Đăng xuất" title="Đăng xuất" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-navy-700"><LogOut size={19}/></button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><Outlet/></main>
      <Footer/>
    </div>
  </div>;
}
