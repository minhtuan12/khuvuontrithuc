import { AccountError, type PublicAccount } from './accountService.ts';

/** Resolve the HttpOnly session through the trusted account backend without copying its service key. */
export class RemoteTeacherAuthorization {
  constructor(private root: string) {}
  async requireTeacher(token: string | undefined): Promise<PublicAccount> {
    if (!token || !/^[a-f0-9]{64}$/.test(token)) throw new AccountError(401, 'Vui lòng đăng nhập tài khoản giáo viên.');
    const response = await fetch(`${this.root.replace(/\/$/, '')}/functions/v1/kvtt-device/api/device/auth/session`, {
      headers: { Cookie: `kvtt_account=${token}` }, signal: AbortSignal.timeout(10000), cache: 'no-store',
    });
    if (!response.ok) throw new AccountError(503, 'Không thể xác nhận tài khoản lúc này.');
    const { user } = await response.json() as {user?:PublicAccount|null};
    if (!user?.id) throw new AccountError(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    if (user.role !== 'teacher') throw new AccountError(403, 'Chức năng này chỉ dành cho giáo viên.');
    return user;
  }
}
