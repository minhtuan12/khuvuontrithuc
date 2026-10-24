import { useCallback, useEffect, useRef, useState } from 'react';
import App from '../App';
import AccountModal from './AccountModal';
import { accountRequest, type AccountAction, type AccountUser } from '../lib/accountApi';
import { AccountContext } from '../lib/accountContext';
import { beginAccountTransition, endAccountTransition } from '../lib/deviceData';
import { setLearnerScope } from '../lib/learnerStorage';
import { resetEnglishProgressForAccountChange } from '../lib/englishSync';
import { stopAssistantSpeech } from '../lib/assistantSpeech';

export default function AccountRoot() {
  const [user, setUser] = useState<AccountUser | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const currentUser = useRef<AccountUser | null | undefined>(undefined);
  const mounted = useRef(true);
  const requestId = useRef(0);
  const channel = useRef<BroadcastChannel | null>(null);

  const applyIdentity = useCallback((next: AccountUser | null) => {
    resetEnglishProgressForAccountChange();
    stopAssistantSpeech();
    window.speechSynthesis?.cancel();
    setLearnerScope(next?.id || 'guest');
    if (currentUser.current !== undefined) setRevision(value => value + 1);
    currentUser.current = next;
    setUser(next);
    setError('');
  }, []);

  const refresh = useCallback(async () => {
    if (pending.current) return;
    const id = ++requestId.current;
    beginAccountTransition();
    setTransitioning(true);
    try {
      const next = await accountRequest('session');
      if (!mounted.current || id !== requestId.current) return;
      applyIdentity(next);
    } catch {
      if (mounted.current && id === requestId.current) setError('Chưa xác nhận được tài khoản. Hãy kiểm tra kết nối và thử lại.');
    } finally {
      if (mounted.current && id === requestId.current) { endAccountTransition(); setTransitioning(false); }
    }
  }, [applyIdentity]);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    const changed = () => { setOpen(false); void refresh(); };
    const storageChanged = (event: StorageEvent) => { if (event.key === 'kvtt.account.changed') changed(); };
    window.addEventListener('storage', storageChanged);
    window.addEventListener('kvtt-account-expired', changed);
    if ('BroadcastChannel' in window) {
      channel.current = new BroadcastChannel('kvtt-account');
      channel.current.onmessage = changed;
    }
    return () => {
      mounted.current = false;
      requestId.current++;
      window.removeEventListener('storage', storageChanged);
      window.removeEventListener('kvtt-account-expired', changed);
      channel.current?.close();
      channel.current = null;
    };
  }, [refresh]);

  async function changeAccount(action: Exclude<AccountAction, 'session'>, body?: unknown) {
    if (pending.current) throw new Error('Đang xử lý tài khoản, vui lòng chờ một chút.');
    pending.current = true;
    requestId.current++;
    beginAccountTransition();
    setTransitioning(true);
    try {
      const next = await accountRequest(action, body);
      if (!mounted.current) return;
      if (action === 'login' && next && body && typeof body === 'object') {
        const requestedRole = (body as { role?: unknown }).role;
        if ((requestedRole === 'learner' || requestedRole === 'teacher') && next.role !== requestedRole) {
          await accountRequest('logout');
          throw new Error(requestedRole === 'teacher' ? 'Tài khoản này không phải tài khoản giáo viên.' : 'Tài khoản này không phải tài khoản học sinh.');
        }
      }
      applyIdentity(next);
      try { window.localStorage.setItem('kvtt.account.changed', crypto.randomUUID()); } catch { /* BroadcastChannel still works when storage is unavailable. */ }
      channel.current?.postMessage('changed');
    } finally {
      pending.current = false;
      if (mounted.current) { endAccountTransition(); setTransitioning(false); }
    }
  }

  return <AccountContext.Provider value={{ user: user || null, openAccount: () => {
    const event = new CustomEvent('kvtt-before-account-open', { cancelable: true, detail: { proceed: () => setOpen(true) } });
    if (window.dispatchEvent(event)) setOpen(true);
  } }}>
    {user !== undefined && !error ? <div key={`${user?.id || 'guest'}:${revision}`} className="contents"><App startAtHome={revision > 0} /></div> : <div className="flex min-h-screen items-center justify-center p-5"><div className="max-w-md rounded-[2rem] border-4 border-white bg-white p-7 text-center shadow-xl"><span className="text-5xl" aria-hidden="true">🌱</span><p role={error ? 'alert' : 'status'} className="mt-4 font-bold text-emerald-900">{error || 'Mầm đang mở khu vườn của bạn…'}</p>{error && <button type="button" onClick={() => void refresh()} className="mt-4 min-h-11 rounded-full bg-emerald-600 px-6 py-3 font-black text-white">Thử kết nối lại</button>}</div></div>}
    <AccountModal open={open} onClose={() => setOpen(false)} user={user || null} onLogin={input => changeAccount('login', input)} onRegister={input => changeAccount('register', input)} onLogout={() => changeAccount('logout')} />
    {transitioning && user !== undefined && !open && <div role="status" className="fixed inset-0 z-[200] flex items-center justify-center bg-white/85 p-6 font-black text-emerald-900">Đang mở dữ liệu tài khoản…</div>}
  </AccountContext.Provider>;
}
