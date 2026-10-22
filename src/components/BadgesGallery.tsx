import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Star, Flame, Award, CheckCircle2, Lock, 
  Sparkles, ArrowRight, X, Heart, Play, Share2, Info
} from 'lucide-react';
import { BADGES_LIST, BadgeItem, LearningProgressStats } from '../constants/badgesData';

interface BadgesGalleryProps {
  stars: number;
  stats: LearningProgressStats;
  unlockedBadgeIds: string[];
  onNavigate: (view: string) => void;
  onAwardBadgeTest?: (badgeId: string) => void;
  speak?: (text: string) => void;
}

export function BadgesGallery({
  stars,
  stats,
  unlockedBadgeIds,
  onNavigate,
  onAwardBadgeTest,
  speak
}: BadgesGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeBadgeDetail, setActiveBadgeDetail] = useState<BadgeItem | null>(null);

  // Helper to calculate progress for a badge
  const getBadgeProgress = (badge: BadgeItem) => {
    switch (badge.id) {
      case 'math-superhero':
        return Math.min(badge.targetCount, stats.mathStreak || stats.mathCount);
      case 'little-orator':
        return Math.min(badge.targetCount, stats.speechStreak || stats.speechCount);
      case 'streak-master':
        return Math.min(badge.targetCount, stats.streakCount);
      case 'young-scientist':
        return Math.min(badge.targetCount, stats.scienceCount);
      case 'bilingual-knight':
        return Math.min(badge.targetCount, stats.englishCount);
      case 'creative-artist':
        return Math.min(badge.targetCount, stats.artCount);
      case 'physical-champion':
        return Math.min(badge.targetCount, stats.physicalCount);
      case 'kind-heart':
        return Math.min(badge.targetCount, stats.socialCount);
      case 'first-star':
        return Math.min(badge.targetCount, stars);
      case 'super-star':
        return Math.min(badge.targetCount, stars);
      case 'grand-champion':
        return Math.min(badge.targetCount, stars);
      default:
        return 0;
    }
  };

  const isBadgeUnlocked = (badgeId: string) => {
    if (unlockedBadgeIds.includes(badgeId)) return true;
    const badge = BADGES_LIST.find(b => b.id === badgeId);
    if (!badge) return false;
    return getBadgeProgress(badge) >= badge.targetCount;
  };

  const unlockedCount = BADGES_LIST.filter(b => isBadgeUnlocked(b.id)).length;
  const progressPercent = Math.round((unlockedCount / BADGES_LIST.length) * 100);

  // Filter badges
  const filteredBadges = BADGES_LIST.filter(badge => {
    const unlocked = isBadgeUnlocked(badge.id);
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'unlocked') return unlocked;
    if (selectedCategory === 'locked') return !unlocked;
    if (selectedCategory === 'math') return badge.category === 'math';
    if (selectedCategory === 'language') return badge.category === 'language' || badge.category === 'english';
    if (selectedCategory === 'physical') return badge.category === 'physical' || badge.category === 'art' || badge.category === 'social';
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-36 font-pixar">
      
      {/* Top Banner & Overview Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 rounded-[36px] p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden border-4 border-white font-pixar"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-yellow-300/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs sm:text-sm font-black mb-3 border border-white/30">
              <Trophy size={16} className="text-yellow-300" />
              <span>BẢNG DANH DỰ MẦM NON · HUY HIỆU VINH QUANG</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-2 font-pixar">
              Bộ Sưu Tập Huy Hiệu Của Bé 🏆
            </h1>
            
            <p className="text-sm sm:text-base text-amber-100 font-medium max-w-xl leading-relaxed">
              Mỗi huy hiệu là một dấu mốc khen ngợi sự nỗ lực, kiên trì và tư duy xuất sắc của bé qua các chuỗi bài tập bổ ích!
            </p>

            {/* Overall Progress Bar */}
            <div className="mt-5 bg-white/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/30 max-w-md">
              <div className="flex items-center justify-between text-xs font-black mb-1.5">
                <span>Tiến độ mở khóa huy hiệu</span>
                <span>{unlockedCount}/{BADGES_LIST.length} ({progressPercent}%)</span>
              </div>
              <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-yellow-300 to-amber-200 rounded-full shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics 4-Box */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0 w-full md:w-auto">
            
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/30 flex flex-col items-center justify-center text-center">
              <Star className="text-yellow-300 fill-yellow-300 mb-1" size={32} />
              <span className="text-2xl sm:text-3xl font-black">{stars}</span>
              <span className="text-[11px] font-bold text-amber-100">Ngôi sao tích lũy</span>
            </div>

            <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/30 flex flex-col items-center justify-center text-center">
              <Trophy className="text-amber-200 mb-1" size={32} />
              <span className="text-2xl sm:text-3xl font-black">{Math.floor(stars / 10)}</span>
              <span className="text-[11px] font-bold text-amber-100">Cúp vinh quang</span>
            </div>

            <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/30 flex flex-col items-center justify-center text-center">
              <Flame className="text-orange-300 fill-orange-300 mb-1" size={32} />
              <span className="text-2xl sm:text-3xl font-black">{stats.streakCount || 0}</span>
              <span className="text-[11px] font-bold text-amber-100">Chuỗi bài liên tiếp</span>
            </div>

            <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/30 flex flex-col items-center justify-center text-center">
              <Award className="text-emerald-300 mb-1" size={32} />
              <span className="text-2xl sm:text-3xl font-black">{unlockedCount}</span>
              <span className="text-[11px] font-bold text-amber-100">Huy hiệu đạt được</span>
            </div>

          </div>

        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {[
          { id: 'all', label: 'Tất cả huy hiệu', count: BADGES_LIST.length, icon: '🌟' },
          { id: 'unlocked', label: 'Đã đạt được', count: unlockedCount, icon: '⭐' },
          { id: 'locked', label: 'Chưa mở khóa', count: BADGES_LIST.length - unlockedCount, icon: '🔒' },
          { id: 'math', label: 'Toán & Khoa học', count: BADGES_LIST.filter(b => b.category === 'math').length, icon: '🧮' },
          { id: 'language', label: 'Hùng biện & Tiếng Anh', count: BADGES_LIST.filter(b => b.category === 'language' || b.category === 'english').length, icon: '🎙️' },
          { id: 'physical', label: 'Thể chất & Kỹ năng', count: BADGES_LIST.filter(b => b.category === 'physical' || b.category === 'art' || b.category === 'social').length, icon: '🏃' },
        ].map(tab => {
          const isSelected = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105 border-2 border-white'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Badges Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map(badge => {
          const unlocked = isBadgeUnlocked(badge.id);
          const currentVal = getBadgeProgress(badge);
          const percent = Math.min(100, Math.round((currentVal / badge.targetCount) * 100));

          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => {
                setActiveBadgeDetail(badge);
                if (speak) speak(`Huy hiệu ${badge.title}`);
              }}
              className={`rounded-[32px] p-6 border-3 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-xl ${
                unlocked
                  ? 'bg-white border-amber-300 ring-4 ring-amber-100/50'
                  : 'bg-slate-50/90 border-slate-200/90 opacity-90 hover:opacity-100'
              }`}
            >
              {/* Background ambient badge glow if unlocked */}
              {unlocked && (
                <div className={`absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br ${badge.color} opacity-20 rounded-full blur-2xl pointer-events-none`}></div>
              )}

              <div>
                {/* Top Badge Card Header */}
                <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-md border-2 border-white transition-transform ${
                    unlocked 
                      ? `bg-gradient-to-br ${badge.color} text-white shadow-amber-200` 
                      : 'bg-slate-200 text-slate-400 grayscale'
                  }`}>
                    {badge.icon}
                  </div>

                  <div className="flex flex-col items-end">
                    {unlocked ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black shadow-xs">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>ĐÃ ĐẠT ⭐</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                        <Lock size={12} />
                        <span>Chưa mở</span>
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-bold mt-1">
                      {badge.englishTitle}
                    </span>
                  </div>
                </div>

                {/* Badge Info */}
                <div className="relative z-10 mb-4">
                  <h3 className={`text-xl font-black mb-1 ${unlocked ? 'text-slate-900' : 'text-slate-700'}`}>
                    {badge.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
                    {badge.description}
                  </p>

                  <div className="p-2.5 rounded-2xl bg-slate-100/80 border border-slate-200/60 text-[11px] text-slate-700 font-bold flex items-center gap-1.5">
                    <span className="text-amber-500">🎯</span>
                    <span>{badge.requirementText}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Progress Bar & Action */}
              <div className="relative z-10 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-black text-slate-600 mb-1.5">
                  <span>Tiến độ:</span>
                  <span className={unlocked ? 'text-emerald-700' : 'text-slate-600'}>
                    {currentVal} / {badge.targetCount} ({percent}%)
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      unlocked 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-indigo-600 flex items-center gap-1">
                    <Info size={13} />
                    <span>Chi tiết & Ý nghĩa</span>
                  </span>

                  {badge.actionView && !unlocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (badge.actionView) onNavigate(badge.actionView);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-black text-xs transition-colors border border-indigo-200 cursor-pointer"
                    >
                      {badge.actionText || 'Học ngay'} ➔
                    </button>
                  )}
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {activeBadgeDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[36px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-white relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveBadgeDetail(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* 3D Icon */}
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-4 shadow-lg border-4 border-white ${
                  isBadgeUnlocked(activeBadgeDetail.id)
                    ? `bg-gradient-to-br ${activeBadgeDetail.color} text-white`
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  {activeBadgeDetail.icon}
                </div>

                <div className="mb-2">
                  <h3 className="text-2xl font-black text-slate-900">
                    {activeBadgeDetail.title}
                  </h3>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    {activeBadgeDetail.englishTitle}
                  </p>
                </div>

                {isBadgeUnlocked(activeBadgeDetail.id) ? (
                  <span className="px-4 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs mb-4 flex items-center gap-1.5 shadow-xs">
                    <CheckCircle2 size={15} />
                    <span>BÉ ĐÃ ĐẠT ĐƯỢC HUY HIỆU NÀY! ⭐</span>
                  </span>
                ) : (
                  <span className="px-4 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-300 font-black text-xs mb-4 flex items-center gap-1.5">
                    <Lock size={14} />
                    <span>ĐANG PHẤN ĐẤU HOÀN THÀNH</span>
                  </span>
                )}

                {/* Requirements */}
                <div className="w-full bg-amber-50 rounded-2xl p-4 border border-amber-200 text-left mb-4">
                  <h4 className="text-xs font-black text-amber-900 uppercase mb-1 flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>Điều kiện đạt huy hiệu:</span>
                  </h4>
                  <p className="text-xs text-amber-950 font-bold">
                    {activeBadgeDetail.requirementText}
                  </p>
                </div>

                {/* Pedagogical Value */}
                <div className="w-full bg-sky-50 rounded-2xl p-4 border border-sky-200 text-left mb-6">
                  <h4 className="text-xs font-black text-sky-900 uppercase mb-1 flex items-center gap-1.5">
                    <span>💡</span>
                    <span>Ý nghĩa sư phạm đối với bé:</span>
                  </h4>
                  <p className="text-xs text-sky-950 font-medium leading-relaxed">
                    {activeBadgeDetail.pedagogicalValue}
                  </p>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center gap-3 w-full">
                  {activeBadgeDetail.actionView && (
                    <button
                      onClick={() => {
                        const view = activeBadgeDetail.actionView!;
                        setActiveBadgeDetail(null);
                        onNavigate(view);
                      }}
                      className="btn-3d flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play size={16} className="fill-current" />
                      <span>{activeBadgeDetail.actionText || 'Luyện tập ngay'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveBadgeDetail(null)}
                    className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Celebration Modal when a badge is freshly unlocked
interface BadgeUnlockModalProps {
  badge: BadgeItem | null;
  onClose: () => void;
  onNavigateToAchievements: () => void;
}

export function BadgeUnlockModal({
  badge,
  onClose,
  onNavigateToAchievements
}: BadgeUnlockModalProps) {
  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
        transition={{ type: 'spring', damping: 15 }}
        className="bg-white rounded-[40px] max-w-md w-full p-8 text-center shadow-2xl border-4 border-yellow-300 relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-yellow-200 rounded-full blur-3xl pointer-events-none"></div>

        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`w-28 h-28 mx-auto rounded-3xl flex items-center justify-center text-6xl mb-4 shadow-xl border-4 border-white bg-gradient-to-br ${badge.color} text-white`}
        >
          {badge.icon}
        </motion.div>

        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-black mb-3 border border-yellow-300">
          <Sparkles size={14} className="text-yellow-600" />
          <span>XUẤT SẮC! HUY HIỆU DANH DỰ MỚI</span>
        </div>

        <h3 className="text-3xl font-black text-slate-900 mb-1">
          {badge.title}
        </h3>
        <p className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest mb-3">
          {badge.englishTitle}
        </p>

        <p className="text-sm text-slate-600 font-medium mb-6 leading-relaxed">
          {badge.description}
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              onClose();
              onNavigateToAchievements();
            }}
            className="btn-3d w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white font-black text-sm rounded-2xl shadow-lg border border-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trophy size={18} />
            <span>Xem Bảng Thành Tích ➔</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm rounded-2xl transition-colors cursor-pointer"
          >
            Tiếp tục học vui vẻ
          </button>
        </div>

      </motion.div>
    </div>
  );
}
