export interface AccountUser { id: string; username: string; fullName: string; gender: null | 'male' | 'female' | 'other' }
export type AccountAction = 'session' | 'login' | 'register' | 'logout';

export async function accountRequest(action: AccountAction, body?: unknown, fetcher: typeof fetch = globalThis.fetch, signal?: AbortSignal): Promise<AccountUser | null> {
  const response = await fetcher(`/api/device/auth/${action}`, {
    method: action === 'session' ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store', signal: signal || AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Chưa kết nối được tài khoản. Vui lòng thử lại.');
  if (data.user === null && (action === 'session' || action === 'logout')) return null;
  const user = data.user;
  if (!user || typeof user.id !== 'string' || !user.id || typeof user.username !== 'string' || !user.username || typeof user.fullName !== 'string' || !user.fullName || ![null, 'male', 'female', 'other'].includes(user.gender)) {
    throw new Error('Chưa xác nhận được tài khoản. Vui lòng thử lại.');
  }
  return { id: user.id, username: user.username, fullName: user.fullName, gender: user.gender };
}
