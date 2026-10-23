<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/8942102c-7d7b-4db4-9b71-40a61d04fc16

## Run Locally

**Prerequisites:** Bun (backend dùng SQLite tích hợp trong Bun).


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `bun run dev`

## Lộ trình tiếng Anh và góc giáo viên

Phân hệ Tiếng Anh có lộ trình theo độ tuổi → chủ đề → bài học, dùng nguyên 36 bài trong `src/constants/englishData.ts`. Trong khu giáo viên, **Chuẩn bị bài & Cô tự học** cho phép cô nhập tên hoạt động, nhờ AI gợi ý và soạn nội dung có thể chỉnh sửa, không cần đăng nhập email.

- Quy tắc giao diện: [docs/UI-RULES.md](docs/UI-RULES.md)
- Ánh xạ dữ liệu và API: [docs/ENGLISH-DATA-API.md](docs/ENGLISH-DATA-API.md)
- Supabase dùng các biến công khai trong `.env.example`; cấu hình thực tế đặt trong `.env.local`. Nếu chưa đăng nhập, tiến độ bài tiếng Anh vẫn lưu trên thiết bị. Cần `GEMINI_API_KEY` ở máy chủ để dùng các API AI.

## Đọc/ghi dữ liệu

Các màn cảm xúc, tổng kết, cài đặt, chia sẻ/ghi chú gia đình và thư viện ảnh/video đã ghép API backend, lưu riêng theo cookie thiết bị tại `data/app.sqlite`. Khi triển khai, gắn volume bền vững hoặc đặt `KVTT_DATA_DIR`. Server đọc `.env.local` trước `.env`. Xem đối chiếu từng màn và bằng chứng kiểm tra tại [docs/DATA-API-AUDIT.md](docs/DATA-API-AUDIT.md).

## Triển khai Vercel

Repo GitHub đúng: `minhtuan12/khuvuontrithuc`. Project Vercel giữ tên `khu-vuon-tri-thuc`; tên project độc lập với tên repo. Domain dùng cho người học là `khuvuontrithuc.vercel.app`; domain cũ có dấu gạch đã được gỡ. Git integration đã được nối về repo đúng; deploy CLI gửi mã trong workspace, kể cả thay đổi chưa commit.

`vercel.json` build frontend Vite và chuyển API AI/catalog vào `api/index.ts` trên Node. `/api/device/*` giữ backend bền vững Supabase Edge Function `kvtt-device`, không dùng SQLite tạm thời trên Vercel. `server/deviceValidation.ts` là bộ kiểm tra dữ liệu chung giữa SQLite local và Edge Function; khi sửa schema dữ liệu cần deploy lại Edge Function tương ứng. Không thay đổi database trong lần triển khai này.

Production cần `GEMINI_API_KEY`, `APP_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. `GEMINI_CHAT_MODEL` là lựa chọn bổ sung cho chat và soạn bài. Chỉ biến `VITE_*` được gửi ra trình duyệt; giữ khóa Gemini trên server. Không sao chép `VERCEL_OIDC_TOKEN` từ máy local lên production và không commit `.env.local` hoặc `.vercel/`.

Theo yêu cầu đồng bộ code lên GitHub mà không deploy lại, `git.deploymentEnabled` trong `vercel.json` đang là `false`. Các lần push Git sẽ không tự tạo deployment; deploy thủ công qua CLI vẫn dùng được. Chỉ bật lại khi có yêu cầu tự động deploy từ Git.

Trước khi deploy, chạy `bun test`, kiểm tra TypeScript và build. Deploy production với `--skip-domain`, kiểm tra API/lưu dữ liệu trên URL mới rồi dùng `vercel promote` để chuyển domain đến đúng build đã kiểm tra. CLI luôn chỉ rõ project `prj_tm0Mkz9oRVICDfhYb9xPhHmBVOAn` và scope `minhtuan12s-projects`.

- `bun test`: kiểm tra API, đồng bộ và dữ liệu.
- `bun run test:browser`: kiểm tra UI/luồng với Chrome profile kiểm thử riêng (CDP cổng 9222).
- `bun scripts/verify-data-api.mjs`: kiểm tra UI → API → lưu/đọc lại, upload, mất mạng và xung đột. Địa chỉ mặc định `http://127.0.0.1:5180/`, đổi bằng `AUDIT_BASE_URL`.

## Tài khoản giáo viên và kho giáo án

Tài khoản thường có role `learner`; đăng ký công khai không được chọn quyền. Các mục của cô chỉ hiện với role `teacher`, và API kiểm tra lại quyền trong database trên từng yêu cầu. Khách vẫn học bình thường. Không dùng mã PIN.

Tài khoản giáo viên mặc định là `ngant` (Cô Nga). Mật khẩu cấp riêng, không lưu trong mã nguồn. Provision bằng `bun scripts/seed-teacher-account.ts --sqlite=data/app.sqlite` hoặc `--supabase`, truyền mật khẩu qua stdin hay `KVTT_TEACHER_SEED_PASSWORD` trong môi trường riêng. Lệnh không ghi đè tài khoản đã tồn tại khác nguồn seed và không reset mật khẩu khi chạy lại.

- **Thống kê:** dữ liệu thật theo tài khoản học sinh, bài tiếng Anh và kết quả game; không suy luận tính cách hay dựng lịch sử tuần từ dữ liệu chỉ giữ một ngày.
- **Câu hỏi:** gia đình xác nhận gửi mới vào hộp thư cô; có trả lời và rút lại. Ghi chú cũ vẫn riêng tư.
- **Kho giáo án:** tạo/lưu bài AI đã soạn, sửa với kiểm tra phiên bản, xóa và tải Word. Chỉ nhận DOC/DOCX thực sự, tối đa 10 MiB/tệp và 100 MiB/tài khoản. DOCX trích văn bản; DOC giữ file gốc, không sửa định dạng Word trực tiếp. File gốc không đổi khi sửa văn bản trên web.
- **Lưu file:** local dùng SQLite trong `KVTT_DATA_DIR`; production dùng private bucket Supabase `kvtt-teacher-word`. Download luôn qua API xác thực; không có URL công khai. Dọn file chờ/xóa được thực hiện khi khởi tạo upload và bằng `scripts/cleanup-teacher-files.ts --teacher=<uuid>` (thêm `--supabase` và private server config khi cần).
- **AI theo từng bé:** hiện dùng mẫu theo tuổi/mục tiêu có nhãn rõ. Chưa gửi thống kê/câu hỏi của trẻ lên LLM ngoài; cần quyết định nhà cung cấp và điều kiện xử lý dữ liệu trước khi bật cá nhân hóa cloud. AI soạn bài chung ở Chuẩn bị bài vẫn dùng cấu hình Gemini hiện có, chỉ giáo viên gọi được.

Backend teacher và `/api/questions` dùng cùng Edge Function `kvtt-device`; Vercel rewrites giữ cookie cùng origin. `/api/teacher/plan` vẫn ở Vercel và xác minh phiên qua account backend nếu không có service key cục bộ. Không đưa service key hay mật khẩu vào biến `VITE_*`.

Checklist và bằng chứng: [kế hoạch chung](docs/cac-viec-dang-trien-khai.md), [kho giáo án](docs/ke-hoach-kho-giao-an.md), [nhật ký triển khai](docs/teacher-implementation-ledger.md).
