import {apiError} from '@/shared/api/errors';

import { useState } from "react";
import { authApi } from "../api/authApi";

function LoginForm({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(loading)return;

    try {
      setLoading(true);
      setError("");

      // Gọi API đăng nhập
      const response = await authApi.login(formData);

      // Trả dữ liệu về LoginPage
      onLoginSuccess(response);

    } catch (err) {

      setError(
        apiError(err).message
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div>
        <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700">
          Tên đăng nhập hoặc email
        </label>

        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Nhập tên đăng nhập hoặc email"
          required
          autoComplete="username"
          className="w-full rounded-lg border border-line px-4 py-3 outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
          Mật khẩu
        </label>

        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Nhập mật khẩu"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-line px-4 py-3 outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded-lg bg-navy-800 px-4 py-3 font-semibold text-white transition hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

    </form>
  );
}

export default LoginForm;
