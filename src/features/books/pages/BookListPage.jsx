import {ROUTES} from '@/app/router/routePaths';
import {useNavigate,useSearchParams} from 'react-router-dom';
import {useBookList} from '../hooks/useBooks';
import BookCard from '../components/BookCard';
import QueryStatus from '@/shared/components/ui/QueryStatus';
import ListControls from '@/shared/components/ui/ListControls';
import useListPage from '@/shared/hooks/useListPage';

export default function BookListPage(){
 const query=useBookList(),navigate=useNavigate(),[params,setParams]=useSearchParams();
 const books=query.data??[];
 const categories=[...new Map(books.map(book=>[book.categoryId,{id:book.categoryId,name:book.categoryName??'Chưa phân loại'}])).values()];
 const category=params.get('category');
 const filtered=category?books.filter(book=>String(book.categoryId)===category):books;
 const list=useListPage(filtered,['title','authorName','categoryName']);
 const setCategory=value=>setParams(previous=>{const next=new URLSearchParams(previous);if(value)next.set('category',value);else next.delete('category');next.set('page','1');return next;});
 return <section className="space-y-5">
  <div><p className="text-sm font-semibold uppercase tracking-widest text-sage-800">Khám phá thư viện</p><h1 className="mt-1 text-3xl font-bold">Danh mục sách</h1><p className="mt-2 text-slate-600">Tìm một cuốn sách phù hợp để hỏi mượn tại quầy thủ thư.</p></div>
  <QueryStatus query={query}/>
  {query.isSuccess&&<>
   <label className="block text-sm font-medium" htmlFor="reader-category">Thể loại</label>
   <select id="reader-category" className="min-h-10 rounded-xl border border-line bg-white px-3" value={category??''} onChange={event=>setCategory(event.target.value)}>
    <option value="">Tất cả thể loại</option>
    {categories.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
   </select>
   <ListControls list={list}/>
   {!list.total&&<p className="surface p-8 text-center text-slate-600">{books.length?'Không tìm thấy sách phù hợp.':'Thư viện chưa có sách.'}</p>}
   <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{list.rows.map(book=><BookCard key={book.id} book={book} onView={()=>navigate(ROUTES.USER_BOOKS+'/'+book.id)}/>)}</div>
  </>}
 </section>;
}
