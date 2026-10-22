# Công việc còn cần hoàn tất

Cập nhật: 22/10/2026

Danh sách này ghi lại các phần chưa có đủ bằng chứng để xem là hoàn tất. Các lỗi ứng dụng đã sửa và kiểm tra trong `DATA-API-AUDIT.md` không được liệt kê lại.

## Xác minh với dịch vụ thật

- [ ] Đăng nhập bằng tài khoản Supabase thật và kiểm tra đọc/ghi tiến độ tiếng Anh; thử đổi tài khoản, đăng xuất, tải lại trang và hoàn thành bài trong lúc đồng bộ.
- [ ] Kiểm tra luồng giáo viên với tài khoản thật: tạo kế hoạch, đọc lại, sửa bản nháp, duyệt, và xác nhận bản đã duyệt không bị ghi đè.
- [ ] Chạy các chức năng AI/giọng nói/nhận xét phát âm với Gemini key hợp lệ, xác nhận phản hồi thật và xử lý lỗi giới hạn hoặc gián đoạn dịch vụ.
- [ ] Xác nhận các migration và chính sách RLS cần thiết đã được áp dụng ở dự án Supabase triển khai. Lượt kiểm tra chưa đăng nhập chỉ nhận `401 / 42501`, chưa xác minh CRUD có xác thực.

## Chuẩn bị triển khai backend

- [ ] Cấu hình thư mục SQLite (`KVTT_DATA_DIR`) trên volume bền vững; kiểm tra khởi động lại dịch vụ vẫn giữ dữ liệu.
- [ ] Bật HTTPS và xác nhận cookie thiết bị hoạt động đúng trên domain triển khai.
- [ ] Quyết định và ghi lại quy trình sao lưu, khôi phục, nâng phiên bản schema và thời hạn lưu dữ liệu/tệp tải lên.
- [ ] Xác nhận chính sách dọn dữ liệu và giới hạn dung lượng cho tài liệu, ảnh và video đã tải lên.

## Quyết định phạm vi sản phẩm

- [ ] Nếu phụ huynh cần dùng nhiều thiết bị, thiết kế đăng nhập và đồng bộ dữ liệu phụ huynh theo tài khoản. Hiện dữ liệu các màn phụ huynh gắn với cookie thiết bị; đây chưa phải đồng bộ giữa thiết bị.
- [ ] Nếu bài đăng gia đình cần hiển thị cho nhiều người dùng, triển khai quyền truy cập/chia sẻ trên backend. Hiện bài đăng, lượt thích và bình luận chỉ là dữ liệu riêng của thiết bị.
- [ ] Nếu ghi chú cần gửi tới giáo viên, nối với dịch vụ nhận/gửi tin nhắn và xác nhận trạng thái gửi. Hiện ghi chú chỉ được lưu riêng trên thiết bị.

## Bằng chứng kiểm tra cần cập nhật

- [ ] Chạy lại `scripts/verify-data-api.mjs` và lưu kết quả cuối cùng sau các thay đổi gần nhất.
- [ ] Chạy lại các kiểm tra ứng dụng liên quan trước khi phát hành; ghi rõ lệnh, ngày chạy và kết quả trong `docs/verification/`.
- [ ] Xem xét cảnh báo bundle lớn hơn 500 KB từ lệnh build và tách tải phần phù hợp nếu ảnh hưởng thời gian tải thực tế.

## Tham chiếu

- Chi tiết API, lỗi đã sửa và giới hạn hiện tại: [`DATA-API-AUDIT.md`](./DATA-API-AUDIT.md).
- Kết quả kiểm tra Supabase chưa đăng nhập: [`supabase-readonly-check.json`](./verification/supabase-readonly-check.json).
- Kết quả kiểm tra trình duyệt và API: các tệp `*-results.json` trong [`verification/`](./verification/).
