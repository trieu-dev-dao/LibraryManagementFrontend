import Button from '@/shared/components/ui/Button';
import BookCover from './BookCover';

export default function BookCard({book, canManage = false, onView, onEdit, onDelete}) {
  const available = (book.quantity ?? 0) > 0;
  return <article className="surface group flex h-full gap-3 overflow-hidden p-3 transition-shadow hover:shadow-md sm:flex-col sm:gap-0">
    <BookCover book={book} className="w-28 shrink-0 sm:w-full"/>
    <div className="flex min-w-0 flex-1 flex-col px-1 pb-1 sm:pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-sage-800">{book.categoryName || 'Chưa phân loại'}</p>
      <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-ink sm:min-h-12 sm:text-lg">{book.title}</h2>
      <p className="mt-1 line-clamp-1 text-sm text-slate-600">{book.authorName || 'Chưa cập nhật tác giả'}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:mt-4">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${available ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'}`}>
          <span aria-hidden="true" className={`size-2 rounded-full ${available ? 'bg-green-700' : 'bg-slate-500'}`}/>
          {available ? `Còn ${book.quantity} bản` : 'Hết sách'}
        </span>
        <span className="text-xs text-slate-500">{book.publishedYear || 'Chưa rõ năm'}</span>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Button variant="outline" size="sm" onClick={() => onView?.(book)}>Chi tiết</Button>
        {canManage && <><Button variant="outline" size="sm" onClick={() => onEdit?.(book)}>Sửa</Button><Button variant="danger" size="sm" onClick={() => onDelete?.(book.id)}>Xóa</Button></>}
      </div>
    </div>
  </article>;
}
