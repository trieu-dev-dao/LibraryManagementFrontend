import {apiError} from '@/shared/api/errors';

import { useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

import { authApi } from "../api/authApi";

function GoogleLoginButton({ onLoginSuccess, buttonText = 'signin_with', disabled = false, onLoadingChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (submitting.current || disabled) return;
    submitting.current = true;
    try {
      setLoading(true);
      onLoadingChange?.(true);
      setError("");

      const idToken = credentialResponse.credential;

      if (!idToken) {
        throw new Error("Không nhận được Google ID Token.");
      }

      // Gửi Google ID Token đến Backend
      const response = await authApi.googleLogin(idToken);
      const data = response;

      // Kiểm tra JWT
      const token = data.token;

      if (!token) {
        throw new Error("Backend không trả về JWT.");
      }

      // Kiểm tra Role
      const role = data.role;

      if (!role) {
        throw new Error("Tài khoản chưa được cấp quyền.");
      }

      onLoginSuccess(data);

    } catch (err) {

      const message =
        apiError(err).message;

      setError(message);

    } finally {
      submitting.current = false;
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-center">
        {!loading && !disabled && <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            setError(buttonText === 'signup_with' ? 'Không thể đăng ký bằng Google.' : 'Không thể đăng nhập bằng Google.');
          }}
          text={buttonText}
          shape="rectangular"
          size="large"
          width="320"
          theme="outline"
        />}
      </div>

      {loading && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-navy-800">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy-800 border-t-transparent" />
          Đang xác thực tài khoản...
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-center text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export default GoogleLoginButton;
