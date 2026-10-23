# Khu vườn tri thức — Implementation Plan: Khu vực dành cho cô

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cô xem tiến độ từng tài khoản đã đăng ký, tạo bản nháp giáo án/bài tập phù hợp và đọc câu hỏi được chủ động gửi từ Góc tâm sự.

**Architecture:** Các chức năng của cô dùng phiên đăng nhập tài khoản hiện có và quyền `teacher` do máy chủ quản lý, thay hoàn toàn thiết kế PIN. API máy chủ tổng hợp dữ liệu tài khoản; trình duyệt không truy cập bảng riêng tư bằng service key. SQLite phục vụ local và Supabase phục vụ production phải có cùng hợp đồng.

**Tech Stack:** React 19, TypeScript, Express/Bun, SQLite, Supabase Edge Functions/Postgres, Vercel; tận dụng giao diện và dịch vụ AI hiện có sau khi xác nhận điều kiện dữ liệu.

**Spec:** Phần “Thiết kế và quyết định” trong chính file này; yêu cầu người dùng ngày 23/10/2026. Đây là một file theo dõi chung cho cả hai tính năng.

## Global Constraints

- Tuân thủ `DESIGN.md`, `UX-CONTRACT.md`; tiếng Việt, phong cách khu vườn hiện tại, responsive và thao tác bàn phím.
- API/UI đã được triển khai trong workspace; role, tài khoản giáo viên, schema và Edge API đã áp dụng trên Supabase. Frontend mới chưa publish Vercel; xem nhật ký kiểm tra cuối file.
- Chỉ tài khoản đăng nhập có role `teacher` mới được hiển thị và sử dụng chức năng của cô; đăng nhập tài khoản thường không đủ quyền. Không còn cơ chế PIN.
- Không đưa service key, mật khẩu, session hay owner_id vào dữ liệu trả về, log, bundle hoặc tài liệu công khai.
- Chỉ tổng hợp tài khoản đã đăng ký; không tự nhập dữ liệu khách vào thống kê.
- Ghi chú riêng tư không tự động trở thành câu hỏi gửi cô. Không suy luận tính cách hoặc chẩn đoán từ kết quả học/cảm xúc.
- Không tự push/deploy. Giữ `git.deploymentEnabled=false`; khi được yêu cầu triển khai, chỉ dùng domain `khuvuontrithuc.vercel.app`.

## Review Focus

1. Gọi API trực tiếp, sửa role phía client hoặc dùng tài khoản thường vẫn phải bị chặn; server kiểm tra role từ database.
2. Chuyển tài khoản/đăng xuất/hết phiên không được để dữ liệu của người trước xuất hiện hoặc ghi nhầm.
3. Tài khoản chưa học, dữ liệu cũ/hỏng và giá trị thiếu không được biến thành kết luận sai hoặc điểm 0 giả.
4. Ghi chú cũ, câu hỏi nhạy cảm và prompt injection không được gửi ngoài ý muốn hoặc trở thành chỉ dẫn cho AI.
5. Hết quota AI/mất mạng/gửi lặp không được mất câu hỏi, tạo bản ghi trùng hoặc tự công bố bản nháp.

## Tiến độ và cách cập nhật

- [x] Đối chiếu luồng tài khoản, lưu dữ liệu theo owner và các document học tập hiện tại.
- [x] Xác định nguyên nhân mất tiếng: chọn cảm xúc gọi hàm `speak` đang vô hiệu hóa.
- [x] Soạn thiết kế, hợp đồng API và checklist triển khai trong file này.
- [x] Hoàn thành phiên giáo viên và kiểm tra bảo vệ API.
- [x] Hoàn thành thống kê dữ liệu thật.
- [x] Hoàn thành luồng gửi và tổng hợp câu hỏi.
- [ ] Hoàn thành AI tạo giáo án/bài tập theo hồ sơ học tập.
- [ ] Kiểm thử đầu cuối và nghiệm thu.
- [ ] Commit/push/deploy khi có yêu cầu.

Chỉ tick sau khi có bằng chứng kiểm tra; ghi ngày, lệnh và kết quả ở cuối file. Nếu thay đổi thiết kế, sửa phần quyết định trước rồi cập nhật task liên quan. Không tick task triển khai chỉ vì đã viết kế hoạch.

## Thiết kế và quyết định

### Truy cập của cô

**Thay đổi yêu cầu 23/10/2026:** Hủy thiết kế PIN/modal PIN/cookie giáo viên riêng. Dùng đăng nhập tên + mật khẩu hiện có. Tất cả mục của cô (thống kê, câu hỏi, kho giáo án, chuẩn bị bài, cô tự học, nội dung tiếng Anh dành cho cô và API tương ứng) chỉ render và tải dữ liệu khi server xác nhận tài khoản có role `teacher`. Khách/tài khoản thường không thấy các mục này; đường dẫn trực tiếp được hướng về đăng nhập hoặc báo không đủ quyền. Trẻ vẫn học và trải nghiệm như hiện tại.

Thêm role `learner | teacher`, mặc định `learner` cho tài khoản cũ và đăng ký mới. Public registration không được nhận role hoặc tự nâng quyền; quyền phải đọc từ database khi xử lý request, không tin username/role client gửi lên. `/api/device/auth/session` trả role công khai để UI hiển thị; cookie hiện có vẫn HttpOnly/SameSite Strict/Secure production. API teacher trả 401 khi chưa đăng nhập, 403 khi không có quyền; no-store và kiểm tra Origin cho mutation.

Tạo tài khoản mặc định tên đăng nhập `ngant`, tên hiển thị “Cô Nga”, role `teacher`, dùng đúng mật khẩu người dùng đã cấp trong hội thoại qua seed riêng chạy máy chủ. Không ghi mật khẩu vào file này, migration, repo, log hoặc bundle; database chỉ lưu hash + salt theo AccountService. Seed idempotent: không ghi đè mật khẩu sau mỗi lần chạy; nếu `ngant` đã tồn tại thì dừng và xác minh tài khoản, không tự nâng quyền tài khoản có sẵn. Việc tạo tài khoản đã thực hiện trong lượt triển khai, xác nhận username/role và đăng nhập trên Supabase.

Đăng xuất/hết phiên/bị thu hồi role phải hủy request, xóa state/cache giáo viên và ẩn các chức năng ngay; không tạo lối vào bằng PIN dự phòng. Quyền theo lớp/nhiều cô là mở rộng sau; trước mắt tài khoản giáo viên được xem tập tài khoản học sinh trong phạm vi hiện tại, không đưa chính tài khoản teacher vào thống kê học sinh.

### Thống kê học tập

Danh sách có tìm kiếm tên/họ tên, phân trang 20 tài khoản, lọc có/chưa có hoạt động. Hiển thị tổng số tài khoản và số có dữ liệu, thời điểm cập nhật. Chọn bé mở chi tiết: sao, huy hiệu, lượt hoạt động theo lĩnh vực, bài tiếng Anh đã mở/hoàn thành và kết quả 6 game tiếng Anh. Luôn có loading, empty, error, retry và trạng thái phiên hết hạn; không dùng dữ liệu mẫu làm dữ liệu thật.

| Nguồn document hiện có | Được hiển thị | Giới hạn cần ghi rõ |
| --- | --- | --- |
| `stars`, `game-stars`, `badges` | Sao theo nguồn, huy hiệu đã mở | Không cộng các nguồn trùng thành một tổng mới |
| `learning-stats` | Lượt hoạt động theo lĩnh vực | Không đồng nghĩa năng lực hay tỉ lệ chính xác |
| `english-progress` | Bài đã mở/hoàn thành, mốc thời gian có sẵn | Chỉ tính phần trăm nếu xác định được mẫu số của đúng bộ bài |
| `english-garden-progress` | Lượt chơi, lượng luyện tập, độ chính xác tốt nhất | `words` không phải số từ độc nhất đã thuộc; bestAccuracy không phải trung bình |
| `study-time`, `daily-activity` | Ngày và dữ liệu ngày đang lưu | Hiện chỉ giữ một ngày; không vẽ biểu đồ tuần/tháng giả |
| `emotions` | Chưa đưa vào thống kê mặc định | Tối đa 20 lần tự chọn, không đủ suy luận tính cách; bổ sung sau khi rõ quyền chia sẻ |

Tên đăng ký có thể là người lớn, không mặc định đó là tên bé. Hồ sơ học sinh thêm nhóm tuổi do cô chọn (`3-4`, `4-5`, `5-6`, hoặc chưa rõ), biệt danh tùy chọn; không suy tuổi từ giới tính hoặc độ tuổi game vừa chọn. Chưa rõ tuổi thì yêu cầu chọn trước khi tạo nội dung theo tuổi.

### Câu hỏi gửi cô

Góc tâm sự hiện lưu `teacher-notes` riêng của chủ tài khoản. Giữ nguyên ghi chú/draft cũ. Thêm hành động “Gửi câu hỏi cho cô” với xem trước nội dung, xác nhận người nhận và thông báo câu hỏi sẽ được tài khoản có quyền giáo viên đọc. Chỉ tài khoản đăng nhập được gửi; khách vẫn dùng ghi chú riêng và được mời đăng nhập khi muốn gửi.

Mỗi câu hỏi: id, accountId lấy từ session (không tin body), nội dung tối đa 4.000 ký tự, thời điểm gửi từ server, trạng thái `new | read | answered | withdrawn`, câu trả lời của cô và thời điểm cập nhật. Người gửi xem câu hỏi/câu trả lời của chính mình và được rút câu hỏi; cô xem danh sách phân trang, lọc trạng thái, tìm kiếm giới hạn, mở chi tiết, đánh dấu đã đọc và trả lời. Nội dung rút không còn xuất hiện trong danh sách/chi tiết giáo viên. Không tự động tạo câu hỏi từ hội thoại AI hoặc chia sẻ tất cả ghi chú cũ.

Gửi có idempotency key để retry không trùng; xuất HTML phải escape/render text, không dangerouslySetInnerHTML. AI đọc câu hỏi chỉ khi cô chủ động chọn, theo cùng điều kiện dữ liệu ở phần dưới; không dùng câu hỏi như system prompt.

### AI hỗ trợ cô

Luồng: chọn bé → chọn giáo án/bài tập, mục tiêu và thời lượng → xem dữ liệu tóm tắt sẽ dùng → tạo bản nháp → cô chỉnh sửa, lưu hoặc tạo lại. Đầu ra gồm mục tiêu, chuẩn bị, hoạt động từng bước, thời lượng, mức hỗ trợ, bài tập và đáp án; ghi dữ kiện làm cơ sở, phân biệt dữ kiện với gợi ý. Không tự thay tiến độ, gửi cho bé hay chẩn đoán cảm xúc.

Chỉ lấy allowlist thống kê cần thiết; không đưa mật khẩu, id nội bộ, họ tên, câu hỏi riêng, lịch sử cảm xúc vào prompt mặc định. Loại tên không tự biến dữ liệu trẻ thành dữ liệu vô danh. Trước khi gửi dữ liệu thật lên dịch vụ AI phải xác nhận chính sách nhà cung cấp, quyền xử lý và điều kiện gói miễn phí; không mặc định API Gemini hiện có đáp ứng trường hợp này. Nếu chưa xác nhận, vẫn hoàn thành dashboard và dùng bộ mẫu theo tuổi/mục tiêu; AI cá nhân hóa giữ tắt. Có thể đánh giá mô hình chạy cục bộ, nhưng phải kiểm tra thiết bị/tải model, không hứa chạy miễn phí trên mọi máy.

Đặt quota cấu hình, timeout, một yêu cầu đang chạy mỗi phiên, hủy khi đăng xuất; báo hết quota/không khả dụng và giữ nội dung cô đã nhập. JSON đầu ra kiểm tra schema, độ dài, tổng thời lượng hợp lý; nội dung người dùng chỉ là dữ liệu, không được thay đổi quyền hay chỉ dẫn hệ thống. Bản nháp lưu riêng theo accountId, teacher-only; xóa tài khoản phải xử lý các dữ liệu liên quan theo chính sách đã ghi nhận.

## Task 1 — Đăng nhập giáo viên, seed tài khoản và cổng API

**Files:** tạo `server/teacherService.ts`, `server/teacherRoutes.ts`, `server/sqliteTeacherStore.ts`, `server/supabaseTeacherStore.ts`, `src/lib/teacherApi.ts`, `tests/teacherAuth.test.ts`; sửa `server.ts`, `supabase/functions/kvtt-device/index.ts`, `.env.example`; tạo migration SQL kế tiếp trong `supabase/migrations/` theo timestamp thực tế.

**Interfaces:** Mở rộng `PublicAccount`/`StoredAccount` và hai account repositories thêm `role`; `requireTeacherSession` resolve cookie account hiện có, kiểm tra role DB cho mọi route phía dưới. Không thêm phiên/PIN thứ hai. Chuẩn lỗi `{error:{code,message}}` theo adapter và chuẩn hóa ở client.

| Method/route | Hợp đồng |
| --- | --- |
| POST `/api/device/auth/login` | Đăng nhập hiện có, response thêm role; giữ chống brute-force |
| GET `/api/device/auth/session` | Profile + role, không trả token |
| POST `/api/device/auth/logout` | Revoke phiên hiện có và xóa dữ liệu teacher phía UI |

- [ ] Viết test chưa login 401, learner 403, teacher được phép, role client giả bị bỏ qua, public register không tự nâng quyền, hết hạn/revoke/Origin sai.
- [ ] Chạy `bun test tests/teacherAuth.test.ts`, xác nhận fail vì chưa có hành vi.
- [ ] Sửa `server/accountService.ts`, `server/sqliteAccounts.ts`, `server/supabaseAccounts.ts`, client account types/context và Edge account mapping: role mặc định learner, đọc quyền server; migration cùng schema SQLite/Supabase, RLS deny client.
- [ ] Tạo `scripts/seed-teacher-account.ts`, test seed idempotent, username trùng fail closed, mật khẩu hash đúng cơ chế hiện có; chạy seed local/production bằng secret được cấp riêng và ghi kết quả không chứa mật khẩu.
- [ ] Nối route local và proxy/Edge production; bảo vệ tất cả route teacher kể cả AI và questions.
- [ ] Chạy lại test; thêm kiểm tra gọi trực tiếp không cookie, cookie giả/hết hạn đều bị chặn và no-store.
- [ ] Review cookie, thông báo/log không chứa mật khẩu; env mẫu cho seed chỉ placeholder, không tạo mật khẩu mặc định trong mã nguồn. Bỏ toàn bộ route/config PIN nếu có.
- [ ] Ghi bằng chứng và commit riêng khi được yêu cầu.

## Task 2 — API thống kê và hồ sơ học sinh

**Files:** tạo `server/teacherProgress.ts`, `src/lib/teacherTypes.ts`, `tests/teacherProgress.test.ts`; sửa các teacher store/routes của Task 1. Đọc qua server từ account store và device documents, không mở quyền document API hiện có.

**Interfaces:** `GET /api/teacher/students?query=&activity=&cursor=&limit=20` → `{items,nextCursor,updatedAt}`; `GET /api/teacher/students/:accountId` → profile + allowlist summary; `PATCH /api/teacher/students/:accountId/profile` → nhóm tuổi/biệt danh đã validate. Kiểu `StudentProgressSummary` có giá trị nullable và nguồn/mốc thời gian; không có trường password/session/ownerId.

- [ ] Viết test hai tài khoản + khách, chưa học, record thiếu/hỏng, ngày cũ, không cộng trùng sao, bestAccuracy đúng nghĩa, phân trang ổn định và tên có dấu.
- [ ] Chạy test để thấy fail; implement tổng hợp server có giới hạn truy vấn, tránh tải mọi document của mọi tài khoản cho từng request.
- [ ] Validate query, giới hạn tối đa 50/trang, id không tồn tại trả 404; không trả tài khoản khách hay document riêng tư.
- [ ] Thêm profile teacher-only trong cả hai backend, kiểm tra xóa tài khoản và FK.
- [ ] Chạy `bun test tests/teacherProgress.test.ts tests/teacherAuth.test.ts`; kiểm tra quyền mọi endpoint và parity SQLite/Supabase.
- [ ] Ghi bằng chứng và commit riêng khi được yêu cầu.

## Task 3 — API gửi/tổng hợp câu hỏi

**Files:** tạo `server/teacherQuestions.ts`, `src/lib/teacherQuestionApi.ts`, `tests/teacherQuestions.test.ts`; sửa teacher stores/routes, `server/accountRoutes.ts`, `supabase/functions/kvtt-device/index.ts`; migration tạo bảng questions có FK, index `(created_at,id)` và `(account_id,created_at)`.

**Interfaces:** owner: `POST/GET /api/device/questions`, `POST /api/device/questions/:id/withdraw`; teacher: `GET /api/teacher/questions?status=&cursor=`, `GET /api/teacher/questions/:id`, `PATCH /api/teacher/questions/:id` nhận status/reply/version. Tạo mới trả 201; retry cùng idempotency key trả bản ghi cũ; update dùng version để tránh ghi đè, xung đột 409.

- [ ] Viết test guest bị chặn, owner không giả được accountId, không đọc/rút câu hỏi người khác, draft cũ không xuất hiện, gửi lặp không trùng.
- [ ] Thêm test chưa đăng nhập hoặc không có role teacher không đọc được, câu hỏi đã rút bị che khỏi teacher, quá 4.000 ký tự, XSS dưới dạng text, conflict version và giới hạn gửi 5 câu hỏi/giờ/tài khoản.
- [ ] Chạy `bun test tests/teacherQuestions.test.ts` để thấy fail.
- [ ] Implement validation, store và router cho local/production; timestamp server, RLS deny client, cơ chế rút/xóa và thời hạn lưu được ghi rõ.
- [ ] Chạy lại test và test chuyển tài khoản trong khi request đang chạy; không lưu kết quả về tài khoản mới.
- [ ] Ghi bằng chứng và commit riêng khi được yêu cầu.

## Task 4 — Quyền hiển thị và hai tab

**Files:** tạo `src/components/TeacherArea.tsx`, `src/screens/TeacherStatistics.tsx`, `src/screens/TeacherQuestions.tsx`; sửa `src/App.tsx`, `src/components/AccountRoot.tsx`, `src/screens/ParentDashboard.tsx`, `src/lib/teacherApi.ts` và các điểm vào teacher đã kiểm kê; tạo `scripts/verify-teacher-area.mjs` theo CDP/browser harness hiện có. Không tạo modal PIN.

**Interfaces:** `TeacherArea` giữ tab yêu cầu và trạng thái phiên; teacherApi mọi fetch credentials same-origin, xử lý 401/403 bằng ẩn khu vực và xóa dữ liệu đang hiện. Không cache dữ liệu teacher vào learnerStorage hoặc service worker.

- [ ] Viết browser scenario khách/learner không thấy hoặc tải nội dung dành cho cô; deep link không vượt quyền; đăng nhập teacher mới thấy và mở được các tab; logout ẩn ngay.
- [ ] Implement hai tab, bảng/card responsive, tìm kiếm/phân trang, chi tiết từng bé, nhóm tuổi và các nhãn đúng nguồn dữ liệu.
- [ ] Implement loading/empty/error/retry, đăng xuất, hết hạn và phản hồi 401/403; clear detail và hủy request khi đăng xuất/unmount/chuyển tài khoản.
- [ ] Thêm luồng gửi câu hỏi ở ParentDashboard, xác nhận chia sẻ, theo dõi trả lời/rút; giữ nguyên ghi chú riêng cũ.
- [ ] Kiểm tra keyboard, screen reader labels, nút tối thiểu theo UX contract, màn hình 390px và desktop; không lộ dữ liệu trước đăng nhập teacher qua DOM/network.
- [ ] Chạy `bun scripts/verify-teacher-area.mjs`, lưu bằng chứng; review giao diện theo DESIGN/UX-CONTRACT.
- [ ] Ghi bằng chứng và commit riêng khi được yêu cầu.

## Task 5 — AI tạo giáo án/bài tập và lưu bản nháp

**Files:** tạo `server/teacherPlanning.ts`, `src/components/TeacherLessonComposer.tsx`, `tests/teacherPlanning.test.ts`; sửa teacher routes/stores và `src/screens/TeacherStatistics.tsx`. Tham khảo `server/aiRoutes.ts` nhưng không dùng route công khai để truy cập dữ liệu toàn bộ học sinh.

**Interfaces:** `POST /api/teacher/students/:accountId/plans/generate` nhận `{kind:'lesson'|'exercise',ageBand,goal,durationMinutes}`; server tự đọc allowlist summary; `POST/GET /api/teacher/students/:accountId/plans` lưu/list bản nháp có version; update theo version. `TeacherPlan` gồm mục tiêu, chuẩn bị, các bước, thời lượng, hỗ trợ, bài tập/đáp án và nguồn thống kê. Mọi route yêu cầu phiên teacher.

- [ ] Xác nhận nhà cung cấp/chế độ xử lý dữ liệu thật và quota miễn phí; ghi quyết định, link chính sách và ngày kiểm tra. Chưa đáp ứng thì tắt AI cá nhân hóa, dùng bộ mẫu rõ nhãn.
- [ ] Viết test chưa rõ tuổi, dữ liệu thiếu, prompt injection trong tên/mục tiêu/câu hỏi, không xuất PII, unauthorized, quota/timeout, JSON sai và output quá dài.
- [ ] Chạy `bun test tests/teacherPlanning.test.ts` để thấy fail; mock provider cho test, không gửi dữ liệu học sinh thật khi test.
- [ ] Implement prompt tối thiểu và schema validation, giới hạn mục tiêu/thời lượng, quota cấu hình, abort/timeout; không dùng nội dung đầu vào như chỉ dẫn hệ thống.
- [ ] Implement preview dữ liệu dùng cho AI, chỉnh sửa/lưu/tạo lại, lỗi có thể thử lại; không tự gửi cho học sinh, không ghi thay tiến độ.
- [ ] Thêm test lưu đúng accountId, dữ liệu tài khoản khác không xuất hiện, update conflict không ghi đè, đăng xuất trong khi generate không hiển thị kết quả muộn.
- [ ] Chạy unit và browser flow tạo → sửa → lưu → mở lại; xác nhận bản nháp vẫn còn khi AI lỗi.
- [ ] Ghi bằng chứng và commit riêng khi được yêu cầu.

## Task 6 — Nghiệm thu và phát hành có kiểm soát

- [ ] `bun test` không lỗi; test mới phải được chạy fail trước khi implement rồi pass sau.
- [ ] `bun --bun node_modules/typescript/bin/tsc --noEmit` không lỗi.
- [ ] `bun --bun node_modules/vite/bin/vite.js build` thành công; kiểm tra bundle không chứa mật khẩu/service key.
- [ ] Browser flow toàn bộ: khách → đăng ký/học → thống kê cô; gửi/rút/trả lời câu hỏi; AI tạo/sửa/lưu; sai mật khẩu/throttle/hết phiên/learner không đủ quyền; hai tài khoản cô lập dữ liệu.
- [ ] Kiểm tra migration/RLS/route contract ở Supabase staging, backup và phương án rollback; không nới quyền để sửa lỗi nhanh.
- [ ] Review quyền teacher và thu hồi quyền, chính sách chia sẻ/lưu/xóa, dữ liệu trẻ và provider; ghi các giới hạn thực tế vào README.
- [ ] Khi người dùng yêu cầu: commit các phần liên quan, push; đồng bộ env server-only, deploy Edge/migration trước frontend tương thích.
- [ ] Deploy Vercel thủ công; xác nhận đúng repo/commit, domain `khuvuontrithuc.vercel.app`, domain cũ vẫn không phục vụ; auto deploy vẫn tắt.
- [ ] Smoke test production với tài khoản kiểm thử, mật khẩu không ghi trong log, API trực tiếp chưa xác thực trả 401; thu hồi phiên/dọn dữ liệu test.

## Ghi chú, bằng chứng và việc ngoài hai tính năng

| Ngày | Việc | Bằng chứng / ghi chú |
| --- | --- | --- |
| 2026-10-23 | Lập kế hoạch | Hai tính năng chưa implement. Thiết kế trên là đề xuất kỹ thuật, có thể điều chỉnh trước từng task. |
| 2026-10-23 | Sửa tiếng chọn cảm xúc | Tách `readEmotionFeedback` gọi chức năng đọc tiếng Việt theo thao tác chọn; giữ lưu cảm xúc khi trình duyệt không hỗ trợ, báo lỗi để chọn lại. Test mới đã fail khi chưa có helper, sau sửa 4 test speech pass. |
| 2026-10-23 | Kiểm tra mã nguồn | `bun test`: 90 pass, 0 fail; TypeScript và Vite build thành công. Test âm thanh dùng API trình duyệt giả lập, chưa xác nhận loa/giọng đọc thực tế. Build còn cảnh báo chunk lớn hiện có. |

**Việc chưa biết cần xác nhận khi triển khai:** provider AI được phép xử lý dữ liệu thật; thời hạn lưu câu hỏi/bản nháp; tên đăng ký là phụ huynh hay bé; cần phân lớp/quyền nhiều cô hay không. Các mục này không ngăn triển khai phần phân quyền và thống kê dữ liệu sẵn có.

### Kế hoạch bổ sung và thay đổi quyền truy cập

- [x] Thay thiết kế PIN bằng đăng nhập có role giáo viên; ghi yêu cầu seed `ngant` an toàn.
- [x] Bổ sung [kế hoạch kho giáo án](ke-hoach-kho-giao-an.md): lưu/sửa/xóa và tải Word.
- [x] Triển khai role và seed tài khoản mặc định trong database local và Supabase; đã xác minh đăng nhập thực tế.
- [ ] Kiểm kê và bảo vệ mọi chức năng hiện có của cô, không chỉ hai tab mới; kiểm tra API AI/chuẩn bị bài/cô tự học và document `teacher-preparation` không còn lối truy cập bằng tài khoản thường.

Kế hoạch kho giáo án dùng chung role/gate của Task 1; thay vì lưu giáo án cá nhân hóa ở bảng riêng trong Task 5, lưu một bản ghi kho giáo án với `studentAccountId` tùy chọn, tránh hai nguồn dữ liệu giáo án song song.

## Cập nhật triển khai 23/10/2026

- [x] Có role teacher/learner, đăng ký công khai không nâng quyền; đã seed ngant và bảo vệ API cũ lẫn mới.
- [x] Có TeacherWorkspace, thống kê, hộp thư và kho giáo án; UI 390px và luồng lưu/upload đã kiểm tra.
- [x] Supabase thật: guest401, learner403, stats, gửi/trả lời/rút câu hỏi, upload/download Word, sửa/xóa và logout401 đều pass; bằng chứng docs/verification/teacher-remote.json.
- [x] Sửa bypass đường dẫn teacher-preparation qua trailing slash/URL encoding, có test hồi quy.
- [ ] Bật AI cloud xử lý dữ liệu cá nhân: cố ý chưa bật khi điều kiện xử lý chưa được xác nhận. Hiện có bản mẫu theo tuổi/mục tiêu, chỉnh sửa và lưu vào kho.
- [x] Publish frontend Vercel theo yêu cầu tiếp theo: deployment dpl_FrAkThBsUsdJygenwHgVDPD2eHdb trên khuvuontrithuc.vercel.app; 14 kiểm tra production pass. Chưa commit/push, auto deploy vẫn tắt.

Chi tiết task trong bản thiết kế vẫn giữ các bước chưa nghiệm thu đầy đủ ở trạng thái unchecked; không coi một smoke test thay cho mọi tình huống trong checklist.
