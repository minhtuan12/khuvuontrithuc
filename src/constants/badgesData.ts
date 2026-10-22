export interface BadgeItem {
  id: string;
  title: string;
  englishTitle: string;
  icon: string;
  category: 'math' | 'language' | 'streak' | 'english' | 'art' | 'physical' | 'social' | 'milestone';
  description: string;
  requirementText: string;
  pedagogicalValue: string;
  targetCount: number;
  color: string;
  borderColor: string;
  bgLight: string;
  textColor: string;
  actionView?: string;
  actionText?: string;
}

export const BADGES_LIST: BadgeItem[] = [
  {
    id: 'math-superhero',
    title: 'Siêu nhân toán học',
    englishTitle: 'Math Superhero',
    icon: '🧮',
    category: 'math',
    description: 'Bé hoàn thành chuỗi bài tập Làm quen với Toán & Đếm số liên tiếp.',
    requirementText: 'Hoàn thành 3 bài toán hoặc trò chơi đếm số liên tiếp',
    pedagogicalValue: 'Khen ngợi tư duy logic, khả năng đếm số lượng và phản xạ toán học nhanh nhẹn.',
    targetCount: 3,
    color: 'from-amber-400 via-yellow-400 to-orange-500',
    borderColor: 'border-amber-300',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-900',
    actionView: 'cognitive',
    actionText: 'Làm quen Toán'
  },
  {
    id: 'little-orator',
    title: 'Nhà hùng biện nhí',
    englishTitle: 'Little Orator',
    icon: '🎙️',
    category: 'language',
    description: 'Bé hoàn thành chuỗi bài luyện phát âm, đọc thơ hoặc kể chuyện cổ tích.',
    requirementText: 'Hoàn thành 3 bài phát âm, đọc thơ hoặc kể chuyện liên tiếp',
    pedagogicalValue: 'Khuyến khích bé tự tin diễn đạt, phát âm tròn vành rõ chữ và mở rộng vốn từ tiếng Việt.',
    targetCount: 3,
    color: 'from-rose-400 via-pink-400 to-purple-500',
    borderColor: 'border-rose-300',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-900',
    actionView: 'language',
    actionText: 'Tập nói & Đọc thơ'
  },
  {
    id: 'streak-master',
    title: 'Chiến binh kiên trì',
    englishTitle: 'Streak Master',
    icon: '⚡',
    category: 'streak',
    description: 'Bé hoàn thành chuỗi bài tập liên tiếp mà không bỏ cuộc giữa chừng.',
    requirementText: 'Đạt chuỗi 5 hoạt động học tập liên tiếp',
    pedagogicalValue: 'Bồi dưỡng tính kiên trì, tập trung và thói quen hoàn thành mục tiêu đến cùng.',
    targetCount: 5,
    color: 'from-orange-400 via-amber-500 to-red-500',
    borderColor: 'border-orange-300',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-900',
    actionView: 'home',
    actionText: 'Học tiếp bài mới'
  },
  {
    id: 'young-scientist',
    title: 'Nhà bác học tí hon',
    englishTitle: 'Young Scientist',
    icon: '🔬',
    category: 'math',
    description: 'Bé say mê khám phá khoa học, thiên nhiên, động thực vật quanh mình.',
    requirementText: 'Hoàn thành 3 hoạt động khám phá khoa học & môi trường',
    pedagogicalValue: 'Kích thích trí tò mò, óc quan sát và tình yêu thiên nhiên đất nước.',
    targetCount: 3,
    color: 'from-blue-400 via-sky-400 to-indigo-500',
    borderColor: 'border-sky-300',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-900',
    actionView: 'cognitive',
    actionText: 'Khám phá Khoa học'
  },
  {
    id: 'bilingual-knight',
    title: 'Đại sứ nhí song ngữ',
    englishTitle: 'Bilingual Knight',
    icon: '🇬🇧',
    category: 'english',
    description: 'Bé xuất sắc hoàn thành các bài học và trò chơi tiếng Anh mầm non.',
    requirementText: 'Hoàn thành 3 bài học hoặc game tiếng Anh mầm non',
    pedagogicalValue: 'Xây dựng phản xạ song ngữ tự nhiên, phát âm chuẩn xác ngay từ lứa tuổi vàng.',
    targetCount: 3,
    color: 'from-indigo-400 via-purple-500 to-pink-500',
    borderColor: 'border-indigo-300',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-900',
    actionView: 'english',
    actionText: 'Học Tiếng Anh'
  },
  {
    id: 'creative-artist',
    title: 'Họa sĩ nhí tài ba',
    englishTitle: 'Creative Artist',
    icon: '🎨',
    category: 'art',
    description: 'Bé thỏa sức sáng tạo qua các bài vẽ tranh, tạo hình và ca hát.',
    requirementText: 'Hoàn thành 3 bài học tạo hình nghệ thuật hoặc âm nhạc',
    pedagogicalValue: 'Phát triển cảm thụ thẩm mỹ, hoa tay khéo léo và trí tưởng tượng phong phú.',
    targetCount: 3,
    color: 'from-teal-400 via-emerald-400 to-cyan-500',
    borderColor: 'border-teal-300',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-900',
    actionView: 'aesthetic',
    actionText: 'Vẽ tranh & Ca hát'
  },
  {
    id: 'physical-champion',
    title: 'Kiện tướng tí hon',
    englishTitle: 'Physical Champion',
    icon: '🏃',
    category: 'physical',
    description: 'Bé chăm chỉ vận động thể chất và tập thể dục cho mắt sáng khỏe.',
    requirementText: 'Hoàn thành 3 bài vận động thể chất hoặc bài thể dục mắt',
    pedagogicalValue: 'Rèn luyện sự dẻo dai, giữ gìn thị lực và xây dựng lối sống năng động khỏe mạnh.',
    targetCount: 3,
    color: 'from-emerald-400 via-green-500 to-teal-500',
    borderColor: 'border-emerald-300',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-900',
    actionView: 'physical',
    actionText: 'Vận động thể chất'
  },
  {
    id: 'kind-heart',
    title: 'Trái tim ấm áp',
    englishTitle: 'Kind Heart',
    icon: '💖',
    category: 'social',
    description: 'Bé biết chia sẻ cảm xúc, giúp đỡ bạn bè và yêu thương gia đình.',
    requirementText: 'Hoàn thành 2 bài học kỹ năng xã hội hoặc check-in cảm xúc',
    pedagogicalValue: 'Nuôi dưỡng chỉ số cảm xúc EQ, sự thấu cảm, lòng biết ơn và sự hòa đồng.',
    targetCount: 2,
    color: 'from-pink-400 via-rose-400 to-red-400',
    borderColor: 'border-pink-300',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-900',
    actionView: 'social',
    actionText: 'Kỹ năng xã hội'
  },
  {
    id: 'first-star',
    title: 'Mầm non khởi đầu',
    englishTitle: 'First Step Sprout',
    icon: '🌱',
    category: 'milestone',
    description: 'Bé bắt đầu hành trình vui học khám phá Khu Vườn Tri Thức.',
    requirementText: 'Đạt được 1 ngôi sao đầu tiên',
    pedagogicalValue: 'Khích lệ sự tò mò và bước chân khám phá đầu đời.',
    targetCount: 1,
    color: 'from-lime-400 via-emerald-400 to-green-500',
    borderColor: 'border-lime-300',
    bgLight: 'bg-lime-50',
    textColor: 'text-lime-900',
    actionView: 'home',
    actionText: 'Bắt đầu học'
  },
  {
    id: 'super-star',
    title: 'Ngôi sao chăm chỉ',
    englishTitle: 'Super Star Child',
    icon: '⭐',
    category: 'milestone',
    description: 'Bé tích lũy được bộ sưu tập 10 ngôi sao lấp lánh.',
    requirementText: 'Tích lũy đủ 10 ngôi sao thưởng',
    pedagogicalValue: 'Tôn vinh tinh thần chăm chỉ, nỗ lực đều đặn mỗi ngày.',
    targetCount: 10,
    color: 'from-yellow-400 via-amber-400 to-orange-400',
    borderColor: 'border-yellow-300',
    bgLight: 'bg-yellow-50',
    textColor: 'text-yellow-900',
    actionView: 'home',
    actionText: 'Tích lũy sao'
  },
  {
    id: 'grand-champion',
    title: 'Đỉnh cao trí tuệ mầm non',
    englishTitle: 'Grand Champion',
    icon: '👑',
    category: 'milestone',
    description: 'Bé đạt mốc 30 ngôi sao và là niềm tự hào của cô giáo và cha mẹ.',
    requirementText: 'Tích lũy đủ 30 ngôi sao danh dự',
    pedagogicalValue: 'Đỉnh cao sự tự tin, sẵn sàng tự tin bước vào Lớp 1 tiểu học.',
    targetCount: 30,
    color: 'from-amber-400 via-purple-500 to-indigo-600',
    borderColor: 'border-purple-300',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-900',
    actionView: 'home',
    actionText: 'Đạt đỉnh cao'
  }
];

export interface LearningProgressStats {
  mathCount: number;
  mathStreak: number;
  speechCount: number;
  speechStreak: number;
  streakCount: number;
  bestStreak: number;
  scienceCount: number;
  englishCount: number;
  artCount: number;
  physicalCount: number;
  socialCount: number;
}
