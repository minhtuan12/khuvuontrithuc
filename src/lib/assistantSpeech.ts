let activeUtterance: SpeechSynthesisUtterance | null = null;
let cancelPlayback: (() => void) | null = null;

type ResponsiveVoiceApi = {
  speak: (text: string, voice: string, options: { rate: number; onend: () => void; onerror: () => void }) => void;
  cancel: () => void;
};

function getResponsiveVoice(): ResponsiveVoiceApi | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as typeof window & { responsiveVoice?: ResponsiveVoiceApi }).responsiveVoice;
}

const VIETNAMESE_FEMALE_VOICE_NAMES = [
  'hoaima',
  'hoaimy',
  'linh',
  'lien',
  'microsoft an',
  'female',
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

async function getAvailableVoices(synthesis: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  const immediate = synthesis.getVoices();
  if (immediate.length > 0) return immediate;

  return new Promise(resolve => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      synthesis.removeEventListener?.('voiceschanged', finish);
      resolve(synthesis.getVoices());
    };
    const timeout = setTimeout(finish, 1500);
    synthesis.addEventListener?.('voiceschanged', finish, { once: true });
  });
}

export function stopAssistantSpeech() {
  cancelPlayback?.();
  cancelPlayback = null;
  getResponsiveVoice()?.cancel();
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
  activeUtterance = null;
}

async function speakWithVietnameseFemaleVoice(text: string, voice: ResponsiveVoiceApi): Promise<void> {
  stopAssistantSpeech();
  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      cancelPlayback = null;
      error ? reject(error) : resolve();
    };
    const timeout = setTimeout(() => finish(new Error('Chưa phát được giọng nữ tiếng Việt. Hãy thử nghe lại.')), Math.max(20000, text.length * 200));
    cancelPlayback = () => finish();
    voice.speak(text.replace(/[*#_`]/g, '').trim(), 'Vietnamese Female', {
      rate: 0.9,
      onend: () => finish(),
      onerror: () => finish(new Error('Không phát được giọng nữ tiếng Việt. Hãy thử nghe lại.')),
    });
  });
}

/** Automatic narration remains off. A listen button must explicitly opt in. */
export async function readAssistantMessage(text: string, requested = false, lang = 'vi'): Promise<void> {
  if (!requested || !text.trim()) return;
  const responsiveVoice = lang === 'vi' ? getResponsiveVoice() : undefined;
  if (responsiveVoice) return speakWithVietnameseFemaleVoice(text, responsiveVoice);
  const synthesis = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  if (!synthesis || typeof SpeechSynthesisUtterance === 'undefined') {
    throw new Error('Trình duyệt chưa hỗ trợ đọc thành tiếng. Hãy thử Chrome hoặc Edge.');
  }
  stopAssistantSpeech();
  const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, '').trim());
  activeUtterance = utterance;
  utterance.lang = lang === 'vi' ? 'vi-VN' : lang;
  utterance.rate = 0.9;
  const voices = await getAvailableVoices(synthesis);
  const voice = lang === 'vi'
    ? findSafeVietnameseVoice(voices)
    : voices.find(item => item.lang.toLowerCase().startsWith(lang.toLowerCase()));
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
