import { useEffect, useRef, useState } from "react";
import {
  useScopedTeacherApi,
  errorMessage,
  isCancelled,
  type TeacherStudent,
} from "../lib/teacherApi";
import SaveTeacherPlan from "../components/SaveTeacherPlan";
import TeacherProgressDetails from "../components/TeacherProgressDetails";

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
    setBusy(true);
    setError("");
    try {
      const r = await api.request<{
        items: TeacherStudent[];
        nextCursor: string | null;
        total: number;
        activeCount: number;
      }>(
        `/api/teacher/students?${new URLSearchParams({ query: search, cursor })}`,
      );
      if (version !== loadVersion.current) return;
      setItems(r.items);
      setNext(r.nextCursor);
      setTotal(r.total);
      setActive(r.activeCount);
    } catch (e) {
      if (!isCancelled(e)) setError(errorMessage(e));
    } finally {
      if (!api.signal.aborted) setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, [search, cursor]);
  async function generate() {
    if (!student || busy) return;
    setBusy(true);
    setError("");
    try {
      await api.request(`/api/teacher/students/${student.id}/profile`, {
        method: "PATCH",
        body: JSON.stringify({
          ageBand: age,
          nickname: student.profile.nickname || "",
        }),
      });
      const r = await api.request<{ content: string }>(
        `/api/teacher/students/${student.id}/plans/generate`,
        {
          method: "POST",
          body: JSON.stringify({
            ageBand: age,
            kind,
            goal,
            durationMinutes: 25,
          }),
        },
      );
      setContent(r.content);
    } catch (e) {
      if (!isCancelled(e)) setError(errorMessage(e));
    } finally {
      if (!api.signal.aborted) setBusy(false);
    }
  }
  return (
    <section className="tw-card">
      <h2>Tiến độ học tập</h2>
      <p>
        {total} tài khoản học sinh · {active} tài khoản có dữ liệu
      </p>
      <form
        className="tw-actions"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(query.trim());
          setCursor("");
        }}
      >
        <label>
          Tìm tên hoặc tài khoản
          <input
            value={query}
            maxLength={100}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button>Tìm học sinh</button>
      </form>
      {busy && <p role="status">Đang tải…</p>}
      {error && (
        <p role="alert" className="tw-error">
          {error}
          <button onClick={() => void load()}>Thử tải lại</button>
        </p>
      )}
      <div className="tw-list">
        {items.map((s) => (
          <article className="tw-list-item" key={s.id}>
            <h3>{s.fullName}</h3>
            <p>@{s.username}</p>
            <p>
              {s.summary.hasActivity
                ? "Có dữ liệu học tập"
                : "Chưa có dữ liệu học tập"}
            </p>
            <button
              onClick={() => {
                setStudent(s);
                setAge(s.profile.ageBand || "");
                setContent("");
              }}
            >
              Xem tiến độ
            </button>
          </article>
        ))}
      </div>
      {!busy && !items.length && <p>Chưa có tài khoản phù hợp.</p>}
      <div className="tw-actions">
        <button disabled={!cursor} onClick={() => setCursor("")}>
          Trang đầu
        </button>
        <button disabled={!next} onClick={() => setCursor(next!)}>
          Trang sau
        </button>
      </div>
      {student && (
        <section className="tw-card">
          <h3>{student.fullName}</h3>
          <p>
            Sao học tập: {student.summary.stars ?? "Chưa ghi nhận"} · Sao trò
            chơi: {student.summary.gameStars ?? "Chưa ghi nhận"}
          </p>
          <p>Huy hiệu: {student.summary.badges?.length ?? "Chưa ghi nhận"}</p>
          <TeacherProgressDetails student={student} />
          <h4>Lượt hoạt động theo lĩnh vực</h4>
          {student.summary.learningStats ? (
            <dl>
              {Object.entries(student.summary.learningStats).map(
                ([key, value]) => (
                  <div key={key}>
                    <dt>
                      {(
                        {
                          mathCount: "Toán",
                          mathStreak: "Chuỗi toán",
                          speechCount: "Ngôn ngữ",
                          speechStreak: "Chuỗi ngôn ngữ",
                          streakCount: "Chuỗi học",
                          bestStreak: "Chuỗi tốt nhất",
                          scienceCount: "Khám phá",
                          englishCount: "Tiếng Anh",
                          artCount: "Nghệ thuật",
                          physicalCount: "Vận động",
                          socialCount: "Kỹ năng xã hội",
                        } as Record<string, string>
                      )[key] || key}
                    </dt>
                    <dd>{String(value)}</dd>
                  </div>
                ),
              )}
            </dl>
          ) : (
            <p>Chưa có dữ liệu.</p>
          )}
          <p>
            Kết quả game tiếng Anh:{" "}
            {student.summary.gardenProgress
              ? Object.keys(student.summary.gardenProgress).length
              : 0}{" "}
            mục. Độ chính xác lưu là kết quả tốt nhất, không phải trung bình.
          </p>
          <p>
            Thời gian và hoạt động chỉ phản ánh ngày đang được lưu, chưa có biểu
            đồ theo tuần.
          </p>
          <label>
            Nhóm tuổi
            <select value={age} onChange={(e) => setAge(e.target.value)}>
              <option value="">Cô chọn nhóm tuổi</option>
              {["3-4", "4-5", "5-6"].map((a) => (
                <option key={a} value={a}>
                  {a} tuổi
                </option>
              ))}
            </select>
          </label>
          <label>
            Mục tiêu hoạt động
            <textarea
              className="resize-none"
              value={goal}
              maxLength={500}
              onChange={(e) => setGoal(e.target.value)}
            />
          </label>
          <label>
            Loại bài
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="lesson">Giáo án</option>
              <option value="exercise">Bài tập</option>
            </select>
          </label>
          <p>
            Mẫu theo tuổi và mục tiêu; AI xử lý dữ liệu cá nhân hiện chưa bật.
          </p>
          <button
            disabled={busy || !age || !goal.trim()}
            onClick={() => void generate()}
          >
            Soạn bản gợi ý
          </button>
          {content && (
            <>
              <textarea
                className="resize-none"
                aria-label="Bản gợi ý cho bé"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
              />
              <p>Cô có thể chỉnh sửa và lưu nội dung trước khi dạy.</p>
              <SaveTeacherPlan
                title={
                  kind === "lesson"
                    ? "Giáo án theo mục tiêu"
                    : "Bài tập theo mục tiêu"
                }
                content={content}
                activity={goal}
                ageBand={age as "3-4" | "4-5" | "5-6"}
                studentAccountId={student.id}
                source="manual"
              />
            </>
          )}
          <button onClick={() => setStudent(null)}>Đóng tiến độ</button>
        </section>
      )}
    </section>
  );
}
