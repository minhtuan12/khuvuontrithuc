import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Eye, EyeOff, Flower2, LogOut, X } from 'lucide-react';
import './account-modal.css';

export interface AccountModalProps {
  open: boolean;
  onClose: () => void;
  user: { id: string; username: string; fullName: string; gender: null | 'male' | 'female' | 'other' } | null;
  onLogin: (input: { username: string; password: string }) => Promise<void>;
  onRegister: (input: { username: string; fullName: string; password: string; gender?: string | null }) => Promise<void>;
  onLogout: () => Promise<void>;
}

type Field = 'username' | 'fullName' | 'password';

export default function AccountModal({ open, onClose, user, onLogin, onRegister, onLogout }: AccountModalProps) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const busy = useRef(false);
  const generation = useRef(0);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      generation.current += 1;
      busy.current = false;
      element?.close();
      document.body.style.overflow = overflow;
      if (opener?.isConnected) opener.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setPassword('');
      setVisible(false);
      setError('');
      setErrors({});
      setPending(false);
    }
  }, [open]);

  async function perform(action: () => Promise<void>) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    const current = generation.current;
    try {
      await action();
      if (current === generation.current) {
        setPassword('');
        onClose();
      }
    } catch (failure) {
      if (current === generation.current) {
        setError(failure instanceof Error ? failure.message : 'Chưa thể kết nối. Vui lòng thử lại.');
      }
    } finally {
      if (current === generation.current) {
        busy.current = false;
        setPending(false);
      }
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || (event.nativeEvent instanceof KeyboardEvent && event.nativeEvent.isComposing)) return;
    const next: Partial<Record<Field, string>> = {};
    const name = username.trim();
    if (!name) next.username = 'Nhập tên đăng nhập của bạn.';
    else if (mode === 'register' && !/^[A-Za-z0-9_.-]{3,32}$/.test(name)) next.username = 'Dùng 3–32 chữ cái không dấu, số hoặc dấu _ . -';
    if (mode === 'register' && (fullName.trim().length < 2 || fullName.trim().length > 100)) next.fullName = 'Họ và tên cần có từ 2 đến 100 ký tự.';
    if (!password) next.password = 'Nhập mật khẩu của bạn.';
    else if (mode === 'register' && (password.length < 8 || password.length > 128)) next.password = 'Mật khẩu cần có từ 8 đến 128 ký tự.';
    setErrors(next);
    setError('');
    const first = Object.keys(next)[0];
    if (first) {
      dialog.current?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
      return;
    }
    void perform(() => mode === 'login' ? onLogin({ username: name, password }) : onRegister({ username: name, fullName: fullName.trim(), password, gender: gender || null }));
  }

  const registering = mode === 'register';
  function fieldError(field: Field) {
    return errors[field] ? <span className="account-field-error" id={`${id}-${field}-error`}>{errors[field]}</span> : null;
  }
  const description = user
    ? 'Tiến trình học được lưu riêng theo tài khoản của bạn.'
    : 'Đăng nhập để tiếp tục khu vườn học tập của bạn trên các thiết bị.';

  return <dialog ref={dialog} className="account-modal" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}
    onCancel={event => { event.preventDefault(); if (!busy.current) onClose(); }}>
    <div className="account-landscape" aria-hidden="true"><img src="/illustrations/garden-story.jpg" alt="" /></div>
    <button className="account-close" type="button" aria-label="Đóng tài khoản" disabled={pending} onClick={() => { if (!busy.current) onClose(); }} autoFocus><X size={22} /></button>
    <div className="account-content">
      <span className="account-eyebrow"><Flower2 size={17} aria-hidden="true" /> KHU VƯỜN CỦA BẠN</span>
      <h2 id={`${id}-title`}>{user ? 'Tài khoản của bạn' : registering ? 'Cùng gieo mầm tri thức' : 'Mừng bạn trở lại!'}</h2>
      <p id={`${id}-description`} className="account-description">{description}</p>
      {user ? <>
        <dl className="account-profile"><div><dt>Họ và tên</dt><dd>{user.fullName}</dd></div><div><dt>Tên đăng nhập</dt><dd>{user.username}</dd></div></dl>
        <p className="account-note">Khi đăng xuất, bạn sẽ trở về khu vườn khách trước đó trên thiết bị này.</p>
        <button className="account-primary" type="button" disabled={pending} onClick={() => void perform(onLogout)}><LogOut size={18} aria-hidden="true" />{pending ? 'Đang đăng xuất…' : 'Đăng xuất'}</button>
      </> : <>
        <div className="account-modes" role="group" aria-label="Chọn đăng nhập hoặc tạo tài khoản">
          {(['login', 'register'] as const).map(value => <button key={value} type="button" aria-pressed={mode === value} disabled={pending} onClick={() => { setMode(value); setErrors({}); setError(''); setPassword(''); setVisible(false); }}>{value === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</button>)}
        </div>
        <form noValidate onSubmit={submit} aria-busy={pending}>
          <fieldset disabled={pending} className="account-fields">
            <div className="account-field"><label htmlFor={`${id}-username`}>Tên đăng nhập</label><input id={`${id}-username`} name="username" value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={32} required aria-invalid={!!errors.username} aria-describedby={errors.username ? `${id}-username-error` : registering ? `${id}-username-help` : undefined} />{fieldError('username')}{registering && !errors.username && <small id={`${id}-username-help`}>3–32 chữ cái không dấu, số hoặc dấu _ . -</small>}</div>
            {registering && <div className="account-field"><label htmlFor={`${id}-fullName`}>Họ và tên</label><input id={`${id}-fullName`} name="fullName" value={fullName} onChange={event => setFullName(event.target.value)} autoComplete="name" maxLength={100} required aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? `${id}-fullName-error` : undefined} />{fieldError('fullName')}</div>}
            <div className="account-field"><label htmlFor={`${id}-password`}>Mật khẩu</label><div className="account-password"><input id={`${id}-password`} name="password" type={visible ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} autoComplete={registering ? 'new-password' : 'current-password'} maxLength={128} minLength={registering ? 8 : undefined} required aria-invalid={!!errors.password} aria-describedby={errors.password ? `${id}-password-error` : registering ? `${id}-password-help` : undefined} /><button type="button" aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={visible} onClick={() => setVisible(value => !value)}>{visible ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>{fieldError('password')}{registering && !errors.password && <small id={`${id}-password-help`}>Từ 8 đến 128 ký tự. Hãy giữ mật khẩu cho riêng bạn.</small>}</div>
            {registering && <div className="account-field"><label htmlFor={`${id}-gender`}>Giới tính <span>(không bắt buộc)</span></label><select id={`${id}-gender`} value={gender} onChange={event => setGender(event.target.value)}><option value="">Không chia sẻ</option><option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option></select></div>}
            <button className="account-primary" type="submit">{pending ? 'Đang kết nối…' : registering ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
          </fieldset>
        </form>
        <p className="account-note">Tiến trình của tài khoản và khu vườn khách được lưu riêng. Dữ liệu khách không tự chuyển vào tài khoản.</p>
      </>}
      <div className="account-feedback" aria-live="polite" aria-atomic="true">{error && <p role="alert">{error}</p>}</div>
    </div>
  </dialog>;
}
