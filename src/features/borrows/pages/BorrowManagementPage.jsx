import {useRef, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useBorrows} from '../hooks/useBorrows';
import LoanForm from '../components/LoanForm';
import {apiError} from '@/shared/api/errors';
import QueryStatus from '@/shared/components/ui/QueryStatus';
import Button from '@/shared/components/ui/Button';
import Modal from '@/shared/components/ui/Modal';
import useListPage from '@/shared/hooks/useListPage';
import ListControls from '@/shared/components/ui/ListControls';
import LoanStatus from '@/shared/components/ui/LoanStatus';

export default function BorrowManagementPage() {
  const [params, setParams] = useSearchParams();
  const requestedStatus = params.get('status');
  const status = ['Đang mượn', 'Quá hạn', 'Đã trả'].includes(requestedStatus) ? requestedStatus : '';
  const query = useBorrows(status);
  const list = useListPage(query.records, ['id', 'bookTitle', 'memberFullName', 'status']);
  const changeStatus = value => setParams(previous => {
    const next = new URLSearchParams(previous);
    if (value) next.set('status', value);
    else next.delete('status');
    next.set('page', '1');
    return next;
  });
  const [open, setOpen] = useState(false), [selected, setSelected] = useState(null);
  const [error, setError] = useState(null), [message, setMessage] = useState('');
  const submitting = useRef(false);
  const act = async (action, data) => {
    if (submitting.current || !query.allowed) return;
    submitting.current = true;
    setError(null); setMessage('');
    try {
      await query.act(action, data);
      setOpen(false); setSelected(null);
      setMessage('Thao tác thành công. Danh sách đang được cập nhật.');
    } catch (failure) { setError(failure); }
    finally { submitting.current = false; }
  };
  const showForm = record => {setError(null); setSelected(record); setOpen(true);};
  return <section className="space-y-4">
    <div><h1 className="text-2xl font-bold">Quản lý mượn trả</h1><p className="mt-1 text-sm text-slate-600">Theo dõi phiếu mượn và ghi nhận trả sách.</p></div>
    {query.allowed && <Button disabled={query.pending} onClick={() => showForm(null)}>Lập phiếu mượn</Button>}
    <QueryStatus query={query}/>
    <p role="status">{message}</p>
    {error && !open && <p role="alert">{apiError(error).message}</p>}
    <label className="block text-sm" htmlFor="loan-status">Trạng thái</label>
    <select id="loan-status" className="min-h-10 rounded-xl border border-line bg-white px-3" value={status} onChange={event => changeStatus(event.target.value)}>
      <option value="">Tất cả</option>
      <option value="Đang mượn">Đang mượn</option>
      <option value="Quá hạn">Quá hạn</option>
      <option value="Đã trả">Đã trả</option>
    </select>
    <ListControls list={list}/>
    <div className="table-scroll surface" tabIndex={0} role="region" aria-label="Danh sách phiếu mượn, cuộn ngang để xem đầy đủ">
      <table className="w-full min-w-[950px] text-left"><thead><tr>
        {['Mã', 'Sách', 'Độc giả', 'Ngày mượn (UTC)', 'Hạn trả (UTC)', 'Ngày trả (UTC)', 'Trạng thái', 'Thao tác']
          .map(label => <th scope="col" key={label} className="p-3">{label}</th>)}
      </tr></thead><tbody>
        {list.rows.map(record => <tr key={record.id}>
          <td className="p-3">{record.id}</td><td>{record.bookTitle}</td><td>{record.memberFullName}</td>
          <td>{record.borrowDate.slice(0, 10)}</td><td>{record.expiredDate.slice(0, 10)}</td>
          <td>{record.returnDate?.slice(0, 10) || '—'}</td><td><LoanStatus status={record.status}/></td>
          <td className="space-y-2">{query.allowed && <>
            {!record.returnDate && <>
              <Button disabled={query.pending} onClick={() => {
                if (window.confirm('Xác nhận đã nhận lại sách?')) act('returnBook', record.id);
              }}>Trả sách</Button>{' '}
              <Button variant="outline" disabled={query.pending} onClick={() => showForm(record)}>Sửa hạn trả</Button>{' '}
            </>}
            <Button variant="danger" disabled={query.pending} onClick={() => {
              if (window.confirm('Xóa phiếu? Phiếu chưa trả sẽ hoàn lại một bản sách theo quy tắc máy chủ.')) act('delete', record.id);
            }}>Xóa</Button>
          </>}</td>
        </tr>)}
      </tbody></table>
    </div>
    {query.isSuccess && !list.total && <p>Không tìm thấy phiếu mượn.</p>}
    <p>Trạng thái do máy chủ xác định. Chưa hỗ trợ duyệt, gia hạn theo yêu cầu hay hủy dành cho người đọc.</p>
    <Modal isOpen={open} onClose={() => setOpen(false)} busy={query.pending} title={selected ? 'Điều chỉnh hạn trả' : 'Lập phiếu mượn'}>
      {error && <p role="alert">{apiError(error).message}</p>}
      <LoanForm key={selected?.id || 'new'} record={selected} serverError={error}
        onSubmit={data => act(selected ? 'update' : 'borrow', data)} pending={query.pending}/>
    </Modal>
  </section>;
}
