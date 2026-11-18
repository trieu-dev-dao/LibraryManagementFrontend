import {loginDestination} from '../navigation';
import {ROUTES,ROLE_HOME} from '@/app/router/routePaths';
import LoginForm from '../components/LoginForm';
import {Link,useLocation} from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useAuthStore } from "@/features/auth/store/authStore";


function LoginPage() {
  const navigate = useNavigate();
  const location=useLocation();
  const hasApiConfig = Boolean(import.meta.env.VITE_API_BASE_URL);

  const handleGoogleLoginSuccess = (data) => {
    // Lưu JWT và thông tin người dùng vào Zustand
    const user = useAuthStore.getState().setAuth(data);

    // Điều hướng theo Role
    const saved=location.state?.from;
    const from=saved ? saved.pathname+(saved.search||'')+(saved.hash||'') : undefined;
    const destination=loginDestination(user.role,from,ROUTES,ROLE_HOME);

    if (destination) {
      navigate(destination, { replace: true });
    } else {
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-workspace px-4">
      <div className="surface w-full max-w-md p-8">
        <h1 className="mb-2 text-center text-2xl font-bold">
          Thư viện Tạ Quang Bửu
        </h1>

        <p className="mb-6 text-center text-gray-500">
          Đăng nhập để sử dụng hệ thống quản lý thư viện
        </p>

        {!hasApiConfig && <p role="alert" className="mb-4 rounded bg-amber-50 p-3 text-sm text-amber-900">Chưa cấu hình máy chủ API. Hãy đặt VITE_API_BASE_URL trong tệp .env theo .env.example rồi khởi động lại ứng dụng.</p>}
        {hasApiConfig && <LoginForm onLoginSuccess={handleGoogleLoginSuccess}/>}
        <Link className="my-4 block font-medium text-navy-800 hover:underline" to={ROUTES.REGISTER}>Đăng ký tài khoản</Link>
        {hasApiConfig && (import.meta.env.VITE_GOOGLE_CLIENT_ID ? <GoogleLoginButton
          onLoginSuccess={handleGoogleLoginSuccess}
        /> : <p>Đăng nhập Google chưa được cấu hình. Bạn vẫn có thể dùng mật khẩu.</p>)}
      </div>
    </div>
  );
}

export default LoginPage;
