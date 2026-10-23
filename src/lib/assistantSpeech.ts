let activeUtterance: SpeechSynthesisUtterance | null = null;
let cancelPlayback: (() => void) | null = null;

const VIETNAMESE_FEMALE_VOICE_NAMES = [
  'hoaima',
  'hoaimy',
  'linh',
  'lien',
  'female',
  'nữ',
  'google tiếng việt',
  'google tieng viet',
];

function normalizedVoiceName(voice: SpeechSynthesisVoice): string {
  return voice.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function findSafeVietnameseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return voices.find(voice => {
    if (!voice.lang.toLowerCase().startsWith('vi')) return false;
    const name = normalizedVoiceName(voice);
    return VIETNAMESE_FEMALE_VOICE_NAMES.some(candidate => name.includes(candidate.normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
  });
}

export function stopAssistantSpeech() {
  cancelPlayback?.();
  cancelPlayback = null;
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
  activeUtterance = null;
}

/** Automatic narration remains off. A listen button must explicitly opt in. */
export async function readAssistantMessage(text: string, requested = false, lang = 'vi'): Promise<void> {
  if (!requested || !text.trim()) return;
  const synthesis = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  if (!synthesis || typeof SpeechSynthesisUtterance === 'undefined') {
    throw new Error('Trình duyệt chưa hỗ trợ đọc thành tiếng. Hãy thử Chrome hoặc Edge.');
  }
  stopAssistantSpeech();
  const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, '').trim());
  activeUtterance = utterance;
  utterance.lang = lang === 'vi' ? 'vi-VN' : lang;
  utterance.rate = 0.9;
  const voice = lang === 'vi'
    ? findSafeVietnameseVoice(synthesis.getVoices())
    : synthesis.getVoices().find(item => item.lang.toLowerCase().startsWith(lang.toLowerCase()));
  if (lang === 'vi' && !voice) {
    throw new Error('Thiết bị chưa có giọng nữ tiếng Việt phù hợp. Ứng dụng đã ngắt giọng đọc mặc định để tránh phát sai giọng.');
  }
  if (voice) utterance.voice = voice;
  await new Promise<void>((resolve, reject) => {
    const finish = (error?: Error) => {
      clearTimeout(timeout);
      if (activeUtterance === utterance) { activeUtterance = null; cancelPlayback = null; }
      utterance.onend = null;
      utterance.onerror = null;
      error ? reject(error) : resolve();
    };
    const timeout = setTimeout(() => { finish(new Error('Chưa phát được âm thanh. Hãy kiểm tra âm lượng và thử nghe lại.')); synthesis.cancel(); }, Math.max(20000, text.length * 200));
    cancelPlayback = () => finish();
    utterance.onend = () => finish();
    utterance.onerror = event => finish(event.error === 'interrupted' || event.error === 'canceled' ? undefined : new Error('Không đọc được âm thanh. Hãy kiểm tra giọng đọc tiếng Việt trên thiết bị và thử lại.'));
    try { synthesis.resume(); synthesis.speak(utterance); }
    catch { finish(new Error('Chưa phát được âm thanh. Hãy thử nghe lại.')); }
  });
}
