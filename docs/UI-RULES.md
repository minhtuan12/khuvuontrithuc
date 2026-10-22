# Quy tắc giao diện hiện tại — Khu Vườn Tri Thức

Tài liệu này ghi lại giao diện đang dùng trong dự án `D:\khu-vuon-tri-thuc` để các màn Lộ trình và Cô tự học mới hòa vào website hiện tại. Nguồn đối chiếu: `src/index.css`, `src/App.tsx`, `src/components/EnglishModule.tsx`, `src/components/EnglishGamesPlayground.tsx` và `index.html`. Các giá trị dưới đây là quy ước cho phần thêm mới; không tự động đổi giao diện bài học cũ.

## Nhận diện và cảm giác

- Chủ đề: vườn tri thức mầm non, vui tươi, nhiều khoảng trắng, hình minh họa và emoji quen thuộc. Không dùng phong cách quản trị doanh nghiệp cho màn của bé.
- Logo trường: `/school-logo.jpg`; giữ nguyên tỉ lệ, dùng `object-fit: contain` hoặc khung tròn, không vẽ lại.
- Nền chung: xanh trời nhạt `#BAE6FD`, chấm trắng đường kính khoảng 5 px lặp trên lưới 26 px; các vùng nội dung dùng nền trắng hoặc pastel sáng.
- Màn tiếng Anh dùng sắc chàm/xanh trời cho bé; khu giáo viên dùng hồng/rose/tím; màu lục dùng cho thành công/vườn cây; vàng/cam để tạo điểm nhấn và phần thưởng.

## Màu và vai trò

| Vai trò | Màu đã thấy trong mã | Cách dùng cho phần mới |
| --- | --- | --- |
| Nền trang | `#BAE6FD`, trắng `#FFFFFF`, `sky-50`, `emerald-50` | Giữ nền sáng; nội dung chính trên thẻ trắng. |
| Chữ chính | `slate-800` / `#1e293b` | Tiêu đề và văn bản dài. |
| Chữ phụ | `slate-500`, `slate-600` | Mô tả, chú thích; kiểm tra tương phản ở cỡ chữ nhỏ. |
| Bé / Tiếng Anh | `indigo-500`, `indigo-600`, `sky-500`, `sky-600` | Tab tuổi, hành động chính, đường lộ trình. |
| Cô giáo | `pink-500`, `rose-500`, `purple-600` | Header và tab khu giáo viên, dùng tiết chế ở phần đọc dài. |
| Hoàn thành | `emerald-500`, `#059669`, `#047857` | Dấu hoàn thành, xác nhận lưu. |
| Gợi ý / phần thưởng | `amber-500`, `orange-500`, `yellow-300` | Nghe chậm, sao, nhắc nhẹ. |
| Viền mềm | `indigo-100`, `sky-100`, `slate-200` | Thẻ, bộ lọc, nhóm điều khiển. |

Các gradient đang dùng: `indigo-500 → sky-500` cho lựa chọn tuổi, `indigo-600 → sky-600` cho trạng thái nghe, `amber-500 → orange-500 → pink-500` cho banner bé, `pink-500 → rose-500 → purple-600` cho giáo viên. Phần mới tái dùng các tổ hợp này trước khi đặt màu khác.

## Chữ và nhịp

- Chữ nội dung: **Nunito**. Tiêu đề và nhãn vui: **Baloo 2**, trọng lượng 800–900. Font được nạp trong `index.html` và khai báo ở `src/index.css`.
- Tiêu đề trang thường `text-2xl` đến `text-4xl`; tiêu đề thẻ `text-lg` đến `text-xl`; nội dung đọc `text-sm` đến `text-base`. Tránh dùng `text-[10px]` cho hướng dẫn hoặc nút mới dù mã cũ có vài chỗ như vậy.
- Khoảng cách: ưu tiên bội số 4/8 px qua Tailwind (`gap-2/3/4/6`, `p-4/5/6/8`); chiều rộng nội dung `max-w-7xl`, lề ngang `px-4 sm:px-6`.
- Tiêu đề trang trí 3D (`pixar-title-3d`, các lớp `pixar-heading-*`) chỉ dành cho khoảnh khắc nhận diện; không dùng cho đoạn giải thích từ vựng của cô.

## Thành phần và bố cục

- Thẻ bài học: nền trắng, `rounded-3xl`, viền sáng, bóng mềm, emoji/hình lớn, tên tiếng Việt nổi bật, tên tiếng Anh phụ, mô tả ngắn, số từ và hành động “Học ngay”. Màn hiện có dùng lưới 1 cột trên điện thoại, 2 cột từ `sm`, 3 cột từ `lg`.
- Nút chính: `rounded-2xl` hoặc viên thuốc, chữ đậm; trạng thái chọn có nền chàm/xanh và chữ trắng. Tab phụ giáo viên dùng viền dưới và nền hồng nhạt khi chọn.
- Banner: bo `rounded-3xl`, gradient theo khu vực, nội dung đặt trên lớp màu đủ tương phản. Không đặt chữ trong ảnh AI; logo, nhãn và điều khiển phải là HTML.
- Lộ trình mới: đầu tiên chọn tuổi, sau đó chọn chủ đề, cuối cùng mở **bài học gốc**. Mỗi bài gốc có một ID duy nhất; không nhân bản nội dung. Thứ tự bài trong từng chủ đề là thứ tự dữ liệu hiện có.
- Tab “Cô tự học”: đặt bên trong khu giáo viên, cạnh các tab nội dung hiện có. Chọn tuổi và chủ đề, xem từ, nghĩa, phiên âm, câu ví dụ và nghe phát âm; các mục này đọc từ dữ liệu bài học của bé. Cho cô xem bài bé sẽ học từ cùng thẻ.

## Tương tác, thiết bị và trạng thái

- Điện thoại trước: bộ lọc được cuộn ngang khi hẹp, thẻ tự xếp một cột, không cắt chữ quan trọng. Mục tương tác mới nên có vùng chạm tối thiểu 44 × 44 px.
- Có nhãn văn bản cho icon/emoji; nút `button` thật và liên kết `a` thật. Hiển thị `focus-visible` rõ; không chỉ đổi màu để biểu thị bài đã hoàn thành.
- Âm thanh chỉ phát sau thao tác người dùng; có nút nghe lại. Nếu giọng hoặc micro không có, hiện thông báo và nội dung chữ vẫn đọc được.
- Trạng thái cần thiết cho phần mới: chưa chọn tuổi/chủ đề, đang tải, không có bài, lưu tại máy, đồng bộ thành công, đồng bộ lỗi và hoàn thành. Phần thưởng phản ánh việc tham gia, không tự khẳng định trẻ thành thạo tiếng Anh.
- Chuyển động hiện tại dùng `motion/react`, hover nâng thẻ và nhấn thu nhỏ nhẹ. Các màn mới hỗ trợ `prefers-reduced-motion`; không làm chuyển động liên tục ở nội dung cô cần đọc.

## Quy tắc dùng tài sản hình ảnh

- Ưu tiên logo trường và tài sản đã có trong `public/assets/theme_ui`, `src/assets/images`. Chỉ tạo hình mới khi màn thật sự thiếu hình có ý nghĩa.
- Nếu dùng AI Graphic Design để tạo ảnh mới, lưu ảnh như tài sản riêng và không đưa tên bài, đáp án, nút hoặc chữ giải thích vào ảnh. Giữ các nội dung đó trong HTML để thay đổi theo dữ liệu và hỗ trợ tiếp cận.

## Điểm cần kiểm tra khi thêm màn

1. Màu, chữ, bo góc, lưới và logo khớp các màn tiếng Anh hiện có.
2. Bài học mới trong lộ trình mở đúng ID bài gốc; đổi tên lộ trình không đổi `id`, từ, câu, trò chơi hoặc đáp án.
3. Bản giải thích cho cô bao phủ cả ba tuổi và mọi chủ đề, lấy từ cùng dữ liệu nguồn.
4. Bàn phím, focus, mobile 390 px, trạng thái không có dữ liệu, thiếu giọng và giảm chuyển động đều dùng được.
