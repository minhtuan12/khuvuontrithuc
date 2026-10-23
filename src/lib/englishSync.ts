import { learnerStorage as localStorage } from './learnerStorage';
import { findEnglishLesson, type EnglishAge } from './englishCatalog';
import { DeviceDocument, deviceFetch } from './deviceData';
import { getLearnerScope, getLearnerStorage } from './learnerStorage';

const projectUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const sessionKey = 'kvtt.supabase.session.v1';
const progressKeyPrefix = 'kvtt.english.progress.v1';
let guestDocument: DeviceDocument<Record<string, EnglishProgress>> | null = null;
let guestStorage: Storage | null = null;
let guestScope = '';
let guestStarted = false;
let progressSyncError = '';
export function getEnglishProgressSyncError(): string { return progressSyncError; }
export function resetEnglishProgressForAccountChange() {
  guestDocument?.dispose();
  guestDocument = null;
  guestStorage = null;
  guestScope = '';
  guestStarted = false;
  progressSyncError = '';
  refreshFlight = null;
}
export async function restoreGuestEnglishProgress(): Promise<void> {
  if (getEnglishSession()) return;
  // The controller backs up the device draft and rejects restoration if edited in flight.
  // Its subscription updates the legacy cache before notifying the roadmap.
  await guestProgressDocument().restoreRemote();
}

function guestProgressDocument() {
  let backing: Storage | null = null;
  let storage: Storage | undefined;
  try { backing = globalThis.localStorage; storage = getLearnerStorage(); } catch { /* API and memory remain available when browser storage is blocked. */ }
  const scope = getLearnerScope();
  if (guestDocument && guestStorage === backing && guestScope === scope) return guestDocument;
  guestDocument?.dispose();
  guestDocument = null;
  guestStorage = backing;
  guestScope = scope;
  guestStarted = false;
  guestDocument = new DeviceDocument<Record<string, EnglishProgress>>('english-progress', getGuestEnglishProgress, { storage, fetch: (input,init) => {
    if (getLearnerScope() !== scope) return Promise.reject(new DOMException('Tài khoản đã thay đổi', 'AbortError'));
    return deviceFetch(input,init);
  } });
  const document = guestDocument;
  document.subscribe(() => {
    const state = document.snapshot();
    try { storage?.setItem(`${progressKeyPrefix}.guest`, JSON.stringify(state.value)); } catch {}
    if (getLearnerScope() !== scope) return;
    progressSyncError = state.error;
    window.dispatchEvent(new Event('english-progress-changed'));
  });
  return document;
}

async function syncGuestProgress() {
  const document = guestProgressDocument();
  if (!guestStarted) { guestStarted = true; await document.start(); }
  else await document.retry();
  return getGuestEnglishProgress();
}

export interface EnglishProgress {
  lessonId: string;
  ageBand: EnglishAge;
  openedAt: string;
  completedAt: string | null;
}

export interface EnglishSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: { id: string; email?: string };
}

export interface TeacherPlan {
  id: string;
  lesson_id: string;
  age_band: EnglishAge;
  teacher_note: string;
  status: 'draft' | 'approved';
  updated_at: string;
}

function teacherPlansResponse(value: unknown): TeacherPlan[] {
  if (!Array.isArray(value) || value.some(item => {
    if (!item || typeof item !== 'object') return true;
    const lesson = findEnglishLesson(item.lesson_id);
    return !lesson || item.age_band !== lesson.age || typeof item.id !== 'string' || !item.id ||
      typeof item.teacher_note !== 'string' || item.teacher_note.length > 2000 ||
      !['draft', 'approved'].includes(item.status) || !Number.isFinite(Date.parse(item.updated_at));
  })) throw new Error('Máy chủ trả về bài chuẩn bị không hợp lệ.');
  return value;
}

export const englishCloudConfigured = Boolean(projectUrl && publishableKey);

function headers(token?: string): Record<string, string> {
  return {
    apikey: publishableKey || '',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.msg || body.message || body.error_description || body.error || `HTTP ${response.status}`);
  return body as T;
}

export function getEnglishSession(): EnglishSession | null {
  try {
    const value = localStorage.getItem(sessionKey);
    const session = value ? JSON.parse(value) : null;
    return session && typeof session.access_token === 'string' && session.access_token &&
      typeof session.refresh_token === 'string' && session.refresh_token &&
      typeof session.expires_at === 'number' && Number.isFinite(session.expires_at) &&
      typeof session.user?.id === 'string' && session.user.id ? session as EnglishSession : null;
  } catch { return null; }
}

function saveSession(value: EnglishSession | null) {
  if (value) localStorage.setItem(sessionKey, JSON.stringify(value));
  else localStorage.removeItem(sessionKey);
  window.dispatchEvent(new Event('english-session-changed'));
}

export async function signInEnglish(email: string, password: string): Promise<EnglishSession> {
  if (!englishCloudConfigured) throw new Error('Chưa cấu hình Supabase.');
  const response = await fetch(`${projectUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: headers(), body: JSON.stringify({ email, password }),
  });
  const data = await readResponse<EnglishSession & { expires_in: number }>(response);
  const session = { ...data, expires_at: Math.floor(Date.now() / 1000) + data.expires_in };
  saveSession(session);
  return session;
}

export async function signUpEnglish(email: string, password: string): Promise<void> {
  if (!englishCloudConfigured) throw new Error('Chưa cấu hình Supabase.');
  await readResponse(await fetch(`${projectUrl}/auth/v1/signup`, {
    method: 'POST', headers: headers(), body: JSON.stringify({ email, password }),
  }));
}

export function signOutEnglish() { saveSession(null); }

function localProgressKey(): string {
  return `${progressKeyPrefix}.${getEnglishSession()?.user.id || 'guest'}`;
}

function sameSession(session: EnglishSession): boolean {
  const current = getEnglishSession();
  return current?.user.id === session.user.id && current.refresh_token === session.refresh_token;
}

let refreshFlight: { key: string; promise: Promise<string | null> } | null = null;

async function validToken(): Promise<string | null> {
  const session = getEnglishSession();
  if (!session) return null;
  if (session.expires_at > Math.floor(Date.now() / 1000) + 60) return session.access_token;
  if (!englishCloudConfigured) return null;
  const key = `${session.user.id}:${session.refresh_token}`;
  if (refreshFlight?.key === key) return refreshFlight.promise;
  const promise = (async () => {
    try {
      const response = await fetch(`${projectUrl}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST', headers: headers(), body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
      // A late refresh must never restore an account after logout or account change.
      if (!sameSession(session)) return null;
      if (!response.ok) {
        if (response.status === 400 || response.status === 401) saveSession(null);
        return null;
      }
      const refreshed = await readResponse<EnglishSession & { expires_in: number }>(response);
      if (!sameSession(session) || refreshed.user?.id !== session.user.id) return null;
      const next = { ...refreshed, expires_at: Math.floor(Date.now() / 1000) + refreshed.expires_in };
      saveSession(next);
      return next.access_token;
    } catch { return null; } // Network failures retain the session for retry.
  })();
  refreshFlight = { key, promise };
  try { return await promise; }
  finally { if (refreshFlight?.promise === promise) refreshFlight = null; }
}

export function getGuestEnglishProgress(): Record<string, EnglishProgress> {
  const inMemory = () => guestDocument && guestScope === getLearnerScope() && !getEnglishSession() ? { ...guestDocument.snapshot().value } : {};
  try {
    const value = localStorage.getItem(localProgressKey());
    if (!value) return inMemory();
    const parsed = value ? JSON.parse(value) : null;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([id, item]) => {
      const progress = item as EnglishProgress | null;
      const lesson = findEnglishLesson(id);
      return lesson && progress && progress.lessonId === id && progress.ageBand === lesson.age &&
        typeof progress.openedAt === 'string' && Number.isFinite(Date.parse(progress.openedAt)) &&
        (progress.completedAt === null || (typeof progress.completedAt === 'string' && Number.isFinite(Date.parse(progress.completedAt))));
    })) as Record<string, EnglishProgress>;
  } catch { return inMemory(); }
}

export async function recordEnglishProgress(lessonId: string, completed: boolean): Promise<void> {
  const found = findEnglishLesson(lessonId);
  if (!found) throw new Error('Bài học không có trong dữ liệu hiện tại.');
  const progress = getGuestEnglishProgress();
  const previous = progress[lessonId];
  const now = new Date().toISOString();
  const item: EnglishProgress = {
    lessonId,
    ageBand: found.age,
    openedAt: previous?.openedAt || now,
    completedAt: completed ? now : previous?.completedAt || null,
  };
  progress[lessonId] = item;
  try { localStorage.setItem(localProgressKey(), JSON.stringify(progress)); } catch { /* The document retains changes in memory and saves through the API. */ }
  window.dispatchEvent(new Event('english-progress-changed'));
  const owner = getEnglishSession()?.user.id;
  if (!owner) {
    guestProgressDocument().set(previous => ({ ...previous, [lessonId]: item }));
    await syncGuestProgress();
    return;
  }
  const token = await validToken();
  if (getEnglishSession()?.user.id !== owner) return;
  if (!token) {
    progressSyncError = 'Chưa xác thực được phiên đăng nhập. Tiến độ vẫn được giữ trên thiết bị; hãy thử lại.';
    window.dispatchEvent(new Event('english-progress-changed'));
    return;
  }
  try {
    await uploadProgress(item, token);
    progressSyncError = '';
    window.dispatchEvent(new Event('english-progress-changed'));
  } catch {
    // The device copy remains available for a later retry.
    progressSyncError = 'Chưa lưu được tiến độ lên máy chủ. Thay đổi vẫn được giữ trên thiết bị.';
    window.dispatchEvent(new Event('english-progress-changed'));
  }
}

async function uploadProgress(item: EnglishProgress, token: string): Promise<void> {
    await readResponse(await fetch(`${projectUrl}/rest/v1/rpc/save_current_english_progress`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ p_lesson_id: item.lessonId, p_age_band: item.ageBand, p_opened_at: item.openedAt, p_completed_at: item.completedAt }),
    }));
}

export async function syncEnglishProgress(): Promise<Record<string, EnglishProgress>> {
  const owner = getEnglishSession()?.user.id;
  if (!owner) return syncGuestProgress();
  const token = await validToken();
  if (getEnglishSession()?.user.id !== owner) return getGuestEnglishProgress();
  if (!token) throw new Error('Chưa xác thực được phiên đăng nhập để đồng bộ tiến độ.');
  let local = getGuestEnglishProgress();
  for (const item of Object.values(local)) {
    if (getEnglishSession()?.user.id !== owner) return getGuestEnglishProgress();
    if (findEnglishLesson(item.lessonId)) await uploadProgress(item, token);
  }
  const remote = await readResponse<Array<{ lesson_id: string; age_band: EnglishAge; opened_at: string; completed_at: string | null }>>(await fetch(`${projectUrl}/rest/v1/english_lesson_progress?select=lesson_id,age_band,opened_at,completed_at`, { headers: headers(token) }));
  if (getEnglishSession()?.user.id !== owner) return getGuestEnglishProgress();
  if (!Array.isArray(remote)) throw new Error('Máy chủ trả về tiến độ không hợp lệ.');
  // Read again after network I/O so newer device completions are retained.
  local = getGuestEnglishProgress();
  for (const item of remote) {
    const lesson = findEnglishLesson(item.lesson_id);
    if (!lesson || lesson.age !== item.age_band || !Number.isFinite(Date.parse(item.opened_at)) ||
      (item.completed_at !== null && !Number.isFinite(Date.parse(item.completed_at)))) continue;
    const previous = local[item.lesson_id];
    local[item.lesson_id] = { lessonId: item.lesson_id, ageBand: item.age_band, openedAt: previous?.openedAt || item.opened_at, completedAt: previous?.completedAt || item.completed_at };
  }
  try { localStorage.setItem(localProgressKey(), JSON.stringify(local)); } catch { /* Remote synchronization still works without a browser cache. */ }
  progressSyncError = '';
  window.dispatchEvent(new Event('english-progress-changed'));
  return local;
}

export async function listTeacherPlans(): Promise<TeacherPlan[]> {
  const owner = getEnglishSession()?.user.id;
  const token = await validToken();
  if (!token || getEnglishSession()?.user.id !== owner) throw new Error('Cô cần đăng nhập để xem bài đã chuẩn bị.');
  const plans = await readResponse<TeacherPlan[]>(await fetch(`${projectUrl}/rest/v1/teacher_english_plans?select=id,lesson_id,age_band,teacher_note,status,updated_at&order=updated_at.desc`, { headers: headers(token) }));
  if (getEnglishSession()?.user.id !== owner) throw new Error('T\u00e0i kho\u1ea3n \u0111\u00e3 thay \u0111\u1ed5i.');
  return teacherPlansResponse(plans);
}

export async function saveTeacherPlan(lessonId: string, teacherNote: string, status: 'draft' | 'approved', planId?: string): Promise<TeacherPlan> {
  const found = findEnglishLesson(lessonId);
  if (!found) throw new Error('Bài học không có trong dữ liệu hiện tại.');
  const owner = getEnglishSession()?.user.id;
  const token = await validToken();
  if (!token || getEnglishSession()?.user.id !== owner) throw new Error('Cô cần đăng nhập để lưu bài chuẩn bị.');
  if (teacherNote.length > 2000) throw new Error('Ghi chú tối đa 2.000 ký tự.');
  const body = { lesson_id: lessonId, age_band: found.age, teacher_note: teacherNote, status, updated_at: new Date().toISOString() };
  const response = await fetch(`${projectUrl}/rest/v1/teacher_english_plans${planId ? `?id=eq.${encodeURIComponent(planId)}` : ''}`, {
    method: planId ? 'PATCH' : 'POST', headers: { ...headers(token), Prefer: 'return=representation' }, body: JSON.stringify(body),
  });
  const saved = teacherPlansResponse(await readResponse<unknown>(response));
  if (getEnglishSession()?.user.id !== owner) throw new Error('T\u00e0i kho\u1ea3n \u0111\u00e3 thay \u0111\u1ed5i.');
  if (!saved[0]) throw new Error('Không tìm thấy bài chuẩn bị để lưu.');
  return saved[0];
}
