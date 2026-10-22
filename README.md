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

Phân hệ Tiếng Anh có lộ trình theo độ tuổi → chủ đề → bài học, dùng nguyên 36 bài trong `src/constants/englishData.ts`. Trong khu giáo viên, tab **Chuẩn bị bài & Cô tự học** cho phép cô xem trước bài, ghi lời dẫn và học từ/câu mẫu của đúng bài bé sẽ học.

- Quy tắc giao diện: [docs/UI-RULES.md](docs/UI-RULES.md)
- Ánh xạ dữ liệu và API: [docs/ENGLISH-DATA-API.md](docs/ENGLISH-DATA-API.md)
- Supabase dùng các biến công khai trong `.env.example`; cấu hình thực tế đặt trong `.env.local`. Nếu chưa đăng nhập, tiến độ bài tiếng Anh vẫn lưu trên thiết bị. Cần `GEMINI_API_KEY` ở máy chủ để dùng các API AI.

## Đọc/ghi dữ liệu

Các màn cảm xúc, tổng kết, cài đặt, chia sẻ/ghi chú gia đình và thư viện ảnh/video đã ghép API backend, lưu riêng theo cookie thiết bị tại `data/app.sqlite`. Khi triển khai, gắn volume bền vững hoặc đặt `KVTT_DATA_DIR`. Server đọc `.env.local` trước `.env`. Xem đối chiếu từng màn và bằng chứng kiểm tra tại [docs/DATA-API-AUDIT.md](docs/DATA-API-AUDIT.md).

- `bun test`: kiểm tra API, đồng bộ và dữ liệu.
- `bun run test:browser`: kiểm tra UI/luồng với Chrome profile kiểm thử riêng (CDP cổng 9222).
- `bun scripts/verify-data-api.mjs`: kiểm tra UI → API → lưu/đọc lại, upload, mất mạng và xung đột. Địa chỉ mặc định `http://127.0.0.1:5180/`, đổi bằng `AUDIT_BASE_URL`.
