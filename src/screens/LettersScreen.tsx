import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Volume2, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';

const ALPHABET = [
  { letter: 'A', word: 'Quả Táo', emoji: '🍎', color: 'bg-red-100 text-red-600' },
  { letter: 'B', word: 'Quả Bóng', emoji: '⚽', color: 'bg-blue-100 text-blue-600' },
  { letter: 'C', word: 'Con Cáo', emoji: '🦊', color: 'bg-orange-100 text-orange-600' },
];

export default function LettersScreen({ onBack }: { onBack: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = ALPHABET[currentIndex];

  const next = () => setCurrentIndex((prev) => (prev + 1) % ALPHABET.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + ALPHABET.length) % ALPHABET.length);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="h-full w-full flex flex-col bg-sky-50"
    >
      <div className="flex items-center justify-between p-6">
        <Button variant="outline" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft size={24} />
        </Button>
        <div className="flex gap-2">
          {[1, 2, 3].map((star) => (
            <Star key={star} size={28} className="text-yellow-400 fill-yellow-400" />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.letter}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-full flex flex-col items-center"
          >
            <div className={`w-64 h-64 rounded-[3rem] ${current.color} flex items-center justify-center shadow-lg border-4 border-white mb-8 relative`}>
              <span className="text-[8rem] font-black leading-none">{current.letter}</span>
              <span className="text-6xl font-black absolute bottom-4 right-6 opacity-50">{current.letter.toLowerCase()}</span>
            </div>

            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => speak(`${current.letter}. ${current.word}`)}
              className="mb-12 rounded-full w-20 h-20 !p-0"
            >
              <Volume2 size={36} />
            </Button>

            <div className="bg-white px-8 py-6 rounded-3xl shadow-sm border-2 border-slate-100 flex items-center gap-6 w-full max-w-sm">
              <span className="text-6xl">{current.emoji}</span>
              <span className="text-3xl font-bold text-slate-700">{current.word}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-4 mt-auto w-full max-w-sm">
          <Button variant="outline" className="flex-1" onClick={prev}>Trở lại</Button>
          <Button variant="accent" className="flex-1" onClick={next}>Tiếp theo</Button>
        </div>
      </div>
    </motion.div>
  );
}
