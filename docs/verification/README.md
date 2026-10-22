# Kiểm tra giao diện và luồng ứng dụng — 22/10/2026

Phạm vi: các màn đang được gắn trong `App.tsx`, phần tiếng Anh, toán, trợ lý, phụ huynh, check-in và các danh mục hoạt động. Các màn prototype không được gắn vào ứng dụng không được coi là tính năng đã hoàn thiện.

Kết quả đã chạy: 19 kiểm thử tự động, 43 xác nhận trên Chrome và 5 kiểm tra phản hồi API đều đạt. TypeScript và build thành công; kiểm tra UI tĩnh strict không còn lỗi. Không có exception JavaScript chưa xử lý trong các kịch bản trình duyệt.

## Chạy lại

- `bun test`: kiểm tra danh mục bài học, đáp án, dữ liệu lưu hỏng, điều hướng tìm kiếm, khóa trả lời nhanh và vòng đời thu âm.
- `bun node_modules/typescript/bin/tsc --noEmit`: kiểm tra TypeScript.
- `bun node_modules/vite/bin/vite.js build`: tạo bản production.
- `bun run test:browser`: hai kịch bản Chrome và kiểm tra API lỗi. Cần Chrome headless tại cổng CDP 9222, profile kiểm thử riêng và server bản build tại `http://127.0.0.1:5174/`. Có thể đặt `AUDIT_BASE_URL` để đổi địa chỉ. Server kiểm thử không cấu hình Gemini key để kiểm tra trạng thái 503.

Kịch bản đầu xóa localStorage **trong profile kiểm thử** để có trạng thái ban đầu xác định; không trỏ CDP tới trình duyệt làm việc hằng ngày. Các thao tác nút dùng sự kiện chuột Chrome và chờ mục tiêu không bị lớp phủ che. Chỉ bài kiểm tra bấm nhanh cố tình gọi nhiều lần trong cùng lượt sự kiện.

## Bằng chứng

- `browser-flow-results.json`: bố cục mobile/desktop, bàn phím/Escape/focus, check-in → nhật ký, lưu chia sẻ/bình luận/ghi chú, cài đặt/thời gian học, chuyển tab, tìm kiếm → trò toán → thưởng, dữ liệu sau tải lại.
- `learning-flow-results.json`: đường vào bài học của 5 lĩnh vực, báo cáo số liệu thực, lỗi quyền micro và thử lại, hoàn thành bài tiếng Anh → tổng kết phụ huynh, AI không khả dụng, màn 360px và màn thấp.
- `service-results.json`: dữ liệu ghi âm sai, thiếu cấu hình AI, danh mục ba lứa tuổi và bài không tồn tại.
- `keyboard-results.json`: giữ focus trong hộp check-in qua chín lần Tab và tôn trọng tùy chọn giảm chuyển động.
- `premium-audit.json`: kiểm tra tĩnh quyền sở hữu UI và các lỗi tương tác phổ biến.
- Ảnh giao diện nằm trong `../previews/`.

## Giới hạn xác minh

Không sử dụng tài khoản thật hay gửi ghi chú tới giáo viên/cộng đồng bên ngoài. Chia sẻ và ghi chú mới chỉ được lưu trên thiết bị và giao diện nói rõ điều này. Đăng nhập/đồng bộ Supabase và phản hồi AI thật cần cấu hình dịch vụ cùng tài khoản hợp lệ; đã kiểm tra dữ liệu cache và nhánh lỗi, chưa chứng nhận kết quả dịch vụ trực tiếp. YouTube, Wordwall và audio bên ngoài vẫn phụ thuộc nhà cung cấp/mạng. Không đánh giá nội dung của từng video hoặc mọi câu trả lời mô hình AI.

Bản build còn cảnh báo kích thước bundle lớn hơn 500kB; không phải lỗi build. Workspace này không có Git nên không tạo commit/PR.
