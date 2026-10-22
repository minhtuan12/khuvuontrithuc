import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, PlayCircle, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '../components/ui/Button';

const SONGS = [
  { id: 1, title: 'Cháu Lên Ba', duration: '2:30', color: 'bg-pink-100', emoji: '👧' },
  { id: 2, title: 'Con Cò Bé Bé', duration: '3:15', color: 'bg-sky-100', emoji: '🐦' },
  { id: 3, title: 'Một Con Vịt', duration: '2:45', color: 'bg-yellow-100', emoji: '🦆' },
  { id: 4, title: 'Rửa Mặt Như Mèo', duration: '1:50', color: 'bg-orange-100', emoji: '🐱' },
];

export default function MusicScreen({ onBack }: { onBack: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(SONGS[0]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="h-full w-full flex flex-col bg-pink-50"
    >
      <div className="flex items-center justify-between p-6">
        <Button variant="outline" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft size={24} />
        </Button>
        <h2 className="text-2xl font-black text-pink-500">Âm Nhạc</h2>
        <div className="w-12" /> {/* Spacer */}
      </div>

      <div className="flex-1 flex flex-col px-6 pb-24">
        <div className={`w-full aspect-square rounded-[3rem] ${currentSong.color} flex flex-col items-center justify-center shadow-lg border-4 border-white mb-8 relative overflow-hidden`}>
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="text-[8rem] drop-shadow-xl"
          >
            {currentSong.emoji}
          </motion.div>
          <div className="absolute bottom-6 bg-white/80 backdrop-blur px-6 py-2 rounded-full font-bold text-slate-700">
            {currentSong.title}
          </div>
        </div>

        <div className="flex justify-center items-center gap-6 mb-8">
          <Button variant="outline" size="icon" disabled title="Chuyển bài trước chưa khả dụng" aria-label="Chuyển bài trước chưa khả dụng" className="w-16 h-16 rounded-full border-pink-200 text-pink-500 disabled:opacity-40 disabled:cursor-not-allowed">
            <SkipBack size={32} fill="currentColor" />
          </Button>
          <Button 
            variant="secondary" 
            size="icon" 
            className="w-24 h-24 rounded-full shadow-xl"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <div className="w-8 h-8 flex gap-2 justify-center">
                <div className="w-3 h-full bg-white rounded-full" />
                <div className="w-3 h-full bg-white rounded-full" />
              </div>
            ) : (
              <PlayCircle size={48} fill="currentColor" className="text-white" />
            )}
          </Button>
          <Button variant="outline" size="icon" disabled title="Chuyển bài tiếp theo chưa khả dụng" aria-label="Chuyển bài tiếp theo chưa khả dụng" className="w-16 h-16 rounded-full border-pink-200 text-pink-500 disabled:opacity-40 disabled:cursor-not-allowed">
            <SkipForward size={32} fill="currentColor" />
          </Button>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto">
          {SONGS.map((song) => (
            <button
              key={song.id}
              onClick={() => {
                setCurrentSong(song);
                setIsPlaying(true);
              }}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${currentSong.id === song.id ? 'bg-white shadow-md border-2 border-pink-200' : 'bg-white/50 hover:bg-white/80'}`}
            >
              <div className={`w-12 h-12 rounded-xl ${song.color} flex items-center justify-center text-2xl`}>
                {song.emoji}
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-slate-700 text-lg">{song.title}</h4>
                <p className="text-slate-500 text-sm">{song.duration}</p>
              </div>
              {currentSong.id === song.id && isPlaying && (
                <div className="flex gap-1 h-4 items-end">
                  <motion.div animate={{ height: ['4px', '16px', '4px'] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 bg-pink-500 rounded-t-full" />
                  <motion.div animate={{ height: ['8px', '12px', '8px'] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 bg-pink-500 rounded-t-full" />
                  <motion.div animate={{ height: ['12px', '4px', '12px'] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 bg-pink-500 rounded-t-full" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
