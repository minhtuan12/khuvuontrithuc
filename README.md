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

Repo GitHub đúng: `minhtuan12/khuvuontrithuc`. Project Vercel giữ tên `khu-vuon-tri-thuc`; tên project độc lập với tên repo. Các domain `khuvuontrithuc.vercel.app` và `khu-vuon-tri-thuc.vercel.app` thuộc cùng project. Git integration đã được nối về repo đúng; deploy CLI gửi mã trong workspace, kể cả thay đổi chưa commit.

`vercel.json` build frontend Vite và chuyển API AI/catalog vào `api/index.ts` trên Node. `/api/device/*` giữ backend bền vững Supabase Edge Function `kvtt-device`, không dùng SQLite tạm thời trên Vercel. `server/deviceValidation.ts` là bộ kiểm tra dữ liệu chung giữa SQLite local và Edge Function; khi sửa schema dữ liệu cần deploy lại Edge Function tương ứng. Không thay đổi database trong lần triển khai này.

Production cần `GEMINI_API_KEY`, `APP_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. `GEMINI_CHAT_MODEL` là lựa chọn bổ sung cho chat và soạn bài. Chỉ biến `VITE_*` được gửi ra trình duyệt; giữ khóa Gemini trên server. Không sao chép `VERCEL_OIDC_TOKEN` từ máy local lên production và không commit `.env.local` hoặc `.vercel/`.

Theo yêu cầu đồng bộ code lên GitHub mà không deploy lại, `git.deploymentEnabled` trong `vercel.json` đang là `false`. Các lần push Git sẽ không tự tạo deployment; deploy thủ công qua CLI vẫn dùng được. Chỉ bật lại khi có yêu cầu tự động deploy từ Git.

Trước khi deploy, chạy `bun test`, kiểm tra TypeScript và build. Deploy production với `--skip-domain`, kiểm tra API/lưu dữ liệu trên URL mới rồi dùng `vercel promote` để chuyển domain đến đúng build đã kiểm tra. CLI luôn chỉ rõ project `prj_tm0Mkz9oRVICDfhYb9xPhHmBVOAn` và scope `minhtuan12s-projects`.

- `bun test`: kiểm tra API, đồng bộ và dữ liệu.
- `bun run test:browser`: kiểm tra UI/luồng với Chrome profile kiểm thử riêng (CDP cổng 9222).
- `bun scripts/verify-data-api.mjs`: kiểm tra UI → API → lưu/đọc lại, upload, mất mạng và xung đột. Địa chỉ mặc định `http://127.0.0.1:5180/`, đổi bằng `AUDIT_BASE_URL`.
