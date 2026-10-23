import { useEffect, useRef, useState } from "react";
import { useAccount } from "../lib/accountContext";
import {
  useScopedTeacherApi,
  isCancelled,
  errorMessage,
  dateLabel,
  type TeacherQuestion,
} from "../lib/teacherApi";
import TeacherConfirm from "./TeacherConfirm";
import "../screens/teacher-workspace.css";
const STATUS = {
  new: "Đã gửi",
  read: "Cô đã đọc",
  answered: "Cô đã trả lời",
  withdrawn: "Đã rút lại",
};

export default function ParentQuestions({
  notes,
}: {
  notes: { id: string; content: string; date: string }[];
}) {
  const { user, openAccount } = useAccount();
  return (
    <div className="teacher-workspace">
      <section className="tw-card">
        <h2>Gửi câu hỏi cho cô</h2>
        <p>
          Ghi chú riêng ở trên vẫn được giữ riêng. Chỉ nội dung bạn chủ động xác
          nhận gửi mới được các tài khoản giáo viên đọc.
        </p>
        {user ? (
          <AuthorizedQuestions notes={notes} />
        ) : (
          <>
            <p>
              Đăng nhập để gửi câu hỏi và xem câu trả lời. Bạn vẫn có thể lưu
              ghi chú riêng khi dùng chế độ khách.
            </p>
            <button type="button" onClick={openAccount}>
              Đăng nhập để gửi câu hỏi
            </button>
          </>
        )}
      </section>
    </div>
  );
}
function AuthorizedQuestions({
  notes,
}: {
  notes: { id: string; content: string; date: string }[];
}) {
  const api = useScopedTeacherApi();
  const [questions, setQuestions] = useState<TeacherQuestion[]>([]);
  const [content, setContent] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(false);
  const [withdraw, setWithdraw] = useState<TeacherQuestion | null>(null);
  const pending = useRef(false);
  const key = useRef(crypto.randomUUID());
  async function load() {
    setLoading(true);
    setError("");
    try {
      setQuestions(
        (await api.request<{ items: TeacherQuestion[] }>("/api/questions"))
          .items,
      );
    } catch (failure) {
      if (!isCancelled(failure)) setError(errorMessage(failure));
    } finally {
      if (!api.signal.aborted) setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  function update(value: string) {
    setContent(value);
    key.current = crypto.randomUUID();
    setConsent(false);
    setNotice("");
  }
  async function send() {
    setPreview(false);
    if (pending.current || !consent || !content.trim()) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const next = await api.request<TeacherQuestion>("/api/questions", {
        method: "POST",
        body: JSON.stringify({
          content: content.trim(),
          idempotencyKey: key.current,
        }),
      });
      setQuestions((previous) => [
        next,
        ...previous.filter((item) => item.id !== next.id),
      ]);
      update("");
      setConsent(false);
      setNotice(
        "Đã gửi câu hỏi cho cô. Bạn có thể xem trạng thái và câu trả lời ở dưới.",
      );
    } catch (failure) {
      if (!isCancelled(failure)) setError(errorMessage(failure));
    } finally {
      pending.current = false;
      if (!api.signal.aborted) setBusy(false);
    }
  }
  async function withdrawQuestion() {
    const current = withdraw;
    setWithdraw(null);
    if (!current || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const next = await api.request<TeacherQuestion>(
        `/api/questions/${encodeURIComponent(current.id)}/withdraw`,
        { method: "POST" },
      );
      setQuestions((previous) =>
        previous.map((item) => (item.id === next.id ? next : item)),
      );
      setNotice("Đã rút lại câu hỏi.");
    } catch (failure) {
      if (!isCancelled(failure)) setError(errorMessage(failure));
    } finally {
      pending.current = false;
      if (!api.signal.aborted) setBusy(false);
    }
  }
  return (
    <>
      {notes.length > 0 && (
        <label>
          Dùng một ghi chú làm bản nháp
          <select
            disabled={busy}
            value=""
            onChange={(event) => {
              const note = notes.find((item) => item.id === event.target.value);
              if (note) update(note.content);
            }}
          >
            <option value="">Chọn ghi chú nếu muốn</option>
            {notes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.content.slice(0, 65)}
              </option>
            ))}
          </select>
        </label>
      )}
      <form
        className="tw-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!content.trim() || !consent) {
            setError("Điền câu hỏi và xác nhận người nhận trước khi xem lại.");
            return;
          }
          setPreview(true);
        }}
      >
        <label>
          Nội dung câu hỏi
          <textarea
            className="resize-none"
            name="question-content"
            maxLength={4000}
            value={content}
            disabled={busy}
            onChange={(event) => update(event.target.value)}
          />
        </label>
        <label className="tw-consent">
          <input
            type="checkbox"
            checked={consent}
            disabled={busy}
            onChange={(event) => setConsent(event.target.checked)}
          />{" "}
          Tôi đồng ý gửi nội dung này để các tài khoản có quyền giáo viên đọc và
          trả lời.
        </label>
        <button
          type="submit"
          className="tw-primary"
          disabled={busy || !content.trim() || !consent}
        >
          {busy ? "Đang gửi…" : "Xem lại và gửi câu hỏi"}
        </button>
      </form>
      {error && (
        <p role="alert" className="tw-error">
          {error}{" "}
          <button type="button" disabled={busy} onClick={() => void load()}>
            Thử tải lại danh sách
          </button>
        </p>
      )}
      <p role="status" className="tw-status">
        {notice || (loading ? "Đang tải câu hỏi đã gửi…" : "")}
      </p>
      <h3>Câu hỏi của gia đình</h3>
      <div className="tw-list">
        {questions.map((question) => (
          <article className="tw-list-item" key={question.id}>
            <span className="tw-status-chip">{STATUS[question.status]}</span>
            <p className="tw-muted">{dateLabel(question.createdAt)}</p>
            <p className="tw-text">{question.content}</p>
            {question.reply && (
              <div className="tw-reply">
                <strong>Cô trả lời</strong>
                <p className="tw-text">{question.reply}</p>
              </div>
            )}
            {question.status !== "withdrawn" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setWithdraw(question)}
              >
                Rút lại câu hỏi
              </button>
            )}
          </article>
        ))}
      </div>
      {!loading && !questions.length && <p>Bạn chưa gửi câu hỏi nào cho cô.</p>}
      {preview && (
        <TeacherConfirm
          title="Gửi câu hỏi cho cô?"
          confirmLabel="Gửi câu hỏi cho cô"
          onCancel={() => setPreview(false)}
          onConfirm={() => void send()}
        >
          <p>Người nhận: các tài khoản có quyền giáo viên.</p>
          <p className="tw-text">{content}</p>
          <p>Ghi chú gốc không thay đổi. Chỉ nội dung trên được gửi.</p>
        </TeacherConfirm>
      )}
      {withdraw && (
        <TeacherConfirm
          title="Rút lại câu hỏi?"
          confirmLabel="Rút lại câu hỏi"
          onCancel={() => setWithdraw(null)}
          onConfirm={() => void withdrawQuestion()}
        >
          <p>
            Câu hỏi sẽ không còn nằm trong danh sách trao đổi của giáo viên.
            Việc rút lại không xóa điều người nhận đã đọc trước đó.
          </p>
        </TeacherConfirm>
      )}
    </>
  );
}
