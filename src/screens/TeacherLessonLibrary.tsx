import { useEffect, useRef, useState } from 'react';
import { useScopedTeacherApi, isCancelled, errorMessage, dateLabel, type TeacherPlan } from '../lib/teacherApi';
import TeacherLessonEditor from '../components/TeacherLessonEditor';
import TeacherWordUpload from '../components/TeacherWordUpload';

export default function TeacherLessonLibrary({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const api = useScopedTeacherApi();
  const [items, setItems] = useState<TeacherPlan[]>([]);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('');
  const [age, setAge] = useState('');
  const [filters, setFilters] = useState({ query: '', source: '', ageBand: '' });
  const [cursor, setCursor] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editor, setEditor] = useState<string | null | undefined>(undefined);
  const [upload, setUpload] = useState(false);
  const generation = useRef(0);
  async function load() {
    const current = ++generation.current; setLoading(true); setError('');
    try { const result = await api.request<{ items: TeacherPlan[]; nextCursor: string | null }>(`/api/teacher/lesson-plans?${new URLSearchParams({ ...filters, cursor, limit: '20' })}`); if (current === generation.current) { setItems(result.items); setNextCursor(result.nextCursor); } }
    catch (failure) { if (current === generation.current && !isCancelled(failure)) setError(errorMessage(failure)); }
    finally { if (current === generation.current && !api.signal.aborted) setLoading(false); }
  }
  useEffect(() => { void load(); return () => { generation.current += 1; }; }, [filters, cursor, editor]);
  if (editor !== undefined) return <TeacherLessonEditor key={editor || 'new'} planId={editor} onClose={() => setEditor(undefined)} onDirtyChange={onDirtyChange} />;
  return <section className="tw-card"><h2>Kho giáo án của cô</h2><p className="tw-muted">Giáo án riêng của tài khoản này. Nội dung và file Word không được công khai.</p><div className="tw-actions"><button type="button" className="tw-primary" onClick={() => setEditor(null)}>Tạo giáo án mới</button><button type="button" aria-pressed={upload} onClick={() => setUpload(value => !value)}>Tải giáo án Word</button></div>
    {upload && <TeacherWordUpload onUploaded={plan => { setUpload(false); setEditor(plan.id); }} />}
    <form className="tw-toolbar" noValidate onSubmit={event => { event.preventDefault(); setCursor(''); setHistory([]); setFilters({ query: query.trim(), source, ageBand: age }); }}><label>Tìm tên giáo án<div className="tw-actions"><input type="search" value={query} maxLength={100} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label="Xóa tìm tên giáo án" onClick={() => { setQuery(''); setCursor(''); setHistory([]); setFilters(previous => ({ ...previous, query: '' })); }}>×</button>}</div></label><label>Nguồn giáo án<select value={source} onChange={event => setSource(event.target.value)}><option value="">Tất cả nguồn</option><option value="manual">Tự soạn</option><option value="ai">AI gợi ý</option><option value="word">Word</option></select></label><label>Nhóm tuổi<select value={age} onChange={event => setAge(event.target.value)}><option value="">Tất cả độ tuổi</option><option value="3-4">3–4 tuổi</option><option value="4-5">4–5 tuổi</option><option value="5-6">5–6 tuổi</option></select></label><button type="submit">Tìm và lọc</button></form>
    {loading ? <p role="status">Đang tải kho giáo án…</p> : error ? <p className="tw-error" role="alert">{error} <button type="button" onClick={() => void load()}>Thử tải lại</button></p> : <><div className="tw-list">{items.map(plan => <article className="tw-list-item" key={plan.id}><span className="tw-status-chip">{plan.source === 'word' ? 'Word' : plan.source === 'ai' ? 'AI gợi ý' : 'Tự soạn'}</span><h3>{plan.title}</h3><p>{plan.ageBand ? `${plan.ageBand} tuổi` : 'Chưa chọn tuổi'}{plan.activity ? ` · ${plan.activity}` : ''}</p><p className="tw-muted">Cập nhật: {dateLabel(plan.updatedAt)}</p><button type="button" onClick={() => setEditor(plan.id)}>Mở giáo án</button></article>)}</div>{!items.length && <p>Chưa có giáo án phù hợp. Cô có thể tạo mới, tải Word hoặc đổi bộ lọc.</p>}<div className="tw-pagination"><button type="button" disabled={!history.length} onClick={() => { setCursor(history[history.length - 1]); setHistory(previous => previous.slice(0,-1)); }}>Trang trước</button><span>Trang {history.length + 1}</span><button type="button" disabled={!nextCursor} onClick={() => { setHistory(previous => [...previous, cursor]); setCursor(nextCursor!); }}>Trang sau</button></div></>}
  </section>;
}
