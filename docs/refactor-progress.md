# Tiến độ refactor frontend

## Giai đoạn 02: baseline kế thừa

Frontend tại `D:\.NET\LibraryManagementFrontend` không có thư mục `.git`; không thể xác định diff Git hoặc nguồn gốc từng thay đổi hiện có. Không tìm thấy `AGENTS.md` trong project. Stack hiện tại: React 19, JavaScript, Vite 8, Tailwind 4, Oxlint, Zustand cho phiên, TanStack Query cho dữ liệu server. `package.json` yêu cầu Node `^20.19.0 || >=22.12.0`; có `package-lock.json`. Cấu hình ở `vite.config.js`, `.oxlintrc.json`, `src/styles/index.css` và `playwright.config.js`.

Các route hiện có được giữ nguyên: `/login`, `/register`, `/admin` và `/admin/{dashboard,books,authors,categories,members,borrows}`, `/user` và `/user/{dashboard,books,books/:id,borrows,profile}`, `/unauthorized`, `*`. Route `/` chuyển theo vai trò hoặc về login. App shell, guard và provider ở `src/app`; auth, books, authors, categories, members, borrows, dashboard, profile ở `src/features`; primitive UI và API client ở `src/shared`.

Luồng đang có: login mật khẩu/Google, đăng ký, quản trị sách/tác giả/thể loại/độc giả/phiếu mượn, duyệt sách và xem chi tiết. Dashboard người dùng còn giới hạn; mượn của tôi và hồ sơ cá nhân là placeholder do backend chưa có endpoint theo người dùng. Cần đánh giá sâu các luồng nghiệp vụ ở giai đoạn sau. Baseline cũ trong tài liệu ghi build exit 0 và lint exit 1 do Windows Application Control; lần kiểm tra giai đoạn 03 bên dưới cho kết quả lint khác.

## Giai đoạn 03: xác thực, provider và điều hướng

Đối chiếu `D:\.NET\LibraryManagement\docs\api-contract.md` (giai đoạn 01): `POST /api/Auth/register` tạo User, `POST /api/Auth/login` nhận username hoặc email, `POST /api/Auth/google-login` nhận ID token. Login trả token, userId, memberId, username, role; không có `/me`, refresh hoặc logout server. `expiresAtUtc` hiện sai ở backend nên frontend dùng `exp` trong JWT cho UX và để server xác thực thực tế. API quản trị books/authors/categories/members/borrow-records cho Admin và Librarian; route tự xem hồ sơ và phiếu mượn của User chưa có, giữ placeholder đến giai đoạn 09.

Zustand hiện là nguồn phiên duy nhất; `useAuth` công khai `isHydrated`, `login`, `logout`. Storage thiếu/hỏng hoặc token hết hạn ổn định về trạng thái đăng xuất. Chỉ có một GoogleOAuthProvider tùy chọn. Các hằng route và role nằm ở `routePaths.jsx` và `permissions.js`; URL giữ nguyên. 401 của API riêng tư xóa phiên hiện tại; 401 ở auth báo thông tin xác thực sai mà không xóa phiên; 403 giữ phiên và hiển thị lỗi quyền. Đổi tài khoản/đăng xuất hủy request, xóa cache TanStack Query và remount UI riêng tư. Giai đoạn này bổ sung loại bỏ lỗi response cũ đến sau khi đổi phiên, cùng thông báo hướng dẫn cấu hình `VITE_API_BASE_URL` trên trang login thay cho gửi request không thể thực hiện.

Checkpoint ngày 2026-11-14: Node `v24.18.0`, npm `11.16.0`. `npm run build` exit **0**; `npm run lint` exit **0** với 8 warning hiện có (Fast Refresh ở routePaths/QueryProvider, purity ở Footer/LoanForm, ref ở Modal, hai warning trong polish.mjs). `npm test` exit **0**, 9/9 ca đạt. `npm run test:browser`: 11/11 ca Playwright mô phỏng báo đạt, nhưng tiến trình không tự kết thúc sau khi chạy xong; đã ngắt bằng Ctrl+C, exit **1**. Cần điều tra teardown của test runner ở giai đoạn sau. Các ca mô phỏng kiểm tra khởi động thiếu Google, storage hỏng, login và return URL, chuyển hướng root, route cấm, logout và cách ly cache. Node test kiểm tra token hết hạn và 401/403. Chưa chạy API thật vì startup backend migrate/seed dữ liệu và chưa xác nhận DB test; Google live cũng chưa kiểm chứng.

Giai đoạn tiếp theo: **04**.

## Giai đoạn 07: danh mục và chi tiết sách cho độc giả

Đối chiếu hợp đồng catalog ở `D:\.NET\LibraryManagement\docs\api-contract.md` (giai đoạn 04): `GET /api/books` và `GET /api/books/{id}` cho phép anonymous, cùng DTO; ID không tồn tại trả 404. Backend chưa có tham số tìm kiếm, lọc hoặc phân trang. Dữ liệu danh sách được kiểm tra bằng schema tại biên API; payload sai tạo lỗi, mảng rỗng là trạng thái hợp lệ. `quantity` là số bản hiện có thể cho mượn.

Trang `/user/books` dùng hook chỉ đọc `useBookList` với key `['books','list']`, chung với staff vì endpoint và payload giống nhau. Tìm kiếm theo tên sách/tác giả/thể loại, lọc thể loại và phân trang 10/20/50 dòng đều thực hiện trên danh sách đã tải; URL giữ `q`, `category`, `page`, `size`. Trang `/user/books/:id` dùng `useBookDetail` với key `['books','detail',String(id)]`, gọi endpoint chi tiết, không gửi ID sai định dạng và hiển thị thông báo rõ khi 404. Trang độc giả không lấy các mutation quản trị. Trạng thái tải, lỗi có nút thử lại, thư viện rỗng và không khớp bộ lọc được tách riêng.

Kiểm tra: `npm run build` exit **0**; `npm run lint` exit **0** với 8 warning hiện có; `npm test` exit **0**, 9/9 ca đạt. `npm run test:browser -- --grep "reader detail|reader catalog"` báo **đạt 2/2**: chi tiết tồn tại qua endpoint riêng, danh mục lọc/sang trang và URL chi tiết thiếu. Runner không tự thoát sau khi ca đạt, phải ngắt, exit **1**; đây là vấn đề teardown đã ghi ở giai đoạn 03. Chưa kiểm thử HTTP với backend thật vì chưa có DB test được xác nhận; không có khoảng trống endpoint GET catalog, chỉ thiếu tìm kiếm/lọc/phân trang phía server.

Giai đoạn tiếp theo: **08**.

## Giai đoạn 09: độc giả và hồ sơ người dùng hiện tại

Kiểm tra `D:\.NET\LibraryManagement\docs\api-contract.md`: tài liệu hiện có giai đoạn 01 và 04, chưa có mục hợp đồng member/profile của giai đoạn 08. Đối chiếu trực tiếp `Controllers/MembersController.cs`, `Services/MemberService.cs`, `DTOs/MemberUpdateDto.cs` và `Data/ApplicationDbContext.cs`: `GET /api/members`, `GET /api/members/{id}`, `PUT /api/members/{id}`, `DELETE /api/members/{id}` yêu cầu Admin hoặc Librarian. Không có POST member riêng; hồ sơ được tạo khi đăng ký. PUT sửa tên, email, điện thoại của Member nhưng không đồng bộ trường trong tài khoản đăng nhập. DELETE Member không xóa ApplicationUser; quan hệ phiếu mượn có thể chặn xóa. Chưa có endpoint current-user/self-profile hoặc quyền cho User gọi `GET /api/members/{id}`.

Route `/admin/members`, sidebar và các nút sửa/xóa hiện đã giới hạn ở staff; form giữ dữ liệu khi lỗi. Danh sách dùng TanStack Query với key `['members','staff',userId,sessionVersion]` và chỉ bật cho staff có userId hợp lệ. Đổi phiên xóa cache và hủy request theo AuthProvider. Route `/user/profile` giữ URL cũ, chỉ hiện username từ phiên xác thực và trạng thái tiếng Việt nêu rõ chưa thể xem/chỉnh sửa hồ sơ cá nhân qua API. Không gọi API toàn bộ members hoặc member theo ID để thay thế self-profile.

Checkpoint: `npm run build` exit **0**; `npm run lint` exit **0** với 8 warning hiện có; `npm test` exit **0**, 9/9 ca đạt. `npm run test:browser -- --grep "member routes stay|reader detail uses|logout removes private"` báo **3/3 ca đạt**: staff đọc danh sách, User bị chặn khỏi route quản trị, User chỉ thấy username của chính phiên và không gửi request `/members`, logout xóa dữ liệu riêng tư. Runner không tự thoát sau khi ca đạt, phải ngắt, exit **1**. Chưa chạy HTTP thật do chưa xác nhận DB test; thao tác bị chặn về chức năng là xem/sửa hồ sơ cá nhân qua current-user endpoint vì backend không có đường dẫn đó.

Giai đoạn tiếp theo: **10**.

## Giai đoạn 11: nhân viên lập và trả phiếu mượn

Đối chiếu `D:\.NET\LibraryManagement\docs\api-contract.md`, mục Stage 10: toàn bộ `/api/borrow-records` dành cho Admin/Librarian. Danh sách/chi tiết, POST `/borrow`, POST `/{id}/return`, PUT `/{id}` và DELETE `/{id}` được mã nguồn hỗ trợ. Backend trả `Đang mượn`, `Đã trả`, `Quá hạn`; không có tự chuyển quá hạn. `quantity` của sách là số bản khả dụng. Mượn giảm một, trả tăng một; không có hợp đồng 409 riêng cho hết bản hoặc trả lặp, hai trường hợp đó trả 400. PUT có thể sửa status/book/member nhưng không điều chỉnh stock, nên UI hiện chỉ cho sửa hạn trả, giữ các trường còn lại. Backend chưa có transaction xuyên ghi sách/phiếu hoặc bảo vệ cạnh tranh tồn kho; frontend không cập nhật stock lạc quan.

Trang `/admin/borrows` và guard staff giữ nguyên. Form dùng `useBookList` chỉ đọc thay cho hook mutation sách, và `useMembers` làm lookup; không hiển thị sách hết bản trong lựa chọn. Form xác nhận lại lựa chọn trước khi gửi. `useRef` chặn gửi trùng đồng bộ; nút bị khóa trong lúc mutation chờ. Lỗi 400/404/409 giữ form và làm mới dữ liệu. Ghi thành công đóng form sau response của server rồi làm mới nền; lỗi làm mới về sau không đổi kết quả ghi thành lỗi. Ngày mượn/trả/hạn trả hiển thị theo ngày UTC từ response, không suy ra status từ đồng hồ.

Key và invalidation cho stage 12: danh sách phiếu `['borrows','staff',userId,sessionVersion]`; danh sách sách/khả dụng `['books','list']`, chi tiết `['books','detail',id]`; danh sách member `['members','staff',userId,sessionVersion]`. Mượn, trả, sửa hạn và xóa phiếu thành công invalidate toàn bộ prefix `['borrows']` và `['books']`. Lỗi 400/404/409 cũng invalidate hai prefix để lấy lại trạng thái server. `AuthProvider` xóa cache và hủy request khi đổi phiên. Không có query riêng cho availability; sử dụng số khả dụng từ danh sách sách.

Checkpoint: `npm run build` exit **0**; `npm run lint` exit **0** với 8 warning hiện có; `npm test` exit **0**, 9/9 ca đạt. `npm run test:browser -- --grep "staff can borrow|zero availability|single-flight|root redirect"` báo **4/4 ca đạt** trên dữ liệu giả: quyền User bị chặn, Librarian mượn/trả và số khả dụng cập nhật, hết bản/lỗi 400 giữ form, gửi hai lần chỉ có một POST. Runner Playwright không tự thoát sau khi báo kết quả; ngắt thủ công, exit **1**. Chưa chạy HTTP/DB thật vì chưa xác nhận DB test cô lập; tính nguyên tử và cạnh tranh tồn kho ở backend chưa được kiểm chứng thực tế.

Giai đoạn tiếp theo: **12**.

## Giai đoạn 12: phiếu mượn và lịch sử của độc giả

Đối chiếu `D:\.NET\LibraryManagement\docs\api-contract.md`, mục Stage 10, và `Controllers/BorrowRecordsController.cs`: mọi endpoint `/api/borrow-records` chỉ dành cho Admin/Librarian. Không có GET current-user, lọc theo `memberId` ở server hoặc kiểm tra ownership trong controller; token User không có quyền đọc danh sách/chi tiết staff. Không có thao tác độc giả tự mượn, trả, hủy hoặc gia hạn. PUT staff có thể sửa hạn nhưng không phải hợp đồng gia hạn dành cho độc giả. Status `Đang mượn`, `Đã trả`, `Quá hạn` do backend lưu; không có chuyển `Quá hạn` tự động theo đồng hồ.

Giữ route `/user/borrows` trong `features/borrows`. Trang hiển thị giới hạn chính xác bằng tiếng Việt: chưa thể xem phiếu đang mượn, lịch sử, status hay hạn trả; thủ thư thực hiện các thao tác mượn/trả và hỗ trợ tra cứu. Trang không gọi API staff và không có nút mutation. Không tạo query hoặc cache riêng cho độc giả khi chưa có endpoint và response theo danh tính được xác minh. Query staff tiếp tục dùng `['borrows','staff',userId,sessionVersion]`, chỉ bật cho Admin/Librarian; AuthProvider xóa cache và hủy request khi đổi phiên.

Checkpoint: `npm run build` exit **0**; `npm run lint` exit **0** với 8 warning hiện có; `npm test` exit **0**, 9/9 ca đạt. `npm run test:browser -- --grep "reader loan page stays|reader detail uses"` báo **2/2 ca đạt** trên dữ liệu giả: trang phiếu độc giả không gửi request `/borrow-records`, kể cả khi đổi từ User này sang User khác; trang danh mục/chi tiết không tải members hoặc phiếu staff. Runner Playwright không tự thoát sau khi báo kết quả; ngắt thủ công, exit **1**. Không thể xác minh current-user results, empty/history states hoặc chạy mutation độc giả vì backend chưa có các operation đó. Không chạy HTTP/DB thật do chưa xác nhận DB test cô lập.

Giai đoạn tiếp theo: **13**.

## Giai đoạn 14: dashboard từ dữ liệu hiện có

Đối chiếu `D:\.NET\LibraryManagement\docs\api-contract.md`, mục Stage 13: backend không có endpoint báo cáo. `GET /api/books`, `/authors`, `/categories` trả toàn bộ danh sách và cho phép anonymous; `/members`, `/borrow-records` trả toàn bộ bản ghi còn lưu và chỉ cho Admin/Librarian. Các request độc lập không tạo snapshot nhất quán. Không dùng một trang phân trang để suy ra tổng toàn cục; các list hiện tại không phân trang ở backend.

Dashboard staff dùng lại các query key sẵn có: `['books','list']`, `['authors','list']`, `['categories','list']`, `['members','staff',userId,sessionVersion]`, `['borrows','staff',userId,sessionVersion]`. Thẻ hiển thị số đầu sách, bản có thể cho mượn, tác giả, thể loại, hồ sơ độc giả và phiếu chưa trả **theo status lưu trong DB**. Mảng rỗng hợp lệ hiển thị 0; khi chưa nhận dữ liệu thì báo đang tải hoặc không khả dụng, không thay bằng 0. Nếu refetch lỗi nhưng còn dữ liệu cũ, UI ghi rõ đó là số liệu cũ. Tổng bản sở hữu và số phiếu quá hạn thực tế hiển thị chưa hỗ trợ. Biểu đồ nhóm `borrowDate` theo tháng ghi trong response, chỉ tính phiếu còn lưu; không gọi đó là lịch sử mượn bất biến hay bảo đảm timezone UTC.

Dashboard User chỉ gọi danh sách sách công khai để đếm đầu sách và bản khả dụng; phiếu mượn cá nhân hiện chưa hỗ trợ vì thiếu endpoint reader-scoped. Guard và hook staff tiếp tục giới hạn request members/borrows theo role. Dashboard không tạo query metrics riêng; mutation sách/tác giả/thể loại/member/phiếu đã invalidate prefix danh sách nguồn tương ứng, nên thẻ và biểu đồ nhận dữ liệu mới sau refetch.

Checkpoint: `npm run build` exit **0**; `npm run lint` exit **0** với 8 warning hiện có; `npm test` exit **0**, 10/10 ca đạt, gồm phân biệt 0 với chưa có dữ liệu và nhóm phiếu theo tháng. `npm run test:browser -- --grep "staff dashboard|reader dashboard|staff can borrow"` báo **3/3 ca đạt** trên dữ liệu giả cho trạng thái 0/chưa hỗ trợ/lỗi và quyền request. `npm run test:browser -- --grep "staff dashboard refreshes"` báo **1/1 ca đạt**: sau khi lập phiếu, số phiếu chưa trả, số bản khả dụng và biểu đồ cập nhật. Runner Playwright không tự thoát sau khi báo kết quả; ngắt thủ công, mỗi lệnh exit **1**. Chưa xác minh HTTP/DB thật do chưa có DB test cô lập; độ chính xác tồn kho và lịch sử bất biến vẫn bị giới hạn bởi backend.

Giai đoạn tiếp theo: **15**.

## Giai đoạn 15: UI dùng chung và kiểm tra tích hợp cuối

Đối chiếu các mục auth, catalog, members, borrows và metrics trong `D:\.NET\LibraryManagement\docs\api-contract.md`. Kiểm tra project không có metadata Git hoặc `AGENTS.md` trong project/các thư mục cha đã kiểm tra, nên không thể xác định diff Git. Không đọc giá trị `.env` hoặc dữ liệu thật. Các route trang đã lazy-load trong `AppRouter`; không thêm lớp lazy-load nữa.

Rà soát primitive: `Modal` dùng `useId` cho `aria-labelledby`, focus vào control đầu tiên khi mở, bẫy Tab, Escape và trả focus về nút trước đó khi đóng. Bỏ thao tác ghi ref trong render để loại cảnh báo `react(refs)`; hành vi được kiểm tra lại qua Playwright. `Input`/`Select` có label, `aria-invalid` và id lỗi riêng từ `useId`; button/select dùng điều khiển bàn phím gốc. Danh sách rộng có vùng cuộn ngang, và menu User mobile được kiểm tra bằng Enter. Stub `BorrowHistoryTable` không có consumer đã được xóa; các primitive/dependency khác được giữ vì còn consumer hoặc chưa có lợi ích rõ khi xóa. `README.md` hiện mô tả cài đặt, cấu trúc, kiểm thử và giới hạn API; `.env.example` vẫn chỉ chứa URL mẫu và public Google client ID. Snapshot `docs/source-inventory.md` được bổ sung các tệp còn lại.

Checkpoint cuối: Node `v24.18.0`, npm `11.16.0`. `npm run build` exit **0**; `npm run lint` exit **0**, còn 7 warning ở routePaths, QueryProvider, Footer, LoanForm và polish.mjs; `npm test` exit **0**, 10/10 ca đạt. `npm run test:browser` báo **19/19 ca đạt** với API giả: login/password, root redirect, quyền staff/User, CRUD sách và validation, catalog/chi tiết, lookup lỗi, mượn/trả và xung đột tồn kho, dashboard, logout, focus modal và menu mobile. Sau khi in ca thứ 19, Playwright vẫn không tự thoát; phải ngắt Ctrl+C, exit **1**. Không xác nhận được tiến trình giữ runner vì truy vấn process command line bị từ chối quyền trong môi trường hiện tại. Đây là lỗi teardown test còn mở.

Kiểm thử HTTP thật chưa thực hiện: backend khởi động tự migrate/seed và chưa có DB/tài khoản test cô lập được xác nhận. Do đó hành vi login, CRUD, loan/return với backend thật còn chưa xác minh; kết quả browser nêu trên chỉ là mô phỏng. Backend vẫn thiếu self-profile, phiếu/lịch sử theo User, tự mượn/gia hạn và reporting server; tồn kho/phiếu có các rủi ro nhất quán đã ghi ở hợp đồng backend. Không có giai đoạn tiếp theo trong chuỗi này.
