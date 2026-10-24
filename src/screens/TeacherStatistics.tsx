import { Activity, Award, Search, Sparkles, Star, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SaveTeacherPlan from "../components/SaveTeacherPlan";
import TeacherProgressDetails from "../components/TeacherProgressDetails";
import { errorMessage, isCancelled, type TeacherStudent, useScopedTeacherApi } from "../lib/teacherApi";

const learningLabels: Record<string, string> = {
  mathCount: "Toán", mathStreak: "Chuỗi toán", speechCount: "Ngôn ngữ", speechStreak: "Chuỗi ngôn ngữ",
  streakCount: "Chuỗi học", bestStreak: "Chuỗi tốt nhất", scienceCount: "Khám phá", englishCount: "Tiếng Anh",
  artCount: "Nghệ thuật", physicalCount: "Vận động", socialCount: "Kỹ năng xã hội",
};

export default function TeacherStatistics() {
  const api = useScopedTeacherApi();
  const loadVersion = useRef(0);
  const [items, setItems] = useState<TeacherStudent[]>([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState("");
  const [next, setNext] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [student, setStudent] = useState<TeacherStudent | null>(null);
  const [age, setAge] = useState("");
  const [goal, setGoal] = useState("");
  const [kind, setKind] = useState("lesson");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const version = ++loadVersion.current;
    setBusy(true); setError("");
    try {
      const result = await api.request<{ items: TeacherStudent[]; nextCursor: string | null; total: number; activeCount: number }>(`/api/teacher/students?${new URLSearchParams({ query: search, cursor })}`);
      if (version !== loadVersion.current) return;
      setItems(result.items); setNext(result.nextCursor); setTotal(result.total); setActive(result.activeCount);
    } catch (caught) { if (!isCancelled(caught)) setError(errorMessage(caught)); }
    finally { if (!api.signal.aborted) setBusy(false); }
  }

  useEffect(() => { void load(); }, [search, cursor]);

  function selectStudent(value: TeacherStudent) {
    setStudent(value); setAge(value.profile.ageBand || ""); setContent("");
  }

  async function generate() {
    if (!student || busy) return;
    setBusy(true); setError("");
    try {
      await api.request(`/api/teacher/students/${student.id}/profile`, { method: "PATCH", body: JSON.stringify({ ageBand: age, nickname: student.profile.nickname || "" }) });
      const result = await api.request<{ content: string }>(`/api/teacher/students/${student.id}/plans/generate`, { method: "POST", body: JSON.stringify({ ageBand: age, kind, goal, durationMinutes: 25 }) });
      setContent(result.content);
    } catch (caught) { if (!isCancelled(caught)) setError(errorMessage(caught)); }
    finally { if (!api.signal.aborted) setBusy(false); }
  }

  return <section className="tw-students-workspace">
    <div className="tw-student-summary"><div><h2>Tiến độ học tập</h2><p>Chọn một học sinh để xem thông tin học tập chi tiết.</p></div><dl><div><dt>Tổng tài khoản</dt><dd>{total}</dd></div><div><dt>Có dữ liệu</dt><dd>{active}</dd></div></dl></div>
    <div className="tw-student-layout">
      <aside className="tw-student-directory" aria-label="Danh sách tài khoản học sinh">
        <form className="tw-student-search" noValidate onSubmit={(event) => { event.preventDefault(); setSearch(query.trim()); setCursor(""); }}><label htmlFor="student-search">Tìm tên hoặc tài khoản</label><div><Search size={18} aria-hidden="true" /><input id="student-search" value={query} maxLength={100} onChange={(event) => setQuery(event.target.value)} /><button type="submit">Tìm</button></div></form>
        {busy && !student && <p className="tw-status" role="status">Đang tải…</p>}
        {error && <p role="alert" className="tw-error">{error} <button type="button" onClick={() => void load()}>Thử tải lại</button></p>}
        <div className="tw-student-list">{items.map((item) => <article className={`tw-student-item${student?.id === item.id ? " is-selected" : ""}`} key={item.id}><div className="tw-student-avatar" aria-hidden="true"><UserRound size={22} /></div><div><h3>{item.fullName}</h3><p>@{item.username}</p><span className={item.summary.hasActivity ? "has-activity" : ""}>{item.summary.hasActivity ? "Có dữ liệu học tập" : "Chưa có dữ liệu"}</span></div><button type="button" aria-pressed={student?.id === item.id} onClick={() => selectStudent(item)}>Xem tiến độ</button></article>)}{!busy && !items.length && <p className="tw-empty-note">Chưa có tài khoản phù hợp.</p>}</div>
        <div className="tw-student-pagination"><button type="button" disabled={!cursor} onClick={() => setCursor("")}>Trang đầu</button><button type="button" disabled={!next} onClick={() => setCursor(next!)}>Trang sau</button></div>
      </aside>
      <div className="tw-student-detail-column">
        {student ? <article className="tw-student-detail" aria-live="polite">
          <header className="tw-student-detail-header"><div><span className="tw-kicker">TIẾN ĐỘ CỦA HỌC SINH</span><h3>{student.fullName}</h3><p>@{student.username}{student.profile.ageBand ? ` · ${student.profile.ageBand} tuổi` : ""}</p></div><button type="button" onClick={() => setStudent(null)}>Đóng</button></header>
          <dl className="tw-progress-metrics"><div><Star size={19} aria-hidden="true" /><dt>Sao học tập</dt><dd>{student.summary.stars ?? "—"}</dd></div><div><Sparkles size={19} aria-hidden="true" /><dt>Sao trò chơi</dt><dd>{student.summary.gameStars ?? "—"}</dd></div><div><Award size={19} aria-hidden="true" /><dt>Huy hiệu</dt><dd>{student.summary.badges?.length ?? "—"}</dd></div></dl>
          <section className="tw-progress-section" aria-labelledby="learning-fields-heading"><header className="tw-section-heading"><span className="tw-section-icon is-amber" aria-hidden="true"><Activity size={19} /></span><div><h4 id="learning-fields-heading">Lượt hoạt động theo lĩnh vực</h4><p>Tổng lượt được ghi nhận ở từng nội dung</p></div></header>{student.summary.learningStats ? <dl className="tw-learning-stats">{Object.entries(student.summary.learningStats).map(([key, value]) => <div key={key}><dt>{learningLabels[key] || key}</dt><dd>{String(value)} <small>lượt</small></dd></div>)}</dl> : <p className="tw-empty-note">Chưa có dữ liệu hoạt động.</p>}</section>
          <TeacherProgressDetails student={student} />
          <section className="tw-progress-section tw-plan-panel" aria-labelledby="student-plan-heading"><header className="tw-section-heading"><span className="tw-section-icon" aria-hidden="true"><Sparkles size={19} /></span><div><h4 id="student-plan-heading">Soạn gợi ý riêng cho bé</h4><p>Mẫu theo nhóm tuổi và mục tiêu hoạt động</p></div></header><div className="tw-plan-form"><label>Nhóm tuổi<select value={age} onChange={(event) => setAge(event.target.value)}><option value="">Cô chọn nhóm tuổi</option>{["3-4", "4-5", "5-6"].map((value) => <option key={value} value={value}>{value} tuổi</option>)}</select></label><label>Loại bài<select value={kind} onChange={(event) => setKind(event.target.value)}><option value="lesson">Giáo án</option><option value="exercise">Bài tập</option></select></label><label className="tw-plan-goal">Mục tiêu hoạt động<textarea className="resize-none" value={goal} maxLength={500} onChange={(event) => setGoal(event.target.value)} /></label></div><p className="tw-muted">AI chưa xử lý dữ liệu cá nhân của học sinh.</p><button type="button" className="tw-primary" disabled={busy || !age || !goal.trim()} onClick={() => void generate()}>Soạn bản gợi ý</button>{content && <div className="tw-generated-plan"><textarea className="resize-none" aria-label="Bản gợi ý cho bé" value={content} onChange={(event) => setContent(event.target.value)} rows={14} /><p>Cô có thể chỉnh sửa và lưu nội dung trước khi dạy.</p><SaveTeacherPlan title={kind === "lesson" ? "Giáo án theo mục tiêu" : "Bài tập theo mục tiêu"} content={content} activity={goal} ageBand={age as "3-4" | "4-5" | "5-6"} studentAccountId={student.id} source="manual" /></div>}</section>
        </article> : <div className="tw-student-placeholder"><div><UserRound size={34} aria-hidden="true" /></div><h3>Chọn một học sinh</h3><p>Bấm “Xem tiến độ” trong danh sách bên trái để xem các hoạt động, bài học và kết quả gần nhất.</p></div>}
      </div>
    </div>
  </section>;
}
