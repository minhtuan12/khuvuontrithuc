# Nhật ký triển khai khu vực giáo viên

## 2026-10-23 — Bắt đầu

- Yêu cầu: thực hiện hai kế hoạch `cac-viec-dang-trien-khai.md` và `ke-hoach-kho-giao-an.md`, kiểm thử theo từng phần.
- Baseline: thay đổi sửa tiếng cảm xúc và hai docs chưa commit; `premium-audit.json` là file có sẵn, không sửa.
- Ruling: tiếp tục trong workspace người dùng đang mở để giữ các thay đổi chưa commit và các agent chia sẻ cùng mã; không di chuyển/xóa workspace.
- Ruling: không xem được hạn mức token 5 giờ của tài khoản; dùng test tập trung và cập nhật nhật ký để tránh làm lại sau compact.
- Ruling: nội dung cá nhân hóa AI dùng bản mẫu có nguồn thống kê khi chưa xác nhận chế độ cloud xử lý dữ liệu trẻ. Giao diện ghi rõ nguồn mẫu/AI, không giả kết quả AI.
- Ruling: file Word 10 MiB đi trực tiếp qua API Edge đã xác thực bằng rewrite, không qua Vercel Function có giới hạn body nhỏ; storage private. Kiểm tra runtime và browser trước nghiệm thu.
- Phân công: account_backend triển khai role/seed; account_storage triển khai API miền teacher/Word; account_ui triển khai UI; root tích hợp, kiểm thử, cập nhật DB/Edge và review.
- CodSpeed plugin không có repository được kết nối, không có baseline benchmark để so sánh; dùng unit/integration và browser kiểm tra chất lượng, không dựng kết quả hiệu năng giả.
- Chưa push hoặc publish frontend; thực hiện backend/schema cần thiết theo phạm vi người dùng đã giao triển khai, ghi bằng chứng khi xong.

## Role và tài khoản giáo viên

- Migration `teacher_account_roles` đã áp dụng lên Supabase project `sdhbiiljdwpdaikxekrv`; tài khoản cũ nhận learner, bảng account vẫn private.
- Đã tạo `ngant` / “Cô Nga” / role teacher ở local `data/app.sqlite` và Supabase bằng cơ chế seed PBKDF2 hiện có. Truy vấn xác nhận chỉ đọc username/role/full_name; không ghi mật khẩu vào docs/source.
- Test cổng API: guest/learner không đọc được teacher-preparation hoặc gọi AI soạn bài; teacher đọc/lưu được; logout thu hồi quyền; Origin khác bị chặn.
- Vercel AI dùng account-service Edge để kiểm tra phiên nếu không cấu hình service key; không cần sao chép service key sang Vercel.
- Ruling: `source` giáo án là nhãn nguồn do cô khai báo/chỉnh sửa, không là bằng chứng xác thực nội dung AI và không cấp quyền. Cho phép lưu kết quả AI đã chỉnh sửa vào cùng kho; quyền luôn do session/role/owner quyết định.

## Kiểm tra và backend thật — 23/10/2026

- Phiên plugin bị thu hồi giữa chừng; người dùng yêu cầu chạy Supabase CLI và hoàn tất xác thực. Tiếp tục qua CLI chính thức thay vì bỏ phần backend.
- Đã áp dụng `teacher_domain` và ghi migration history; bucket `kvtt-teacher-word` private, file limit 10 MiB. Role accounts và các bảng teacher không cấp quyền cho anon/authenticated (audit trả 0 public table privileges).
- Đã deploy Edge `kvtt-device` chứa role-aware auth, teacher domain, Word validation và private storage. Giữ custom HttpOnly account session nên function verify_jwt=false như backend hiện có; quyền kiểm tra trong service.
- Remote smoke pass: guest401, teacher login, stats, learner403, gửi/trả lời/rút câu hỏi, private Word upload/download, sửa/xóa giáo án và logout401. Bằng chứng `docs/verification/teacher-remote.json`. Tài khoản/câu hỏi fixture remote đã dọn; bản Word test đã xóa bằng API.
- Test mới phát hiện Supabase Storage trả HTTP400 với statusCode404 cho object chưa có; đã thêm test fail→pass và sửa adapter, sau đó remote upload pass.
- Test bảo mật mới fail→pass cho encoded/trailing-slash teacher-preparation và PDF đổi đuôi Word: API từ chối trước khi ghi bytes vào storage.
- Browser local pass: teacher login → vào kho → tạo/lưu giáo án → upload DOCX → có tải file gốc; mobile390px không tràn ngang; tài khoản learner không thấy mục cô và API trả403. Không ghi nhận runtime JavaScript errors.
- Kiểm tra cuối: `bun test` **107 pass, 0 fail, 1772 assertions, 27 files**; TypeScript noEmit và Vite production build thành công. Build còn cảnh báo chunk lớn sẵn có.
- `.env.local` chỉ được bỏ UTF-8 BOM để CLI đọc được, không thay giá trị secret. Không in/commit mật khẩu hoặc service key.
- Chưa commit/push/publish frontend Vercel. Backend Supabase đã cập nhật; frontend mới đang trong workspace. Auto deploy Git vẫn false.
- AI cá nhân hóa cloud giữ tắt; mẫu theo tuổi/mục tiêu có thể sửa/lưu và AI soạn bài chung vẫn có cổng teacher. Retention cuối cùng chưa được chốt; không tự di chuyển draft khách/học sinh.

### Sai khác có chủ ý so với tên file trong kế hoạch

API teacher dùng `TeacherService` + handler Fetch trung lập + hai store, dùng chung cho Express và Deno; tránh hai bản xử lý hành vi khác nhau. Word được chuyển cùng origin tới Edge bằng Vercel rewrite, không gửi qua Vercel Function 4MB. Local file bytes lưu SQLite private thay cho thư mục rời; production vẫn Supabase Storage private như yêu cầu.

## Phát hành Vercel — 23/10/2026

- Theo yêu cầu “deploy đi”, đã deploy workspace và promote production `dpl_FrAkThBsUsdJygenwHgVDPD2eHdb` lên `https://khuvuontrithuc.vercel.app`.
- Trước deploy: 107 test pass, TypeScript pass; Vercel build READY. Kiểm tra catalog200 và stats guest401 trên deployment riêng trước promote.
- Sau promote: 14 kiểm tra pass gồm bundle teacher mới, login ngant, stats/library/questions200, API soạn bài xác minh phiên teacher, guest401, logout thu hồi, domain cũ404. Xem `docs/verification/teacher-vercel-release.json`.
- Không commit/push trong lượt deploy. Auto deploy Git vẫn tắt. AI cá nhân hóa cloud vẫn giữ trạng thái tắt như đã trao đổi.
