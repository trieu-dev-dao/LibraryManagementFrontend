import {useBookList} from '@/features/books/hooks/useBooks';
import {useAuthors} from '@/features/authors/hooks/useAuthors';
import {useCategories} from '@/features/categories/hooks/useCategories';
import {useMembers} from '@/features/members/hooks/useMembers';
import {useBorrows} from '@/features/borrows/hooks/useBorrows';
import StatisticsCard from '../components/StatisticsCard';
import BorrowChart from '../components/BorrowChart';
import QueryStatus from '@/shared/components/ui/QueryStatus';
import {countIfLoaded,borrowMonths} from '../metrics';
import {BookOpen,PenLine,Users,ClipboardList,Tags} from 'lucide-react';

export default function AdminDashboardPage(){
 const books=useBookList(),authors=useAuthors(),categories=useCategories(),members=useMembers(),borrows=useBorrows();
 const sources=[books,authors,categories,members,borrows];
 const metrics=[
  {key:'book-titles',title:'Đầu sách hiện có',query:books,calculate:rows=>rows.length,icon:<BookOpen aria-hidden="true"/>,color:'blue'},
  {key:'available-copies',title:'Số bản có thể cho mượn',query:books,calculate:rows=>rows.reduce((total,book)=>total+book.quantity,0),icon:<BookOpen aria-hidden="true"/>,color:'green'},
  {key:'authors',title:'Tác giả',query:authors,calculate:rows=>rows.length,icon:<PenLine aria-hidden="true"/>,color:'purple'},
  {key:'categories',title:'Thể loại',query:categories,calculate:rows=>rows.length,icon:<Tags aria-hidden="true"/>,color:'orange'},
  {key:'members',title:'Hồ sơ độc giả',query:members,calculate:rows=>rows.length,icon:<Users aria-hidden="true"/>,color:'purple'},
  {key:'unreturned-loans',title:'Phiếu chưa trả',query:borrows,calculate:rows=>rows.filter(record=>!record.returnDate).length,icon:<ClipboardList aria-hidden="true"/>,color:'orange'},
 ];
 return <section className="space-y-6">
  <div><h1 className="text-3xl font-bold">Tổng quan thư viện</h1><p className="mt-1 text-sm text-slate-600">Dữ liệu hiện còn trong hệ thống.</p></div>
  {sources.map((query,index)=><QueryStatus key={index} query={query}/>)}
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
   {metrics.map(metric=>{
    const value=countIfLoaded(metric.query,metric.calculate);
    return <StatisticsCard key={metric.key} metricKey={metric.key} title={metric.title} icon={metric.icon} color={metric.color} error={!!metric.query.error}
     value={value??(metric.query.isPending?'Đang tải…':'Không khả dụng')}
     description={metric.query.error?'Không cập nhật được; số liệu cũ nếu có.':metric.key==='unreturned-loans'?'Đếm phiếu chưa có ngày trả.':'Đếm từ toàn bộ bản ghi hiện còn.'}/>;
   })}
  </div>
  {Array.isArray(borrows.data)?<>
   {borrows.data.length?<BorrowChart data={borrowMonths(borrows.data)}/>:<p>Chưa có phiếu mượn còn lưu để vẽ biểu đồ.</p>}
   <p>Biểu đồ nhóm theo tháng ghi trong ngày mượn của các phiếu còn lưu. Phiếu đã xóa không được tính.</p>
  </>:<p>{borrows.isPending?'Đang tải biểu đồ…':'Biểu đồ chưa khả dụng.'}</p>}
 </section>;
}
