# Ghép dữ liệu tiếng Anh hiện tại với Supabase dự án nguồn

## Nguồn dữ liệu và ID

Website hiện tại là nguồn chuẩn của nội dung tiếng Anh: `src/constants/englishData.ts` có 14 bài cho tuổi 3–4, 12 bài cho tuổi 4–5 và 10 bài cho tuổi 5–6. Mỗi `EnglishLessonTheme` có `id`, `categoryKey`, `vocabulary`, `samplePhrases` và `interactiveGame`. `src/lib/englishCatalog.ts` chỉ nhóm lại thành **tuổi → chủ đề → bài học**; không sao chép hoặc viết lại nội dung bài. Các bài không có `categoryKey` trong tám chủ đề trọng tâm được nhóm theo ID/tên bài hiện có (chào hỏi, bản thân, số và hình dạng, v.v.), để không bỏ sót bài nào.

Project Supabase của dự án nguồn: `sdhbiiljdwpdaikxekrv`. Dự án nguồn dùng `src/lib/content.ts` và chỉ có 12 từ theo ba adventure (`garden`, `colors`, `train`). `learning_progress` và `save_learning_progress` của nó chỉ chấp nhận adventure/`path-v1-*` cũ. Không gửi ID như `greetings-34` vào API đó, vì schema sẽ từ chối. Các bảng và RPC cũ được giữ nguyên để không làm hỏng tiến độ trước đây.

## Model mới trong cùng Supabase

| Mục | Model/API | Liên hệ với dữ liệu hiện tại |
| --- | --- | --- |
| Danh mục bài | `ENGLISH_LESSONS_BY_AGE`, `getEnglishRoadmap`, `findEnglishLesson` | Đọc trực tiếp từ `ENGLISH_DATA_3_4`, `ENGLISH_DATA_4_5`, `ENGLISH_DATA_5_6`. |
| ID bài trong database | `public.english_catalog_lessons` | 36 cặp `(lesson_id, age_band)` từ dữ liệu hiện tại; khóa ngoại chặn ghi tiến độ hoặc lời dẫn vào ID/tuổi không tồn tại. Nội dung từ/câu/trò chơi vẫn ở mã hiện tại. |
| API đọc danh mục | `GET /api/english/catalog`, `GET /api/english/lesson/:id` | Trả dữ liệu bài hiện tại theo hợp đồng `version: 1`; client của dự án nguồn có thể đọc mà không phải dùng 12 ID cũ. |
| Tiến độ bài | `public.english_lesson_progress` | `lesson_id` là ID gốc; `age_band` là nhóm tuổi gốc. `opened_at` và `completed_at` ghi việc mở/chơi xong, không chứng nhận thành thạo. |
| Ghi tiến độ | `public.save_current_english_progress` | RPC gộp theo `(owner_id, lesson_id)` và giữ trạng thái hoàn thành khi đồng bộ nhiều máy. |
| Bài cô chuẩn bị | `public.teacher_english_plans` | Tham chiếu `lesson_id`; chỉ lưu lời dẫn/ghi chú riêng của cô và trạng thái `draft`/`approved`, không nhân bản từ vựng hoặc trò chơi. Bản đã duyệt không sửa/xóa; sửa tiếp thì tạo bản mới. |
| Tài khoản | Supabase Auth email/mật khẩu | Client dùng `auth/v1/token`, `auth/v1/signup`, refresh token; mọi yêu cầu dữ liệu dùng access token của tài khoản. |

Tất cả bảng mới bật RLS. Hai bảng dữ liệu riêng và RPC tiến độ không cấp quyền cho `anon`; `authenticated` chỉ đọc/ghi các dòng có `owner_id = auth.uid()`. Bảng danh mục ID cho phép đọc công khai, không cho sửa từ client. Chỉ dùng publishable key ở trình duyệt, không có service key. Migration áp dụng theo thứ tự các file trong `supabase/migrations/20261022150000_current_english_catalog.sql` đến `20261022150300_validate_current_english_catalog.sql`.

## Luồng dữ liệu

1. Bé mở một bài: ứng dụng kiểm tra ID qua `findEnglishLesson`, ghi lần mở vào bộ nhớ thiết bị, rồi gọi RPC nếu đã đăng nhập.
2. Bé chơi hết trò hỏi đáp: ghi `completed_at`. Sao/thống kê cũ của ứng dụng vẫn hoạt động độc lập; lộ trình mới không tự biến sao thành chứng nhận học lực.
3. Không có mạng hoặc chưa đăng nhập: bé vẫn mở bài và lưu trên thiết bị. Mỗi tài khoản có khóa lưu cục bộ riêng, tránh trộn dữ liệu giữa các tài khoản.
4. Sau khi đăng nhập, ứng dụng đồng bộ tiến độ của **tài khoản đó** với Supabase; dữ liệu khách không tự chuyển vào tài khoản người lớn.
5. Giáo viên chọn bài gốc, xem trước từ/câu/trò chơi, viết lời dẫn rồi lưu nháp hoặc duyệt. Tab “Cô tự học” đọc cùng `EnglishLessonTheme`, nên luôn bao phủ mọi bài mà bé thấy.

## API hiện có của hai dự án

- `server.ts` của website hiện tại có `POST /api/assistant/chat` dùng Gemini cho trợ lý hội thoại. API này không phải API tạo bài học và không được dùng để thay đổi từ vựng/đáp án của lộ trình.
- `src/lib/ai.functions.ts` của dự án nguồn tạo gợi ý câu chuyện/nhiệm vụ từ 12 từ trong `src/lib/content.ts`, có xác thực và hạn mức. Nó không nhận `EnglishLessonTheme` của website hiện tại. Nếu sau này thêm AI vào khâu cô chuẩn bị 36 bài, cần endpoint riêng nhận `lesson_id`, kiểm tra qua danh mục 36 bài trên server, giới hạn lượt theo tài khoản và buộc cô duyệt trước khi dùng. Không nối thẳng hai model bằng cách đổi tên trường.
- `public.approved_experiences` của dự án nguồn lưu các bài phiêu lưu sáu chặng đã duyệt; `teacher_english_plans` lưu lời dẫn cho bài tiếng Anh hiện tại. Hai loại bản duyệt có cấu trúc và mục đích khác nhau.

## Cách cập nhật mã dự án nguồn

Thư mục nguồn `D:\khu-vuon-tri-thuc-source\khu-vuon-tri-thuc-source` ở ngoài vùng được phép ghi của phiên làm việc này, vì vậy thay đổi mã tương ứng ở đó **chưa được áp dụng**. Khi cập nhật dự án nguồn:

1. Thêm client đọc `GET /api/english/catalog` từ website hiện tại và kiểm tra `version === 1`; dùng `lesson.id` làm khóa duy nhất, `age` để nhóm theo tuổi và `categoryKey` để nhóm chủ đề. Không đổi dữ liệu trả về trước khi đưa vào bài học.
2. Giữ `/roadmap` cũ cho 12 từ `path-v1-*` hoặc chuyển UI sang danh mục 36 bài; không gửi `lesson.id` mới tới `save_learning_progress` cũ. Ghi tiến độ mới qua `save_current_english_progress` hoặc đọc bảng `english_lesson_progress` bằng JWT người dùng.
3. Khu giáo viên nguồn đọc `teacher_english_plans` theo `lesson_id` của catalog mới. Tab “Cô tự học” đọc `vocabulary` và `samplePhrases` từ catalog, không dùng một bảng từ riêng.
4. Những đề xuất AI của nguồn vẫn chỉ được phép dùng 12 từ trong `src/lib/content.ts`. Nếu mở rộng AI sang 36 bài, sửa `src/lib/plan.ts`, `src/lib/ai.functions.ts` và hàm duyệt SQL cùng lúc để xác thực theo `EnglishLessonTheme`; không nới lỏng validation cũ một cách tổng quát.

## Vận hành và giới hạn đã kiểm tra

- `.env.local` chứa URL và **publishable key** của project, được `.gitignore` loại trừ. `.env.example` chỉ ghi tên biến để triển khai nơi khác.
- Đã kiểm tra Supabase có hai bảng dữ liệu riêng mới, RLS bật, quyền `anon` trên hai bảng đó và RPC tiến độ là `false`, quyền `authenticated` là `true`. Bảng danh mục ID chỉ công khai quyền đọc.
- Chưa thử đăng nhập bằng tài khoản người dùng thật và chưa kiểm thử đồng bộ qua hai trình duyệt. Cần nghiệm thu luồng này trên môi trường chạy thực tế trước khi dùng dữ liệu lớp học.
