import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {bookSchema} from '../schemas/bookSchema';
import {useAuthors} from '@/features/authors/hooks/useAuthors';
import {useCategories} from '@/features/categories/hooks/useCategories';
import useServerErrors from '@/shared/hooks/useServerErrors';
import Input from '@/shared/components/ui/Input';
import Select from '@/shared/components/ui/Select';
import Button from '@/shared/components/ui/Button';
import QueryStatus from '@/shared/components/ui/QueryStatus';

export default function BookForm({initialData, onSubmit, onCancel, loading, serverError}) {
  const authors = useAuthors(), categories = useCategories();
  const {register, handleSubmit, setError, formState: {errors}} = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: initialData || {title: '', authorId: '', categoryId: '', quantity: 1, publishedYear: 0},
  });
  useServerErrors(serverError, setError);
  const ready = authors.isSuccess && categories.isSuccess && !authors.error && !categories.error;
  const submit = data => {
    if (!ready || loading) return;
    if (!authors.authors.some(author => author.id === data.authorId)) {
      setError('authorId', {message: 'Tác giả không còn trong danh sách.'}); return;
    }
    if (!categories.categories.some(category => category.id === data.categoryId)) {
      setError('categoryId', {message: 'Thể loại không còn trong danh sách.'}); return;
    }
    return onSubmit(data);
  };
  return <form onSubmit={handleSubmit(submit)} className="space-y-4">
    <QueryStatus query={authors}/><QueryStatus query={categories}/>
    {authors.isSuccess && !authors.authors.length && <p>Chưa có tác giả. Thêm tác giả trước khi lưu sách.</p>}
    {categories.isSuccess && !categories.categories.length && <p>Chưa có thể loại. Thêm thể loại trước khi lưu sách.</p>}
    <Input label="Tên sách" {...register('title')} error={errors.title?.message} disabled={loading}/>
    <Select label="Tác giả" {...register('authorId')} options={authors.authors.map(x => ({value: x.id, label: x.name}))}
      error={errors.authorId?.message} disabled={loading || !ready}/>
    <Select label="Thể loại" {...register('categoryId')} options={categories.categories.map(x => ({value: x.id, label: x.name}))}
      error={errors.categoryId?.message} disabled={loading || !ready}/>
    <Input label="Số bản hiện còn" type="number" {...register('quantity')} error={errors.quantity?.message} disabled={loading}/>
    <Input label="Năm xuất bản (0 nếu chưa xác định)" type="number" {...register('publishedYear')} error={errors.publishedYear?.message} disabled={loading}/>
    <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Hủy</Button>{' '}
    <Button type="submit" disabled={!ready || !authors.authors.length || !categories.categories.length || loading} loading={loading}>Lưu sách</Button>
  </form>;
}
