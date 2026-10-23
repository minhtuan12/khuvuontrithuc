import { useEffect, useMemo, useRef } from 'react';
import { getLearnerScope } from './learnerStorage';

export type TeacherAge = '3-4' | '4-5' | '5-6';
export interface TeacherQuestion { id: string; accountId: string; content: string; status: 'new' | 'read' | 'answered' | 'withdrawn'; reply: string | null; version: number; createdAt: string; updatedAt: string }
export interface TeacherPlan { id: string; title: string; content?: string; activity: string; ageBand: TeacherAge | null; studentAccountId: string | null; source: 'manual' | 'word' | 'ai'; version: number; createdAt: string; updatedAt: string; files?: { id: string; originalName: string; byteSize?: number; extractionStatus?: string }[] }
export interface TeacherStudent { id: string; username: string; fullName: string; profile: { ageBand: TeacherAge | null; nickname: string }; summary: { stars: number | null; gameStars: number | null; badges: string[] | null; learningStats: Record<string, unknown> | null; englishProgress: Record<string, unknown> | null; gardenProgress: Record<string, unknown> | null; studyTime: Record<string, unknown> | null; dailyActivity: Record<string, unknown> | null; hasActivity: boolean; missingKeys: string[] } }
export class TeacherApiError extends Error { constructor(message: string, public status: number, public code = '') { super(message); } }
export const isCancelled = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Chưa kết nối được. Vui lòng thử lại.';
export const dateLabel = (value: string) => Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString('vi-VN') : 'Chưa ghi nhận';

/** Every request and result belongs to the identity captured when its screen mounted. */
export function useScopedTeacherApi() {
  const scope = useMemo(getLearnerScope, []);
  const lifetime = useRef(new AbortController());
  useEffect(() => {
    if (lifetime.current.signal.aborted) lifetime.current = new AbortController();
    const active = lifetime.current;
    return () => active.abort();
  }, []);
  return useMemo(() => ({
    get signal() { return lifetime.current.signal; },
    async request<T>(path: string, init: RequestInit = {}): Promise<T> {
      const active = lifetime.current;
      if (active.signal.aborted || getLearnerScope() !== scope) throw new DOMException('Tài khoản đã thay đổi', 'AbortError');
      const headers = new Headers(init.headers);
      if (scope !== 'guest') headers.set('X-KVTT-Account', scope);
      if (init.body && !(init.body instanceof Blob) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
      const response = await fetch(path, { ...init, credentials: 'same-origin', cache: 'no-store', headers, signal: AbortSignal.any([active.signal, init.signal || AbortSignal.timeout(60000)]) });
      const data = await response.json().catch(() => ({}));
      if (active.signal.aborted || getLearnerScope() !== scope) throw new DOMException('Tài khoản đã thay đổi', 'AbortError');
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          if (path.startsWith('/api/teacher/')) window.dispatchEvent(new Event('kvtt-teacher-access-revoked'));
          window.dispatchEvent(new Event('kvtt-account-expired'));
        }
        throw new TeacherApiError(typeof data.error === 'string' ? data.error : data.error?.message || (response.status === 409 ? 'Bản này đã thay đổi ở nơi khác. Nội dung đang sửa vẫn được giữ.' : 'Chưa hoàn tất yêu cầu. Vui lòng thử lại.'), response.status, data.error?.code);
      }
      return data as T;
    },
  }), [scope, lifetime]);
}
