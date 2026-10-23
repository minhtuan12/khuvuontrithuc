import { useEffect, useRef, useState } from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';
import TeacherSelfStudy from './TeacherSelfStudy';
import { ENGLISH_AGES, type EnglishAge } from '../lib/englishCatalog';
import { useDeviceDocument } from '../lib/useDeviceDocument';
import { useTeacherAccess } from '../lib/accountContext';
import SaveTeacherPlan from './SaveTeacherPlan';

interface TeacherWorkshopProps { onListen: (text: string, rate?: number) => void }
interface Preparation { age: EnglishAge; activity: string; plan: string; selfStudy: string }
type GenerationKind = 'plan' | 'self-study' | 'suggestions';

export default function TeacherWorkshop({ onListen }: TeacherWorkshopProps) {
  const allowed = useTeacherAccess();
  return allowed ? <AuthorizedTeacherWorkshop onListen={onListen} /> : null;
}

function AuthorizedTeacherWorkshop({ onListen }: TeacherWorkshopProps) {
  const [tab, setTab] = useState<'prepare' | 'self-study'>('prepare');
  const [draft, setDraft, sync] = useDeviceDocument<Preparation>('teacher-preparation', () => ({ age: '3-4', activity: '', plan: '', selfStudy: '' }));
  const [busy, setBusy] = useState<GenerationKind | null>(null);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const controller = useRef<AbortController | null>(null);
  const pending = useRef(false);
  useEffect(() => () => { controller.current?.abort(); controller.current = null; }, []);

  async function generate(kind: GenerationKind) {
    if (pending.current || sync.loading) return;
    if (kind !== 'suggestions' && !draft.activity.trim()) {
      setError('Cô hãy điền tên hoạt động hoặc chọn một gợi ý trước nhé.');
      return;
    }
    pending.current = true;
    setBusy(kind);
    setError('');
    const request = new AbortController();
    controller.current = request;
    const timeout = setTimeout(() => request.abort(), 60000);
    try {
      const response = await fetch('/api/teacher/plan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: request.signal,
        body: JSON.stringify({ age: draft.age, activity: draft.activity.trim(), kind }),
      });
      if (!response.ok) throw new Error(response.status === 429 ? 'AI đang bận. Cô hãy thử lại sau ít phút.' : response.status === 503 ? 'Chức năng AI chưa sẵn sàng. Cô hãy thử lại sau.' : 'Chưa soạn được nội dung. Cô hãy thử lại.');
      const data = await response.json();
      if (typeof data.text !== 'string' || !data.text.trim()) throw new Error('AI chưa trả về nội dung. Cô hãy thử lại.');
      if (request.signal.aborted) return;
      if (kind === 'suggestions') {
        const items = data.text.split('\n').map((line: string) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim()).filter((line: string) => line.length > 0 && line.length <= 200).slice(0, 5);
        if (!items.length) throw new Error('Chưa nhận được tên hoạt động. Cô hãy thử gợi ý lại.');
        setSuggestions(items);
      } else {
        if (data.text.length > 30000) throw new Error('Nội dung quá dài. Cô hãy thử lại với tên hoạt động cụ thể hơn.');
        setDraft(previous => ({ ...previous, [kind === 'plan' ? 'plan' : 'selfStudy']: data.text.trim() }));
      }
    } catch (failure) {
      if (controller.current === request) setError(request.signal.aborted ? 'Chờ AI hơi lâu. Cô hãy nhấn thử lại; nội dung đã có vẫn được giữ.' : failure instanceof Error ? failure.message : 'Mất kết nối. Cô hãy thử lại.');
    } finally {
      clearTimeout(timeout);
      pending.current = false;
      if (controller.current === request) { controller.current = null; setBusy(null); }
    }
  }

  const result = tab === 'prepare' ? draft.plan : draft.selfStudy;
  const disabled = sync.loading || busy !== null;
  return (
    <section className="space-y-5" aria-label="Góc cô chuẩn bị bài">
      <div className="rounded-3xl border-2 border-pink-200 bg-gradient-to-r from-pink-50 via-white to-purple-50 p-5 sm:p-7">
        <p className="text-sm font-black text-pink-700">GÓC GIÁO VIÊN · AI ĐỒNG HÀNH</p>
        <h3 className="mt-1 text-2xl sm:text-3xl font-black text-slate-800">Từ ý tưởng nhỏ, thành một giờ học vui</h3>
        <p className="mt-2 text-slate-700">Cô điền tên hoạt động, AI gợi ý giáo án và nội dung tự học phù hợp độ tuổi. Cô có thể chỉnh sửa trước khi dạy.</p>
      </div>
      <div aria-label="Hoạt động của cô" className="flex flex-wrap gap-2">
        {(['prepare', 'self-study'] as const).map(item => <button key={item} type="button" aria-pressed={tab === item} disabled={busy !== null} onClick={() => { setTab(item); setError(''); }} className={`min-h-11 rounded-2xl px-5 py-2 font-black disabled:opacity-50 ${tab === item ? 'bg-pink-600 text-white' : 'bg-white text-pink-800 border border-pink-200'}`}>{item === 'prepare' ? 'Chuẩn bị bài' : 'Cô tự học'}</button>)}
      </div>
      <form noValidate onSubmit={event => { event.preventDefault(); void generate(tab === 'prepare' ? 'plan' : 'self-study'); }} className="space-y-4 rounded-3xl border-2 border-pink-100 bg-white p-5 sm:p-6" aria-busy={busy !== null}>
        <label className="block text-sm font-bold text-slate-700">Độ tuổi của bé
          <select disabled={disabled} value={draft.age} onChange={event => { const age = event.target.value as EnglishAge; setDraft(previous => ({ ...previous, age })); setSuggestions([]); }} className="mt-1 block min-h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3">{ENGLISH_AGES.map(age => <option key={age.id} value={age.id}>{age.title} · {age.id} tuổi</option>)}</select>
        </label>
        <label className="block text-sm font-bold text-slate-700">Tên hoạt động
          <input disabled={disabled} value={draft.activity} maxLength={200} onChange={event => { const activity = event.target.value; setDraft(previous => ({ ...previous, activity })); setError(''); }} placeholder="Ví dụ: Bé khám phá màu sắc qua những chiếc lá" aria-invalid={!!error && !draft.activity.trim()} aria-describedby={error ? 'teacher-ai-error' : undefined} className="mt-1 block min-h-12 w-full rounded-xl border-2 border-slate-200 px-3" />
        </label>
        <button type="button" disabled={disabled} onClick={() => void generate('suggestions')} className="flex min-h-11 items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 font-bold text-amber-900 disabled:opacity-50"><Lightbulb size={18} />{busy === 'suggestions' ? 'AI đang tìm ý tưởng…' : 'Nhờ AI gợi ý hoạt động'}</button>
        {suggestions.length > 0 && <div className="flex flex-wrap gap-2" aria-label="Hoạt động AI gợi ý">{suggestions.map(item => <button key={item} type="button" disabled={disabled} onClick={() => setDraft(previous => ({ ...previous, activity: item }))} className="min-h-11 rounded-xl border border-pink-200 bg-pink-50 px-3 py-2 text-left text-sm font-bold text-pink-900 disabled:opacity-50">{item}</button>)}</div>}
        {error && <p id="teacher-ai-error" role="alert" className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900">{error}</p>}
        <button type="submit" disabled={disabled} className="flex min-h-12 items-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-black text-white disabled:opacity-50"><Sparkles size={18} />{busy && busy !== 'suggestions' ? 'AI đang soạn nội dung…' : tab === 'prepare' ? 'AI soạn giáo án' : 'AI hỗ trợ cô tự học'}</button>
        <p role="status" className="text-sm text-slate-600">{sync.loading ? 'Đang tải bản chuẩn bị…' : sync.saving ? 'Đang lưu bản chuẩn bị…' : busy ? 'Cô chờ một chút nhé, AI đang chuẩn bị gợi ý.' : sync.error ? 'Bản chuẩn bị chưa đồng bộ được. Cô hãy thử lưu lại.' : 'Bản chuẩn bị được tự động lưu trên thiết bị này, không cần đăng nhập.'}</p>
      </form>
      {sync.error && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{sync.error} <button type="button" onClick={sync.retry} className="min-h-11 px-3 font-bold underline">Thử lưu lại</button><button type="button" onClick={sync.restoreRemote} className="min-h-11 px-3 font-bold underline">Tải bản đã lưu</button></p>}
      {result && <div className="space-y-3 rounded-3xl border-2 border-pink-100 bg-white p-5 sm:p-6">
        <h4 className="text-xl font-black text-slate-800">{tab === 'prepare' ? 'Giáo án AI gợi ý' : 'Nội dung cô tự học'}</h4>
        <p className="text-sm text-slate-600">Cô kiểm tra, điều chỉnh nội dung và học liệu cho phù hợp với lớp trước khi sử dụng.</p>
        <label className="block text-sm font-bold text-slate-700">Chỉnh sửa nội dung<textarea disabled={disabled} rows={18} maxLength={30000} value={result} onChange={event => { const text = event.target.value; setDraft(previous => ({ ...previous, [tab === 'prepare' ? 'plan' : 'selfStudy']: text })); }} className="mt-2 block w-full resize-none rounded-xl border-2 border-slate-200 p-4 font-normal leading-relaxed" /></label>
      </div>}
      {tab === 'self-study' && <TeacherSelfStudy onListen={onListen} />}
      {tab === 'prepare' && result && <SaveTeacherPlan title={draft.activity} content={result} ageBand={draft.age} activity={draft.activity} source="ai" />}
    </section>
  );
}
