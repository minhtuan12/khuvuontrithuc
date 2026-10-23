# Kho giáo án của cô — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cô đăng nhập để lưu, tìm lại, chỉnh sửa, xóa giáo án đã tạo và tải tài liệu Word từ máy lên kho riêng.

**Architecture:** Dùng role `teacher` và phiên tài khoản hiện có theo Task 1 trong `cac-viec-dang-trien-khai.md`, không dùng PIN. Metadata/nội dung lưu SQLite khi local, Postgres khi production; tệp Word lưu private storage, chỉ tải qua API đã xác thực. Giáo án từ AI hiện có, AI theo từng bé và tài liệu tải lên dùng chung một kho.

**Tech Stack:** React/TypeScript, Express/Bun, Supabase Edge/Postgres/private Storage, SQLite, Vercel. Chọn thư viện đọc DOCX sau khi kiểm tra tương thích runtime, giấy phép và giới hạn giải nén.

**Spec:** Yêu cầu ngày 23/10/2026 và thiết kế trong file này; phụ thuộc [kế hoạch quyền giáo viên và hai tab](cac-viec-dang-trien-khai.md).

## Global Constraints

- Chỉ server xác nhận role `teacher` mới được hiển thị và sử dụng các chức năng của cô. Khách và learner không tải metadata, nội dung hay file.
- Tạo tài khoản mặc định `ngant` theo kế hoạch chung, mật khẩu lấy từ giá trị người dùng cung cấp qua seed riêng; không lưu plaintext vào repo/tài liệu/log. Tài khoản đã được seed trên local và Supabase trong lượt triển khai.
- Chủ sở hữu kho là tài khoản teacher lấy từ session. Không nhận quyền/owner từ body; không nhận diện teacher chỉ bằng username `ngant`.
- Không còn PIN, endpoint unlock bằng PIN hoặc fallback dùng PIN. Đăng xuất/hết phiên/thu hồi role phải ẩn UI, hủy request và xóa state riêng tư.
- Tuân thủ DESIGN.md/UX-CONTRACT.md, giữ trải nghiệm khách và học sinh. Không mở rộng quyền các upload ảnh/video của trẻ để chứa Word.
- Không tự deploy/push. Mỗi task tick sau kiểm tra, ghi bằng chứng; chỉ task kế hoạch được tick trong lượt này.

## Review Focus

1. Teacher khác không đọc/sửa/xóa giáo án riêng của nhau; URL file không được trở thành public hoặc truy cập được bằng tài khoản học sinh.
2. Hai cửa sổ cùng sửa, retry lưu/upload hoặc đăng xuất giữa chừng không làm ghi đè, trùng giáo án hay hiện dữ liệu muộn.
3. Word giả đuôi, file macro, ZIP bomb, lỗi trích xuất và tên file độc hại bị xử lý an toàn, không chạy nội dung nhúng.
4. Mất mạng/AI lỗi/xóa file lỗi không làm mất nội dung đang sửa hoặc để bản ghi giả báo thành công.
5. Dữ liệu giáo án cũ không bị chuyển nhầm tài khoản; nội dung giáo án có thông tin trẻ không tự gửi lên AI.

## Thiết kế đề xuất

### Phạm vi và trải nghiệm

Thêm “Kho giáo án” trong khu vực của cô, chỉ hiện sau khi đăng nhập teacher. Danh sách 20 mục/trang, tìm tên, lọc nguồn `AI | tự soạn | Word`, nhóm tuổi và ngày cập nhật; có loading/empty/error/retry. Mỗi mục có tên, nhóm tuổi, hoạt động/chủ đề, thời điểm sửa, nguồn và hành động mở/sửa/xóa. Không cần editor Word đầy đủ trong phiên bản đầu.

Sau AI soạn ở “Chuẩn bị bài” hoặc tạo theo từng bé, hiển thị “Lưu vào kho giáo án”. Lưu thành công mới báo đã lưu, có nút mở bản đã lưu. “Cô tự học” vẫn được bảo vệ teacher nhưng chỉ có nội dung đúng loại giáo án mới lưu vào kho, không tự đổi mọi tài liệu tự học thành giáo án. Có thể tạo giáo án thủ công với tên và nội dung.

Mở giáo án để sửa tên/chủ đề/nhóm tuổi và nội dung văn bản bằng editor hiện có hoặc textarea có nhãn. Dùng nút Lưu rõ ràng, báo thay đổi chưa lưu khi rời trang/đăng xuất; không coi local cache là lưu thành công. Xóa có xác nhận tên giáo án, sau thành công bỏ khỏi danh sách; không cho người dùng thường xem lịch sử đã xóa.

### Word từ máy lên

Hỗ trợ `.docx` và `.doc` tối đa **10 MiB/tệp**, quota ban đầu **100 MiB/teacher** có cấu hình; kiểm tra giới hạn thực tế của đường upload/storage trước phát hành và hiển thị cùng giới hạn ở UI/server. Chọn file, tên gợi ý từ tên file, xem dung lượng và xác nhận tải. Có progress/busy, cancel, lỗi và retry; idempotency key tránh tạo trùng.

- `.docx`: kiểm tra ZIP/OpenXML hợp lệ, không macro, giới hạn tổng giải nén 50 MiB, 1.000 entry và tỉ lệ nén tối đa 100:1; kiểm tra trước khi trích xuất, không tải tài nguyên ngoài/embedded object. Trích văn bản có giới hạn 200.000 ký tự để cô xem và chỉnh sửa thành bản nội dung của kho. Hiển thị rõ bố cục/bảng/ảnh có thể không giữ nguyên.
- `.doc`: nhận diện chữ ký OLE, giữ file gốc để tải lại; phiên bản đầu **không trích xuất/chỉnh sửa nội dung DOC trực tiếp**. Cô có thể bổ sung bản văn bản riêng hoặc chuyển thành `.docx` trên máy rồi tải lên. Không gửi file tới dịch vụ chuyển đổi bên ngoài tự động.
- Không nhận `.docm`, file đổi đuôi, executable, ZIP tùy ý hoặc file vượt quota. Không dùng MIME từ trình duyệt làm bằng chứng duy nhất. Tên hiển thị được làm sạch; storage path dùng UUID server, không dùng đường dẫn do client cung cấp.
- File gốc bất biến; sửa nội dung trong web không ghi đè file Word gốc. Tải file dùng Content-Disposition attachment, MIME phù hợp, nosniff. Phiên bản đầu không hứa xuất lại file Word đúng định dạng.

Upload production dùng ticket ngắn hạn cho đúng object private và quota reservation; không chuyển file 10 MiB qua Vercel Function nếu giới hạn runtime không cho phép. Finalize phải xác minh object/kích thước/chữ ký/nội dung, chỉ sau đó hiện trạng thái ready. Chỉ teacher có quyền upload mới được cấp ticket; download qua API xác thực, không phát URL public. Nếu backend buộc dùng URL ký tải xuống, phải chốt rõ cửa sổ hết hạn và hành vi sau logout trước khi chọn thay thế.

### Mô hình dữ liệu và quyền

`teacher_lesson_plans`: id UUID, teacherAccountId FK, studentAccountId nullable FK, title 1–200 ký tự, activity tối đa 200, ageBand nullable, source `ai | manual | word`, content tối đa 200.000 ký tự, sourceGenerationId nullable, version integer, createdAt/updatedAt server, deletedAt nullable. Student id liên kết tùy chọn, không sao chép PII vào title/content mặc định.

`teacher_lesson_files`: id, planId, private storageKey, originalName, detectedType, byteSize, sha256, state `pending | ready | rejected | deleting`, thời điểm tạo/hạn pending; index theo owner/ngày và planId. Quota tính cả reservation đang hoạt động, cập nhật atomic. RLS deny browser, service backend kiểm tra role và owner trên mọi request; thay accountId trong URL không vượt quyền.

Xóa: transaction đánh dấu plan deleted và file deleting → ẩn/thu hồi download ngay → xóa object → retry dọn nếu storage lỗi. Không báo xóa file vật lý khi chưa xóa. Pending upload hết hạn được dọn cùng reservation; có task dọn có log không chứa nội dung. Tài khoản bị xóa xử lý FK/file theo cùng cơ chế. Retention của tombstone/log phải chốt trước production.

### Hợp đồng API

Tất cả dưới `/api/teacher/lesson-plans`, sử dụng `requireTeacherSession` và owner từ session. 401 chưa login, 403 thiếu role, 404 id không thuộc quyền để tránh dò tìm, 409 version/conflict, 413 quá dung lượng, 415 sai định dạng, 429 quota/rate. Response riêng tư no-store, mutation kiểm tra Origin.

| Method/route | Input/output |
| --- | --- |
| GET `/` | query/source/ageBand/cursor/limit → items + nextCursor, không trả toàn bộ content mỗi hàng |
| POST `/` | title/content/ageBand/activity/source + idempotency key → plan ready; source AI được xác thực từ generation thuộc owner |
| GET `/:id` | Metadata + content + danh sách file thuộc plan |
| PATCH `/:id` | Các trường được sửa + expectedVersion → bản mới; 409 giữ nguyên bản đang sửa |
| DELETE `/:id` | expectedVersion → tombstone, idempotent; file bị chặn ngay |
| POST `/uploads/init` | tên/kích thước/loại dự kiến + idempotency key → uploadId/ticket/path được giới hạn; chưa coi là giáo án ready |
| POST `/uploads/:uploadId/finalize` | Xác minh object và metadata do server đọc → plan/file ready hoặc rejected; retry idempotent |
| DELETE `/uploads/:uploadId` | Hủy pending và giải phóng quota khi dọn thành công |
| GET `/:id/files/:fileId/download` | Kiểm tra teacher + owner mỗi lần, stream attachment; hỗ trợ cancel và giới hạn đồng thời |

Nếu đọc DOCX lỗi, cho cô chọn giữ file hợp lệ dưới dạng tài liệu đính kèm với nội dung chưa trích xuất; không báo đã chuyển đổi thành công. Không giữ tài liệu bị phát hiện nguy hiểm. Không tự gửi tài liệu hoặc bản trích xuất cho LLM; tái soạn bằng AI cần thao tác rõ ràng và đáp ứng chính sách dữ liệu trong kế hoạch chung.

## Task 1 — Hoàn thành điều kiện đăng nhập và kiểm kê chức năng của cô

**Files:** dùng Task 1 của `docs/cac-viec-dang-trien-khai.md`; kiểm kê `src/App.tsx`, `src/components/EnglishModule.tsx`, `src/components/AccountRoot.tsx`, `src/lib/accountApi.ts`, `src/lib/accountContext.ts`, `server/aiRoutes.ts`, `server/deviceRoutes.ts`, `server/deviceValidation.ts`, Edge function.

**Interfaces:** session có `role`; `requireTeacherSession` đọc role DB, trả teacher account id. Đây là dependency bắt buộc, không viết gate thứ hai.

- [ ] Viết test ma trận khách/learner/teacher cho mọi màn hình/API của cô; account thường không đọc được `teacher-preparation` hay gọi API soạn bài/cô tự học.
- [ ] Chạy test fail, thực hiện role + seed theo kế hoạch chung, giữ PBKDF2/hash và login throttle hiện có.
- [ ] Sửa gate UI/API cả tính năng hiện có và mới; nội dung “Tiếng Anh cùng cô giáo” phân biệt tài nguyên dành cho cô với bài học tiếng Anh của trẻ để không chặn nhầm trẻ.
- [ ] Test pass: giả role client không vượt quyền, logout/thu hồi role không giữ dữ liệu; xác nhận `ngant` tồn tại với role teacher bằng truy vấn không trả secret.
- [ ] Ghi bằng chứng, chỉ tick seed sau khi thực sự chạy vào DB đúng môi trường.

## Task 2 — Kho giáo án: schema, CRUD và phân quyền

**Files:** tạo `server/teacherLessonService.ts`, `server/teacherLessonRoutes.ts`, `server/sqliteTeacherLessons.ts`, `server/supabaseTeacherLessons.ts`, `src/lib/teacherLessonTypes.ts`, `tests/teacherLessons.test.ts`; sửa `server.ts`, Edge entry, migration kế tiếp và `server/teacherRoutes.ts` khi đã tồn tại.

**Interfaces:** `TeacherLessonStore.list/get/create/update/delete` luôn nhận teacherAccountId; `update` nhận expectedVersion; `TeacherLessonService` validation và idempotency; kiểu `TeacherLessonPlan` theo schema trên. Local/production phải cùng response và ownership.

- [ ] Test CRUD đúng owner, guest 401, learner 403, teacher khác 404, title rỗng/quá dài, content quá dài, source giả và stale version 409.
- [ ] Chạy `bun test tests/teacherLessons.test.ts` để thấy fail.
- [ ] Implement schema/store/service/router, index phân trang `(teacher_account_id,updated_at,id)`; escape text và no-store.
- [ ] Test mất mạng/retry không trùng; soft delete chặn read/download ngay; không return owner/session secrets.
- [ ] Chạy test pass, kiểm tra parity SQLite/Supabase và ghi bằng chứng.

## Task 3 — Upload Word, trích xuất và dọn file

**Files:** tạo `server/teacherWordFiles.ts`, `server/teacherWordExtraction.ts`, `tests/teacherWordFiles.test.ts`, `scripts/cleanup-teacher-files.ts`; sửa store/router Task 2; migration private bucket/chính sách, cấu hình giới hạn server. Tạo fixture Word nhỏ tại `tests/fixtures/teacher-lessons/` bằng dữ liệu giả, không tài liệu thật của trẻ.

**Interfaces:** `initUpload(teacherId, metadata, key)`, `finalizeUpload(teacherId, uploadId)`, `cancelUpload`, `downloadFile`; `extractDocx(bytes, limits)` trả text/trạng thái hoặc lỗi có mã, không HTML tùy ý. Provider storage có API reserve/put/inspect/delete/stream tương đương local/production.

- [ ] Test DOCX/DOC thật, giả MIME/đuôi, macro, path traversal, tên Unicode, ZIP vượt giới hạn, OLE sai, file quá 10 MiB/quota và hai upload đồng thời.
- [ ] Chạy test fail; kiểm tra runtime/giới hạn upload thực tế và chọn thư viện tương thích trước thêm dependency.
- [ ] Implement private storage/ticket/finalize kiểm tra object server, quota atomic, trích xuất có giới hạn; không public bucket, không tài nguyên ngoài.
- [ ] Test ticket hết hạn/dùng sai object, finalize lặp, upload bị hủy/đứt mạng, metadata chưa ready không hiện là đã lưu; giữ file DOC hợp lệ để download.
- [ ] Test teacher khác/learner/guest không tải; logout request sau bị chặn, download attachment/nosniff đúng.
- [ ] Implement dọn pending và file đã xóa, retry có giới hạn; test storage delete lỗi không phục hồi quyền read và quota không âm.
- [ ] Chạy `bun test tests/teacherWordFiles.test.ts tests/teacherLessons.test.ts`; ghi bằng chứng.

## Task 4 — UI kho và lưu giáo án đã tạo

**Files:** tạo `src/screens/TeacherLessonLibrary.tsx`, `src/components/TeacherLessonEditor.tsx`, `src/components/TeacherWordUpload.tsx`, `src/lib/teacherLessonApi.ts`, `scripts/verify-teacher-lessons.mjs`; sửa `src/App.tsx` và component hiện đang hiển thị kết quả soạn bài (xác định bằng rg trước triển khai).

**Interfaces:** API client credentials same-origin, abort signal, expectedVersion, idempotency key. Callback `onSaveToLibrary` từ kết quả AI gọi CRUD kho; cùng record cho giáo án có studentAccountId, không tạo bảng/bản sao riêng trong Task 5 kế hoạch chung.

- [ ] Viết browser flow teacher tạo bài → lưu kho → reload → tìm/mở; guest/learner không thấy entry hoặc phát request dữ liệu kho.
- [ ] Implement danh sách, tìm/lọc/phân trang, empty/loading/error/retry; card theo thiết kế hiện tại và mobile 390px.
- [ ] Implement editor, lưu rõ ràng, dirty-state/rời trang, conflict 409 có lựa chọn tải bản mới hoặc sao chép bản đang sửa; không ghi đè âm thầm.
- [ ] Implement upload tiến trình/hủy/retry, lỗi có lý do, DOC không chỉnh nội dung trực tiếp, DOCX cảnh báo giới hạn định dạng; file gốc luôn download được khi có quyền.
- [ ] Implement confirm xóa, thông báo đúng trạng thái server; lỗi không làm mất bản đang sửa. Khóa do 401/403 phải xóa state/hủy request và giữ riêng draft theo chính sách rõ ràng, không lưu cache công khai.
- [ ] Kiểm tra keyboard/focus/labels, số lượng thông báo hợp lý; test logout/chuyển teacher khi load/save/upload đang chạy không hiện kết quả tài khoản cũ.
- [ ] Chạy browser script, lưu kết quả và screenshot không chứa dữ liệu thật.

## Task 5 — Dữ liệu cũ, nghiệm thu và phát hành

**Files:** bổ sung migration/adapter nếu cần và README; dùng scripts kiểm tra ở Task 3/4.

- [ ] Kiểm kê `teacher-preparation` theo owner: không tự lấy dữ liệu của guest/learner chuyển cho `ngant`; nếu teacher có dữ liệu cũ, cho xem trước và nhập vào kho có idempotency key, giữ bản nguồn đến khi kiểm tra xong.
- [ ] Thống nhất retention, quota và quy trình xóa tài khoản/file; test bản ghi giáo án có liên kết học sinh bị xóa không còn lộ thông tin học sinh.
- [ ] Chạy `bun test`, `bun --bun node_modules/typescript/bin/tsc --noEmit`, `bun --bun node_modules/vite/bin/vite.js build`; không đưa secret vào bundle.
- [ ] Chạy end-to-end local và staging: login `ngant`, tạo/sửa/xóa, DOCX/DOC upload/download, hai teacher cô lập, learner/guest bị chặn, AI lỗi/mất mạng/409.
- [ ] Kiểm tra API cũ soạn giáo án/cô tự học và các điểm vào UI đều dùng role; không còn bypass PIN hoặc document/upload endpoint.
- [ ] Khi được yêu cầu phát hành: backup, migration/storage policies, seed teacher bằng secret riêng, Edge/API, frontend; kiểm tra repo/commit/domain đúng, giữ auto deploy tắt.
- [ ] Smoke production bằng tài liệu giả, dọn test, ghi bằng chứng và cách rollback không làm mất file đang có.

## Checklist tổng và ghi chú thực hiện

- [x] Ghi nhận yêu cầu lưu/sửa/xóa/upload Word và dùng tài khoản teacher thay PIN.
- [x] Đối chiếu hệ thống account hiện tại chưa có role và ghi kế hoạch seed an toàn.
- [x] Liên kết/chỉnh kế hoạch chung, thống nhất một nguồn lưu giáo án.
- [x] Hoàn thành Task 1: role/gate/seed DB.
- [x] Hoàn thành Task 2: CRUD.
- [x] Hoàn thành Task 3: Word/storage.
- [x] Hoàn thành Task 4: UI/lưu kết quả AI soạn bài chung; cá nhân hóa cloud vẫn tắt theo kế hoạch.
- [ ] Hoàn thành Task 5: nghiệm thu/phát hành khi được yêu cầu.

| Ngày | Việc | Bằng chứng / trở ngại |
| --- | --- | --- |
| 2026-10-23 | Viết kế hoạch | Chỉ sửa docs; chưa sửa account schema, chưa tạo `ngant`, chưa upload hoặc deploy. |

Những đề xuất kỹ thuật có thể điều chỉnh khi kiểm tra runtime: quota 100 MiB, `.doc` chỉ giữ file gốc, cách trích xuất DOCX và thời hạn lưu tombstone. Mọi thay đổi phải cập nhật giới hạn ở cả UI/API và checklist trước khi tick hoàn thành.

## Kết quả triển khai

- Có kho dùng chung cho tự soạn, kết quả AI do cô lưu và Word. DOCX trích văn bản, DOC chỉ giữ bản gốc.
- Server kiểm tra Word thực sự trước ghi Storage và kiểm tra lại lúc finalize; PDF đổi đuôi, macro, ZIP traversal, file sai cấu trúc bị từ chối.
- Storage production: private bucket kvtt-teacher-word, 10 MiB/tệp, 100 MiB/teacher; đã upload/download và kiểm tra xóa thu hồi trên Supabase thật.
- Backend thực tế dùng teacherService.ts + teacherHttp.ts + sqliteTeacherStore.ts/supabaseTeacherStore.ts thay cho các tên file tách nhỏ dự kiến; cùng hợp đồng và một nguồn lưu giáo án.
- Còn chờ phát hành frontend Vercel, chính sách retention cuối cùng và quyết định AI xử lý dữ liệu cá nhân. Không tự nhập giáo án của khách/học sinh vào tài khoản cô.
