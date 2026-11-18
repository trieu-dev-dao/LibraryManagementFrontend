import {useForm} from 'react-hook-form';
import {useBookList} from '@/features/books/hooks/useBooks';
import {useMembers} from '@/features/members/hooks/useMembers';
import useServerErrors from '@/shared/hooks/useServerErrors';
import QueryStatus from '@/shared/components/ui/QueryStatus';
import Input from '@/shared/components/ui/Input';
import Select from '@/shared/components/ui/Select';
import Button from '@/shared/components/ui/Button';

export default function LoanForm({record, onSubmit, pending, serverError}) {
  const books = useBookList(), members = useMembers();
  const {register, handleSubmit, setError, formState: {errors}} = useForm({
    defaultValues: {bookId: '', memberId: '', expiredDate: record?.expiredDate?.slice(0, 10) || ''},
  });
  useServerErrors(serverError, setError);
  const ready = !!record || (books.isSuccess && members.isSuccess && !books.error && !members.error);
  const available = (books.data??[]).filter(book => book.quantity > 0);
  const minimumDate = record?.borrowDate.slice(0, 10) || new Date().toISOString().slice(0, 10);
  const submit = fields => {
    if (pending || !ready) return;
    if (!record && !available.some(book => book.id === Number(fields.bookId))) {
      setError('bookId', {message: 'Sách không còn bản để mượn.'}); return;
    }
    if (!record && !members.members.some(member => member.id === Number(fields.memberId))) {
      setError('memberId', {message: 'Độc giả không còn trong danh sách.'}); return;
    }
    const expiredDate = fields.expiredDate + 'T23:59:59Z';
    if (record) return onSubmit({id: record.id, data: {
      bookId: record.bookId, memberId: record.memberId, status: record.status, expiredDate,
    }});
    return onSubmit({bookId: Number(fields.bookId), memberId: Number(fields.memberId), expiredDate});
  };
  return <form className="space-y-4" onSubmit={handleSubmit(submit)}>
    {!record && <>
      <QueryStatus query={books}/><QueryStatus query={members}/>
      <Select label="Sách còn bản" {...register('bookId', {required: 'Chọn sách.'})}
        options={available.map(book => ({value: book.id, label: book.title + ' (' + book.quantity + ' bản)'}))}
        error={errors.bookId?.message} disabled={!ready || pending}/>
      <Select label="Độc giả" {...register('memberId', {required: 'Chọn độc giả.'})}
        options={members.members.map(member => ({value: member.id, label: member.fullName + ' — ' + member.email}))}
        error={errors.memberId?.message} disabled={!ready || pending}/>
      {ready && !available.length && <p>Không có sách còn bản để mượn.</p>}
      {ready && !members.members.length && <p>Chưa có độc giả. Cần đăng ký tài khoản trước.</p>}
    </>}
    {record && <p>Điều chỉnh hạn trả của phiếu #{record.id}. Sách, độc giả và trạng thái được giữ theo phiếu hiện tại.</p>}
    <Input label="Hạn trả (UTC)" type="date" min={minimumDate} {...register('expiredDate', {
      required: 'Chọn hạn trả.', validate: value => value >= minimumDate || 'Hạn trả không được trước ngày cho phép.',
    })} error={errors.expiredDate?.message} disabled={pending}/>
    <Button type="submit" disabled={!ready || pending || (!record && (!available.length || !members.members.length))}
      loading={pending}>{record ? 'Lưu hạn trả' : 'Lập phiếu mượn'}</Button>
  </form>;
}
