import React from 'react';
import { motion } from 'motion/react';
import magicalTreeImage from '../assets/images/pixar_magical_tree_1792640359460.jpg';
import physicalImage from '../assets/images/pixar_icon_physical_1792641321569.jpg';
import cognitiveImage from '../assets/images/pixar_icon_cognitive_1792641322103.jpg';
import languageImage from '../assets/images/pixar_icon_language_1792641322494.jpg';
import socialImage from '../assets/images/pixar_icon_social_1792641322497.jpg';
import aestheticImage from '../assets/images/pixar_icon_aesthetic_1792641322367.jpg';

// ==========================================
// 1. MASCOT 3D BUNNY (THỎ BÔNG MIU MIU)
// ==========================================
export const Mascot3DBunny: React.FC<{
  size?: number;
  className?: string;
  onClick?: () => void;
  showSpeechBubble?: boolean;
  bubbleText?: string;
}> = ({
  size = 140,
  className = '',
  onClick,
  showSpeechBubble = false,
  bubbleText = "Chào bé yêu! Cùng tớ khám phá nhé!"
}) => {
  return (
    <div 
      className={`relative inline-flex flex-col items-center select-none cursor-pointer group ${className}`}
      onClick={onClick}
    >
      {/* Speech Bubble */}
      {showSpeechBubble && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute -top-12 z-20 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border-2 border-amber-200 text-xs font-black text-amber-900 whitespace-nowrap flex items-center gap-1.5"
        >
          <span className="text-amber-500">✨</span>
          <span>{bubbleText}</span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-amber-200 rotate-45"></div>
        </motion.div>
      )}

      {/* 3D Rendered Vector Mascot */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 1.5, -1.5, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 200 200"
          width="100%"
          height="100%"
          className="filter drop-shadow-[0_12px_16px_rgba(245,158,11,0.25)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Fur gradient */}
            <radialGradient id="bunnyFur" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#FFF7ED" />
              <stop offset="100%" stopColor="#FED7AA" />
            </radialGradient>
            
            {/* Ear inside gradient */}
            <linearGradient id="bunnyEarInner" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDA4AF" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>

            {/* Cheek blush gradient */}
            <radialGradient id="bunnyCheek" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FB7185" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
            </radialGradient>

            {/* Eye gradient */}
            <radialGradient id="bunnyEye" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="70%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#082F49" />
            </radialGradient>

            {/* Backpack gradient */}
            <linearGradient id="bunnyBackpack" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>

            {/* Shirt gradient */}
            <linearGradient id="bunnyShirt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>

          {/* Bunny Body Shadow */}
          <ellipse cx="100" cy="188" rx="55" ry="10" fill="#000000" opacity="0.14" />

          {/* Backpack Straps & Bag Behind */}
          <rect x="52" y="118" width="16" height="42" rx="8" fill="url(#bunnyBackpack)" />
          <rect x="132" y="118" width="16" height="42" rx="8" fill="url(#bunnyBackpack)" />
          <circle cx="100" cy="148" r="42" fill="#CA8A04" />
          <circle cx="100" cy="146" r="40" fill="url(#bunnyBackpack)" />

          {/* Ears Left */}
          <g transform="rotate(-14 70 65)">
            <ellipse cx="70" cy="45" rx="18" ry="42" fill="url(#bunnyFur)" />
            <ellipse cx="70" cy="48" rx="9" ry="30" fill="url(#bunnyEarInner)" opacity="0.75" />
          </g>

          {/* Ears Right */}
          <g transform="rotate(14 130 65)">
            <ellipse cx="130" cy="45" rx="18" ry="42" fill="url(#bunnyFur)" />
            <ellipse cx="130" cy="48" rx="9" ry="30" fill="url(#bunnyEarInner)" opacity="0.75" />
          </g>

          {/* Body */}
          <ellipse cx="100" cy="148" rx="38" ry="34" fill="url(#bunnyFur)" />

          {/* Little Blue Overalls Shirt */}
          <path d="M 72 135 Q 100 148 128 135 L 124 172 Q 100 178 76 172 Z" fill="url(#bunnyShirt)" />
          <circle cx="85" cy="145" r="3.5" fill="#FEF08A" />
          <circle cx="115" cy="145" r="3.5" fill="#FEF08A" />

          {/* Head */}
          <circle cx="100" cy="100" r="48" fill="url(#bunnyFur)" />

          {/* Cheeks Blush */}
          <circle cx="70" cy="114" r="14" fill="url(#bunnyCheek)" />
          <circle cx="130" cy="114" r="14" fill="url(#bunnyCheek)" />

          {/* Big Sparkly Eyes */}
          {/* Left Eye */}
          <g>
            <ellipse cx="80" cy="96" rx="9" ry="12" fill="url(#bunnyEye)" />
            <ellipse cx="77" cy="92" rx="3.5" ry="5" fill="#FFFFFF" />
            <circle cx="83" cy="102" r="1.8" fill="#FFFFFF" />
          </g>

          {/* Right Eye */}
          <g>
            <ellipse cx="120" cy="96" rx="9" ry="12" fill="url(#bunnyEye)" />
            <ellipse cx="117" cy="92" rx="3.5" ry="5" fill="#FFFFFF" />
            <circle cx="123" cy="102" r="1.8" fill="#FFFFFF" />
          </g>

          {/* Cute Nose */}
          <polygon points="96,108 104,108 100,113" fill="#F43F5E" />

          {/* Happy Mouth */}
          <path d="M 94 113 Q 100 118 100 115 Q 100 118 106 113" stroke="#991B1B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 96 115 Q 100 124 104 115 Z" fill="#FB7185" />

          {/* Paws */}
          <ellipse cx="70" cy="150" rx="9" ry="8" fill="#FFFFFF" />
          <ellipse cx="130" cy="150" rx="9" ry="8" fill="#FFFFFF" />

          {/* Tiny Star on Ear */}
          <path d="M 142 22 L 144 28 L 150 28 L 145 32 L 147 38 L 142 34 L 137 38 L 139 32 L 134 28 L 140 28 Z" fill="#FBBF24" />
        </svg>
      </motion.div>
    </div>
  );
};


// ==========================================
// 2. HERO 3D BANNER SCENE (THẾ GIỚI VUI HỌC CỦA BÉ)
// ==========================================
export const Hero3DScene: React.FC<{
  onExploreClick: () => void;
  onEnglishClick?: () => void;
  onMascotClick?: () => void;
}> = ({ onExploreClick, onEnglishClick, onMascotClick }) => {
  return (
    <div className="relative w-full rounded-[40px] overflow-hidden bg-gradient-to-br from-[#E0F2FE] via-[#F0FDF4] to-[#FFFBEB] border-4 border-white shadow-[0_20px_50px_rgba(14,165,233,0.15)] p-6 sm:p-10 lg:p-12">
      {/* Background Soft Dot Watermark Pattern */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #38BDF8 1.8px, transparent 1.8px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Background Magical Ambient Light */}
      <div className="absolute -top-16 -right-16 w-80 h-80 bg-gradient-to-br from-amber-200/50 via-yellow-100/30 to-sky-100/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-gradient-to-tr from-sky-200/40 via-emerald-100/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      
      {/* 3D Smiling Happy Sun with Rosy Cheeks */}
      <motion.div
        animate={{ rotate: [0, 6, 0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        className="absolute top-4 right-6 sm:right-16 pointer-events-none z-0 hidden sm:block"
      >
        <svg width="90" height="90" viewBox="0 0 100 100" fill="none" className="filter drop-shadow-lg">
          <defs>
            <radialGradient id="sunFaceGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="60%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
            <linearGradient id="rayGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          {/* Sun Rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
            <rect
              key={idx}
              x="47"
              y="6"
              width="6"
              height="14"
              rx="3"
              fill="url(#rayGrad)"
              transform={`rotate(${angle} 50 50)`}
            />
          ))}
          {/* Main Sun Body */}
          <circle cx="50" cy="50" r="28" fill="url(#sunFaceGrad)" stroke="#FFFFFF" strokeWidth="3" />
          {/* Twinkling Eyes */}
          <ellipse cx="42" cy="48" rx="2.8" ry="3.8" fill="#451A03" />
          <circle cx="41" cy="46.5" r="1.2" fill="#FFFFFF" />
          <ellipse cx="58" cy="48" rx="2.8" ry="3.8" fill="#451A03" />
          <circle cx="57" cy="46.5" r="1.2" fill="#FFFFFF" />
          {/* Cheerful Rosy Cheeks */}
          <circle cx="37" cy="54" r="3.5" fill="#FB7185" opacity="0.65" />
          <circle cx="63" cy="54" r="3.5" fill="#FB7185" opacity="0.65" />
          {/* Gentle Smile */}
          <path d="M 44 54 Q 50 60 56 54" stroke="#78350F" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* Soft Pastel 3D Rainbow */}
      <svg className="absolute top-2 left-4 sm:left-10 w-64 sm:w-80 h-32 opacity-80 pointer-events-none filter drop-shadow-sm" viewBox="0 0 300 140">
        <path d="M 20 140 A 130 130 0 0 1 280 140" stroke="#FDA4AF" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M 28 140 A 122 122 0 0 1 272 140" stroke="#FDE047" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d="M 36 140 A 114 114 0 0 1 264 140" stroke="#86EFAC" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M 44 140 A 106 106 0 0 1 256 140" stroke="#7DD3FC" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d="M 52 140 A 98 98 0 0 1 248 140" stroke="#C4B5FD" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.85" />
      </svg>

      {/* Floating 3D Fluffy Clouds with Soft Shadows */}
      <motion.div
        animate={{ x: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        className="absolute top-8 left-1/3 hidden md:block pointer-events-none"
      >
        <svg width="120" height="65" viewBox="0 0 120 65" fill="none" className="filter drop-shadow-md">
          <ellipse cx="60" cy="45" rx="50" ry="18" fill="#FFFFFF" fillOpacity="0.95" />
          <circle cx="44" cy="34" r="24" fill="#FFFFFF" fillOpacity="0.98" />
          <circle cx="75" cy="32" r="20" fill="#FFFFFF" fillOpacity="0.98" />
          <circle cx="95" cy="42" r="14" fill="#FFFFFF" fillOpacity="0.9" />
        </svg>
      </motion.div>

      {/* Fluttering Cute 3D Pastel Butterflies */}
      <motion.div
        animate={{ y: [0, -10, 0], x: [0, 6, 0], rotate: [-4, 6, -4] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute top-24 left-1/4 hidden lg:block pointer-events-none"
      >
        <div className="text-2xl filter drop-shadow-sm select-none">🦋</div>
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0], x: [0, -8, 0], rotate: [5, -5, 5] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
        className="absolute top-14 right-1/3 hidden lg:block pointer-events-none"
      >
        <div className="text-xl filter drop-shadow-sm select-none">✨</div>
      </motion.div>

      {/* Cute Floating 3D Blossom Accents at Bottom */}
      <div className="absolute bottom-2 left-8 hidden sm:flex items-center gap-2 pointer-events-none opacity-80">
        <span className="text-lg">🌸</span>
        <span className="text-base">🌼</span>
        <span className="text-sm">🌱</span>
      </div>

      {/* Main Grid Content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
        {/* Left Text & CTA Column */}
        <div className="flex-1 text-center lg:text-left">
          
          {/* Top Kicker Label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-black mb-4 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ỨNG DỤNG MẦM NON 4.0</span>
            <span className="text-emerald-300">·</span>
            <span className="text-slate-600 font-extrabold">Bộ GD&ĐT</span>
          </div>

          {/* Prominent Hero Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-3 select-none">
            <span className="title-khu-vuon-tri-thuc-solid inline-block tracking-tight py-1">
              Khu Vườn Tri Thức
            </span>
          </h1>

          {/* Friendly Subtitle / Greeting */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-800 font-bold max-w-xl mb-6 sm:mb-8 leading-relaxed mx-auto lg:mx-0">
            Chào mừng các bé yêu và quý thầy cô đến với Khu vườn tri thức kỳ diệu! 
            Nơi ươm mầm tài năng qua <strong className="text-emerald-700 font-black">5 lĩnh vực cốt lõi</strong>, phân hệ 
            <strong className="text-indigo-700 font-black"> Tiếng Anh song ngữ</strong> và công cụ đắc lực cho giáo viên.
          </p>

          {/* Primary 3D Tactile Action Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <button
              onClick={onExploreClick}
              className="btn-3d px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-base sm:text-lg border-2 border-emerald-300 flex items-center gap-2.5 shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <span>Khám Phá Bài Học Ngay</span>
              <span className="text-xl">🚀</span>
            </button>

            <button
              onClick={() => {
                if (onEnglishClick) {
                  onEnglishClick();
                } else {
                  onExploreClick();
                }
              }}
              className="btn-3d px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 text-white font-black text-base border-2 border-indigo-200 flex items-center gap-2.5 shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              <span className="text-xl">🎙️</span>
              <span>Tiếng Anh Cùng Cô Giáo</span>
            </button>
          </div>

          {/* Trust Highlights Row */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 mt-6 sm:mt-8 text-xs font-black text-slate-600">
            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white shadow-xs">
              <span className="text-emerald-500 font-black">✔</span> 5 Lĩnh vực chuẩn Bộ GD&ĐT
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white shadow-xs">
              <span className="text-sky-500 font-black">✔</span> Luyện phát âm & Tiếng Anh song ngữ
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white shadow-xs">
              <span className="text-amber-500 font-black">✔</span> Trợ lý AI giáo án mầm non
            </span>
          </div>
        </div>

        {/* Right 3D Visual Scene Column - Pixar 3D Enchanted Garden Tree */}
        <div className="relative shrink-0 flex items-center justify-center">
          
          {/* Ambient Glow Aura */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-400/25 via-pink-300/30 to-amber-300/25 rounded-[48px] blur-2xl pointer-events-none animate-pulse"></div>

          {/* Main 3D Pixar Tree Showcase Card */}
          <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="relative w-72 sm:w-96 lg:w-[440px] aspect-square rounded-[36px] sm:rounded-[44px] p-2 sm:p-2.5 bg-white/95 backdrop-blur-md border-4 sm:border-6 border-white shadow-[0_24px_50px_rgba(16,185,129,0.22)] overflow-hidden group cursor-pointer"
            onClick={onMascotClick || onExploreClick}
          >
            {/* Pixar 3D Image Container */}
            <div className="w-full h-full rounded-[28px] sm:rounded-[36px] overflow-hidden relative shadow-inner">
              <img
                src={magicalTreeImage}
                alt="Vườn Cây Tri Thức Mầm Non Phong Cách Pixar 3D Ngập Tràn Hoa Tươi"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
              />

              {/* Shimmer Light Reflection Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/15 via-transparent to-white/20 pointer-events-none"></div>

              {/* Top-Left Floating Badge: Phong cách 3D Pixar */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-emerald-950 font-black text-[11px] sm:text-xs shadow-md border border-white">
                  <span className="animate-spin text-sm">✨</span>
                  <span>Vườn Cây Pixar 3D</span>
                  <span className="text-pink-500">🌸</span>
                </span>
              </div>

              {/* Top-Right Floating Floral Sprinkles */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex flex-col items-center gap-1.5 pointer-events-none">
                <span className="text-xl filter drop-shadow-md animate-bounce">🌸</span>
                <span className="text-lg filter drop-shadow-md">🌺</span>
                <span className="text-sm filter drop-shadow-md">🌼</span>
              </div>
            </div>

            {/* Bottom-Left Floating Interactive Preschool Badge */}
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute bottom-4 left-4 z-20"
            >
              <div className="bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 border-2 border-emerald-300 shadow-xl shadow-emerald-700/20 flex items-center gap-2.5">
                <span className="text-2xl sm:text-3xl">🌳</span>
                <div>
                  <div className="text-[10px] sm:text-[11px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">
                    <span>Vườn Hoa Tri Thức</span>
                    <span>🌷</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-800">Ươm mầm tài năng nhí 🌸</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};


// ==========================================
// 3. THE 7 3D CATEGORY ICONS (PHONG CÁCH PIXAR 3D CAO CẤP)
// ==========================================
export const Category3DIcon: React.FC<{
  type: 'physical' | 'cognitive' | 'language' | 'social' | 'aesthetic' | 'english' | 'teacher';
  size?: number;
  className?: string;
}> = ({ type, size = 76, className = '' }) => {
  const pixarImages: Record<string, { src: string; alt: string; glow: string; border: string; bgBadge: string }> = {
    physical: {
      src: physicalImage,
      alt: 'Phát triển thể chất phong cách Pixar 3D',
      glow: 'shadow-emerald-500/25',
      border: 'border-emerald-300',
      bgBadge: 'bg-emerald-50'
    },
    cognitive: {
      src: cognitiveImage,
      alt: 'Phát triển nhận thức phong cách Pixar 3D',
      glow: 'shadow-amber-500/25',
      border: 'border-amber-300',
      bgBadge: 'bg-amber-50'
    },
    language: {
      src: languageImage,
      alt: 'Phát triển ngôn ngữ phong cách Pixar 3D',
      glow: 'shadow-pink-500/25',
      border: 'border-pink-300',
      bgBadge: 'bg-pink-50'
    },
    social: {
      src: socialImage,
      alt: 'Tình cảm - Kỹ năng xã hội phong cách Pixar 3D',
      glow: 'shadow-purple-500/25',
      border: 'border-purple-300',
      bgBadge: 'bg-purple-50'
    },
    aesthetic: {
      src: aestheticImage,
      alt: 'Phát triển thẩm mỹ phong cách Pixar 3D',
      glow: 'shadow-indigo-500/25',
      border: 'border-indigo-300',
      bgBadge: 'bg-indigo-50'
    },
    english: {
      src: '/assets/preschool/art_english.png',
      alt: 'Tiếng Anh mầm non Pixar 3D',
      glow: 'shadow-indigo-500/25',
      border: 'border-indigo-300',
      bgBadge: 'bg-indigo-50'
    },
    teacher: {
      src: '/assets/preschool/art_teacher.png',
      alt: 'Góc cô giáo mầm non 3D',
      glow: 'shadow-rose-500/25',
      border: 'border-rose-300',
      bgBadge: 'bg-rose-50'
    }
  };

  const item = pixarImages[type];

  if (!item) return null;

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-[24px] sm:rounded-[28px] p-1 bg-white/95 backdrop-blur-md border-3 ${item.border} shadow-lg ${item.glow} overflow-hidden shrink-0 group-hover:scale-108 group-hover:rotate-2 transition-all duration-300 ${className}`}
    >
      <img
        src={item.src}
        alt={item.alt}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center rounded-[19px] sm:rounded-[23px] shadow-inner"
      />
      {/* 3D Glass Light Streak */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/25 to-white/0 pointer-events-none rounded-[19px]"></div>
    </div>
  );
};

