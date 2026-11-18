export function apiError(error) {
  if (typeof error === "string")
    return { message: error, fields: {}, conflict: false };
  const status = error?.response?.status;
  const data = error?.response?.data;
  const googleMessage =
    error?.config?.url === "/auth/google-login" &&
    typeof data?.message === "string"
      ? data.message.trim()
      : "";
  const fields =
    status === 400 && data?.errors && typeof data.errors === "object"
      ? data.errors
      : {};
  const messages = {
    401: error?.config?.url?.startsWith("/auth/")
      ? "Thông tin xác thực không hợp lệ."
      : "Phiên đăng nhập đã hết hạn.",
    403: "Bạn không có quyền thực hiện thao tác này.",
    404: "Không tìm thấy dữ liệu.",
    409: "Dữ liệu xung đột với trạng thái hiện tại.",
  };
  const validation = Object.entries(fields)
    .map(([k, v]) => k + ": " + (Array.isArray(v) ? v.join(" ") : String(v)))
    .join(" ");
  return {
    status,
    fields,
    conflict: status === 409,
    message:
      googleMessage || (status >= 500
        ? "Máy chủ không xử lý được yêu cầu. Dữ liệu có thể đang được tham chiếu."
        : validation ||
          ((status === 400 || status === 409) &&
            typeof data?.message === "string" &&
            data.message) ||
          messages[status] ||
          (status
            ? "Yêu cầu không hợp lệ."
            : error?.message || "Không kết nối được máy chủ.")),
  };
}
export function listData(data) {
  if (!Array.isArray(data)) throw new Error("Phản hồi danh sách không hợp lệ.");
  return data;
}

export function applyFieldErrors(error, setError) {
  for (const [path, messages] of Object.entries(apiError(error).fields)) {
    const key = path.replace(/^\$\./, "").split(".").at(-1);
    if (key)
      setError(
        key[0].toLowerCase() + key.slice(1),
        {
          type: "server",
          message: Array.isArray(messages)
            ? messages.join(" ")
            : String(messages),
        },
        { shouldFocus: true },
      );
  }
}
