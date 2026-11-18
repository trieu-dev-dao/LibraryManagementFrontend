import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import useServerErrors from '@/shared/hooks/useServerErrors';
import Input from '@/shared/components/ui/Input';
import Button from '@/shared/components/ui/Button';

const schema = z.object({name: z.string().trim().min(1, 'Vui lòng nhập tên thể loại.').max(100, 'Tối đa 100 ký tự.')});
export default function CategoryForm({initialData, onSubmit, onCancel, loading, serverError}) {
  const {register, handleSubmit, setError, formState: {errors}} = useForm({
    resolver: zodResolver(schema), defaultValues: {name: initialData?.name || ''},
  });
  useServerErrors(serverError, setError);
  return <form className="space-y-5" onSubmit={handleSubmit(data => {if (!loading) return onSubmit(data);})}>
    <Input label="Tên thể loại" {...register('name')} error={errors.name?.message} disabled={loading}/>
    <div className="flex justify-end gap-3 border-t pt-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Hủy</Button>
      <Button type="submit" loading={loading}>{initialData ? 'Cập nhật thể loại' : 'Thêm thể loại'}</Button>
    </div>
  </form>;
}
