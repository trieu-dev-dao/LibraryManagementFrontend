import {useState} from 'react';
import {BookOpen} from 'lucide-react';
import {coverFor} from './coverSource';

export default function BookCover({book, className = ''}) {
  const [failedUrl, setFailedUrl] = useState(null);
  const cover = coverFor(book);
  const url = cover?.url;
  return <div className={`relative aspect-[2/3] overflow-hidden rounded-xl bg-gradient-to-br from-sage-100 via-workspace to-terracotta-100 ${className}`}>
    {url && failedUrl !== url ? <>
      <img src={url} alt={cover.illustrative ? `Ảnh minh họa cho ${book.title}: bìa ${cover.title}` : `Bìa sách ${book.title}`}
        loading="lazy" onError={() => setFailedUrl(url)} className="h-full w-full object-cover"/>
      {cover.illustrative && <span className="absolute bottom-2 left-2 rounded-lg bg-navy-900 px-2 py-1 text-xs font-semibold text-white">Ảnh minh họa</span>}
    </> : <div role="img" aria-label={`Chưa có bìa cho ${book.title}`}
        className="flex h-full flex-col items-center justify-center gap-4 p-5 text-center text-navy-900">
      <BookOpen size={32} strokeWidth={1.5} aria-hidden="true"/>
      <span className="line-clamp-4 text-base font-semibold leading-snug">{book.title}</span>
      <span className="text-xs font-medium uppercase tracking-wider text-sage-800">Thư viện</span>
    </div>}
  </div>;
}
