import React from 'react';
import { motion } from 'motion/react';
import { Palette, Type, Hash, Music, Puzzle, Users } from 'lucide-react';
import { cn } from '../lib/utils';

const MENU_ITEMS = [
  { id: 'drawing', label: 'Sáng tạo', icon: Palette, color: 'bg-emerald-200 text-emerald-700 border-emerald-300' },
  { id: 'letters', label: 'Học chữ', icon: Type, color: 'bg-sky-200 text-sky-700 border-sky-300' },
  { id: 'numbers', label: 'Học số', icon: Hash, color: 'bg-yellow-200 text-yellow-700 border-yellow-300' },
  { id: 'music', label: 'Âm nhạc', icon: Music, color: 'bg-pink-200 text-pink-700 border-pink-300' },
  { id: 'games', label: 'Trò chơi', icon: Puzzle, color: 'bg-purple-200 text-purple-700 border-purple-300' },
  { id: 'parent', label: 'Phụ huynh', icon: Users, color: 'bg-slate-200 text-slate-700 border-slate-300' },
];

export default function HomeScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="h-full w-full flex flex-col bg-slate-50 overflow-y-auto pb-24"
    >
      <div className="pt-12 pb-6 px-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-white rounded-full shadow-sm border-2 border-slate-100 flex items-center justify-center text-4xl">
          🐻
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800">Chào bé!</h1>
          <p className="text-slate-500 font-medium">Hôm nay mình học gì nào?</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 px-6">
        {MENU_ITEMS.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate(item.id)}
            className={cn(
              'flex flex-col items-center justify-center p-6 rounded-[2rem] shadow-sm border-b-4 active:border-b-0 active:translate-y-1 transition-all',
              item.color
            )}
          >
            <item.icon size={48} strokeWidth={2.5} className="mb-4" />
            <span className="text-xl font-bold">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
