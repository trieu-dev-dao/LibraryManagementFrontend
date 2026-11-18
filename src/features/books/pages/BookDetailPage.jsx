import {ROUTES} from '@/app/router/routePaths';
import {useParams,Link} from 'react-router-dom';
import {useBookDetail} from '../hooks/useBooks';
import QueryStatus from '@/shared/components/ui/QueryStatus';
import BookCover from '../components/BookCover';

export default function BookDetailPage(){
 const {id}=useParams();
 const query=useBookDetail(id);
 const invalidId=!/^[1-9][0-9]*$/.test(String(id))||Number(id)>2147483647;
 const missing=invalidId||query.error?.response?.status===404;
 return <section className="surface p-5 sm:p-8">
  <Link className="font-medium text-navy-800 hover:underline" to={ROUTES.USER_BOOKS}>← Danh mục sách</Link>
  {missing?<p role="alert" className="mt-4">Không tìm thấy sách.</p>:<QueryStatus query={query}/>}
  {query.data&&!missing&&<div className="mt-6 grid gap-8 sm:grid-cols-[minmax(180px,280px)_1fr]">
    <BookCover book={query.data}/>
    <div><p className="text-xs font-semibold uppercase tracking-widest text-sage-800">{query.data.categoryName || 'Chưa phân loại'}</p><h1 className="mt-2 text-3xl font-bold">{query.data.title}</h1>
      <dl className="mt-6 divide-y divide-line">{[['Tác giả','authorName'],['Thể loại','categoryName'],['Số bản hiện còn','quantity'],['Năm xuất bản','publishedYear']].map(([label,key])=><div key={key} className="grid grid-cols-2 gap-3 py-3 text-sm"><dt className="text-slate-600">{label}</dt><dd className="font-semibold">{query.data[key]??'—'}</dd></div>)}</dl>
      <p className="mt-6 rounded-xl bg-sage-100 p-4 text-sm text-sage-800">Liên hệ thủ thư để lập phiếu mượn.</p>
    </div>
  </div>}
 </section>;
}
