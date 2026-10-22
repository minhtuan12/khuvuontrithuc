import { useEffect, useState } from 'react';
import TeacherSelfStudy from './TeacherSelfStudy';
import { ENGLISH_AGES, ENGLISH_LESSONS_BY_AGE, findEnglishLesson, type EnglishAge } from '../lib/englishCatalog';
import { englishCloudConfigured, getEnglishSession, listTeacherPlans, saveTeacherPlan, signInEnglish, signOutEnglish, signUpEnglish, syncEnglishProgress, type TeacherPlan } from '../lib/englishSync';

interface TeacherWorkshopProps { onListen: (text: string, rate?: number) => void }

export default function TeacherWorkshop({ onListen }: TeacherWorkshopProps) {
  const [tab, setTab] = useState<'prepare' | 'self-study'>('prepare');
  const [age, setAge] = useState<EnglishAge>('3-4');
  const [lessonId, setLessonId] = useState(ENGLISH_LESSONS_BY_AGE['3-4'][0]?.id || '');
  const [note, setNote] = useState('');
  const [noteEdited, setNoteEdited] = useState(false);
  const [plans, setPlans] = useState<TeacherPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [session, setSession] = useState(getEnglishSession());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const selected = findEnglishLesson(lessonId)?.lesson;
  const matchingPlan = plans.find(plan => plan.id === selectedPlanId && plan.lesson_id === lessonId) || plans.find(plan => plan.lesson_id === lessonId);

  useEffect(() => {
    const update = () => setSession(getEnglishSession());
    window.addEventListener('english-session-changed', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('english-session-changed', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  useEffect(() => {
    setPlans([]);
    setSelectedPlanId(null);
    setNote('');
    setNoteEdited(false);
    if (!session) return;
    let cancelled = false;
    void listTeacherPlans().then(items => { if (!cancelled) setPlans(items); }).catch(() => { if (!cancelled) setMessage('Chưa tải được bài cô đã chuẩn bị. Hãy thử lại.'); });
    return () => { cancelled = true; };
  }, [session?.user.id]);

  useEffect(() => {
    if (!noteEdited) setNote(matchingPlan?.teacher_note || '');
  }, [lessonId, matchingPlan?.id, matchingPlan?.teacher_note, noteEdited]);

  async function authenticate(register: boolean) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage('Cô hãy nhập địa chỉ email hợp lệ.');
      return;
    }
    if (password.length < 6) {
      setMessage('Mật khẩu cần có ít nhất 6 ký tự.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      if (register) {
        await signUpEnglish(email.trim(), password);
        setMessage('Đã gửi yêu cầu đăng ký. Vui lòng kiểm tra email xác nhận rồi đăng nhập.');
      } else {
        const signedIn = await signInEnglish(email.trim(), password);
        setSession(signedIn);
        await syncEnglishProgress();
        setMessage('Đã đăng nhập và đồng bộ tiến độ tiếng Anh.');
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không thể đăng nhập.'); }
    finally { setBusy(false); }
  }

  async function save(status: 'draft' | 'approved') {
    const owner = session?.user.id;
    setBusy(true);
    setMessage('');
    try {
      const plan = await saveTeacherPlan(lessonId, note, status, matchingPlan?.status === 'draft' ? matchingPlan.id : undefined);
      if (getEnglishSession()?.user.id !== owner) return;
      setPlans(previous => [plan, ...previous.filter(item => item.id !== plan.id)]);
      setSelectedPlanId(plan.id);
      setMessage(status === 'approved' ? 'Đã duyệt lời dẫn cho bài này.' : 'Đã lưu bản nháp.');
    } catch (error) { if (getEnglishSession()?.user.id === owner) setMessage(error instanceof Error ? error.message : 'Không thể lưu bài.'); }
    finally { setBusy(false); }
  }

  return (
    <section className="space-y-5" aria-label="Góc cô chuẩn bị bài">
      <div className="rounded-3xl border-2 border-pink-200 bg-gradient-to-r from-pink-50 via-white to-purple-50 p-5 sm:p-7">
        <p className="text-sm font-black text-pink-700">GÓC GIÁO VIÊN</p>
        <h3 className="mt-1 text-2xl sm:text-3xl font-black text-slate-800">Chuẩn bị bài cùng nội dung của bé</h3>
        <p className="mt-2 text-sm sm:text-base text-slate-700">Chọn bài sẵn có, viết lời dẫn riêng và xem trước nội dung trước khi lưu. Bài gốc, từ vựng và trò chơi của bé không thay đổi.</p>
      </div>
      <div role="tablist" aria-label="Hoạt động của cô" className="flex flex-wrap gap-2">
        <button type="button" role="tab" aria-selected={tab === 'prepare'} onClick={() => setTab('prepare')} className={`min-h-11 rounded-2xl px-5 py-2 font-black ${tab === 'prepare' ? 'bg-pink-600 text-white' : 'bg-white text-pink-800 border border-pink-200'}`}>Chuẩn bị bài</button>
        <button type="button" role="tab" aria-selected={tab === 'self-study'} onClick={() => setTab('self-study')} className={`min-h-11 rounded-2xl px-5 py-2 font-black ${tab === 'self-study' ? 'bg-pink-600 text-white' : 'bg-white text-pink-800 border border-pink-200'}`}>Cô tự học</button>
      </div>
      {tab === 'self-study' ? <TeacherSelfStudy onListen={onListen} /> : (
        <div className="space-y-5">
          {!englishCloudConfigured && <p role="status" className="rounded-2xl bg-amber-50 p-4 text-amber-900">Chưa cấu hình Supabase để lưu bài chuẩn bị.</p>}
          {englishCloudConfigured && !session && <form noValidate onSubmit={event => { event.preventDefault(); void authenticate(false); }} className="rounded-3xl border-2 border-pink-100 bg-white p-5 space-y-3">
            <h4 className="text-lg font-black text-slate-800">Đăng nhập dành cho người lớn</h4>
            <label className="block text-sm font-bold text-slate-700">Email<input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-1 block min-h-11 w-full rounded-xl border-2 border-slate-200 px-3" /></label>
            <label className="block text-sm font-bold text-slate-700">Mật khẩu<input type="password" required minLength={6} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="mt-1 block min-h-11 w-full rounded-xl border-2 border-slate-200 px-3" /></label>
            <div className="flex flex-wrap gap-2"><button disabled={busy} type="submit" className="min-h-11 rounded-xl bg-pink-600 px-5 py-2 font-black text-white disabled:opacity-50">Đăng nhập</button><button disabled={busy} type="button" onClick={() => void authenticate(true)} className="min-h-11 rounded-xl border-2 border-pink-200 px-5 py-2 font-black text-pink-800 disabled:opacity-50">Tạo tài khoản</button></div>
          </form>}
          {session && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900"><span>Đang đăng nhập: <strong>{session.user.email || 'Tài khoản giáo viên'}</strong></span><button type="button" onClick={() => { signOutEnglish(); setSession(null); setPlans([]); setNote(''); setNoteEdited(false); }} className="min-h-11 rounded-xl bg-white px-4 py-2 font-bold">Đăng xuất</button></div>}
          {message && <p role="status" className="rounded-xl bg-sky-50 p-3 text-sm font-bold text-slate-800">{message}</p>}
          <div className="rounded-3xl border-2 border-pink-100 bg-white p-5 sm:p-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">Độ tuổi<select value={age} onChange={event => { const next = event.target.value as EnglishAge; setAge(next); setSelectedPlanId(null); setLessonId(ENGLISH_LESSONS_BY_AGE[next][0]?.id || ''); setNote(''); setNoteEdited(false); }} className="mt-1 block min-h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3">{ENGLISH_AGES.map(item => <option key={item.id} value={item.id}>{item.title} · {item.id} tuổi</option>)}</select></label>
              <label className="text-sm font-bold text-slate-700">Bài học<select value={lessonId} onChange={event => { const id = event.target.value; setSelectedPlanId(null); setLessonId(id); setNote(plans.find(plan => plan.lesson_id === id)?.teacher_note || ''); setNoteEdited(false); }} className="mt-1 block min-h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3">{ENGLISH_LESSONS_BY_AGE[age].map(lesson => <option key={lesson.id} value={lesson.id}>{lesson.name}</option>)}</select></label>
            </div>
            {selected && <div className="rounded-2xl bg-indigo-50 p-4 text-sm text-slate-700"><p className="font-black text-indigo-900">Xem trước bài của bé: {selected.name}</p><p className="mt-1">{selected.description}</p><p className="mt-2">Từ trong bài: {selected.vocabulary.map(word => `${word.word} (${word.meaning})`).join(' · ')}</p><p className="mt-2">Trò chơi: {selected.interactiveGame.title}</p></div>}
            <label className="block text-sm font-bold text-slate-700">Lời dẫn và ghi chú của cô<textarea value={note} onChange={event => { setNote(event.target.value); setNoteEdited(true); }} maxLength={2000} rows={5} placeholder="Ví dụ: Cô bắt đầu bằng cách cho bé chỉ vào đồ vật, rồi đọc từng từ..." className="mt-1 block w-full resize-none rounded-xl border-2 border-slate-200 p-3" /></label>
            <p className="text-xs text-slate-600">{note.length}/2.000 ký tự · Nội dung bài học gốc không bị sửa.</p>
            <div className="flex flex-wrap gap-2"><button type="button" disabled={!session || busy || !note.trim()} onClick={() => void save('draft')} className="min-h-11 rounded-xl border-2 border-pink-200 px-5 py-2 font-black text-pink-800 disabled:opacity-50">Lưu nháp</button><button type="button" disabled={!session || busy || !note.trim()} onClick={() => void save('approved')} className="min-h-11 rounded-xl bg-pink-600 px-5 py-2 font-black text-white disabled:opacity-50">Duyệt lời dẫn</button></div>
          </div>
          {plans.length > 0 && <div className="rounded-3xl border-2 border-slate-100 bg-white p-5"><h4 className="mb-3 text-lg font-black text-slate-800">Bài cô đã chuẩn bị</h4><div className="space-y-2">{plans.map(plan => <button key={plan.id} type="button" onClick={() => { setSelectedPlanId(plan.id); setAge(plan.age_band); setLessonId(plan.lesson_id); setNote(plan.teacher_note); setNoteEdited(true); }} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-2 text-left text-sm font-bold text-slate-800"><span>{findEnglishLesson(plan.lesson_id)?.lesson.name || plan.lesson_id}</span><span className={plan.status === 'approved' ? 'text-emerald-700' : 'text-amber-700'}>{plan.status === 'approved' ? 'Đã duyệt' : 'Bản nháp'}</span></button>)}</div></div>}
        </div>
      )}
    </section>
  );
}
