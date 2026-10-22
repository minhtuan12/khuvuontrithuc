import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

const SHAPES = [
  { id: 'circle', emoji: '🔴', name: 'Hình Tròn', color: 'text-red-500' },
  { id: 'square', emoji: '🟦', name: 'Hình Vuông', color: 'text-blue-500' },
  { id: 'triangle', emoji: '🔺', name: 'Hình Tam Giác', color: 'text-red-500' },
  { id: 'star', emoji: '⭐', name: 'Ngôi Sao', color: 'text-yellow-500' },
];

export default function GameScreen({ onBack }: { onBack: () => void }) {
  const [targetShape, setTargetShape] = useState(SHAPES[0]);
  const [showReward, setShowReward] = useState(false);

  const handleMatch = (shape: any) => {
    if (shape.id === targetShape.id) {
      setShowReward(true);
      setTimeout(() => {
        setShowReward(false);
        setTargetShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
      }, 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="h-full w-full flex flex-col bg-purple-50 relative overflow-hidden"
    >
      <div className="flex items-center justify-between p-6">
        <Button variant="outline" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft size={24} />
        </Button>
        <h2 className="text-2xl font-black text-purple-500">Tìm Bóng</h2>
        <div className="w-12" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <h3 className="text-3xl font-black text-slate-700 mb-8 text-center">
          Bóng của hình nào đây?
        </h3>

        <div className="w-48 h-48 bg-slate-800 rounded-3xl flex items-center justify-center mb-12 shadow-inner border-8 border-slate-700">
          <span className="text-[8rem] opacity-50 brightness-0 invert filter drop-shadow-md">
            {targetShape.emoji}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
          {SHAPES.map((shape) => (
            <motion.button
              key={shape.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMatch(shape)}
              className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-slate-200 flex flex-col items-center gap-2"
            >
              <span className="text-6xl drop-shadow-sm">{shape.emoji}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              className="bg-white p-8 rounded-[3rem] flex flex-col items-center gap-4 shadow-2xl"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle2 size={80} className="text-emerald-500" />
              </motion.div>
              <h2 className="text-4xl font-black text-emerald-500">Giỏi Quá!</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
