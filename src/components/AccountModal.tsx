import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, AtSign, Eye, EyeOff, Flower2, GraduationCap, LogOut, School, UserRound, X } from 'lucide-react';
import './account-modal.css';

export interface AccountModalProps {
  open: boolean;
  onClose: () => void;
  user: { id: string; username: string; fullName: string; gender: null | 'male' | 'female' | 'other'; role: 'learner' | 'teacher' } | null;
  onLogin: (input: { username: string; password: string; role: 'learner' | 'teacher' }) => Promise<void>;
  onRegister: (input: { username: string; fullName: string; password: string; gender?: string | null; role: 'learner' | 'teacher' }) => Promise<void>;
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
  const [role, setRole] = useState<'learner' | 'teacher'>('learner');
  const [loginRole, setLoginRole] = useState<'learner' | 'teacher' | null>(null);
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
      setLoginRole(null);
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
    if (mode === 'login' && !loginRole) return;
    void perform(() => mode === 'login' ? onLogin({ username: name, password, role: loginRole! }) : onRegister({ username: name, fullName: fullName.trim(), password, gender: gender || null, role }));
  }

  const registering = mode === 'register';
  const choosingLoginRole = mode === 'login' && !loginRole;
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
      <h2 id={`${id}-title`}>{user ? 'Tài khoản của bạn' : registering ? 'Cùng gieo mầm tri thức' : choosingLoginRole ? 'Bạn đăng nhập với tư cách nào?' : loginRole === 'teacher' ? 'Đăng nhập giáo viên' : 'Đăng nhập học sinh'}</h2>
      <p id={`${id}-description`} className="account-description">{user || registering ? description : choosingLoginRole ? 'Chọn đúng loại tài khoản để vào không gian dành riêng cho bạn.' : loginRole === 'teacher' ? 'Truy cập kho giáo án, danh sách học sinh và hộp thư phụ huynh.' : 'Tiếp tục hành trình học tập và khu vườn thành tích của bé.'}</p>
      {user ? <>
        <div className={`account-profile-summary account-profile-summary--${user.role}`}>
          <span className="account-avatar" aria-hidden="true">{user.fullName.trim().charAt(0).toLocaleUpperCase('vi-VN') || <UserRound size={26} />}</span>
          <div><strong>{user.fullName}</strong><span>{user.role === 'teacher' ? 'Tài khoản giáo viên' : 'Tài khoản học sinh'}</span></div>
        </div>
        <dl className="account-profile">
          <div><dt><UserRound size={18} aria-hidden="true" /> Họ và tên</dt><dd>{user.fullName}</dd></div>
          <div><dt><AtSign size={18} aria-hidden="true" /> Tên đăng nhập</dt><dd>{user.username}</dd></div>
          <div><dt><GraduationCap size={18} aria-hidden="true" /> Loại tài khoản</dt><dd><span className={`account-role account-role--${user.role}`}>{user.role === 'teacher' ? 'Giáo viên' : 'Học sinh / gia đình'}</span></dd></div>
        </dl>
        <p className="account-note">Khi đăng xuất, bạn sẽ trở về khu vườn khách trước đó trên thiết bị này.</p>
        <button className="account-primary" type="button" disabled={pending} onClick={() => void perform(onLogout)}><LogOut size={18} aria-hidden="true" />{pending ? 'Đang đăng xuất…' : 'Đăng xuất'}</button>
      </> : <>
        <div className="account-modes" role="group" aria-label="Chọn đăng nhập hoặc tạo tài khoản">
          {(['login', 'register'] as const).map(value => <button key={value} type="button" aria-pressed={mode === value} disabled={pending} onClick={() => { setMode(value); setLoginRole(null); setErrors({}); setError(''); setPassword(''); setVisible(false); }}>{value === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</button>)}
        </div>
        {choosingLoginRole ? <div className="account-role-choice" role="group" aria-label="Chọn loại tài khoản đăng nhập">
          <button className="account-role-card account-role-card--learner" type="button" onClick={() => setLoginRole('learner')}>
            <span className="account-role-card__icon" aria-hidden="true"><GraduationCap size={28} /></span>
            <span><strong>Học sinh</strong><small>Vào khu vui học, bài học và thành tích của bé</small></span>
            <span className="account-role-card__action">Chọn học sinh</span>
          </button>
          <button className="account-role-card account-role-card--teacher" type="button" onClick={() => setLoginRole('teacher')}>
            <span className="account-role-card__icon" aria-hidden="true"><School size={28} /></span>
            <span><strong>Giáo viên</strong><small>Vào kho giáo án, học sinh và hộp thư phụ huynh</small></span>
            <span className="account-role-card__action">Chọn giáo viên</span>
          </button>
        </div> : <form noValidate onSubmit={submit} aria-busy={pending}>
          <fieldset disabled={pending} className="account-fields">
            {!registering && <button className="account-back-role" type="button" onClick={() => { setLoginRole(null); setPassword(''); setError(''); setErrors({}); }}><ArrowLeft size={17} aria-hidden="true" /> Chọn loại tài khoản khác</button>}
            <div className="account-field"><label htmlFor={`${id}-username`}>Tên đăng nhập</label><input id={`${id}-username`} name="username" value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={32} required aria-invalid={!!errors.username} aria-describedby={errors.username ? `${id}-username-error` : registering ? `${id}-username-help` : undefined} />{fieldError('username')}{registering && !errors.username && <small id={`${id}-username-help`}>3–32 chữ cái không dấu, số hoặc dấu _ . -</small>}</div>
            {registering && <div className="account-field"><label htmlFor={`${id}-fullName`}>Họ và tên</label><input id={`${id}-fullName`} name="fullName" value={fullName} onChange={event => setFullName(event.target.value)} autoComplete="name" maxLength={100} required aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? `${id}-fullName-error` : undefined} />{fieldError('fullName')}</div>}
            {registering && <div className="account-field"><label htmlFor={`${id}-role`}>Đăng ký dành cho</label><select id={`${id}-role`} value={role} onChange={event => setRole(event.target.value as 'learner' | 'teacher')}><option value="learner">Học sinh / gia đình</option><option value="teacher">Giáo viên</option></select><small>Tài khoản giáo viên được mở Khu vực cô giáo, kho giáo án, danh sách học sinh và hộp thư phụ huynh.</small></div>}
            <div className="account-field"><label htmlFor={`${id}-password`}>Mật khẩu</label><div className="account-password"><input id={`${id}-password`} name="password" type={visible ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} autoComplete={registering ? 'new-password' : 'current-password'} maxLength={128} minLength={registering ? 8 : undefined} required aria-invalid={!!errors.password} aria-describedby={errors.password ? `${id}-password-error` : registering ? `${id}-password-help` : undefined} /><button type="button" aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={visible} onClick={() => setVisible(value => !value)}>{visible ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>{fieldError('password')}{registering && !errors.password && <small id={`${id}-password-help`}>Từ 8 đến 128 ký tự. Hãy giữ mật khẩu cho riêng bạn.</small>}</div>
            {registering && <div className="account-field"><label htmlFor={`${id}-gender`}>Giới tính <span>(không bắt buộc)</span></label><select id={`${id}-gender`} value={gender} onChange={event => setGender(event.target.value)}><option value="">Không chia sẻ</option><option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option></select></div>}
            <button className="account-primary" type="submit">{pending ? 'Đang kết nối…' : registering ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
          </fieldset>
        </form>}
        <p className="account-note">Tiến trình của tài khoản và khu vườn khách được lưu riêng. Dữ liệu khách không tự chuyển vào tài khoản.</p>
      </>}
      <div className="account-feedback" aria-live="polite" aria-atomic="true">{error && <p role="alert">{error}</p>}</div>
    </div>
  </dialog>;
}
