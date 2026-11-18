import {useSearchParams} from 'react-router-dom';
import {useReaderLoans} from '@/features/reader/hooks/useReader';
import {apiError} from '@/shared/api/errors';
import useListPage from '@/shared/hooks/useListPage';
import ListControls from '@/shared/components/ui/ListControls';
import QueryStatus from '@/shared/components/ui/QueryStatus';
import Button from '@/shared/components/ui/Button';
import LoanStatus from '@/shared/components/ui/LoanStatus';

const timestamp = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});
const date = value => `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}`;

export default function MyBorrowsPage() {
  const query = useReaderLoans();
  const [params, setParams] = useSearchParams();
  const view = params.get('view') === 'history' ? 'history' : 'active';
  const records = (query.data?.loans ?? []).filter(record => view === 'active' ? !record.returnDate : !!record.returnDate);
  const list = useListPage(records, ['bookTitle', 'status']);
  const changeView = next => setParams(previous => {
    const value = new URLSearchParams(previous);
    value.set('view', next);
    value.delete('q');
    value.set('page', '1');
    return value;
  });
  const unlinked = query.error?.response?.status === 409 && query.error.response.data?.code === 'member_not_linked';

  return <section className="space-y-5">
    <div><p className="text-xs font-semibold uppercase tracking-widest text-sage-800">Theo dõi sách</p><h1 className="mt-1 text-3xl font-bold">Phiếu mượn của tôi</h1><p className="mt-2 text-slate-600">Liên hệ thủ thư để mượn, trả sách hoặc điều chỉnh hạn trả.</p></div>
    {query.isPending ? <p role="status">Đang tải phiếu mượn…</p> : unlinked ?
      <div role="alert">Tài khoản chưa có hồ sơ độc giả. Vui lòng liên hệ thủ thư để được liên kết hồ sơ.{' '}
        <Button variant="outline" onClick={() => query.refetch()}>Thử lại</Button>
      </div> :
      query.error && !query.data ? <div role="alert" className="rounded bg-red-50 p-3 text-red-700">
        {apiError(query.error).message}{' '}
        <Button variant="outline" onClick={() => query.refetch()}>Thử lại</Button>
      </div> : <>
        <QueryStatus query={query}/>
        <div role="group" aria-label="Nhóm phiếu mượn" className="flex gap-2">
          {[["active", "Đang mượn"], ["history", "Lịch sử"]].map(([value, label]) =>
            <button key={value} type="button" aria-pressed={view === value}
              className={`min-h-10 rounded-xl px-4 py-2 font-medium ${view === value ? 'bg-navy-800 text-white' : 'border border-line bg-white text-navy-800'}`}
              onClick={() => changeView(value)}>{label}</button>)}
        </div>
        {records.length ? <>
          <ListControls list={list}/>
          {list.total ? <div className="table-scroll surface" tabIndex={0} role="region" aria-label="Phiếu mượn của tôi, cuộn ngang để xem đầy đủ">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead><tr>{['Sách', 'Số lượng', 'Ngày mượn', 'Hạn trả', 'Ngày trả', 'Trạng thái'].map(label =>
                <th key={label} scope="col" className="p-3">{label}</th>)}</tr></thead>
              <tbody>{list.rows.map(record => <tr key={record.id} className="border-t">
                <td className="p-3">{record.bookTitle || 'Sách không còn trong danh mục'}</td>
                <td className="p-3">{record.quantity ?? '—'}</td>
                <td className="p-3">{timestamp.format(new Date(record.borrowDate))}</td>
                <td className="p-3">{date(record.dueDate)}</td>
                <td className="p-3">{record.returnDate ? timestamp.format(new Date(record.returnDate)) : '—'}</td>
                <td className="p-3"><LoanStatus status={record.status}/></td>
              </tr>)}</tbody>
            </table>
          </div> : <p>Không tìm thấy phiếu mượn phù hợp.</p>}
        </> : <p className="surface p-8 text-center text-slate-600">{view === 'active' ? 'Bạn chưa có phiếu đang mượn.' : 'Bạn chưa có lịch sử trả sách.'}</p>}
      </>}
  </section>;
}
