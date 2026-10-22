import React, { useEffect } from 'react';
import { motion } from 'motion/react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 via-pink-100 to-yellow-100"
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.5, duration: 1 }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
          className="text-9xl drop-shadow-2xl mb-6"
        >
          🐻
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-black text-slate-700 text-center px-4 leading-tight drop-shadow-sm"
        >
          <span className="text-sky-500">Bé</span> <span className="text-pink-500">Khám</span> <span className="text-yellow-500">Phá</span><br/>
          <span className="text-emerald-500">Mỗi</span> <span className="text-purple-500">Ngày</span>
        </motion.h1>
      </motion.div>
    </motion.div>
  );
}
