import { ROUTES, ROLE_HOME } from "@/app/router/routePaths";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "../api/authApi";
import { apiError } from "@/shared/api/errors";
import Input from "@/shared/components/ui/Input";
import Button from "@/shared/components/ui/Button";
import GoogleLoginButton from '../components/GoogleLoginButton';
import {useAuthStore} from '../store/authStore';
import {loginDestination} from '../navigation';
const schema = z.object({
  fullName: z.string().trim().min(1).max(150),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_.]+$/),
  email: z.email().max(254),
  password: z.string().min(8),
  phone: z
    .string()
    .max(20)
    .refine((v) => !v || /^[+()0-9 .-]+$/.test(v))
    .transform((v) => v || null),
});
export default function RegisterPage() {
  const navigate = useNavigate();
  const submitting = useRef(false);
  const [message, setMessage] = useState(""),
    [done, setDone] = useState(false),
    [googleBusy, setGoogleBusy] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });
  const submit = async (data) => {
    if (submitting.current || googleBusy || done) return;
    submitting.current = true;
    try {
      await authApi.register(data);
      setDone(true);
      setMessage("Đăng ký thành công. Hãy đăng nhập tiếp để truy cập.");
    } catch (e) {
      const err = apiError(e);
      setMessage(err.message);
      for (const [k, v] of Object.entries(err.fields))
        setError(k[0].toLowerCase() + k.slice(1), {
          message: Array.isArray(v) ? v.join(" ") : v,
        });
    } finally {
      submitting.current = false;
    }
  };
  const completeGoogleSignup = data => {
    const user = useAuthStore.getState().setAuth(data);
    navigate(loginDestination(user.role, undefined, ROUTES, ROLE_HOME), {replace: true});
  };
  return (
    <main className="surface mx-auto my-10 max-w-md p-6">
      <h1 className="text-2xl font-bold">Đăng ký tài khoản</h1>
      <form className="space-y-4" onSubmit={event => handleSubmit(submit)(event)}>
        {[
          ["fullName", "Họ tên", "text"],
          ["username", "Tên đăng nhập", "text"],
          ["email", "Email", "email"],
          ["password", "Mật khẩu", "password"],
          ["phone", "Điện thoại (không bắt buộc)", "tel"],
        ].map(([k, label, type]) => (
          <Input
            key={k}
            label={label}
            type={type}
            {...register(k)}
            error={errors[k]?.message}
            disabled={isSubmitting || googleBusy || done}
          />
        ))}
        <p role="status">{message}</p>
        <Button type="submit" disabled={isSubmitting || googleBusy || done}>
          Đăng ký
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-sm text-slate-500"><span className="h-px flex-1 bg-line"/><span>hoặc</span><span className="h-px flex-1 bg-line"/></div>
      {import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_GOOGLE_CLIENT_ID ?
        <GoogleLoginButton buttonText="signup_with" disabled={isSubmitting || done}
          onLoadingChange={busy => {setGoogleBusy(busy); if (busy) setMessage('');}}
          onLoginSuccess={completeGoogleSignup}/> :
        <p className="text-sm text-slate-600">Đăng ký Google chưa được cấu hình. Bạn vẫn có thể dùng biểu mẫu.</p>}
      <Link
        className="mt-4 inline-block font-medium text-navy-800 hover:underline"
        to={ROUTES.LOGIN}
      >
        Đăng nhập
      </Link>
    </main>
  );
}
