import { useEffect, useRef, useState } from 'react';
import { useTeacherAccess } from '../lib/accountContext';
import { useScopedTeacherApi, isCancelled, errorMessage, type TeacherAge, type TeacherPlan } from '../lib/teacherApi';
import TeacherLessonEditor from './TeacherLessonEditor';
import '../screens/teacher-workspace.css';

export default function SaveTeacherPlan(props: { title: string; content: string; activity?: string; ageBand: TeacherAge; studentAccountId?: string; source: 'ai' | 'manual' }) {
  const allowed = useTeacherAccess();
  return allowed ? <SaveAuthorized {...props} /> : null;
}
function SaveAuthorized({ title, content, activity = '', ageBand, studentAccountId, source }: { title: string; content: string; activity?: string; ageBand: TeacherAge; studentAccountId?: string; source: 'ai' | 'manual' }) {
  const api = useScopedTeacherApi();
  const key = useRef(crypto.randomUUID());
  const pending = useRef(false);
  const [saved, setSaved] = useState<TeacherPlan | null>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { key.current = crypto.randomUUID(); setSaved(null); setError(''); }, [title, content, activity, ageBand, studentAccountId]);
  async function save() {
    if (pending.current || saved || !content.trim()) return;
    pending.current = true; setBusy(true); setError('');
    try { setSaved(await api.request<TeacherPlan>('/api/teacher/lesson-plans', { method: 'POST', body: JSON.stringify({ title: title.trim() || 'Giáo án đã chuẩn bị', content, activity, ageBand, studentAccountId: studentAccountId || null, source, idempotencyKey: key.current }) })); }
    catch (failure) { if (!isCancelled(failure)) setError(errorMessage(failure)); }
    finally { pending.current = false; if (!api.signal.aborted) setBusy(false); }
  }
  return <div className="teacher-workspace"><div className="tw-actions"><button type="button" className="tw-primary" disabled={busy || !!saved} onClick={() => void save()}>{busy ? 'Đang lưu vào kho…' : saved ? 'Đã lưu vào kho' : 'Lưu vào kho giáo án'}</button>{saved && <button type="button" onClick={() => setEditing(true)}>Mở bản đã lưu</button>}</div>{saved && <p role="status">Đã lưu “{saved.title}”.</p>}{error && <p className="tw-error" role="alert">{error}</p>}{editing && saved && <TeacherLessonEditor key={saved.id} planId={saved.id} onClose={() => setEditing(false)} />}</div>;
}
