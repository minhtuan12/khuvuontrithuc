import { useEffect, useRef, useState } from 'react';
import { useScopedTeacherApi, TeacherApiError, isCancelled, errorMessage, type TeacherPlan, type TeacherAge } from '../lib/teacherApi';
import TeacherConfirm from './TeacherConfirm';

export default function TeacherLessonEditor({ planId, onClose, onSaved, onDirtyChange }: { key?: string; planId: string | null; onClose: () => void; onSaved?: (plan: TeacherPlan) => void; onDirtyChange?: (dirty: boolean) => void }) {
  const api = useScopedTeacherApi();
  const [plan, setPlan] = useState<TeacherPlan | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activity, setActivity] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(!!planId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [conflict, setConflict] = useState(false);
  const [confirmation, setConfirmation] = useState<'leave' | 'reload' | 'delete' | 'account' | null>(null);
  const baseline = useRef('');
  const pending = useRef(false);
  const key = useRef(crypto.randomUUID());
  const proceedAccount = useRef<(() => void) | null>(null);
  const serialized = JSON.stringify([title, content, activity, age]);
  const dirty = baseline.current ? serialized !== baseline.current : !!(title || content || activity || age);

  function apply(next: TeacherPlan) {
    setPlan(next); setTitle(next.title); setContent(next.content || ''); setActivity(next.activity || ''); setAge(next.ageBand || '');
    baseline.current = JSON.stringify([next.title, next.content || '', next.activity || '', next.ageBand || '']);
    setConflict(false);
  }
  async function load() {
    if (!planId) return;
    setLoading(true); setError('');
    try { apply(await api.request<TeacherPlan>(`/api/teacher/lesson-plans/${encodeURIComponent(planId)}`)); }
    catch (failure) { if (!isCancelled(failure)) setError(errorMessage(failure)); }
    finally { if (!api.signal.aborted) setLoading(false); }
  }
  useEffect(() => { void load(); }, [planId]);
  useEffect(() => { onDirtyChange?.(dirty); return () => onDirtyChange?.(false); }, [dirty, onDirtyChange]);
  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const account = (event: Event) => { event.preventDefault(); proceedAccount.current = (event as CustomEvent<{ proceed: () => void }>).detail.proceed; setConfirmation('account'); };
    window.addEventListener('beforeunload', unload); window.addEventListener('kvtt-before-account-open', account);
    return () => { window.removeEventListener('beforeunload', unload); window.removeEventListener('kvtt-before-account-open', account); };
  }, [dirty]);

  async function save() {
    if (pending.current || loading) return;
    if (!title.trim() || (!content.trim() && plan?.source !== 'word')) { setError('Điền tên và nội dung giáo án trước khi lưu.'); return; }
    pending.current = true; setBusy(true); setError(''); setNotice('');
    try {
      const next = await api.request<TeacherPlan>(`/api/teacher/lesson-plans${plan ? `/${encodeURIComponent(plan.id)}` : ''}`, { method: plan ? 'PATCH' : 'POST', body: JSON.stringify({ title: title.trim(), content, activity: activity.trim(), ageBand: age || null, ...(plan ? { expectedVersion: plan.version } : { source: 'manual', idempotencyKey: key.current }) }) });
      apply(next); setNotice('Đã lưu giáo án vào kho.'); onSaved?.(next);
    } catch (failure) { if (!isCancelled(failure)) { setError(errorMessage(failure)); if (failure instanceof TeacherApiError && failure.status === 409) setConflict(true); } }
    finally { pending.current = false; if (!api.signal.aborted) setBusy(false); }
  }
  async function remove() {
    setConfirmation(null);
    if (!plan || pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { await api.request(`/api/teacher/lesson-plans/${encodeURIComponent(plan.id)}`, { method: 'DELETE', body: JSON.stringify({ expectedVersion: plan.version }) }); baseline.current = serialized; onClose(); }
    catch (failure) { if (!isCancelled(failure)) setError(errorMessage(failure)); }
    finally { pending.current = false; if (!api.signal.aborted) setBusy(false); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(`${title}\n\n${content}`); setNotice('Đã sao chép bản đang sửa.'); }
    catch { setNotice('Không sao chép tự động được. Cô có thể chọn và sao chép nội dung trong ô bên dưới.'); }
  }

  return <section className="tw-card" aria-label="Chỉnh sửa giáo án">
    <button type="button" disabled={busy} onClick={() => dirty ? setConfirmation('leave') : onClose()}>← Về kho giáo án</button><h2 className="mt-4">{planId ? 'Chỉnh sửa giáo án' : 'Giáo án mới'}</h2>
    {loading ? <p role="status">Đang tải giáo án…</p> : planId && !plan ? null : <form className="tw-form" noValidate onSubmit={event => { event.preventDefault(); void save(); }}>
      <label>Tên giáo án<input name="lesson-title" maxLength={200} value={title} disabled={busy} required onChange={event => setTitle(event.target.value)} /></label>
      <div className="tw-grid"><label>Hoạt động / chủ đề<input maxLength={200} value={activity} disabled={busy} onChange={event => setActivity(event.target.value)} /></label><label>Nhóm tuổi<select value={age} disabled={busy} onChange={event => setAge(event.target.value)}><option value="">Chưa chọn</option>{(['3-4','4-5','5-6'] as TeacherAge[]).map(value => <option key={value} value={value}>{value} tuổi</option>)}</select></label></div>
      <label>Nội dung giáo án<textarea className="tw-editor-content" name="lesson-content" maxLength={200000} value={content} disabled={busy} required onChange={event => setContent(event.target.value)} /></label>
      {plan?.files?.map(file => <div className="tw-file" key={file.id}><strong>{file.originalName}</strong><p className="tw-muted">File gốc được giữ riêng. Nội dung sửa trên web không thay đổi file Word gốc.</p><a className="tw-link" href={`/api/teacher/lesson-plans/${encodeURIComponent(plan.id)}/files/${encodeURIComponent(file.id)}/download`} download>Tải file gốc</a></div>)}
      {plan?.source === 'word' && <p className="tw-muted">DOC chỉ lưu file gốc; cô có thể bổ sung bản văn bản riêng. DOCX trích xuất có thể không giữ bố cục, bảng và hình ảnh.</p>}
      <div className="tw-actions"><button type="submit" className="tw-primary" disabled={busy || conflict}>{busy ? 'Đang lưu…' : 'Lưu giáo án'}</button><button type="button" onClick={() => void copy()}>Sao chép bản đang sửa</button>{plan && <button type="button" className="tw-danger" disabled={busy} onClick={() => setConfirmation('delete')}>Xóa giáo án</button>}</div>
      <p className="tw-muted">{dirty ? 'Có thay đổi chưa lưu.' : 'Nội dung đã lưu không được tự gửi cho AI.'}</p>
    </form>}
    {error && <p className="tw-error" role="alert">{error} {loading || (!plan && planId) ? <button type="button" onClick={() => void load()}>Thử tải lại</button> : null}</p>}
    {conflict && <div className="tw-error"><p>Bản đang sửa được giữ nguyên. Cô có thể sao chép trước khi tải bản mới nhất.</p><button type="button" onClick={() => setConfirmation('reload')}>Tải bản mới nhất</button></div>}
    <p className="tw-status" role="status">{notice}</p>
    {confirmation && <TeacherConfirm title={confirmation === 'delete' ? `Xóa “${plan?.title}”?` : confirmation === 'reload' ? 'Tải bản mới nhất?' : 'Rời bản đang sửa?'} confirmLabel={confirmation === 'delete' ? 'Xóa giáo án' : confirmation === 'reload' ? 'Tải bản mới' : 'Bỏ thay đổi và tiếp tục'} onCancel={() => setConfirmation(null)} onConfirm={() => {
      const action = confirmation; setConfirmation(null);
      if (action === 'delete') void remove(); else if (action === 'reload') void load(); else if (action === 'account') proceedAccount.current?.(); else onClose();
    }}><p>{confirmation === 'delete' ? 'Giáo án và quyền tải file sẽ bị gỡ khỏi kho.' : 'Thay đổi chưa lưu sẽ bị bỏ. Cô có thể giữ lại để lưu hoặc sao chép trước.'}</p></TeacherConfirm>}
  </section>;
}
