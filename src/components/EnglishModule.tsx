import { learnerStorage as localStorage } from '../lib/learnerStorage';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Volume2, Volume1, VolumeX, Mic, MicOff, Sparkles, Star, Play, CheckCircle2, 
  HelpCircle, BookOpen, Music, Users, GraduationCap, 
  RotateCcw, Award, ChevronRight, MessageSquare, Heart, Lightbulb, Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  ENGLISH_DATA_3_4, 
  ENGLISH_DATA_4_5, 
  ENGLISH_DATA_5_6, 
  CORE_ENGLISH_TOPICS,
  TEACHER_CLASSROOM_PHRASES, 
  TEACHER_ACTIVITY_TOPICS, 
  TEACHER_LEARNING_LEVELS, 
  TEACHER_THEMATIC_TOPICS,
  NURSERY_RHYMES_SONGS,
  EnglishLessonTheme,
  EnglishWord,
  TeacherClassroomPhrase,
  TeacherActivityTopic,
  TeacherThematicTopic
} from '../constants/englishData';
import { EnglishGamesPlayground } from './EnglishGamesPlayground';
import EnglishRoadmap from './EnglishRoadmap';
import TeacherWorkshop from './TeacherWorkshop';
import { useTeacherAccess } from '../lib/accountContext';
import { type EnglishAge } from '../lib/englishCatalog';
import { recordEnglishProgress } from '../lib/englishSync';
import { useDeviceDocument } from '../lib/useDeviceDocument';

interface EnglishModuleProps {
  onBack: () => void;
  onLessonComplete?: (lesson: EnglishLessonTheme) => void;
  onGameComplete?: (title: string) => void;
  initialTarget?: 'kids' | 'teachers' | 'games' | 'songs' | 'phonics';
  initialAge?: '3-4' | '4-5' | '5-6';
}

export function createEnglishGameCompletionGuard() {
  let completed = false;
  return {
    reset() { completed = false; },
    finish(onComplete: () => void) {
      if (completed) return false;
      completed = true;
      onComplete();
      return true;
    },
  };
}

export function ungradedEnglishSpeechEvaluation() {
  return {
    score: null as number | null,
    stars: 0,
    feedback: 'Chưa nhận diện được lời nói nên chưa thể chấm điểm. Hãy kiểm tra quyền micro, nghe mẫu và thử lại nhé.',
    isSuper: false,
  };
}

export function createEnglishPracticeLifetime(onDispose: () => void = () => {}) {
  let active = true;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const streams = new Set<MediaStream>();
  return {
    isActive: () => active,
    ownStream(stream: MediaStream) {
      if (!active) {
        stream.getTracks().forEach(track => track.stop());
        return false;
      }
      streams.add(stream);
      return true;
    },
    schedule(task: () => void, delay: number) {
      if (!active) return;
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (active) task();
      }, delay);
      timers.add(timer);
    },
    dispose() {
      if (!active) return;
      active = false;
      timers.forEach(clearTimeout);
      timers.clear();
      onDispose();
      streams.forEach(stream => stream.getTracks().forEach(track => track.stop()));
      streams.clear();
    },
  };
}

export default function EnglishModule({ onBack, onLessonComplete, onGameComplete, initialTarget = 'kids', initialAge = '3-4' }: EnglishModuleProps) {
  const isTeacher = useTeacherAccess();
  // Main Tab State: 'kids' (Bé yêu) | 'teachers' (Tiếng Anh cùng cô giáo) | 'games' (Trò chơi) | 'songs' (Bài hát) | 'phonics' (Bảng âm)
  const [activeMainTab, setActiveMainTab] = useState<'kids' | 'roadmap' | 'teachers' | 'games' | 'songs' | 'phonics'>(initialTarget === 'kids' || (initialTarget === 'teachers' && !isTeacher) ? 'roadmap' : initialTarget);
  const [lessonOpenedFromRoadmap, setLessonOpenedFromRoadmap] = useState(false);
  const [roadmapGroup, setRoadmapGroup] = useState('');
  
  // Kids State
  const [selectedKidAge, setSelectedKidAge] = useState<'3-4' | '4-5' | '5-6'>(initialAge);
  const [selectedTheme, setSelectedTheme] = useState<EnglishLessonTheme | null>(null);
  const [isPlayingGame, setIsPlayingGame] = useState(false);
  const [currentGameQuestionIndex, setCurrentGameQuestionIndex] = useState(0);
  const [selectedGameAnswer, setSelectedGameAnswer] = useState<string | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const gameCompletionRef = React.useRef(createEnglishGameCompletionGuard());
  const gameAnswerRef = React.useRef(createEnglishGameCompletionGuard());
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');

  // Teacher State: 'thematic-topics' | 'phrases' | 'activities' | 'levels'
  const [teacherTab, setTeacherTab] = useState<'thematic-topics' | 'phrases' | 'activities' | 'levels' | 'prepare'>('thematic-topics');
  const [selectedTeacherThematicTopic, setSelectedTeacherThematicTopic] = useState<TeacherThematicTopic>(TEACHER_THEMATIC_TOPICS[0]);
  const [thematicFilterCategory, setThematicFilterCategory] = useState<string>('all');
  const [teacherThematicQuizAnswer, setTeacherThematicQuizAnswer] = useState<number | null>(null);
  const [teacherThematicQuizSubmitted, setTeacherThematicQuizSubmitted] = useState<boolean>(false);
  const [thematicActiveDetailTab, setThematicActiveDetailTab] = useState<'script' | 'prompts' | 'dialogue' | 'vocab' | 'strategy' | 'quiz'>('script');

  const [selectedTeacherActivity, setSelectedTeacherActivity] = useState<TeacherActivityTopic | null>(null);
  const [selectedTeacherLevelIndex, setSelectedTeacherLevelIndex] = useState(0);
  const [selectedTeacherLessonIndex, setSelectedTeacherLessonIndex] = useState(0);
  const [teacherQuizAnswer, setTeacherQuizAnswer] = useState<number | null>(null);
  const [teacherQuizSubmitted, setTeacherQuizSubmitted] = useState(false);

  // Audio & Speech Settings
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [currentlySpeaking, setCurrentlySpeaking] = useState<string | null>(null);
  const [isSpeakingSlow, setIsSpeakingSlow] = useState(false);

  // Active Video Modal for songs or lessons
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Kid Pronunciation & Speech Practice State
  const [activePracticeWord, setActivePracticeWord] = useState<EnglishWord | null>(null);
  const [isRecordingKidSpeech, setIsRecordingKidSpeech] = useState(false);
  const [kidSpeechTranscript, setKidSpeechTranscript] = useState('');
  const [kidSpeechEvaluation, setKidSpeechEvaluation] = useState<{
    score: number | null;
    stars: number;
    feedback: string;
    isSuper: boolean;
  } | null>(null);
  const [kidRecordedAudioUrl, setKidRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecordedAudio, setIsPlayingRecordedAudio] = useState(false);
  const [earnedStarsMap, setEarnedStarsMap, starsSync] = useDeviceDocument<Record<string, number>>('english-stars', () => {
    try {
      const saved = localStorage.getItem('mamnon_english_stars');
      const parsed = saved ? JSON.parse(saved) : {};
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      return Object.fromEntries(Object.entries(parsed).filter(([, value]) => Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 3)) as Record<string, number>;
    } catch {
      return {};
    }
  });

  // Teacher Pronunciation Practice State
  const [activeTeacherPractice, setActiveTeacherPractice] = useState<{
    id: string;
    english: string;
    phonetic: string;
    vietnamese: string;
    situation?: string;
    tip?: string;
    category?: string;
  } | null>(null);
  const [isRecordingTeacherSpeech, setIsRecordingTeacherSpeech] = useState(false);
  const [teacherSpeechTranscript, setTeacherSpeechTranscript] = useState('');
  const [teacherSpeechEvaluation, setTeacherSpeechEvaluation] = useState<{
    score: number | null;
    stars: number;
    feedback: string;
    isSuper: boolean;
  } | null>(null);
  const [teacherRecordedAudioUrl, setTeacherRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingTeacherRecordedAudio, setIsPlayingTeacherRecordedAudio] = useState(false);

  const teacherMediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const teacherAudioChunksRef = React.useRef<Blob[]>([]);
  const teacherRecognitionRef = React.useRef<any>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const recognitionRef = React.useRef<any>(null);

  const releasePractice = (recognition: React.RefObject<any>, recorder: React.RefObject<MediaRecorder | null>) => {
    const speech = recognition.current;
    if (speech) {
      speech.onresult = null;
      speech.onerror = null;
      speech.onend = null;
      try { speech.abort(); } catch {}
      recognition.current = null;
    }
    const recording = recorder.current;
    if (recording) {
      recording.ondataavailable = null;
      recording.onstop = null;
      if (recording.state !== 'inactive') {
        try { recording.stop(); } catch {}
      }
      recorder.current = null;
    }
  };
  const newKidLifetime = () => createEnglishPracticeLifetime(() => releasePractice(recognitionRef, mediaRecorderRef));
  const newTeacherLifetime = () => createEnglishPracticeLifetime(() => releasePractice(teacherRecognitionRef, teacherMediaRecorderRef));
  const kidLifetimeRef = React.useRef(newKidLifetime());
  const teacherLifetimeRef = React.useRef(newTeacherLifetime());
  const moduleLifetimeRef = React.useRef(createEnglishPracticeLifetime());
  const scheduleModuleTask = (task: () => void, delay: number) => moduleLifetimeRef.current.schedule(task, delay);

  useEffect(() => {
    kidLifetimeRef.current = newKidLifetime();
    teacherLifetimeRef.current = newTeacherLifetime();
    moduleLifetimeRef.current = createEnglishPracticeLifetime();
    return () => {
      kidLifetimeRef.current.dispose();
      teacherLifetimeRef.current.dispose();
      moduleLifetimeRef.current.dispose();
      window.speechSynthesis?.cancel();
    };
  }, []);
  useEffect(() => () => { if (kidRecordedAudioUrl) URL.revokeObjectURL(kidRecordedAudioUrl); }, [kidRecordedAudioUrl]);
  useEffect(() => () => { if (teacherRecordedAudioUrl) URL.revokeObjectURL(teacherRecordedAudioUrl); }, [teacherRecordedAudioUrl]);

  const cancelKidPractice = () => {
    kidLifetimeRef.current.dispose();
    setIsRecordingKidSpeech(false);
  };
  const cancelTeacherPractice = () => {
    teacherLifetimeRef.current.dispose();
    setIsRecordingTeacherSpeech(false);
  };

  // Musical chime generator using Web Audio API
  const playAudioChime = (isSuccess = true) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const freqs = isSuccess ? [523.25, 659.25, 783.99, 1046.50] : [440, 554.37, 659.25];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.38);
      });
    } catch {
      // Audio context may require prior user interaction
    }
  };

  // Speech synthesizer for English (with explicit rate multiplier for Slow Mode)
  const speakEnglish = (text: string, rateMultiplier?: number) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      const effectiveRate = rateMultiplier !== undefined ? rateMultiplier : speechRate;
      utterance.rate = effectiveRate;
      utterance.pitch = 1.05; // Slightly cheerful pitch for kindergarten

      setIsSpeakingSlow(effectiveRate <= 0.7);

      // Try to find natural English voice
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
      if (enVoice) {
        utterance.voice = enVoice;
      }

      setCurrentlySpeaking(text);
      utterance.onend = () => {
        setCurrentlySpeaking(null);
        setIsSpeakingSlow(false);
      };
      utterance.onerror = () => {
        setCurrentlySpeaking(null);
        setIsSpeakingSlow(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
      setCurrentlySpeaking(null);
      setIsSpeakingSlow(false);
    }
  };

  // Helper: Slow pronunciation specifically designed for 3-6 yo kids
  const speakEnglishSlow = (text: string) => {
    speakEnglish(text, 0.6);
  };

  // Kid Speech Practice & Evaluation Functions
  const startKidSpeechPractice = (word: EnglishWord) => {
    cancelKidPractice();
    kidLifetimeRef.current = newKidLifetime();
    setActivePracticeWord(word);
    setKidSpeechTranscript('');
    setKidSpeechEvaluation(null);
    if (kidRecordedAudioUrl) {
      URL.revokeObjectURL(kidRecordedAudioUrl);
      setKidRecordedAudioUrl(null);
    }
    // Speak slow once so the child hears the sound clearly
    kidLifetimeRef.current.schedule(() => {
      speakEnglish(word.word, 0.65);
    }, 300);
  };

  const updateEarnedStars = (wordId: string, stars: number) => {
    setEarnedStarsMap(prev => {
      const current = prev[wordId] || 0;
      if (stars > current) {
        const updated = { ...prev, [wordId]: stars };
        try {
          localStorage.setItem('mamnon_english_stars', JSON.stringify(updated));
        } catch {}
        return updated;
      }
      return prev;
    });
  };

  const evaluateKidSpeech = (transcript: string, word: EnglishWord) => {
    const target = word.word.toLowerCase().trim();
    const cleanTranscript = transcript.toLowerCase().trim();

    if (!cleanTranscript) {
      fallbackEvaluateKidSpeech(word);
      return;
    }

    const isExact = cleanTranscript.includes(target) || target.includes(cleanTranscript);
    const hasPhoneticStart = cleanTranscript.length > 0 && cleanTranscript[0] === target[0];

    if (isExact) {
      const evalResult = {
        score: 100,
        stars: 3,
        feedback: '🌟 Tuyệt đỉnh bé ơi! Phát âm chuẩn 100% cực kỳ xuất sắc!',
        isSuper: true
      };
      setKidSpeechEvaluation(evalResult);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      playAudioChime(true);
      speakEnglish('Super job! Outstanding pronunciation!');
      updateEarnedStars(word.id, 3);
    } else if (hasPhoneticStart || cleanTranscript.length > 0) {
      const evalResult = {
        score: 85,
        stars: 2,
        feedback: `👏 Bé nói rất to và rõ: "${transcript}". Bé hãy bấm "Nghe chậm 🐢" rồi nói lại để nhận 3 sao vàng nhé!`,
        isSuper: false
      };
      setKidSpeechEvaluation(evalResult);
      playAudioChime(false);
      speakEnglish('Great effort! Try listening slowly and say it again!');
      updateEarnedStars(word.id, 2);
    } else {
      fallbackEvaluateKidSpeech(word);
    }
  };

  const fallbackEvaluateKidSpeech = (word: EnglishWord) => {
    setKidSpeechEvaluation(ungradedEnglishSpeechEvaluation());
  };

  const stopRecordingStreams = () => {
    setIsRecordingKidSpeech(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
  };

  const startListeningToKid = async () => {
    if (!activePracticeWord) return;
    cancelKidPractice();
    const lifetime = newKidLifetime();
    kidLifetimeRef.current = lifetime;
    setIsRecordingKidSpeech(true);
    setKidSpeechTranscript('');
    setKidSpeechEvaluation(null);

    // Audio stream for recording voice playback so kid/teacher can hear back
    audioChunksRef.current = [];
    let stream: MediaStream | null = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!lifetime.ownStream(stream)) return;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        mediaRecorder.onstop = () => {
          if (!lifetime.isActive()) return;
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
            const url = URL.createObjectURL(blob);
            setKidRecordedAudioUrl(url);
          }
          if (stream) {
            stream.getTracks().forEach(t => t.stop());
          }
        };
        mediaRecorder.start();
      }
    } catch {
      stream?.getTracks().forEach(track => track.stop());
      if (!lifetime.isActive()) return;
      fallbackEvaluateKidSpeech(activePracticeWord);
      setIsRecordingKidSpeech(false);
      return;
    }

    // SpeechRecognition check
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        let recognized = false;
        const recognition = new SpeechRec();
        recognitionRef.current = recognition;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.toLowerCase();
          recognized = Boolean(transcript.trim());
          setKidSpeechTranscript(transcript);
          evaluateKidSpeech(transcript, activePracticeWord);
          stopRecordingStreams();
        };

        recognition.onerror = () => {
          if (!recognized) fallbackEvaluateKidSpeech(activePracticeWord);
          stopRecordingStreams();
        };

        recognition.onend = () => {
          if (!recognized) fallbackEvaluateKidSpeech(activePracticeWord);
          stopRecordingStreams();
        };

        recognition.start();

        // 5-second automatic timeout for young children
        lifetime.schedule(() => {
          if (recognitionRef.current === recognition) {
            stopRecordingStreams();
            if (!recognized) fallbackEvaluateKidSpeech(activePracticeWord);
          }
        }, 5000);
      } catch {
        fallbackEvaluateKidSpeech(activePracticeWord);
        stopRecordingStreams();
      }
    } else {
      // Browser fallback: 3.5s recording timer with encouraging score
      lifetime.schedule(() => {
        fallbackEvaluateKidSpeech(activePracticeWord);
        stopRecordingStreams();
      }, 3500);
    }
  };

  // Teacher Speech Practice Functions
  const startTeacherPractice = (item: {
    id: string;
    english: string;
    phonetic: string;
    vietnamese: string;
    situation?: string;
    tip?: string;
    category?: string;
  }) => {
    cancelTeacherPractice();
    teacherLifetimeRef.current = newTeacherLifetime();
    setActiveTeacherPractice(item);
    setTeacherSpeechTranscript('');
    setTeacherSpeechEvaluation(null);
    if (teacherRecordedAudioUrl) {
      URL.revokeObjectURL(teacherRecordedAudioUrl);
      setTeacherRecordedAudioUrl(null);
    }
    // Speak slow once so the teacher hears the native model
    teacherLifetimeRef.current.schedule(() => {
      speakEnglish(item.english, 0.8);
    }, 300);
  };

  const stopTeacherRecordingStreams = () => {
    setIsRecordingTeacherSpeech(false);
    if (teacherMediaRecorderRef.current && teacherMediaRecorderRef.current.state === 'recording') {
      try {
        teacherMediaRecorderRef.current.stop();
      } catch {}
    }
    if (teacherRecognitionRef.current) {
      try {
        teacherRecognitionRef.current.stop();
      } catch {}
    }
  };

  const evaluateTeacherSpeech = (transcript: string, item: { english: string; id: string }) => {
    if (!transcript.trim()) {
      fallbackEvaluateTeacherSpeech(item);
      return;
    }
    const targetWords = item.english.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const spokenWords = transcript.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);

    let matchCount = 0;
    targetWords.forEach(w => {
      if (spokenWords.some(sw => sw.includes(w) || w.includes(sw))) {
        matchCount++;
      }
    });

    const accuracy = targetWords.length > 0 ? matchCount / targetWords.length : 1;

    if (accuracy >= 0.7 || transcript.toLowerCase().includes(item.english.toLowerCase().slice(0, 8))) {
      setTeacherSpeechEvaluation({
        score: Math.min(100, Math.round(85 + accuracy * 15)),
        stars: 3,
        feedback: '🌟 Xuất sắc cô ơi! Phát âm chuẩn xác, khẩu âm tròn vành rõ chữ, ngữ điệu sư phạm rất tự tin và truyền cảm!',
        isSuper: true
      });
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      playAudioChime(true);
      speakEnglish('Excellent pronunciation, teacher! Very clear and natural!');
      updateEarnedStars(item.id, 3);
    } else if (accuracy >= 0.3 || spokenWords.length > 0) {
      setTeacherSpeechEvaluation({
        score: 80,
        stars: 2,
        feedback: `👏 Cô phát âm khá rõ: "${transcript}". Cô hãy bấm "Nghe chậm 🐢" để chú ý nhấn âm và nối âm, sau đó đọc lại nhé!`,
        isSuper: false
      });
      playAudioChime(false);
      speakEnglish('Good effort! Listen slowly and practice again!');
      updateEarnedStars(item.id, 2);
    } else {
      fallbackEvaluateTeacherSpeech(item);
    }
  };

  const fallbackEvaluateTeacherSpeech = (item: { english: string; id: string }) => {
    setTeacherSpeechEvaluation(ungradedEnglishSpeechEvaluation());
  };

  const startListeningToTeacher = async () => {
    if (!activeTeacherPractice) return;
    cancelTeacherPractice();
    const lifetime = newTeacherLifetime();
    teacherLifetimeRef.current = lifetime;
    setIsRecordingTeacherSpeech(true);
    setTeacherSpeechTranscript('');
    setTeacherSpeechEvaluation(null);

    teacherAudioChunksRef.current = [];
    let stream: MediaStream | null = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!lifetime.ownStream(stream)) return;
        const mediaRecorder = new MediaRecorder(stream);
        teacherMediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            teacherAudioChunksRef.current.push(e.data);
          }
        };
        mediaRecorder.onstop = () => {
          if (!lifetime.isActive()) return;
          if (teacherAudioChunksRef.current.length > 0) {
            const blob = new Blob(teacherAudioChunksRef.current, { type: 'audio/webm;codecs=opus' });
            const url = URL.createObjectURL(blob);
            setTeacherRecordedAudioUrl(url);
          }
          if (stream) {
            stream.getTracks().forEach(t => t.stop());
          }
        };
        mediaRecorder.start();
      }
    } catch {
      stream?.getTracks().forEach(track => track.stop());
      if (!lifetime.isActive()) return;
      fallbackEvaluateTeacherSpeech(activeTeacherPractice);
      setIsRecordingTeacherSpeech(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        let recognized = false;
        const recognition = new SpeechRec();
        teacherRecognitionRef.current = recognition;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.toLowerCase();
          recognized = Boolean(transcript.trim());
          setTeacherSpeechTranscript(transcript);
          evaluateTeacherSpeech(transcript, activeTeacherPractice);
          stopTeacherRecordingStreams();
        };

        recognition.onerror = () => {
          if (!recognized) fallbackEvaluateTeacherSpeech(activeTeacherPractice);
          stopTeacherRecordingStreams();
        };

        recognition.onend = () => {
          if (!recognized) fallbackEvaluateTeacherSpeech(activeTeacherPractice);
          setIsRecordingTeacherSpeech(false);
          const recorder = teacherMediaRecorderRef.current;
          if (recorder?.state === 'recording') recorder.stop();
        };

        recognition.start();

        lifetime.schedule(() => {
          if (teacherRecognitionRef.current === recognition) {
            stopTeacherRecordingStreams();
            if (!recognized) fallbackEvaluateTeacherSpeech(activeTeacherPractice);
          }
        }, 6000);
      } catch {
        fallbackEvaluateTeacherSpeech(activeTeacherPractice);
        stopTeacherRecordingStreams();
      }
    } else {
      lifetime.schedule(() => {
        fallbackEvaluateTeacherSpeech(activeTeacherPractice);
        stopTeacherRecordingStreams();
      }, 4000);
    }
  };

  const getThemesForAge = () => {
    if (selectedKidAge === '3-4') return ENGLISH_DATA_3_4;
    if (selectedKidAge === '4-5') return ENGLISH_DATA_4_5;
    return ENGLISH_DATA_5_6;
  };

  const currentThemes = getThemesForAge();
  const filteredThemes = selectedTopicFilter === 'all'
    ? currentThemes
    : currentThemes.filter(t => t.categoryKey === selectedTopicFilter);

  const handleStartGame = (theme: EnglishLessonTheme) => {
    gameCompletionRef.current.reset();
    gameAnswerRef.current.reset();
    setSelectedTheme(theme);
    setIsPlayingGame(true);
    setCurrentGameQuestionIndex(0);
    setSelectedGameAnswer(null);
    setGameScore(0);
    setIsAnswerSubmitted(false);

    // Speak prompt if exists
    const firstQ = theme.interactiveGame.questions[0];
    if (firstQ && firstQ.englishAudioPrompt) {
      scheduleModuleTask(() => speakEnglish(firstQ.englishAudioPrompt!), 400);
    }
  };

  const handleSelectGameOption = (optionId: string) => {
    if (isAnswerSubmitted || !selectedTheme) return;
    if (!gameAnswerRef.current.finish(() => {
      setSelectedGameAnswer(optionId);
      setIsAnswerSubmitted(true);
    })) return;

    const currentQ = selectedTheme.interactiveGame.questions[currentGameQuestionIndex];
    const isCorrect = optionId === currentQ.correctId;

    if (isCorrect) {
      setGameScore(prev => prev + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      speakEnglish('Great job! Well done!');
    } else {
      speakEnglish('Try again!');
    }
  };

  const completeCurrentGame = () => {
    if (!selectedTheme || !isPlayingGame || !isAnswerSubmitted || currentGameQuestionIndex !== selectedTheme.interactiveGame.questions.length - 1) return false;
    return gameCompletionRef.current.finish(() => {
      void recordEnglishProgress(selectedTheme.id, true);
      onLessonComplete?.(selectedTheme);
    });
  };

  const handleNextGameQuestion = () => {
    if (!selectedTheme || !isAnswerSubmitted) return;
    if (currentGameQuestionIndex < selectedTheme.interactiveGame.questions.length - 1) {
      gameAnswerRef.current.reset();
      const nextIdx = currentGameQuestionIndex + 1;
      setCurrentGameQuestionIndex(nextIdx);
      setSelectedGameAnswer(null);
      setIsAnswerSubmitted(false);
      const nextQ = selectedTheme.interactiveGame.questions[nextIdx];
      if (nextQ && nextQ.englishAudioPrompt) {
        scheduleModuleTask(() => speakEnglish(nextQ.englishAudioPrompt!), 300);
      }
    } else {
      // Game ended
      if (!completeCurrentGame()) return;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      speakEnglish('Congratulations! You are wonderful!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-indigo-50/30 to-emerald-50/20 text-slate-800 pb-24">
      {starsSync.error && <p role="status" className="m-4 rounded-xl bg-amber-50 p-3 text-amber-900">{starsSync.error} <button type="button" onClick={starsSync.retry} className="underline">Thử lại</button><button type="button" onClick={starsSync.restoreRemote} className="ml-3 underline">Tải bản đã lưu</button></p>}
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b-2 border-indigo-100 shadow-sm px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200 transition-colors"
              title="Quay lại"
            >
              <ArrowLeft size={24} strokeWidth={2.5} />
            </motion.button>
            <div className="font-pixar">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">🇬🇧</span>
                <h1 className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tight font-pixar">
                  Tiếng Anh vui cùng bé và cô
                </h1>
                <span className="hidden sm:inline-block px-3 py-0.5 text-xs font-black bg-amber-100 text-amber-900 rounded-full border border-amber-300 shadow-xs">
                  Phân hệ song ngữ 🌟
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold hidden sm:block">
                Chuẩn sư phạm mầm non Việt Nam • Âm thanh chuẩn quốc tế • Tương tác sinh động
              </p>
            </div>
          </div>

          {/* Speed Toggle & Audio helper */}
          <div className="flex items-center gap-2 font-pixar">
            <span className="text-xs font-black text-slate-700 hidden md:inline">
              {isSpeakingSlow ? '🐢 Đang phát âm chậm:' : '🔊 Tốc độ phát âm:'}
            </span>
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 text-xs font-bold shadow-inner">
              {[
                { label: '🐢 0.6x Nghe chậm', rate: 0.6, tip: 'Dành cho trẻ nghe rõ từng âm' },
                { label: '🐇 0.8x Vừa phải', rate: 0.8, tip: 'Luyện tập phản xạ' },
                { label: '🌟 1.0x Chuẩn', rate: 1.0, tip: 'Tốc độ người bản ngữ' },
              ].map(item => (
                <button
                  key={item.rate}
                  onClick={() => {
                    setSpeechRate(item.rate);
                    speakEnglish('Hello! Welcome to English garden!', item.rate);
                  }}
                  title={item.tip}
                  className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 font-pixar ${
                    speechRate === item.rate 
                      ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-sm font-black' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none font-pixar">
          {[
            { id: 'roadmap', label: 'Lộ trình học', icon: '🗺️', color: 'border-b-sky-600 text-sky-700 bg-sky-50/80' },
            { id: 'games', label: 'Trò chơi Tiếng Anh 🎮', icon: '🎮', color: 'border-b-purple-600 text-purple-700 bg-purple-50/80' },
            { id: 'teachers', label: 'Tiếng Anh cùng cô giáo', icon: '👩‍🏫', color: 'border-b-pink-600 text-pink-700 bg-pink-50/80' },
            { id: 'songs', label: 'Bài hát mầm non', icon: '🎶', color: 'border-b-emerald-600 text-emerald-700 bg-emerald-50/80' },
            { id: 'phonics', label: 'Bảng âm Phonics A-Z', icon: '🔤', color: 'border-b-amber-600 text-amber-700 bg-amber-50/80' },
          ].filter(tab => tab.id !== 'teachers' || isTeacher).map(tab => (
            <button
              key={tab.id}
              aria-current={(activeMainTab === tab.id || (tab.id === 'roadmap' && activeMainTab === 'kids')) ? 'page' : undefined}
              onClick={() => {
                setActiveMainTab(tab.id as any);
                setSelectedTheme(null);
                setIsPlayingGame(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm whitespace-nowrap transition-all border-2 ${
                (activeMainTab === tab.id || (tab.id === 'roadmap' && activeMainTab === 'kids'))
                  ? `${tab.color} border-current shadow-sm scale-[1.02]`
                  : 'bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">

        {activeMainTab === 'roadmap' && (
          <EnglishRoadmap
            initialAge={selectedKidAge as EnglishAge}
            initialGroup={roadmapGroup}
            onGroupChange={setRoadmapGroup}
            onOpenLesson={(age, lesson) => {
              setSelectedKidAge(age);
              setSelectedTheme(lesson);
              void recordEnglishProgress(lesson.id, false);
              setLessonOpenedFromRoadmap(true);
              setIsPlayingGame(false);
              setActiveMainTab('kids');
            }}
          />
        )}

        {/* ================================================= */}
        {/* I. PHÂN HỆ DÀNH CHO TRẺ MẦM NON (KIDS)           */}
        {/* ================================================= */}
        {activeMainTab === 'kids' && (
          <div>
            {/* Age Selector Tabs */}
            {!selectedTheme && <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                  {selectedKidAge === '3-4' && 'Bé 3 - 4 Tuổi: Làm quen tiếng Anh tự nhiên 🌱'}
                  {selectedKidAge === '4-5' && 'Bé 4 - 5 Tuổi: Khám phá thế giới tiếng Anh 🌿'}
                  {selectedKidAge === '5-6' && 'Bé 5 - 6 Tuổi: Tự tin giao tiếp chuẩn bị vào Lớp 1 🌟'}
                </h2>
                <p className="text-sm text-slate-600 font-medium">
                  Học qua hình ảnh sinh động, âm thanh phát âm chuẩn và trò chơi vui nhộn!
                </p>
              </div>

              <div className="flex bg-white p-1.5 rounded-2xl border-2 border-indigo-100 shadow-sm">
                {[
                  { id: '3-4', label: '3 - 4 Tuổi', badge: 'Làm quen' },
                  { id: '4-5', label: '4 - 5 Tuổi', badge: 'Khám phá' },
                  { id: '5-6', label: '5 - 6 Tuổi', badge: 'Tự tin' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedKidAge(item.id as any);
                      setSelectedTheme(null);
                      setIsPlayingGame(false);
                    }}
                    className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex flex-col items-center transition-all ${
                      selectedKidAge === item.id
                        ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`text-[10px] ${selectedKidAge === item.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {item.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            }
            {/* Interactive Feature Banner: Kid Pronunciation & Slow Listening */}
            {!selectedTheme && <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 rounded-3xl p-5 sm:p-6 mb-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black mb-2 border border-white/30">
                  <span>🎙️ TÍNH NĂNG MỚI CHO BÉ MẦM NON</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                  <span>🐢</span> Nghe Chậm & Bé Tập Phát Âm Chấm Điểm Sao Vàng
                </h3>
                <p className="text-xs sm:text-sm text-orange-100 font-medium max-w-2xl mt-1">
                  Bấm nút <strong>🐢 Nghe chậm</strong> để nghe từng âm tiết rõ ràng, và nhấn <strong>🎙️ Bé phát âm</strong> để nói vào micro, hệ thống AI mầm non sẽ chấm điểm và tặng sao thưởng ⭐⭐⭐!
                </p>
              </div>

              <div className="flex items-center gap-3 relative z-10 shrink-0">
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 text-center">
                  <span className="text-[11px] font-bold block text-amber-100">Sao bé đã đạt</span>
                  <span className="text-xl font-black flex items-center justify-center gap-1">
                    <Star className="fill-yellow-300 text-yellow-300" size={18} />
                    {Object.values(earnedStarsMap).reduce<number>((a, b) => a + Number(b), 0)} ⭐
                  </span>
                </div>
                {currentThemes[0]?.vocabulary[0] && (
                  <button
                    onClick={() => startKidSpeechPractice(currentThemes[0].vocabulary[0])}
                    className="px-5 py-3 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Mic size={18} className="text-red-500 animate-pulse" />
                    <span>Bé luyện nói</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveMainTab('games')}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span className="text-base">🎮</span>
                  <span>Chơi Trò Chơi</span>
                </button>
              </div>
            </div>

            }
            {/* 8 Core Topics Filter Bar */}
            {!selectedTheme && (
              <div className="mb-6 bg-white/90 backdrop-blur-sm p-3.5 sm:p-4 rounded-3xl border-2 border-indigo-100 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🌟</span>
                      <span>8 Chủ Đề Trọng Tâm Mầm Non (Chuẩn GDMN)</span>
                    </span>
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      Đầy đủ 3 lứa tuổi
                    </span>
                  </div>
                  {selectedTopicFilter !== 'all' && (
                    <button
                      onClick={() => setSelectedTopicFilter('all')}
                      className="text-xs font-black text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                    >
                      Hiển thị tất cả ({currentThemes.length} bài)
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                  {CORE_ENGLISH_TOPICS.map(topic => {
                    const isSelected = selectedTopicFilter === topic.id;
                    const count = topic.id === 'all' 
                      ? currentThemes.length 
                      : currentThemes.filter(t => t.categoryKey === topic.id).length;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopicFilter(topic.id)}
                        className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 scale-105 border border-indigo-400 ring-2 ring-indigo-200'
                            : 'bg-slate-50 hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-900 border border-slate-200/80 shadow-xs'
                        }`}
                      >
                        <span className="text-base">{topic.icon}</span>
                        <span>{topic.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                          isSelected ? 'bg-white/25 text-white' : 'bg-white text-slate-500 border border-slate-200'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List of Themes for Selected Age */}
            {!selectedTheme ? (
              <div>
                {filteredThemes.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-indigo-200 p-8">
                    <span className="text-5xl block mb-3">🔍</span>
                    <h4 className="text-lg font-black text-slate-800 mb-1">Chưa có bài học cho chủ đề này ở lứa tuổi này</h4>
                    <p className="text-xs text-slate-500 mb-4">Bé hãy bấm xem tất cả để khám phá các bài học khác nhé!</p>
                    <button
                      onClick={() => setSelectedTopicFilter('all')}
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-md"
                    >
                      Xem tất cả bài học
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredThemes.map(theme => {
                      const topicMeta = CORE_ENGLISH_TOPICS.find(t => t.id === theme.categoryKey);
                      return (
                        <motion.div
                          key={theme.id}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedTheme(theme);
                            void recordEnglishProgress(theme.id, false);
                            speakEnglish(theme.englishName);
                          }}
                          className="bg-white rounded-3xl p-6 border-4 border-white shadow-lg hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                        >
                          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${theme.color} opacity-10 rounded-bl-full group-hover:scale-125 transition-transform duration-500`}></div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-5xl group-hover:scale-110 transition-transform">{theme.icon}</span>
                              <div className="flex items-center gap-1.5">
                                {topicMeta && (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-50 text-purple-700 border border-purple-200/80">
                                    {topicMeta.icon} {topicMeta.name}
                                  </span>
                                )}
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                                  {theme.vocabulary.length} từ
                                </span>
                              </div>
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-1">{theme.name}</h3>
                            <h4 className="text-sm font-extrabold text-indigo-600 mb-2 italic">{theme.englishName}</h4>
                            <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2">{theme.description}</p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="flex -space-x-1">
                              {theme.vocabulary.slice(0, 4).map((v, i) => (
                                <span key={i} className="text-lg bg-slate-50 p-1 rounded-full border border-white shadow-xs" title={v.word}>
                                  {v.emoji}
                                </span>
                              ))}
                            </div>
                            <span className="text-xs font-black text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                              Học ngay →
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Detail View for Selected Theme */
              <div className="space-y-6">
                {/* Theme Header Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-white shadow-xl relative overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          setSelectedTheme(null);
                          setIsPlayingGame(false);
                          if (lessonOpenedFromRoadmap) {
                            setActiveMainTab('roadmap');
                            setLessonOpenedFromRoadmap(false);
                          }
                        }}
                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                        title="Quay lại danh sách chủ đề"
                        aria-label="Quay lại danh sách chủ đề"
                      >
                        <ArrowLeft size={22} />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-4xl">{selectedTheme.icon}</span>
                          <div>
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-800">{selectedTheme.name}</h3>
                            <p className="text-lg font-extrabold text-indigo-600 italic">{selectedTheme.englishName}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Standard Listen */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => speakEnglish(selectedTheme.vocabulary.map(v => v.word).join(', '))}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs border border-indigo-200 transition-colors"
                        title="Nghe toàn bộ từ với tốc độ chuẩn"
                      >
                        <Volume2 size={16} />
                        <span>Nghe chuẩn (1.0x)</span>
                      </motion.button>

                      {/* Slow Listen */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => speakEnglish(selectedTheme.vocabulary.map(v => v.word).join(', '), 0.6)}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-black text-xs border border-amber-300 transition-colors"
                        title="Nghe chậm từng từ cho bé dễ theo dõi"
                      >
                        <span className="text-base">🐢</span>
                        <span>Nghe chậm (0.6x)</span>
                      </motion.button>

                      {/* Kid Speech Practice All */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startKidSpeechPractice(selectedTheme.vocabulary[0])}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs shadow-md hover:shadow-lg transition-all"
                        title="Mở phòng luyện phát âm cho bé"
                      >
                        <Mic size={16} />
                        <span>Bé luyện phát âm 🎙️</span>
                      </motion.button>

                      {/* Mini-Game */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStartGame(selectedTheme)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs shadow-md hover:shadow-lg transition-all"
                      >
                        <Sparkles size={16} />
                        <span>Chơi trò chơi ({selectedTheme.interactiveGame.questions.length})</span>
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Vocabulary Flashcards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedTheme.vocabulary.map(item => {
                    const stars = earnedStarsMap[item.id] || 0;
                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.03 }}
                        className="bg-white rounded-3xl p-5 border-4 border-white shadow-md hover:shadow-xl transition-all flex flex-col justify-between text-center relative group"
                      >
                        {/* Stars earned badge if practiced */}
                        {stars > 0 && (
                          <div className="absolute top-3 right-3 flex items-center gap-0.5 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full shadow-xs">
                            {Array.from({ length: stars }).map((_, i) => (
                              <Star key={i} size={11} className="fill-amber-400 text-amber-500" />
                            ))}
                          </div>
                        )}

                        <div className="mb-2">
                          <span className="text-6xl sm:text-7xl block mb-3 group-hover:scale-110 transition-transform">
                            {item.emoji}
                          </span>
                          <h4 className="text-2xl font-black text-slate-800 tracking-tight">{item.word}</h4>
                          <p className="text-xs font-mono text-indigo-500 font-bold">{item.phonetic}</p>
                          <p className="text-base font-extrabold text-slate-700 mt-2">{item.meaning}</p>
                        </div>

                        {item.exampleSentence && (
                          <div className="mt-2 mb-3 pt-2 border-t border-slate-100 text-left bg-slate-50/70 p-2.5 rounded-2xl">
                            <p className="text-xs font-bold text-indigo-700 italic">"{item.exampleSentence}"</p>
                            <p className="text-[11px] text-slate-500">{item.exampleMeaning}</p>
                          </div>
                        )}

                        {/* Audio & Kid Pronunciation Controls */}
                        <div className="space-y-2 mt-2">
                          {/* 2 Listening Buttons: Chuẩn & Chậm */}
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => speakEnglish(item.word, 1.0)}
                              className={`py-2 rounded-xl flex items-center justify-center gap-1 font-black text-[11px] transition-all border ${
                                currentlySpeaking === item.word && !isSpeakingSlow
                                  ? 'bg-indigo-600 text-white border-indigo-700 scale-95'
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                              }`}
                              title="Nghe chuẩn tốc độ 1.0x"
                            >
                              <Volume2 size={13} />
                              <span>Nghe chuẩn</span>
                            </button>

                            <button
                              onClick={() => speakEnglish(item.word, 0.6)}
                              className={`py-2 rounded-xl flex items-center justify-center gap-1 font-black text-[11px] transition-all border ${
                                currentlySpeaking === item.word && isSpeakingSlow
                                  ? 'bg-amber-400 text-amber-950 border-amber-500 scale-95 animate-pulse'
                                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                              }`}
                              title="Nghe chậm tốc độ 0.6x cho bé nghe rõ từng âm"
                            >
                              <span>🐢</span>
                              <span>Nghe chậm</span>
                            </button>
                          </div>

                          {/* Kid Pronounce & Record Button */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => startKidSpeechPractice(item)}
                            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-black text-xs shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all"
                          >
                            <Mic size={15} />
                            <span>Bé tập phát âm 🎙️</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Sample Phrases if available */}
                {selectedTheme.samplePhrases && selectedTheme.samplePhrases.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border-4 border-white shadow-lg">
                    <h4 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                      <MessageSquare className="text-indigo-600" />
                      <span>Mẫu câu giao tiếp thực hành (Nghe chuẩn & Nghe chậm)</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTheme.samplePhrases.map((phrase, idx) => (
                        <div key={idx} className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-base font-black text-indigo-900">"{phrase.phrase}"</p>
                            <p className="text-xs font-mono text-indigo-600">{phrase.phonetic}</p>
                            <p className="text-sm font-bold text-slate-700 mt-1">{phrase.vietnamese}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Standard audio */}
                            <button
                              onClick={() => speakEnglish(phrase.phrase, 1.0)}
                              className="p-2.5 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl shadow-xs transition-colors border border-indigo-100"
                              title="Nghe chuẩn 1.0x"
                            >
                              <Volume2 size={18} />
                            </button>
                            {/* Slow audio */}
                            <button
                              onClick={() => speakEnglish(phrase.phrase, 0.6)}
                              className="p-2.5 bg-amber-50 text-amber-800 hover:bg-amber-500 hover:text-white rounded-xl shadow-xs transition-colors border border-amber-200"
                              title="Nghe chậm 0.6x"
                            >
                              <span className="text-sm">🐢</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================================================= */}
        {/* II. KHU VUI CHƠI TRÒ CHƠI TIẾNG ANH (GAMES)       */}
        {/* ================================================= */}
        {activeMainTab === 'games' && (
          <EnglishGamesPlayground
            onGameComplete={onGameComplete}
            speakEnglish={speakEnglish}
            playAudioChime={playAudioChime}
            onBack={() => setActiveMainTab('kids')}
          />
        )}

        {/* ================================================= */}
        {/* III. PHÂN HỆ TIẾNG ANH CÙNG CÔ GIÁO (TEACHER)    */}
        {/* ================================================= */}
        {isTeacher && activeMainTab === 'teachers' && (
          <div className="space-y-6">
            {/* Header intro for Teacher module */}
            <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 max-w-3xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-sm border border-white/30">
                    Dành cho Giáo viên Mầm non
                  </span>
                  <span className="text-xs font-semibold text-pink-100">Cẩm nang sư phạm song ngữ</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
                  Tiếng Anh cùng cô giáo 👩‍🏫
                </h2>
                <p className="text-sm sm:text-base text-pink-100 font-medium leading-relaxed">
                  Trang bị khẩu lệnh lớp học chuẩn quốc tế có phiên âm chuẩn, phát âm bản xứ, mẫu lời dẫn tổ chức các hoạt động (Âm nhạc, Tạo hình, Kể chuyện, Vận động) và lộ trình 4 cấp độ tự tin xây dựng môi trường tiếng Anh trong lớp mầm non.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startTeacherPractice(TEACHER_CLASSROOM_PHRASES[0])}
                    className="px-5 py-2.5 rounded-2xl bg-white text-pink-700 hover:bg-pink-50 font-black text-xs sm:text-sm shadow-md flex items-center gap-2 border border-pink-100 transition-all cursor-pointer"
                  >
                    <Mic size={16} className="text-pink-600 animate-pulse" />
                    <span>Cô Luyện Phát Âm Ngay 🎙️</span>
                  </motion.button>
                  <span className="text-xs text-pink-100 font-bold bg-pink-700/50 px-3 py-1.5 rounded-full backdrop-blur-xs">
                    ✨ Chấm điểm & phân tích giọng nói sư phạm
                  </span>
                </div>
              </div>
              <div className="absolute right-4 bottom-2 text-[8rem] opacity-20 pointer-events-none">
                👩‍🏫
              </div>
            </div>

            {/* Sub-Tabs for Teachers */}
            <div className="flex flex-wrap gap-2 border-b-2 border-slate-200 pb-3">
              {[
                { id: 'thematic-topics', label: '1. Tiếng Anh theo 10 Chủ đề Mầm non (Đồng bộ bé)', count: '10 Chủ đề' },
                { id: 'phrases', label: '2. Khẩu lệnh & Câu giao tiếp lớp học', count: TEACHER_CLASSROOM_PHRASES.length },
                { id: 'activities', label: '3. Tiếng Anh tổ chức hoạt động giáo dục', count: TEACHER_ACTIVITY_TOPICS.length },
                { id: 'levels', label: '4. Lộ trình học 4 Cấp độ cho giáo viên', count: '4 Cấp độ' },
                { id: 'prepare', label: '5. Chuẩn bị bài & Cô tự học', count: '36 bài' },
              ].map(subTab => (
                <button
                  key={subTab.id}
                  onClick={() => setTeacherTab(subTab.id as any)}
                  className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                    teacherTab === subTab.id
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{subTab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] ${teacherTab === subTab.id ? 'bg-pink-700 text-pink-100' : 'bg-slate-100 text-slate-500'}`}>
                    {subTab.count}
                  </span>
                </button>
              ))}
            </div>

            {teacherTab === 'prepare' && <TeacherWorkshop onListen={speakEnglish} />}

            {/* Sub-tab 0: THEMATIC TOPICS (ĐỒNG BỘ 10 CHỦ ĐỀ VỚI BÉ) */}
            {teacherTab === 'thematic-topics' && (
              <div className="space-y-6">
                {/* Pedagogical Guidance Banner */}
                <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-pink-50 border-2 border-pink-200 p-5 rounded-3xl flex items-start gap-3 shadow-xs">
                  <div className="p-2.5 bg-pink-100 text-pink-700 rounded-2xl shrink-0 mt-0.5">
                    <Sparkles size={22} className="animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-pink-950 flex items-center gap-2 mb-1">
                      <span>Đồng bộ 100% Chủ đề Mầm non chuẩn Bộ GD&ĐT dành cho Giáo viên</span>
                      <span className="px-2 py-0.5 bg-pink-200 text-pink-900 text-[10px] rounded-full font-black">Sư phạm quốc tế</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      Mỗi chủ đề được thiết kế chuyên biệt cho cô giáo: từ <strong>Lời dẫn mở đầu (Warm-up Script)</strong>, <strong>Khẩu lệnh & câu hỏi gợi mở</strong>, <strong>Mẫu đàm thoại Cô - Trẻ thực tế</strong>, <strong>Từ vựng sư phạm kèm lưu ý phát âm cho giáo viên Việt Nam</strong>, <strong>Trò chơi vận động TPR</strong> cho đến <strong>Mẫu câu trao đổi với Phụ huynh</strong>.
                    </p>
                  </div>
                </div>

                {/* Filter Topics Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {[
                    { id: 'all', name: 'Tất cả 10 chủ đề', icon: '✨' },
                    { id: 'kindergarten', name: 'Trường mầm non', icon: '🏫' },
                    { id: 'self', name: 'Bản thân & Cảm xúc', icon: '👦' },
                    { id: 'family', name: 'Gia đình', icon: '👨‍👩‍👧' },
                    { id: 'jobs', name: 'Nghề nghiệp', icon: '👩‍⚕️' },
                    { id: 'spring', name: 'Mùa xuân & Tết', icon: '🌸' },
                    { id: 'plants', name: 'Thực vật & Cây hoa', icon: '🌿' },
                    { id: 'vehicles', name: 'Phương tiện giao thông', icon: '🚗' },
                    { id: 'colors', name: 'Màu sắc & Tạo hình', icon: '🎨' },
                    { id: 'animals', name: 'Động vật muôn loài', icon: '🦁' },
                    { id: 'nutrition', name: 'Dinh dưỡng & Giờ ăn', icon: '🍎' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setThematicFilterCategory(tab.id)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                        thematicFilterCategory === tab.id
                          ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25 scale-102'
                          : 'bg-white text-slate-700 hover:bg-pink-50 border border-slate-200'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </div>

                {/* Horizontal / Grid Cards of the 10 Topics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {TEACHER_THEMATIC_TOPICS
                    .filter(t => thematicFilterCategory === 'all' || t.categoryKey === thematicFilterCategory)
                    .map(topic => {
                      const isSelected = selectedTeacherThematicTopic.id === topic.id;
                      return (
                        <motion.button
                          key={topic.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedTeacherThematicTopic(topic);
                            setTeacherThematicQuizAnswer(null);
                            setTeacherThematicQuizSubmitted(false);
                            setThematicActiveDetailTab('script');
                          }}
                          className={`p-3.5 sm:p-4 rounded-3xl text-left border-3 transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                            isSelected
                              ? 'bg-gradient-to-br from-white to-pink-50 border-pink-500 shadow-lg ring-2 ring-pink-300'
                              : 'bg-white border-slate-100 hover:border-pink-200 shadow-xs'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-600"></span>
                            </span>
                          )}
                          <div>
                            <span className="text-3xl sm:text-4xl block mb-2">{topic.icon}</span>
                            <span className="text-[10px] font-black uppercase text-pink-600 block line-clamp-1 mb-0.5">
                              {topic.badge}
                            </span>
                            <h4 className="font-black text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">
                              {topic.title}
                            </h4>
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold line-clamp-1 mt-2">
                            {topic.englishTitle}
                          </p>
                        </motion.button>
                      );
                    })}
                </div>

                {/* Active Thematic Topic Detailed Lesson Plan for Teachers */}
                {selectedTeacherThematicTopic && (
                  <motion.div
                    key={selectedTeacherThematicTopic.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[32px] border-4 border-white shadow-xl overflow-hidden space-y-6"
                  >
                    {/* Thematic Hero Header */}
                    <div className={`p-6 sm:p-8 bg-gradient-to-r ${selectedTeacherThematicTopic.accentColor} text-white relative overflow-hidden`}>
                      <div className="relative z-10 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md border border-white/30">
                            {selectedTeacherThematicTopic.badge}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-white/10 backdrop-blur-md">
                            🎯 {selectedTeacherThematicTopic.targetAges}
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-2 flex items-center gap-2">
                          <span>{selectedTeacherThematicTopic.icon}</span>
                          <span>{selectedTeacherThematicTopic.title}</span>
                        </h2>
                        <p className="text-base sm:text-lg font-bold text-white/90 italic mb-3">
                          {selectedTeacherThematicTopic.englishTitle}
                        </p>
                        <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed max-w-2xl">
                          {selectedTeacherThematicTopic.overview}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startTeacherPractice({
                              id: `${selectedTeacherThematicTopic.id}-warmup`,
                              english: selectedTeacherThematicTopic.warmupScript.english,
                              phonetic: selectedTeacherThematicTopic.warmupScript.phonetic,
                              vietnamese: selectedTeacherThematicTopic.warmupScript.vietnamese,
                              situation: `Lời dẫn nhập môn chủ đề ${selectedTeacherThematicTopic.title}`,
                              tip: selectedTeacherThematicTopic.warmupScript.gestureGuide
                            })}
                            className="px-5 py-2.5 rounded-2xl bg-white text-pink-700 hover:bg-pink-50 font-black text-xs sm:text-sm shadow-md flex items-center gap-2 border border-pink-100 cursor-pointer transition-all"
                          >
                            <Mic size={16} className="text-pink-600 animate-pulse" />
                            <span>Cô Luyện Đọc Lời Dẫn Này 🎙️</span>
                          </motion.button>
                          <button
                            onClick={() => speakEnglish(selectedTeacherThematicTopic.warmupScript.english)}
                            className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-black text-xs sm:text-sm flex items-center gap-2 border border-white/30 cursor-pointer transition-all"
                          >
                            <Volume2 size={16} />
                            <span>Nghe Giọng Đọc Mẫu</span>
                          </button>
                        </div>
                      </div>
                      <div className="absolute right-4 -bottom-4 text-[9rem] opacity-20 pointer-events-none select-none">
                        {selectedTeacherThematicTopic.icon}
                      </div>
                    </div>

                    {/* Navigation Pills across the 6 Detailed Study Sections */}
                    <div className="px-6 pt-2">
                      <div className="flex flex-wrap gap-2 border-b-2 border-slate-100 pb-3">
                        {[
                          { id: 'script', label: '1. 🌟 Lời dẫn mở đầu (Warm-up Script)' },
                          { id: 'prompts', label: '2. 📣 Khẩu lệnh & Câu hỏi gợi mở' },
                          { id: 'dialogue', label: '3. 💬 Mẫu hội thoại Cô - Trẻ thực tế' },
                          { id: 'vocab', label: '4. 📚 Từ vựng & Lưu ý phát âm' },
                          { id: 'strategy', label: '5. 🎯 Trò chơi TPR & Trao đổi Phụ huynh' },
                          { id: 'quiz', label: '6. 📝 Tình huống sư phạm' },
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setThematicActiveDetailTab(tab.id as any)}
                            className={`px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                              thematicActiveDetailTab === tab.id
                                ? 'bg-pink-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Section 1: Warm-up Script */}
                    {thematicActiveDetailTab === 'script' && (
                      <div className="px-6 pb-6 space-y-4">
                        <div className="bg-gradient-to-br from-pink-50/80 to-purple-50/60 p-6 rounded-3xl border-2 border-pink-200 space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h4 className="font-black text-pink-900 text-base flex items-center gap-2">
                              <MessageSquare size={18} />
                              <span>Lời dẫn mở đầu & Khởi động vòng tròn (Circle Time Hook)</span>
                            </h4>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => speakEnglish(selectedTeacherThematicTopic.warmupScript.english, 0.75)}
                                className="px-3 py-1.5 rounded-full bg-white text-pink-700 hover:bg-pink-100 text-xs font-black border border-pink-200 flex items-center gap-1 cursor-pointer"
                              >
                                <Volume2 size={13} />
                                <span>Nghe chậm 0.75x</span>
                              </button>
                              <button
                                onClick={() => speakEnglish(selectedTeacherThematicTopic.warmupScript.english)}
                                className="px-3 py-1.5 rounded-full bg-pink-600 text-white hover:bg-pink-700 text-xs font-black flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <Volume2 size={13} />
                                <span>Nghe phát âm chuẩn</span>
                              </button>
                            </div>
                          </div>

                          {/* English Text */}
                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-pink-100 shadow-2xs">
                            <p className="text-base sm:text-lg font-black text-indigo-950 leading-relaxed mb-3">
                              "{selectedTeacherThematicTopic.warmupScript.english}"
                            </p>
                            <div className="space-y-1 pt-2 border-t border-slate-100">
                              <p className="text-xs font-mono text-purple-700 font-bold">
                                <strong>IPA:</strong> {selectedTeacherThematicTopic.warmupScript.phonetic}
                              </p>
                            </div>
                          </div>

                          {/* Vietnamese Translation */}
                          <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-950 font-medium">
                            <strong className="text-amber-900 font-black block mb-1">Dịch nghĩa sư phạm:</strong>
                            {selectedTeacherThematicTopic.warmupScript.vietnamese}
                          </div>

                          {/* Gesture & TPR Guide */}
                          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs sm:text-sm text-emerald-950">
                            <div className="flex items-center gap-1.5 font-black text-emerald-900 mb-1">
                              <Sparkles size={16} />
                              <span>Hướng dẫn điệu bộ cử chỉ của Cô khi đứng trước lớp:</span>
                            </div>
                            <p className="leading-relaxed font-medium">
                              {selectedTeacherThematicTopic.warmupScript.gestureGuide}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 2: Prompts & Questions */}
                    {thematicActiveDetailTab === 'prompts' && (
                      <div className="px-6 pb-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedTeacherThematicTopic.teacherPrompts.map(prompt => (
                            <div
                              key={prompt.id}
                              className="bg-white rounded-3xl p-5 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <span className="px-2.5 py-1 bg-pink-100 text-pink-800 text-[11px] font-black rounded-full border border-pink-200">
                                    {prompt.purpose}
                                  </span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={() => speakEnglish(prompt.english)}
                                      className="p-2 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-full transition-colors cursor-pointer"
                                      title="Nghe chuẩn"
                                    >
                                      <Volume2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => startTeacherPractice({
                                        id: prompt.id,
                                        english: prompt.english,
                                        phonetic: prompt.phonetic,
                                        vietnamese: prompt.vietnamese,
                                        situation: prompt.purpose,
                                        tip: prompt.tip
                                      })}
                                      className="p-2 bg-gradient-to-tr from-pink-500 to-rose-600 hover:from-pink-600 text-white rounded-full shadow-xs cursor-pointer"
                                      title="Luyện phát âm"
                                    >
                                      <Mic size={16} />
                                    </button>
                                  </div>
                                </div>

                                <h4 className="text-base font-black text-slate-900 leading-snug mb-2">
                                  "{prompt.english}"
                                </h4>

                                <div className="space-y-1 mb-3 text-xs">
                                  <p className="font-mono text-purple-700 font-bold">{prompt.phonetic}</p>
                                  <p className="text-slate-800 font-extrabold text-sm mt-1">{prompt.vietnamese}</p>
                                </div>

                                {prompt.tip && (
                                  <div className="bg-slate-50 p-2.5 rounded-2xl text-[11px] text-slate-600 border border-slate-100">
                                    <span className="font-bold text-pink-700">💡 Mẹo cô dạy:</span> {prompt.tip}
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                <button
                                  onClick={() => speakEnglish(prompt.english, 0.75)}
                                  className="text-pink-600 hover:text-pink-800 font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Volume2 size={13} /> Chậm 0.75x
                                </button>
                                <button
                                  onClick={() => startTeacherPractice({
                                    id: prompt.id,
                                    english: prompt.english,
                                    phonetic: prompt.phonetic,
                                    vietnamese: prompt.vietnamese,
                                    situation: prompt.purpose,
                                    tip: prompt.tip
                                  })}
                                  className="text-pink-600 hover:text-pink-700 font-black flex items-center gap-1 cursor-pointer"
                                >
                                  <Mic size={13} className="animate-pulse" />
                                  <span>Luyện nói</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 3: Dialogue */}
                    {thematicActiveDetailTab === 'dialogue' && (
                      <div className="px-6 pb-6 space-y-4">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
                          <h4 className="font-black text-slate-900 text-base mb-2 flex items-center gap-2">
                            <Users size={18} className="text-pink-600" />
                            <span>Kịch bản tương tác trực tiếp Cô - Trẻ trong tiết dạy:</span>
                          </h4>
                          <div className="space-y-3">
                            {selectedTeacherThematicTopic.dialogue.map((item, idx) => {
                              const isTeacher = item.speaker === 'Teacher';
                              return (
                                <div
                                  key={idx}
                                  className={`p-4 rounded-3xl text-xs sm:text-sm flex items-start gap-3 ${
                                    isTeacher
                                      ? 'bg-gradient-to-r from-pink-100/90 to-rose-100/80 border border-pink-200 text-pink-950'
                                      : 'bg-gradient-to-r from-sky-100/90 to-indigo-100/80 border border-sky-200 text-sky-950 ml-4 sm:ml-8'
                                  }`}
                                >
                                  <span className="text-2xl shrink-0 mt-0.5">
                                    {isTeacher ? '👩‍🏫' : '👶'}
                                  </span>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <span className="font-black uppercase text-[10px] tracking-wider text-slate-500">
                                        {isTeacher ? 'Cô giáo' : 'Các con'}
                                      </span>
                                      <button
                                        onClick={() => speakEnglish(item.english)}
                                        className="p-1.5 bg-white/80 hover:bg-white text-slate-700 rounded-full shadow-2xs cursor-pointer transition-all"
                                        title="Nghe câu này"
                                      >
                                        <Volume2 size={14} />
                                      </button>
                                    </div>
                                    <p className="font-black text-sm sm:text-base mb-1">
                                      "{item.english}"
                                    </p>
                                    <p className="text-xs text-slate-700 font-medium">
                                      {item.vietnamese}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 4: Key Vocabulary & Pronunciation Cautions */}
                    {thematicActiveDetailTab === 'vocab' && (
                      <div className="px-6 pb-6 space-y-4">
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                          <Lightbulb className="text-amber-600 shrink-0 mt-0.5" size={18} />
                          <p>
                            <strong>Cẩm nang phát âm sư phạm:</strong> Trẻ mầm non tiếp thu âm thanh bằng cách "bắt chước nguyên bản" khẩu hình và ngữ điệu của cô. Hãy chú ý đặc biệt các <strong>Lưu ý phát âm</strong> màu đỏ dưới đây để tránh các lỗi thường gặp của người Việt nhé cô!
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedTeacherThematicTopic.vocabulary.map((vocab, idx) => (
                            <div
                              key={idx}
                              className="bg-white rounded-3xl p-5 border-2 border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h4 className="text-lg font-black text-indigo-950">{vocab.word}</h4>
                                  <button
                                    onClick={() => speakEnglish(vocab.word)}
                                    className="p-2 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-full cursor-pointer"
                                    title="Nghe từ này"
                                  >
                                    <Volume2 size={16} />
                                  </button>
                                </div>

                                <p className="text-xs font-mono text-purple-700 font-bold mb-0.5">{vocab.phonetic}</p>
                                <p className="text-sm font-black text-slate-800 mb-3">{vocab.meaning}</p>

                                {/* Pronunciation Caution Box */}
                                <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl mb-3">
                                  <span className="text-[10px] font-black uppercase text-rose-700 block mb-1 flex items-center gap-1">
                                    <span>⚠️ Lưu ý phát âm cho cô:</span>
                                  </span>
                                  <p className="text-xs text-rose-900 font-semibold leading-relaxed">
                                    {vocab.pronunciationCaution}
                                  </p>
                                </div>

                                <div className="bg-slate-50 p-2.5 rounded-2xl text-xs text-slate-700">
                                  <span className="font-bold text-slate-900 block mb-0.5">Ví dụ trong lớp học:</span>
                                  <p className="italic text-slate-600">"{vocab.classroomExample}"</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 5: Teaching Strategies & Home Connection */}
                    {thematicActiveDetailTab === 'strategy' && (
                      <div className="px-6 pb-6 space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Card 1: TPR Game */}
                          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-6 rounded-3xl border-2 border-emerald-200 space-y-3">
                            <div className="flex items-center gap-2 text-emerald-900 font-black text-base">
                              <Play size={20} className="text-emerald-600" />
                              <span>{selectedTeacherThematicTopic.teachingStrategies.tprGame.name}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
                              {selectedTeacherThematicTopic.teachingStrategies.tprGame.howToPlay}
                            </p>
                            <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100 space-y-2">
                              <span className="text-xs font-black text-emerald-900 uppercase block tracking-wider">
                                Các khẩu lệnh cô hô trong trò chơi:
                              </span>
                              <ul className="space-y-1.5 text-xs text-slate-700">
                                {selectedTeacherThematicTopic.teachingStrategies.tprGame.teacherCommands.map((cmd, i) => (
                                  <li key={i} className="flex items-center justify-between gap-2">
                                    <span className="font-bold">✔ "{cmd}"</span>
                                    <button
                                      onClick={() => speakEnglish(cmd)}
                                      className="p-1 bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 cursor-pointer"
                                    >
                                      <Volume2 size={13} />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Card 2: Pedagogical Psychology & Home Connection */}
                          <div className="space-y-4">
                            {/* Pedagogical Tip */}
                            <div className="bg-amber-50 p-5 rounded-3xl border-2 border-amber-200 space-y-2">
                              <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                                <Lightbulb size={18} className="text-amber-600" />
                                <span>Mẹo tâm lý sư phạm lứa tuổi mầm non:</span>
                              </div>
                              <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
                                {selectedTeacherThematicTopic.teachingStrategies.pedagogicalTip}
                              </p>
                            </div>

                            {/* Home Connection */}
                            <div className="bg-purple-50 p-5 rounded-3xl border-2 border-purple-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-purple-900 font-black text-sm">
                                  <Heart size={18} className="text-purple-600" />
                                  <span>Mẫu câu giao tiếp với Phụ huynh (Home-School Connection):</span>
                                </div>
                                <button
                                  onClick={() => speakEnglish(selectedTeacherThematicTopic.teachingStrategies.homeConnection.english)}
                                  className="p-1.5 bg-white text-purple-700 rounded-full hover:bg-purple-100 cursor-pointer shadow-2xs"
                                  title="Nghe câu này"
                                >
                                  <Volume2 size={14} />
                                </button>
                              </div>
                              <p className="text-xs sm:text-sm font-black text-indigo-950 italic">
                                "{selectedTeacherThematicTopic.teachingStrategies.homeConnection.english}"
                              </p>
                              <p className="text-xs text-slate-700">
                                <strong>Dịch nghĩa:</strong> {selectedTeacherThematicTopic.teachingStrategies.homeConnection.vietnamese}
                              </p>
                              <p className="text-[11px] text-purple-800 font-bold">
                                📌 <strong>Thời điểm:</strong> {selectedTeacherThematicTopic.teachingStrategies.homeConnection.context}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 6: Pedagogical Scenario Quiz */}
                    {thematicActiveDetailTab === 'quiz' && (
                      <div className="px-6 pb-6 space-y-4">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                              <HelpCircle size={18} className="text-pink-600" />
                              <span>Tình huống ứng xử sư phạm thực tế:</span>
                            </h4>
                            <span className="text-xs font-black text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                              Thực hành ứng biến lớp học
                            </span>
                          </div>

                          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 space-y-1">
                            <p><strong>Tình huống:</strong> {selectedTeacherThematicTopic.scenarioQuiz.situation}</p>
                            <p className="text-pink-800 font-black"><strong>Câu hỏi:</strong> {selectedTeacherThematicTopic.scenarioQuiz.question}</p>
                          </div>

                          <div className="space-y-2.5">
                            {selectedTeacherThematicTopic.scenarioQuiz.options.map((option, optIdx) => {
                              const isChosen = teacherThematicQuizAnswer === optIdx;
                              const isCorrect = optIdx === selectedTeacherThematicTopic.scenarioQuiz.correctIndex;
                              let style = 'bg-white border-slate-200 hover:border-pink-300 text-slate-700';

                              if (teacherThematicQuizSubmitted) {
                                if (isCorrect) {
                                  style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                                } else if (isChosen && !isCorrect) {
                                  style = 'bg-rose-50 border-rose-500 text-rose-900 font-bold';
                                }
                              } else if (isChosen) {
                                style = 'bg-pink-50 border-pink-500 text-pink-900 font-bold shadow-xs';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  disabled={teacherThematicQuizSubmitted}
                                  onClick={() => setTeacherThematicQuizAnswer(optIdx)}
                                  className={`w-full p-4 rounded-2xl border-2 text-left text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer ${style}`}
                                >
                                  <span>{option}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speakEnglish(option);
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-700 ml-2 shrink-0"
                                  >
                                    <Volume2 size={16} />
                                  </button>
                                </button>
                              );
                            })}
                          </div>

                          {/* Submit / Retake Action */}
                          <div className="flex items-center gap-3 pt-2">
                            {!teacherThematicQuizSubmitted ? (
                              <button
                                disabled={teacherThematicQuizAnswer === null}
                                onClick={() => {
                                  setTeacherThematicQuizSubmitted(true);
                                  const isCorrect = teacherThematicQuizAnswer === selectedTeacherThematicTopic.scenarioQuiz.correctIndex;
                                  playAudioChime(isCorrect);
                                  if (isCorrect) {
                                    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                                  }
                                }}
                                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer transition-all"
                              >
                                Xác nhận câu trả lời
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setTeacherThematicQuizAnswer(null);
                                  setTeacherThematicQuizSubmitted(false);
                                }}
                                className="px-5 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all"
                              >
                                <RotateCcw size={15} />
                                <span>Thực hành lại tình huống này</span>
                              </button>
                            )}
                          </div>

                          {/* Explanation */}
                          {teacherThematicQuizSubmitted && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border ${
                                teacherThematicQuizAnswer === selectedTeacherThematicTopic.scenarioQuiz.correctIndex
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                                  : 'bg-amber-50 border-amber-200 text-amber-950'
                              }`}
                            >
                              <p className="font-black mb-1">
                                {teacherThematicQuizAnswer === selectedTeacherThematicTopic.scenarioQuiz.correctIndex
                                  ? '🎉 Chuẩn xác xuất sắc cô ơi!'
                                  : '💡 Phân tích giải thích sư phạm:'}
                              </p>
                              <p>{selectedTeacherThematicTopic.scenarioQuiz.explanation}</p>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* Sub-tab 1: Classroom Phrases */}
            {teacherTab === 'phrases' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                  <Lightbulb className="text-amber-600 shrink-0 mt-0.5" size={20} />
                  <p className="text-xs sm:text-sm text-amber-900 font-medium">
                    <strong>Gợi ý cho cô:</strong> Mỗi câu đều có phần phiên âm chuẩn quốc tế, nút phát âm chuẩn và tính năng <strong>Luyện phát âm 🎙️</strong> chấm điểm sư phạm. Cô hãy nhấn nút loa hoặc micro để luyện tập nhé!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TEACHER_CLASSROOM_PHRASES.map(item => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-white rounded-3xl p-5 border-2 border-slate-100 shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="text-lg font-black text-pink-900 leading-snug">{item.english}</h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => speakEnglish(item.english)}
                              className="p-2.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-full transition-colors"
                              title="Nghe phát âm chuẩn"
                            >
                              <Volume2 size={20} />
                            </button>
                            <motion.button
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.92 }}
                              onClick={() => startTeacherPractice(item)}
                              className="p-2.5 bg-gradient-to-tr from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-full shadow-xs transition-all"
                              title="Luyện phát âm câu này"
                            >
                              <Mic size={20} />
                            </motion.button>
                          </div>
                        </div>

                        {/* Pronunciations */}
                        <div className="space-y-1 mb-3">
                          <p className="text-xs font-mono text-purple-700 font-bold">{item.phonetic}</p>
                        </div>

                        {/* Translation */}
                        <p className="text-base font-black text-slate-800 mb-2">
                          {item.vietnamese}
                        </p>

                        {/* Situation & Tip */}
                        <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1 border border-slate-100">
                          <p className="text-slate-600">
                            <span className="font-bold text-slate-800">Tình huống:</span> {item.situation}
                          </p>
                          {item.tip && (
                            <p className="text-pink-700 font-semibold italic">
                              💡 Mẹo: {item.tip}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 capitalize"># {item.category}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => speakEnglish(item.english, 0.75)}
                            className="text-pink-600 hover:text-pink-800 font-bold flex items-center gap-1"
                          >
                            <Volume2 size={14} /> Nghe chậm 0.75x
                          </button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startTeacherPractice(item)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-all"
                            title="Luyện phát âm câu này"
                          >
                            <Mic size={13} className="animate-pulse" />
                            <span>Luyện phát âm</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 2: Activity Organizer */}
            {teacherTab === 'activities' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {TEACHER_ACTIVITY_TOPICS.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTeacherActivity(topic)}
                      className={`p-5 rounded-3xl border-4 text-left transition-all flex flex-col justify-between ${
                        selectedTeacherActivity?.id === topic.id
                          ? 'bg-pink-50 border-pink-500 shadow-md scale-102'
                          : 'bg-white border-white hover:border-pink-200 shadow-sm'
                      }`}
                    >
                      <span className="text-4xl mb-3">{topic.icon}</span>
                      <div>
                        <h4 className="font-black text-slate-800 text-lg leading-tight">{topic.title}</h4>
                        <p className="text-xs text-pink-600 font-bold mt-1">{topic.englishTitle}</p>
                      </div>
                      <span className="mt-4 text-xs font-black text-pink-600 flex items-center gap-1">
                        Xem chi tiết lời dẫn →
                      </span>
                    </button>
                  ))}
                </div>

                {/* Detail View for Activity */}
                {selectedTeacherActivity && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-white shadow-xl space-y-6"
                  >
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{selectedTeacherActivity.icon}</span>
                        <div>
                          <h3 className="text-2xl font-black text-slate-800">{selectedTeacherActivity.title}</h3>
                          <p className="text-sm font-bold text-pink-600">{selectedTeacherActivity.englishTitle}</p>
                        </div>
                      </div>
                    </div>

                    {/* Introduction Script */}
                    <div className="bg-pink-50/70 p-5 rounded-3xl border border-pink-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-black text-pink-900 text-base flex items-center gap-2">
                          <MessageSquare size={18} />
                          <span>Mẫu lời dẫn mở đầu tiết học (Teacher's Introduction Script)</span>
                        </h4>
                        <button
                          onClick={() => speakEnglish(selectedTeacherActivity.introductionScript)}
                          className="px-3 py-1 bg-pink-600 text-white rounded-full text-xs font-black flex items-center gap-1 hover:bg-pink-700 transition-colors"
                        >
                          <Volume2 size={14} /> Nghe toàn bộ lời dẫn
                        </button>
                      </div>
                      <p className="text-base font-bold text-indigo-950 italic mb-2">
                        "{selectedTeacherActivity.introductionScript}"
                      </p>
                      <p className="text-xs text-slate-600">
                        {selectedTeacherActivity.introductionTranslation}
                      </p>
                    </div>

                    {/* Key Vocabulary */}
                    <div>
                      <h4 className="font-black text-slate-800 text-base mb-3">Từ vựng trọng tâm trong hoạt động:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {selectedTeacherActivity.keyVocabulary.map((v, i) => (
                          <div key={i} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                            <button
                              onClick={() => speakEnglish(v.word)}
                              className="font-black text-indigo-700 hover:text-indigo-900 text-sm flex items-center justify-center gap-1 mx-auto"
                            >
                              <span>{v.word}</span>
                              <Volume2 size={12} />
                            </button>
                            <p className="text-[10px] font-mono text-slate-400">{v.phonetic}</p>
                            <p className="text-xs font-bold text-slate-700 mt-1">{v.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Teacher Prompts & Dialogue */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                        <h4 className="font-black text-slate-800 text-base mb-3">Câu hiệu lệnh cô dùng trong bài:</h4>
                        <div className="space-y-3">
                          {selectedTeacherActivity.teacherPrompts.map((p, i) => (
                            <div key={i} className="flex items-start justify-between gap-2 border-b border-slate-200/60 pb-2 last:border-none">
                              <div>
                                <p className="font-black text-slate-800 text-sm">"{p.english}"</p>
                                <p className="text-xs font-mono text-indigo-500">{p.phonetic}</p>
                                <p className="text-xs text-slate-600">{p.vietnamese}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => speakEnglish(p.english)}
                                  className="p-2 bg-white text-indigo-600 rounded-full shadow-2xs hover:bg-indigo-50 transition-colors"
                                  title="Nghe câu này"
                                >
                                  <Volume2 size={16} />
                                </button>
                                <button
                                  onClick={() => startTeacherPractice({
                                    id: `prompt-${i}`,
                                    english: p.english,
                                    phonetic: p.phonetic,
                                    vietnamese: p.vietnamese,
                                    situation: 'Khẩu lệnh tổ chức hoạt động mầm non'
                                  })}
                                  className="p-2 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-full shadow-2xs transition-colors"
                                  title="Luyện phát âm câu này"
                                >
                                  <Mic size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                        <h4 className="font-black text-slate-800 text-base mb-3">Mẫu hội thoại ngắn Cô - Trẻ thực tế:</h4>
                        <div className="space-y-3">
                          {selectedTeacherActivity.sampleDialogue.map((d, i) => (
                            <div key={i} className={`p-3 rounded-2xl text-xs ${d.speaker === 'Teacher' ? 'bg-pink-100/70 border border-pink-200' : 'bg-sky-100/70 border border-sky-200'}`}>
                              <span className="font-black uppercase text-[10px] tracking-wider text-slate-500 block mb-1">
                                {d.speaker === 'Teacher' ? '👩‍🏫 Cô giáo:' : '👶 Các con:'}
                              </span>
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-black text-slate-900 text-sm">"{d.text}"</p>
                                <button onClick={() => speakEnglish(d.text)} className="p-1 bg-white rounded-full">
                                  <Volume2 size={14} />
                                </button>
                              </div>
                              <p className="text-slate-600 mt-1">{d.translation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Pedagogical Tip */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium">
                      <strong>Lưu ý phương pháp sư phạm:</strong> {selectedTeacherActivity.pedagogicalTip}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Sub-tab 3: 4 Learning Levels */}
            {teacherTab === 'levels' && (
              <div className="space-y-6">
                {/* Level Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {TEACHER_LEARNING_LEVELS.map((lvl, idx) => (
                    <button
                      key={lvl.levelNumber}
                      onClick={() => {
                        setSelectedTeacherLevelIndex(idx);
                        setSelectedTeacherLessonIndex(0);
                        setTeacherQuizAnswer(null);
                        setTeacherQuizSubmitted(false);
                      }}
                      className={`p-5 rounded-3xl border-4 text-left transition-all ${
                        selectedTeacherLevelIndex === idx
                          ? 'bg-purple-50 border-purple-500 shadow-md scale-102'
                          : 'bg-white border-white hover:border-purple-200 shadow-sm'
                      }`}
                    >
                      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                        Cấp độ {lvl.levelNumber}
                      </span>
                      <h4 className="font-black text-slate-800 text-base mt-2">{lvl.levelTitle}</h4>
                      <p className="text-xs font-bold text-emerald-600 mt-1">{lvl.badge}</p>
                    </button>
                  ))}
                </div>

                {/* Level Detail */}
                {(() => {
                  const currentLevel = TEACHER_LEARNING_LEVELS[selectedTeacherLevelIndex];
                  const currentLesson = currentLevel.lessons[selectedTeacherLessonIndex];

                  return (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-white shadow-xl space-y-6">
                      <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                            {currentLevel.levelTitle}
                          </span>
                          <h3 className="text-2xl font-black text-slate-800 mt-2">{currentLesson.title}</h3>
                          <p className="text-xs text-slate-500 font-medium">{currentLesson.target}</p>
                        </div>

                        {/* Lesson Switcher */}
                        {currentLevel.lessons.length > 1 && (
                          <div className="flex gap-2">
                            {currentLevel.lessons.map((les, lIdx) => (
                              <button
                                key={les.id}
                                onClick={() => {
                                  setSelectedTeacherLessonIndex(lIdx);
                                  setTeacherQuizAnswer(null);
                                  setTeacherQuizSubmitted(false);
                                }}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                                  selectedTeacherLessonIndex === lIdx
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                Bài {lIdx + 1}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Vocabulary */}
                      <div>
                        <h4 className="font-black text-slate-800 text-sm mb-3">Từ vựng then chốt của bài:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          {currentLesson.vocabulary.map((v, i) => (
                            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-purple-900 text-base">{v.word}</span>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => speakEnglish(v.word)} className="p-1.5 text-purple-600 hover:text-purple-800 rounded-lg hover:bg-purple-50 transition-colors" title="Nghe từ này">
                                      <Volume2 size={16} />
                                    </button>
                                    <button 
                                      onClick={() => startTeacherPractice({
                                        id: `lvl-${v.word}`,
                                        english: v.word,
                                        phonetic: v.phonetic,
                                        vietnamese: v.meaning,
                                        situation: `Từ vựng bài học: ${currentLesson.title}`
                                      })}
                                      className="p-1.5 text-pink-600 hover:text-pink-800 rounded-lg hover:bg-pink-50 transition-colors"
                                      title="Luyện phát âm từ này"
                                    >
                                      <Mic size={15} />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-[11px] font-mono text-slate-400">{v.phonetic}</p>
                              </div>
                              <p className="text-xs font-bold text-slate-700 mt-2">{v.meaning}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dialogue */}
                      <div className="bg-purple-50/60 p-5 rounded-3xl border border-purple-200">
                        <h4 className="font-black text-purple-900 text-sm mb-3">Hội thoại mẫu áp dụng vào thực tế:</h4>
                        <div className="space-y-2">
                          {currentLesson.dialogue.map((d, i) => (
                            <div key={i} className="flex items-start justify-between gap-3 bg-white p-3 rounded-2xl shadow-2xs">
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{d.speaker}:</span>
                                <p className="font-black text-slate-800 text-sm">"{d.en}"</p>
                                <p className="text-xs text-slate-600">{d.vi}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => speakEnglish(d.en)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors" title="Nghe câu này">
                                  <Volume2 size={16} />
                                </button>
                                <button
                                  onClick={() => startTeacherPractice({
                                    id: `dial-${i}`,
                                    english: d.en,
                                    phonetic: '',
                                    vietnamese: d.vi,
                                    situation: `Mẫu câu hội thoại: ${d.speaker}`
                                  })}
                                  className="p-2 text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                                  title="Cô luyện phát âm"
                                >
                                  <Mic size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Practical Sư phạm Quiz */}
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-3xl border-2 border-indigo-200">
                        <div className="flex items-center gap-2 mb-2">
                          <HelpCircle className="text-indigo-600" size={20} />
                          <h4 className="font-black text-indigo-900 text-base">Bài tập tình huống sư phạm</h4>
                        </div>
                        <p className="text-sm text-slate-700 font-bold mb-3">
                          {currentLesson.practicalExercise.situation}
                        </p>
                        <p className="text-xs font-extrabold text-indigo-700 mb-4">
                          Câu hỏi: {currentLesson.practicalExercise.question}
                        </p>

                        <div className="space-y-2 mb-4">
                          {currentLesson.practicalExercise.options.map((opt, optIdx) => (
                            <button
                              key={optIdx}
                              onClick={() => {
                                setTeacherQuizAnswer(optIdx);
                                setTeacherQuizSubmitted(true);
                                if (optIdx === currentLesson.practicalExercise.correctIndex) {
                                  confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
                                  speakEnglish('Correct! Excellent choice, teacher!');
                                }
                              }}
                              className={`w-full p-3.5 rounded-2xl text-left text-xs sm:text-sm font-bold transition-all border-2 flex items-center justify-between ${
                                teacherQuizSubmitted
                                  ? optIdx === currentLesson.practicalExercise.correctIndex
                                    ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                                    : teacherQuizAnswer === optIdx
                                      ? 'bg-rose-100 border-rose-500 text-rose-900'
                                      : 'bg-white border-slate-200 text-slate-600 opacity-60'
                                  : 'bg-white hover:bg-indigo-50 border-slate-200 hover:border-indigo-300 text-slate-800'
                              }`}
                            >
                              <span>{opt}</span>
                              {teacherQuizSubmitted && optIdx === currentLesson.practicalExercise.correctIndex && (
                                <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
                              )}
                            </button>
                          ))}
                        </div>

                        {teacherQuizSubmitted && (
                          <div className="p-3.5 rounded-2xl bg-white border border-indigo-200 text-xs text-slate-700">
                            <span className="font-bold text-indigo-800">Giải thích sư phạm: </span>
                            {currentLesson.practicalExercise.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ================================================= */}
        {/* III. BÀI HÁT MẦM NON (NURSERY RHYMES)            */}
        {/* ================================================= */}
        {activeMainTab === 'songs' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
              <h2 className="text-2xl sm:text-3xl font-black mb-2 flex items-center gap-2">
                <Music /> Bài hát tiếng Anh thiếu nhi mầm non bất hủ
              </h2>
              <p className="text-sm text-emerald-100 font-medium">
                Âm nhạc là con đường ngắn nhất giúp bé tiếp thu ngữ điệu, từ vựng và tự tin phát âm tiếng Anh tự nhiên!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {NURSERY_RHYMES_SONGS.map(song => (
                <div
                  key={song.id}
                  className="bg-white rounded-3xl p-6 border-4 border-white shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-5xl">{song.emoji}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {song.theme}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">{song.title}</h3>
                    <h4 className="text-sm font-bold text-emerald-600 mb-3 italic">{song.englishTitle}</h4>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4">
                      <p className="text-xs font-bold text-slate-600 italic">
                        "{song.lyricsSnippet}"
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => speakEnglish(song.lyricsSnippet)}
                      className="w-full py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center gap-2 transition-colors border border-indigo-200"
                    >
                      <Volume2 size={16} /> Nghe đọc lời bài hát
                    </button>
                    {song.videoId && (
                      <button
                        onClick={() => setActiveVideoId(song.videoId || null)}
                        className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        <Play size={16} /> Xem Video ca nhạc 📺
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* IV. BẢNG ÂM PHONICS A-Z                           */}
        {/* ================================================= */}
        {activeMainTab === 'phonics' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
              <h2 className="text-2xl sm:text-3xl font-black mb-2 flex items-center gap-2">
                <BookOpen /> Bảng chữ cái & Âm Phonics tiếng Anh A-Z
              </h2>
              <p className="text-sm text-amber-100 font-medium">
                Bé chạm vào từng chữ cái để nghe phát âm tên chữ cái và âm mẫu kèm ví dụ trực quan gần gũi!
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { letter: 'A', sound: '/æ/', word: 'Apple', emoji: '🍎' },
                { letter: 'B', sound: '/b/', word: 'Ball', emoji: '⚽' },
                { letter: 'C', sound: '/k/', word: 'Cat', emoji: '🐱' },
                { letter: 'D', sound: '/d/', word: 'Dog', emoji: '🐶' },
                { letter: 'E', sound: '/e/', word: 'Elephant', emoji: '🐘' },
                { letter: 'F', sound: '/f/', word: 'Fish', emoji: '🐟' },
                { letter: 'G', sound: '/ɡ/', word: 'Giraffe', emoji: '🦒' },
                { letter: 'H', sound: '/h/', word: 'Hat', emoji: '👒' },
                { letter: 'I', sound: '/ɪ/', word: 'Ice cream', emoji: '🍦' },
                { letter: 'J', sound: '/dʒ/', word: 'Juice', emoji: '🧃' },
                { letter: 'K', sound: '/k/', word: 'Kite', emoji: '🪁' },
                { letter: 'L', sound: '/l/', word: 'Lion', emoji: '🦁' },
                { letter: 'M', sound: '/m/', word: 'Monkey', emoji: '🐵' },
                { letter: 'N', sound: '/n/', word: 'Nest', emoji: '🪹' },
                { letter: 'O', sound: '/ɒ/', word: 'Orange', emoji: '🍊' },
                { letter: 'P', sound: '/p/', word: 'Pig', emoji: '🐷' },
                { letter: 'Q', sound: '/kw/', word: 'Queen', emoji: '👑' },
                { letter: 'R', sound: '/r/', word: 'Rabbit', emoji: '🐰' },
                { letter: 'S', sound: '/s/', word: 'Sun', emoji: '☀️' },
                { letter: 'T', sound: '/t/', word: 'Tiger', emoji: '🐯' },
                { letter: 'U', sound: '/ʌ/', word: 'Umbrella', emoji: '☂️' },
                { letter: 'V', sound: '/v/', word: 'Van', emoji: '🚐' },
                { letter: 'W', sound: '/w/', word: 'Water', emoji: '💧' },
                { letter: 'X', sound: '/ks/', word: 'Xylophone', emoji: '🎹' },
                { letter: 'Y', sound: '/j/', word: 'Yogurt', emoji: '🥣' },
                { letter: 'Z', sound: '/z/', word: 'Zebra', emoji: '🦓' },
              ].map(item => (
                <motion.button
                  key={item.letter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => speakEnglish(`Letter ${item.letter}. ${item.word}`)}
                  className="bg-white p-5 rounded-3xl border-4 border-white shadow-md hover:shadow-lg transition-all text-center flex flex-col items-center justify-between group"
                >
                  <span className="text-3xl font-black text-amber-600 group-hover:scale-110 transition-transform">
                    {item.letter}
                  </span>
                  <span className="text-4xl my-2">{item.emoji}</span>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">{item.word}</span>
                    <span className="text-[11px] font-mono text-slate-400">{item.sound}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ================================================= */}
      {/* INTERACTIVE MINI-GAME MODAL                       */}
      {/* ================================================= */}
      <AnimatePresence>
        {isPlayingGame && selectedTheme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-xl w-full shadow-2xl border-4 border-white text-center relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                  Câu hỏi {currentGameQuestionIndex + 1} / {selectedTheme.interactiveGame.questions.length}
                </span>
                <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                  <Star className="fill-amber-400 text-amber-400" size={16} /> Điểm: {gameScore}
                </span>
                <button
                  onClick={() => setIsPlayingGame(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  ✕
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentGameQuestionIndex + 1) / selectedTheme.interactiveGame.questions.length) * 100}%`
                  }}
                ></div>
              </div>

              {/* Question */}
              {(() => {
                const q = selectedTheme.interactiveGame.questions[currentGameQuestionIndex];
                const isFinished = isAnswerSubmitted && currentGameQuestionIndex === selectedTheme.interactiveGame.questions.length - 1;

                return (
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-4 leading-snug">
                      {q.prompt}
                    </h3>

                    {q.englishAudioPrompt && (
                      <button
                        onClick={() => speakEnglish(q.englishAudioPrompt!)}
                        className="mb-6 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-sm rounded-full inline-flex items-center gap-2 border border-indigo-200 transition-colors"
                      >
                        <Volume2 size={18} />
                        <span>Nghe phát âm: "{q.englishAudioPrompt}"</span>
                      </button>
                    )}

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {q.options.map(opt => {
                        const isChosen = selectedGameAnswer === opt.id;
                        const isCorrectOpt = opt.id === q.correctId;

                        return (
                          <motion.button
                            key={opt.id}
                            whileHover={{ scale: isAnswerSubmitted ? 1 : 1.03 }}
                            whileTap={{ scale: isAnswerSubmitted ? 1 : 0.97 }}
                            onClick={() => handleSelectGameOption(opt.id)}
                            disabled={isAnswerSubmitted}
                            className={`p-5 rounded-3xl border-4 text-center font-black transition-all flex flex-col items-center justify-center gap-2 ${
                              isAnswerSubmitted
                                ? isCorrectOpt
                                  ? 'bg-emerald-100 border-emerald-500 text-emerald-900 shadow-md'
                                  : isChosen
                                    ? 'bg-rose-100 border-rose-500 text-rose-900'
                                    : 'bg-white border-slate-100 opacity-50'
                                : 'bg-slate-50 hover:bg-indigo-50 border-white hover:border-indigo-200 text-slate-800 shadow-xs'
                            }`}
                          >
                            {opt.emoji && <span className="text-5xl">{opt.emoji}</span>}
                            <span className="text-lg">{opt.text}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Hint / Feedback */}
                    {isAnswerSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                      >
                        {selectedGameAnswer === q.correctId ? (
                          <p className="text-emerald-700 font-black text-lg">
                            🎉 Tuyệt vời! Bé chọn đúng rồi!
                          </p>
                        ) : (
                          <p className="text-rose-600 font-bold text-sm">
                            Gần đúng rồi! {q.hint || 'Bé hãy thử lại ở lượt sau nhé!'}
                          </p>
                        )}
                      </motion.div>
                    )}

                    {/* Action button */}
                    {isAnswerSubmitted && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={
                          isFinished
                            ? () => {
                                completeCurrentGame();
                                setIsPlayingGame(false);
                              }
                            : handleNextGameQuestion
                        }
                        className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-black text-base rounded-full shadow-lg hover:shadow-xl transition-all"
                      >
                        {isFinished ? 'Hoàn thành trò chơi 🏆' : 'Câu tiếp theo →'}
                      </motion.button>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================= */}
      {/* VIDEO MODAL FOR SONGS                             */}
      {/* ================================================= */}
      <AnimatePresence>
        {activeVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl">
              <button
                onClick={() => setActiveVideoId(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors"
              >
                ✕ Đóng
              </button>
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                  title="English Nursery Rhyme Video"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================= */}
      {/* V. PHÒNG LUYỆN PHÁT ÂM VÀ CHẤM ĐIỂM DÀNH CHO BÉ    */}
      {/* ================================================= */}
      <AnimatePresence>
        {activePracticeWord && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Phòng luyện phát âm cho bé"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.85, y: 25 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 25 }}
              className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-xl w-full min-w-0 max-h-[calc(100dvh-2rem)] shadow-2xl border-4 border-white text-center break-words relative overflow-x-hidden overflow-y-auto my-auto"
            >
              {/* Decorative background glow */}
              <div className="absolute -top-20 -right-20 w-52 h-52 bg-pink-100 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-amber-100 rounded-full blur-3xl pointer-events-none"></div>

              {/* Modal Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-black rounded-full shadow-xs">
                  <Mic size={14} />
                  <span>Bé Tập Phát Âm 3D</span>
                </span>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-amber-600 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <Star className="fill-amber-400 text-amber-400" size={14} />
                    {earnedStarsMap[activePracticeWord.id] || 0}/3 sao
                  </span>
                  <button
                    type="button"
                    aria-label="Đóng phòng luyện phát âm cho bé"
                    onClick={() => {
                      cancelKidPractice();
                      setActivePracticeWord(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Target Word Hero Box */}
              <div className="bg-gradient-to-b from-indigo-50/70 to-purple-50/60 rounded-3xl p-6 border-2 border-indigo-100 mb-6 relative z-10">
                <span className="text-7xl sm:text-8xl block mb-2 filter drop-shadow-md animate-bounce-slow">
                  {activePracticeWord.emoji}
                </span>

                <h3 className="text-3xl sm:text-4xl font-black text-indigo-950 tracking-wide uppercase mb-1">
                  {activePracticeWord.word}
                </h3>

                <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                  <span className="text-sm font-mono text-indigo-600 font-bold bg-white/80 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {activePracticeWord.phonetic}
                  </span>
                </div>

                <p className="text-lg font-black text-slate-700">
                  {activePracticeWord.meaning}
                </p>

                {activePracticeWord.exampleSentence && (
                  <p className="text-xs font-semibold text-slate-500 italic mt-2">
                    "{activePracticeWord.exampleSentence}"
                  </p>
                )}
              </div>

              {/* Listening Support (Nghe Chuẩn & Nghe Chậm) */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6 relative z-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => speakEnglish(activePracticeWord.word, 1.0)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs sm:text-sm border border-indigo-200 transition-colors shadow-xs"
                >
                  <Volume2 size={16} />
                  <span>Nghe mẫu chuẩn (1.0x)</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => speakEnglish(activePracticeWord.word, 0.6)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-black text-xs sm:text-sm border border-amber-300 transition-colors shadow-xs"
                >
                  <span className="text-base">🐢</span>
                  <span>Nghe chậm (0.6x)</span>
                </motion.button>
              </div>

              {/* Microphone & Evaluation Action Zone */}
              <div className="relative z-10 space-y-4">
                {/* State 1: Ready to record */}
                {!isRecordingKidSpeech && !kidSpeechEvaluation && (
                  <div className="flex flex-col items-center">
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      aria-label="Bắt đầu ghi âm cho bé" onClick={startListeningToKid}
                      className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all border-4 border-white cursor-pointer group"
                    >
                      <Mic size={36} className="group-hover:scale-110 transition-transform" />
                    </motion.button>
                    <p className="font-black text-slate-800 text-sm mt-3">
                      👉 Bé chạm vào micro rồi nói to từ: <span className="text-rose-600 font-black underline">"{activePracticeWord.word}"</span>
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Hệ thống sẽ lắng nghe và tặng sao thưởng cho bé!
                    </p>
                  </div>
                )}

                {/* State 2: Actively Recording */}
                {isRecordingKidSpeech && (
                  <div className="flex flex-col items-center py-2">
                    <div className="relative flex items-center justify-center mb-3">
                      <div className="absolute w-28 h-28 rounded-full bg-rose-400/30 animate-ping"></div>
                      <div className="absolute w-24 h-24 rounded-full bg-rose-500/20 animate-pulse"></div>
                      <div className="w-20 h-20 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border-4 border-white">
                        <Mic size={32} className="animate-bounce" />
                      </div>
                    </div>
                    <p className="text-base font-black text-rose-600 animate-pulse">
                      🔴 Đang lắng nghe bé nói...
                    </p>
                    <p className="text-xs font-bold text-slate-600 mt-1">
                      Bé hãy nói to: <strong className="text-slate-900 uppercase">"{activePracticeWord.word}"</strong> 🗣️
                    </p>
                    <button
                      aria-label="Dừng ghi âm cho bé" onClick={stopRecordingStreams}
                      className="mt-3 px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold"
                    >
                      ⏹️ Bé nói xong rồi
                    </button>
                  </div>
                )}

                {/* State 3: Evaluation & Result with Stars */}
                {kidSpeechEvaluation && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-50/90 rounded-3xl p-5 border-2 border-slate-200/80"
                  >
                    {/* Stars Earned */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {kidSpeechEvaluation.score !== null && [1, 2, 3].map(starNum => (
                        <motion.div
                          key={starNum}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: starNum * 0.15, type: 'spring' }}
                        >
                          <Star
                            size={36}
                            className={`${
                              starNum <= kidSpeechEvaluation.stars
                                ? 'fill-amber-400 text-amber-500 filter drop-shadow-md'
                                : 'text-slate-300'
                            }`}
                          />
                        </motion.div>
                      ))}
                    </div>

                    <h4 className="text-lg font-black text-slate-800 mb-1">
                      {kidSpeechEvaluation.feedback}
                    </h4>

                    {kidSpeechTranscript && (
                      <p className="text-xs font-bold text-indigo-700 bg-indigo-50/80 inline-block px-3 py-1 rounded-full border border-indigo-200 mb-2">
                        Lời bé vừa phát âm: <strong>"{kidSpeechTranscript}"</strong>
                      </p>
                    )}

                    {/* Audio Playback of Child's Voice */}
                    {kidRecordedAudioUrl && (
                      <div className="my-2">
                        <button
                          onClick={() => {
                            const audio = new Audio(kidRecordedAudioUrl);
                            setIsPlayingRecordedAudio(true);
                            audio.play();
                            audio.onended = () => setIsPlayingRecordedAudio(false);
                            audio.onerror = () => setIsPlayingRecordedAudio(false);
                          }}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all ${
                            isPlayingRecordedAudio
                              ? 'bg-amber-400 text-amber-950 scale-95 animate-pulse'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
                          }`}
                        >
                          <Play size={14} className="fill-current" />
                          <span>{isPlayingRecordedAudio ? 'Đang phát lại giọng của bé...' : 'Nghe lại giọng của bé 🎧'}</span>
                        </button>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-3 border-t border-slate-200">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Bắt đầu ghi âm cho bé" onClick={startListeningToKid}
                        className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-black text-xs border border-slate-300 flex items-center gap-1.5 shadow-xs"
                      >
                        <RotateCcw size={14} />
                        <span>Bé nói lại lần nữa</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => speakEnglish(activePracticeWord.word, 0.6)}
                        className="px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs border border-amber-300 flex items-center gap-1.5"
                      >
                        <span>🐢 Nghe chậm</span>
                      </motion.button>

                      {/* Next word button */}
                      {selectedTheme && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const currentIdx = selectedTheme.vocabulary.findIndex(v => v.id === activePracticeWord.id);
                            if (currentIdx >= 0 && currentIdx < selectedTheme.vocabulary.length - 1) {
                              startKidSpeechPractice(selectedTheme.vocabulary[currentIdx + 1]);
                            } else {
                              startKidSpeechPractice(selectedTheme.vocabulary[0]);
                            }
                          }}
                          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-black text-xs shadow-md hover:shadow-lg flex items-center gap-1.5"
                        >
                          <span>Từ tiếp theo</span>
                          <ChevronRight size={15} />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================= */}
      {/* VI. PHÒNG LUYỆN PHÁT ÂM SƯ PHẠM DÀNH CHO CÔ GIÁO   */}
      {/* ================================================= */}
      <AnimatePresence>
        {activeTeacherPractice && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Phòng luyện phát âm cho cô"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.85, y: 25 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 25 }}
              className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-xl w-full min-w-0 max-h-[calc(100dvh-2rem)] shadow-2xl border-4 border-white text-center break-words relative overflow-x-hidden overflow-y-auto my-auto"
            >
              {/* Background glows */}
              <div className="absolute -top-20 -right-20 w-52 h-52 bg-pink-100 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-purple-100 rounded-full blur-3xl pointer-events-none"></div>

              {/* Modal Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-black rounded-full shadow-xs">
                  <GraduationCap size={15} />
                  <span>Cô Giáo Luyện Phát Âm Chuẩn Sư Phạm</span>
                </span>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-amber-600 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <Star className="fill-amber-400 text-amber-400" size={14} />
                    {earnedStarsMap[activeTeacherPractice.id] || 0}/3 sao
                  </span>
                  <button
                    type="button"
                    aria-label="Đóng phòng luyện phát âm cho cô"
                    onClick={() => {
                      cancelTeacherPractice();
                      setActiveTeacherPractice(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Target Phrase Box */}
              <div className="bg-gradient-to-b from-pink-50/80 via-purple-50/50 to-white rounded-3xl p-6 border-2 border-pink-200 mb-6 relative z-10 text-center">
                <span className="text-4xl mb-2 block">👩‍🏫</span>
                <h3 className="text-2xl sm:text-3xl font-black text-pink-950 tracking-normal mb-2 leading-snug">
                  "{activeTeacherPractice.english}"
                </h3>

                {activeTeacherPractice.phonetic && (
                  <p className="text-sm font-mono text-purple-700 font-bold bg-white/80 px-3 py-1 rounded-full border border-purple-200 inline-block mb-2">
                    {activeTeacherPractice.phonetic}
                  </p>
                )}

                <p className="text-base sm:text-lg font-black text-slate-800 mt-1">
                  {activeTeacherPractice.vietnamese}
                </p>

                {activeTeacherPractice.situation && (
                  <p className="text-xs text-slate-500 font-bold mt-2 bg-slate-100/80 py-1.5 px-3 rounded-xl inline-block">
                    📌 {activeTeacherPractice.situation}
                  </p>
                )}

                {activeTeacherPractice.tip && (
                  <p className="text-xs text-pink-700 font-semibold italic mt-2">
                    💡 Mẹo sư phạm: {activeTeacherPractice.tip}
                  </p>
                )}
              </div>

              {/* Audio Listen Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6 relative z-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => speakEnglish(activeTeacherPractice.english, 1.0)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs sm:text-sm border border-indigo-200 transition-colors shadow-xs"
                >
                  <Volume2 size={16} />
                  <span>Nghe mẫu chuẩn (1.0x)</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => speakEnglish(activeTeacherPractice.english, 0.7)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-800 font-black text-xs sm:text-sm border border-pink-300 transition-colors shadow-xs"
                >
                  <span className="text-base">🐢</span>
                  <span>Nghe chậm (0.7x)</span>
                </motion.button>
              </div>

              {/* Mic & Evaluation Action Zone */}
              <div className="relative z-10 space-y-4">
                {/* State 1: Ready to record */}
                {!isRecordingTeacherSpeech && !teacherSpeechEvaluation && (
                  <div className="flex flex-col items-center">
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      aria-label="Bắt đầu ghi âm cho cô" onClick={startListeningToTeacher}
                      className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-purple-600 text-white flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all border-4 border-white cursor-pointer group"
                    >
                      <Mic size={36} className="group-hover:scale-110 transition-transform" />
                    </motion.button>
                    <p className="font-black text-slate-800 text-sm mt-3">
                      👉 Cô chạm vào micro rồi nói câu tiếng Anh: <span className="text-pink-600 font-black">"{activeTeacherPractice.english}"</span>
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Hệ thống sẽ lắng nghe, phân tích độ chuẩn và chấm điểm sư phạm!
                    </p>
                  </div>
                )}

                {/* State 2: Actively Recording */}
                {isRecordingTeacherSpeech && (
                  <div className="flex flex-col items-center py-2">
                    <div className="relative flex items-center justify-center mb-3">
                      <div className="absolute w-28 h-28 rounded-full bg-pink-400/30 animate-ping"></div>
                      <div className="absolute w-24 h-24 rounded-full bg-pink-500/20 animate-pulse"></div>
                      <div className="w-20 h-20 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-lg border-4 border-white">
                        <Mic size={32} className="animate-bounce" />
                      </div>
                    </div>
                    <p className="text-base font-black text-pink-600 animate-pulse">
                      🔴 Đang lắng nghe cô giáo phát âm...
                    </p>
                    <p className="text-xs font-bold text-slate-600 mt-1">
                      Cô hãy đọc to: <strong className="text-slate-900">"{activeTeacherPractice.english}"</strong> 🗣️
                    </p>
                    <button
                      aria-label="Dừng ghi âm cho cô" onClick={stopTeacherRecordingStreams}
                      className="mt-3 px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold"
                    >
                      ⏹️ Cô đọc xong rồi
                    </button>
                  </div>
                )}

                {/* State 3: Evaluation & Result */}
                {teacherSpeechEvaluation && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-50/90 rounded-3xl p-5 border-2 border-slate-200/80"
                  >
                    {/* Stars Earned */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {teacherSpeechEvaluation.score !== null && [1, 2, 3].map(starNum => (
                        <motion.div
                          key={starNum}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: starNum * 0.15, type: 'spring' }}
                        >
                          <Star
                            size={36}
                            className={`${
                              starNum <= teacherSpeechEvaluation.stars
                                ? 'fill-amber-400 text-amber-500 filter drop-shadow-md'
                                : 'text-slate-300'
                            }`}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {teacherSpeechEvaluation.score !== null && <div className="inline-block bg-pink-100 text-pink-800 font-black text-xs px-3 py-1 rounded-full mb-2">
                      Điểm phát âm: {teacherSpeechEvaluation.score}/100
                    </div>}

                    <h4 className="text-base sm:text-lg font-black text-slate-800 mb-1 leading-snug">
                      {teacherSpeechEvaluation.feedback}
                    </h4>

                    {teacherSpeechTranscript && (
                      <p className="text-xs font-bold text-purple-700 bg-purple-50/80 inline-block px-3 py-1 rounded-full border border-purple-200 my-2">
                        Giọng cô đọc nhận diện được: <strong>"{teacherSpeechTranscript}"</strong>
                      </p>
                    )}

                    {/* Audio Playback of Teacher's Voice */}
                    {teacherRecordedAudioUrl && (
                      <div className="my-2">
                        <button
                          onClick={() => {
                            const audio = new Audio(teacherRecordedAudioUrl);
                            setIsPlayingTeacherRecordedAudio(true);
                            audio.play();
                            audio.onended = () => setIsPlayingTeacherRecordedAudio(false);
                            audio.onerror = () => setIsPlayingTeacherRecordedAudio(false);
                          }}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all ${
                            isPlayingTeacherRecordedAudio
                              ? 'bg-amber-400 text-amber-950 scale-95 animate-pulse'
                              : 'bg-pink-600 hover:bg-pink-700 text-white shadow-xs'
                          }`}
                        >
                          <Play size={14} className="fill-current" />
                          <span>{isPlayingTeacherRecordedAudio ? 'Đang phát lại giọng của cô...' : 'Nghe lại giọng của cô 🎧'}</span>
                        </button>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-3 border-t border-slate-200">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Bắt đầu ghi âm cho cô" onClick={startListeningToTeacher}
                        className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-black text-xs border border-slate-300 flex items-center gap-1.5 shadow-xs"
                      >
                        <RotateCcw size={14} />
                        <span>Cô phát âm lại</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => speakEnglish(activeTeacherPractice.english, 0.7)}
                        className="px-4 py-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-900 font-black text-xs border border-pink-300 flex items-center gap-1.5"
                      >
                        <span>🐢 Nghe chậm</span>
                      </motion.button>

                      {/* Next phrase button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const currentIdx = TEACHER_CLASSROOM_PHRASES.findIndex(p => p.id === activeTeacherPractice.id);
                          if (currentIdx >= 0 && currentIdx < TEACHER_CLASSROOM_PHRASES.length - 1) {
                            startTeacherPractice(TEACHER_CLASSROOM_PHRASES[currentIdx + 1]);
                          } else {
                            startTeacherPractice(TEACHER_CLASSROOM_PHRASES[0]);
                          }
                        }}
                        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black text-xs shadow-md hover:shadow-lg flex items-center gap-1.5"
                      >
                        <span>Câu tiếp theo</span>
                        <ChevronRight size={15} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
