import { useEffect, useState } from 'react';
import { ArrowRight, Check, Ear, Flower2, MessageCircle, MousePointer2, Sparkles } from 'lucide-react';
import { ENGLISH_AGES, getEnglishRoadmap, type EnglishAge } from '../lib/englishCatalog';
import type { EnglishLessonTheme } from '../constants/englishData';
import { getEnglishProgressSyncError, getEnglishSession, getGuestEnglishProgress, restoreGuestEnglishProgress, syncEnglishProgress, type EnglishProgress } from '../lib/englishSync';

import { Mascot } from './RoadmapMascot';
import './english-roadmap.css';

interface EnglishRoadmapProps {
  initialAge: EnglishAge;
  onOpenLesson: (age: EnglishAge, lesson: EnglishLessonTheme) => void;
}

const topicArtwork: Record<string, string> = {
  colors: '/illustrations/colors-card.webp',
  animals: '/illustrations/animals-card.webp',
  plants: '/illustrations/garden-card.webp',
};

export default function EnglishRoadmap({ initialAge, onOpenLesson }: EnglishRoadmapProps) {
  const [age, setAge] = useState<EnglishAge>(initialAge);
  const [progress, setProgress] = useState<Record<string, EnglishProgress>>(getGuestEnglishProgress);
  const [syncError, setSyncError] = useState(getEnglishProgressSyncError);
  useEffect(() => {
    const update = () => { setProgress(getGuestEnglishProgress()); setSyncError(getEnglishProgressSyncError()); };
    const synchronize = () => {
      update();
      void syncEnglishProgress().then(update).catch(() => {
        update();
        setSyncError('Chưa đồng bộ được tiến độ. Hãy thử lại.');
      });
    };
    window.addEventListener('english-progress-changed', update);
    window.addEventListener('english-session-changed', synchronize);
    window.addEventListener('storage', synchronize);
    // The sync result can belong to an older session; always reread the active cache.
    synchronize();
    return () => {
      window.removeEventListener('english-progress-changed', update);
      window.removeEventListener('english-session-changed', synchronize);
      window.removeEventListener('storage', synchronize);
    };
  }, []);
  const [selectedGroup, setSelectedGroup] = useState('');
  const groups = getEnglishRoadmap(age);
  const group = groups.find(item => item.id === selectedGroup) ?? groups[0];
  const lessonCount = groups.reduce((total, item) => total + item.lessons.length, 0);
  const completedCount = groups.flatMap(item => item.lessons).filter(lesson => progress[lesson.id]?.completedAt).length;
  const completed = group.lessons.filter(lesson => progress[lesson.id]?.completedAt).length;
  const next = group.lessons.find(lesson => !progress[lesson.id]?.completedAt) ?? group.lessons[0];

  return (
    <section aria-labelledby="english-roadmap-title" className="english-roadmap">
      {syncError && <p role="status" className="rounded-xl bg-amber-50 p-3 text-amber-900">{syncError} <button type="button" onClick={() => void syncEnglishProgress().then(() => setSyncError(getEnglishProgressSyncError())).catch(() => setSyncError('Chưa đồng bộ được tiến độ. Hãy thử lại.'))} className="underline">Thử lại</button>{!getEnglishSession() && <button type="button" onClick={() => void restoreGuestEnglishProgress()} className="ml-3 underline">Tải bản đã lưu</button>}</p>}
      <div className="roadmap-layout">
        <div className="roadmap-topline"><span className="path-eyebrow"><Sparkles size={16} aria-hidden="true" /> MỖI NGÀY MỘT KHÁM PHÁ</span></div>
        <div className="roadmap-welcome">
          <div>
            <h2 id="english-roadmap-title">Lớn lên cùng<br /><span>từng từ nhỏ.</span></h2>
            <p>Một chút lắng nghe, một lần thử nói.<br />Cùng Mầm làm khu vườn tiếng Anh nở hoa!</p>
            <div className="roadmap-skills">
              <span><Ear size={18} aria-hidden="true" /> Nghe</span>
              <span><MessageCircle size={18} aria-hidden="true" /> Nói theo</span>
              <span><MousePointer2 size={18} aria-hidden="true" /> Chọn đúng</span>
            </div>
          </div>
          <div className="roadmap-welcome__art">
            <img src="/illustrations/garden-story.jpg" alt="Khu vườn xanh với cây táo và những bông hoa" width="800" height="457" />
            <div className="roadmap-mam"><Mascot mood="cheer" /><span lang="en">Let's grow together!</span></div>
          </div>
        </div>
        <div className="roadmap-context">
          <label className="roadmap-age">Lộ trình dành cho bé
            <select value={age} onChange={event => { setAge(event.target.value as EnglishAge); setSelectedGroup(''); }}>
              {ENGLISH_AGES.map(item => <option key={item.id} value={item.id}>{item.title} · {item.id} tuổi</option>)}
            </select>
          </label>
          <span className="roadmap-flowers"><Flower2 aria-hidden="true" /><strong>{completedCount}/{lessonCount}</strong> bông hoa khám phá</span>
        </div>
        <nav className="roadmap-worlds" aria-label="Chọn chủ đề">
          {groups.map((item, index) => (
            <button type="button" key={item.id} className={`roadmap-world ${group.id === item.id ? 'is-selected' : ''}`} aria-pressed={group.id === item.id} onClick={() => setSelectedGroup(item.id)}>
              <span className="roadmap-world-icon" aria-hidden="true">{topicArtwork[item.id] ? <img src={topicArtwork[item.id]} alt="" width="58" height="58" className="roadmap-world-artwork" /> : item.icon}</span>
              <span><small>Khu vườn {index + 1}</small><strong>{item.name}</strong></span>
              {group.id === item.id && <Check size={18} aria-hidden="true" />}
            </button>
          ))}
        </nav>
        <section className="roadmap-garden" aria-labelledby="path-title">
          <div className="roadmap-garden__header">
            <div><span className="path-eyebrow">{group.icon} KHÁM PHÁ · {group.lessons.length} BÀI HỌC NHỎ</span><h3 id="path-title">{group.name}</h3><p>Cùng Mầm nghe, nói và khám phá từng chủ đề tiếng Anh.</p></div>
            <div className="roadmap-bouquet" aria-label={`${completed} trên ${group.lessons.length} bài đã khám phá`}>
              {group.lessons.map(lesson => <Flower2 key={lesson.id} className={progress[lesson.id]?.completedAt ? 'is-bloomed' : ''} aria-hidden="true" />)}
              <span>{completed}/{group.lessons.length} Đã khám phá</span>
            </div>
          </div>
          <div className="roadmap-trail">
            <ol>
              {group.lessons.map((lesson, index) => {
                const done = !!progress[lesson.id]?.completedAt;
                const current = lesson.id === next.id;
                return <li key={lesson.id} className={`roadmap-stop roadmap-stop--${index % 4} ${done ? 'is-complete' : ''} ${current ? 'is-next' : ''}`}>
                  <span className="roadmap-stop__tag">{done ? 'Đã khám phá' : current ? 'Mầm chờ bé ở đây!' : `Bài ${index + 1}`}</span>
                  <button type="button" className="roadmap-stop__button" onClick={() => onOpenLesson(age, lesson)} aria-label={`Học bài ${index + 1}: ${lesson.name}${done ? ' · Đã khám phá' : ''}`}>
                    <span className="roadmap-lesson-icon" aria-hidden="true">{lesson.icon}</span>
                    <span className="roadmap-stop__number">{done ? <Check size={20} aria-hidden="true" /> : index + 1}</span>
                  </button>
                  <h4>{lesson.name}</h4><span className="roadmap-stop__english" lang="en">{lesson.englishName}</span>
                  <span className="roadmap-stop__caption">{lesson.vocabulary.length} từ · Nghe · Nói · Chọn</span>
                </li>;
              })}
            </ol>
          </div>
          <div className="roadmap-garden__footer">
            <span><Flower2 aria-hidden="true" /> Bé có thể chọn bất kỳ bài nào và học lại thoải mái.</span>
            <button type="button" className="roadmap-start" onClick={() => onOpenLesson(age, next)}>{completed === group.lessons.length ? 'Cùng chơi lại' : 'Đi cùng Mầm'}<ArrowRight size={20} aria-hidden="true" /></button>
          </div>
        </section>
        <div className="roadmap-note"><p>Hoa ghi lại những lần bé trải nghiệm, không phải điểm số hay chứng nhận thành thạo.</p></div>
      </div>
    </section>
  );
}

