import React, { useState, useRef, useEffect } from 'react';
import { stopAssistantSpeech } from '../lib/assistantSpeech';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, Sparkles, Mic, Square, Volume2, RotateCcw,
  ArrowLeft, MessageCircle, BookOpen, Users, Lightbulb,
  CheckCircle2, Bot, User, Trash2
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

interface AIAssistantProps {
  onBack: () => void;
  speak: (text: string, forceVoice?: boolean, lang?: string) => Promise<void>;
  isSpeaking?: boolean;
}

const SAMPLE_QUESTIONS = [
  { icon: '☀️', text: 'Vì sao ban ngày có mặt trời, ban đêm có trăng sao?', category: 'nature' },
  { icon: '🔢', text: 'Dạy bé đếm số từ 1 đến 10 thật vui nhộn!', category: 'math' },
  { icon: '🐰', text: 'Con thỏ thích ăn gì và sống ở đâu thế trợ lý?', category: 'animals' },
  { icon: '🎨', text: 'Hướng dẫn bé vẽ một chú mèo con siêu dễ thương', category: 'art' },
  { icon: '🧸', text: 'Làm sao để bé biết chia sẻ đồ chơi cùng bạn bè?', category: 'social' },
  { icon: '🦁', text: 'Kể cho bé nghe câu chuyện ngắn về chú sư tử dũng cảm', category: 'story' },
  { icon: '🏃‍♂️', text: 'Gợi ý 1 trò chơi vận động giải phóng năng lượng tại nhà', category: 'physical' },
  { icon: '🥦', text: 'Vì sao bé cần ăn nhiều rau xanh và trái cây tươi?', category: 'health' },
];

export const AIAssistant: React.FC<AIAssistantProps> = ({ onBack, speak }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      text: 'Chào bé yêu và bố mẹ! 👋 Tớ là Bạn Đồng Hành AI trong Khu Vườn Tri Thức. Bé có câu hỏi gì thắc mắc, muốn nghe kể chuyện hay học gì vui cùng tớ hôm nay nào? Hãy hỏi tớ bất cứ điều gì nhé! 🌸✨',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeMode, setActiveMode] = useState<'kids' | 'story' | 'parents'>('kids');
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState('');
  const playbackId = useRef(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mounted = useRef(true);
  const requestPending = useRef(false);
  const requestController = useRef<AbortController | null>(null);
  const recordingStarting = useRef(false);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      playbackId.current++;
      stopAssistantSpeech();
      requestController.current?.abort();
      const recorder = mediaRecorderRef.current;
      if (recorder) {
        recorder.onstop = null;
        if (recorder.state !== 'inactive') recorder.stop();
        recorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initial welcome greeting speech
  useEffect(() => {
    const welcome = 'Chào bé yêu và bố mẹ! Tớ là Bạn Đồng Hành AI trong Khu Vườn Tri Thức. Bé hãy hỏi tớ bất cứ điều gì nhé!';
    speak(welcome).catch(() => { });
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || requestPending.current || isLoading || isRecording || recordingStarting.current) return;
    requestPending.current = true;
    const controller = new AbortController();
    requestController.current = controller;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageContent,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      let aiResponseText = '';

      // All AI requests stay on the server-side proxy.
      try {
        const res = await fetch('/api/assistant/chat', {
          signal: controller.signal,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: messageContent,
            mode: activeMode,
            history: messages.slice(-6).map(m => ({ role: m.role, text: m.text }))
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (typeof data.text === 'string' && data.text.trim()) {
            aiResponseText = data.text.trim();
          }
        }
      } catch (err) {
        // Show the recoverable connection message below.
      }

      if (!mounted.current) return;
      if (!aiResponseText) throw new Error('Assistant service unavailable');

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Automatically speak the first sentence or read aloud
      speak(aiResponseText).catch(() => { });

    } catch (error) {
      if (!mounted.current) return;
      console.error('AI Chat Error:', error);
      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: 'Ôi, trợ lý vừa bị ngắt kết nối một chút rồi! Bé hãy thử nhấn hỏi lại tớ nhé! 🌸',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      requestPending.current = false;
      if (mounted.current) setIsLoading(false);
    }
  };

  const handleSpeakMessage = async (msgId: string, text: string) => {
    const requestId = ++playbackId.current;
    if (playingMessageId === msgId) {
      stopAssistantSpeech();
      setPlayingMessageId(null);
      return;
    }
    setPlaybackError('');
    setPlayingMessageId(msgId);
    try {
      await speak(text, true);
    } catch (error) {
      if (mounted.current && requestId === playbackId.current) { };
    } finally {
      if (mounted.current && requestId === playbackId.current) setPlayingMessageId(null);
    }
  };

  const handleClearHistory = () => {
    if (requestPending.current || recordingStarting.current || isRecording) return;
    setMessages([
      {
        id: 'welcome-msg-reset',
        role: 'assistant',
        text: 'Tớ đã sẵn sàng cho cuộc trò chuyện mới rồi! Bé và bố mẹ muốn tìm hiểu điều gì cùng tớ nào? 🎈✨',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    speak('Tớ đã sẵn sàng cho cuộc trò chuyện mới rồi! Bé hãy đặt câu hỏi nhé!').catch(() => { });
  };

  // Voice recording logic
  const startRecording = async () => {
    if (requestPending.current || isLoading || isRecording || recordingStarting.current) return;
    recordingStarting.current = true;
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        if (!mounted.current) return;
        requestPending.current = true;
        const controller = new AbortController();
        requestController.current = controller;
        setIsLoading(true);
        try {
          const mimeType = mediaRecorder.mimeType || audioChunksRef.current[0]?.type || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const audioBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('Cannot read recording'));
            reader.onload = () => resolve(String(reader.result).split(',')[1]);
            reader.readAsDataURL(audioBlob);
          });
          const response = await fetch('/api/assistant/voice', {
            signal: controller.signal,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64, mimeType, mode: activeMode })
          });
          if (!response.ok) throw new Error('Voice service unavailable');
          const data = await response.json();
          if (!mounted.current) return;
          if (typeof data.text !== 'string' || !data.text.trim()) throw new Error('Empty voice reply');
          setMessages(prev => [...prev,
          { id: `user-voice-${Date.now()}`, role: 'user', text: '🎙️ [Bé đã nói qua Micro]', time: new Date().toLocaleTimeString() },
          { id: `assistant-voice-${Date.now()}`, role: 'assistant', text: data.text, time: new Date().toLocaleTimeString() }
          ]);
          speak(data.text).catch(() => { });
        } catch (err) {
          if (!mounted.current) return;
          setMessages(prev => [...prev, { id: `voice-error-${Date.now()}`, role: 'assistant', text: 'Tớ chưa nghe được câu hỏi. Bé thử lại hoặc nhập câu hỏi nhé!', time: new Date().toLocaleTimeString() }]);
        } finally {
          requestPending.current = false;
          if (mounted.current) setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      stream?.getTracks().forEach(track => track.stop());
      console.error('Microphone error:', error);
      if (mounted.current) {
        setMessages(prev => [...prev, {
          id: `microphone-error-${Date.now()}`,
          role: 'assistant',
          text: 'Tớ chưa mở được micro. Bố mẹ kiểm tra quyền microphone giúp bé nhé! Bé cũng có thể nhập câu hỏi bên dưới.',
          time: new Date().toLocaleTimeString()
        }]);
      }
    } finally {
      recordingStarting.current = false;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording' && isRecording) {
      requestPending.current = true;
      setIsLoading(true);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      className="min-h-screen flex flex-col items-center pt-6 sm:pt-10 pb-36 px-3 sm:px-6 relative z-10 w-full max-w-5xl mx-auto"
    >
      {/* Top Header Card */}
      <div className="w-full bg-white/95 backdrop-blur-md rounded-[32px] p-4 sm:p-6 shadow-xl border-3 border-amber-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4 w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onBack}
            className="p-3 bg-amber-50 hover:bg-amber-100 rounded-2xl text-amber-700 transition-colors border border-amber-200 shrink-0 cursor-pointer"
            title="Quay lại trang chủ"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
          </motion.button>

          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-slate-900 flex items-center justify-center text-3xl sm:text-4xl shadow-md border-2 border-white shrink-0">
            🤖
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Bạn Đồng Hành Học Tập AI
              </h2>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-300">
                ✨ Trực tuyến
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-bold">
              Trò chuyện tương tác, giải đáp vạn câu hỏi vì sao & kể chuyện cho bé yêu
            </p>
          </div>
        </div>

        {/* Header Right Actions: Mode Selector & Clear Chat */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Mode Tabs */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200">
            <button
              onClick={() => {
                if (requestPending.current || recordingStarting.current || isRecording) return;
                setActiveMode('kids');
                speak('Chế độ hỏi đáp cùng bé');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${activeMode === 'kids'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              🎈 Bé Hỏi Đáp
            </button>
            <button
              onClick={() => {
                if (requestPending.current || recordingStarting.current || isRecording) return;
                setActiveMode('story');
                speak('Chế độ kể chuyện sáng tạo');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${activeMode === 'story'
                  ? 'bg-white text-purple-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              📖 Kể Chuyện
            </button>
            <button
              onClick={() => {
                if (requestPending.current || recordingStarting.current || isRecording) return;
                setActiveMode('parents');
                speak('Chế độ phụ huynh và cô giáo');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${activeMode === 'parents'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              👩‍🏫 Cho Bố Mẹ & Cô
            </button>
          </div>

          <button
            disabled={isLoading || isRecording}
            onClick={handleClearHistory}
            className="p-2.5 bg-rose-50 hover:bg-rose-100 rounded-xl text-rose-600 transition-colors border border-rose-200 cursor-pointer shrink-0"
            title="Xóa lịch sử và bắt đầu cuộc trò chuyện mới"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="w-full bg-white/90 backdrop-blur-md rounded-[36px] shadow-2xl border-4 border-white flex flex-col overflow-hidden min-h-[580px] h-[68vh] relative">

        {/* Chat Messages Scrolling Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const isPlaying = playingMessageId === message.id;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-sm shrink-0 border-2 border-white ${isUser
                      ? 'bg-gradient-to-tr from-sky-400 to-blue-500 text-white'
                      : 'bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 text-slate-800'
                    }`}
                >
                  {isUser ? '🧒' : '🤖'}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 sm:p-5 rounded-[24px] shadow-sm relative text-sm sm:text-base leading-relaxed font-bold ${isUser
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-tr-none'
                        : 'bg-gradient-to-br from-amber-50/90 via-white to-sky-50/70 text-slate-800 border-2 border-amber-200/80 rounded-tl-none shadow-md shadow-amber-900/5'
                      }`}
                  >
                    <div className="whitespace-pre-wrap">{message.text}</div>

                    {/* Audio read-aloud button for Assistant responses */}
                    {!isUser && (
                      <div className="mt-3 pt-2.5 border-t border-amber-200/50 flex items-center justify-between gap-3">
                        <span className="text-[10px] text-slate-600 font-extrabold flex items-center gap-1">
                          <span>🌱</span> Bạn Đồng Hành AI
                        </span>

                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => handleSpeakMessage(message.id, message.text)}
                          className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${isPlaying
                              ? 'bg-amber-500 text-white animate-pulse'
                              : 'bg-white hover:bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                        >
                          <Volume2 size={14} className={isPlaying ? 'animate-bounce' : ''} />
                          <span>{isPlaying ? 'Dừng đọc' : 'Nghe đọc 🔊'}</span>
                        </motion.button>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-slate-600 mt-1 px-1">
                    {message.time}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {playbackError && <p role="alert" className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">{playbackError}</p>}
          {/* AI Thinking Animation */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-300 to-yellow-200 flex items-center justify-center text-xl shadow-sm border-2 border-white shrink-0">
                🤖
              </div>
              <div className="p-4 rounded-[22px] rounded-tl-none bg-amber-50 border-2 border-amber-200 flex items-center gap-2.5 text-amber-900 font-black text-xs sm:text-sm shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1">Trợ lý đang suy nghĩ câu trả lời cho bé... 💡</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips (Gợi ý câu hỏi tương tác) */}
        <div className="px-4 py-2.5 bg-amber-50/70 border-t border-amber-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-black text-amber-800 whitespace-nowrap flex items-center gap-1 shrink-0">
            <Lightbulb size={14} className="text-amber-500" />
            <span>Gợi ý câu hỏi:</span>
          </span>
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.text)}
              disabled={isLoading || isRecording}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-amber-100/80 text-slate-700 hover:text-amber-900 border border-amber-200 text-xs font-bold whitespace-nowrap transition-all shadow-2xs hover:scale-102 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{q.icon}</span>
              <span>{q.text}</span>
            </button>
          ))}
        </div>

        {/* Interactive Bottom Input Bar */}
        <div className="p-3 sm:p-4 bg-white/95 border-t-2 border-amber-100 flex items-center gap-2.5 shrink-0">

          {/* Voice Input Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3.5 rounded-2xl shadow-sm transition-all border cursor-pointer shrink-0 ${isRecording
                ? 'bg-rose-500 text-white animate-pulse border-rose-600 shadow-rose-300'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
              }`}
            title={isRecording ? 'Dừng ghi âm' : 'Nói câu hỏi qua Micro'}
            aria-label={isRecording ? 'Dừng ghi âm' : 'Nói câu hỏi qua Micro'}
          >
            {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
          </motion.button>

          {/* Text Input */}
          <input
            type="text"
            maxLength={4000}
            aria-label="Nhập câu hỏi cho trợ lý AI"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              isRecording
                ? 'Đang lắng nghe bé nói...'
                : activeMode === 'story'
                  ? 'Nhập nhân vật hoặc chủ đề bé muốn nghe kể chuyện (ví dụ: chú gấu dũng cảm)...'
                  : activeMode === 'parents'
                    ? 'Nhập câu hỏi phụ huynh / cô giáo quan tâm...'
                    : 'Bé hãy nhập câu hỏi muốn trò chuyện cùng trợ lý AI nhé...'
            }
            disabled={isLoading || isRecording}
            className="flex-1 px-4 py-3 bg-slate-50 hover:bg-white focus:bg-white rounded-2xl border-2 border-amber-200 text-slate-800 font-bold text-sm sm:text-base focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all shadow-inner placeholder:text-slate-400"
          />

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputText.trim() || isRecording}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-md hover:shadow-lg flex items-center gap-2 border border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 transition-all"
          >
            <span>Gửi</span>
            <Send size={16} />
          </motion.button>
        </div>

      </div>

      {/* Helpful Preschool Footnote */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500 font-bold flex items-center justify-center gap-1.5">
          <span>🛡️</span>
          <span>Trợ lý AI được tối ưu riêng cho giáo dục mầm non, thân thiện, an toàn và kích thích trí tò mò của trẻ.</span>
        </p>
      </div>

    </motion.div>
  );
};

export default AIAssistant;
