import { BookOpen, CalendarDays, Clock3, Gamepad2 } from "lucide-react";
import type { TeacherStudent } from "../lib/teacherApi";
import { dateLabel } from "../lib/teacherApi";

const gameNames: Record<string, string> = {
  match: "Nối hình", reveal: "Mở ô đoán hình", bee: "Ong ghép chữ",
  basket: "Giỏ mua sắm", odd: "Tìm bạn khác nhóm", train: "Tàu ghép câu",
};

export default function TeacherProgressDetails({ student }: { student: TeacherStudent }) {
  const summary = student.summary;
  const lessons = Object.entries(summary.englishProgress || {});
  const games = Object.entries(summary.gardenProgress || {});
  return <div className="tw-progress-details">
    <section className="tw-progress-section" aria-labelledby="english-lessons-heading">
      <header className="tw-section-heading"><span className="tw-section-icon" aria-hidden="true"><BookOpen size={19} /></span><div><h4 id="english-lessons-heading">Bài tiếng Anh</h4><p>{lessons.length} bài đã được ghi nhận</p></div></header>
      {lessons.length ? <ul className="tw-lesson-list">{lessons.map(([id, value]) => { const progress = value as Record<string, unknown>; const completed = Boolean(progress.completedAt); return <li key={id}><span><strong>{id}</strong><small>{completed ? "Đã hoàn thành" : "Đã mở"}</small></span>{typeof progress.completedAt === "string" && <time>{dateLabel(progress.completedAt)}</time>}</li>; })}</ul> : <p className="tw-empty-note">Chưa ghi nhận bài học.</p>}
    </section>
    <section className="tw-progress-section" aria-labelledby="english-games-heading">
      <header className="tw-section-heading"><span className="tw-section-icon is-violet" aria-hidden="true"><Gamepad2 size={19} /></span><div><h4 id="english-games-heading">Trò chơi tiếng Anh</h4><p>{games.length} kết quả đã được ghi nhận</p></div></header>
      {games.length ? <div className="tw-game-list">{games.map(([key, value]) => { const progress = value as Record<string, unknown>; const [game, topic, age] = key.split(":"); return <article key={key}><strong>{gameNames[game] || game}</strong><span className="tw-game-context">{topic} · {age} tuổi</span><div className="tw-game-metrics"><span><b>{String(progress.runs)}</b> lượt chơi</span><span><b>{String(progress.words)}</b> lượt luyện tập</span><span><b>{String(progress.bestAccuracy)}%</b> tốt nhất</span></div><small>Lần gần nhất: {dateLabel(String(progress.lastPlayed))}</small></article>; })}</div> : <p className="tw-empty-note">Chưa ghi nhận kết quả trò chơi.</p>}
    </section>
    <section className="tw-progress-section" aria-labelledby="current-day-heading">
      <header className="tw-section-heading"><span className="tw-section-icon is-sky" aria-hidden="true"><CalendarDays size={19} /></span><div><h4 id="current-day-heading">Ngày đang lưu</h4><p>Dữ liệu gần nhất trên hệ thống</p></div></header>
      <div className="tw-day-summary"><div><Clock3 size={18} aria-hidden="true" /><span><small>Thời gian học</small><strong>{summary.studyTime ? `${Math.floor(Number(summary.studyTime.seconds) / 60)} phút` : "Chưa ghi nhận"}</strong>{summary.studyTime && <small>{String(summary.studyTime.day)}</small>}</span></div><div><CalendarDays size={18} aria-hidden="true" /><span><small>Hoạt động</small><strong>{summary.dailyActivity ? `${String(summary.dailyActivity.count)} lượt` : "Chưa ghi nhận"}</strong>{summary.dailyActivity && <small>{String(summary.dailyActivity.day)}</small>}</span></div></div>
      <p className="tw-muted">Lượt luyện tập không phải số từ đã thuộc. Kết quả tốt nhất không phải độ chính xác trung bình.</p>
    </section>
  </div>;
}
