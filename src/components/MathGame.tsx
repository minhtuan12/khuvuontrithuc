import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, Trophy, Sparkles, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MathGame as MathGameType, MathQuestion } from '../constants/mathData';

interface MathGameProps {
  game: MathGameType;
  onBack: () => void;
  onComplete: (stars: number) => void;
  speak: (text: string, isPraise?: boolean, lang?: string) => Promise<void>;
}

export default function MathGame({ game, onBack, onComplete, speak }: MathGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [stars, setStars] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const answerLocked = useRef(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionAudio = useRef<HTMLAudioElement | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  useEffect(() => {
    answerLocked.current = false;
    return () => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    questionAudio.current?.pause();
    answerLocked.current = true;
    };
  }, []);

  const currentQuestion = game.questions[currentQuestionIndex];

  const playSound = (type: 'correct' | 'wrong') => {
    const audio = new Audio(
      type === 'correct' 
        ? 'https://www.image2url.com/r2/default/files/1777170820315-aa3844e3-6093-46c4-959a-13c9f5263fd5.wav' 
        : 'https://www.image2url.com/r2/default/files/1777170856287-3438c1f6-9782-456a-8706-819b53597a33.wav'
    );
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  useEffect(() => {
    const speakQuestion = async () => {
      if (currentQuestion) {
        if (currentQuestion.audioUrl) {
          setIsSpeaking(true);
          const audio = new Audio(currentQuestion.audioUrl);
          questionAudio.current?.pause();
          questionAudio.current = audio;
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => setIsSpeaking(false);
          audio.play().catch(e => {
            console.log('Question audio play failed:', e);
            setIsSpeaking(false);
          });
        } else {
          const optionLabels = ['A', 'B', 'C', 'D'];
          const optionsText = currentQuestion.options.map((o, i) => `Đáp án ${optionLabels[i]}: ${o.text}`).join('. ');
          setIsSpeaking(true);
          await speak(`${currentQuestion.question}. ${optionsText}`).catch(() => {});
          setIsSpeaking(false);
        }
      }
    };
    speakQuestion();
  }, [currentQuestionIndex]);

  const handleReplay = async () => {
    if (currentQuestion && !isSpeaking) {
      if (currentQuestion.audioUrl) {
        setIsSpeaking(true);
        const audio = new Audio(currentQuestion.audioUrl);
        questionAudio.current?.pause();
        questionAudio.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
        audio.play().catch(e => {
          console.log('Question audio replay failed:', e);
          setIsSpeaking(false);
        });
      } else {
        const optionLabels = ['A', 'B', 'C', 'D'];
        const optionsText = currentQuestion.options.map((o, i) => `Đáp án ${optionLabels[i]}: ${o.text}`).join('. ');
        setIsSpeaking(true);
        await speak(`${currentQuestion.question}. ${optionsText}`).catch(() => {});
        setIsSpeaking(false);
      }
    }
  };

  const handleAnswer = async (optionId: string) => {
    if (answerLocked.current || isFinished) return;
    answerLocked.current = true;
    setIsAnswering(true);
    questionAudio.current?.pause();
    const option = currentQuestion.options.find(o => o.id === optionId);
    if (option) {
      speak(option.text).catch(() => {});
    }

    if (optionId === currentQuestion.correctId) {
      // Correct
      playSound('correct');
      setStars(prev => prev + 1);
      setShowReward(true);
      
      // Fireworks
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF6B9E', '#34A4E4', '#8DE065']
      });

      transitionTimer.current = setTimeout(async () => {
        setShowReward(false);
        if (currentQuestionIndex < game.questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          answerLocked.current = false;
          setIsAnswering(false);
        } else {
          setIsFinished(true);
          await speak(`Chúc mừng bé đã hoàn thành trò chơi và nhận được ${stars + 1} ngôi sao!`, true).catch(() => {});
        }
      }, 2500);
    } else {
      // Wrong
      playSound('wrong');
      answerLocked.current = false;
      setIsAnswering(false);
    }
  };

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center bg-white/80 backdrop-blur-md rounded-[3rem] shadow-2xl border-4 border-white max-w-2xl mx-auto mt-20"
      >
        <Trophy size={120} className="text-yellow-400 mb-6 drop-shadow-lg" />
        <h2 className="text-5xl font-black text-sky-800 mb-4">Tuyệt Vời!</h2>
        <p className="text-2xl text-sky-700 font-bold mb-8">Bé đã hoàn thành tất cả câu hỏi!</p>
        
        <div className="flex gap-4 mb-10">
          {Array.from({ length: Math.min(stars, 5) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring' }}
            >
              <Star size={60} className="text-yellow-400 fill-yellow-400 drop-shadow-md" />
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => onComplete(stars)}
          className="bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black text-2xl py-6 px-12 rounded-full shadow-xl border-4 border-white hover:scale-105 transition-transform"
        >
          Tiếp tục học nào! 🚀
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto p-4 sm:p-6 pb-32">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8 sticky top-4 z-20 bg-white/80 backdrop-blur-md p-4 rounded-[2rem] shadow-sm border-2 border-white">
        <button
          onClick={onBack}
          className="p-3 bg-sky-50 rounded-full shadow-sm text-sky-600 border border-sky-100 hover:bg-sky-100 transition-colors"
        >
          <ArrowLeft size={28} strokeWidth={3} />
        </button>
        
        <div className="flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-black text-sky-800">{game.title}</h2>
          <div className="text-sky-600 font-bold text-sm">Câu {currentQuestionIndex + 1} / {game.questions.length}</div>
        </div>

        <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full border-2 border-yellow-200">
          <Star size={24} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xl font-black text-yellow-700">{stars}</span>
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white rounded-[3rem] p-8 sm:p-12 shadow-xl border-4 border-sky-50 flex flex-col items-center gap-8 relative overflow-hidden"
      >
        {/* Decorations */}
        <div className="absolute top-4 left-4 text-4xl opacity-20">✨</div>
        <div className="absolute bottom-4 right-4 text-4xl opacity-20">🎨</div>

        <h3 className="text-3xl sm:text-4xl font-black text-slate-700 text-center leading-tight">
          {currentQuestion.question}
        </h3>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleReplay}
          disabled={isSpeaking}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-black shadow-sm border-2 transition-colors ${isSpeaking ? 'bg-yellow-100 text-yellow-600 border-yellow-200 animate-pulse' : 'bg-sky-100 text-sky-600 border-sky-200 hover:bg-sky-200'}`}
        >
          <Sparkles size={24} className={isSpeaking ? 'animate-spin' : ''} />
          {isSpeaking ? 'Đang đọc câu hỏi...' : 'Nghe lại câu hỏi'}
        </motion.button>

        {currentQuestion.hint && (
          <div className="text-6xl sm:text-8xl p-6 bg-sky-50 rounded-[2rem] border-2 border-sky-100 shadow-inner">
            {currentQuestion.hint}
          </div>
        )}

        <div className={`grid ${currentQuestion.options.length > 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'} gap-6 w-full mt-4`}>
          {currentQuestion.options.map((option, index) => {
            const label = ['A', 'B', 'C', 'D'][index];
            return (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
                disabled={isAnswering}
                onClick={() => handleAnswer(option.id)}
                className={`${option.color} rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 shadow-lg border-4 border-white group relative overflow-hidden min-h-[180px]`}
              >
                <div className="absolute top-4 right-4 text-sky-400/30">
                  <Volume2 size={20} />
                </div>
                
                <div className="absolute top-4 left-6">
                  <span className="text-3xl font-black text-slate-400/50 group-hover:text-slate-500 transition-colors">{label}.</span>
                </div>
                
                {option.emoji && (
                  <span className="text-7xl sm:text-8xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                    {option.emoji}
                  </span>
                )}
                
                <span className={`text-4xl sm:text-5xl font-black ${option.emoji ? 'text-slate-700/80' : 'text-slate-700'} drop-shadow-sm`}>
                  {option.text}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Reward Overlay */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-sky-400/20 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              className="bg-white p-12 rounded-[4rem] shadow-2xl border-8 border-yellow-400 flex flex-col items-center gap-6"
            >
              <div className="relative">
                <Star size={120} className="text-yellow-400 fill-yellow-400 drop-shadow-xl" />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Sparkles size={140} className="text-yellow-300" />
                </motion.div>
              </div>
              <h2 className="text-5xl font-black text-yellow-600 drop-shadow-sm">Giỏi Quá!</h2>
              <div className="text-2xl font-bold text-sky-600">+1 Ngôi sao</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
