import Pagination from './Pagination';
import {Search} from 'lucide-react';

export default function ListControls({list}) {
  return <div className="my-4 space-y-3">
    <div className="flex w-full items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-navy-700 focus-within:ring-2 focus-within:ring-navy-700/20 sm:max-w-sm">
      <Search size={17} aria-hidden="true" className="text-slate-500"/>
      <input aria-label="Tìm kiếm" placeholder="Tìm kiếm…" className="w-full bg-transparent py-2.5 text-sm outline-none"
        value={list.search} onChange={event => list.update('q', event.target.value)}/>
    </div>
    <Pagination currentPage={list.page} totalPages={list.pages} totalItems={list.total}
      pageSize={list.size} onPageChange={page => list.update('page', page)}
      onPageSizeChange={size => list.update('size', size)}/>
  </div>;
}
