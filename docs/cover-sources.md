# Nguồn ảnh bìa

Kiểm tra `GET /api/books` tại máy địa phương ngày 2026-11-17: bốn bản ghi hiện có đều thiếu ISBN, nhà xuất bản, ngôn ngữ và mã ấn bản. Ảnh bên dưới là bìa sách thật do Open Library cung cấp qua URL hiển thị công khai. Không bản ghi nào đủ thông tin để khẳng định đúng ấn bản, vì vậy giao diện gắn nhãn **Ảnh minh họa**. Nội dung tên sách, tác giả, năm và số bản luôn lấy từ API.

| Tên trong danh mục | Bìa được dùng và lý do | URL ảnh | Nguồn bản sách |
|---|---|---|---|
| Doraemon | *Doraemon Volume 1*, Fujiko F. Fujio, 1974, ISBN 4091400019. Cùng bộ truyện; danh mục không ghi số tập. | https://covers.openlibrary.org/b/olid/OL25651178M-L.jpg?default=false | https://openlibrary.org/books/OL25651178M |
| Aladin và 40 tên cướp | *Tales from the Arabian Nights*, Donna Jo Napoli, 2016, ISBN 9781426325403. Tuyển tập có cả Aladdin và Ali Baba cùng bốn mươi tên cướp; không phải cùng cuốn. | https://covers.openlibrary.org/b/olid/OL27217641M-L.jpg?default=false | https://openlibrary.org/books/OL27217641M |
| Conan | *Case Closed, Vol. 01*, Gosho Aoyama, 2004, ISBN 1591163277. Cùng bộ Conan; tác giả trong danh mục là “Fujiko” và không có số tập. | https://covers.openlibrary.org/b/olid/OL23028052M-L.jpg?default=false | https://openlibrary.org/books/OL23028052M |
| Clean Architecture | *Clean Architecture*, Robert C. Martin, Pearson, ấn bản 1 tiếng Anh, 2017, ISBN 9780134494166. Cùng tác phẩm; năm trong danh mục là 2000. | https://covers.openlibrary.org/b/olid/OL31838215M-L.jpg?default=false | https://openlibrary.org/books/OL31838215M |

Các URL ảnh đã trả về `200 image/jpeg` khi kiểm tra. [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers) cho phép hiển thị bìa trên trang công khai bằng URL `covers.openlibrary.org` và khuyến khích dẫn về trang sách. Ảnh không được tải về hay lưu trong dự án. Nếu URL hỏng hoặc không có ảnh, giao diện hiện ảnh thay thế theo tên sách.
