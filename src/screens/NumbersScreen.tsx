import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';

const NUMBERS = [
  { value: 1, emoji: '🍎', color: 'bg-red-100 text-red-600' },
  { value: 2, emoji: '🚗', color: 'bg-blue-100 text-blue-600' },
  { value: 3, emoji: '🌟', color: 'bg-yellow-100 text-yellow-600' },
  { value: 4, emoji: '🐶', color: 'bg-orange-100 text-orange-600' },
  { value: 5, emoji: '🎈', color: 'bg-pink-100 text-pink-600' },
];

export default function NumbersScreen({ onBack }: { onBack: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = NUMBERS[currentIndex];

  const next = () => setCurrentIndex((prev) => (prev + 1) % NUMBERS.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + NUMBERS.length) % NUMBERS.length);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="h-full w-full flex flex-col bg-yellow-50"
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
            key={current.value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-full flex flex-col items-center"
          >
            <div className={`w-48 h-48 rounded-full ${current.color} flex items-center justify-center shadow-lg border-4 border-white mb-12`}>
              <span className="text-[8rem] font-black leading-none">{current.value}</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 max-w-[280px] min-h-[160px]">
              {Array.from({ length: current.value }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                  className="text-6xl drop-shadow-md"
                >
                  {current.emoji}
                </motion.div>
              ))}
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
