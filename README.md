# LibraryManagementFrontend

Giao diện quản lý thư viện dùng React 19, JavaScript, Vite 8, Tailwind 4, TanStack Query và Zustand. Mã nguồn backend ở project anh em `D:\.NET\LibraryManagement`; hợp đồng API được ghi trong `docs/api-contract.md` của backend. Frontend hiện không có metadata Git trong thư mục project.

## Chạy local

- Node theo `package.json`: `^20.19.0 || >=22.12.0` và npm tương ứng.
- Chạy `npm ci` để cài đúng `package-lock.json`.
- Sao chép `.env.example` thành `.env`, đặt `VITE_API_BASE_URL` thành URL gốc API của backend, kết thúc bằng `/api` và không có dấu `/` cuối. Nếu dùng Google login, đặt thêm **public** `VITE_GOOGLE_CLIENT_ID`. Không đưa client secret, JWT secret hoặc chuỗi kết nối vào biến `VITE_*` vì chúng được nhúng vào bundle trình duyệt.
- Chạy `npm run dev` rồi mở địa chỉ Vite báo ra (cấu hình mặc định cổng 3000). Backend cần CORS cho origin này.

Lệnh kiểm tra: `npm run build`, `npm run lint`, `npm test`, `npm run test:browser`. Browser tests dùng API giả trong `tests/start-browser-server.mjs`, không gọi backend thật. Nếu kiểm thử tích hợp thật, chỉ dùng DB và tài khoản test riêng: backend tự migrate/seed khi khởi động.

## Triển khai frontend

Chạy `npm run build` với cấu hình API và Google của môi trường triển khai, rồi phục vụ thư mục `dist` tại gốc tên miền. Đặt `index.html` làm trang mặc định tại `/` và cấu hình máy chủ trả về tệp này cho các đường dẫn giao diện như `/login`, `/register`, `/user/dashboard` và `/admin/dashboard`. Các tệp tĩnh và đường dẫn API vẫn được phục vụ theo cấu hình riêng. Trang chủ công khai tại `/` không gọi API thư viện.

## Cấu trúc

- `src/app`: router, role guard, layout và provider. URL hiện có nằm trong `src/app/router/routePaths.jsx`.
- `src/features`: auth, authors, categories, books, members, borrows, profile và dashboard; mỗi domain giữ API, query, trang và component của mình.
- `src/shared`: Axios client, xử lý response/error, hook và UI primitive dùng chung. Zustand sở hữu phiên; TanStack Query giữ dữ liệu server. Đổi tài khoản hoặc đăng xuất hủy request và xóa cache riêng tư.
- `docs/refactor-progress.md`: kết quả từng giai đoạn, key cache, lệnh kiểm tra và giới hạn backend. `docs/source-inventory.md` giữ snapshot trước refactor và danh sách mã nguồn còn lại.

## Quyền và giới hạn API

Admin/Librarian quản lý sách, tác giả, thể loại, độc giả và phiếu mượn. User xem danh mục, phiếu mượn của chính mình và chỉnh sửa họ tên, số điện thoại qua `/api/reader/loans` và `/api/reader/profile`; dữ liệu phiếu mượn hiện chưa có phân trang ở máy chủ. Tự mượn, trả hoặc gia hạn vẫn cần liên hệ thủ thư. Dashboard dùng số bản sách **có thể cho mượn** từ danh mục và số phiếu chưa trả từ API theo người đăng nhập. Quyền thực tế luôn do backend kiểm tra qua Bearer token.
