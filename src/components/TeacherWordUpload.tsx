import { useEffect, useRef, useState } from 'react';
import { getLearnerScope } from '../lib/learnerStorage';
import { useScopedTeacherApi, isCancelled, errorMessage, type TeacherPlan } from '../lib/teacherApi';

export default function TeacherWordUpload({ onUploaded }: { onUploaded: (plan: TeacherPlan) => void }) {
  const api = useScopedTeacherApi();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [scope] = useState(getLearnerScope);
  const ticket = useRef<{ uploadId: string; uploadUrl: string } | null>(null);
  const uploaded = useRef(false);
  const xhr = useRef<XMLHttpRequest | null>(null);
  const pending = useRef(false);
  const key = useRef(crypto.randomUUID());
  const cancelled = useRef(false);
  useEffect(() => () => { cancelled.current = true; xhr.current?.abort(); }, []);

  async function cancel() {
    cancelled.current = true; xhr.current?.abort();
    const current = ticket.current;
    if (current) {
      try { await api.request(`/api/teacher/lesson-plans/uploads/${encodeURIComponent(current.uploadId)}`, { method: 'DELETE' }); ticket.current = null; uploaded.current = false; key.current = crypto.randomUUID(); setNotice('Đã hủy tệp đang chờ.'); }
      catch (failure) { if (!isCancelled(failure)) setError(errorMessage(failure)); }
    }
    if (!api.signal.aborted) { pending.current = false; setBusy(false); setStage(''); }
  }
  function transfer(url: string, selected: File) {
    return new Promise<void>((resolve, reject) => {
      const request = new XMLHttpRequest(); xhr.current = request;
      const abort = () => request.abort();
      const finish = (failure?: Error) => { api.signal.removeEventListener('abort', abort); xhr.current = null; failure ? reject(failure) : resolve(); };
      api.signal.addEventListener('abort', abort, { once: true });
      request.open('PUT', url); request.withCredentials = new URL(url, location.href).origin === location.origin;
      request.timeout = 120000;
      request.setRequestHeader('Content-Type', 'application/octet-stream');
      if (new URL(url, location.href).origin === location.origin) request.setRequestHeader('X-KVTT-Account', scope);
      request.upload.onprogress = event => { if (event.lengthComputable && !cancelled.current && getLearnerScope() === scope) setProgress(Math.round(event.loaded / event.total * 100)); };
      request.onload = () => finish(request.status >= 200 && request.status < 300 ? undefined : new Error('Chưa tải được file Word. Cô có thể thử lại.'));
      request.onerror = () => finish(new Error('Mất kết nối khi tải tệp. Cô có thể thử lại.'));
      request.ontimeout = () => finish(new Error('Tải tệp hơi lâu. Cô có thể thử lại.'));
      request.onabort = () => finish(new DOMException('Đã hủy', 'AbortError'));
      request.send(selected);
    });
  }
  async function upload() {
    if (!file || pending.current || !title.trim()) return;
    if (!/\.(doc|docx)$/i.test(file.name) || !file.size || file.size > 10 * 1024 * 1024) { setError('Chọn file .doc hoặc .docx, lớn hơn 0 byte và không quá 10 MiB.'); return; }
    pending.current = true; cancelled.current = false; setBusy(true); setError(''); setNotice('');
    try {
      if (!ticket.current) { setStage('Đang chuẩn bị tải…'); ticket.current = await api.request('/api/teacher/lesson-plans/uploads/init', { method: 'POST', body: JSON.stringify({ name: file.name, byteSize: file.size, title: title.trim(), idempotencyKey: key.current }) }); }
      if (cancelled.current) { await cancel(); return; }
      if (!uploaded.current) { setStage('Đang tải tệp…'); await transfer(ticket.current!.uploadUrl, file); uploaded.current = true; }
      if (cancelled.current || getLearnerScope() !== scope || api.signal.aborted) return;
      setStage('Đang kiểm tra và lưu tệp…');
      const plan = await api.request<TeacherPlan>(`/api/teacher/lesson-plans/uploads/${encodeURIComponent(ticket.current!.uploadId)}/finalize`, { method: 'POST' });
      if (cancelled.current) return;
      ticket.current = null; uploaded.current = false; key.current = crypto.randomUUID(); setNotice('Đã kiểm tra và lưu file Word vào kho.'); onUploaded(plan);
    } catch (failure) { if (!isCancelled(failure) && !cancelled.current) setError(errorMessage(failure)); }
    finally { pending.current = false; if (!api.signal.aborted) { setBusy(false); setStage(''); } }
  }
  return <section className="tw-card"><h2>Tải giáo án Word</h2><p className="tw-muted">Chỉ nhận .doc và .docx, tối đa 10 MiB/tệp; dung lượng kho tối đa 100 MiB. DOC giữ file gốc, không chỉnh nội dung DOC trực tiếp. Văn bản DOCX có thể mất định dạng, bảng và ảnh.</p>
    <form className="tw-form" noValidate onSubmit={event => { event.preventDefault(); void upload(); }}><label>Chọn file Word<input type="file" accept=".doc,.docx" disabled={busy || !!ticket.current} onChange={event => { const next = event.target.files?.[0] || null; setFile(next); setTitle(next?.name.replace(/\.(doc|docx)$/i, '').slice(0,200) || ''); setError(''); setNotice(''); key.current = crypto.randomUUID(); uploaded.current = false; }} /></label>{file && <p>{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MiB</p>}<label>Tên giáo án Word<input maxLength={200} value={title} disabled={busy || !!ticket.current} onChange={event => setTitle(event.target.value)} /></label><div className="tw-actions"><button className="tw-primary" type="submit" disabled={busy || !file || !title.trim()}>{busy ? 'Đang tải…' : error ? 'Thử tải Word lại' : 'Tải Word lên kho'}</button>{(busy || ticket.current) && <button type="button" onClick={() => void cancel()}>Hủy tệp đang chờ</button>}</div></form>
    {busy && <div role="status"><p>{stage}</p>{stage === 'Đang tải tệp…' ? <progress max={100} value={progress} aria-label="Tiến trình tải file Word" /> : <progress aria-label="Đang kiểm tra file Word" />}</div>}{error && <p className="tw-error" role="alert">{error}</p>}<p className="tw-status" role="status">{notice}</p>
  </section>;
}
