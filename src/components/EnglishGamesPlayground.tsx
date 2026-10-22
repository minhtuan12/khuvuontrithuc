import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Star, Trophy, RotateCcw, Volume2, ArrowLeft, 
  HelpCircle, CheckCircle2, Play, Award, Zap, Shuffle, Music
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EnglishGamesPlaygroundProps {
  onBack?: () => void;
  speakEnglish: (text: string, rate?: number) => void;
  playAudioChime: (isSuccess?: boolean) => void;
}

// Data sets for games covering all 8 core preschool themes
const MEMORY_THEMES = [
  {
    id: 'kindergarten',
    name: 'Trường mầm non (School)',
    icon: '🏫',
    pairs: [
      { id: 'teacher', word: 'Teacher', emoji: '👩‍🏫', meaning: 'Cô giáo' },
      { id: 'school', word: 'School', emoji: '🏫', meaning: 'Trường học' },
      { id: 'book', word: 'Book', emoji: '📖', meaning: 'Quyển sách' },
      { id: 'pencil', word: 'Pencil', emoji: '✏️', meaning: 'Bút chì' },
      { id: 'crayon', word: 'Crayon', emoji: '🖍️', meaning: 'Bút màu sáp' },
      { id: 'slide', word: 'Slide', emoji: '🛝', meaning: 'Cầu trượt' },
    ]
  },
  {
    id: 'family',
    name: 'Gia đình (Family)',
    icon: '👨‍👩‍👧',
    pairs: [
      { id: 'mom', word: 'Mom', emoji: '👩', meaning: 'Mẹ yêu' },
      { id: 'dad', word: 'Dad', emoji: '👨', meaning: 'Bố yêu' },
      { id: 'baby', word: 'Baby', emoji: '👶', meaning: 'Em bé' },
      { id: 'grandpa', word: 'Grandpa', emoji: '👴', meaning: 'Ông' },
      { id: 'grandma', word: 'Grandma', emoji: '👵', meaning: 'Bà' },
      { id: 'house', word: 'House', emoji: '🏠', meaning: 'Ngôi nhà' },
    ]
  },
  {
    id: 'jobs',
    name: 'Nghề nghiệp (Jobs)',
    icon: '👩‍⚕️',
    pairs: [
      { id: 'doctor', word: 'Doctor', emoji: '👩‍⚕️', meaning: 'Bác sĩ' },
      { id: 'police', word: 'Police', emoji: '👮', meaning: 'Công an' },
      { id: 'firefighter', word: 'Firefighter', emoji: '👨‍🚒', meaning: 'Lính cứu hỏa' },
      { id: 'pilot', word: 'Pilot', emoji: '👨‍✈️', meaning: 'Phi công' },
      { id: 'chef', word: 'Chef', emoji: '👨‍🍳', meaning: 'Đầu bếp' },
      { id: 'farmer', word: 'Farmer', emoji: '👨‍🌾', meaning: 'Bác nông dân' },
    ]
  },
  {
    id: 'spring',
    name: 'Mùa xuân & Tết (Spring)',
    icon: '🌸',
    pairs: [
      { id: 'spring-word', word: 'Spring', emoji: '🌸', meaning: 'Mùa xuân' },
      { id: 'flower', word: 'Flower', emoji: '🌺', meaning: 'Bông hoa' },
      { id: 'peach', word: 'Peach blossom', emoji: '🌸', meaning: 'Hoa đào' },
      { id: 'lucky', word: 'Lucky money', emoji: '🧧', meaning: 'Bao lì xì' },
      { id: 'fireworks', word: 'Fireworks', emoji: '🎆', meaning: 'Pháo hoa' },
      { id: 'butterfly', word: 'Butterfly', emoji: '🦋', meaning: 'Con bướm' },
    ]
  },
  {
    id: 'plants',
    name: 'Thực vật & Cây hoa (Plants)',
    icon: '🌿',
    pairs: [
      { id: 'tree', word: 'Tree', emoji: '🌳', meaning: 'Cây xanh' },
      { id: 'leaf', word: 'Leaf', emoji: '🍃', meaning: 'Chiếc lá' },
      { id: 'grass', word: 'Grass', emoji: '🌱', meaning: 'Bãi cỏ' },
      { id: 'rose', word: 'Rose', emoji: '🌹', meaning: 'Hoa hồng' },
      { id: 'sunflower', word: 'Sunflower', emoji: '🌻', meaning: 'Hoa hướng dương' },
      { id: 'seed', word: 'Seed', emoji: '🌰', meaning: 'Hạt giống' },
    ]
  },
  {
    id: 'vehicles',
    name: 'Phương tiện giao thông (Vehicles)',
    icon: '🚗',
    pairs: [
      { id: 'car', word: 'Car', emoji: '🚗', meaning: 'Xe ô tô' },
      { id: 'bus', word: 'Bus', emoji: '🚌', meaning: 'Xe buýt' },
      { id: 'bike', word: 'Bicycle', emoji: '🚲', meaning: 'Xe đạp' },
      { id: 'plane', word: 'Plane', emoji: '✈️', meaning: 'Máy bay' },
      { id: 'train', word: 'Train', emoji: '🚂', meaning: 'Tàu hỏa' },
      { id: 'traffic-light', word: 'Traffic lights', emoji: '🚦', meaning: 'Đèn giao thông' },
    ]
  },
  {
    id: 'colors',
    name: 'Màu sắc (Colors)',
    icon: '🎨',
    pairs: [
      { id: 'red', word: 'Red', emoji: '🔴', meaning: 'Màu đỏ' },
      { id: 'blue', word: 'Blue', emoji: '🔵', meaning: 'Màu xanh dương' },
      { id: 'yellow', word: 'Yellow', emoji: '🟡', meaning: 'Màu vàng' },
      { id: 'green', word: 'Green', emoji: '🟢', meaning: 'Màu xanh lá' },
      { id: 'pink', word: 'Pink', emoji: '🌸', meaning: 'Màu hồng' },
      { id: 'rainbow', word: 'Rainbow', emoji: '🌈', meaning: 'Cầu vồng' },
    ]
  },
  {
    id: 'animals',
    name: 'Động vật (Animals)',
    icon: '🦁',
    pairs: [
      { id: 'cat', word: 'Cat', emoji: '🐱', meaning: 'Con mèo' },
      { id: 'dog', word: 'Dog', emoji: '🐶', meaning: 'Con chó' },
      { id: 'duck', word: 'Duck', emoji: '🦆', meaning: 'Con vịt' },
      { id: 'lion', word: 'Lion', emoji: '🦁', meaning: 'Sư tử' },
      { id: 'elephant', word: 'Elephant', emoji: '🐘', meaning: 'Con voi' },
      { id: 'dolphin', word: 'Dolphin', emoji: '🐬', meaning: 'Cá heo' },
    ]
  }
];

const BALLOON_WORDS = [
  { word: 'Cat', emoji: '🐱', meaning: 'Con mèo', color: 'from-amber-400 to-orange-500' },
  { word: 'Dog', emoji: '🐶', meaning: 'Con chó', color: 'from-sky-400 to-blue-500' },
  { word: 'Apple', emoji: '🍎', meaning: 'Quả táo', color: 'from-rose-400 to-red-500' },
  { word: 'Sun', emoji: '☀️', meaning: 'Mặt trời', color: 'from-yellow-300 to-amber-500' },
  { word: 'Star', emoji: '⭐', meaning: 'Ngôi sao', color: 'from-indigo-400 to-purple-500' },
  { word: 'Bird', emoji: '🐦', meaning: 'Con chim', color: 'from-teal-400 to-emerald-500' },
  { word: 'Fish', emoji: '🐟', meaning: 'Con cá', color: 'from-cyan-400 to-blue-600' },
  { word: 'Duck', emoji: '🦆', meaning: 'Con vịt', color: 'from-lime-400 to-green-500' },
  { word: 'Car', emoji: '🚗', meaning: 'Xe ô tô', color: 'from-pink-400 to-rose-500' },
  { word: 'Book', emoji: '📖', meaning: 'Quyển sách', color: 'from-violet-400 to-purple-600' },
];

const ROCKET_WORDS = [
  { word: 'CAT', letters: ['C', 'A', 'T'], emoji: '🐱', meaning: 'Con mèo', phonics: ['/k/', '/æ/', '/t/'] },
  { word: 'DOG', letters: ['D', 'O', 'G'], emoji: '🐶', meaning: 'Con chó', phonics: ['/d/', '/ɒ/', '/ɡ/'] },
  { word: 'SUN', letters: ['S', 'U', 'N'], emoji: '☀️', meaning: 'Mặt trời', phonics: ['/s/', '/ʌ/', '/n/'] },
  { word: 'BOX', letters: ['B', 'O', 'X'], emoji: '📦', meaning: 'Cái hộp', phonics: ['/b/', '/ɒ/', '/ks/'] },
  { word: 'PIG', letters: ['P', 'I', 'G'], emoji: '🐷', meaning: 'Con heo', phonics: ['/p/', '/ɪ/', '/ɡ/'] },
  { word: 'BUS', letters: ['B', 'U', 'S'], emoji: '🚌', meaning: 'Xe buýt', phonics: ['/b/', '/ʌ/', '/s/'] },
  { word: 'FISH', letters: ['F', 'I', 'S', 'H'], emoji: '🐟', meaning: 'Con cá', phonics: ['/f/', '/ɪ/', '/ʃ/'] },
];

const MYSTERY_QUESTIONS = [
  {
    id: 'm1',
    clueEnglish: 'I have long ears and love carrots! What am I?',
    clueVietnamese: 'Tớ có đôi tai dài và thích ăn củ cà rốt giòn ngọt! Tớ là ai?',
    answer: 'Rabbit',
    answerEmoji: '🐰',
    options: [
      { word: 'Cat', emoji: '🐱' },
      { word: 'Rabbit', emoji: '🐰' },
      { word: 'Fish', emoji: '🐟' },
    ]
  },
  {
    id: 'm2',
    clueEnglish: 'I am sweet, yellow, and monkeys love to eat me! What am I?',
    clueVietnamese: 'Tớ thơm ngọt, có màu vàng óng và các bạn khỉ rất thích ăn! Tớ là ai?',
    answer: 'Banana',
    answerEmoji: '🍌',
    options: [
      { word: 'Apple', emoji: '🍎' },
      { word: 'Orange', emoji: '🍊' },
      { word: 'Banana', emoji: '🍌' },
    ]
  },
  {
    id: 'm3',
    clueEnglish: 'I am high in the blue sky and give warm light to the earth! What am I?',
    clueVietnamese: 'Tớ ở tít trên bầu trời xanh, tỏa ánh nắng ấm áp cho muôn loài! Tớ là ai?',
    answer: 'Sun',
    answerEmoji: '☀️',
    options: [
      { word: 'Sun', emoji: '☀️' },
      { word: 'Moon', emoji: '🌙' },
      { word: 'Cloud', emoji: '☁️' },
    ]
  },
  {
    id: 'm4',
    clueEnglish: 'I swim in the water and say glub glub! What am I?',
    clueVietnamese: 'Tớ bơi lội tung tăng dưới làn nước trong xanh! Tớ là ai?',
    answer: 'Fish',
    answerEmoji: '🐟',
    options: [
      { word: 'Dog', emoji: '🐶' },
      { word: 'Fish', emoji: '🐟' },
      { word: 'Bird', emoji: '🐦' },
    ]
  },
  {
    id: 'm5',
    clueEnglish: 'I am the King of the Jungle with a big loud roar! What am I?',
    clueVietnamese: 'Tớ là Chúa tể sơn lâm với tiếng gầm dũng mãnh oai vệ! Tớ là ai?',
    answer: 'Lion',
    answerEmoji: '🦁',
    options: [
      { word: 'Duck', emoji: '🦆' },
      { word: 'Lion', emoji: '🦁' },
      { word: 'Monkey', emoji: '🐵' },
    ]
  }
];

export const EnglishGamesPlayground: React.FC<EnglishGamesPlaygroundProps> = ({
  onBack,
  speakEnglish,
  playAudioChime,
}) => {
  const pendingGameTasks = useRef(new Set<ReturnType<typeof setTimeout>>());
  const clearGameTasks = () => {
    pendingGameTasks.current.forEach(clearTimeout);
    pendingGameTasks.current.clear();
  };
  const scheduleGameTask = (task: () => void, delay: number) => {
    const timer = setTimeout(() => {
      pendingGameTasks.current.delete(timer);
      task();
    }, delay);
    pendingGameTasks.current.add(timer);
  };
  useEffect(() => clearGameTasks, []);

  // Game Selector: 'menu' | 'memory' | 'balloon' | 'rocket' | 'mystery'
  const [selectedGame, setSelectedGame] = useState<'menu' | 'memory' | 'balloon' | 'rocket' | 'mystery'>('menu');
  const [totalStars, setTotalStars, starsSync] = useDeviceDocument<number>('game-stars', () => {
    try {
      const value = Number(localStorage.getItem('mamnon_game_stars') || '0');
      return Number.isSafeInteger(value) && value >= 0 ? value : 0;
    } catch {
      return 0;
    }
  });

  const addStars = (count: number) => {
    setTotalStars(prev => {
      const updated = prev + count;
      try {
        localStorage.setItem('mamnon_game_stars', updated.toString());
      } catch {}
      return updated;
    });
  };

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  // ==========================================
  // 1. GAME 1: MEMORY MATCH LOGIC
  // ==========================================
  const [memoryThemeIndex, setMemoryThemeIndex] = useState(0);
  const [memoryCards, setMemoryCards] = useState<Array<{
    uid: string;
    pairId: string;
    type: 'word' | 'emoji';
    word: string;
    emoji: string;
    meaning: string;
    isFlipped: boolean;
    isMatched: boolean;
  }>>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [isMemoryWon, setIsMemoryWon] = useState(false);

  const initMemoryGame = (themeIdx = memoryThemeIndex) => {
    clearGameTasks();
    setMemoryThemeIndex(themeIdx);
    const theme = MEMORY_THEMES[themeIdx];
    const cards: any[] = [];
    theme.pairs.forEach(p => {
      // Card 1: Picture
      cards.push({
        uid: `${p.id}-emoji`,
        pairId: p.id,
        type: 'emoji',
        word: p.word,
        emoji: p.emoji,
        meaning: p.meaning,
        isFlipped: false,
        isMatched: false,
      });
      // Card 2: Word
      cards.push({
        uid: `${p.id}-word`,
        pairId: p.id,
        type: 'word',
        word: p.word,
        emoji: p.emoji,
        meaning: p.meaning,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle
    const shuffled = cards.sort(() => Math.random() - 0.5);
    setMemoryCards(shuffled);
    setFlippedIndices([]);
    setMemoryMoves(0);
    setIsMemoryWon(false);
  };

  const handleCardClick = (index: number) => {
    if (flippedIndices.length >= 2 || memoryCards[index].isFlipped || memoryCards[index].isMatched) {
      return;
    }

    const clickedCard = memoryCards[index];
    speakEnglish(clickedCard.word, 0.9);

    const updated = [...memoryCards];
    updated[index].isFlipped = true;
    setMemoryCards(updated);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves(m => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = updated[firstIdx];
      const secondCard = updated[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
        scheduleGameTask(() => {
          playAudioChime(true);
          fireConfetti();
          speakEnglish(`Good job! ${firstCard.word}!`, 1.0);
          const matched = [...memoryCards];
          matched[firstIdx].isMatched = true;
          matched[secondIdx].isMatched = true;
          setMemoryCards(matched);
          setFlippedIndices([]);
          addStars(2);

          // Check if all matched
          if (matched.every(c => c.isMatched)) {
            setIsMemoryWon(true);
            addStars(5);
          }
        }, 600);
      } else {
        // Not matched
        scheduleGameTask(() => {
          const reverted = [...memoryCards];
          reverted[firstIdx].isFlipped = false;
          reverted[secondIdx].isFlipped = false;
          setMemoryCards(reverted);
          setFlippedIndices([]);
        }, 1200);
      }
    }
  };

  // ==========================================
  // 2. GAME 2: BALLOON POP LOGIC
  // ==========================================
  const [balloonRound, setBalloonRound] = useState(0);
  const [targetBalloon, setTargetBalloon] = useState<typeof BALLOON_WORDS[0] | null>(null);
  const [balloonOptions, setBalloonOptions] = useState<typeof BALLOON_WORDS>([]);
  const [balloonScore, setBalloonScore] = useState(0);
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null);
  const [isBalloonRoundOver, setIsBalloonRoundOver] = useState(false);

  const initBalloonRound = (roundIdx = 0) => {
    clearGameTasks();
    // Pick 1 target and 3 random distractors
    const shuffledPool = [...BALLOON_WORDS].sort(() => Math.random() - 0.5);
    const target = shuffledPool[0];
    const options = shuffledPool.slice(0, 4).sort(() => Math.random() - 0.5);

    setTargetBalloon(target);
    setBalloonOptions(options);
    setBalloonRound(roundIdx);
    setPoppedIndex(null);
    setIsBalloonRoundOver(false);

    // Speak prompt
    scheduleGameTask(() => {
      speakEnglish(`Find the ${target.word}`, 0.85);
    }, 400);
  };

  const handleBalloonClick = (opt: typeof BALLOON_WORDS[0], idx: number) => {
    if (isBalloonRoundOver || !targetBalloon) return;

    if (opt.word === targetBalloon.word) {
      // Correct!
      setPoppedIndex(idx);
      setIsBalloonRoundOver(true);
      setBalloonScore(s => s + 10);
      addStars(3);
      playAudioChime(true);
      fireConfetti();
      speakEnglish(`Awesome! ${opt.word}!`, 1.0);
    } else {
      // Wrong
      playAudioChime(false);
      speakEnglish(`Try again! Find ${targetBalloon.word}`, 0.85);
    }
  };

  // ==========================================
  // 3. GAME 3: PHONICS ROCKET LOGIC
  // ==========================================
  const [rocketWordIndex, setRocketWordIndex] = useState(0);
  const [placedLetters, setPlacedLetters] = useState<string[]>([]);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [isRocketLaunched, setIsRocketLaunched] = useState(false);

  const currentRocket = ROCKET_WORDS[rocketWordIndex % ROCKET_WORDS.length];

  const initRocketGame = (wordIdx = 0) => {
    clearGameTasks();
    const item = ROCKET_WORDS[wordIdx % ROCKET_WORDS.length];
    setRocketWordIndex(wordIdx);
    setPlacedLetters([]);
    setIsRocketLaunched(false);

    // Scramble letters with 1 extra decoy letter
    const decoys = ['A', 'B', 'C', 'D', 'E', 'S', 'T'].filter(l => !item.letters.includes(l));
    const randomDecoy = decoys[Math.floor(Math.random() * decoys.length)] || 'X';
    const all = [...item.letters, randomDecoy].sort(() => Math.random() - 0.5);
    setScrambledLetters(all);

    scheduleGameTask(() => {
      speakEnglish(`Spell the word: ${item.word}`, 0.85);
    }, 400);
  };

  const handleLetterTap = (letter: string, idx: number) => {
    if (isRocketLaunched) return;

    speakEnglish(letter, 1.0);
    const targetLetter = currentRocket.letters[placedLetters.length];

    if (letter === targetLetter) {
      playAudioChime(true);
      const nextPlaced = [...placedLetters, letter];
      setPlacedLetters(nextPlaced);

      // Remove from scrambled
      const nextScrambled = [...scrambledLetters];
      nextScrambled.splice(idx, 1);
      setScrambledLetters(nextScrambled);

      // If finished word!
      if (nextPlaced.length === currentRocket.letters.length) {
        setIsRocketLaunched(true);
        addStars(5);
        fireConfetti();
        speakEnglish(`3, 2, 1, Blast off! ${currentRocket.word}!`, 1.0);
      }
    } else {
      playAudioChime(false);
      speakEnglish(`Not that one, find ${targetLetter}`, 0.9);
    }
  };

  // ==========================================
  // 4. GAME 4: MYSTERY BOX LOGIC
  // ==========================================
  const [mysteryIndex, setMysteryIndex] = useState(0);
  const [mysterySelectedOpt, setMysterySelectedOpt] = useState<string | null>(null);
  const [isMysteryAnswered, setIsMysteryAnswered] = useState(false);

  const currentMystery = MYSTERY_QUESTIONS[mysteryIndex % MYSTERY_QUESTIONS.length];

  const initMysteryGame = (idx = 0) => {
    clearGameTasks();
    const question = MYSTERY_QUESTIONS[idx % MYSTERY_QUESTIONS.length];
    setMysteryIndex(idx);
    setMysterySelectedOpt(null);
    setIsMysteryAnswered(false);
    scheduleGameTask(() => {
      speakEnglish(question.clueEnglish, 0.85);
    }, 400);
  };

  const handleMysteryChoice = (word: string) => {
    if (isMysteryAnswered) return;
    setMysterySelectedOpt(word);
    setIsMysteryAnswered(true);

    if (word === currentMystery.answer) {
      playAudioChime(true);
      fireConfetti();
      addStars(3);
      speakEnglish(`Bingo! It is the ${currentMystery.answer}!`, 1.0);
    } else {
      playAudioChime(false);
      speakEnglish(`Almost! The answer is ${currentMystery.answer}!`, 0.85);
    }
  };

  // Start selected game
  const startGame = (gameKey: typeof selectedGame) => {
    clearGameTasks();
    setSelectedGame(gameKey);
    if (gameKey === 'memory') initMemoryGame(0);
    if (gameKey === 'balloon') initBalloonRound(0);
    if (gameKey === 'rocket') initRocketGame(0);
    if (gameKey === 'mystery') initMysteryGame(0);
  };

  return (
    <div className="space-y-6">
      {starsSync.error && <p role="status" className="rounded-xl bg-amber-50 p-3 text-amber-900">{starsSync.error} <button type="button" onClick={starsSync.retry} className="underline">Thử lại</button><button type="button" onClick={starsSync.restoreRemote} className="ml-3 underline">Tải bản đã lưu</button></p>}
      {/* Playground Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border-4 border-white">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black mb-2 border border-white/30">
              <Sparkles size={14} className="text-yellow-300 animate-spin-slow" />
              <span>KHU VUI CHƠI TIẾNG ANH MẦM NON 3D</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2 flex items-center gap-2">
              <span>Trò Chơi Tiếng Anh Kỳ Diệu</span>
              <span className="text-3xl sm:text-4xl">🎮</span>
            </h2>
            <p className="text-sm sm:text-base text-indigo-100 font-medium max-w-2xl leading-relaxed">
              Học tiếng Anh qua các trò chơi tương tác đa giác quan: Lật thẻ siêu trí nhớ, Bắt bóng từ vựng, Bắn tên lửa ghép chữ Phonics và Thám tử hộp quà bí ẩn!
            </p>
          </div>

          {/* Star Counter Badge */}
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl border-2 border-amber-300 shadow-lg text-slate-800 shrink-0">
            <span className="text-3xl animate-bounce">⭐</span>
            <div>
              <div className="text-[11px] font-black text-amber-600 uppercase tracking-wider">Ngôi sao tích lũy</div>
              <div className="text-2xl font-black text-amber-500">{totalStars} <span className="text-xs font-bold text-slate-500">sao</span></div>
            </div>
          </div>
        </div>

        {/* Floating Background Sparkles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* ========================================================= */}
      {/* A. GAME MENU SELECTOR                                     */}
      {/* ========================================================= */}
      {selectedGame === 'menu' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Game 1: Memory Cards */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-3xl p-6 border-4 border-white shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-amber-200/40 to-yellow-100/10 rounded-bl-full pointer-events-none"></div>
            <div>
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform shadow-xs">
                🃏
              </div>
              <span className="text-xs font-black uppercase text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Trí nhớ & Quan sát
              </span>
              <h3 className="text-xl font-black text-slate-800 mt-2 mb-1">Lật Thẻ Ghép Đôi 3D</h3>
              <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">
                Lật các thẻ 3D để tìm cặp từ và hình tương ứng. Phát âm chuẩn bản xứ mỗi lần lật thẻ!
              </p>
            </div>
            <button type="button" onClick={() => startGame('memory')} className="btn-3d w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-sm shadow-md flex items-center justify-center gap-2">
              <Play size={16} /> Chơi Ngay
            </button>
          </motion.div>

          {/* Game 2: Balloon Pop */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-3xl p-6 border-4 border-white shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-sky-200/40 to-blue-100/10 rounded-bl-full pointer-events-none"></div>
            <div>
              <div className="w-16 h-16 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform shadow-xs">
                🎈
              </div>
              <span className="text-xs font-black uppercase text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                Nghe & Nhanh tay
              </span>
              <h3 className="text-xl font-black text-slate-800 mt-2 mb-1">Bắt Bóng Bay Từ Vựng</h3>
              <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">
                Lắng nghe giọng đọc tiếng Anh và nhanh tay chọc nổ quả bóng bay chứa hình ảnh đúng!
              </p>
            </div>
            <button type="button" onClick={() => startGame('balloon')} className="btn-3d w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-sm shadow-md flex items-center justify-center gap-2">
              <Play size={16} /> Chơi Ngay
            </button>
          </motion.div>

          {/* Game 3: Rocket Spelling */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-3xl p-6 border-4 border-white shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-rose-200/40 to-pink-100/10 rounded-bl-full pointer-events-none"></div>
            <div>
              <div className="w-16 h-16 rounded-2xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform shadow-xs">
                🚀
              </div>
              <span className="text-xs font-black uppercase text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Phonics & Ghép Chữ
              </span>
              <h3 className="text-xl font-black text-slate-800 mt-2 mb-1">Tên Lửa Ghép Chữ</h3>
              <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">
                Chạm từng khối chữ cái theo âm Phonics để tiếp nhiên liệu phóng tên lửa vào không gian!
              </p>
            </div>
            <button type="button" onClick={() => startGame('rocket')} className="btn-3d w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-sm shadow-md flex items-center justify-center gap-2">
              <Play size={16} /> Chơi Ngay
            </button>
          </motion.div>

          {/* Game 4: Mystery Box */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-3xl p-6 border-4 border-white shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-emerald-200/40 to-teal-100/10 rounded-bl-full pointer-events-none"></div>
            <div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform shadow-xs">
                🎁
              </div>
              <span className="text-xs font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Đố vui & Tư duy
              </span>
              <h3 className="text-xl font-black text-slate-800 mt-2 mb-1">Thám Tử Hộp Quà Ẩn</h3>
              <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">
                Nghe câu đố bí ẩn bằng tiếng Anh, suy nghĩ và mở hộp quà bất ngờ để khám phá đáp án!
              </p>
            </div>
            <button type="button" onClick={() => startGame('mystery')} className="btn-3d w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-md flex items-center justify-center gap-2">
              <Play size={16} /> Chơi Ngay
            </button>
          </motion.div>
        </div>
      )}

      {/* ========================================================= */}
      {/* B. GAME 1: 3D MEMORY MATCH                                */}
      {/* ========================================================= */}
      {selectedGame === 'memory' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-white shadow-xl">
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <button
              onClick={() => startGame('menu')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-colors"
            >
              <ArrowLeft size={16} /> Quay lại danh sách game
            </button>

            {/* Theme Selector */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {MEMORY_THEMES.map((thm, idx) => (
                <button
                  key={thm.id}
                  onClick={() => {
                    setMemoryThemeIndex(idx);
                    initMemoryGame(idx);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    memoryThemeIndex === idx
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{thm.icon}</span>
                  <span>{thm.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                Lượt lật: <strong className="text-indigo-600">{memoryMoves}</strong>
              </span>
              <button
                onClick={() => initMemoryGame()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs transition-colors border border-indigo-200"
              >
                <RotateCcw size={14} /> Chơi lại
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 max-w-4xl mx-auto my-6">
            {memoryCards.map((card, idx) => {
              const isRevealed = card.isFlipped || card.isMatched;

              return (
                <motion.div
                  key={card.uid}
                  whileHover={{ scale: isRevealed ? 1 : 1.05 }}
                  whileTap={{ scale: isRevealed ? 1 : 0.95 }}
                  onClick={() => handleCardClick(idx)}
                  className={`aspect-square rounded-2xl cursor-pointer select-none flex items-center justify-center p-2 text-center transition-all duration-300 border-3 ${
                    card.isMatched
                      ? 'bg-emerald-50 border-emerald-400 shadow-md scale-95 opacity-90'
                      : isRevealed
                        ? 'bg-white border-amber-400 shadow-lg'
                        : 'bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-500 border-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {isRevealed ? (
                    <div className="flex flex-col items-center justify-center">
                      {card.type === 'emoji' ? (
                        <span className="text-4xl sm:text-5xl">{card.emoji}</span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="text-sm sm:text-base font-black text-indigo-900 block leading-tight">{card.word}</span>
                          <span className="text-[10px] font-bold text-slate-500 block leading-tight">{card.meaning}</span>
                        </div>
                      )}
                      {card.isMatched && (
                        <span className="text-xs text-emerald-600 font-black mt-1">✔ Khớp!</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-white/90">
                      <span className="text-3xl">❓</span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-sky-100">Bé lật</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Victory Banner */}
          {isMemoryWon && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 rounded-3xl p-6 text-center text-white shadow-xl max-w-md mx-auto mt-6"
            >
              <div className="text-5xl mb-2">🏆 🎉</div>
              <h4 className="text-2xl font-black mb-1">Chúc Mừng Bé Xuất Sắc!</h4>
              <p className="text-sm font-bold text-amber-100 mb-4">
                Bé đã ghi nhớ và ghép đúng tất cả các thẻ với {memoryMoves} lượt lật! Bé nhận được +5 sao vàng ⭐
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => initMemoryGame()}
                  className="btn-3d px-6 py-2.5 rounded-xl bg-white text-amber-800 font-black text-sm shadow-md"
                >
                  Chơi Lại Vòng Này
                </button>
                <button
                  onClick={() => {
                    const nextIdx = (memoryThemeIndex + 1) % MEMORY_THEMES.length;
                    setMemoryThemeIndex(nextIdx);
                    initMemoryGame(nextIdx);
                  }}
                  className="btn-3d px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-sm shadow-md"
                >
                  Đổi Chủ Đề Tiếp Theo 🚀
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* C. GAME 2: BALLOON POP (BẮT BÓNG BAY TỪ VỰNG)             */}
      {/* ========================================================= */}
      {selectedGame === 'balloon' && targetBalloon && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-white shadow-xl relative overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <button
              onClick={() => startGame('menu')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-colors"
            >
              <ArrowLeft size={16} /> Quay lại danh sách game
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                <Star size={14} className="fill-amber-400 text-amber-500" /> Điểm: {balloonScore}
              </span>
              <span className="text-xs font-black text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
                Vòng: {balloonRound + 1} / 5
              </span>
            </div>
          </div>

          {/* Listening Prompt Banner */}
          <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 rounded-3xl p-6 text-center max-w-xl mx-auto mb-8 border-2 border-indigo-100 shadow-sm">
            <span className="text-xs font-black uppercase text-indigo-600 tracking-wider block mb-1">
              🎧 Bé Lắng Nghe & Tìm Quả Bóng:
            </span>
            <div className="text-3xl sm:text-4xl font-black text-indigo-950 my-2">
              "{targetBalloon.word}"
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <button
                onClick={() => speakEnglish(targetBalloon.word, 1.0)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 text-white font-black text-xs shadow-sm hover:bg-indigo-700 transition-colors"
              >
                <Volume2 size={16} /> Nghe chuẩn (1.0x)
              </button>
              <button
                onClick={() => speakEnglish(targetBalloon.word, 0.6)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500 text-white font-black text-xs shadow-sm hover:bg-amber-600 transition-colors"
              >
                <span>🐢</span> Nghe chậm (0.6x)
              </button>
            </div>
          </div>

          {/* Floating Balloons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto my-8">
            {balloonOptions.map((opt, idx) => {
              const isPopped = poppedIndex === idx;

              return (
                <motion.div
                  key={opt.word}
                  animate={isPopped ? { scale: [1, 1.3, 0], opacity: [1, 0.8, 0] } : { y: [0, -12, 0] }}
                  transition={isPopped ? { duration: 0.4 } : { repeat: Infinity, duration: 3 + idx * 0.5, ease: "easeInOut" }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBalloonClick(opt, idx)}
                  className="flex flex-col items-center cursor-pointer select-none"
                >
                  {/* Balloon Body */}
                  <div className={`w-32 h-40 rounded-full bg-gradient-to-b ${opt.color} p-4 shadow-xl flex flex-col items-center justify-center text-white relative border-3 border-white/60`}>
                    {/* Shiny 3D Highlight */}
                    <div className="absolute top-3 left-4 w-6 h-10 bg-white/35 rounded-full transform -rotate-25 blur-xs"></div>
                    <span className="text-5xl filter drop-shadow-md">{opt.emoji}</span>
                    <span className="text-sm font-black mt-2 drop-shadow-sm">{opt.word}</span>
                    {/* Balloon Knot & String */}
                    <div className="absolute -bottom-2 w-3 h-3 bg-slate-400 rounded-sm"></div>
                    <div className="absolute -bottom-8 w-0.5 h-6 bg-slate-300"></div>
                  </div>
                  <span className="text-xs font-black text-slate-600 mt-8 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    {opt.meaning}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Next Round Button */}
          {isBalloonRoundOver && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center mt-6"
            >
              <div className="text-emerald-700 font-black text-lg mb-3">
                🎉 Hoan hô bé đã bắt đúng quả bóng <strong className="text-indigo-700 font-black">{targetBalloon.word}</strong>! (+3 ⭐)
              </div>
              <button
                onClick={() => {
                  if (balloonRound < 4) {
                    initBalloonRound(balloonRound + 1);
                  } else {
                    fireConfetti();
                    initBalloonRound(0);
                  }
                }}
                className="btn-3d px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-base shadow-lg"
              >
                {balloonRound < 4 ? 'Chơi Vòng Tiếp Theo 🎈' : 'Hoàn Thành! Chơi Lượt Mới 🌟'}
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* D. GAME 3: PHONICS SPELLING ROCKET                        */}
      {/* ========================================================= */}
      {selectedGame === 'rocket' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-white shadow-xl relative overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <button
              onClick={() => startGame('menu')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-colors"
            >
              <ArrowLeft size={16} /> Quay lại danh sách game
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                Từ {rocketWordIndex + 1} / {ROCKET_WORDS.length}: {currentRocket.meaning}
              </span>
              <button
                onClick={() => initRocketGame(rocketWordIndex)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                title="Làm lại từ này"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Rocket Launchpad */}
          <div className="max-w-xl mx-auto text-center my-6">
            <motion.div
              animate={isRocketLaunched ? { y: -300, scale: 0.6, opacity: 0 } : { y: [0, -6, 0] }}
              transition={isRocketLaunched ? { duration: 1.2, ease: "easeIn" } : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="relative inline-block mb-4"
            >
              {/* 3D Rocket SVG / Graphic */}
              <div className="text-7xl sm:text-8xl filter drop-shadow-xl select-none">
                🚀
              </div>
              {isRocketLaunched && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-3xl animate-pulse">
                  🔥💨
                </div>
              )}
            </motion.div>

            {/* Target Clue & Word Meaning */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-5xl">{currentRocket.emoji}</span>
              <div className="text-left">
                <span className="text-xs font-black uppercase text-rose-500 tracking-wider block">Hãy ghép chữ:</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-800">{currentRocket.meaning} ({currentRocket.word})</span>
              </div>
              <button
                onClick={() => speakEnglish(currentRocket.word)}
                className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-200"
                title="Nghe phát âm"
              >
                <Volume2 size={20} />
              </button>
            </div>

            {/* Word Letter Slots */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8">
              {currentRocket.letters.map((targetL, idx) => {
                const filledL = placedLetters[idx];
                return (
                  <div
                    key={idx}
                    className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl border-4 flex flex-col items-center justify-center transition-all ${
                      filledL
                        ? 'bg-rose-500 border-rose-600 text-white shadow-lg scale-105'
                        : 'bg-slate-50 border-dashed border-slate-300 text-slate-300'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl font-black">{filledL || '_'}</span>
                    <span className="text-[10px] font-mono opacity-80">{currentRocket.phonics[idx] || ''}</span>
                  </div>
                );
              })}
            </div>

            {/* Scrambled Letter Blocks to Tap */}
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-200">
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider mb-4">
                👇 Bé chạm vào các khối chữ cái đúng thứ tự:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {scrambledLetters.map((l, idx) => (
                  <motion.button
                    key={`${l}-${idx}`}
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLetterTap(l, idx)}
                    className="w-14 h-16 sm:w-16 sm:h-18 rounded-2xl bg-gradient-to-b from-amber-400 to-orange-500 text-white font-black text-2xl sm:text-3xl border-2 border-amber-200 shadow-md hover:shadow-xl flex items-center justify-center transition-all cursor-pointer"
                  >
                    {l}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Launch Success & Next Word */}
            {isRocketLaunched && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-6"
              >
                <h4 className="text-2xl font-black text-rose-600 mb-2">
                  🎉 Tên Lửa Đã Phóng Thành Công! 🚀
                </h4>
                <p className="text-sm font-bold text-slate-600 mb-4">
                  Bé đã ghép đúng từ <strong className="text-rose-600 font-black">{currentRocket.word}</strong> ({currentRocket.meaning})! (+5 ⭐)
                </p>
                <button
                  onClick={() => initRocketGame((rocketWordIndex + 1) % ROCKET_WORDS.length)}
                  className="btn-3d px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-base shadow-lg"
                >
                  Ghép Từ Tiếp Theo 🚀
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* E. GAME 4: MYSTERY BOX DETECTIVE                          */}
      {/* ========================================================= */}
      {selectedGame === 'mystery' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-white shadow-xl relative overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <button
              onClick={() => startGame('menu')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-colors"
            >
              <ArrowLeft size={16} /> Quay lại danh sách game
            </button>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              Câu đố: {mysteryIndex + 1} / {MYSTERY_QUESTIONS.length}
            </span>
          </div>

          {/* Mystery Clue Box */}
          <div className="max-w-xl mx-auto text-center my-6">
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="text-8xl mb-4 inline-block select-none filter drop-shadow-lg"
            >
              {isMysteryAnswered ? currentMystery.answerEmoji : '🎁'}
            </motion.div>

            {/* Mystery Clue */}
            <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-200 mb-6 text-left relative">
              <span className="text-xs font-black uppercase text-emerald-700 tracking-wider block mb-1">
                🔍 Manh mối thám tử nhí:
              </span>
              <p className="text-lg sm:text-xl font-black text-emerald-950 mb-2">
                "{currentMystery.clueEnglish}"
              </p>
              <p className="text-sm font-bold text-slate-700">
                👉 {currentMystery.clueVietnamese}
              </p>

              <button
                onClick={() => speakEnglish(currentMystery.clueEnglish)}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white font-black text-xs shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <Volume2 size={14} /> Nghe đọc manh mối
              </button>
            </div>

            {/* 3 Option Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {currentMystery.options.map(opt => {
                const isSelected = mysterySelectedOpt === opt.word;
                const isCorrect = opt.word === currentMystery.answer;

                return (
                  <motion.button
                    key={opt.word}
                    whileHover={{ scale: isMysteryAnswered ? 1 : 1.05 }}
                    whileTap={{ scale: isMysteryAnswered ? 1 : 0.95 }}
                    onClick={() => handleMysteryChoice(opt.word)}
                    disabled={isMysteryAnswered}
                    className={`p-6 rounded-3xl border-4 text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                      isMysteryAnswered
                        ? isCorrect
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-950 shadow-lg scale-105'
                          : isSelected
                            ? 'bg-rose-100 border-rose-500 text-rose-950'
                            : 'bg-slate-50 border-slate-200 opacity-40'
                        : 'bg-white hover:bg-emerald-50 border-slate-100 hover:border-emerald-300 shadow-md'
                    }`}
                  >
                    <span className="text-5xl">{opt.emoji}</span>
                    <span className="text-lg font-black">{opt.word}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Answer Result */}
            {isMysteryAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                {mysterySelectedOpt === currentMystery.answer ? (
                  <div className="text-emerald-700 font-black text-lg mb-4">
                    🎉 Hoan hô thám tử nhí! Hộp quà đã mở ra bạn <strong>{currentMystery.answer}</strong> ({currentMystery.answerEmoji})! (+3 ⭐)
                  </div>
                ) : (
                  <div className="text-amber-800 font-bold text-sm mb-4">
                    Gần đúng rồi! Đáp án của hộp quà bí mật là <strong>{currentMystery.answer}</strong> ({currentMystery.answerEmoji})!
                  </div>
                )}

                <button
                  onClick={() => initMysteryGame((mysteryIndex + 1) % MYSTERY_QUESTIONS.length)}
                  className="btn-3d px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-base shadow-lg"
                >
                  Câu Đố Tiếp Theo 🔍
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
import { useDeviceDocument } from '../lib/useDeviceDocument';
