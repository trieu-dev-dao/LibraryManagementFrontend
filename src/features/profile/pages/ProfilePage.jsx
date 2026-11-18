import {useRef, useState} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useAuth} from '@/features/auth/hooks/useAuth';
import {useAuthStore} from '@/features/auth/store/authStore';
import {readerApi} from '@/features/reader/api/readerApi';
import {readerKeys, useReaderProfile} from '@/features/reader/hooks/useReader';
import {apiError, applyFieldErrors} from '@/shared/api/errors';
import QueryStatus from '@/shared/components/ui/QueryStatus';
import Input from '@/shared/components/ui/Input';
import Button from '@/shared/components/ui/Button';

const schema = z.object({
  fullName: z.string().trim().min(1, 'Họ tên không được để trống.').max(150, 'Họ tên tối đa 150 ký tự.'),
  phone: z.string().max(20, 'Số điện thoại tối đa 20 ký tự.')
    .refine(value => !value || !!value.trim(), 'Số điện thoại không hợp lệ.')
    .refine(value => !value || /^[+()0-9 .-]+$/.test(value), 'Số điện thoại không hợp lệ.')
    .transform(value => value ? value.trim() : null),
});

function ProfileForm({profile}) {
  const {user, sessionVersion} = useAuth();
  const client = useQueryClient();
  const mutation = useMutation({mutationFn: readerApi.updateProfile});
  const saving = useRef(false);
  const [error, setErrorMessage] = useState(''), [message, setMessage] = useState('');
  const {register, handleSubmit, setError, reset, formState: {errors}} = useForm({
    resolver: zodResolver(schema),
    defaultValues: {fullName: profile.fullName, phone: profile.phone ?? ''},
  });
  const save = async data => {
    if (saving.current) return;
    saving.current = true;
    setErrorMessage(''); setMessage('');
    try {
      const saved = await mutation.mutateAsync(data);
      client.setQueryData(readerKeys.profile(user.userId, sessionVersion), saved);
      useAuthStore.getState().updateUser({fullName: saved.fullName});
      reset({fullName: saved.fullName, phone: saved.phone ?? ''});
      setMessage('Đã lưu hồ sơ.');
    } catch (failure) {
      setErrorMessage(apiError(failure).message);
      applyFieldErrors(failure, setError);
    } finally { saving.current = false; }
  };
  return <div className="space-y-5">
    <dl className="grid gap-4 rounded-xl border border-line bg-workspace p-5 sm:grid-cols-2">
      <div><dt className="text-sm text-slate-600">Tên đăng nhập</dt><dd className="font-medium">{profile.username}</dd></div>
      <div><dt className="text-sm text-slate-600">Email</dt><dd className="font-medium">{profile.email}</dd></div>
      <div><dt className="text-sm text-slate-600">Mã tài khoản</dt><dd className="font-medium">{profile.userId}</dd></div>
      <div><dt className="text-sm text-slate-600">Mã hồ sơ độc giả</dt><dd className="font-medium">{profile.memberId ?? 'Chưa liên kết'}</dd></div>
    </dl>
    {!profile.memberId && <p>Hồ sơ độc giả chưa được liên kết. Bạn vẫn có thể cập nhật thông tin tài khoản.</p>}
    <form className="max-w-lg space-y-4 border-t border-line pt-5" onSubmit={event => handleSubmit(save)(event)}>
      <Input label="Họ tên" {...register('fullName')} error={errors.fullName?.message} disabled={mutation.isPending}/>
      <Input label="Số điện thoại" type="tel" {...register('phone')} error={errors.phone?.message} disabled={mutation.isPending}/>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <p role="status">{message}</p>
      <Button type="submit" loading={mutation.isPending}>Lưu hồ sơ</Button>
    </form>
  </div>;
}

export default function ProfilePage() {
  const query = useReaderProfile();
  return <section className="surface space-y-5 p-5 sm:p-8">
    <div><p className="text-xs font-semibold uppercase tracking-widest text-sage-800">Tài khoản</p><h1 className="mt-1 text-3xl font-bold">Hồ sơ của tôi</h1></div>
    {query.isPending ? <p role="status">Đang tải hồ sơ…</p> : query.error && !query.data ?
      <div role="alert">{apiError(query.error).message}{' '}<Button variant="outline" onClick={() => query.refetch()}>Thử lại</Button></div> : <>
        <QueryStatus query={query}/>
        <ProfileForm key={query.data.userId} profile={query.data}/>
      </>}
  </section>;
}
