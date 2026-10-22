# Đối chiếu màn hình, API và nơi lưu dữ liệu

Ngày kiểm tra: 22/10/2026. Lượt kiểm tra trước chủ yếu xác minh UI và nhánh lỗi; chưa phải bằng chứng mọi màn đã ghép backend. Lượt này bổ sung các kết nối thiếu và kiểm tra đọc/ghi thực.

| Màn/chức năng | Đọc và ghi | Nơi lưu / phạm vi | Bằng chứng |
|---|---|---|---|
| Check-in và nhật ký cảm xúc | `GET/PUT /api/device/documents/emotions` | SQLite, riêng theo cookie thiết bị | Chọn trên UI → đọc API → xóa cache → tải lại nhật ký |
| Sao, huy hiệu, tổng kết học tập | `GET/PUT /api/device/documents/stars`, `badges`, `learning-stats` | SQLite, riêng theo thiết bị | Hoàn thành trò chơi → thưởng/tổng kết; API CAS và lưu sau khởi động lại DB |
| Thời gian học, cài đặt | `GET/PUT /api/device/documents/study-time`, `settings` | SQLite, riêng theo thiết bị | Chọn giới hạn trên UI → đọc API → tải lại không có localStorage |
| Chia sẻ gia đình, thích, bình luận | `GET/PUT /api/device/documents/family-posts` | Nội dung riêng của thiết bị; chưa đăng ra cộng đồng công khai | UI ghi cả ba → API xác nhận → xóa cache → đọc lại |
| Ghi chú trao đổi cùng cô | `GET/PUT /api/device/documents/teacher-notes` | Ghi chú riêng; không phải tin nhắn đã gửi giáo viên | UI → ghi/đọc API; mất mạng và thử lại; lỗi phiên bản 409 và đối chiếu bản mới |
| Kho ảnh/video “Ghi nhận kết quả” | `GET/POST /api/device/uploads`, `GET /api/device/uploads/:id` | Tệp và metadata thật trong SQLite; cookie bảo vệ đọc tệp | Tải ảnh qua input thật → tải bytes → xóa cache/tải lại vẫn hiện ảnh; thiết bị khác không đọc được |
| Sao luyện nói/trò chơi tiếng Anh | `GET/PUT /api/device/documents/english-stars`, `game-stars` | SQLite, bản dự phòng trên trình duyệt | Hook/controller đọc, CAS ghi, lỗi/retry/khôi phục; bỏ 12 sao giả mặc định |
| Tiến độ tiếng Anh khi chưa đăng nhập | `GET/PUT /api/device/documents/english-progress` | SQLite theo thiết bị; bản dự phòng giữ ID bài gốc | Kiểm tra HTTP guest, lỗi ghi, 409 → đối chiếu → ghi tiếp; kiểm tra trò chơi trên Chrome |
| Tiến độ tiếng Anh khi đăng nhập | Supabase `GET english_lesson_progress`, `POST rpc/save_current_english_progress` | Tài khoản Supabase và RLS | Kiểm thử hợp đồng HTTP, mất mạng, refresh, đăng xuất/chuyển tài khoản và hoàn thành trong lúc tải |
| Chuẩn bị bài giáo viên | Supabase `GET/POST/PATCH teacher_english_plans` | Tài khoản giáo viên; giữ bất biến bản đã duyệt | Kiểm thử tạo → đọc → sửa nháp → duyệt, API từ chối, phản hồi rỗng, chọn bản nháp cũ |
| Trợ lý AI/giọng nói/nhận xét phát âm | `POST /api/assistant/chat`, `/api/assistant/voice`, `/api/pronunciation/feedback` | Backend gọi Gemini; không tự nhận là đã lưu lịch sử hội thoại | HTTP success với provider kiểm thử; body sai, MIME thực, phản hồi sai, 429/502/503, UI phục hồi sau lỗi |
| Nội dung bài, thực đơn gợi ý | Catalog cục bộ chuẩn; `/api/english/catalog` và `/lesson/:id` là API đọc cùng nguồn | Nội dung tĩnh, không có chức năng biên tập backend trong UI | Kiểm tra toàn bộ ID, tuổi, đáp án, API ba lứa tuổi và bài không tồn tại |

## Những lỗi đã sửa

- Server không đọc `.env.local` như README hướng dẫn. Nay nạp file này trước `.env`, vẫn ưu tiên biến môi trường đã được cấp khi chạy.
- Các màn phụ huynh, cảm xúc, thống kê, cài đặt và kho tệp trước đây chưa có API lưu/đọc.
- URL tạm `blob:` được báo là đã tải tệp thành công dù chưa gửi lên server; nay chỉ báo thành công sau `201` và dùng URL API bền vững.
- Đồng bộ tiếng Anh có thể nhận phản hồi tài khoản A sau khi đã chuyển sang B, hồi sinh phiên đã đăng xuất hoặc ghi đè lần hoàn thành mới. Nay chặn phản hồi cũ và gộp lại cache sau I/O.
- Chọn bản nháp giáo viên cũ có thể sửa bản mới nhất thay vì bản được chọn; nay dùng đúng ID được chọn.
- AI chưa kiểm tra kiểu dữ liệu đầy đủ; phát âm luôn gắn WebM dù trình duyệt ghi MP4. Nay xác thực hợp đồng và gửi MIME thực.
- Đọc lần đầu rồi sửa nhanh có thể ghi đè dữ liệu server bằng giá trị mặc định; nay chặn bằng phiên bản CAS và có hành động tải bản đã lưu, giữ backup bản nháp.
- Nhiều GET đầu tiên có thể nhận các cookie thiết bị khác nhau; thêm bootstrap singleflight trước các truy vấn song song.

## Vận hành và giới hạn

- Chạy bằng **Bun** (`bun run dev`), vì backend dùng SQLite có sẵn trong Bun. File mặc định `data/app.sqlite`, có thể đổi bằng `KVTT_DATA_DIR`. Khi triển khai cần gắn volume bền vững cho thư mục này; xóa DB hoặc mất cookie sẽ không tự phục hồi danh tính thiết bị. Không dùng một hàng dữ liệu chung cho mọi khách.
- Những dữ liệu trước đây riêng trên thiết bị vẫn giữ phạm vi đó. Đây không phải tính năng đồng bộ toàn bộ dữ liệu phụ huynh giữa nhiều thiết bị/tài khoản. Supabase tiếp tục giữ dữ liệu tiếng Anh của tài khoản.
- API từ chối ghi khi phiên bản cũ (`409`), giới hạn dữ liệu/loại tệp và tách quyền đọc giữa hai thiết bị. Mất mạng giữ bản dự phòng và hiện lỗi; chỉ báo đã lưu sau phản hồi backend.
- Kiểm tra chỉ đọc Supabase thực tế đã nhận `401`, mã `42501`, ở cả hai endpoint khi không đăng nhập. Điều này xác minh phản hồi phân quyền, **chưa chứng nhận CRUD bằng tài khoản thật hoặc toàn bộ migration đã triển khai**. Bằng chứng trong `docs/verification/supabase-readonly-check.json`.
- Không có Gemini key hợp lệ trong cấu hình hiện tại. Nhánh thành công dùng provider kiểm thử xác định; không gửi yêu cầu AI có tính phí hoặc tự tạo tài khoản thật để kiểm tra.
- Các script trình duyệt sử dụng Chrome profile kiểm thử riêng. Không chạy script xóa cache/cookie trên profile làm việc hằng ngày.
