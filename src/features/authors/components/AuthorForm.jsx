import {useId} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import useServerErrors from '@/shared/hooks/useServerErrors';
import Input from '@/shared/components/ui/Input';
import Button from '@/shared/components/ui/Button';

const schema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên tác giả.').max(150, 'Tối đa 150 ký tự.'),
  bio: z.string().max(2000, 'Tiểu sử tối đa 2000 ký tự.').transform(value => value.trim() || null),
});
export default function AuthorForm({initialData, onSubmit, onCancel, loading, serverError}) {
  const id = useId();
  const {register, handleSubmit, setError, formState: {errors}} = useForm({
    resolver: zodResolver(schema), defaultValues: {name: initialData?.name || '', bio: initialData?.bio || ''},
  });
  useServerErrors(serverError, setError);
  return <form className="space-y-5" onSubmit={handleSubmit(data => {if (!loading) return onSubmit(data);})}>
    <Input label="Tên tác giả" {...register('name')} error={errors.name?.message} disabled={loading}/>
    <div><label htmlFor={id}>Tiểu sử</label>
      <textarea id={id} {...register('bio')} disabled={loading} rows={4} className="w-full rounded-lg border p-3"
        aria-invalid={!!errors.bio} aria-describedby={errors.bio ? id + '-error' : undefined}/>
      {errors.bio && <p id={id + '-error'} role="alert">{errors.bio.message}</p>}
    </div>
    <div className="flex justify-end gap-3 border-t pt-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Hủy</Button>
      <Button type="submit" loading={loading}>{initialData ? 'Cập nhật tác giả' : 'Thêm tác giả'}</Button>
    </div>
  </form>;
}
