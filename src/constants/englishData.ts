export { TEACHER_THEMATIC_TOPICS, type TeacherThematicTopic } from './teacherThematicData';

export interface EnglishWord {
  id: string;
  word: string;
  phonetic: string;
  vietnamesePronunciation?: string; // Phiên âm bồi cho người Việt
  meaning: string;
  emoji: string;
  category: string;
  exampleSentence?: string;
  exampleMeaning?: string;
  audioUrl?: string;
}

export interface EnglishSong {
  id: string;
  title: string;
  englishTitle: string;
  duration?: string;
  videoId?: string;
  lyricsSnippet: string;
  theme: string;
  emoji: string;
}

export type EnglishThemeCategory = 
  | 'kindergarten'
  | 'family'
  | 'jobs'
  | 'spring'
  | 'plants'
  | 'vehicles'
  | 'colors'
  | 'animals'
  | 'other';

export const CORE_ENGLISH_TOPICS = [
  { id: 'all', name: 'Tất cả chủ đề', icon: '✨' },
  { id: 'kindergarten', name: 'Trường mầm non', icon: '🏫' },
  { id: 'family', name: 'Gia đình', icon: '👨‍👩‍👧' },
  { id: 'jobs', name: 'Nghề nghiệp', icon: '👩‍⚕️' },
  { id: 'spring', name: 'Mùa xuân & Tết', icon: '🌸' },
  { id: 'plants', name: 'Thực vật & Cây hoa', icon: '🌿' },
  { id: 'vehicles', name: 'Phương tiện giao thông', icon: '🚗' },
  { id: 'colors', name: 'Màu sắc rực rỡ', icon: '🎨' },
  { id: 'animals', name: 'Động vật muôn loài', icon: '🦁' },
] as const;

export interface EnglishLessonTheme {
  id: string;
  categoryKey?: EnglishThemeCategory;
  name: string;
  englishName: string;
  icon: string;
  color: string;
  bgLight: string;
  textColor: string;
  description: string;
  vocabulary: EnglishWord[];
  samplePhrases?: {
    phrase: string;
    phonetic: string;
    vietnamese: string;
    speaker?: string;
  }[];
  interactiveGame: {
    title: string;
    type: 'listen-pick' | 'word-match' | 'action-command' | 'fill-blank';
    questions: {
      id: string;
      prompt: string;
      englishAudioPrompt?: string;
      options: {
        id: string;
        text: string;
        emoji?: string;
      }[];
      correctId: string;
      hint?: string;
    }[];
  };
}

export interface TeacherClassroomPhrase {
  id: string;
  category: 'classroom-management' | 'daily-routine' | 'praise-encourage' | 'parent-comm' | 'activity-guide';
  english: string;
  phonetic: string;
  vietnamesePhonetic: string; // Phiên âm bồi dễ đọc cho cô
  vietnamese: string;
  situation: string;
  audioKeyword?: string;
  tip?: string;
}

export interface TeacherActivityTopic {
  id: string;
  activityType: 'music' | 'art' | 'storytelling' | 'discovery' | 'physical' | 'event';
  title: string;
  englishTitle: string;
  icon: string;
  introductionScript: string;
  introductionTranslation: string;
  keyVocabulary: {
    word: string;
    phonetic: string;
    meaning: string;
  }[];
  teacherPrompts: {
    english: string;
    phonetic: string;
    vietnamese: string;
  }[];
  sampleDialogue: {
    speaker: 'Teacher' | 'Children';
    text: string;
    phonetic?: string;
    translation: string;
  }[];
  pedagogicalTip: string;
}

export interface TeacherLearningLevel {
  levelNumber: number;
  levelTitle: string;
  badge: string;
  description: string;
  lessons: {
    id: string;
    title: string;
    target: string;
    vocabulary: {
      word: string;
      phonetic: string;
      vietnamesePhonetic: string;
      meaning: string;
    }[];
    dialogue: {
      speaker: string;
      en: string;
      vi: string;
    }[];
    practicalExercise: {
      situation: string;
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    };
  }[];
}

// ==========================================
// I. DÀNH CHO TRẺ 3 - 4 TUỔI (Bé làm quen)
// ==========================================
export const ENGLISH_DATA_3_4: EnglishLessonTheme[] = [
  {
    id: 'greetings-34',
    name: 'Chào hỏi lễ phép',
    englishName: 'Greetings',
    icon: '👋',
    color: 'from-amber-400 to-orange-400',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-800',
    description: 'Bé học chào Hello, tạm biệt Goodbye cùng cô và bạn bè',
    vocabulary: [
      { id: 'w-hello', word: 'Hello', phonetic: '/həˈləʊ/', vietnamesePronunciation: 'Hơ-lâu', meaning: 'Xin chào', emoji: '👋', category: 'greetings', exampleSentence: 'Hello teacher!', exampleMeaning: 'Xin chào cô giáo!' },
      { id: 'w-goodbye', word: 'Goodbye', phonetic: '/ɡʊdˈbaɪ/', vietnamesePronunciation: 'Gút-bai', meaning: 'Tạm biệt', emoji: '🙋‍♂️', category: 'greetings', exampleSentence: 'Goodbye friends!', exampleMeaning: 'Tạm biệt các bạn!' },
      { id: 'w-goodmorning', word: 'Good morning', phonetic: '/ɡʊd ˈmɔːnɪŋ/', vietnamesePronunciation: 'Gút mo-ninh', meaning: 'Chào buổi sáng', emoji: '🌅', category: 'greetings', exampleSentence: 'Good morning Mom!', exampleMeaning: 'Chào buổi sáng mẹ yêu!' },
      { id: 'w-thankyou', word: 'Thank you', phonetic: '/ˈθæŋk juː/', vietnamesePronunciation: 'Thenh-khiu', meaning: 'Cảm ơn', emoji: '🙏', category: 'greetings', exampleSentence: 'Thank you teacher!', exampleMeaning: 'Con cảm ơn cô!' },
    ],
    samplePhrases: [
      { phrase: 'Hello!', phonetic: '/həˈləʊ/', vietnamese: 'Xin chào!', speaker: 'Bé & Cô' },
      { phrase: 'Goodbye!', phonetic: '/ɡʊdˈbaɪ/', vietnamese: 'Tạm biệt!', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé nghe và chọn lời chào đúng',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-g-1',
          prompt: 'Khi gặp cô giáo vào buổi sáng, bé chào như thế nào?',
          englishAudioPrompt: 'Hello',
          options: [
            { id: 'a', text: 'Hello 👋', emoji: '👋' },
            { id: 'b', text: 'Goodbye 🏃', emoji: '🏃' },
          ],
          correctId: 'a',
          hint: 'Bé nói Hello để chào nhé!'
        },
        {
          id: 'q-g-2',
          prompt: 'Khi tan học về nhà, bé nói gì với các bạn?',
          englishAudioPrompt: 'Goodbye',
          options: [
            { id: 'a', text: 'Goodbye 👋', emoji: '👋' },
            { id: 'b', text: 'Hello 🙋', emoji: '🙋' },
          ],
          correctId: 'a',
          hint: 'Goodbye là tạm biệt đó bé!'
        }
      ]
    }
  },
  {
    id: 'self-34',
    name: 'Bản thân & Cảm xúc',
    englishName: 'About Me',
    icon: '👦',
    color: 'from-sky-400 to-blue-500',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-800',
    description: 'Bé nhận biết boy, girl và cảm xúc vui vẻ, buồn bã',
    vocabulary: [
      { id: 'w-boy', word: 'Boy', phonetic: '/bɔɪ/', vietnamesePronunciation: 'Boi', meaning: 'Bạn trai / Bé trai', emoji: '👦', category: 'self', exampleSentence: 'I am a boy.', exampleMeaning: 'Tớ là bạn trai.' },
      { id: 'w-girl', word: 'Girl', phonetic: '/ɡɜːl/', vietnamesePronunciation: 'Gơ-l', meaning: 'Bạn gái / Bé gái', emoji: '👧', category: 'self', exampleSentence: 'I am a girl.', exampleMeaning: 'Tớ là bạn gái.' },
      { id: 'w-happy', word: 'Happy', phonetic: '/ˈhæpi/', vietnamesePronunciation: 'Hép-pi', meaning: 'Vui vẻ', emoji: '😊', category: 'self', exampleSentence: 'I am happy!', exampleMeaning: 'Con rất vui vẻ!' },
      { id: 'w-sad', word: 'Sad', phonetic: '/sæd/', vietnamesePronunciation: 'Set-đ', meaning: 'Buồn bã', emoji: '😢', category: 'self', exampleSentence: 'Don\'t be sad.', exampleMeaning: 'Đừng buồn nhé.' },
    ],
    interactiveGame: {
      title: 'Bé chạm đúng cảm xúc',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-s-1',
          prompt: 'Từ nào có nghĩa là "Vui vẻ" nhỉ bé ơi?',
          englishAudioPrompt: 'Happy',
          options: [
            { id: 'a', text: 'Happy 😊', emoji: '😊' },
            { id: 'b', text: 'Sad 😢', emoji: '😢' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-s-2',
          prompt: 'Bạn gái tiếng Anh nói là gì nhỉ?',
          englishAudioPrompt: 'Girl',
          options: [
            { id: 'a', text: 'Boy 👦', emoji: '👦' },
            { id: 'b', text: 'Girl 👧', emoji: '👧' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'family-34',
    categoryKey: 'family',
    name: 'Gia đình yêu thương',
    englishName: 'My Family',
    icon: '👨‍👩‍👧',
    color: 'from-pink-400 to-rose-500',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-800',
    description: 'Mom, Dad, Baby - những người thân yêu nhất của bé',
    vocabulary: [
      { id: 'w-mom', word: 'Mom', phonetic: '/mɒm/', vietnamesePronunciation: 'Măm', meaning: 'Mẹ yêu', emoji: '👩', category: 'family', exampleSentence: 'I love Mom.', exampleMeaning: 'Con yêu mẹ.' },
      { id: 'w-dad', word: 'Dad', phonetic: '/dæd/', vietnamesePronunciation: 'Đét', meaning: 'Bố yêu', emoji: '👨', category: 'family', exampleSentence: 'I love Dad.', exampleMeaning: 'Con yêu bố.' },
      { id: 'w-baby', word: 'Baby', phonetic: '/ˈbeɪbi/', vietnamesePronunciation: 'Bây-bi', meaning: 'Em bé', emoji: '👶', category: 'family', exampleSentence: 'Cute baby!', exampleMeaning: 'Em bé thật đáng yêu!' },
    ],
    interactiveGame: {
      title: 'Bé tìm người thân trong gia đình',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-f-1',
          prompt: 'Tiếng Anh gọi Mẹ là gì?',
          englishAudioPrompt: 'Mom',
          options: [
            { id: 'a', text: 'Mom 👩', emoji: '👩' },
            { id: 'b', text: 'Dad 👨', emoji: '👨' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-f-2',
          prompt: 'Tiếng Anh gọi Bố là gì?',
          englishAudioPrompt: 'Dad',
          options: [
            { id: 'a', text: 'Dad 👨', emoji: '👨' },
            { id: 'b', text: 'Baby 👶', emoji: '👶' },
          ],
          correctId: 'a',
        }
      ]
    }
  },
  {
    id: 'school-34',
    categoryKey: 'kindergarten',
    name: 'Trường mầm non thân yêu',
    englishName: 'My Kindergarten',
    icon: '🏫',
    color: 'from-emerald-400 to-teal-500',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    description: 'Teacher, Friend, School, Classroom',
    vocabulary: [
      { id: 'w-teacher', word: 'Teacher', phonetic: '/ˈtiːtʃər/', vietnamesePronunciation: 'Tít-chơ', meaning: 'Cô giáo', emoji: '👩‍🏫', category: 'school', exampleSentence: 'Good morning teacher!', exampleMeaning: 'Chào buổi sáng cô giáo!' },
      { id: 'w-friend', word: 'Friend', phonetic: '/frɛnd/', vietnamesePronunciation: 'Phren-đ', meaning: 'Bạn bè', emoji: '👫', category: 'school', exampleSentence: 'My best friend.', exampleMeaning: 'Bạn thân của tớ.' },
      { id: 'w-school', word: 'School', phonetic: '/skuːl/', vietnamesePronunciation: 'X-cun', meaning: 'Trường học', emoji: '🏫', category: 'school', exampleSentence: 'I go to school.', exampleMeaning: 'Bé đi đến trường.' },
      { id: 'w-classroom', word: 'Classroom', phonetic: '/ˈklɑːsruːm/', vietnamesePronunciation: 'Kla-xrum', meaning: 'Lớp học', emoji: '🚪', category: 'school', exampleSentence: 'Nice classroom!', exampleMeaning: 'Lớp học thật đẹp!' },
    ],
    interactiveGame: {
      title: 'Bé nhận biết trường lớp',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-sc-1',
          prompt: 'Cô giáo tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Teacher',
          options: [
            { id: 'a', text: 'Teacher 👩‍🏫', emoji: '👩‍🏫' },
            { id: 'b', text: 'Friend 👫', emoji: '👫' },
          ],
          correctId: 'a',
        }
      ]
    }
  },
  {
    id: 'colors-34',
    categoryKey: 'colors',
    name: 'Sắc màu rực rỡ',
    englishName: 'Colors',
    icon: '🎨',
    color: 'from-purple-400 to-indigo-500',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-800',
    description: 'Red, Yellow, Blue, Green - 4 màu sắc cơ bản bé yêu',
    vocabulary: [
      { id: 'w-red', word: 'Red', phonetic: '/rɛd/', vietnamesePronunciation: 'Rét', meaning: 'Màu đỏ', emoji: '🔴', category: 'colors', exampleSentence: 'A red apple.', exampleMeaning: 'Quả táo màu đỏ.' },
      { id: 'w-yellow', word: 'Yellow', phonetic: '/ˈjɛləʊ/', vietnamesePronunciation: 'De-lâu', meaning: 'Màu vàng', emoji: '🟡', category: 'colors', exampleSentence: 'Yellow sun.', exampleMeaning: 'Mặt trời màu vàng.' },
      { id: 'w-blue', word: 'Blue', phonetic: '/bluː/', vietnamesePronunciation: 'B-lu', meaning: 'Màu xanh dương', emoji: '🔵', category: 'colors', exampleSentence: 'Blue sky.', exampleMeaning: 'Bầu trời xanh.' },
      { id: 'w-green', word: 'Green', phonetic: '/ɡriːn/', vietnamesePronunciation: 'Grin', meaning: 'Màu xanh lá', emoji: '🟢', category: 'colors', exampleSentence: 'Green leaf.', exampleMeaning: 'Chiếc lá xanh.' },
    ],
    interactiveGame: {
      title: 'Bé chọn đúng màu sắc',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-c-1',
          prompt: 'Màu đỏ tiếng Anh là gì nhỉ?',
          englishAudioPrompt: 'Red',
          options: [
            { id: 'a', text: 'Red 🔴', emoji: '🔴' },
            { id: 'b', text: 'Blue 🔵', emoji: '🔵' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-c-2',
          prompt: 'Màu vàng tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Yellow',
          options: [
            { id: 'a', text: 'Green 🟢', emoji: '🟢' },
            { id: 'b', text: 'Yellow 🟡', emoji: '🟡' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'numbers-34',
    name: 'Bé đếm số 1 đến 5',
    englishName: 'Numbers 1 to 5',
    icon: '🔢',
    color: 'from-amber-400 to-yellow-500',
    bgLight: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    description: 'One, Two, Three, Four, Five',
    vocabulary: [
      { id: 'w-one', word: 'One', phonetic: '/wʌn/', vietnamesePronunciation: 'Oăn', meaning: 'Số 1', emoji: '1️⃣', category: 'numbers', exampleSentence: 'One nose.', exampleMeaning: 'Một cái mũi.' },
      { id: 'w-two', word: 'Two', phonetic: '/tuː/', vietnamesePronunciation: 'Tu', meaning: 'Số 2', emoji: '2️⃣', category: 'numbers', exampleSentence: 'Two eyes.', exampleMeaning: 'Hai con mắt.' },
      { id: 'w-three', word: 'Three', phonetic: '/θriː/', vietnamesePronunciation: 'T-ri', meaning: 'Số 3', emoji: '3️⃣', category: 'numbers', exampleSentence: 'Three stars.', exampleMeaning: 'Ba ngôi sao.' },
      { id: 'w-four', word: 'Four', phonetic: '/fɔː/', vietnamesePronunciation: 'Pho', meaning: 'Số 4', emoji: '4️⃣', category: 'numbers', exampleSentence: 'Four chairs.', exampleMeaning: 'Bốn cái ghế.' },
      { id: 'w-five', word: 'Five', phonetic: '/faɪv/', vietnamesePronunciation: 'Phai-v', meaning: 'Số 5', emoji: '5️⃣', category: 'numbers', exampleSentence: 'High five!', exampleMeaning: 'Đập tay năm ngón nào!' },
    ],
    interactiveGame: {
      title: 'Bé đếm số ngón tay',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-num-1',
          prompt: 'Số 1 tiếng Anh đọc là gì?',
          englishAudioPrompt: 'One',
          options: [
            { id: 'a', text: 'One 1️⃣', emoji: '1️⃣' },
            { id: 'b', text: 'Two 2️⃣', emoji: '2️⃣' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-num-2',
          prompt: 'Đập tay 5 ngón! Số 5 tiếng Anh là gì?',
          englishAudioPrompt: 'Five',
          options: [
            { id: 'a', text: 'Three 3️⃣', emoji: '3️⃣' },
            { id: 'b', text: 'Five 5️⃣', emoji: '5️⃣' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'animals-34',
    categoryKey: 'animals',
    name: 'Những con vật đáng yêu',
    englishName: 'Animals',
    icon: '🐶',
    color: 'from-orange-400 to-amber-500',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-800',
    description: 'Cat, Dog, Bird, Fish - những bạn nhỏ thân quen',
    vocabulary: [
      { id: 'w-cat', word: 'Cat', phonetic: '/kæt/', vietnamesePronunciation: 'Két', meaning: 'Con mèo', emoji: '🐱', category: 'animals', exampleSentence: 'The cat says meow.', exampleMeaning: 'Mèo kêu meo meo.' },
      { id: 'w-dog', word: 'Dog', phonetic: '/dɒɡ/', vietnamesePronunciation: 'Đót-g', meaning: 'Con chó', emoji: '🐶', category: 'animals', exampleSentence: 'The dog barks woof.', exampleMeaning: 'Chó sủa gâu gâu.' },
      { id: 'w-bird', word: 'Bird', phonetic: '/bɜːd/', vietnamesePronunciation: 'Bớt-đ', meaning: 'Con chim', emoji: '🐦', category: 'animals', exampleSentence: 'The bird can fly.', exampleMeaning: 'Chim biết bay.' },
      { id: 'w-fish', word: 'Fish', phonetic: '/fɪʃ/', vietnamesePronunciation: 'Phít-sh', meaning: 'Con cá', emoji: '🐟', category: 'animals', exampleSentence: 'Fish can swim.', exampleMeaning: 'Cá biết bơi.' },
    ],
    interactiveGame: {
      title: 'Bé nghe tiếng đoán con vật',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-an-1',
          prompt: 'Con mèo tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Cat',
          options: [
            { id: 'a', text: 'Cat 🐱', emoji: '🐱' },
            { id: 'b', text: 'Dog 🐶', emoji: '🐶' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-an-2',
          prompt: 'Con cá biết bơi tiếng Anh là gì?',
          englishAudioPrompt: 'Fish',
          options: [
            { id: 'a', text: 'Bird 🐦', emoji: '🐦' },
            { id: 'b', text: 'Fish 🐟', emoji: '🐟' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'toys-34',
    name: 'Đồ chơi của bé',
    englishName: 'My Toys',
    icon: '🧸',
    color: 'from-pink-400 to-purple-400',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-800',
    description: 'Ball, Doll, Car, Teddy bear',
    vocabulary: [
      { id: 'w-ball', word: 'Ball', phonetic: '/bɔːl/', vietnamesePronunciation: 'Bo-l', meaning: 'Quả bóng', emoji: '⚽', category: 'toys', exampleSentence: 'Kick the ball.', exampleMeaning: 'Đá quả bóng.' },
      { id: 'w-doll', word: 'Doll', phonetic: '/dɒl/', vietnamesePronunciation: 'Đo-l', meaning: 'Búp bê', emoji: '🪆', category: 'toys', exampleSentence: 'Pretty doll.', exampleMeaning: 'Búp bê xinh xắn.' },
      { id: 'w-car', word: 'Car', phonetic: '/kɑːr/', vietnamesePronunciation: 'Ca', meaning: 'Ô tô đồ chơi', emoji: '🚗', category: 'toys', exampleSentence: 'Fast car.', exampleMeaning: 'Chiếc ô tô chạy nhanh.' },
      { id: 'w-teddy', word: 'Teddy bear', phonetic: '/ˈtɛdi beər/', vietnamesePronunciation: 'Te-đi be', meaning: 'Gấu bông', emoji: '🧸', category: 'toys', exampleSentence: 'Soft teddy bear.', exampleMeaning: 'Chú gấu bông êm ái.' },
    ],
    interactiveGame: {
      title: 'Bé nhận biết đồ chơi',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-ty-1',
          prompt: 'Quả bóng tròn tiếng Anh là gì?',
          englishAudioPrompt: 'Ball',
          options: [
            { id: 'a', text: 'Ball ⚽', emoji: '⚽' },
            { id: 'b', text: 'Car 🚗', emoji: '🚗' },
          ],
          correctId: 'a',
        }
      ]
    }
  },
  {
    id: 'body-34',
    name: 'Bộ phận cơ thể',
    englishName: 'My Body',
    icon: '👀',
    color: 'from-rose-400 to-red-500',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-800',
    description: 'Head, Eyes, Ears, Nose, Mouth',
    vocabulary: [
      { id: 'w-head', word: 'Head', phonetic: '/hɛd/', vietnamesePronunciation: 'Hét-đ', meaning: 'Cái đầu', emoji: '👶', category: 'body', exampleSentence: 'Touch your head.', exampleMeaning: 'Chạm vào đầu nào.' },
      { id: 'w-eyes', word: 'Eyes', phonetic: '/aɪz/', vietnamesePronunciation: 'Ai-z', meaning: 'Đôi mắt', emoji: '👀', category: 'body', exampleSentence: 'Close your eyes.', exampleMeaning: 'Nhắm mắt lại.' },
      { id: 'w-ears', word: 'Ears', phonetic: '/ɪərz/', vietnamesePronunciation: 'I-ơ-z', meaning: 'Đôi tai', emoji: '👂', category: 'body', exampleSentence: 'Listen with ears.', exampleMeaning: 'Lắng nghe bằng tai.' },
      { id: 'w-nose', word: 'Nose', phonetic: '/nəʊz/', vietnamesePronunciation: 'Nâu-z', meaning: 'Cái mũi', emoji: '👃', category: 'body', exampleSentence: 'Touch your nose.', exampleMeaning: 'Chạm vào mũi bé nào.' },
      { id: 'w-mouth', word: 'Mouth', phonetic: '/maʊθ/', vietnamesePronunciation: 'Mau-th', meaning: 'Cái miệng', emoji: '👄', category: 'body', exampleSentence: 'Open your mouth.', exampleMeaning: 'Mở miệng cười xinh nào.' },
    ],
    interactiveGame: {
      title: 'Bé chạm đúng bộ phận cơ thể',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-bd-1',
          prompt: 'Đôi mắt tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Eyes',
          options: [
            { id: 'a', text: 'Eyes 👀', emoji: '👀' },
            { id: 'b', text: 'Nose 👃', emoji: '👃' },
          ],
          correctId: 'a',
        }
      ]
    }
  },
  {
    id: 'food-34',
    name: 'Hoa quả & Món ngon',
    englishName: 'Food & Fruits',
    icon: '🍎',
    color: 'from-emerald-400 to-green-500',
    bgLight: 'bg-green-50',
    textColor: 'text-green-800',
    description: 'Apple, Banana, Milk, Bread',
    vocabulary: [
      { id: 'w-apple', word: 'Apple', phonetic: '/ˈæpl/', vietnamesePronunciation: 'Ép-pồ', meaning: 'Quả táo', emoji: '🍎', category: 'food', exampleSentence: 'Red apple.', exampleMeaning: 'Quả táo đỏ.' },
      { id: 'w-banana', word: 'Banana', phonetic: '/bəˈnɑːnə/', vietnamesePronunciation: 'Bơ-na-nơ', meaning: 'Quả chuối', emoji: '🍌', category: 'food', exampleSentence: 'Yellow banana.', exampleMeaning: 'Quả chuối vàng.' },
      { id: 'w-milk', word: 'Milk', phonetic: '/mɪlk/', vietnamesePronunciation: 'Mi-u-k', meaning: 'Sữa tươi', emoji: '🥛', category: 'food', exampleSentence: 'Drink milk.', exampleMeaning: 'Uống sữa bổ dưỡng.' },
      { id: 'w-bread', word: 'Bread', phonetic: '/brɛd/', vietnamesePronunciation: 'Brét', meaning: 'Bánh mì', emoji: '🍞', category: 'food', exampleSentence: 'Yummy bread.', exampleMeaning: 'Bánh mì thơm ngon.' },
    ],
    interactiveGame: {
      title: 'Bé nhận biết món ăn',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-fd-1',
          prompt: 'Quả táo tiếng Anh là gì?',
          englishAudioPrompt: 'Apple',
          options: [
            { id: 'a', text: 'Apple 🍎', emoji: '🍎' },
            { id: 'b', text: 'Banana 🍌', emoji: '🍌' },
          ],
          correctId: 'a',
        }
      ]
    }
  },
  {
    id: 'jobs-34',
    categoryKey: 'jobs',
    name: 'Nghề nghiệp quen thuộc',
    englishName: 'Everyday Jobs',
    icon: '👩‍⚕️',
    color: 'from-blue-400 to-cyan-500',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-800',
    description: 'Teacher, Doctor, Police, Chef, Driver - các bác các cô làm việc tốt',
    vocabulary: [
      { id: 'w-job-teacher-34', word: 'Teacher', phonetic: '/ˈtiːtʃər/', vietnamesePronunciation: 'Tít-chơ', meaning: 'Cô giáo dạy bé', emoji: '👩‍🏫', category: 'jobs', exampleSentence: 'I love my teacher.', exampleMeaning: 'Con yêu cô giáo.' },
      { id: 'w-job-doctor-34', word: 'Doctor', phonetic: '/ˈdɒktər/', vietnamesePronunciation: 'Đóc-tơ', meaning: 'Bác sĩ chữa bệnh', emoji: '👩‍⚕️', category: 'jobs', exampleSentence: 'The doctor helps me.', exampleMeaning: 'Bác sĩ chăm sóc sức khỏe cho bé.' },
      { id: 'w-job-police-34', word: 'Police', phonetic: '/pəˈliːs/', vietnamesePronunciation: 'Pơ-lít', meaning: 'Chú công an bảo vệ', emoji: '👮', category: 'jobs', exampleSentence: 'Brave police.', exampleMeaning: 'Chú công an dũng cảm.' },
      { id: 'w-job-chef-34', word: 'Chef', phonetic: '/ʃɛf/', vietnamesePronunciation: 'Sếp', meaning: 'Đầu bếp nấu ăn ngon', emoji: '👨‍🍳', category: 'jobs', exampleSentence: 'Chef cooks yummy soup.', exampleMeaning: 'Đầu bếp nấu món súp ngon.' },
      { id: 'w-job-driver-34', word: 'Driver', phonetic: '/ˈdraɪvər/', vietnamesePronunciation: 'Đrai-vơ', meaning: 'Bác tài xế lái xe', emoji: '🚌', category: 'jobs', exampleSentence: 'The bus driver.', exampleMeaning: 'Bác tài xế xe buýt.' },
    ],
    samplePhrases: [
      { phrase: 'She is a teacher.', phonetic: '/ʃiː ɪz ə ˈtiːtʃər/', vietnamese: 'Cô ấy là cô giáo.', speaker: 'Bé & Cô' },
      { phrase: 'He is a doctor.', phonetic: '/hiː ɪz ə ˈdɒktər/', vietnamese: 'Chú ấy là bác sĩ.', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé nhận biết nghề nghiệp',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-j34-1',
          prompt: 'Bác sĩ chữa bệnh tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Doctor',
          options: [
            { id: 'a', text: 'Doctor 👩‍⚕️', emoji: '👩‍⚕️' },
            { id: 'b', text: 'Chef 👨‍🍳', emoji: '👨‍🍳' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-j34-2',
          prompt: 'Cô giáo dạy học tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Teacher',
          options: [
            { id: 'a', text: 'Teacher 👩‍🏫', emoji: '👩‍🏫' },
            { id: 'b', text: 'Police 👮', emoji: '👮' },
          ],
          correctId: 'a',
        }
      ]
    }
  },
  {
    id: 'spring-34',
    categoryKey: 'spring',
    name: 'Mùa xuân & Ngày Tết',
    englishName: 'Spring & Tet Holiday',
    icon: '🌸',
    color: 'from-pink-400 to-rose-500',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-800',
    description: 'Spring, Flower, Peach blossom, Lucky money - bé vui đón Tết',
    vocabulary: [
      { id: 'w-spring-34', word: 'Spring', phonetic: '/sprɪŋ/', vietnamesePronunciation: 'S-pring', meaning: 'Mùa xuân ấm áp', emoji: '🌸', category: 'spring', exampleSentence: 'Spring is here!', exampleMeaning: 'Mùa xuân đã đến rồi!' },
      { id: 'w-flower-34', word: 'Flower', phonetic: '/ˈflaʊər/', vietnamesePronunciation: 'P-lao-ơ', meaning: 'Bông hoa khoe sắc', emoji: '🌺', category: 'spring', exampleSentence: 'Pretty flower.', exampleMeaning: 'Bông hoa xinh đẹp.' },
      { id: 'w-peach-34', word: 'Peach blossom', phonetic: '/piːtʃ ˈblɒsəm/', vietnamesePronunciation: 'Pít-ch b-lo-xừm', meaning: 'Hoa đào ngày Tết', emoji: '🌸', category: 'spring', exampleSentence: 'Pink peach blossom.', exampleMeaning: 'Hoa đào màu hồng thắm.' },
      { id: 'w-lucky-34', word: 'Lucky money', phonetic: '/ˈlʌki ˈmʌni/', vietnamesePronunciation: 'Lắc-ki mă-ni', meaning: 'Tiền lì xì may mắn', emoji: '🧧', category: 'spring', exampleSentence: 'Red lucky money envelope.', exampleMeaning: 'Bao lì xì đỏ chúc may mắn.' },
      { id: 'w-sun-34', word: 'Warm sun', phonetic: '/wɔːm sʌn/', vietnamesePronunciation: 'Oam xăn', meaning: 'Nắng ấm mùa xuân', emoji: '☀️', category: 'spring', exampleSentence: 'The sun shines bright.', exampleMeaning: 'Mặt trời tỏa nắng chan hòa.' },
    ],
    samplePhrases: [
      { phrase: 'Happy New Year!', phonetic: '/ˈhæpi njuː jɪər/', vietnamese: 'Chúc mừng năm mới!', speaker: 'Bé & Cô' },
      { phrase: 'Spring is coming!', phonetic: '/sprɪŋ ɪz ˈkʌmɪŋ/', vietnamese: 'Mùa xuân đang về!', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé khám phá sắc xuân',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-sp34-1',
          prompt: 'Mùa xuân tiếng Anh đọc là gì bé ơi?',
          englishAudioPrompt: 'Spring',
          options: [
            { id: 'a', text: 'Spring 🌸', emoji: '🌸' },
            { id: 'b', text: 'Sun ☀️', emoji: '☀️' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-sp34-2',
          prompt: 'Bao lì xì may mắn tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Lucky money',
          options: [
            { id: 'a', text: 'Lucky money 🧧', emoji: '🧧' },
            { id: 'b', text: 'Flower 🌺', emoji: '🌺' },
          ],
          correctId: 'a',
        }
      ]
    }
  },
  {
    id: 'plants-34',
    categoryKey: 'plants',
    name: 'Cây xanh & Hoa lá',
    englishName: 'Plants & Flowers',
    icon: '🌿',
    color: 'from-emerald-400 to-green-500',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    description: 'Tree, Leaf, Flower, Grass, Seed - thế giới thực vật tươi mát',
    vocabulary: [
      { id: 'w-tree-34', word: 'Tree', phonetic: '/triː/', vietnamesePronunciation: 'T-ri', meaning: 'Cây xanh bóng mát', emoji: '🌳', category: 'plants', exampleSentence: 'A big green tree.', exampleMeaning: 'Một cây to màu xanh.' },
      { id: 'w-leaf-34', word: 'Leaf', phonetic: '/liːf/', vietnamesePronunciation: 'Líp-ph', meaning: 'Chiếc lá nhỏ', emoji: '🍃', category: 'plants', exampleSentence: 'Green leaf dances.', exampleMeaning: 'Chiếc lá xanh đung đưa.' },
      { id: 'w-flower-pl-34', word: 'Flower', phonetic: '/ˈflaʊər/', vietnamesePronunciation: 'P-lao-ơ', meaning: 'Bông hoa thơm ngát', emoji: '🌼', category: 'plants', exampleSentence: 'Yellow flower.', exampleMeaning: 'Bông hoa màu vàng.' },
      { id: 'w-grass-34', word: 'Grass', phonetic: '/ɡrɑːs/', vietnamesePronunciation: 'G-rát-s', meaning: 'Bãi cỏ xanh mướt', emoji: '🌱', category: 'plants', exampleSentence: 'Green grass grows.', exampleMeaning: 'Thảm cỏ xanh mọc đều.' },
      { id: 'w-seed-34', word: 'Seed', phonetic: '/siːd/', vietnamesePronunciation: 'Xít-đ', meaning: 'Hạt giống nhỏ', emoji: '🌰', category: 'plants', exampleSentence: 'Plant a seed.', exampleMeaning: 'Gieo một hạt mầm.' },
    ],
    samplePhrases: [
      { phrase: 'I love green trees.', phonetic: '/aɪ lʌv ɡriːn triːz/', vietnamese: 'Bé yêu cây xanh.', speaker: 'Bé & Cô' },
      { phrase: 'Look at the pretty flower!', phonetic: '/lʊk æt ðə ˈprɪti ˈflaʊər/', vietnamese: 'Nhìn bông hoa xinh xắn kìa!', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé tìm cây hoa quanh mình',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-pl34-1',
          prompt: 'Cây to màu xanh tiếng Anh là gì nhỉ?',
          englishAudioPrompt: 'Tree',
          options: [
            { id: 'a', text: 'Tree 🌳', emoji: '🌳' },
            { id: 'b', text: 'Leaf 🍃', emoji: '🍃' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-pl34-2',
          prompt: 'Chiếc lá tiếng Anh là gì bé ơi?',
          englishAudioPrompt: 'Leaf',
          options: [
            { id: 'a', text: 'Grass 🌱', emoji: '🌱' },
            { id: 'b', text: 'Leaf 🍃', emoji: '🍃' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'vehicles-34',
    categoryKey: 'vehicles',
    name: 'Phương tiện giao thông quen thuộc',
    englishName: 'Vehicles on the Road',
    icon: '🚗',
    color: 'from-amber-400 to-orange-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-800',
    description: 'Car, Bus, Bicycle, Motorbike, Plane, Train - xe cộ bon bon trên đường',
    vocabulary: [
      { id: 'w-car-vh-34', word: 'Car', phonetic: '/kɑːr/', vietnamesePronunciation: 'Ca', meaning: 'Xe ô tô', emoji: '🚗', category: 'vehicles', exampleSentence: 'A red car runs.', exampleMeaning: 'Chiếc ô tô đỏ bon bon chạy.' },
      { id: 'w-bus-vh-34', word: 'Bus', phonetic: '/bʌs/', vietnamesePronunciation: 'Bát-s', meaning: 'Xe buýt chở bé', emoji: '🚌', category: 'vehicles', exampleSentence: 'The yellow bus.', exampleMeaning: 'Chiếc xe buýt màu vàng.' },
      { id: 'w-bike-vh-34', word: 'Bicycle', phonetic: '/ˈbaɪsɪkl/', vietnamesePronunciation: 'Bai-xic-cồ', meaning: 'Xe đạp', emoji: '🚲', category: 'vehicles', exampleSentence: 'Ride a bicycle.', exampleMeaning: 'Bé đạp xe đạp.' },
      { id: 'w-moto-vh-34', word: 'Motorbike', phonetic: '/ˈməʊtəbaɪk/', vietnamesePronunciation: 'Mô-tơ-bai-k', meaning: 'Xe máy', emoji: '🛵', category: 'vehicles', exampleSentence: 'Daddy rides a motorbike.', exampleMeaning: 'Bố đi xe máy.' },
      { id: 'w-plane-vh-34', word: 'Plane', phonetic: '/pleɪn/', vietnamesePronunciation: 'P-lên', meaning: 'Máy bay trên trời', emoji: '✈️', category: 'vehicles', exampleSentence: 'Plane in the clouds.', exampleMeaning: 'Máy bay bay giữa tầng mây.' },
      { id: 'w-train-vh-34', word: 'Train', phonetic: '/treɪn/', vietnamesePronunciation: 'Trein', meaning: 'Tàu hỏa tu tu', emoji: '🚂', category: 'vehicles', exampleSentence: 'The train goes choo-choo.', exampleMeaning: 'Tàu hỏa chạy tu tu xình xịch.' },
    ],
    samplePhrases: [
      { phrase: 'The car goes beep beep!', phonetic: '/ðə kɑːr ɡəʊz biːp biːp/', vietnamese: 'Ô tô còi bim bim!', speaker: 'Bé & Cô' },
      { phrase: 'I ride my bicycle.', phonetic: '/aɪ raɪd maɪ ˈbaɪsɪkl/', vietnamese: 'Con đi xe đạp vui vẻ.', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé chọn đúng xe trên đường',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-vh34-1',
          prompt: 'Xe ô tô tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Car',
          options: [
            { id: 'a', text: 'Car 🚗', emoji: '🚗' },
            { id: 'b', text: 'Bus 🚌', emoji: '🚌' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-vh34-2',
          prompt: 'Máy bay bay trên trời đọc là gì?',
          englishAudioPrompt: 'Plane',
          options: [
            { id: 'a', text: 'Train 🚂', emoji: '🚂' },
            { id: 'b', text: 'Plane ✈️', emoji: '✈️' },
          ],
          correctId: 'b',
        }
      ]
    }
  }
];

// ==========================================
// II. DÀNH CHO TRẺ 4 - 5 TUỔI (Bé khám phá)
// ==========================================
export const ENGLISH_DATA_4_5: EnglishLessonTheme[] = [
  {
    id: 'shapes-45',
    name: 'Hình dạng kỳ diệu',
    englishName: 'Shapes',
    icon: '🔺',
    color: 'from-blue-400 to-indigo-500',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-800',
    description: 'Circle, Square, Triangle, Star, Heart',
    vocabulary: [
      { id: 'w-circle', word: 'Circle', phonetic: '/ˈsɜːkl/', vietnamesePronunciation: 'Xơ-cồ', meaning: 'Hình tròn', emoji: '⚪', category: 'shapes', exampleSentence: 'A round circle.', exampleMeaning: 'Một hình tròn.' },
      { id: 'w-square', word: 'Square', phonetic: '/skweər/', vietnamesePronunciation: 'S-que-ơ', meaning: 'Hình vuông', emoji: '⏹️', category: 'shapes', exampleSentence: 'Four sides of square.', exampleMeaning: 'Hình vuông 4 cạnh đều.' },
      { id: 'w-triangle', word: 'Triangle', phonetic: '/ˈtraɪæŋɡl/', vietnamesePronunciation: 'Trai-eng-gồ', meaning: 'Hình tam giác', emoji: '🔺', category: 'shapes', exampleSentence: 'Triangle roof.', exampleMeaning: 'Mái nhà hình tam giác.' },
      { id: 'w-star', word: 'Star', phonetic: '/stɑːr/', vietnamesePronunciation: 'S-ta', meaning: 'Ngôi sao', emoji: '⭐', category: 'shapes', exampleSentence: 'Shining star.', exampleMeaning: 'Ngôi sao lấp lánh.' },
      { id: 'w-heart', word: 'Heart', phonetic: '/hɑːt/', vietnamesePronunciation: 'Hát', meaning: 'Trái tim', emoji: '❤️', category: 'shapes', exampleSentence: 'Love heart.', exampleMeaning: 'Trái tim yêu thương.' },
    ],
    interactiveGame: {
      title: 'Bé ghép hình đúng',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-sh-1',
          prompt: 'Hình tròn tiếng Anh gọi là gì?',
          englishAudioPrompt: 'Circle',
          options: [
            { id: 'a', text: 'Circle ⚪', emoji: '⚪' },
            { id: 'b', text: 'Square ⏹️', emoji: '⏹️' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-sh-2',
          prompt: 'Ngôi sao tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Star',
          options: [
            { id: 'a', text: 'Heart ❤️', emoji: '❤️' },
            { id: 'b', text: 'Star ⭐', emoji: '⭐' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'numbers-45',
    name: 'Đếm số 1 đến 10',
    englishName: 'Numbers 1 to 10',
    icon: '🔟',
    color: 'from-amber-400 to-orange-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-800',
    description: 'Six, Seven, Eight, Nine, Ten',
    vocabulary: [
      { id: 'w-six', word: 'Six', phonetic: '/sɪks/', vietnamesePronunciation: 'Xích-s', meaning: 'Số 6', emoji: '6️⃣', category: 'numbers', exampleSentence: 'Six ducks.', exampleMeaning: 'Sáu con vịt.' },
      { id: 'w-seven', word: 'Seven', phonetic: '/ˈsɛvn/', vietnamesePronunciation: 'Xe-vần', meaning: 'Số 7', emoji: '7️⃣', category: 'numbers', exampleSentence: 'Seven colors.', exampleMeaning: 'Bảy sắc cầu vồng.' },
      { id: 'w-eight', word: 'Eight', phonetic: '/eɪt/', vietnamesePronunciation: 'Ết', meaning: 'Số 8', emoji: '8️⃣', category: 'numbers', exampleSentence: 'Eight balls.', exampleMeaning: 'Tám quả bóng.' },
      { id: 'w-nine', word: 'Nine', phonetic: '/naɪn/', vietnamesePronunciation: 'Nai-n', meaning: 'Số 9', emoji: '9️⃣', category: 'numbers', exampleSentence: 'Nine pencils.', exampleMeaning: 'Chín cây bút chì.' },
      { id: 'w-ten', word: 'Ten', phonetic: '/tɛn/', vietnamesePronunciation: 'Ten', meaning: 'Số 10', emoji: '🔟', category: 'numbers', exampleSentence: 'Ten little fingers.', exampleMeaning: 'Mười ngón tay xinh.' },
    ],
    interactiveGame: {
      title: 'Bé đếm số lượng',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-nm-10',
          prompt: 'Số 10 tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Ten',
          options: [
            { id: 'a', text: 'Ten 🔟', emoji: '🔟' },
            { id: 'b', text: 'Six 6️⃣', emoji: '6️⃣' },
          ],
          correctId: 'a',
        }
      ]
    }
  },
  {
    id: 'transport-45',
    categoryKey: 'vehicles',
    name: 'Phương tiện giao thông',
    englishName: 'Vehicles',
    icon: '🚗',
    color: 'from-emerald-400 to-teal-500',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    description: 'Car, Bus, Bicycle, Plane, Train',
    vocabulary: [
      { id: 'w-car2', word: 'Car', phonetic: '/kɑːr/', vietnamesePronunciation: 'Ca', meaning: 'Xe ô tô', emoji: '🚗', category: 'transport', exampleSentence: 'Drive a car.', exampleMeaning: 'Lái ô tô.' },
      { id: 'w-bus', word: 'Bus', phonetic: '/bʌs/', vietnamesePronunciation: 'Bát-s', meaning: 'Xe buýt', emoji: '🚌', category: 'transport', exampleSentence: 'School bus.', exampleMeaning: 'Xe buýt trường học.' },
      { id: 'w-bike', word: 'Bicycle', phonetic: '/ˈbaɪsɪkl/', vietnamesePronunciation: 'Bai-xic-cồ', meaning: 'Xe đạp', emoji: '🚲', category: 'transport', exampleSentence: 'Ride a bicycle.', exampleMeaning: 'Đạp xe đạp.' },
      { id: 'w-plane', word: 'Plane', phonetic: '/pleɪn/', vietnamesePronunciation: 'P-lên', meaning: 'Máy bay', emoji: '✈️', category: 'transport', exampleSentence: 'Plane in the sky.', exampleMeaning: 'Máy bay bay trên trời.' },
      { id: 'w-train', word: 'Train', phonetic: '/treɪn/', vietnamesePronunciation: 'Trein', meaning: 'Tàu hỏa', emoji: '🚂', category: 'transport', exampleSentence: 'Choo-choo train!', exampleMeaning: 'Tàu hỏa tu tu xình xịch!' },
    ],
    interactiveGame: {
      title: 'Bé chọn đúng phương tiện',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-vh-1',
          prompt: 'Máy bay tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Plane',
          options: [
            { id: 'a', text: 'Plane ✈️', emoji: '✈️' },
            { id: 'b', text: 'Bus 🚌', emoji: '🚌' },
          ],
          correctId: 'a',
        }
      ]
    }
  },
  {
    id: 'weather-clothes-45',
    name: 'Thời tiết & Trang phục',
    englishName: 'Weather & Clothes',
    icon: '⛅',
    color: 'from-sky-400 to-indigo-500',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-800',
    description: 'Sunny, Rainy, Shirt, Hat, Shoes',
    vocabulary: [
      { id: 'w-sunny', word: 'Sunny', phonetic: '/ˈsʌni/', vietnamesePronunciation: 'Xăn-ni', meaning: 'Trời nắng', emoji: '☀️', category: 'weather', exampleSentence: 'It is sunny today.', exampleMeaning: 'Hôm nay trời nắng đẹp.' },
      { id: 'w-rainy', word: 'Rainy', phonetic: '/ˈreɪni/', vietnamesePronunciation: 'Rêi-ni', meaning: 'Trời mưa', emoji: '🌧️', category: 'weather', exampleSentence: 'It is rainy.', exampleMeaning: 'Trời đang mưa.' },
      { id: 'w-shirt', word: 'Shirt', phonetic: '/ʃɜːt/', vietnamesePronunciation: 'Xớt-t', meaning: 'Áo', emoji: '👕', category: 'clothes', exampleSentence: 'Wear a shirt.', exampleMeaning: 'Mặc áo vào.' },
      { id: 'w-hat', word: 'Hat', phonetic: '/hæt/', vietnamesePronunciation: 'Hét-t', meaning: 'Cái mũ', emoji: '👒', category: 'clothes', exampleSentence: 'Put on your hat.', exampleMeaning: 'Đội mũ vào bé nhé.' },
      { id: 'w-shoes', word: 'Shoes', phonetic: '/ʃuːz/', vietnamesePronunciation: 'Xu-z', meaning: 'Đôi giày', emoji: '👟', category: 'clothes', exampleSentence: 'Tie your shoes.', exampleMeaning: 'Đi giày gọn gàng.' },
    ],
    interactiveGame: {
      title: 'Bé mặc đồ theo thời tiết',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-wt-1',
          prompt: 'Khi trời nắng, bé cần đội gì?',
          englishAudioPrompt: 'Hat',
          options: [
            { id: 'a', text: 'Hat 👒', emoji: '👒' },
            { id: 'b', text: 'Rainy 🌧️', emoji: '🌧️' },
          ],
          correctId: 'a',
        }
      ]
    }
  },
  {
    id: 'commands-45',
    name: 'Chỉ dẫn & Hành động',
    englishName: 'Actions & Commands',
    icon: '🤸',
    color: 'from-rose-400 to-pink-500',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-800',
    description: 'Stand up, Sit down, Clap your hands, Touch your nose',
    vocabulary: [
      { id: 'w-standup', word: 'Stand up', phonetic: '/stænd ʌp/', vietnamesePronunciation: 'S-ten áp', meaning: 'Đứng lên', emoji: '🧍', category: 'action', exampleSentence: 'Stand up, please!', exampleMeaning: 'Mời các con đứng lên nào!' },
      { id: 'w-sitdown', word: 'Sit down', phonetic: '/sɪt daʊn/', vietnamesePronunciation: 'Xít đao-n', meaning: 'Ngồi xuống', emoji: '🪑', category: 'action', exampleSentence: 'Sit down nicely.', exampleMeaning: 'Ngồi ngay ngắn nhé.' },
      { id: 'w-clap', word: 'Clap your hands', phonetic: '/klæp jɔː hændz/', vietnamesePronunciation: 'K-lép do hen-d-z', meaning: 'Vỗ tay nào', emoji: '👏', category: 'action', exampleSentence: 'Clap your hands together!', exampleMeaning: 'Cùng vỗ tay nào!' },
      { id: 'w-turnaround', word: 'Turn around', phonetic: '/tɜːn əˈraʊnd/', vietnamesePronunciation: 'Tơn ơ-rao-n-đ', meaning: 'Xoay một vòng', emoji: '🔄', category: 'action', exampleSentence: 'Turn around and jump!', exampleMeaning: 'Xoay một vòng rồi nhảy nào!' },
    ],
    interactiveGame: {
      title: 'Bé làm theo hiệu lệnh của cô',
      type: 'action-command',
      questions: [
        {
          id: 'q-cmd-1',
          prompt: 'Cô bảo "Stand up!", bé phải làm gì?',
          englishAudioPrompt: 'Stand up',
          options: [
            { id: 'a', text: 'Đứng lên 🧍', emoji: '🧍' },
            { id: 'b', text: 'Ngồi xuống 🪑', emoji: '🪑' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-cmd-2',
          prompt: 'Cô bảo "Clap your hands!", bé làm gì nào?',
          englishAudioPrompt: 'Clap your hands',
          options: [
            { id: 'a', text: 'Vỗ tay 👏', emoji: '👏' },
            { id: 'b', text: 'Chạy nhảy 🏃', emoji: '🏃' },
          ],
          correctId: 'a',
        }
      ]
    }
  },
  {
    id: 'school-45',
    categoryKey: 'kindergarten',
    name: 'Lớp học & Sân chơi của bé',
    englishName: 'Classroom & Fun at School',
    icon: '🏫',
    color: 'from-emerald-400 to-teal-500',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    description: 'Classroom, Desk, Chair, Crayon, Scissors, Playground, Slide',
    vocabulary: [
      { id: 'w-classroom-45', word: 'Classroom', phonetic: '/ˈklɑːsruːm/', vietnamesePronunciation: 'Kla-xrum', meaning: 'Phòng học xinh xắn', emoji: '🏫', category: 'school', exampleSentence: 'Welcome to our classroom.', exampleMeaning: 'Chào mừng các bạn đến lớp học.' },
      { id: 'w-desk-45', word: 'Desk', phonetic: '/dɛsk/', vietnamesePronunciation: 'Đét-sk', meaning: 'Bàn học của bé', emoji: '🪑', category: 'school', exampleSentence: 'Sit at your desk.', exampleMeaning: 'Ngồi vào bàn học ngay ngắn.' },
      { id: 'w-chair-45', word: 'Chair', phonetic: '/tʃeər/', vietnamesePronunciation: 'Che-ơ', meaning: 'Cái ghế ngồi', emoji: '🪑', category: 'school', exampleSentence: 'Pull in your chair.', exampleMeaning: 'Kê gọn ghế lại nào.' },
      { id: 'w-crayon-45', word: 'Crayon', phonetic: '/ˈkreɪən/', vietnamesePronunciation: 'K-rây-ân', meaning: 'Bút sáp màu tô tranh', emoji: '🖍️', category: 'school', exampleSentence: 'Draw with colorful crayons.', exampleMeaning: 'Vẽ tranh bằng bút sáp nhiều màu.' },
      { id: 'w-scissors-45', word: 'Scissors', phonetic: '/ˈsɪzərz/', vietnamesePronunciation: 'Xít-zơ-z', meaning: 'Kéo thủ công', emoji: '✂️', category: 'school', exampleSentence: 'Use safety scissors.', exampleMeaning: 'Dùng kéo thủ công an toàn.' },
      { id: 'w-playground-45', word: 'Playground', phonetic: '/ˈpleɪɡraʊnd/', vietnamesePronunciation: 'P-lây-grao-n-đ', meaning: 'Sân chơi mầm non', emoji: '🎪', category: 'school', exampleSentence: 'Run in the playground.', exampleMeaning: 'Chạy chơi ngoài sân trường.' },
      { id: 'w-slide-45', word: 'Slide', phonetic: '/slaɪd/', vietnamesePronunciation: 'S-lai-đ', meaning: 'Cầu trượt vui nhộn', emoji: '🛝', category: 'school', exampleSentence: 'Slide down happily.', exampleMeaning: 'Trượt cầu trượt thật vui.' },
    ],
    samplePhrases: [
      { phrase: 'I love my classroom!', phonetic: '/aɪ lʌv maɪ ˈklɑːsruːm/', vietnamese: 'Con rất yêu lớp học của mình!', speaker: 'Bé & Cô' },
      { phrase: 'Let\'s play on the slide!', phonetic: '/lɛts pleɪ ɒn ðə slaɪd/', vietnamese: 'Chúng mình cùng chơi cầu trượt nhé!', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé tìm đồ dùng lớp học',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-sc45-1',
          prompt: 'Bút màu sáp để vẽ tranh tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Crayon',
          options: [
            { id: 'a', text: 'Crayon 🖍️', emoji: '🖍️' },
            { id: 'b', text: 'Chair 🪑', emoji: '🪑' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-sc45-2',
          prompt: 'Cầu trượt ở sân trường tiếng Anh là gì?',
          englishAudioPrompt: 'Slide',
          options: [
            { id: 'a', text: 'Desk 🪑', emoji: '🪑' },
            { id: 'b', text: 'Slide 🛝', emoji: '🛝' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'family-45',
    categoryKey: 'family',
    name: 'Gia đình & Mái ấm thân yêu',
    englishName: 'Family & Sweet Home',
    icon: '👨‍👩‍👦',
    color: 'from-pink-400 to-rose-500',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-800',
    description: 'Grandfather, Grandmother, Parents, Brother, Sister, House - mái ấm yêu thương',
    vocabulary: [
      { id: 'w-grandpa-45', word: 'Grandfather', phonetic: '/ˈɡrændˌfɑːðər/', vietnamesePronunciation: 'G-ren-pha-đơ', meaning: 'Ông kính yêu', emoji: '👴', category: 'family', exampleSentence: 'Grandfather reads stories.', exampleMeaning: 'Ông kể chuyện cho bé nghe.' },
      { id: 'w-grandma-45', word: 'Grandmother', phonetic: '/ˈɡrændˌmʌðər/', vietnamesePronunciation: 'G-ren-ma-đơ', meaning: 'Bà hiền từ', emoji: '👵', category: 'family', exampleSentence: 'Grandmother bakes cookies.', exampleMeaning: 'Bà nướng bánh thơm nức.' },
      { id: 'w-parents-45', word: 'Parents', phonetic: '/ˈpeərənts/', vietnamesePronunciation: 'Pe-rừn-t-s', meaning: 'Bố mẹ của bé', emoji: '👨‍👩‍👧', category: 'family', exampleSentence: 'I hug my parents.', exampleMeaning: 'Bé ôm bố mẹ yêu quý.' },
      { id: 'w-brother-45', word: 'Brother', phonetic: '/ˈbrʌðər/', vietnamesePronunciation: 'Bra-đơ', meaning: 'Anh/em trai', emoji: '👦', category: 'family', exampleSentence: 'Play with my brother.', exampleMeaning: 'Chơi cùng anh em trai.' },
      { id: 'w-sister-45', word: 'Sister', phonetic: '/ˈsɪstər/', vietnamesePronunciation: 'Xít-stơ', meaning: 'Chị/em gái', emoji: '👧', category: 'family', exampleSentence: 'Sweet sister.', exampleMeaning: 'Chị em gái ngọt ngào.' },
      { id: 'w-house-45', word: 'House', phonetic: '/haʊs/', vietnamesePronunciation: 'Hao-s', meaning: 'Ngôi nhà ấm cúng', emoji: '🏠', category: 'family', exampleSentence: 'Our warm house.', exampleMeaning: 'Ngôi nhà ấm áp của chúng mình.' },
    ],
    samplePhrases: [
      { phrase: 'I love my grandparents.', phonetic: '/aɪ lʌv maɪ ˈɡrændˌpeərənts/', vietnamese: 'Con rất kính yêu ông bà.', speaker: 'Bé & Cô' },
      { phrase: 'We are a happy family.', phonetic: '/wiː ɑːr ə ˈhæpi ˈfæmɪli/', vietnamese: 'Gia đình chúng con luôn hạnh phúc.', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé đố vui người thân',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-fam45-1',
          prompt: 'Bà hiền từ tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Grandmother',
          options: [
            { id: 'a', text: 'Grandmother 👵', emoji: '👵' },
            { id: 'b', text: 'Brother 👦', emoji: '👦' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-fam45-2',
          prompt: 'Ngôi nhà ấm áp tiếng Anh là gì?',
          englishAudioPrompt: 'House',
          options: [
            { id: 'a', text: 'Parents 👨‍👩‍👧', emoji: '👨‍👩‍👧' },
            { id: 'b', text: 'House 🏠', emoji: '🏠' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'jobs-45',
    categoryKey: 'jobs',
    name: 'Những người giúp đỡ cộng đồng',
    englishName: 'Community Helpers',
    icon: '👨‍🚒',
    color: 'from-blue-400 to-indigo-500',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-800',
    description: 'Firefighter, Pilot, Nurse, Farmer, Singer, Builder',
    vocabulary: [
      { id: 'w-firefighter-45', word: 'Firefighter', phonetic: '/ˈfaɪəfaɪtər/', vietnamesePronunciation: 'Phai-ơ phai-tơ', meaning: 'Chú lính cứu hỏa dũng cảm', emoji: '👨‍🚒', category: 'jobs', exampleSentence: 'The firefighter drives a red truck.', exampleMeaning: 'Lính cứu hỏa lái xe cứu hỏa đỏ.' },
      { id: 'w-pilot-45', word: 'Pilot', phonetic: '/ˈpaɪlət/', vietnamesePronunciation: 'Pai-lợt', meaning: 'Bác phi công lái máy bay', emoji: '👨‍✈️', category: 'jobs', exampleSentence: 'The pilot flies high in the sky.', exampleMeaning: 'Phi công bay cao giữa bầu trời.' },
      { id: 'w-nurse-45', word: 'Nurse', phonetic: '/nɜːs/', vietnamesePronunciation: 'Nơ-s', meaning: 'Cô y tá dịu dàng', emoji: '👩‍⚕️', category: 'jobs', exampleSentence: 'The nurse takes care of sick kids.', exampleMeaning: 'Cô y tá chăm sóc các bạn nhỏ bị ốm.' },
      { id: 'w-farmer-45', word: 'Farmer', phonetic: '/ˈfɑːmər/', vietnamesePronunciation: 'Pha-mơ', meaning: 'Bác nông dân trồng lúa', emoji: '👨‍🌾', category: 'jobs', exampleSentence: 'Farmer grows fresh vegetables.', exampleMeaning: 'Bác nông dân trồng rau củ tươi ngon.' },
      { id: 'w-singer-45', word: 'Singer', phonetic: '/ˈsɪŋər/', vietnamesePronunciation: 'Xinh-ơ', meaning: 'Ca sĩ hát hay', emoji: '🎤', category: 'jobs', exampleSentence: 'The singer sings a joyful song.', exampleMeaning: 'Ca sĩ hát bài hát vui tươi.' },
      { id: 'w-builder-45', word: 'Builder', phonetic: '/ˈbɪldər/', vietnamesePronunciation: 'Bin-đơ', meaning: 'Chú thợ xây nhà', emoji: '👷', category: 'jobs', exampleSentence: 'The builder builds strong houses.', exampleMeaning: 'Chú thợ xây những ngôi nhà vững chãi.' },
    ],
    samplePhrases: [
      { phrase: 'The firefighter puts out fire.', phonetic: '/ðə ˈfaɪəfaɪtər pʊts aʊt ˈfaɪər/', vietnamese: 'Chú lính cứu hỏa dập tắt ngọn lửa.', speaker: 'Bé & Cô' },
      { phrase: 'The farmer works on the farm.', phonetic: '/ðə ˈfɑːmər wɜːks ɒn ðə fɑːm/', vietnamese: 'Bác nông dân chăm chỉ ngoài nông trại.', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé tìm nghề nghiệp đúng',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-jb45-1',
          prompt: 'Chú lính cứu hỏa dập lửa tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Firefighter',
          options: [
            { id: 'a', text: 'Firefighter 👨‍🚒', emoji: '👨‍🚒' },
            { id: 'b', text: 'Farmer 👨‍🌾', emoji: '👨‍🌾' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-jb45-2',
          prompt: 'Bác phi công lái máy bay tiếng Anh là gì?',
          englishAudioPrompt: 'Pilot',
          options: [
            { id: 'a', text: 'Nurse 👩‍⚕️', emoji: '👩‍⚕️' },
            { id: 'b', text: 'Pilot 👨‍✈️', emoji: '👨‍✈️' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'spring-45',
    categoryKey: 'spring',
    name: 'Sắc xuân & Lễ hội Tết rực rỡ',
    englishName: 'Spring & Tet Festive Days',
    icon: '🌸',
    color: 'from-amber-400 to-rose-400',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-900',
    description: 'Springtime, Butterfly, Green square cake, Fireworks, New clothes, Warm breeze',
    vocabulary: [
      { id: 'w-springtime-45', word: 'Springtime', phonetic: '/ˈsprɪŋtaɪm/', vietnamesePronunciation: 'S-pring-tai-m', meaning: 'Tiết trời mùa xuân rực rỡ', emoji: '🌸', category: 'spring', exampleSentence: 'Springtime brings sweet flowers.', exampleMeaning: 'Mùa xuân mang tới ngàn hoa tươi thắm.' },
      { id: 'w-butterfly-45', word: 'Butterfly', phonetic: '/ˈbʌtəflaɪ/', vietnamesePronunciation: 'Bắt-tơ-ph-lai', meaning: 'Bướm xuân lượn bay', emoji: '🦋', category: 'spring', exampleSentence: 'Colorful butterfly flutters.', exampleMeaning: 'Chú bướm sặc sỡ dập dờn bay.' },
      { id: 'w-chung-cake-45', word: 'Square sticky rice cake', phonetic: '/skweər ˈstɪki raɪs keɪk/', vietnamesePronunciation: 'S-que-ơ s-tíc-ki rai-s kêi-k', meaning: 'Bánh chưng xanh ngày Tết', emoji: '🟢', category: 'spring', exampleSentence: 'We wrap square sticky rice cake for Tet.', exampleMeaning: 'Cả nhà cùng gói bánh chưng đón Tết.' },
      { id: 'w-fireworks-45', word: 'Fireworks', phonetic: '/ˈfaɪəwɜːks/', vietnamesePronunciation: 'Phai-ơ-uốc-k-s', meaning: 'Pháo hoa rực sáng đêm giao thừa', emoji: '🎆', category: 'spring', exampleSentence: 'Bright fireworks light up the sky.', exampleMeaning: 'Pháo hoa thắp sáng bầu trời đêm Tết.' },
      { id: 'w-new-clothes-45', word: 'New clothes', phonetic: '/njuː kləʊðz/', vietnamesePronunciation: 'Niu c-lâu-z', meaning: 'Quần áo mới diện Tết', emoji: '👗', category: 'spring', exampleSentence: 'I wear new clothes for Tet.', exampleMeaning: 'Bé mặc quần áo mới chúc Tết ông bà.' },
      { id: 'w-breeze-45', word: 'Warm breeze', phonetic: '/wɔːm briːz/', vietnamesePronunciation: 'Oam b-ri-z', meaning: 'Làn gió xuân ấm áp', emoji: '🍃', category: 'spring', exampleSentence: 'Gentle warm breeze blowing.', exampleMeaning: 'Gió xuân nhẹ nhàng thổi mát lành.' },
    ],
    samplePhrases: [
      { phrase: 'Spring brings new life!', phonetic: '/sprɪŋ brɪŋz njuː laɪf/', vietnamese: 'Mùa xuân đem đến sức sống mới!', speaker: 'Bé & Cô' },
      { phrase: 'Happy Lunar New Year!', phonetic: '/ˈhæpi ˈluːnər njuː jɪər/', vietnamese: 'Chúc mừng Tết cổ truyền vui vẻ!', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé trẩy hội ngày xuân',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-sp45-1',
          prompt: 'Chú bướm xinh bay lượn tiếng Anh là gì?',
          englishAudioPrompt: 'Butterfly',
          options: [
            { id: 'a', text: 'Butterfly 🦋', emoji: '🦋' },
            { id: 'b', text: 'Fireworks 🎆', emoji: '🎆' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-sp45-2',
          prompt: 'Pháo hoa rực rỡ đón giao thừa đọc là gì?',
          englishAudioPrompt: 'Fireworks',
          options: [
            { id: 'a', text: 'New clothes 👗', emoji: '👗' },
            { id: 'b', text: 'Fireworks 🎆', emoji: '🎆' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'plants-45',
    categoryKey: 'plants',
    name: 'Thế giới thực vật quanh bé',
    englishName: 'Wonderful Plants & Nature',
    icon: '🌻',
    color: 'from-emerald-400 to-green-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-900',
    description: 'Big tree, Roots, Trunk, Rose, Sunflower, Sprout, Water - cây cối xanh tốt',
    vocabulary: [
      { id: 'w-bigtree-45', word: 'Big tree', phonetic: '/bɪɡ triː/', vietnamesePronunciation: 'Bích-g t-ri', meaning: 'Cây cổ thụ rợp bóng', emoji: '🌳', category: 'plants', exampleSentence: 'Rest under the big tree.', exampleMeaning: 'Nghỉ mát dưới gốc cây to.' },
      { id: 'w-roots-45', word: 'Roots', phonetic: '/ruːts/', vietnamesePronunciation: 'Rut-s', meaning: 'Rễ cây hút nước', emoji: '🪵', category: 'plants', exampleSentence: 'Deep roots in the soil.', exampleMeaning: 'Rễ cây cắm sâu vào lòng đất.' },
      { id: 'w-trunk-45', word: 'Trunk', phonetic: '/trʌŋk/', vietnamesePronunciation: 'Trăng-k', meaning: 'Thân cây chắc khỏe', emoji: '🪵', category: 'plants', exampleSentence: 'A strong tree trunk.', exampleMeaning: 'Thân cây vững chắc.' },
      { id: 'w-rose-45', word: 'Rose', phonetic: '/rəʊz/', vietnamesePronunciation: 'Râu-z', meaning: 'Bông hoa hồng nhung', emoji: '🌹', category: 'plants', exampleSentence: 'A red fragrant rose.', exampleMeaning: 'Bông hoa hồng đỏ ngát hương.' },
      { id: 'w-sunflower-45', word: 'Sunflower', phonetic: '/ˈsʌnˌflaʊər/', vietnamesePronunciation: 'Xăn-p-lao-ơ', meaning: 'Hoa hướng dương rực rỡ', emoji: '🌻', category: 'plants', exampleSentence: 'Sunflowers face the sun.', exampleMeaning: 'Hoa hướng dương luôn hướng về mặt trời.' },
      { id: 'w-sprout-45', word: 'Sprout', phonetic: '/spraʊt/', vietnamesePronunciation: 'S-prao-t', meaning: 'Chồi non nảy lộc', emoji: '🌱', category: 'plants', exampleSentence: 'A tiny green sprout.', exampleMeaning: 'Một mầm non xanh biếc mới nhú.' },
      { id: 'w-water-pl-45', word: 'Water the plants', phonetic: '/ˈwɔːtər ðə plɑːnts/', vietnamesePronunciation: 'Oa-tơ đơ p-lan-t-s', meaning: 'Tưới nước chăm sóc cây', emoji: '🪴', category: 'plants', exampleSentence: 'Let\'s water the plants together.', exampleMeaning: 'Cùng tưới nước cho cây xanh tốt nhé.' },
    ],
    samplePhrases: [
      { phrase: 'Plants need sunlight and water.', phonetic: '/plɑːnts niːd ˈsʌnlaɪt ænd ˈwɔːtər/', vietnamese: 'Cây cối cần ánh nắng và nước tưới.', speaker: 'Bé & Cô' },
      { phrase: 'Look at the yellow sunflower!', phonetic: '/lʊk æt ðə ˈjɛləʊ ˈsʌnˌflaʊər/', vietnamese: 'Nhìn bông hoa hướng dương vàng rực rỡ kìa!', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé chăm sóc vườn cây',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-pl45-1',
          prompt: 'Hoa hướng dương vàng tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Sunflower',
          options: [
            { id: 'a', text: 'Sunflower 🌻', emoji: '🌻' },
            { id: 'b', text: 'Rose 🌹', emoji: '🌹' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-pl45-2',
          prompt: 'Chồi non xanh mới nảy mầm đọc là gì?',
          englishAudioPrompt: 'Sprout',
          options: [
            { id: 'a', text: 'Roots 🪵', emoji: '🪵' },
            { id: 'b', text: 'Sprout 🌱', emoji: '🌱' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'colors-45',
    categoryKey: 'colors',
    name: 'Thế giới màu sắc & Cầu vồng',
    englishName: 'Colors & Beautiful Rainbow',
    icon: '🌈',
    color: 'from-purple-400 to-pink-500',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-900',
    description: 'Purple, Orange, Pink, Brown, Black, White, Rainbow, Golden',
    vocabulary: [
      { id: 'w-purple-45', word: 'Purple', phonetic: '/ˈpɜːpl/', vietnamesePronunciation: 'Pơ-pồ', meaning: 'Màu tím thủy chung', emoji: '🟣', category: 'colors', exampleSentence: 'Purple grapes.', exampleMeaning: 'Chùm nho màu tím.' },
      { id: 'w-orange-col-45', word: 'Orange', phonetic: '/ˈɒrɪndʒ/', vietnamesePronunciation: 'O-rinh-d', meaning: 'Màu cam tươi tắn', emoji: '🟠', category: 'colors', exampleSentence: 'Sweet orange juice.', exampleMeaning: 'Nước cam màu cam tươi.' },
      { id: 'w-pink-45', word: 'Pink', phonetic: '/pɪŋk/', vietnamesePronunciation: 'Pinh-k', meaning: 'Màu hồng phấn dễ thương', emoji: '🌸', category: 'colors', exampleSentence: 'Pink dress.', exampleMeaning: 'Chiếc váy màu hồng.' },
      { id: 'w-brown-45', word: 'Brown', phonetic: '/braʊn/', vietnamesePronunciation: 'B-rao-n', meaning: 'Màu nâu ấm áp', emoji: '🟤', category: 'colors', exampleSentence: 'Brown teddy bear.', exampleMeaning: 'Chú gấu bông màu nâu.' },
      { id: 'w-black-45', word: 'Black', phonetic: '/blæk/', vietnamesePronunciation: 'B-léc', meaning: 'Màu đen huyền bí', emoji: '⚫', category: 'colors', exampleSentence: 'Black cat.', exampleMeaning: 'Chú mèo lông đen.' },
      { id: 'w-white-45', word: 'White', phonetic: '/waɪt/', vietnamesePronunciation: 'Oai-t', meaning: 'Màu trắng tinh khôi', emoji: '⚪', category: 'colors', exampleSentence: 'White cloud in the sky.', exampleMeaning: 'Đám mây trắng trên trời.' },
      { id: 'w-rainbow-45', word: 'Rainbow', phonetic: '/ˈreɪnbəʊ/', vietnamesePronunciation: 'Rêin-bâu', meaning: 'Cầu vồng bảy sắc', emoji: '🌈', category: 'colors', exampleSentence: 'Rainbow after the rain.', exampleMeaning: 'Cầu vồng xuất hiện sau cơn mưa.' },
    ],
    samplePhrases: [
      { phrase: 'I love colorful rainbow!', phonetic: '/aɪ lʌv ˈkʌləfʊl ˈreɪnbəʊ/', vietnamese: 'Con rất thích cầu vồng nhiều màu sắc!', speaker: 'Bé & Cô' },
      { phrase: 'Red and yellow make orange.', phonetic: '/rɛd ænd ˈjɛləʊ meɪk ˈɒrɪndʒ/', vietnamese: 'Pha màu đỏ với màu vàng ra màu cam.', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé phân biệt màu sắc mở rộng',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-col45-1',
          prompt: 'Cầu vồng bảy sắc tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Rainbow',
          options: [
            { id: 'a', text: 'Rainbow 🌈', emoji: '🌈' },
            { id: 'b', text: 'Purple 🟣', emoji: '🟣' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-col45-2',
          prompt: 'Màu hồng phấn tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Pink',
          options: [
            { id: 'a', text: 'Brown 🟤', emoji: '🟤' },
            { id: 'b', text: 'Pink 🌸', emoji: '🌸' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'animals-45',
    categoryKey: 'animals',
    name: 'Động vật rừng xanh & Biển cả',
    englishName: 'Forest & Ocean Animals',
    icon: '🦁',
    color: 'from-amber-400 to-orange-500',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-950',
    description: 'Lion, Elephant, Monkey, Tiger, Dolphin, Sea turtle - muôn thú muôn màu',
    vocabulary: [
      { id: 'w-lion-45', word: 'Lion', phonetic: '/ˈlaɪən/', vietnamesePronunciation: 'Lai-ừn', meaning: 'Sư tử chúa sơn lâm', emoji: '🦁', category: 'animals', exampleSentence: 'The lion roars.', exampleMeaning: 'Sư tử gầm vang.' },
      { id: 'w-elephant-45', word: 'Elephant', phonetic: '/ˈɛlɪfənt/', vietnamesePronunciation: 'E-lơ-phần-t', meaning: 'Chú voi có vòi dài', emoji: '🐘', category: 'animals', exampleSentence: 'The elephant has a long trunk.', exampleMeaning: 'Chú voi có chiếc vòi dài.' },
      { id: 'w-monkey-45', word: 'Monkey', phonetic: '/ˈmʌŋki/', vietnamesePronunciation: 'Măng-ki', meaning: 'Chú khỉ tinh nghịch', emoji: '🐒', category: 'animals', exampleSentence: 'Monkey climbs trees.', exampleMeaning: 'Khỉ leo trèo thoăn thoắt.' },
      { id: 'w-tiger-45', word: 'Tiger', phonetic: '/ˈtaɪɡər/', vietnamesePronunciation: 'Tai-gơ', meaning: 'Hổ vằn dũng mãnh', emoji: '🐅', category: 'animals', exampleSentence: 'The tiger runs fast.', exampleMeaning: 'Hổ chạy rất nhanh.' },
      { id: 'w-dolphin-45', word: 'Dolphin', phonetic: '/ˈdɒlfɪn/', vietnamesePronunciation: 'Đon-phin', meaning: 'Cá heo thông minh thân thiện', emoji: '🐬', category: 'animals', exampleSentence: 'Dolphin jumps out of water.', exampleMeaning: 'Cá heo nhảy tung tăng trên mặt nước.' },
      { id: 'w-turtle-45', word: 'Sea turtle', phonetic: '/siː ˈtɜːtl/', vietnamesePronunciation: 'Xi tơ-tồ', meaning: 'Rùa biển chậm rãi', emoji: '🐢', category: 'animals', exampleSentence: 'The sea turtle swims slowly.', exampleMeaning: 'Rùa biển bơi thong thả.' },
    ],
    samplePhrases: [
      { phrase: 'The elephant is very big!', phonetic: '/ði ˈɛlɪfənt ɪz ˈvɛri bɪɡ/', vietnamese: 'Chú voi to lớn thật đấy!', speaker: 'Bé & Cô' },
      { phrase: 'Dolphins are friendly friends.', phonetic: '/ˈdɒlfɪnz ɑːr ˈfrɛndli frɛndz/', vietnamese: 'Cá heo là người bạn rất thân thiện.', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé khám phá thế giới động vật',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-an45-1',
          prompt: 'Chú voi có vòi dài tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Elephant',
          options: [
            { id: 'a', text: 'Elephant 🐘', emoji: '🐘' },
            { id: 'b', text: 'Lion 🦁', emoji: '🦁' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-an45-2',
          prompt: 'Cá heo thông minh bơi dưới biển đọc là gì?',
          englishAudioPrompt: 'Dolphin',
          options: [
            { id: 'a', text: 'Monkey 🐒', emoji: '🐒' },
            { id: 'b', text: 'Dolphin 🐬', emoji: '🐬' },
          ],
          correctId: 'b',
        }
      ]
    }
  }
];

// ==========================================
// III. DÀNH CHO TRẺ 5 - 6 TUỔI (Bé tự tin giao tiếp)
// ==========================================
export const ENGLISH_DATA_5_6: EnglishLessonTheme[] = [
  {
    id: 'intro-self-56',
    name: 'Giới thiệu bản thân & Mẫu câu',
    englishName: 'Introduce Yourself',
    icon: '🎤',
    color: 'from-purple-500 to-indigo-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-800',
    description: 'What is your name? How old are you? How are you?',
    vocabulary: [
      { id: 'w-name', word: 'Name', phonetic: '/neɪm/', vietnamesePronunciation: 'Nêm', meaning: 'Tên của bé', emoji: '🏷️', category: 'self', exampleSentence: 'My name is Nam.', exampleMeaning: 'Tên tớ là Nam.' },
      { id: 'w-age', word: 'Five years old', phonetic: '/faɪv jɪərz əʊld/', vietnamesePronunciation: 'Phai-v di-ơ-z ô-l-đ', meaning: '5 tuổi', emoji: '✋', category: 'self', exampleSentence: 'I am five years old.', exampleMeaning: 'Con 5 tuổi rồi ạ.' },
      { id: 'w-fine', word: 'I am good', phonetic: '/aɪ æm ɡʊd/', vietnamesePronunciation: 'Ai em gút', meaning: 'Con khỏe / Con rất tốt', emoji: '👍', category: 'self', exampleSentence: 'I am great, thank you!', exampleMeaning: 'Con rất khỏe, cảm ơn cô!' },
    ],
    samplePhrases: [
      { phrase: 'What is your name? - My name is...', phonetic: '/wɒt ɪz jɔː neɪm/ - /maɪ neɪm ɪz/', vietnamese: 'Tên bạn là gì? - Tên tớ là...', speaker: 'Cô & Bé' },
      { phrase: 'How old are you? - I am five years old.', phonetic: '/haʊ əʊld ɑː juː/ - /aɪ æm faɪv jɪərz əʊld/', vietnamese: 'Bạn mấy tuổi? - Tớ 5 tuổi.', speaker: 'Cô & Bé' },
      { phrase: 'How are you? - I am happy!', phonetic: '/haʊ ɑː juː/ - /aɪ æm ˈhæpi/', vietnamese: 'Hôm nay bạn thế nào? - Tớ rất vui!', speaker: 'Cô & Bé' }
    ],
    interactiveGame: {
      title: 'Hội thoại tương tác làm quen',
      type: 'fill-blank',
      questions: [
        {
          id: 'q-dial-1',
          prompt: 'Khi cô hỏi: "What is your name?", câu trả lời đúng là:',
          englishAudioPrompt: 'What is your name?',
          options: [
            { id: 'a', text: 'My name is Lan 👧', emoji: '👧' },
            { id: 'b', text: 'I am fine 👍', emoji: '👍' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-dial-2',
          prompt: 'Khi cô hỏi: "How old are you?", câu trả lời đúng là:',
          englishAudioPrompt: 'How old are you?',
          options: [
            { id: 'a', text: 'I am five years old ✋', emoji: '✋' },
            { id: 'b', text: 'Goodbye teacher 👋', emoji: '👋' },
          ],
          correctId: 'a',
        }
      ]
    }
  },
  {
    id: 'school-supplies-56',
    categoryKey: 'kindergarten',
    name: 'Trường lớp & Sẵn sàng vào Lớp 1',
    englishName: 'School & Primary Ready',
    icon: '🎒',
    color: 'from-amber-400 to-orange-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-800',
    description: 'Pencil, Book, Eraser, Ruler, Backpack, Blackboard, Clock, Classmates',
    vocabulary: [
      { id: 'w-pencil', word: 'Pencil', phonetic: '/ˈpɛnsl/', vietnamesePronunciation: 'Pen-xồ', meaning: 'Bút chì viết chữ', emoji: '✏️', category: 'school', exampleSentence: 'Sharp pencil for writing.', exampleMeaning: 'Chiếc bút chì nhọn tập viết chữ.' },
      { id: 'w-book', word: 'Book', phonetic: '/bʊk/', vietnamesePronunciation: 'Búc-k', meaning: 'Quyển sách học bài', emoji: '📖', category: 'school', exampleSentence: 'Open your storybook.', exampleMeaning: 'Mở quyển sách truyện ra nào.' },
      { id: 'w-eraser', word: 'Eraser', phonetic: '/ɪˈreɪzər/', vietnamesePronunciation: 'I-rây-zơ', meaning: 'Cục tẩy sạch sẽ', emoji: '🧼', category: 'school', exampleSentence: 'Rubber eraser cleans mistakes.', exampleMeaning: 'Cục tẩy giúp trang vở luôn sạch.' },
      { id: 'w-ruler', word: 'Ruler', phonetic: '/ˈruːlər/', vietnamesePronunciation: 'Ru-lơ', meaning: 'Cây thước kẻ thẳng', emoji: '📏', category: 'school', exampleSentence: 'Draw straight line with ruler.', exampleMeaning: 'Kẻ đường thẳng bằng thước kẻ.' },
      { id: 'w-backpack', word: 'Backpack', phonetic: '/ˈbækpæk/', vietnamesePronunciation: 'Béc-péc', meaning: 'Cặp sách / Balo vào Lớp 1', emoji: '🎒', category: 'school', exampleSentence: 'My tidy backpack.', exampleMeaning: 'Chiếc balo gọn gàng của bé.' },
      { id: 'w-blackboard', word: 'Blackboard', phonetic: '/ˈblækbɔːd/', vietnamesePronunciation: 'B-léc-bo-đ', meaning: 'Bảng lớp học', emoji: '📋', category: 'school', exampleSentence: 'Look at the blackboard.', exampleMeaning: 'Nhìn lên bảng lớp học nào.' },
      { id: 'w-classmates', word: 'Classmates', phonetic: '/ˈklɑːsmeɪts/', vietnamesePronunciation: 'Kla-x-mêit-s', meaning: 'Các bạn cùng lớp', emoji: '👫', category: 'school', exampleSentence: 'Help your classmates.', exampleMeaning: 'Giúp đỡ bạn bè cùng lớp.' },
    ],
    samplePhrases: [
      { phrase: 'I am ready for primary school!', phonetic: '/aɪ æm ˈrɛdi fɔːr ˈpraɪməri skuːl/', vietnamese: 'Con đã sẵn sàng bước vào Lớp 1!', speaker: 'Bé & Cô' },
      { phrase: 'I pack my backpack carefully.', phonetic: '/aɪ pæk maɪ ˈbækpæk ˈkeəfʊli/', vietnamese: 'Con tự sắp xếp balo thật cẩn thận.', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé chuẩn bị cặp sách vào Lớp 1',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-ss-1',
          prompt: 'Bút chì để viết tiếng Anh là gì?',
          englishAudioPrompt: 'Pencil',
          options: [
            { id: 'a', text: 'Pencil ✏️', emoji: '✏️' },
            { id: 'b', text: 'Ruler 📏', emoji: '📏' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-ss-2',
          prompt: 'Bảng lớp học tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Blackboard',
          options: [
            { id: 'a', text: 'Book 📖', emoji: '📖' },
            { id: 'b', text: 'Blackboard 📋', emoji: '📋' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'jobs-56',
    categoryKey: 'jobs',
    name: 'Nghề nghiệp ước mơ',
    englishName: 'Dream Jobs & Careers',
    icon: '👨‍🚒',
    color: 'from-blue-400 to-cyan-500',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-800',
    description: 'Teacher, Doctor, Police officer, Firefighter, Pilot, Astronaut, Scientist, Artist',
    vocabulary: [
      { id: 'w-doctor', word: 'Doctor', phonetic: '/ˈdɒktər/', vietnamesePronunciation: 'Đóc-tơ', meaning: 'Bác sĩ chữa bệnh cứu người', emoji: '👨‍⚕️', category: 'jobs', exampleSentence: 'Doctor helps people get well.', exampleMeaning: 'Bác sĩ giúp mọi người mau khỏe mạnh.' },
      { id: 'w-police', word: 'Police officer', phonetic: '/pəˈliːs ˈɒfɪsər/', vietnamesePronunciation: 'Pơ-lít ót-phi-xơ', meaning: 'Chú cảnh sát giữ bình yên', emoji: '👮‍♂️', category: 'jobs', exampleSentence: 'Brave police officer keeps city safe.', exampleMeaning: 'Cảnh sát giữ gìn an ninh trật tự.' },
      { id: 'w-firefighter', word: 'Firefighter', phonetic: '/ˈfaɪəfaɪtər/', vietnamesePronunciation: 'Phai-ơ phai-tơ', meaning: 'Chú lính cứu hỏa', emoji: '👨‍🚒', category: 'jobs', exampleSentence: 'Firefighter puts out fire bravely.', exampleMeaning: 'Lính cứu hỏa dập tắt lửa dũng cảm.' },
      { id: 'w-pilot', word: 'Pilot', phonetic: '/ˈpaɪlət/', vietnamesePronunciation: 'Pai-lợt', meaning: 'Phi công lái máy bay đường dài', emoji: '👨‍✈️', category: 'jobs', exampleSentence: 'Fly high across oceans, pilot.', exampleMeaning: 'Phi công bay qua đại dương bao la.' },
      { id: 'w-astronaut-56', word: 'Astronaut', phonetic: '/ˈæstrənɔːt/', vietnamesePronunciation: 'Át-s-trơ-nót', meaning: 'Phi hành gia bay vào vũ trụ', emoji: '👨‍🚀', category: 'jobs', exampleSentence: 'Astronaut explores stars.', exampleMeaning: 'Phi hành gia thám hiểm các vì sao.' },
      { id: 'w-scientist-56', word: 'Scientist', phonetic: '/ˈsaɪəntɪst/', vietnamesePronunciation: 'Xai-ừn-tit-st', meaning: 'Nhà khoa học phát minh', emoji: '🔬', category: 'jobs', exampleSentence: 'Scientist discovers new things.', exampleMeaning: 'Nhà khoa học nghiên cứu sáng chế.' },
      { id: 'w-artist-56', word: 'Artist', phonetic: '/ˈɑːtɪst/', vietnamesePronunciation: 'Át-tit-st', meaning: 'Họa sĩ sáng tạo nghệ thuật', emoji: '🎨', category: 'jobs', exampleSentence: 'Artist paints beautiful canvas.', exampleMeaning: 'Họa sĩ vẽ bức tranh tuyệt đẹp.' },
    ],
    samplePhrases: [
      { phrase: 'What do you want to be?', phonetic: '/wɒt duː juː wɒnt tuː biː/', vietnamese: 'Lớn lên con muốn làm nghề gì?', speaker: 'Cô & Bé' },
      { phrase: 'I want to be an astronaut!', phonetic: '/aɪ wɒnt tuː biː ən ˈæstrənɔːt/', vietnamese: 'Con ước mơ trở thành phi hành gia!', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé đoán nghề nghiệp tương lai',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-jb-1',
          prompt: 'Người mặc áo trắng chữa bệnh tiếng Anh là gì?',
          englishAudioPrompt: 'Doctor',
          options: [
            { id: 'a', text: 'Doctor 👨‍⚕️', emoji: '👨‍⚕️' },
            { id: 'b', text: 'Pilot 👨‍✈️', emoji: '👨‍✈️' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-jb-2',
          prompt: 'Phi hành gia bay vào không gian vũ trụ đọc là gì?',
          englishAudioPrompt: 'Astronaut',
          options: [
            { id: 'a', text: 'Scientist 🔬', emoji: '🔬' },
            { id: 'b', text: 'Astronaut 👨‍🚀', emoji: '👨‍🚀' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'phonics-abc-56',
    name: 'Bảng chữ cái & Phonics tiếng Anh',
    englishName: 'Alphabet & Phonics',
    icon: '🔤',
    color: 'from-emerald-400 to-green-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    description: 'Làm quen âm chữ cái A-Z nhẹ nhàng qua ví dụ quen thuộc',
    vocabulary: [
      { id: 'p-a', word: 'A - Apple', phonetic: '/æ/ in Apple', vietnamesePronunciation: 'E - Ép-pồ', meaning: 'Chữ A trong quả táo', emoji: '🍎', category: 'phonics' },
      { id: 'p-b', word: 'B - Ball', phonetic: '/b/ in Ball', vietnamesePronunciation: 'Bờ - Bo-l', meaning: 'Chữ B trong quả bóng', emoji: '⚽', category: 'phonics' },
      { id: 'p-c', word: 'C - Cat', phonetic: '/k/ in Cat', vietnamesePronunciation: 'Cờ - Két', meaning: 'Chữ C trong con mèo', emoji: '🐱', category: 'phonics' },
      { id: 'p-d', word: 'D - Dog', phonetic: '/d/ in Dog', vietnamesePronunciation: 'Đờ - Đót-g', meaning: 'Chữ D trong chú chó', emoji: '🐶', category: 'phonics' },
      { id: 'p-e', word: 'E - Elephant', phonetic: '/e/ in Elephant', vietnamesePronunciation: 'E - E-lơ-phần-t', meaning: 'Chữ E trong chú voi', emoji: '🐘', category: 'phonics' },
      { id: 'p-f', word: 'F - Fish', phonetic: '/f/ in Fish', vietnamesePronunciation: 'Phờ - Phít-sh', meaning: 'Chữ F trong con cá', emoji: '🐟', category: 'phonics' },
    ],
    interactiveGame: {
      title: 'Bé tìm chữ cái bắt đầu',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-ph-1',
          prompt: 'Từ "Apple" 🍎 bắt đầu bằng chữ cái nào?',
          englishAudioPrompt: 'Letter A',
          options: [
            { id: 'a', text: 'Chữ A 🍎', emoji: '🅰️' },
            { id: 'b', text: 'Chữ B ⚽', emoji: '🅱️' },
          ],
          correctId: 'a',
        }
      ]
    }
  },
  {
    id: 'family-56',
    categoryKey: 'family',
    name: 'Gia đình gắn kết & Yêu thương',
    englishName: 'Family Generations & Care',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-pink-400 to-rose-600',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-950',
    description: 'Big family, Grandparents, Parents, Sibling, Home, Love, Dinner, Care',
    vocabulary: [
      { id: 'w-bigfamily-56', word: 'Big family', phonetic: '/bɪɡ ˈfæmɪli/', vietnamesePronunciation: 'Bích-g phe-mi-li', meaning: 'Đại gia đình nhiều thế hệ', emoji: '👨‍👩‍👧‍👦', category: 'family', exampleSentence: 'I have a big loving family.', exampleMeaning: 'Con có một đại gia đình rất đỗi yêu thương.' },
      { id: 'w-grandparents-56', word: 'Grandparents', phonetic: '/ˈɡrændˌpeərənts/', vietnamesePronunciation: 'G-ren-pe-rừn-t-s', meaning: 'Ông bà kính yêu', emoji: '👵👴', category: 'family', exampleSentence: 'Respect and love grandparents.', exampleMeaning: 'Kính trọng và hiếu thảo với ông bà.' },
      { id: 'w-sibling-56', word: 'Sibling', phonetic: '/ˈsɪblɪŋ/', vietnamesePronunciation: 'Xíp-lỉnh', meaning: 'Anh chị em ruột thịt', emoji: '🧑‍🤝‍🧑', category: 'family', exampleSentence: 'Share toys with siblings.', exampleMeaning: 'Chia sẻ đồ chơi cùng anh chị em.' },
      { id: 'w-dinner-56', word: 'Family dinner', phonetic: '/ˈfæmɪli ˈdɪnər/', vietnamesePronunciation: 'Phe-mi-li đin-nơ', meaning: 'Bữa cơm gia đình quây quần', emoji: '🍲', category: 'family', exampleSentence: 'We enjoy warm family dinner.', exampleMeaning: 'Cả nhà cùng thưởng thức bữa cơm ấm áp.' },
      { id: 'w-care-56', word: 'Care for each other', phonetic: '/keər fɔːr iːtʃ ˈʌðər/', vietnamesePronunciation: 'Ke pho ít-ch a-đơ', meaning: 'Quan tâm chăm sóc lẫn nhau', emoji: '❤️', category: 'family', exampleSentence: 'Always care for each other.', exampleMeaning: 'Luôn quan tâm, đùm bọc lẫn nhau.' },
      { id: 'w-home-56', word: 'Cozy home', phonetic: '/ˈkəʊzi həʊm/', vietnamesePronunciation: 'Cầu-zi hôm', meaning: 'Mái ấm bình yên', emoji: '🏡', category: 'family', exampleSentence: 'Home is full of laughter.', exampleMeaning: 'Mái ấm gia đình rộn rã tiếng cười.' },
    ],
    samplePhrases: [
      { phrase: 'How many people are there in your family?', phonetic: '/haʊ ˈmɛni ˈpiːpl ɑːr ðeər ɪn jɔː ˈfæmɪli/', vietnamese: 'Gia đình bạn có bao nhiêu người?', speaker: 'Cô & Bé' },
      { phrase: 'There are five people in my family.', phonetic: '/ðeər ɑːr faɪv ˈpiːpl ɪn maɪ ˈfæmɪli/', vietnamese: 'Gia đình tớ có 5 thành viên.', speaker: 'Cô & Bé' }
    ],
    interactiveGame: {
      title: 'Hội thoại về gia đình bé',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-fam56-1',
          prompt: 'Từ "Ông bà" tiếng Anh phát âm là gì?',
          englishAudioPrompt: 'Grandparents',
          options: [
            { id: 'a', text: 'Grandparents 👵👴', emoji: '👵👴' },
            { id: 'b', text: 'Parents 👨‍👩‍👧', emoji: '👨‍👩‍👧' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-fam56-2',
          prompt: 'Bữa cơm gia đình ấm cúng tiếng Anh là gì?',
          englishAudioPrompt: 'Family dinner',
          options: [
            { id: 'a', text: 'Cozy home 🏡', emoji: '🏡' },
            { id: 'b', text: 'Family dinner 🍲', emoji: '🍲' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'spring-56',
    categoryKey: 'spring',
    name: 'Mùa xuân tươi đẹp & Phong tục Tết',
    englishName: 'Spring Season & Traditions',
    icon: '🌸',
    color: 'from-amber-400 to-rose-500',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-950',
    description: 'Spring festival, Swallow bird, Family reunion, Blossom, Sticky rice cake, New year wishes',
    vocabulary: [
      { id: 'w-festival-56', word: 'Spring festival', phonetic: '/sprɪŋ ˈfɛstɪvəl/', vietnamesePronunciation: 'S-pring phét-s-ti-vừn', meaning: 'Lễ hội mùa xuân tưng bừng', emoji: '🎊', category: 'spring', exampleSentence: 'Join the spring festival.', exampleMeaning: 'Tham gia lễ hội mùa xuân rộn rã.' },
      { id: 'w-swallow-56', word: 'Swallow bird', phonetic: '/ˈswɒləʊ bɜːd/', vietnamesePronunciation: 'Xoắt-lâu bớt-đ', meaning: 'Chim én báo hiệu mùa xuân', emoji: '🕊️', category: 'spring', exampleSentence: 'Swallows fly back in spring.', exampleMeaning: 'Đàn én chao liệng đón xuân về.' },
      { id: 'w-reunion-56', word: 'Family reunion', phonetic: '/ˈfæmɪli riːˈjuːniən/', vietnamesePronunciation: 'Phe-mi-li ri-du-ni-ừn', meaning: 'Đoàn viên sum vầy ngày Tết', emoji: '👨‍👩‍👧‍👦', category: 'spring', exampleSentence: 'Tet is time for family reunion.', exampleMeaning: 'Tết là dịp gia đình đoàn tụ sum vầy.' },
      { id: 'w-blossom-56', word: 'Peach blossom', phonetic: '/piːtʃ ˈblɒsəm/', vietnamesePronunciation: 'Pít-ch b-lo-xừm', meaning: 'Cành đào rực rỡ sắc xuân', emoji: '🌸', category: 'spring', exampleSentence: 'Pink peach blossoms bloom.', exampleMeaning: 'Hoa đào thắm nở rộ ngày xuân.' },
      { id: 'w-wishes-56', word: 'New Year wishes', phonetic: '/njuː jɪər ˈwɪʃɪz/', vietnamesePronunciation: 'Niu di-ơ uýt-sh-iz', meaning: 'Lời chúc đầu xuân may mắn', emoji: '💌', category: 'spring', exampleSentence: 'Send warmest New Year wishes.', exampleMeaning: 'Gửi những lời chúc năm mới tốt lành nhất.' },
      { id: 'w-health-56', word: 'Good health & Luck', phonetic: '/ɡʊd hɛlθ ænd lʌk/', vietnamesePronunciation: 'Gút heo-th en lắc', meaning: 'Sức khỏe dồi dào và may mắn', emoji: '🍀', category: 'spring', exampleSentence: 'Wish you good health and luck!', exampleMeaning: 'Chúc ông bà dồi dào sức khỏe và may mắn!' },
    ],
    samplePhrases: [
      { phrase: 'Swallows fly in the blue sky.', phonetic: '/ˈswɒləʊz flaɪ ɪn ðə bluː skaɪ/', vietnamese: 'Chim én bay lượn trên bầu trời xanh.', speaker: 'Bé & Cô' },
      { phrase: 'Wishing you peace, happiness and prosperity!', phonetic: '/ˈwɪʃɪŋ juː piːs ˈhæpɪnəs ænd prɒsˈpɛrɪti/', vietnamese: 'Chúc an khang thịnh vượng và hạnh phúc!', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé tìm hiểu phong tục Tết',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-sp56-1',
          prompt: 'Chim én báo hiệu mùa xuân đọc là gì?',
          englishAudioPrompt: 'Swallow bird',
          options: [
            { id: 'a', text: 'Swallow bird 🕊️', emoji: '🕊️' },
            { id: 'b', text: 'Peach blossom 🌸', emoji: '🌸' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-sp56-2',
          prompt: 'Đoàn tụ gia đình ngày Tết đọc là gì?',
          englishAudioPrompt: 'Family reunion',
          options: [
            { id: 'a', text: 'Family reunion 👨‍👩‍👧‍👦', emoji: '👨‍👩‍👧‍👦' },
            { id: 'b', text: 'Spring festival 🎊', emoji: '🎊' },
          ],
          correctId: 'a',
        }
      ]
    }
  },
  {
    id: 'plants-56',
    categoryKey: 'plants',
    name: 'Sự phát triển thực vật & Bảo vệ cây xanh',
    englishName: 'Plants Ecosystem & Botany',
    icon: '🌿',
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-950',
    description: 'Plant life cycle, Sunlight, Soil, Oxygen, Fruit garden, Protect trees, Fresh air',
    vocabulary: [
      { id: 'w-cycle-56', word: 'Plant life cycle', phonetic: '/plɑːnt laɪf ˈsaɪkl/', vietnamesePronunciation: 'P-lan-t lai-ph xai-cồ', meaning: 'Vòng đời sinh trưởng của cây', emoji: '🔄', category: 'plants', exampleSentence: 'Observe the plant life cycle.', exampleMeaning: 'Quan sát vòng đời nảy mầm của cây.' },
      { id: 'w-sunlight-56', word: 'Sunlight', phonetic: '/ˈsʌnlaɪt/', vietnamesePronunciation: 'Xăn-lai-t', meaning: 'Ánh sáng mặt trời quang hợp', emoji: '☀️', category: 'plants', exampleSentence: 'Leaves absorb sunlight.', exampleMeaning: 'Lá cây đón nhận ánh nắng mặt trời.' },
      { id: 'w-soil-56', word: 'Nutrient soil', phonetic: '/ˈnjuːtriənt sɔɪl/', vietnamesePronunciation: 'Niu-tri-ừn-t soi-l', meaning: 'Đất màu mỡ giàu dinh dưỡng', emoji: '🪴', category: 'plants', exampleSentence: 'Roots take water from soil.', exampleMeaning: 'Rễ hút nước và chất dinh dưỡng từ đất.' },
      { id: 'w-oxygen-56', word: 'Oxygen', phonetic: '/ˈɒksɪdʒən/', vietnamesePronunciation: 'Óc-xi-dừn', meaning: 'Khí oxy trong lành', emoji: '💨', category: 'plants', exampleSentence: 'Green trees produce oxygen.', exampleMeaning: 'Cây xanh tạo ra khí oxy cho sự sống.' },
      { id: 'w-garden-56', word: 'Fruit garden', phonetic: '/fruːt ˈɡɑːdn/', vietnamesePronunciation: 'P-rut ga-đừn', meaning: 'Vườn cây trĩu quả', emoji: '🍎', category: 'plants', exampleSentence: 'Apples ripen in the fruit garden.', exampleMeaning: 'Táo chín đỏ rộ trong vườn.' },
      { id: 'w-protect-trees-56', word: 'Protect trees', phonetic: '/prəˈtɛkt triːz/', vietnamesePronunciation: 'P-rơ-téc-t t-ri-z', meaning: 'Bảo vệ cây xanh và rừng', emoji: '🌲', category: 'plants', exampleSentence: 'Protect trees for our Earth.', exampleMeaning: 'Bảo vệ cây xanh cho Trái Đất tươi đẹp.' },
    ],
    samplePhrases: [
      { phrase: 'Trees give us clean oxygen and shade.', phonetic: '/triːz ɡɪv ʌs kliːn ˈɒksɪdʒən ænd ʃeɪd/', vietnamese: 'Cây xanh cho ta oxy trong lành và bóng mát.', speaker: 'Bé & Cô' },
      { phrase: 'Let\'s plant a tree today!', phonetic: '/lɛts plɑːnt ə triː təˈdeɪ/', vietnamese: 'Chúng mình hãy cùng trồng một cái cây hôm nay nhé!', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé làm nhà khoa học thực vật',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-pl56-1',
          prompt: 'Khí oxy trong lành mà cây xanh tạo ra tiếng Anh là gì?',
          englishAudioPrompt: 'Oxygen',
          options: [
            { id: 'a', text: 'Oxygen 💨', emoji: '💨' },
            { id: 'b', text: 'Soil 🪴', emoji: '🪴' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-pl56-2',
          prompt: 'Bảo vệ cây xanh tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Protect trees',
          options: [
            { id: 'a', text: 'Sunlight ☀️', emoji: '☀️' },
            { id: 'b', text: 'Protect trees 🌲', emoji: '🌲' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'transport-56',
    categoryKey: 'vehicles',
    name: 'Giao thông an toàn & Phương tiện hiện đại',
    englishName: 'Traffic Safety & Modern Transport',
    icon: '🚦',
    color: 'from-sky-500 to-blue-600',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-950',
    description: 'Traffic lights, Zebra crossing, Helmet, Pedestrian, Subway train, Fast train, Airport',
    vocabulary: [
      { id: 'w-traffic-light-56', word: 'Traffic lights', phonetic: '/ˈtræfɪk laɪts/', vietnamesePronunciation: 'Trép-phíc lai-t-s', meaning: 'Đèn tín hiệu giao thông', emoji: '🚦', category: 'vehicles', exampleSentence: 'Red light stop, green light go.', exampleMeaning: 'Đèn đỏ dừng lại, đèn xanh được đi.' },
      { id: 'w-zebra-crossing-56', word: 'Zebra crossing', phonetic: '/ˈzɛbrə ˈkrɒsɪŋ/', vietnamesePronunciation: 'Ze-brơ c-rót-xinh', meaning: 'Vạch kẻ trắng sang đường', emoji: '🦓', category: 'vehicles', exampleSentence: 'Cross street on zebra crossing.', exampleMeaning: 'Sang đường trên vạch kẻ trắng an toàn.' },
      { id: 'w-helmet-56', word: 'Helmet', phonetic: '/ˈhɛlmɪt/', vietnamesePronunciation: 'Heo-mít', meaning: 'Mũ bảo hiểm an toàn', emoji: '⛑️', category: 'vehicles', exampleSentence: 'Always fasten your helmet.', exampleMeaning: 'Luôn cài quai mũ bảo hiểm cẩn thận.' },
      { id: 'w-subway-56', word: 'Subway train', phonetic: '/ˈsʌbweɪ treɪn/', vietnamesePronunciation: 'Xắp-uêi trein', meaning: 'Tàu điện ngầm hiện đại', emoji: '🚇', category: 'vehicles', exampleSentence: 'Fast electric subway train.', exampleMeaning: 'Tàu điện ngầm chạy êm và nhanh.' },
      { id: 'w-airport-56', word: 'Airport runway', phonetic: '/ˈeəpɔːt ˈrʌnweɪ/', vietnamesePronunciation: 'E-pót răn-uêi', meaning: 'Sân bay và đường băng', emoji: '🛫', category: 'vehicles', exampleSentence: 'Airplanes take off at the airport.', exampleMeaning: 'Máy bay cất cánh tại sân bay.' },
      { id: 'w-rules-56', word: 'Traffic rules', phonetic: '/ˈtræfɪk ruːlz/', vietnamesePronunciation: 'Trép-phíc rul-z', meaning: 'Luật an toàn giao thông', emoji: '🚸', category: 'vehicles', exampleSentence: 'Obey all traffic rules.', exampleMeaning: 'Chấp hành nghiêm luật an toàn giao thông.' },
    ],
    samplePhrases: [
      { phrase: 'Look left and right before crossing.', phonetic: '/lʊk lɛft ænd raɪt bɪˈfɔːr ˈkrɒsɪŋ/', vietnamese: 'Nhìn trái và phải trước khi qua đường.', speaker: 'Bé & Cô' },
      { phrase: 'Wear your helmet for safety!', phonetic: '/weər jɔː ˈhɛlmɪt fɔːr ˈseɪfti/', vietnamese: 'Đội mũ bảo hiểm để đảm bảo an toàn!', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé hiểu biết an toàn giao thông',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-tr56-1',
          prompt: 'Đèn tín hiệu giao thông tiếng Anh là gì?',
          englishAudioPrompt: 'Traffic lights',
          options: [
            { id: 'a', text: 'Traffic lights 🚦', emoji: '🚦' },
            { id: 'b', text: 'Subway train 🚇', emoji: '🚇' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-tr56-2',
          prompt: 'Mũ bảo hiểm bảo vệ đầu tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Helmet',
          options: [
            { id: 'a', text: 'Zebra crossing 🦓', emoji: '🦓' },
            { id: 'b', text: 'Helmet ⛑️', emoji: '⛑️' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'colors-56',
    categoryKey: 'colors',
    name: 'Sắc màu nghệ thuật & Phối màu sáng tạo',
    englishName: 'Art & Creative Color Mixing',
    icon: '🎨',
    color: 'from-indigo-500 to-purple-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-950',
    description: 'Primary colors, Mix colors, Bright, Pastel, Silver, Masterpiece, Colorful shades',
    vocabulary: [
      { id: 'w-primary-colors-56', word: 'Primary colors', phonetic: '/ˈpraɪməri ˈkʌlərz/', vietnamesePronunciation: 'P-rai-mơ-ri ca-lơ-z', meaning: 'Các màu sắc cơ bản (Đỏ, Vàng, Xanh)', emoji: '🎨', category: 'colors', exampleSentence: 'Red, yellow, and blue are primary colors.', exampleMeaning: 'Đỏ, vàng và xanh lam là các màu cơ bản.' },
      { id: 'w-mix-56', word: 'Mix colors', phonetic: '/mɪks ˈkʌlərz/', vietnamesePronunciation: 'Mích-s ca-lơ-z', meaning: 'Pha trộn các màu sắc', emoji: '🖌️', category: 'colors', exampleSentence: 'Mix blue and yellow to make green.', exampleMeaning: 'Pha xanh lam với vàng sẽ được màu xanh lá.' },
      { id: 'w-bright-56', word: 'Bright color', phonetic: '/braɪt ˈkʌlər/', vietnamesePronunciation: 'B-rai-t ca-lơ', meaning: 'Màu sáng rực rỡ', emoji: '✨', category: 'colors', exampleSentence: 'The sun has bright color.', exampleMeaning: 'Mặt trời có màu sắc tươi sáng.' },
      { id: 'w-pastel-56', word: 'Pastel shade', phonetic: '/pæsˈtɛl ʃeɪd/', vietnamesePronunciation: 'Pát-s-teo xêi-đ', meaning: 'Màu phấn dịu nhẹ', emoji: '🪻', category: 'colors', exampleSentence: 'Pastel colors are gentle and soft.', exampleMeaning: 'Màu phấn mang lại cảm giác nhẹ nhàng.' },
      { id: 'w-silver-56', word: 'Silver shine', phonetic: '/ˈsɪlvər ʃaɪn/', vietnamesePronunciation: 'Xin-vơ xai-n', meaning: 'Màu bạc lấp lánh', emoji: '🥈', category: 'colors', exampleSentence: 'The moon shines silver.', exampleMeaning: 'Mặt trăng tỏa ánh bạc lung linh.' },
      { id: 'w-masterpiece-56', word: 'Masterpiece', phonetic: '/ˈmɑːstəpiːs/', vietnamesePronunciation: 'Mát-s-tơ-pít-s', meaning: 'Bức tranh kiệt tác của bé', emoji: '🖼️', category: 'colors', exampleSentence: 'Your drawing is a masterpiece!', exampleMeaning: 'Bức tranh của con là một kiệt tác tuyệt vời!' },
    ],
    samplePhrases: [
      { phrase: 'What happens when we mix red and blue?', phonetic: '/wɒt ˈhæpənz wɛn wiː mɪks rɛd ænd bluː/', vietnamese: 'Điều gì xảy ra khi chúng mình pha đỏ và xanh lam?', speaker: 'Cô & Bé' },
      { phrase: 'Red and blue make purple!', phonetic: '/rɛd ænd bluː meɪk ˈpɜːpl/', vietnamese: 'Đỏ và xanh lam tạo thành màu tím!', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé làm họa sĩ pha màu',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-col56-1',
          prompt: 'Pha màu trong tiếng Anh đọc là gì?',
          englishAudioPrompt: 'Mix colors',
          options: [
            { id: 'a', text: 'Mix colors 🖌️', emoji: '🖌️' },
            { id: 'b', text: 'Silver shine 🥈', emoji: '🥈' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-col56-2',
          prompt: 'Bức tranh kiệt tác tiếng Anh là gì?',
          englishAudioPrompt: 'Masterpiece',
          options: [
            { id: 'a', text: 'Pastel shade 🪻', emoji: '🪻' },
            { id: 'b', text: 'Masterpiece 🖼️', emoji: '🖼️' },
          ],
          correctId: 'b',
        }
      ]
    }
  },
  {
    id: 'animals-56',
    categoryKey: 'animals',
    name: 'Thế giới muôn thú & Bảo vệ động vật',
    englishName: 'Animal Habitats & Wildlife',
    icon: '🦁',
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-950',
    description: 'Wild animals, Mammals, Ocean creatures, Habitat, Jungle, Birds, Protect wildlife',
    vocabulary: [
      { id: 'w-wild-animals-56', word: 'Wild animals', phonetic: '/waɪld ˈænɪməlz/', vietnamesePronunciation: 'Oai-l-đ e-ni-mừn-z', meaning: 'Các loài động vật hoang dã', emoji: '🦁', category: 'animals', exampleSentence: 'Wild animals live freely in nature.', exampleMeaning: 'Động vật hoang dã sống tự do trong tự nhiên.' },
      { id: 'w-habitat-56', word: 'Habitat', phonetic: '/ˈhæbɪtæt/', vietnamesePronunciation: 'Hép-bi-tét', meaning: 'Môi trường sống tự nhiên', emoji: '🏞️', category: 'animals', exampleSentence: 'Forest is monkey\'s natural habitat.', exampleMeaning: 'Rừng là môi trường sống của loài khỉ.' },
      { id: 'w-ocean-creatures-56', word: 'Ocean creatures', phonetic: '/ˈəʊʃən ˈkriːtʃərz/', vietnamesePronunciation: 'Âu-xừn k-ri-chơ-z', meaning: 'Sinh vật biển bao la', emoji: '🐋', category: 'animals', exampleSentence: 'Whales are huge ocean creatures.', exampleMeaning: 'Cá voi là sinh vật khổng lồ của đại dương.' },
      { id: 'w-jungle-56', word: 'Deep jungle', phonetic: '/diːp ˈdʒʌŋɡl/', vietnamesePronunciation: 'Đíp dăng-gồ', meaning: 'Rừng nhiệt đới kỳ vĩ', emoji: '🌴', category: 'animals', exampleSentence: 'Tigers rule the deep jungle.', exampleMeaning: 'Hổ vằn oai phong giữa rừng sâu.' },
      { id: 'w-protect-wildlife-56', word: 'Protect wildlife', phonetic: '/prəˈtɛkt ˈwaɪldlaɪf/', vietnamesePronunciation: 'P-rơ-téc-t oai-l-đ-lai-ph', meaning: 'Bảo vệ các loài động vật hoang dã', emoji: '🐾', category: 'animals', exampleSentence: 'We must protect wildlife together.', exampleMeaning: 'Chúng mình hãy cùng chung tay bảo vệ muôn loài.' },
      { id: 'w-mammal-56', word: 'Mammal', phonetic: '/ˈmæməl/', vietnamesePronunciation: 'Mé-mồ', meaning: 'Động vật có vú nuôi con', emoji: '🐼', category: 'animals', exampleSentence: 'Giant panda is a cute mammal.', exampleMeaning: 'Gấu trúc là loài động vật có vú đáng yêu.' },
    ],
    samplePhrases: [
      { phrase: 'Animals live in forests, oceans and skies.', phonetic: '/ˈænɪməlz lɪv ɪn ˈfɒrɪsts ˈəʊʃənz ænd skaɪz/', vietnamese: 'Muôn thú sinh sống ở rừng xanh, biển cả và bầu trời.', speaker: 'Bé & Cô' },
      { phrase: 'We love and protect all animals!', phonetic: '/wiː lʌv ænd prəˈtɛkt ɔːl ˈænɪməlz/', vietnamese: 'Chúng con yêu thương và bảo vệ muôn loài động vật!', speaker: 'Bé & Cô' }
    ],
    interactiveGame: {
      title: 'Bé bảo vệ thế giới động vật',
      type: 'listen-pick',
      questions: [
        {
          id: 'q-an56-1',
          prompt: 'Môi trường sống tự nhiên của động vật đọc là gì?',
          englishAudioPrompt: 'Habitat',
          options: [
            { id: 'a', text: 'Habitat 🏞️', emoji: '🏞️' },
            { id: 'b', text: 'Jungle 🌴', emoji: '🌴' },
          ],
          correctId: 'a',
        },
        {
          id: 'q-an56-2',
          prompt: 'Bảo vệ động vật hoang dã tiếng Anh là gì?',
          englishAudioPrompt: 'Protect wildlife',
          options: [
            { id: 'a', text: 'Ocean creatures 🐋', emoji: '🐋' },
            { id: 'b', text: 'Protect wildlife 🐾', emoji: '🐾' },
          ],
          correctId: 'b',
        }
      ]
    }
  }
];

// ==========================================
// IV. TIẾNG ANH CÙNG CÔ GIÁO (Teacher's Module)
// ==========================================

// 1. Tiếng Anh sử dụng trong lớp học (Classroom Language)
export const TEACHER_CLASSROOM_PHRASES: TeacherClassroomPhrase[] = [
  {
    id: 'cp-1',
    category: 'classroom-management',
    english: 'Good morning, children!',
    phonetic: '/ɡʊd ˈmɔːnɪŋ ˈtʃɪldrən/',
    vietnamesePhonetic: 'Gút mo-ninh trâu-đrần!',
    vietnamese: 'Chào buổi sáng các con!',
    situation: 'Dùng khi cô bước vào lớp hoặc đón các bé đầu giờ sáng.',
    tip: 'Cô vừa nói vừa mỉm cười và vẫy tay chào bé thật tươi.'
  },
  {
    id: 'cp-2',
    category: 'classroom-management',
    english: 'Are you ready?',
    phonetic: '/ɑː juː ˈrɛdi/',
    vietnamesePhonetic: 'A du re-đi?',
    vietnamese: 'Các con đã sẵn sàng chưa?',
    situation: 'Dùng trước khi bắt đầu bài học, trò chơi hoặc một hoạt động mới.',
    tip: 'Dạy trẻ trả lời đồng thanh: "Yes, I am!" hoặc "Yes, we are!" kèm động tác giơ tay quyết tâm.'
  },
  {
    id: 'cp-3',
    category: 'classroom-management',
    english: 'Let\'s sing a song!',
    phonetic: '/lɛts sɪŋ ə sɒŋ/',
    vietnamesePhonetic: 'Lét-s xinh ơ song!',
    vietnamese: 'Chúng mình cùng hát một bài nhé!',
    situation: 'Chuyển tiếp giữa các hoạt động hoặc khởi động đầu giờ.',
    tip: 'Vỗ tay theo nhịp để kích thích sự hào hứng của trẻ.'
  },
  {
    id: 'cp-4',
    category: 'classroom-management',
    english: 'Look at the picture.',
    phonetic: '/lʊk æt ðə ˈpɪktʃər/',
    vietnamesePhonetic: 'Lúc át đơ píc-chơ.',
    vietnamese: 'Hãy nhìn vào bức tranh nào.',
    situation: 'Hướng sự chú ý của trẻ lên tranh minh họa, thẻ flashcard hoặc bảng chiếu.',
    tip: 'Chỉ tay vào tranh kết hợp mắt nhìn bao quát cả lớp.'
  },
  {
    id: 'cp-5',
    category: 'classroom-management',
    english: 'Listen carefully.',
    phonetic: '/ˈlɪsn ˈkeəfəli/',
    vietnamesePhonetic: 'Lít-sừn ke-phu-li.',
    vietnamese: 'Hãy lắng nghe thật kỹ nhé.',
    situation: 'Trước khi cô phát âm mẫu, mở file audio hoặc đưa ra luật chơi.',
    tip: 'Đặt ngón tay lên gần vành tai làm điệu bộ đang lắng nghe.'
  },
  {
    id: 'cp-6',
    category: 'classroom-management',
    english: 'Raise your hand.',
    phonetic: '/reɪz jɔː hænd/',
    vietnamesePhonetic: 'Rêiz do hen-đ.',
    vietnamese: 'Các con hãy giơ tay lên nào.',
    situation: 'Khi cô đặt câu hỏi và muốn gọi trẻ trả lời theo lượt.',
    tip: 'Cô giơ một tay lên cao làm mẫu ngay lập tức.'
  },
  {
    id: 'cp-7',
    category: 'classroom-management',
    english: 'Make a circle.',
    phonetic: '/meɪk ə ˈsɜːkl/',
    vietnamesePhonetic: 'Mêik ơ xơ-cồ.',
    vietnamese: 'Chúng mình cùng tạo thành vòng tròn nhé.',
    situation: 'Chuyển sang hoạt động vòng tròn, thể dục sáng hoặc chơi trò chơi tập thể.',
    tip: 'Cùng trẻ nắm tay nhau mở rộng vòng tròn.'
  },
  {
    id: 'cp-8',
    category: 'daily-routine',
    english: 'Let\'s clean up.',
    phonetic: '/lɛts kliːn ʌp/',
    vietnamesePhonetic: 'Lét-s clin áp.',
    vietnamese: 'Chúng mình cùng dọn dẹp nào.',
    situation: 'Kết thúc giờ chơi tự do hoặc góc hoạt động tạo hình.',
    tip: 'Vừa hát bài "Clean up, clean up, everybody clean up!" vừa làm mẫu cất đồ.'
  },
  {
    id: 'cp-9',
    category: 'praise-encourage',
    english: 'Well done!',
    phonetic: '/wɛl dʌn/',
    vietnamesePhonetic: 'Oeo đăn!',
    vietnamese: 'Các con làm tốt lắm! / Bé giỏi lắm!',
    situation: 'Khen ngợi khi trẻ hoàn thành nhiệm vụ, phát âm đúng hoặc giúp đỡ bạn.',
    tip: 'Đưa ngón tay cái biểu tượng Like 👍 hoặc giơ tay đập tay "High five!".'
  },
  {
    id: 'cp-10',
    category: 'praise-encourage',
    english: 'Can you try again?',
    phonetic: '/kæn juː traɪ əˈɡɛn/',
    vietnamesePhonetic: 'Khen du trai ơ-ghen?',
    vietnamese: 'Con thử lại lần nữa nhé!',
    situation: 'Khi trẻ trả lời chưa chính xác hoặc chưa mạnh dạn.',
    tip: 'Giọng điệu ấm áp, mỉm cười khích lệ, không chê bai trẻ.'
  },
  {
    id: 'cp-11',
    category: 'daily-routine',
    english: 'Please line up.',
    phonetic: '/pliːz laɪn ʌp/',
    vietnamesePhonetic: 'Pli-z lai-n áp.',
    vietnamese: 'Các con xếp hàng nhé!',
    situation: 'Chuẩn bị đi vệ sinh, ra sân chơi hoặc chuyển phòng học chức năng.',
    tip: 'Dạy trẻ đứng nối đuôi nhau như đoàn tàu "Choo-choo train".'
  },
  {
    id: 'cp-12',
    category: 'daily-routine',
    english: 'It\'s time to wash our hands.',
    phonetic: '/ɪts taɪm tuː wɒʃ ˈaʊə hændz/',
    vietnamesePhonetic: 'Ít-s taim tu oat ao-ơ hen-d-z.',
    vietnamese: 'Đến giờ rửa tay rồi các con ơi.',
    situation: 'Trước giờ ăn trưa, sau khi đi vệ sinh hoặc sau giờ vận động ngoài trời.',
    tip: 'Xoa hai bàn tay vào nhau làm động tác mô phỏng rửa tay.'
  },
  {
    id: 'cp-13',
    category: 'classroom-management',
    english: 'Hands on your lap.',
    phonetic: '/hændz ɒn jɔː læp/',
    vietnamesePhonetic: 'Hen-d-z on do lép.',
    vietnamese: 'Hai tay đặt lên đùi ngay ngắn nào.',
    situation: 'Giúp trẻ ổn định tư thế ngồi tĩnh tâm trước khi bắt đầu bài học.',
    tip: 'Đặt hai tay lên đùi làm mẫu cho các bé bắt chước.'
  },
  {
    id: 'cp-14',
    category: 'classroom-management',
    english: 'Eyes on me, please!',
    phonetic: '/aɪz ɒn miː pliːz/',
    vietnamesePhonetic: 'Ai-z on mi, pli-z!',
    vietnamese: 'Mắt nhìn cô giáo nào!',
    situation: 'Lấy lại sự tập trung khi lớp học bắt đầu mất trật tự.',
    tip: 'Câu đối đáp: Cô nói "1, 2, 3 Eyes on me!" - Trẻ đáp "1, 2 Eyes on you!".'
  },
  {
    id: 'cp-15',
    category: 'parent-comm',
    english: 'Good afternoon! Your child had a great day today.',
    phonetic: '/ɡʊd ˌɑːftəˈnuːn! jɔː tʃaɪld hæd ə ɡreɪt deɪ/',
    vietnamesePhonetic: 'Gút áp-tơ-nun! Do chai-l-đ hét ơ grêt đây.',
    vietnamese: 'Chào anh/chị! Hôm nay cháu học và chơi rất ngoan ạ.',
    situation: 'Giáo viên trao đổi với phụ huynh vào giờ trả trẻ buổi chiều.',
    tip: 'Tạo cảm giác an tâm, tích cực cho phụ huynh ngay từ câu chào đầu tiên.'
  }
];

// 2. Tiếng Anh tổ chức hoạt động giáo dục (Organizing Activities)
export const TEACHER_ACTIVITY_TOPICS: TeacherActivityTopic[] = [
  {
    id: 'act-music',
    activityType: 'music',
    title: 'Tổ chức Hoạt động Âm nhạc',
    englishTitle: 'Music & Movement Activities',
    icon: '🎵',
    introductionScript: 'Good morning class! Today we are going to sing a very happy song. Are you ready? Let\'s clap our hands to the beat!',
    introductionTranslation: 'Chào buổi sáng cả lớp! Hôm nay chúng mình sẽ cùng hát một bài hát rất vui nhộn. Các con đã sẵn sàng chưa? Hãy cùng vỗ tay theo nhịp điệu nào!',
    keyVocabulary: [
      { word: 'Song', phonetic: '/sɒŋ/', meaning: 'Bài hát' },
      { word: 'Sing', phonetic: '/sɪŋ/', meaning: 'Hát' },
      { word: 'Dance', phonetic: '/dɑːns/', meaning: 'Nhảy múa' },
      { word: 'Beat', phonetic: '/biːt/', meaning: 'Nhịp điệu' },
      { word: 'Loud / Soft', phonetic: '/laʊd / sɒft/', meaning: 'Hát to / Hát nhỏ' }
    ],
    teacherPrompts: [
      { english: 'Sing with me, please.', phonetic: '/sɪŋ wɪð miː pliːz/', vietnamese: 'Các con cùng hát với cô nhé.' },
      { english: 'Let\'s dance like a butterfly!', phonetic: '/lɛts dɑːns laɪk ə ˈbʌtəflaɪ/', vietnamese: 'Chúng mình cùng múa như chú bướm xinh nào!' },
      { english: 'One, two, three, let\'s sing!', phonetic: '/wʌn tuː θriː lɛts sɪŋ/', vietnamese: 'Một, hai, ba, cùng hát nào!' }
    ],
    sampleDialogue: [
      { speaker: 'Teacher', text: 'Do you like music?', phonetic: '/duː juː laɪk ˈmjuːzɪk/', translation: 'Các con có thích âm nhạc không?' },
      { speaker: 'Children', text: 'Yes, I do!', phonetic: '/jɛs aɪ duː/', translation: 'Có ạ!' },
      { speaker: 'Teacher', text: 'Listen to the music and freeze when the music stops!', phonetic: '/ˈlɪsn tuː ðə ˈmjuːzɪk ænd friːz/', translation: 'Nghe nhạc và đứng tượng khi nhạc dừng lại nhé!' }
    ],
    pedagogicalTip: 'Kết hợp cử chỉ điệu bộ (TPR) với giai điệu quen thuộc. Trẻ mầm non tiếp thu ngữ điệu tiếng Anh tự nhiên nhất qua các bài hát thiếu nhi có động tác vận động minh họa.'
  },
  {
    id: 'act-art',
    activityType: 'art',
    title: 'Tổ chức Hoạt động Tạo hình',
    englishTitle: 'Arts & Crafts Activities',
    icon: '🎨',
    introductionScript: 'Hello young artists! Today we will draw and color our favorite flowers. What color do you want to use?',
    introductionTranslation: 'Chào các họa sĩ nhí! Hôm nay chúng mình sẽ cùng vẽ và tô màu những bông hoa yêu thích. Các con muốn dùng màu gì nào?',
    keyVocabulary: [
      { word: 'Color', phonetic: '/ˈkʌlər/', meaning: 'Màu sắc / Tô màu' },
      { word: 'Draw', phonetic: '/drɔː/', meaning: 'Vẽ' },
      { word: 'Crayon', phonetic: '/ˈkreɪən/', meaning: 'Bút màu sáp' },
      { word: 'Paper', phonetic: '/ˈpeɪpər/', meaning: 'Tờ giấy' },
      { word: 'Glue', phonetic: '/ɡluː/', meaning: 'Hồ dán' },
      { word: 'Beautiful', phonetic: '/ˈbjuːtəfl/', meaning: 'Rất đẹp' }
    ],
    teacherPrompts: [
      { english: 'Show me your drawing!', phonetic: '/ʃəʊ miː jɔː ˈdrɔːɪŋ/', vietnamese: 'Hãy cho cô xem bức tranh của con nào!' },
      { english: 'Color inside the line, please.', phonetic: '/ˈkʌlər ɪnˈsaɪd ðə laɪn/', vietnamese: 'Con hãy tô màu khéo léo trong đường viền nhé.' },
      { english: 'Your picture is wonderful!', phonetic: '/jɔː ˈpɪktʃər ɪz ˈwʌndəfl/', vietnamese: 'Bức tranh của con thật tuyệt vời!' }
    ],
    sampleDialogue: [
      { speaker: 'Teacher', text: 'What color is your sun, Lan?', phonetic: '/wɒt ˈkʌlər ɪz jɔː sʌn/', translation: 'Ông mặt trời của Lan màu gì thế con?' },
      { speaker: 'Children', text: 'It\'s yellow and red!', phonetic: '/ɪts ˈjɛləʊ ænd rɛd/', translation: 'Dạ màu vàng và đỏ ạ!' },
      { speaker: 'Teacher', text: 'Great job! Very creative!', phonetic: '/ɡreɪt dʒɒb ˈvɛri kriˈeɪtɪv/', translation: 'Giỏi lắm! Con rất sáng tạo!' }
    ],
    pedagogicalTip: 'Trong giờ tạo hình, cô thường xuyên hỏi trẻ về màu sắc của đồ vật bằng tiếng Anh. Khen ngợi cụ thể từng chi tiết thay vì chỉ nói chung chung.'
  },
  {
    id: 'act-storytelling',
    activityType: 'storytelling',
    title: 'Tổ chức Hoạt động Kể chuyện',
    englishTitle: 'Storytelling & Picture Book',
    icon: '📚',
    introductionScript: 'Come closer, children! It\'s story time. Look at the cover of this book. What animal can you see here?',
    introductionTranslation: 'Các con lại gần đây nào! Đến giờ nghe kể chuyện rồi. Hãy nhìn vào bìa sách này nhé. Các con nhìn thấy con vật gì nào?',
    keyVocabulary: [
      { word: 'Story', phonetic: '/ˈstɔːri/', meaning: 'Câu chuyện' },
      { word: 'Book', phonetic: '/bʊk/', meaning: 'Quyển sách' },
      { word: 'Character', phonetic: '/ˈkærəktər/', meaning: 'Nhân vật' },
      { word: 'Magic', phonetic: '/ˈmædʒɪk/', meaning: 'Kỳ diệu' },
      { word: 'The end', phonetic: '/ði ɛnd/', meaning: 'Kết thúc' }
    ],
    teacherPrompts: [
      { english: 'Once upon a time...', phonetic: '/wʌns əˈpɒn ə taɪm/', vietnamese: 'Ngày xửa ngày xưa...' },
      { english: 'Turn the page, please.', phonetic: '/tɜːn ðə peɪdʒ pliːz/', vietnamese: 'Lật sang trang tiếp theo nhé.' },
      { english: 'What will happen next?', phonetic: '/wɒt wɪl ˈhæpən nɛkst/', vietnamese: 'Điều gì sẽ xảy ra tiếp theo nhỉ?' }
    ],
    sampleDialogue: [
      { speaker: 'Teacher', text: 'Is the little bunny happy or sad?', phonetic: '/ɪz ðə ˈlɪtl ˈbʌni ˈhæpi ɔː sæd/', translation: 'Bạn thỏ con đang vui hay đang buồn?' },
      { speaker: 'Children', text: 'Bunny is sad!', phonetic: '/ˈbʌni ɪz sæd/', translation: 'Bạn thỏ đang buồn ạ!' },
      { speaker: 'Teacher', text: 'Yes, because he is lost. Let\'s help him!', phonetic: '/jɛs bɪˈkɒz hiː ɪz lɒst/', translation: 'Đúng rồi, vì bạn bị lạc. Chúng mình cùng giúp bạn nhé!' }
    ],
    pedagogicalTip: 'Sử dụng ngữ điệu biến đổi linh hoạt theo từng nhân vật (giọng sói trầm, giọng thỏ trong trẻo). Dùng câu hỏi ngắn để kích thích trẻ phán đoán nội dung bức tranh tiếp theo.'
  },
  {
    id: 'act-physical',
    activityType: 'physical',
    title: 'Tổ chức Hoạt động Vận động & Trò chơi Ngoài trời',
    englishTitle: 'Physical & Outdoor Games',
    icon: '🏃‍♂️',
    introductionScript: 'Hello energetic friends! Let\'s go outside and play Simon Says. Remember to follow my instructions carefully!',
    introductionTranslation: 'Chào các bạn nhỏ tràn đầy năng lượng! Chúng mình cùng ra sân chơi trò "Simon Says" nhé. Nhớ lắng nghe kỹ hiệu lệnh của cô nhé!',
    keyVocabulary: [
      { word: 'Run', phonetic: '/rʌn/', meaning: 'Chạy' },
      { word: 'Jump', phonetic: '/dʒʌmp/', meaning: 'Bật nhảy' },
      { word: 'Walk', phonetic: '/wɔːk/', meaning: 'Đi bộ' },
      { word: 'Stop', phonetic: '/stɒp/', meaning: 'Dừng lại' },
      { word: 'Line', phonetic: '/laɪn/', meaning: 'Vạch xuất phát / Hàng ngũ' }
    ],
    teacherPrompts: [
      { english: 'Simon says: Jump high!', phonetic: '/ˈsaɪmən sɛz dʒʌmp haɪ/', vietnamese: 'Simon bảo: Nhảy cao lên!' },
      { english: 'Be careful, don\'t push!', phonetic: '/biː ˈkeəfl dəʊnt pʊʃ/', vietnamese: 'Cẩn thận nhé, không xô đẩy bạn!' },
      { english: 'Ready, steady, GO!', phonetic: '/ˈrɛdi ˈstɛdi ɡəʊ/', vietnamese: 'Chuẩn bị... Xuất phát!' }
    ],
    sampleDialogue: [
      { speaker: 'Teacher', text: 'Who wants to be the leader?', phonetic: '/huː wɒnts tuː biː ðə ˈliːdər/', translation: 'Ai muốn làm đội trưởng nào?' },
      { speaker: 'Children', text: 'Me! Me, teacher!', phonetic: '/miː tiːtʃər/', translation: 'Con ạ! Con thưa cô!' },
      { speaker: 'Teacher', text: 'Okay, Minh! Lead your team!', phonetic: '/əʊˈkeɪ liːd jɔː tiːm/', translation: 'Được rồi Minh nhé! Hãy dẫn dắt đội của con nào!' }
    ],
    pedagogicalTip: 'Trò chơi vận động gắn liền hiệu lệnh tiếng Anh giúp trẻ hình thành phản xạ nghe - hiểu - hành động nhanh hơn gấp 3 lần so với chỉ ngồi nghe thụ động.'
  }
];

// 3. Lộ trình học tiếng Anh cho giáo viên (4 Cấp độ)
export const TEACHER_LEARNING_LEVELS: TeacherLearningLevel[] = [
  {
    levelNumber: 1,
    levelTitle: 'Cấp độ 1: Làm quen với từ vựng & câu giao tiếp cơ bản',
    badge: '🌱 Khởi đầu vững chắc',
    description: 'Xây dựng vốn từ vựng nền tảng về trường mầm non, đồ dùng, chào hỏi và xưng hô chuẩn mực.',
    lessons: [
      {
        id: 'lvl1-les1',
        title: 'Bài 1: Chào hỏi và làm quen với trẻ',
        target: 'Nắm vững các câu chào buổi sáng, chào phụ huynh và hỏi thăm trẻ nhẹ nhàng.',
        vocabulary: [
          { word: 'Welcome', phonetic: '/ˈwɛlkəm/', vietnamesePhonetic: 'Oen-căm', meaning: 'Chào mừng' },
          { word: 'Smile', phonetic: '/smaɪl/', vietnamesePhonetic: 'S-mai-l', meaning: 'Nụ cười' },
          { word: 'Hug', phonetic: '/hʌɡ/', vietnamesePhonetic: 'Hắc-g', meaning: 'Cái ôm ấm áp' },
          { word: 'Have fun', phonetic: '/hæv fʌn/', vietnamesePhonetic: 'Hép phăn', meaning: 'Học chơi vui vẻ' }
        ],
        dialogue: [
          { speaker: 'Cô giáo', en: 'Good morning, An! Welcome to class!', vi: 'Chào buổi sáng An nhé! Chào mừng con đến lớp!' },
          { speaker: 'Bé An', en: 'Good morning, teacher!', vi: 'Con chào cô giáo ạ!' },
          { speaker: 'Cô giáo', en: 'Give me a big hug! Let\'s have fun today!', vi: 'Cho cô ôm một cái nào! Hôm nay chúng mình học thật vui nhé!' }
        ],
        practicalExercise: {
          situation: 'Buổi sáng bé Nam rụt rè nấp sau lưng mẹ khi đến cửa lớp. Cô giáo nên nói câu nào vừa thân thiện vừa khích lệ bé?',
          question: 'Cô giáo chọn câu tiếng Anh nào phù hợp nhất?',
          options: [
            'Good morning Nam! Come in, give me a high five! Don\'t worry!',
            'Sit down immediately and don\'t cry!',
            'Go back home with your mommy.'
          ],
          correctIndex: 0,
          explanation: 'Câu nói thân thiện "Good morning Nam! Come in, give me a high five!" kèm nụ cười giúp trẻ cảm thấy an toàn và hứng thú bước vào lớp.'
        }
      },
      {
        id: 'lvl1-les2',
        title: 'Bài 2: Từ vựng đồ dùng và đồ chơi trong lớp',
        target: 'Gọi tên chính xác các góc chơi và đồ dùng học tập phổ biến.',
        vocabulary: [
          { word: 'Toy box', phonetic: '/tɔɪ bɒks/', vietnamesePhonetic: 'Toi bóc-s', meaning: 'Thùng đồ chơi' },
          { word: 'Table', phonetic: '/ˈteɪbl/', vietnamesePhonetic: 'Tây-bồ', meaning: 'Cái bàn' },
          { word: 'Chair', phonetic: '/tʃeər/', vietnamesePhonetic: 'Che-ơ', meaning: 'Cái ghế' },
          { word: 'Shelf', phonetic: '/ʃɛlf/', vietnamesePhonetic: 'Se-l-ph', meaning: 'Kệ đựng đồ' }
        ],
        dialogue: [
          { speaker: 'Cô giáo', en: 'Please put your teddy bear in the toy box.', vi: 'Con hãy cất gấu bông vào thùng đồ chơi nhé.' },
          { speaker: 'Bé', en: 'Yes, teacher! In the toy box!', vi: 'Vâng ạ! Vào thùng đồ chơi ạ!' }
        ],
        practicalExercise: {
          situation: 'Cô muốn nhắc các con lấy ghế ngồi vào bàn ngay ngắn.',
          question: 'Cô nên nói câu nào?',
          options: [
            'Take your chair and sit at the table, please.',
            'Throw your chair away.',
            'Run around the table.'
          ],
          correctIndex: 0,
          explanation: '"Take your chair and sit at the table, please" là khẩu lệnh chuẩn mực, lịch sự và rõ ràng với trẻ.'
        }
      }
    ]
  },
  {
    levelNumber: 2,
    levelTitle: 'Cấp độ 2: Giao tiếp tiếng Anh trong sinh hoạt hằng ngày',
    badge: '🌿 Tự tin chăm sóc trẻ',
    description: 'Ứng dụng tiếng Anh vào các giờ sinh hoạt: ăn cơm, uống nước, rửa tay, đi vệ sinh, ngủ trưa và trả trẻ.',
    lessons: [
      {
        id: 'lvl2-les1',
        title: 'Bài 1: Giờ ăn và giữ gìn vệ sinh',
        target: 'Hướng dẫn trẻ rửa tay sạch trước khi ăn, ngồi ngay ngắn và mời cô mời bạn.',
        vocabulary: [
          { word: 'Soap', phonetic: '/səʊp/', vietnamesePhonetic: 'Sô-p', meaning: 'Xà phòng' },
          { word: 'Towel', phonetic: '/ˈtaʊəl/', vietnamesePhonetic: 'Tao-ồ', meaning: 'Khăn lau tay' },
          { word: 'Spoon', phonetic: '/spuːn/', vietnamesePhonetic: 'S-pun', meaning: 'Cái thìa' },
          { word: 'Delicious', phonetic: '/dɪˈlɪʃəs/', vietnamesePhonetic: 'Đi-lít-shơ-s', meaning: 'Rất ngon miệng' }
        ],
        dialogue: [
          { speaker: 'Cô giáo', en: 'Wash hands with soap, then dry with your towel.', vi: 'Rửa tay với xà phòng, rồi lau khô bằng khăn của con nhé.' },
          { speaker: 'Cô giáo', en: 'Enjoy your meal, children!', vi: 'Chúc các con ăn cơm thật ngon miệng!' },
          { speaker: 'Cả lớp', en: 'Thank you, teacher!', vi: 'Chúng con cảm ơn cô ạ!' }
        ],
        practicalExercise: {
          situation: 'Bé làm rơi thìa xuống sàn trong giờ ăn trưa. Cô muốn hướng dẫn bé đổi thìa sạch.',
          question: 'Cô nói gì với bé?',
          options: [
            'It\'s okay. Leave it there, let\'s get a clean spoon for you.',
            'Pick it up and eat with it quickly.',
            'You are punished.'
          ],
          correctIndex: 0,
          explanation: 'Cô động viên và đổi thìa sạch: "It\'s okay... let\'s get a clean spoon for you" đảm bảo vệ sinh và tâm lý thoải mái cho trẻ.'
        }
      },
      {
        id: 'lvl2-les2',
        title: 'Bài 2: Giờ ngủ trưa êm đềm',
        target: 'Lời nhắc nhở nhẹ nhàng vào giờ ngủ trưa và thức dậy.',
        vocabulary: [
          { word: 'Blanket', phonetic: '/ˈblæŋkɪt/', vietnamesePhonetic: 'B-leng-kịt', meaning: 'Cái chăn ấm' },
          { word: 'Pillow', phonetic: '/ˈpɪləʊ/', vietnamesePhonetic: 'Pí-lâu', meaning: 'Cái gối' },
          { word: 'Sweet dreams', phonetic: '/swiːt driːmz/', vietnamesePhonetic: 'S-uýt đrim-z', meaning: 'Giấc mơ đẹp' },
          { word: 'Wake up', phonetic: '/weɪk ʌp/', vietnamesePhonetic: 'Uây-k áp', meaning: 'Thức dậy' }
        ],
        dialogue: [
          { speaker: 'Cô giáo', en: 'Quiet please, time for a nap. Sweet dreams, little ones.', vi: 'Trật tự nào các con, đến giờ ngủ trưa rồi. Chúc các con ngủ ngon nhé.' }
        ],
        practicalExercise: {
          situation: 'Đến giờ thức dậy sau giấc ngủ trưa, cô muốn đánh thức các con nhẹ nhàng.',
          question: 'Câu nào hay nhất cô nên sử dụng?',
          options: [
            'Good afternoon, little angels! Time to wake up and stretch!',
            'Get up immediately or you get zero points!',
            'Stay asleep until tomorrow.'
          ],
          correctIndex: 0,
          explanation: 'Lời đánh thức êm ái: "Good afternoon, little angels! Time to wake up and stretch!" giúp trẻ tỉnh táo dễ chịu.'
        }
      }
    ]
  },
  {
    levelNumber: 3,
    levelTitle: 'Cấp độ 3: Sử dụng tiếng Anh khi tổ chức hoạt động giáo dục',
    badge: '🌸 Nghệ thuật sư phạm',
    description: 'Chỉ dẫn trong các góc hoạt động, tổ chức trò chơi, đặt câu hỏi gợi mở và dẫn dắt bài học.',
    lessons: [
      {
        id: 'lvl3-les1',
        title: 'Bài 1: Giới thiệu trò chơi và luật chơi',
        target: 'Cách diễn đạt luật chơi ngắn gọn, dễ hiểu và truyền cảm hứng.',
        vocabulary: [
          { word: 'Turn', phonetic: '/tɜːn/', vietnamesePhonetic: 'Tơn', meaning: 'Lượt chơi' },
          { word: 'Winner', phonetic: '/ˈwɪnər/', vietnamesePhonetic: 'Uyn-nơ', meaning: 'Người chiến thắng' },
          { word: 'Team', phonetic: '/tiːm/', vietnamesePhonetic: 'Tim', meaning: 'Đội chơi' },
          { word: 'Rules', phonetic: '/ruːlz/', vietnamesePhonetic: 'Ru-l-z', meaning: 'Quy tắc / Luật chơi' }
        ],
        dialogue: [
          { speaker: 'Cô giáo', en: 'It\'s your turn, Mai! Pass the ball to Huy!', vi: 'Đến lượt con rồi Mai! Hãy chuyền bóng cho Huy nhé!' },
          { speaker: 'Cô giáo', en: 'Both teams are doing great! High five!', vi: 'Cả hai đội đều làm rất cừ! Đập tay nào!' }
        ],
        practicalExercise: {
          situation: 'Khi trẻ đang chơi, có hai bạn tranh nhau một quả bóng. Cô muốn hướng dẫn chia sẻ lượt chơi.',
          question: 'Cô xử lý bằng câu tiếng Anh nào?',
          options: [
            'Let\'s share and take turns, please. First Minh, then Nam!',
            'I will throw the ball away because you are fighting.',
            'Give the ball to the strongest boy.'
          ],
          correctIndex: 0,
          explanation: '"Let\'s share and take turns, please. First Minh, then Nam!" giáo dục kỹ năng nhường nhịn và xếp hàng theo lượt.'
        }
      }
    ]
  },
  {
    levelNumber: 4,
    levelTitle: 'Cấp độ 4: Tự tin giao tiếp và xây dựng môi trường tiếng Anh',
    badge: '🌟 Giáo viên xuất sắc',
    description: 'Dẫn chương trình ngày hội, giao tiếp với phụ huynh quốc tế và lồng ghép tiếng Anh toàn diện vào lớp học.',
    lessons: [
      {
        id: 'lvl4-les1',
        title: 'Bài 1: Dẫn chương trình ngày hội và lễ hội mầm non',
        target: 'Mẫu lời dẫn song ngữ chào mừng phụ huynh và khai mạc sự kiện.',
        vocabulary: [
          { word: 'Festival', phonetic: '/ˈfɛstəvl/', vietnamesePhonetic: 'Phet-xti-vồ', meaning: 'Ngày hội' },
          { word: 'Welcome parents', phonetic: '/ˈwɛlkəm ˈpeərənts/', vietnamesePhonetic: 'Oen-căm pe-rần-t-s', meaning: 'Chào mừng quý phụ huynh' },
          { word: 'Performance', phonetic: '/pəˈfɔːməns/', vietnamesePhonetic: 'Pơ-pho-mần-s', meaning: 'Tiết mục biểu diễn' },
          { word: 'Applause', phonetic: '/əˈplɔːz/', vietnamesePhonetic: 'Ơ-p-lo-z', meaning: 'Tràng pháo tay' }
        ],
        dialogue: [
          { speaker: 'Cô giáo', en: 'Warmest welcome to all parents and children to our Spring Festival!', vi: 'Nhiệt liệt chào mừng quý phụ huynh và các con đến với Ngày hội Mùa Xuân!' },
          { speaker: 'Cô giáo', en: 'Please give a big round of applause for our little stars!', vi: 'Xin một tràng pháo tay thật nồng nhiệt cho các ngôi sao nhí của chúng ta!' }
        ],
        practicalExercise: {
          situation: 'Phụ huynh hỏi cô về tình hình hòa nhập tiếng Anh của bé ở lớp.',
          question: 'Cô trả lời bằng câu nào vừa tích cực vừa chuyên nghiệp?',
          options: [
            'Your child loves English songs and is very confident repeating new words every day!',
            'Your child does not know anything.',
            'English is too difficult for your child.'
          ],
          correctIndex: 0,
          explanation: 'Phản hồi mang tính xây dựng: "Your child loves English songs and is very confident repeating new words every day!" giúp phụ huynh phấn khởi và đồng hành cùng con.'
        }
      }
    ]
  }
];

// Danh sách các bài hát tiếng Anh mầm non bất hủ
export const NURSERY_RHYMES_SONGS: EnglishSong[] = [
  {
    id: 'song-hello',
    title: 'Bài hát Xin Chào',
    englishTitle: 'Hello Song for Kids',
    videoId: 'tVlcKp3bWH8',
    theme: 'Chào hỏi',
    lyricsSnippet: 'Hello, hello, how are you? Hello, hello, how are you? I\'m good! I\'m great! I\'m wonderful!',
    emoji: '👋'
  },
  {
    id: 'song-abc',
    title: 'Bài hát Bảng Chữ Cái ABC',
    englishTitle: 'ABC Phonics Song',
    videoId: 'BELlZKpi1Zs',
    theme: 'Chữ cái',
    lyricsSnippet: 'A is for Apple, a-a-apple. B is for Ball, b-b-ball. C is for Cat, c-c-cat...',
    emoji: '🔤'
  },
  {
    id: 'song-head-shoulders',
    title: 'Đầu, Vai, Đầu Gối và Ngón Chân',
    englishTitle: 'Head, Shoulders, Knees & Toes',
    videoId: 'QA48wTGbU7A',
    theme: 'Bộ phận cơ thể',
    lyricsSnippet: 'Head, shoulders, knees and toes, knees and toes! And eyes and ears and mouth and nose!',
    emoji: '👀'
  },
  {
    id: 'song-finger-family',
    title: 'Gia Đình Ngón Tay',
    englishTitle: 'Finger Family Song',
    videoId: 'G6k7dChBaJ8',
    theme: 'Gia đình',
    lyricsSnippet: 'Daddy finger, daddy finger, where are you? Here I am, here I am, how do you do?',
    emoji: '👨‍👩‍👧'
  },
  {
    id: 'song-five-ducks',
    title: 'Năm Chú Vịt Con',
    englishTitle: 'Five Little Ducks',
    videoId: 'pZw9veQ76fo',
    theme: 'Số đếm & Động vật',
    lyricsSnippet: 'Five little ducks went swimming one day, over the hill and far away...',
    emoji: '🦆'
  },
  {
    id: 'song-colors',
    title: 'Bài hát Sắc Màu',
    englishTitle: 'Color Song for Children',
    videoId: 'jYAWf8Y91hA',
    theme: 'Màu sắc',
    lyricsSnippet: 'Red, yellow, green and blue. What color do you like? I like blue, blue, blue!',
    emoji: '🎨'
  }
];
