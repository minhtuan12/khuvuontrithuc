import React from 'react';
import { ArrowLeft, BookOpen, Clock, Star } from 'lucide-react';
import type { LearningProgressStats } from '../constants/badgesData';
import '../screens/parent-dashboard.css';

type LearningReportProps = {
  stats: LearningProgressStats;
  stars: number;
  studySeconds: number;
  onBack: () => void;
};

export default function LearningReport({ stats, stars, studySeconds, onBack }: LearningReportProps) {
  const count = (value: number) => Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const categories = [
    { label: 'Thể chất', emoji: '⚽', value: count(stats.physicalCount), detail: 'Vận động và khám phá cơ thể' },
    { label: 'Nhận thức', emoji: '🧩', value: count(stats.mathCount) + count(stats.scienceCount), detail: 'Toán học và khoa học' },
    { label: 'Ngôn ngữ', emoji: '📖', value: count(stats.speechCount), detail: 'Lắng nghe, làm quen với chữ' },
    { label: 'Tình cảm & xã hội', emoji: '💛', value: count(stats.socialCount), detail: 'Kết nối với mọi người' },
    { label: 'Thẩm mỹ', emoji: '🎨', value: count(stats.artCount), detail: 'Sáng tạo và cảm nhận cái đẹp' },
    { label: 'Tiếng Anh', emoji: '🌍', value: count(stats.englishCount), detail: 'Khám phá thêm một ngôn ngữ' },
  ];
  const total = categories.reduce((sum, category) => sum + category.value, 0);
  const summaries = [
    { label: 'Từng bước khám phá', value: total, unit: 'lượt hoàn thành', icon: BookOpen, tone: 'leaf' },
    { label: 'Niềm vui tích lũy', value: count(stars), unit: 'ngôi sao', icon: Star, tone: 'sun' },
    { label: 'Thời gian cùng ứng dụng', value: Math.floor(count(studySeconds) / 60), unit: 'phút hôm nay', icon: Clock, tone: 'sky' },
  ];

  return (
    <div className="parent-space" style={{ minHeight: '100%' }}>
      <header className="parent-header">
        <button className="parent-icon" onClick={onBack} aria-label="Quay lại danh sách hoạt động">
          <ArrowLeft aria-hidden="true" />
        </button>
        <span className="parent-brand">🌱 Hành trình của con</span>
      </header>
      <main className="parent-main">
        <section className="parent-hero" style={{ marginBottom: 25 }}>
          <div className="parent-hero-copy">
            <span className="parent-eyebrow">MỖI KHÁM PHÁ LÀ MỘT MẦM XANH</span>
            <h1>Nhìn lại những điều<br />con đã khám phá.</h1>
            <p>Những hoạt động con hoàn thành được ghi lại ở đây. Cùng con kể về điều con thích nhất nhé!</p>
          </div>
          <img src="/illustrations/garden-story.jpg" alt="Khu vườn cổ tích xanh mát" />
        </section>

        <div className="parent-stats">
          {summaries.map(({ label, value, unit, icon: Icon, tone }) => (
            <article className={`parent-stat ${tone}`} key={label}>
              <span className="parent-stat-icon"><Icon aria-hidden="true" /></span>
              <div><p>{label}</p><strong>{value} <small>{unit}</small></strong></div>
            </article>
          ))}
        </div>

        <section className="parent-card" aria-labelledby="report-categories">
          <span className="parent-eyebrow">SÁU KHU VƯỜN KHÁM PHÁ</span>
          <h2 id="report-categories">Những lượt con đã hoàn thành</h2>
          <p className="parent-muted">Số lượt tích lũy đã ghi nhận trên ứng dụng, bao gồm những lần con chơi lại.</p>
          <dl className="parent-menu">
            {categories.map(category => (
              <div key={category.label} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderRadius: 18, background: '#f6faf3', padding: '16px 18px' }}>
                <dt style={{ flex: '1 1 180px', display: 'flex', alignItems: 'center', gap: 12 }}><span aria-hidden="true" style={{ fontSize: 30 }}>{category.emoji}</span>
                <span>
                  <strong style={{ fontWeight: 900, color: '#047857' }}>{category.label}</strong>
                  <span className="parent-muted" style={{ display: 'block', margin: '3px 0 0', fontSize: 12 }}>{category.detail}</span>
                </span></dt>
                <dd style={{ margin: 0, fontWeight: 900, fontSize: 14 }}>{category.value} lượt hoàn thành</dd>
              </div>
            ))}
          </dl>
          {total === 0 && (
            <div className="parent-empty">
              <span aria-hidden="true">🌱</span>
              <h3>Hành trình đang chờ con</h3>
              <p>Chưa có lượt hoàn thành nào. Cùng chọn một hoạt động con yêu thích để bắt đầu nhé!</p>
              <button className="parent-primary" onClick={onBack}>Chọn hoạt động</button>
            </div>
          )}
        </section>
        <footer className="parent-footer">🌼 Mỗi bạn nhỏ lớn lên theo nhịp riêng của mình.</footer>
      </main>
    </div>
  );
}

