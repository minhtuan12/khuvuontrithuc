import React, { useEffect, useState } from 'react';
import { useDeviceDocument } from '../lib/useDeviceDocument';
import { ArrowLeft, Settings, Star, Clock, BookOpen, Heart, Sprout, Utensils, Users, MessageCircle, ArrowUpRight } from 'lucide-react';
import type { LearningProgressStats } from '../constants/badgesData';
import { EMOTIONS, type EmotionRecord } from '../lib/wellbeing';
import './parent-dashboard.css';

type Tab = 'overview' | 'nutrition' | 'community' | 'emotions' | 'teacher';
type Post = { id: string; content: string; liked: boolean; comments: string[] };
type Note = { id: string; content: string; date: string };
type Props = {
  onBack: () => void; stars?: number; emotionHistory?: EmotionRecord[]; speak: (text: string) => void;
  stats?: LearningProgressStats; studySeconds?: number; onOpenSettings?: () => void; onCheckIn?: () => void;
  onOpenActivity?: (target: 'language' | 'cognitive' | 'aesthetic' | 'english') => void;
};
const tabs = [
  { id: 'overview', label: 'Tổng quan', icon: Sprout }, { id: 'nutrition', label: 'Dinh dưỡng', icon: Utensils },
  { id: 'community', label: 'Cộng đồng', icon: Users }, { id: 'emotions', label: 'Cảm xúc', icon: Heart },
  { id: 'teacher', label: 'Góc tâm sự', icon: MessageCircle },
] as const;
const dateLabel = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 'Chưa có ngày ghi lại' : new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(parsed);
};
export default function ParentDashboard({ onBack, stars = 0, emotionHistory = [], speak, stats, studySeconds = 0, onOpenSettings, onCheckIn, onOpenActivity }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState('');
  const read = <T,>(key: string, validate: (value: unknown) => value is T): T[] => {
    try { const value: unknown = JSON.parse(localStorage.getItem(key) || '[]'); if (!Array.isArray(value) || !value.every(validate)) throw new Error(); return value; }
    catch { setStorageError('Không đọc được nội dung đã lưu. Bạn vẫn có thể viết mới và thử lưu lại.'); return []; }
  };
  const [posts, setPosts, postsData] = useDeviceDocument<Post[]>('family-posts', () => read('garden-parent-posts-v1', (p): p is Post => !!p && typeof p === 'object' && typeof (p as Post).id === 'string' && typeof (p as Post).content === 'string' && typeof (p as Post).liked === 'boolean' && Array.isArray((p as Post).comments) && (p as Post).comments.every(c => typeof c === 'string')));
  const [notes, setNotes, notesData] = useDeviceDocument<Note[]>('teacher-notes', () => read('garden-parent-notes-v1', (p): p is Note => !!p && typeof p === 'object' && typeof (p as Note).id === 'string' && typeof (p as Note).content === 'string' && typeof (p as Note).date === 'string'));
  const [pendingNotice, setPendingNotice] = useState('');
  useEffect(() => {
    if (!pendingNotice) return;
    if (postsData.error || notesData.error) { setNotice(''); return; }
    if (!postsData.saving && !notesData.saving && !postsData.loading && !notesData.loading) { setNotice(pendingNotice); setPendingNotice(''); }
  }, [pendingNotice, postsData.saving, notesData.saving, postsData.loading, notesData.loading, postsData.error, notesData.error]);
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState('');
  const [comments, setComments] = useState<Record<string, string>>({});
  const persist = (key: string, value: unknown, done: () => void, message: string) => {
    try { localStorage.setItem(key, JSON.stringify(value)); setStorageError(''); }
    catch { setStorageError('Không lưu được bản dự phòng trên thiết bị.'); }
    done();
    setNotice('Đang lưu thay đổi lên máy chủ…');
    setPendingNotice(message);
  };
  const activities = [
    { target: 'language', emoji: '📖', label: 'Ngôn ngữ', count: stats?.speechCount ?? 0, hint: 'Lắng nghe và làm quen với chữ' },
    { target: 'cognitive', emoji: '🧩', label: 'Tư duy', count: (stats?.mathCount ?? 0) + (stats?.scienceCount ?? 0), hint: 'Khám phá số và thế giới quanh bé' },
    { target: 'aesthetic', emoji: '🎨', label: 'Sáng tạo', count: stats?.artCount ?? 0, hint: 'Nuôi dưỡng trí tưởng tượng' },
    { target: 'english', emoji: '🌍', label: 'Tiếng Anh', count: stats?.englishCount ?? 0, hint: 'Thêm một cách chào thế giới' },
  ] as const;
  const total = activities.reduce((sum, item) => sum + item.count, 0) + (stats?.physicalCount ?? 0) + (stats?.socialCount ?? 0);
  return <div className="parent-space">
    <header className="parent-header"><button className="parent-icon" onClick={onBack} aria-label="Về khu vườn"><ArrowLeft /></button><span className="parent-brand">🌱 Khu vườn tri thức <span>/ Dành cho ba mẹ</span></span><button className="parent-icon" disabled={!onOpenSettings} onClick={onOpenSettings} aria-label="Cài đặt"><Settings /></button></header>
    <main className="parent-main">
      <section className="parent-hero"><div className="parent-hero-copy"><span className="parent-eyebrow">CÙNG CON LỚN LÊN MỖI NGÀY</span><h1>Ba mẹ cùng con<br />ươm những điều hay.</h1><p>Mỗi khám phá nhỏ là một mầm xanh. Cùng nhìn lại hành trình của con hôm nay nhé!</p><button className="parent-primary" onClick={() => { setTab('emotions'); speak('Nhật ký cảm xúc của bé'); }}><Heart size={18} /> Lắng nghe cảm xúc của con</button></div><img src="/illustrations/garden-story.jpg" alt="Khu vườn cổ tích đầy cây xanh và hoa" /></section>
      <nav className="parent-tabs" aria-label="Nội dung dành cho phụ huynh">{tabs.map(({ id, label, icon: Icon }) => <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => { setTab(id); setNotice(''); speak(label); }}><Icon size={19} />{label}</button>)}</nav>
      {storageError && <p role="alert" className="parent-alert">{storageError}</p>}{notice && <p role="status" className="parent-notice">{notice}</p>}
      {(postsData.loading || notesData.loading) && <p role="status">Đang tải nội dung đã lưu…</p>}
      {[postsData, notesData].filter(item => item.error).map((item, index) => <p key={index} role="alert" className="parent-alert">{item.error} <button type="button" onClick={item.retry}>Thử lưu lại</button> · <button type="button" onClick={item.restoreRemote}>Tải bản đã lưu</button></p>)}
      {tab === 'overview' && <>
        <div className="parent-section-title"><div><span className="parent-eyebrow">NHỮNG MẦM XANH CỦA CON</span><h2>Hành trình khám phá</h2></div><span className="parent-chip">Đã ghi nhận trên ứng dụng</span></div>
        <div className="parent-stats">{[{ icon: Star, value: stars, unit: 'ngôi sao', label: 'Niềm vui tích lũy', color: 'sun' }, { icon: BookOpen, value: total, unit: 'lượt hoàn thành', label: 'Từng bước khám phá', color: 'leaf' }, { icon: Clock, value: Math.floor(Math.max(0, studySeconds) / 60), unit: 'phút hôm nay', label: 'Thời gian cùng ứng dụng', color: 'sky' }].map(({ icon: Icon, value, unit, label, color }) => <article className={`parent-stat ${color}`} key={label}><span className="parent-stat-icon"><Icon /></span><div><p>{label}</p><strong>{value} <small>{unit}</small></strong></div></article>)}</div>
        <div className="parent-overview-grid"><section className="parent-card"><h2>Con đã khám phá những gì?</h2><p className="parent-muted">Mỗi lượt hoàn thành đều đáng được ghi nhận.</p><div className="parent-activities">{activities.map(item => <button key={item.target} disabled={!onOpenActivity} onClick={() => onOpenActivity?.(item.target)}><span className="parent-activity-emoji">{item.emoji}</span><span><strong>{item.label}</strong><small>{item.hint}</small></span><span className="parent-activity-count">{item.count} lượt <ArrowUpRight size={15} /></span></button>)}</div></section><aside className="parent-card parent-together"><img src="/illustrations/school-hero.webp" alt="Ngôi trường nhỏ giữa khu vườn" /><h2>Một chút thời gian,<br />thật nhiều kết nối.</h2><p>Thử hỏi con: “Hôm nay điều gì làm con vui nhất?” rồi cùng lắng nghe câu chuyện của con.</p><button className="parent-secondary" onClick={() => setTab('emotions')}>Mở nhật ký cảm xúc <Heart size={17} /></button></aside></div>
      </>}
      {tab === 'emotions' && <section className="parent-card"><span className="parent-eyebrow">LẮNG NGHE KHÔNG PHÁN XÉT</span><h2>Nhật ký cảm xúc của con</h2><p className="parent-muted">Những cảm xúc con tự chọn là lời mở đầu cho cuộc trò chuyện cùng ba mẹ.</p>{emotionHistory.length === 0 ? <div className="parent-empty"><span>🌈</span><h3>Mỗi cảm xúc đều được chào đón</h3><p>Con chưa ghi lại cảm xúc nào. Ba mẹ hãy cùng con bắt đầu nhé.</p>{onCheckIn && <button className="parent-primary" onClick={onCheckIn}>Cùng con ghi lại cảm xúc</button>}</div> : <div className="parent-history">{[...emotionHistory].reverse().map((record, i) => { const emotion = EMOTIONS.find(e => e.id === record.emotion); return <article key={`${record.date}-${i}`}><span className="parent-emotion-emoji">{emotion?.emoji ?? '💛'}</span><div><h3>{emotion?.label ?? 'Cảm xúc của con'}</h3><time dateTime={record.date}>{dateLabel(record.date)}</time>{record.feedback && <p>{record.feedback}</p>}</div></article>; })}</div>}{emotionHistory.length > 0 && onCheckIn && <button className="parent-secondary" onClick={onCheckIn}>Ghi lại cảm xúc mới</button>}</section>}
      {tab === 'nutrition' && <section className="parent-card"><span className="parent-eyebrow">BỮA ĂN NHIỀU MÀU SẮC</span><h2>Gợi ý cho bữa cơm gia đình</h2><p className="parent-muted">Thực đơn mẫu để ba mẹ tham khảo. Hãy điều chỉnh theo độ tuổi, khẩu vị và dị ứng của con.</p><div className="parent-menu">{[['Thứ hai','Cháo yến mạch','Cơm, cá, canh bí đỏ','Sữa chua và chuối'],['Thứ ba','Bánh mì và trứng','Cơm, thịt, canh rau ngót','Cam và sữa'],['Thứ tư','Phở gà','Cơm, đậu phụ, rau luộc','Khoai lang'],['Thứ năm','Súp gà và ngô','Cơm, tôm, canh mướp','Sữa chua'],['Thứ sáu','Bún thịt','Cơm, gà, canh bí xanh','Táo cắt miếng']].map(([day, breakfast, lunch, snack]) => <article key={day}><h3>{day}</h3><p><strong>Bữa sáng</strong>{breakfast}</p><p><strong>Bữa trưa</strong>{lunch}</p><p><strong>Bữa phụ</strong>{snack}</p></article>)}</div></section>}
      {tab === 'community' && <section className="parent-card"><span className="parent-chip">Trên thiết bị này</span><h2>Góc chia sẻ của gia đình</h2><p className="parent-muted">Lưu những câu hỏi, ý tưởng và trao đổi cùng người thân khi dùng chung thiết bị. Nội dung chưa được chia sẻ tới cộng đồng bên ngoài.</p><form noValidate className="parent-form" onSubmit={e => { e.preventDefault(); if (!draft.trim()) return; const next = [{ id: crypto.randomUUID(), content: draft.trim(), liked: false, comments: [] }, ...posts]; persist('garden-parent-posts-v1', next, () => { setPosts(next); setDraft(''); }, 'Đã lưu chia sẻ trên thiết bị này.'); }}><label htmlFor="parent-post">Ba mẹ muốn chia sẻ điều gì?</label><textarea className="resize-none" style={{ resize: 'none', overflowY: 'auto', minHeight: 120 }} id="parent-post" maxLength={2000} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Một hoạt động con yêu thích, một điều muốn hỏi…" /><button className="parent-primary" disabled={postsData.loading || postsData.saving || !draft.trim()}>Lưu chia sẻ</button></form>{posts.length === 0 && <div className="parent-empty"><span>💬</span><p>Chưa có chia sẻ. Lưu ý tưởng đầu tiên của gia đình ở trên nhé.</p></div>}<div className="parent-posts">{posts.map(post => <article key={post.id}><strong>Gia đình mình</strong><p>{post.content}</p><button className="parent-secondary" disabled={postsData.loading || postsData.saving} aria-pressed={post.liked} onClick={() => { const next = posts.map(p => p.id === post.id ? { ...p, liked: !p.liked } : p); persist('garden-parent-posts-v1', next, () => setPosts(next), post.liked ? 'Đã bỏ yêu thích.' : 'Đã lưu yêu thích.'); }}><Heart size={17} fill={post.liked ? 'currentColor' : 'none'} />{post.liked ? 'Đã yêu thích' : 'Yêu thích'}</button>{post.comments.map((comment, i) => <p className="parent-comment" key={i}>{comment}</p>)}<form noValidate className="parent-comment-form" onSubmit={e => { e.preventDefault(); const content = comments[post.id]?.trim(); if (!content) return; const next = posts.map(p => p.id === post.id ? { ...p, comments: [...p.comments, content] } : p); persist('garden-parent-posts-v1', next, () => { setPosts(next); setComments({ ...comments, [post.id]: '' }); }, 'Đã lưu bình luận trên thiết bị này.'); }}><input aria-label="Viết bình luận" maxLength={1000} placeholder="Viết bình luận…" value={comments[post.id] || ''} onChange={e => setComments({ ...comments, [post.id]: e.target.value })} /><button className="parent-secondary" disabled={postsData.loading || postsData.saving || !comments[post.id]?.trim()}>Lưu bình luận</button></form></article>)}</div></section>}
      {tab === 'teacher' && <section className="parent-card"><span className="parent-chip">Trên thiết bị này</span><h2>Góc tâm sự cùng cô</h2><p className="parent-muted">Ghi lại điều muốn trao đổi với giáo viên để dùng khi gặp cô. Ghi chú được lưu trên thiết bị và chưa được gửi tới giáo viên.</p><form noValidate className="parent-form" onSubmit={e => { e.preventDefault(); if (!note.trim()) return; const next = [{ id: crypto.randomUUID(), content: note.trim(), date: new Date().toISOString() }, ...notes]; persist('garden-parent-notes-v1', next, () => { setNotes(next); setNote(''); }, 'Đã lưu ghi chú. Ba mẹ có thể mở lại khi gặp cô.'); }}><label htmlFor="parent-note">Điều ba mẹ muốn trao đổi</label><textarea className="resize-none" style={{ resize: 'none', overflowY: 'auto', minHeight: 120 }} id="parent-note" value={note} maxLength={4000} onChange={e => setNote(e.target.value)} placeholder="Con hào hứng với điều gì? Ba mẹ muốn hỏi cô điều gì?" /><button className="parent-primary" disabled={notesData.loading || notesData.saving || !note.trim()}>Lưu ghi chú</button></form><div className="parent-posts">{notes.map(item => <article key={item.id}><time dateTime={item.date}>{dateLabel(item.date)}</time><p>{item.content}</p></article>)}</div>{notes.length === 0 && <p className="parent-muted">Chưa có ghi chú đã lưu.</p>}</section>}
      <footer className="parent-footer">🌼 Cùng con lớn lên, từng chút một.</footer>
    </main>
  </div>;
}

