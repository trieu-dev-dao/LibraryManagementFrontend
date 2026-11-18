import {ROUTES} from '@/app/router/routePaths';
import {Link} from 'react-router-dom';
import {useBookList} from '@/features/books/hooks/useBooks';
import QueryStatus from '@/shared/components/ui/QueryStatus';
import StatisticsCard from '../components/StatisticsCard';
import {countIfLoaded} from '../metrics';
import {useReaderLoans} from '@/features/reader/hooks/useReader';
import {apiError} from '@/shared/api/errors';
import {BookOpen, LibraryBig, FileClock} from 'lucide-react';

export default function UserDashboardPage(){
 const books=useBookList(), loans=useReaderLoans();
 const titles=countIfLoaded(books,rows=>rows.length);
 const available=countIfLoaded(books,rows=>rows.reduce((total,book)=>total+book.quantity,0));
 const display=value=>value??(books.isPending?'Đang tải…':'Không khả dụng');
 return <section className="space-y-5">
  <div className="rounded-panel bg-navy-900 px-6 py-8 text-white sm:px-8"><p className="text-sm font-semibold uppercase tracking-widest text-sage-200">Góc đọc sách</p><h1 className="mt-2 text-3xl font-bold">Thư viện của bạn</h1><p className="mt-2 text-slate-200">Khám phá sách và theo dõi những cuốn bạn đang mượn.</p></div>
  <QueryStatus query={books}/>
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
   <StatisticsCard title="Đầu sách trong danh mục" value={display(titles)} icon={<BookOpen aria-hidden="true"/>}/>
   <StatisticsCard title="Số bản có thể cho mượn" value={display(available)} icon={<LibraryBig aria-hidden="true"/>} color="green"/>
   <div>
    <Link to={ROUTES.USER_BORROWS} className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-700">
     <StatisticsCard title="Phiếu mượn của tôi" icon={<FileClock aria-hidden="true"/>} color="orange" value={loans.error?'Không khả dụng':loans.isPending?'Đang tải…':loans.data.activeLoanCount}
      description="Xem phiếu đang mượn và lịch sử →"/>
    </Link>
    {loans.error && <div role="alert" className="mt-2 text-sm text-red-700">
     {apiError(loans.error).message}{' '}
     <button type="button" className="font-medium underline" onClick={() => loans.refetch()}>Thử lại</button>
    </div>}
   </div>
  </div>
  <p>Tìm sách theo tên, tác giả hoặc thể loại. Liên hệ thủ thư để mượn và trả sách.</p>
  <Link className="font-semibold text-navy-800 underline-offset-4 hover:underline" to={ROUTES.USER_BOOKS}>Khám phá danh mục sách →</Link>
 </section>;
}
