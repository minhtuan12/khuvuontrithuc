import { getLearnerStorage } from './lib/learnerStorage';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2, ArrowLeft, X, Sparkles, Trophy, Star, Mic, Square, Video,
  Image as ImageIcon, Search, BookOpen, Heart, Activity, Palette,
  GraduationCap, Lightbulb, Compass, Award, CheckCircle2, Play,
  Smile, Frown, AlertCircle, Clock, ShieldCheck, Flame, ExternalLink, HelpCircle, Settings
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { MATH_GAMES_DATA } from './constants/mathData';
import MathGame from './components/MathGame';
import ParentDashboard from './screens/ParentDashboard';
import LearningReport from './components/LearningReport';
import EnglishModule from './components/EnglishModule';
import EmotionCheckIn from './components/EmotionCheckIn';
import { getSearchDestination } from './lib/navigation';
import { readLearningStats, readUnlockedBadges } from './lib/learningStorage';
import { useDeviceDocument } from './lib/useDeviceDocument';
import { useAccount } from './lib/accountContext';
import TeacherWorkspace, { type TeacherRoute } from './screens/TeacherWorkspace';
import { deviceFetch as fetchDeviceData } from './lib/deviceData';
import { getLearnerScope } from './lib/learnerStorage';
import { EMOTIONS, getTodayStudySeconds, localDay, readEmotionHistory, readStoredNumber, type EmotionId, type EmotionRecord } from './lib/wellbeing';
import AIAssistant from './components/AIAssistant';
import AuthorFooter from './components/AuthorFooter';
import { readAssistantMessage } from './lib/assistantSpeech';
import { readEmotionFeedback } from './lib/emotionSpeech';
import { Mascot3DBunny, Hero3DScene, Category3DIcon } from './components/Illustrations3D';
import { BADGES_LIST, BadgeItem, LearningProgressStats } from './constants/badgesData';
import { BadgesGallery, BadgeUnlockModal } from './components/BadgesGallery';

const ANIMALS = [
  { id: 'dog', name: 'Con Chó', emoji: '🐶', color: 'bg-orange-200' },
  { id: 'cat', name: 'Con Mèo', emoji: '🐱', color: 'bg-yellow-200' },
  { id: 'chicken', name: 'Con Gà', emoji: '🐔', color: 'bg-red-200' },
  { id: 'duck', name: 'Con Vịt', emoji: '🦆', color: 'bg-green-200' },
  { id: 'pig', name: 'Con Lợn', emoji: '🐷', color: 'bg-pink-200' },
  { id: 'cow', name: 'Con Bò', emoji: '🐮', color: 'bg-stone-200' },
  { id: 'monkey', name: 'Con Khỉ', emoji: '🐵', color: 'bg-amber-200' },
  { id: 'elephant', name: 'Con Voi', emoji: '🐘', color: 'bg-slate-200' },
  { id: 'tiger', name: 'Con Hổ', emoji: '🐯', color: 'bg-orange-300' },
  { id: 'lion', name: 'Sư Tử', emoji: '🦁', color: 'bg-yellow-300' },
];

const COLORS = [
  { id: 'red', name: 'Màu Đỏ', hex: '#EF4444', color: 'bg-red-100' },
  { id: 'green', name: 'Màu Xanh Lá', hex: '#22C55E', color: 'bg-green-100' },
  { id: 'blue', name: 'Màu Xanh Dương', hex: '#3B82F6', color: 'bg-blue-100' },
  { id: 'yellow', name: 'Màu Vàng', hex: '#EAB308', color: 'bg-yellow-100' },
  { id: 'orange', name: 'Màu Cam', hex: '#F97316', color: 'bg-orange-100' },
  { id: 'purple', name: 'Màu Tím', hex: '#A855F7', color: 'bg-purple-100' },
  { id: 'pink', name: 'Màu Hồng', hex: '#EC4899', color: 'bg-pink-100' },
  { id: 'black', name: 'Màu Đen', hex: '#000000', color: 'bg-slate-200' },
  { id: 'white', name: 'Màu Trắng', hex: '#FFFFFF', color: 'bg-slate-50' },
];

const NUMBER_NAMES = ['Một', 'Hai', 'Ba', 'Bốn', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười'];
const NUMBERS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `${i + 1} – ${NUMBER_NAMES[i]}`,
  value: i + 1,
  emoji: '🌟',
  color: 'bg-sky-200'
}));

const LETTERS = [
  { id: 'A', name: 'A', word: 'Quả Táo', emoji: '🍎', color: 'bg-red-100' },
  { id: 'Ă', name: 'Ă', word: 'Mặt Trăng', emoji: '🌙', color: 'bg-yellow-100' },
  { id: 'Â', name: 'Â', word: 'Cái Ấm', emoji: '🫖', color: 'bg-orange-100' },
  { id: 'B', name: 'Bờ', word: 'Quả Bóng', emoji: '⚽', color: 'bg-blue-100' },
  { id: 'C', name: 'Cờ', word: 'Con Cáo', emoji: '🦊', color: 'bg-orange-200' },
  { id: 'D', name: 'Dờ', word: 'Con Dê', emoji: '🐐', color: 'bg-stone-100' },
  { id: 'Đ', name: 'Đờ', word: 'Đám Mây', emoji: '☁️', color: 'bg-sky-100' },
  { id: 'E', name: 'E', word: 'Con Én', emoji: '🐦', color: 'bg-sky-200' },
  { id: 'Ê', name: 'Ê', word: 'Con Ếch', emoji: '🐸', color: 'bg-green-100' },
  { id: 'G', name: 'Gờ', word: 'Con Gà', emoji: '🐔', color: 'bg-yellow-200' },
  { id: 'H', name: 'Hờ', word: 'Hoa Hồng', emoji: '🌹', color: 'bg-pink-100' },
  { id: 'I', name: 'I', word: 'Viên Bi', emoji: '🔮', color: 'bg-purple-100' },
  { id: 'K', name: 'Ca', word: 'Cái Kéo', emoji: '✂️', color: 'bg-slate-100' },
  { id: 'L', name: 'Lờ', word: 'Cái Lá', emoji: '🍃', color: 'bg-green-200' },
  { id: 'M', name: 'Mờ', word: 'Con Mèo', emoji: '🐱', color: 'bg-amber-100' },
  { id: 'N', name: 'Nờ', word: 'Cái Nón', emoji: '👒', color: 'bg-emerald-100' },
  { id: 'O', name: 'O', word: 'Con Ong', emoji: '🐝', color: 'bg-yellow-300' },
  { id: 'Ô', name: 'Ô', word: 'Cái Ô', emoji: '☂️', color: 'bg-purple-200' },
  { id: 'Ơ', name: 'Ơ', word: 'Cái Nơ', emoji: '🎀', color: 'bg-pink-200' },
  { id: 'P', name: 'Pờ', word: 'Pháo Hoa', emoji: '🎆', color: 'bg-red-200' },
  { id: 'Q', name: 'Quờ', word: 'Quyển Sách', emoji: '📖', color: 'bg-blue-200' },
  { id: 'R', name: 'Rờ', word: 'Con Rùa', emoji: '🐢', color: 'bg-green-300' },
  { id: 'S', name: 'Sờ', word: 'Ngôi Sao', emoji: '⭐', color: 'bg-yellow-400' },
  { id: 'T', name: 'Tờ', word: 'Trái Tim', emoji: '❤️', color: 'bg-red-300' },
  { id: 'U', name: 'U', word: 'Quả đu đủ', emoji: '🥭', color: 'bg-orange-300' },
  { id: 'Ư', name: 'Ư', word: 'Sư Tử', emoji: '🦁', color: 'bg-amber-200' },
  { id: 'V', name: 'Vờ', word: 'Con Voi', emoji: '🐘', color: 'bg-slate-200' },
  { id: 'X', name: 'Xờ', word: 'Xe Đạp', emoji: '🚲', color: 'bg-sky-300' },
  { id: 'Y', name: 'I dài', word: 'Y Tá', emoji: '👩‍⚕️', color: 'bg-pink-300' },
];

const ENGLISH_LETTERS = [
  { id: 'A', name: 'Chữ A tiếng Anh. Apple, quả táo', word: 'Apple', emoji: '🍎', color: 'bg-red-100' },
  { id: 'B', name: 'Chữ B tiếng Anh. Ball, quả bóng', word: 'Ball', emoji: '⚽', color: 'bg-blue-100' },
  { id: 'C', name: 'Chữ C tiếng Anh. Cat, con mèo', word: 'Cat', emoji: '🐱', color: 'bg-orange-100' },
  { id: 'D', name: 'Chữ D tiếng Anh. Dog, con chó', word: 'Dog', emoji: '🐶', color: 'bg-stone-100' },
  { id: 'E', name: 'Chữ E tiếng Anh. Elephant, con voi', word: 'Elephant', emoji: '🐘', color: 'bg-slate-200' },
  { id: 'F', name: 'Chữ F tiếng Anh. Fish, con cá', word: 'Fish', emoji: '🐟', color: 'bg-sky-100' },
  { id: 'G', name: 'Chữ G tiếng Anh. Giraffe, hươu cao cổ', word: 'Giraffe', emoji: '🦒', color: 'bg-yellow-100' },
  { id: 'H', name: 'Chữ H tiếng Anh. Hat, cái mũ', word: 'Hat', emoji: '🎩', color: 'bg-purple-100' },
  { id: 'I', name: 'Chữ I tiếng Anh. Ice cream, cây kem', word: 'Ice cream', emoji: '🍦', color: 'bg-pink-100' },
  { id: 'J', name: 'Chữ J tiếng Anh. Juice, nước ép', word: 'Juice', emoji: '🧃', color: 'bg-orange-200' },
  { id: 'K', name: 'Chữ K tiếng Anh. Kite, cái diều', word: 'Kite', emoji: '🪁', color: 'bg-red-200' },
  { id: 'L', name: 'Chữ L tiếng Anh. Lion, sư tử', word: 'Lion', emoji: '🦁', color: 'bg-yellow-200' },
  { id: 'M', name: 'Chữ M tiếng Anh. Monkey, con khỉ', word: 'Monkey', emoji: '🐵', color: 'bg-amber-100' },
  { id: 'N', name: 'Chữ N tiếng Anh. Nest, cái tổ', word: 'Nest', emoji: '🪹', color: 'bg-stone-200' },
  { id: 'O', name: 'Chữ O tiếng Anh. Orange, quả cam', word: 'Orange', emoji: '🍊', color: 'bg-orange-300' },
  { id: 'P', name: 'Chữ P tiếng Anh. Pig, con lợn', word: 'Pig', emoji: '🐷', color: 'bg-pink-200' },
  { id: 'Q', name: 'Chữ Q tiếng Anh. Queen, nữ hoàng', word: 'Queen', emoji: '👑', color: 'bg-yellow-300' },
  { id: 'R', name: 'Chữ R tiếng Anh. Rabbit, con thỏ', word: 'Rabbit', emoji: '🐰', color: 'bg-slate-100' },
  { id: 'S', name: 'Chữ S tiếng Anh. Sun, mặt trời', word: 'Sun', emoji: '☀️', color: 'bg-yellow-400' },
  { id: 'T', name: 'Chữ T tiếng Anh. Tiger, con hổ', word: 'Tiger', emoji: '🐯', color: 'bg-orange-400' },
  { id: 'U', name: 'Chữ U tiếng Anh. Umbrella, cái ô', word: 'Umbrella', emoji: '☂️', color: 'bg-purple-200' },
  { id: 'V', name: 'Chữ V tiếng Anh. Van, xe tải', word: 'Van', emoji: '🚐', color: 'bg-sky-200' },
  { id: 'W', name: 'Chữ W tiếng Anh. Watermelon, dưa hấu', word: 'Watermelon', emoji: '🍉', color: 'bg-red-300' },
  { id: 'X', name: 'Chữ X tiếng Anh. Xylophone, đàn mộc cầm', word: 'Xylophone', emoji: '🎹', color: 'bg-indigo-200' },
  { id: 'Y', name: 'Chữ Y tiếng Anh. Yo-yo, con quay', word: 'Yo-yo', emoji: '🪀', color: 'bg-pink-300' },
  { id: 'Z', name: 'Chữ Z tiếng Anh. Zebra, ngựa vằn', word: 'Zebra', emoji: '🦓', color: 'bg-slate-300' },
];

const STORIES_TODDLER = [
  { id: 'story-de-con', name: 'Truyện Dê con nghe lời mẹ', emoji: '🐐', color: 'bg-white', videoId: 'xsIJhCXpo38' },
  { id: 'story-khi-con', name: 'Truyện Khỉ con biết vâng lời', emoji: '🐵', color: 'bg-white', videoId: 'tlRfa4EdVuY' },
  { id: 'story-lon-luoi-tam', name: 'Truyện bạn lợn lười tắm', emoji: '🐷', color: 'bg-white', videoId: 'U32RFia273U' },
  { id: 'story-cun-con-lac', name: 'Truyện Cún con đi lạc', emoji: '🐶', color: 'bg-white', videoId: 'urGVqzUkX0w' },
  { id: 'story-vit-con-cau-tha', name: 'Truyện Vịt con cẩu thả', emoji: '🦆', color: 'bg-white', videoId: 'gvjn4WgcJeU' },
  { id: 'story-khi-chuoi', name: 'Truyện Khỉ con ăn chuối', emoji: '🍌', color: 'bg-white', videoId: 'Wky2zmjgc9A' },
  { id: 'story-soc-nau', name: 'Truyện Sóc nâu nhanh trí', emoji: '🐿️', color: 'bg-white', videoId: 'GU2XW8ki3UU' },
  { id: 'story-mat-troi-dau', name: 'Truyện Ông mặt trời đi đâu?', emoji: '☀️', color: 'bg-white', videoId: '6AdRHklkEbk' },
  { id: 'story-ga-mai-hoa-mo', name: 'Truyện Gà mái hoa mơ', emoji: '🐔', color: 'bg-white', videoId: 'N4SN5Rqgrj0' },
  { id: 'story-meo-an-ca', name: 'Truyện Mèo thích ăn cá', emoji: '🐱', color: 'bg-white', videoId: 'zdDhakQMp9I' },
];

const POEMS_TODDLER = [
  { id: 'poem-yeu-me', name: 'Thơ Yêu mẹ', emoji: '👩‍👦', color: 'bg-white', videoId: 'BAm8rYzharo' },
  { id: 'poem-muoi-qua-trung', name: 'Thơ Mười quả trứng tròn', emoji: '🥚', color: 'bg-white', videoId: '1D3l11Dk36A' },
  { id: 'poem-bap-cai', name: 'Thơ Bắp cải xanh', emoji: '🥬', color: 'bg-white', videoId: '_vsnY8NQntA' },
  { id: 'poem-dan-ga-con', name: 'Thơ đàn gà con', emoji: '🐥', color: 'bg-white', videoId: 'ExppIHdWZ94' },
  { id: 'poem-con-ca-vang', name: 'Thơ con cá vàng', emoji: '🐠', color: 'bg-white', videoId: 'ygZzGo_Yh-U' },
  { id: 'poem-ba-chau', name: 'Thơ Bà và cháu', emoji: '👵', color: 'bg-white', videoId: 'NBC1OuFlrHU' },
  { id: 'poem-lam-do-choi', name: 'Thơ Làm đồ chơi', emoji: '🧸', color: 'bg-white', videoId: '7e0krzNEwKk' },
  { id: 'poem-con-meo', name: 'Thơ Con mèo', emoji: '🐱', color: 'bg-white', videoId: 'E2NYzL2O3iI' },
  { id: 'poem-con-trau', name: 'Thơ Con trâu', emoji: '🐃', color: 'bg-white', videoId: 'SeDU1KsRLRI' },
  { id: 'poem-hoa-no', name: 'Thơ Hoa nở', emoji: '🌸', color: 'bg-white', videoId: '-ry2DDAoUXg' },
];

const STORIES_3_4 = [
  { id: 'story-tho-con-34', name: 'Truyện thỏ con không vâng lời', emoji: '🐰', color: 'bg-white', videoId: 'k_yGJGAMXqI' },
  { id: 'story-cau-be-mui-dai', name: 'Truyện cậu bé mũi dài', emoji: '👦', color: 'bg-white', videoId: '3SAt-tFaut8' },
  { id: 'story-vit-xam-34', name: 'Truyện chú vịt xám', emoji: '🦆', color: 'bg-white', videoId: 'EP5wypBprGM' },
  { id: 'story-kien-voi', name: 'Truyện kiến và voi', emoji: '🐘', color: 'bg-white', videoId: 'vkLqHHES6v4' },
  { id: 'story-tho-trang-biet-loi', name: 'Truyện thỏ trắng biết lỗi', emoji: '🐰', color: 'bg-white', videoId: 'l9T69QWy40s' },
  { id: 'story-nho-cu-cai', name: 'Truyện nhổ củ cải', emoji: '🥕', color: 'bg-white', videoId: 'GhFrqHTOs4A' },
  { id: 'story-hat-do-sot', name: 'Truyện hạt đỗ sót', emoji: '🌱', color: 'bg-white', videoId: 'dRi_LUlqvBM' },
  { id: 'story-rua-tim-nha', name: 'Truyện Rùa con tìm nhà', emoji: '🐢', color: 'bg-white', videoId: 'ziB1h2hWb2w' },
  { id: 'story-ca-diec', name: 'Truyện Cá diếc con', emoji: '🐟', color: 'bg-white', videoId: 'DYNEpcwMJU0' },
  { id: 'story-tich-cau-vong', name: 'Truyện Sự tích cầu vồng', emoji: '🌈', color: 'bg-white', videoId: 'ctku7Eacv-w' },
  { id: 'story-tieng-keu-coc', name: 'Truyện Tiếng kêu của Cóc con', emoji: '🐸', color: 'bg-white', videoId: 'KFvDbpjDSOg' },
  { id: 'story-ga-trong-hat-dau-34', name: 'Truyện Gà Trống choai và hạt đậu', emoji: '🐓', color: 'bg-white', videoId: 'Vruz3CFwAUk' },
];

const POEMS_3_4 = [
  { id: 'poem-cay-day-leo', name: 'Thơ cây dây leo', emoji: '🌿', color: 'bg-white', videoId: 'klTtM_HYOwc' },
  { id: 'poem-meo-con-luoi-hoc', name: 'Thơ mèo con lười học', emoji: '🐱', color: 'bg-white', videoId: 'X8E4B9dIGfM' },
  { id: 'poem-xe-chua-chay', name: 'Thơ xe chữa cháy', emoji: '🚒', color: 'bg-white', videoId: 'g_mBx9nI8EI' },
  { id: 'poem-chiec-dong-ho', name: 'Thơ chiếc đồng hồ', emoji: '⏰', color: 'bg-white', videoId: '7gswsKyVCd4' },
  { id: 'poem-di-choi-pho', name: 'Thơ đi chơi phố', emoji: '🚶', color: 'bg-white', videoId: 's-_Kqm7PoUs' },
  { id: 'poem-doi-mat', name: 'Thơ Đôi mắt của em', emoji: '👀', color: 'bg-white', videoId: 'ghDu7kTnqh8' },
  { id: 'poem-gio-tay-me', name: 'Thơ Gió từ tay mẹ', emoji: '🌬️', color: 'bg-white', videoId: 'FiWCLgjNPmQ' },
  { id: 'poem-ong-mat-troi', name: 'Thơ Ông mặt trời', emoji: '☀️', color: 'bg-white', videoId: 'L4SK5nvF7GI' },
  { id: 'poem-ga-trong-nho', name: 'Thơ Chú gà trống nhỏ', emoji: '🐓', color: 'bg-white', videoId: 'ZrfeRB871qM' },
  { id: 'poem-chum-qua-ngot', name: 'Thơ Chùm quả ngọt', emoji: '🍇', color: 'bg-white', videoId: 'OIX7SvDYwj0' },
  { id: 'poem-ban-tay-co', name: 'Thơ Bàn tay cô giáo', emoji: '👩‍🏫', color: 'bg-white', videoId: 'k5pK-2kE0fY' },
  { id: 'poem-me-va-co', name: 'Thơ mẹ và cô', emoji: '👩‍🏫', color: 'bg-white', videoId: 'zy6K8K7CeJ8' },
];

const STORIES_4_5 = [
  { id: 'story-gau-con-sau-rang', name: 'Truyện gấu con bị sâu răng', emoji: '🐻', color: 'bg-white', videoId: 'yrzjrRyuDgQ' },
  { id: 'story-nguoi-lam-vuon', name: 'Truyện Người làm vườn và các con trai', emoji: '👨‍🌾', color: 'bg-white', videoId: '6sqywI2t72Y' },
  { id: 'story-than-sat', name: 'Truyện Thần sắt', emoji: '⛓️', color: 'bg-white', videoId: '5Iqei2eUa3k' },
  { id: 'story-dua-hau', name: 'Truyện Sự tích quả dưa hấu', emoji: '🍉', color: 'bg-white', videoId: 'LgGyYi6GSwg' },
  { id: 'story-ga-trong-hat-dau', name: 'Truyện Gà trống choai và hạt đậu', emoji: '🐓', color: 'bg-white', videoId: 'Vruz3CFwAUk' },
  { id: 'story-dom-dom', name: 'Truyện Đom đóm tìm bạn', emoji: '🪲', color: 'bg-white', videoId: '2adQgxMlGbk' },
  { id: 'story-khoai-lang', name: 'Truyện Sự tích cây khoai lang', emoji: '🍠', color: 'bg-white', videoId: 't7hJBfZ1haU' },
];

const POEMS_4_5 = [
  { id: 'poem-ban-moi', name: 'Thơ bạn mới', emoji: '🤝', color: 'bg-white', videoId: '-tdFOnOtIOY' },
  { id: 'poem-bac-ho', name: 'Thơ bác hồ của em', emoji: '👴', color: 'bg-white', videoId: 'UkOLAsXYTsE' },
  { id: 'poem-bao-nhieu-nghe', name: 'Thơ Bé làm bao nhiêu nghề', emoji: '👷', color: 'bg-white', videoId: '1bgMCqUK1Yg' },
  { id: 'poem-tinh-ban', name: 'Thơ Tình bạn', emoji: '🤝', color: 'bg-white', videoId: 'BtbfU_l-Hc0' },
  { id: 'poem-be-hoa-si', name: 'Thơ Bé làm hoạ sĩ', emoji: '🎨', color: 'bg-white', videoId: 'IEGnxsXeGuA' },
  { id: 'poem-trung-thu', name: 'Thơ Trung thu cùng bé', emoji: '🏮', color: 'bg-white', videoId: 'dWoVvVFqEU4' },
  { id: 'poem-lay-tam', name: 'Thơ Lấy tăm cho bà', emoji: '👵', color: 'bg-white', videoId: 'My_PLuT9YFg' },
  { id: 'poem-mua-xuan-45', name: 'Thơ Mùa Xuân', emoji: '🌸', color: 'bg-white', videoId: 'B_Jv13ihdTQ' },
];

const STORIES_5_6 = [
  { id: 'story-cuc-trang', name: 'Truyện Bông hoa cúc trắng', emoji: '🌼', color: 'bg-white', videoId: 'M0PvCVEB528' },
  { id: 'story-tich-chu', name: 'Truyện Tích Chu', emoji: '👵', color: 'bg-white', videoId: '-1PNXyqhYJ0' },
  { id: 'story-cao-tho-ga', name: 'Truyện Cáo thỏ và gà trống', emoji: '🦊', color: 'bg-white', videoId: 'd1_bDMWj87Y' },
  { id: 'story-rua-tho', name: 'Truyện rùa và thỏ', emoji: '🐢', color: 'bg-white', videoId: 'tQVCQnsaiYc' },
  { id: 'story-khan-do', name: 'Truyện cô bé quàng khăn đỏ', emoji: '👧', color: 'bg-white', videoId: 'rABQi4W14j8' },
  { id: 'story-cay-khe', name: 'Truyện sự tích cây khế', emoji: '🌳', color: 'bg-white', videoId: '6aybCaXkfpU' },
  { id: 'story-giot-nuoc', name: 'Truyện giọt nước tí xíu', emoji: '💧', color: 'bg-white', videoId: 'R9V7Iv6x_S8' },
  { id: 'story-ban-tay-hon', name: 'Truyện Bàn tay có nụ hôn', emoji: '🤝', color: 'bg-white', videoId: 'lJtY5i-rgYI' },
  { id: 'story-ca-ro-con', name: 'Truyện Cá rô con không vâng lời mẹ', emoji: '🐟', color: 'bg-white', videoId: '8_EQU-rRq-M' },
  { id: 'story-con-hieu-thao', name: 'Truyện Người con hiếu thảo', emoji: '👵', color: 'bg-white', videoId: 'VSH-nDHRt-0' },
  { id: 'story-tich-ngay-dem', name: 'Truyện Sự tích ngày và đêm', emoji: '🌞🌛', color: 'bg-white', videoId: '2WpRkMFRasM' },
  { id: 'story-tich-mua-xuan', name: 'Truyện Sự tích mùa xuân', emoji: '🌸', color: 'bg-white', videoId: 'cWNT7wTufPU' },
  { id: 'story-banh-trung-giay', name: 'Truyện Sự tích bánh trưng bánh giầy', emoji: '🍱', color: 'bg-white', videoId: 'ZxLNQDzFbn0' },
];

const POEMS_5_6 = [
  { id: 'poem-meo-cau-ca', name: 'Thơ mèo đi câu cá', emoji: '🐱', color: 'bg-white', videoId: 'OzZv7DzXAhw' },
  { id: 'poem-nang-tien-oc', name: 'Thơ nàng tiên ốc', emoji: '🐚', color: 'bg-white', videoId: 'HgZu4OXOvG0' },
  { id: 'poem-anh-bac', name: 'Thơ ảnh bác', emoji: '🖼️', color: 'bg-white', videoId: 'WhplEQzu87s' },
  { id: 'poem-den-giao-thong', name: 'Thơ đèn giao thông', emoji: '🚦', color: 'bg-white', videoId: 'syqGn4qpU0c' },
  { id: 'poem-ga-hoc-chu', name: 'Thơ gà học chữ', emoji: '🐔', color: 'bg-white', videoId: 'JVc80qORa8I' },
  { id: 'poem-ban-moi', name: 'Thơ bạn mới', emoji: '🤝', color: 'bg-white', videoId: '-tdFOnOtIOY' },
  { id: 'poem-bac-ho', name: 'Thơ bác hồ của em', emoji: '👴', color: 'bg-white', videoId: 'UkOLAsXYTsE' },
  { id: 'poem-lam-anh', name: 'Bài thơ Làm anh', emoji: '👦', color: 'bg-white', videoId: 'aL19E1bqwfM' },
];

const LETTER_LESSONS_5_6 = [
  { id: 'lesson-itc', name: 'Làm quen chữ cái: i-t-c', emoji: '🔤', color: 'bg-white', videoId: 'T-5N4m9iiYQ' },
  { id: 'lesson-uu', name: 'Trò chơi với chữ cái u-ư', emoji: '🎮', color: 'bg-white', videoId: '73S_4_J6508' },
  { id: 'lesson-sx', name: 'Làm quen với chữ cái s x', emoji: '🔤', color: 'bg-white', videoId: 'UqQiX_fjGio' },
  { id: 'lesson-hk', name: 'Làm quen với chữ cái h-k', emoji: '🔤', color: 'bg-white', videoId: 'IHiWG5hFL7w' },
  { id: 'lesson-aaa', name: 'Làm quen chữ cái: a-ă-â', emoji: '🔤', color: 'bg-white', videoId: 'uiP7SDc5XXU' },
  { id: 'lesson-ee', name: 'Làm quen chữ cái e-ê', emoji: '🔤', color: 'bg-white', videoId: '047B0MVtZhE' },
  { id: 'lesson-pq', name: 'Làm quen chữ cái p-q', emoji: '🔤', color: 'bg-white', videoId: 'VhVnLd5nM9g' },
  { id: 'lesson-bdd', name: 'Làm quen chữ cái b-d-đ', emoji: '🔤', color: 'bg-white', videoId: '-m7CJI9iDvo' },
  { id: 'lesson-vr', name: 'Làm quen chữ cái v-r', emoji: '🔤', color: 'bg-white', videoId: 'H9E66AQtSkY' },
];

const CATEGORIES = [
  {
    id: 'physical',
    title: 'PHÁT TRIỂN THỂ CHẤT',
    subtitle: 'Vận động & Sức khỏe',
    description: 'Vận động khỏe mạnh, thể dục nhịp điệu & rèn luyện thân thể',
    icon: '🏃‍♂️',
    icon3D: 'physical' as const,
    color: 'bg-emerald-50',
    textColor: 'text-emerald-950',
    shadow: 'shadow-emerald-200/80',
    badge: '12+ Bài tập',
    border: 'border-emerald-400',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    accentColor: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'cognitive',
    title: 'PHÁT TRIỂN NHẬN THỨC',
    subtitle: 'Toán học & Khoa học',
    description: 'Toán học vui, khám phá khoa học & thế giới xung quanh',
    icon: '💡',
    icon3D: 'cognitive' as const,
    color: 'bg-amber-50',
    textColor: 'text-amber-950',
    shadow: 'shadow-amber-200/80',
    badge: 'Toán & Khám phá',
    border: 'border-amber-400',
    btnColor: 'bg-amber-500 hover:bg-amber-600 text-white',
    accentColor: 'from-amber-400 to-yellow-500'
  },
  {
    id: 'language',
    title: 'PHÁT TRIỂN NGÔN NGỮ',
    subtitle: 'Chữ cái & Truyện kể',
    description: 'Làm quen bảng chữ cái, truyện cổ tích & thơ mầm non',
    icon: '🔤',
    icon3D: 'language' as const,
    color: 'bg-pink-50',
    textColor: 'text-pink-950',
    shadow: 'shadow-pink-200/80',
    badge: 'Chữ & Truyện hay',
    border: 'border-pink-400',
    btnColor: 'bg-pink-600 hover:bg-pink-700 text-white',
    accentColor: 'from-pink-400 to-rose-500'
  },
  {
    id: 'social',
    title: 'TÌNH CẢM - KỸ NĂNG XÃ HỘI',
    subtitle: 'Cảm xúc & Kỹ năng sống',
    description: 'Yêu thương, chia sẻ, an toàn sống & thói quen tốt',
    icon: '🤝',
    icon3D: 'social' as const,
    color: 'bg-purple-50',
    textColor: 'text-purple-950',
    shadow: 'shadow-purple-200/80',
    badge: 'Kỹ năng & An toàn',
    border: 'border-purple-400',
    btnColor: 'bg-purple-600 hover:bg-purple-700 text-white',
    accentColor: 'from-purple-400 to-indigo-500'
  },
  {
    id: 'aesthetic',
    title: 'PHÁT TRIỂN THẨM MỸ',
    subtitle: 'Nghệ thuật & Âm nhạc',
    description: 'Ca hát múa sôi động, tô màu & tạo hình sáng tạo',
    icon: '🎨',
    icon3D: 'aesthetic' as const,
    color: 'bg-sky-50',
    textColor: 'text-sky-950',
    shadow: 'shadow-sky-200/80',
    badge: 'Âm nhạc & Tạo hình',
    border: 'border-sky-400',
    btnColor: 'bg-sky-600 hover:bg-sky-700 text-white',
    accentColor: 'from-sky-400 to-blue-500'
  }
];

const AGE_GROUPS = [
  { id: 'toddler', name: 'Nhà trẻ', ageLabel: 'Dưới 3 tuổi', icon: '🍼', color: 'bg-[#FFD6E8]', textColor: 'text-pink-900', border: 'border-pink-200' },
  { id: '3-4', name: '3 - 4 Tuổi', ageLabel: 'Mẫu giáo bé', icon: '🎈', color: 'bg-[#CDEBFF]', textColor: 'text-sky-900', border: 'border-sky-200' },
  { id: '4-5', name: '4 - 5 Tuổi', ageLabel: 'Mẫu giáo nhỡ', icon: '🎨', color: 'bg-[#C8F7DC]', textColor: 'text-emerald-900', border: 'border-emerald-200' },
  { id: '5-6', name: '5 - 6 Tuổi', ageLabel: 'Mẫu giáo lớn', icon: '🎓', color: 'bg-[#FFF4B8]', textColor: 'text-amber-900', border: 'border-amber-200' },
];

const PHYSICAL_TODDLER_ACTIVITIES = [
  { id: 'tung-bong', name: 'Tung bóng bằng 2 tay', emoji: '🎾', color: 'bg-red-200', videoId: 'C9kqvRrZuvg', audioUrl: 'https://www.image2url.com/r2/default/files/1777258624338-eb9f33aa-421e-417b-b2ad-df52b06decb1.wav' },
  { id: 'di-duong-hep', name: 'Đi trong đường hẹp', emoji: '🚶', color: 'bg-blue-200', videoId: 'pJPDcbmpWt8', audioUrl: 'https://www.image2url.com/r2/default/files/1777258659517-00de4579-5f56-4038-9c83-e0c9570fd17f.wav' },
  { id: 'nem-bong', name: 'Ném bóng về phía trước', emoji: '🥎', color: 'bg-green-200', videoId: 'rrr0MJPsB_M', audioUrl: 'https://www.image2url.com/r2/default/files/1777258704177-0a153db7-9013-4523-b514-ade4485be07d.wav' },
  { id: 'da-bong', name: 'Đá bóng về phía trước', emoji: '⚽', color: 'bg-yellow-200', videoId: 'oRJHRm3wc5U' },
  { id: 'bo-chui-cong', name: 'Bò chui qua cổng có vật trên lưng', emoji: '🐢', color: 'bg-orange-200', videoId: 'gHEq-Nz2_HI' },
  { id: 'bat-nhay', name: 'Bật nhảy tại chỗ', emoji: '🐰', color: 'bg-purple-200', videoId: 'SnLgJpd8UUY' },
  { id: 'di-be-vat', name: 'Đi có bê vật trên tay', emoji: '📦', color: 'bg-pink-200', videoId: '4xD_a8UE0c4' },
  { id: 'di-buoc-vat-can', name: 'Đi Bước qua vật cản', emoji: '🚧', color: 'bg-sky-200', videoId: 'BN5ClqNtr6g' },
  { id: 'nem-bong-qua-day', name: 'Ném bóng qua dây', emoji: '🏐', color: 'bg-emerald-200', videoId: 'xB9qbnALZNU' },
  { id: 'nem-bong-vao-dich-toddler', name: 'Ném bóng vào đích', emoji: '🎯', color: 'bg-blue-200', videoId: 'Ufje1XJuDOA' },
  { id: 'bat-qua-vach-ke', name: 'Bật qua vạch kẻ', emoji: '🏃', color: 'bg-pink-200', videoId: 'hmsd6ZX3YSU' },
  { id: 'chay-huong-thang', name: 'Chạy theo hướng thẳng', emoji: '🏃‍♂️', color: 'bg-orange-200', videoId: '9FDo17TPocM' },
];

const PHYSICAL_3_4_ACTIVITIES = [
  { id: 'bat-vong', name: 'Bật liên tục qua 3 vòng', emoji: '⭕', color: 'bg-pink-200', videoId: 'KW_t6YFsX0A' },
  { id: 'di-duong-hep-34', name: 'Đi trong đường hẹp', emoji: '🚶', color: 'bg-blue-200', videoId: 'TXjTR2wzeEw' },
  { id: 'di-chay-dich-dac', name: 'Đi – chạy đổi hướng trong đường dích dắc', emoji: '👣', color: 'bg-yellow-200', videoId: 'QhYDFdSjyJs' },
  { id: 'tung-bat-bong-34', name: 'Tung và bắt bóng cùng cô (2,5 m)', emoji: '🏐', color: 'bg-sky-200', videoId: 'G3AJ2G60XjE' },
  { id: 'di-kieng-got', name: 'Đi kiễng gót liên tục 3m', emoji: '👣', color: 'bg-red-200', videoId: 'SGyVltLihhs' },
  { id: 'lan-bong-co', name: 'Lăn bóng với cô', emoji: '⚽', color: 'bg-green-200', videoId: 'MIWVWugumpE' },
  { id: 'chuyen-bat-bong-hang-ngang', name: 'Chuyền, bắt bóng 2 bên theo hàng ngang', emoji: '🏐', color: 'bg-yellow-200', videoId: 'COr7oRnIrlI' },
  { id: 'truon-phia-truoc', name: 'Trườn về phía trước', emoji: '🦎', color: 'bg-orange-200', videoId: 'dzzT2BYjZ4g' },
  { id: 'bo-dich-dac', name: 'Bò theo đường dích dắc', emoji: '🐍', color: 'bg-purple-200', videoId: 'g4Xc-efVCto' },
  { id: 'buoc-len-xuong-buc', name: 'Bước lên, xuống bục cao', emoji: '🪜', color: 'bg-pink-200', videoId: 'lCKK3eUF4oA' },
  { id: 'nem-bong-ro', name: 'Ném bóng vào rổ', emoji: '🏀', color: 'bg-sky-200', videoId: '-q2YeXAcHgY' },
  { id: 'da-bong-phia-truoc', name: 'Đá bóng về phía trước', emoji: '⚽', color: 'bg-emerald-200', videoId: 'oRJHRm3wc5U' },
  { id: 'di-kieng-got-new', name: 'Đi kiễng gót', emoji: '👣', color: 'bg-red-200', videoId: '9k4c2oyCJV0' },
  { id: 'bat-tien-phia-truoc', name: 'Bật tiến về phía trước', emoji: '🐰', color: 'bg-blue-200', videoId: '1PWHvC6rYhY' },
  { id: 'bat-xa-20-25cm', name: 'Bật xa 20-25cm', emoji: '🏃', color: 'bg-green-200', videoId: 'Z-43AiGNgV4' },
];

const PHYSICAL_4_5_ACTIVITIES = [
  { id: 'di-buoc-lui', name: 'Đi bước lùi liên tiếp khoảng 3 m', emoji: '👣', color: 'bg-blue-200', videoId: '-o8AKomCuQc' },
  { id: 'nem-trung-dich', name: 'Ném trúng đích ngang bằng 1 tay', emoji: '🎯', color: 'bg-red-200', videoId: 'cgv0YTrCDtM' },
  { id: 'bo-ban-tay-chan', name: 'Bò bằng bàn tay và bàn chân 3-4m', emoji: '🦎', color: 'bg-green-200', videoId: '91ewTiixPWk' },
  { id: 'treo-thang', name: 'Trèo lên, xuống 5 gióng thang', emoji: '🪜', color: 'bg-yellow-200', videoId: 'JA4GMbwLC_I' },
  { id: 'bat-vat-can', name: 'Bật qua vật cản cao 10 - 15cm', emoji: '🏃', color: 'bg-orange-200', videoId: 'F-siue7bCLE' },
  { id: 'di-got-khuyu-lui', name: 'Đi bằng gót chân, đi khuỵu gối, đi lùi', emoji: '👣', color: 'bg-purple-200', videoId: 'cKbxtgBo8DQ' },
  { id: 'di-vach-ke-thang', name: 'Đi trên vạch kẻ thẳng trên sàn', emoji: '📏', color: 'bg-pink-200', videoId: 'YXLKng4qhGQ' },
  { id: 'dap-bat-bong-tai-cho', name: 'Đập và bắt bóng tại chỗ', emoji: '🏀', color: 'bg-sky-200', videoId: 't0p3C_gx7Zk' },
  { id: 'nem-xa-1-tay-45', name: 'Ném xa bằng 1 tay', emoji: '☄️', color: 'bg-emerald-200', videoId: '1y70BDaJkwg' },
  { id: 'truon-huong-thang', name: 'Trườn theo hướng thẳng', emoji: '🦎', color: 'bg-red-200', videoId: '-tpYzv8wpCI' },
  { id: 'bat-tach-khep-chan', name: 'Bật tách chân, khép chân qua 5 ô', emoji: '🏃', color: 'bg-blue-200', videoId: '6PCu4AVbFM8' },
  { id: 'bo-dich-dac-5-diem', name: 'Bò dích dắc qua 5 điểm', emoji: '🐍', color: 'bg-yellow-200', videoId: '_NNwFoiQ17U' },
];

const PHYSICAL_5_6_ACTIVITIES = [
  { id: 'di-mep-ngoai-khuyu-goi', name: 'Đi bằng mép ngoài bàn chân, đi khuỵu gối', emoji: '👣', color: 'bg-orange-200', videoId: 'FjdX3FTPCIM' },
  { id: 'tung-bat-bong-cao', name: 'Tung bóng lên cao và bắt bóng', emoji: '🏐', color: 'bg-yellow-200', videoId: 'Qu5b4EyQd4g' },
  { id: 'nem-trung-dich-dung', name: 'Ném trúng đích đứng', emoji: '🎯', color: 'bg-green-200', videoId: 'or4t6UzTJIo' },
  { id: 'bo-dich-dac-7-diem', name: 'Bò dích dắc qua 7 điểm', emoji: '🐍', color: 'bg-blue-200', videoId: 'REOkHUiqaRU' },
  { id: 'bat-nhay-tu-cao', name: 'Bật- nhảy từ trên cao xuống (40-45cm)', emoji: '🐰', color: 'bg-purple-200', videoId: 'VObLzuWSoVA' },
  { id: 'lan-bong-ziczac-5-chuong-ngai', name: 'Lăn bóng ziczac theo 5 chướng ngại vật', emoji: '⚽', color: 'bg-pink-200', videoId: 'hINUJ1Vr4KU' },
  { id: 'chay-18m-chuyen-bong', name: 'Chạy 18m trong khoảng 10s; Chuyền bóng qua đầu', emoji: '🏃', color: 'bg-red-200', videoId: 'gmSBPDbyu1E' },
  { id: 'di-ghe-tui-cat', name: 'Đi trên ghế thể dục đầu đội túi cát', emoji: '🪜', color: 'bg-sky-200', videoId: 'Grpwt5K5qdA' },
  { id: 'treo-thang-nhanh-kheo', name: 'Trèo lên xuống 7 gióng thang; Nhanh và khéo', emoji: '🪜', color: 'bg-emerald-200', videoId: 'CaK0t2WfbQY' },
  { id: 'bat-7-o-dua-bong-gon', name: 'Bật tách khép chân qua 7 ô; Đưa bóng vào gôn', emoji: '⚽', color: 'bg-yellow-200', videoId: 'BnzuweSeIsU' },
  { id: 'truon-treo-ghe-dai', name: 'Trườn kết hợp trèo qua ghế dài 1,5m x 30 cm', emoji: '🦎', color: 'bg-orange-200', videoId: 'SJEb7ldRk68' },
  { id: 'bat-vat-can-15-20cm', name: 'Bật qua vật cản cao 15-20cm', emoji: '🏃', color: 'bg-blue-200', videoId: 'icYlpD8olmU' },
];

const SOCIAL_TODDLER_ACTIVITIES = [
  { id: 'chao-hoi-le-phep', name: 'Kỹ năng chào hỏi lễ phép', emoji: '🙏', color: 'bg-emerald-100', videoId: 'p2a38xT8tTk' },
  { id: 'cam-thia-tu-xuc', name: 'Kỹ năng cầm thìa tự xúc cơm', emoji: '🥄', color: 'bg-orange-100', videoId: 'TpeBoM5aQps' },
  { id: 'cam-coc-uong-nuoc', name: 'Kỹ năng cầm cốc uống nước đúng cách', emoji: '🥛', color: 'bg-blue-100', videoId: 'CzGjM7cnA7s' },
  { id: 'bo-rac-dung-noi', name: 'Kỹ năng bỏ rác đúng nơi quy định', emoji: '🗑️', color: 'bg-green-100', videoId: 'q5Os_YYGEgY' },
  { id: 'be-ghe', name: 'Kỹ năng bê ghế', emoji: '🪑', color: 'bg-amber-100', videoId: '6o2JKPJOUGA' },
  { id: 'khong-an-keo-toi', name: 'Không Ăn Kẹo Vào Buổi Tối', emoji: '🍭', color: 'bg-pink-100', videoId: 'iUp7_7ztkys' },
  { id: 'di-dep-dung-cach', name: 'Kĩ năng đi dép đúng cách', emoji: '🩴', color: 'bg-blue-100', videoId: '1gWRxY44Jac' },
  { id: 'ky-nang-xau-hat', name: 'Kỹ năng xâu hạt', emoji: '📿', color: 'bg-purple-100', videoId: '9Fk2S8ifRPs' }
];

const SOCIAL_4_5_ACTIVITIES = [
  { id: 'phong-tranh-lac', name: 'Kĩ năng phòng tránh khi bị lạc', emoji: '🏢', color: 'bg-pink-100', videoId: 'WU_ZOAKa47A' },
  { id: 'xu-tri-bat-coc', name: 'Xử trí khi bị bắt cóc', emoji: '⚠️', color: 'bg-red-100', videoId: '2NEBhR8LaIE' },
  { id: 'quy-tac-5-ngon', name: 'Quy tắc 5 ngón tay', emoji: '✋', color: 'bg-yellow-100', videoId: '_KIXLfEQ_uc' },
  { id: 'nhan-biet-nguoi-la', name: 'Nhận biết người lạ', emoji: '👤', color: 'bg-slate-200', videoId: '6hoGqc0_mbY' },
  { id: 'thoat-hiem-chay', name: 'Cách thoát hiểm khi có cháy', emoji: '🔥', color: 'bg-orange-100', videoId: 'k8uMv-KDG_s' },
  { id: 'xu-tri-bi-bong', name: 'Xử trí khi bị bỏng', emoji: '🔥', color: 'bg-orange-100', videoId: 'Tvd_vH1qGAc' },
  { id: 'xu-tri-cho-du', name: 'Cách xử trí khi gặp chó dữ', emoji: '🐕', color: 'bg-slate-200', videoId: 'ZBhcm4DvDfw' },
  { id: 'biet-cam-on', name: 'Biết cảm ơn khi được giúp đỡ', emoji: '🙏', color: 'bg-emerald-100', videoId: '-e8-jW2_Itg' },
  { id: 'lich-su-cong-cong', name: 'Lịch sự nơi công cộng', emoji: '🏢', color: 'bg-blue-100', videoId: 'bniXIOd6M_g' },
  { id: 'buoc-day-giay', name: 'Kỹ năng buộc dây giày', emoji: '👟', color: 'bg-amber-100', videoId: 'KmosqAcTp-o' },
  { id: 'su-dung-dua', name: 'Cách sử dụng đũa', emoji: '🥢', color: 'bg-orange-100', videoId: 'Ov1_BzS3dfA' },
  { id: 'keo-khoa-ao', name: 'Cách kéo khóa áo', emoji: '🧥', color: 'bg-sky-100', videoId: 'DLDEGiO4nJY' },
  { id: 'tha-lay-tam', name: 'Cách thả tăm và lấy tăm', emoji: '🦷', color: 'bg-slate-100', videoId: '5X_Z_SIoJKs' },
  { id: 'boc-vo-trung', name: 'Cách bóc vỏ trứng', emoji: '🥚', color: 'bg-yellow-100', videoId: 'o_WRas_tHiM' },
  { id: 'skills-drowning-prevention', name: 'Kỹ năng phòng chống đuối nước', emoji: '🌊', color: 'bg-blue-100', videoId: 'zC_KpomS31s' },
  { id: 'hanh-vi-dung-sai', name: 'Nhận biết, phân biệt hành vy đúng-sai, tốt-xấu', emoji: '⚖️', color: 'bg-emerald-100', videoId: 'lwELYbnJYUA' },
  { id: 'nhan-biet-cam-xuc-full', name: 'Nhận biết cảm xúc vui, buồn, sợ hãi, tức giận, ngạc nhiên', emoji: '🎭', color: 'bg-yellow-100', videoId: '4D1B9FG87Og' }
];

const SOCIAL_3_4_ACTIVITIES = [
  { id: 'nhan-biet-cam-xuc-34', name: 'Nhận biết cảm xúc vui, buồn, ngạc nhiên', emoji: '😊', color: 'bg-yellow-100', videoId: '51lYAbCttAE' },
  { id: 'tu-phuc-vu', name: 'Kỹ năng tự phục vụ', emoji: '👕', color: 'bg-emerald-100', videoId: '8bpeIXJhBsQ' },
  { id: 'su-binh-tinh', name: 'Câu chuyện về sự bình tĩnh', emoji: '🧘', color: 'bg-sky-100', videoId: 'tiPp5lxzXgA' },
  { id: 'an-toan-thiet-bi', name: 'An toàn với thiết bị trong nhà', emoji: '🏠', color: 'bg-red-100', videoId: 'IKyYu_Lkw3Y' },
  { id: 'phong-tranh-do-nguy-hiem', name: 'Phòng tránh đồ dùng nguy hiểm', emoji: '⚠️', color: 'bg-orange-100', videoId: '3uFWcPq3btU' },
  { id: 'an-toan-cau-thang', name: 'An toàn khi lên xuống cầu thang', emoji: '🪜', color: 'bg-blue-100', videoId: '0vfOag9UBmc' },
  { id: 'dong-mo-nap-chai', name: 'Đóng mở nắp chai, lọ', emoji: '🧴', color: 'bg-emerald-100', videoId: 'LRIpgz2QXUE' },
  { id: 'su-dung-keo-an-toan', name: 'Sử dụng kéo an toàn', emoji: '✂️', color: 'bg-amber-100', videoId: 'BjYzeM0V-WQ' },
  { id: 'cai-coi-cuc-ao', name: 'Kỹ năng cài cúc, cởi cúc', emoji: '🧥', color: 'bg-purple-100', videoId: 'grz7PHqlh4o' },
  { id: 'quet-hot-rac', name: 'Quét và hót rác trên sàn', emoji: '🧹', color: 'bg-slate-200', videoId: 'BCvF14c-NYA' },
  { id: 'ky-nang-gap-khan', name: 'Kỹ năng gấp khăn', emoji: '🧺', color: 'bg-orange-100', videoId: 'AFFBN_kBWZw' },
  { id: 'ky-nang-di-tat', name: 'Kỹ năng đi tất', emoji: '🧦', color: 'bg-blue-100', videoId: '6Q5gKxiOp1I' }
];

const SOCIAL_5_6_ACTIVITIES = [
  { id: 'cam-xuc-cua-be', name: 'Cảm xúc của bé', emoji: '🎭', color: 'bg-blue-100', videoId: '51lYAbCttAE' },
  { id: 'noi-loi-yeu-thuong', name: 'Nói lời yêu thương', emoji: '❤️', color: 'bg-pink-100', videoId: 'tiPp5lxzXgA' },
  { id: 'vui-choi-doan-ket', name: 'Vui chơi đoàn kết', emoji: '🤝', color: 'bg-green-100', videoId: 'XbfRJXYxrXE' },
  { id: 'nu-cuoi-than-thien', name: 'Nụ cười thân thiện', emoji: '😊', color: 'bg-yellow-100', videoId: 'DTEvrDZdV2g' },
  { id: 'ban-be-chia-se', name: 'Bạn bè cùng chia sẻ', emoji: '👫', color: 'bg-purple-100', videoId: '3KL8PV8AjGE' },
  { id: 'su-dung-dien-an-toan', name: 'Kỹ năng sử dụng điện an toàn', emoji: '⚡', color: 'bg-yellow-100', videoId: '3J42V77DTj0' },
  { id: 'xu-ly-duoi-nuoc', name: 'Cách xử lý khi bị đuối nước', emoji: '🏊', color: 'bg-sky-100', videoId: 'QMO0_DBjXuE' },
  { id: 'cham-soc-nhuong-nhin-em', name: 'Biết Chăm Sóc Và Nhường Nhịn Em Nhỏ', emoji: '👶', color: 'bg-pink-100', videoId: '_AT3SgRs-l4' }
];

const AESTHETIC_4_5_SECTIONS = [
  {
    title: '🎨 Tạo hình',
    items: [
      { id: 'cat-gap-con-ga', name: 'Cắt gấp dán con gà', emoji: '🐔', color: 'bg-yellow-400', videoId: '5D_rxBVDkR0' },
      { id: 've-con-trung', name: 'Vẽ côn trùng', emoji: '🐞', color: 'bg-green-400', videoId: 'oHmDn49Rj6s' },
      { id: 'gap-cay-thong', name: 'Gấp cây thông', emoji: '🌲', color: 'bg-emerald-400', videoId: 'kacYRv-48_A' },
      { id: 've-may-bay', name: 'Vẽ máy bay', emoji: '✈️', color: 'bg-sky-400', videoId: 'GKYh8l9mGzc' },
      { id: 've-cai-trong', name: 'Vẽ cái trống', emoji: '🥁', color: 'bg-orange-400', videoId: 'RyzGlm2YOv8' },
      { id: 've-cai-coc', name: 'Vẽ cái cốc', emoji: '🥛', color: 'bg-blue-400', videoId: '9d0DV44o7mc' },
      { id: 've-chiec-kem', name: 'Vẽ chiếc kem', emoji: '🍦', color: 'bg-pink-400', videoId: 'BC0FhuySbS0' },
      { id: 've-con-ca', name: 'Vẽ con cá', emoji: '🐟', color: 'bg-sky-400', videoId: 'ezIZbXrPMig' },
      { id: 'cat-dan-tia-nang', name: 'Cắt dán tia nắng', emoji: '☀️', color: 'bg-yellow-400', videoId: 'HDV-4QMKO0U' },
      { id: 'xe-dan-vay-ca', name: 'Xé dán vẩy cá (ĐT)', emoji: '🐠', color: 'bg-orange-400', videoId: 'gQoNGMhypsc' },
      { id: 'tao-hinh-lam-den-long', name: 'Làm đèn lồng', emoji: '🏮', color: 'bg-red-400', videoId: '0qYsnKUsEZM' },
      { id: 'lam-con-trau-la-mit', name: 'Làm con trâu từ lá mít', emoji: '🐃', color: 'bg-emerald-400', videoId: 'PoG6xXwHK8s' },
      { id: 've-cau-vong-new', name: 'Vẽ cầu vồng', emoji: '🌈', color: 'bg-sky-400', videoId: 'FcZ3VmvAkcA' },
    ]
  },
  {
    title: '🎵 Âm nhạc',
    items: [
      { id: 'nga-tu-duong-pho', name: 'Em đi qua ngã tư đường phố', emoji: '🚦', color: 'bg-blue-400', videoId: '8_gbsyVxKT8' },
      { id: 'chau-yeu-cong-nhan', name: 'Cháu yêu cô chú công nhân', emoji: '👷', color: 'bg-amber-400', videoId: 'ARDczrBrquk' },
      { id: 'do-ban', name: 'Bài hát Đố bạn', emoji: '❓', color: 'bg-purple-400', videoId: 'sc-6sG4FWqU' },
      { id: 'con-chuon-chuon', name: 'Con chuồn chuồn', emoji: '🚁', color: 'bg-sky-300', videoId: 'X4Eom3dKjYQ' },
      { id: 'nha-cua-toi', name: 'Nhà của tôi', emoji: '🏠', color: 'bg-pink-400', videoId: 'Q8rT9-dMYK4' },
      { id: 'em-yeu-cay-xanh', name: 'Bài hát Em yêu cây xanh', emoji: '🌳', color: 'bg-green-400', videoId: 'r8OfI_vog1c' },
      { id: 'bau-va-bi', name: 'Bầu và bí', emoji: '🥒', color: 'bg-emerald-400', videoId: 'qyvooDB-wQc' },
      { id: 'mua-he-den', name: 'Mùa hè đến', emoji: '☀️', color: 'bg-yellow-400', videoId: 'ujFE2XU0Z8c' },
      { id: 'cho-toi-di-lam-mua', name: 'Cho tôi đi làm mưa với', emoji: '🌧️', color: 'bg-sky-400', videoId: 'hWign3FKCqI' },
      { id: 'banh-chung-xanh', name: 'Bánh chưng xanh', emoji: '🍱', color: 'bg-green-500', videoId: 'rIaqdhZLXug' },
      { id: 'di-xe-dap', name: 'Đi xe đạp', emoji: '🚲', color: 'bg-blue-300', videoId: 'RIEd0kVS3z8' },
      { id: 'vdmh-vui-den-truong', name: 'VĐMH: “Vui đến trường”', emoji: '🏫', color: 'bg-sky-400', videoId: 'sMqy851kq_4' },
      { id: 'hat-bac-gau-lam-banh', name: 'Hát: “Bác gấu làm bánh”', emoji: '🐻', color: 'bg-amber-400', videoId: 'SWPN8xWB3nw' },
      { id: 've-cau-vong-music', name: 'Vẽ cầu vồng', emoji: '🌈', color: 'bg-sky-400', videoId: 'FcZ3VmvAkcA' },
      { id: 'vuon-cay-nha-be', name: 'Bài hát Vườn cây nhà bé', emoji: '🌳', color: 'bg-green-400', videoId: 'QrlmgolDOmc' },
    ]
  }
];

const AESTHETIC_TODDLER_SECTIONS = [
  {
    title: '🎨 Tạo hình',
    items: [
      { id: 'dan-chum-bong', name: 'Dán chùm bóng bay', emoji: '🎈', color: 'bg-red-400', videoId: 'cd--QA8MQqo' },
      { id: 'dan-hoa-tang-co', name: 'Dán hoa tặng cô', emoji: '💐', color: 'bg-pink-400', videoId: 'Jv3Y9zsJl8M' },
      { id: 'di-mau-o-rom', name: 'Di màu làm ổ rơm', emoji: '🧺', color: 'bg-orange-400', videoId: 'hLYvB_FX_Xk' },
      { id: 'nan-banh-deo', name: 'Nặn bánh dẻo chay', emoji: '🍡', color: 'bg-slate-400' },
      { id: 'nan-qua-tron', name: 'Nặn quả tròn', emoji: '🍎', color: 'bg-green-400', videoId: 'ycsQeKBfoFs' },
      { id: 've-duong-ve-nha', name: 'Vẽ đường về nhà', emoji: '🏠', color: 'bg-blue-400', videoId: 'c1Sr_LLAhYw' },
      { id: 'nan-con-giun', name: 'Nặn con giun', emoji: '🪱', color: 'bg-pink-300', videoId: 'cFf8t3acunA' },
      { id: 've-to-chim', name: 'Vẽ tổ chim', emoji: '🪹', color: 'bg-amber-300', videoId: 'RwY34N4z6SA' },
      { id: 've-cuon-len', name: 'Vẽ cuộn len màu', emoji: '🧶', color: 'bg-purple-300', videoId: '_16QJSmjbjE' },
      { id: 'nan-doi-dua', name: 'Nặn đôi đũa', emoji: '🥢', color: 'bg-slate-300', videoId: 'KC5vY1p2LNU' },
      { id: 'nan-vien-phan', name: 'Nặn viên phấn', emoji: '🖍️', color: 'bg-white', videoId: '78RBPwrSkbw' },
      { id: 'chuyen-hat-kep', name: 'Chuyển hạt bằng kẹp', emoji: '🥢', color: 'bg-emerald-300', videoId: 'RthfiEua--M' },
    ]
  },
  {
    title: '🎵 Âm nhạc',
    items: [
      { id: 'dh-lai-o-to', name: 'DH “Lái ô tô”', emoji: '🚗', color: 'bg-sky-400', videoId: 'defkunCiRgY' },
      { id: 'dh-ca-vang-boi', name: 'Dạy hát “Cá vàng bơi”', emoji: '🐠', color: 'bg-yellow-400', videoId: 'xWrWiAqCbcc' },
      { id: 'vdtn-bap-cai-xanh', name: 'VĐTN: “Bắp cải xanh”', emoji: '🥬', color: 'bg-emerald-400', videoId: 'tjUxxoqpnA4' },
      { id: 'nh-be-chuc-xuan', name: 'Nghe hát: “Bé chúc xuân”', emoji: '🧧', color: 'bg-red-400', videoId: 'VPLgQktGEK0' },
      { id: 'chau-yeu-ba', name: 'Cháu yêu bà', emoji: '👵', color: 'bg-pink-400', videoId: '2a8QDoJguyA' },
      { id: 'chau-di-mau-giao', name: 'Cháu đi mẫu giáo', emoji: '🎒', color: 'bg-sky-400', videoId: 'e848OnCYEzE' },
      { id: 'di-hoc-ve', name: 'Đi học về', emoji: '🏠', color: 'bg-amber-400', videoId: 'gphG6PKF98I' },
      { id: 'ca-nha-thuong-nhau', name: 'Cả nhà thương nhau', emoji: '👨‍👩‍👧‍👦', color: 'bg-red-400', videoId: '3gnelyE2P3E' },
      { id: 'ai-yeu-chu-meo', name: 'Ai cũng yêu chú mèo', emoji: '🐱', color: 'bg-orange-400', videoId: 'md09rw16z3o' },
      { id: 'khuon-mat-cuoi-nh', name: 'Bài hát Khuôn mặt cười', emoji: '😊', color: 'bg-yellow-400', videoId: 'MrpbAHvyPdk' },
      { id: 'o-sao-be-khong-lac', name: 'Bài hát ồ sao bé không lắc', emoji: '🕺', color: 'bg-pink-400', videoId: 'cBsRP4W2tH8' },
      { id: 'co-va-me-nh', name: 'Bài hát cô và mẹ', emoji: '👩', color: 'bg-red-300', videoId: 'gq9eTf2D2n8' },
    ]
  }
];

const AESTHETIC_3_4_SECTIONS = [
  {
    title: '🎨 Tạo hình',
    items: [
      { id: 've-khuon-mat-cuoi', name: 'Vẽ khuôn mặt cười (Mẫu)', emoji: '😊', color: 'bg-yellow-400', videoId: '60Gpy6DlOsE' },
      { id: 've-trai-tim-cau-vong', name: 'Vẽ và tô màu trái tim cầu vồng', emoji: '🌈❤️', color: 'bg-pink-400', videoId: 'rzEvK61LJfs' },
      { id: 've-gau-bong', name: 'Vẽ, tô màu đồ chơi bé thích: Gấu bông', emoji: '🧸', color: 'bg-amber-400', videoId: 'VysNlwmodq0' },
      { id: 'tao-hinh-cam-xuc', name: 'Tạo hình khuôn mặt cảm xúc', emoji: '🎭', color: 'bg-blue-400', videoId: 'QbbFwaD4CYo' },
      { id: 'in-ngon-tay-chim', name: 'In ngón tay tạo thành con chim', emoji: '🐦', color: 'bg-sky-300', videoId: '_aAk5n9A2hg' },
      { id: 'nan-con-cua', name: 'Nặn con cua', emoji: '🦀', color: 'bg-red-300', videoId: '_yTOyvVaOG4' },
      { id: 'lam-cot-den-gt', name: 'Làm cột đèn giao thông từ vật liệu tái chế', emoji: '🚦', color: 'bg-slate-400', videoId: 'eA7leYwSKjQ' },
      { id: 'lam-oto-tai', name: 'Làm ô tô tải từ vỏ hộp sữa', emoji: '🚛', color: 'bg-blue-300', videoId: 'Ycxy27900Aw' },
    ]
  },
  {
    title: '🎵 Âm nhạc',
    items: [
      { id: 'ga-meo-cun', name: 'Gà trống mèo con và cún con', emoji: '🐓🐱🐶', color: 'bg-amber-400', videoId: 'JvS2_meKCI' },
      { id: 'di-duong-em-nho', name: 'Đi đường em nhớ', emoji: '🚶', color: 'bg-emerald-400', videoId: '2qS1zlm_axo' },
      { id: 'sap-den-tet-roi', name: 'Bài hát Sắp đến Tết rồi', emoji: '🧧', color: 'bg-red-400', videoId: 'bWK2oRpO9EM' },
      { id: 'bai-hat-mua-xuan', name: 'Bài hát Mùa xuân', emoji: '🌸', color: 'bg-pink-400', videoId: 'zs4crUpSCAo' },
      { id: 'hoa-truong-em', name: 'Bài hát "Hoa trường em"', emoji: '🌼', color: 'bg-yellow-300', videoId: 'uKiXbFZssjk' },
      { id: 'em-tap-lam-bo-doi', name: 'Bài hát Em tập làm chú bộ đội', emoji: '💂', color: 'bg-green-600', videoId: 'DSI1C_QnnrM' },
      { id: 'duong-em-di', name: 'Bài hát Đường em đi', emoji: '🛣️', color: 'bg-blue-400', videoId: 'MgU-4Ktvwtw' },
      { id: 'yeu-ha-noi', name: 'Bài hát Yêu hà nội', emoji: '🏮', color: 'bg-red-400', videoId: 'mSKZMT1B5h0' },
    ]
  }
];

const AESTHETIC_5_6_SECTIONS = [
  {
    title: '🎨 Tạo hình',
    items: [
      { id: 've-con-bo-sua', name: 'Vẽ con bò sữa', emoji: '🐄', color: 'bg-stone-400', videoId: 'QPmGz3AhxUI' },
      { id: 'dan-nong-mot', name: 'Đan nong mốt', emoji: '🧺', color: 'bg-orange-400', videoId: 'T3gtrnA4cMI' },
      { id: 'lam-chong-chong', name: 'Làm chong chóng giấy', emoji: '🎡', color: 'bg-sky-400', videoId: '5vdU2Y0mCTw' },
      { id: 'tao-hinh-soi-da', name: 'Tạo hình từ sỏi đá', emoji: '🪨', color: 'bg-slate-400', videoId: '_QShvVYPYvM' },
      { id: 've-truong-tieu-hoc', name: 'Vẽ trường tiểu học', emoji: '🏫', color: 'bg-red-400', videoId: 'N3_tc3_jfB0' },
      { id: 'tao-hinh-ban-tay', name: 'In tạo hình con vật từ bàn tay', emoji: '✋🐾', color: 'bg-pink-400', videoId: 'sQIIv7JD0Xk' },
      { id: 've-chan-dung-co', name: 'Vẽ chân dung cô giáo', emoji: '👩‍🏫', color: 'bg-purple-400', videoId: 'FPrms0WrMBc' },
      { id: 'xe-dan-dan-ca', name: 'Xé dán đàn cá', emoji: '🐟', color: 'bg-blue-400', videoId: 'bNxIHVnv5TE' },
      { id: 'tranh-quat-giay', name: 'Sáng tạo tranh từ quạt giấy', emoji: '🪭', color: 'bg-pink-300', videoId: 't-m84fRXNSo' },
      { id: 'in-tranh-dong-ho', name: 'In tranh Đông Hồ', emoji: '🖼️', color: 'bg-amber-400', videoId: '8j6_2vMu2OM' },
      { id: 've-truong-mn', name: 'Vẽ trường mầm non của bé', emoji: '🏫', color: 'bg-emerald-400', videoId: 'bNcSeaVmRFo' },
      { id: 'lam-quat-giay', name: 'Dạy trẻ làm quạt giấy', emoji: '🪭', color: 'bg-orange-300', videoId: 'lRMp2BRFA44' },
      { id: 'gap-thuyen-origami', name: 'Gấp thuyền giấy phong cách origami', emoji: '⛵', color: 'bg-blue-300', videoId: '3Ckx4p2z1As' },
    ]
  },
  {
    title: '🎵 Âm nhạc',
    items: [
      { id: 'khuc-hat-doi-ban-tay', name: 'Bài hát Khúc hát đôi bàn tay', emoji: '🙌', color: 'bg-emerald-400', videoId: 'IujwnYaVAZ0' },
      { id: 'nha-minh-rat-vui', name: 'VĐMH: “Nhà mình rất vui”', emoji: '🏠👨‍👩‍👧‍👦', color: 'bg-yellow-400', videoId: 'MpM109hnrtE' },
      { id: 'am-tra', name: 'Tôi là cái ấm trà', emoji: '🫖', color: 'bg-sky-300', videoId: 'rJxUYLP24DE' },
      { id: 'chu-bo-doi', name: 'Chú bộ đội', emoji: '💂', color: 'bg-green-600', videoId: 'pEfC88oti0k' },
      { id: 'bac-dua-thu', name: 'Bác đưa thư vui tính', emoji: '📮', color: 'bg-amber-300', videoId: 't-b5BTilg44' },
      { id: 'lai-may-cay', name: 'Lớn lên cháu lái máy cày', emoji: '🚜', color: 'bg-orange-400', videoId: 'l9Pq-LS3KFw' },
      { id: 'voi-con-ban-don', name: 'Chú voi con ở bản đôn', emoji: '🐘', color: 'bg-stone-400', videoId: 'ZEFjgndKTmA' },
      { id: 'phi-cong', name: 'Anh phi công ơi', emoji: '👨‍✈️', color: 'bg-blue-400', videoId: 'WPrsXLwRPvA' },
      { id: 'ong-nau-em-be', name: 'Chị Ong Nâu và Em bé', emoji: '🐝', color: 'bg-yellow-400', videoId: '1TA4FF6XKGQ' },
      { id: 'me-oi-tai-sao', name: 'Mẹ Ơi Tại Sao', emoji: '❓', color: 'bg-pink-400', videoId: 'B6_VuB3Mzmw' },
      { id: 'con-cao-cao-song', name: 'Con Cào Cào', emoji: '🦗', color: 'bg-green-400', videoId: 'RITXbzMTOFs' },
      { id: 'ga-trong-thoi-ken', name: 'Gà trống thổi kèn', emoji: '🐓', color: 'bg-yellow-500', videoId: 'uZeusZrrFnc' },
    ]
  }
];

const COGNITIVE_SECTIONS = [
  {
    title: '1️⃣ Làm quen toán',
    items: [
      { id: 'numbers', name: 'Nhận biết số 1–10', emoji: '1️⃣', color: 'bg-[#FF6B9E]' },
      { id: 'compare-qty', name: 'So sánh nhiều – ít', emoji: '⚖️', color: 'bg-[#34A4E4]' },
      { id: 'shapes', name: 'Hình tròn, vuông, tam giác', emoji: '🔺', color: 'bg-[#8DE065]' },
      { id: 'patterns', name: 'Sắp xếp theo quy tắc', emoji: '🧩', color: 'bg-[#FFD13B]' },
    ]
  },
  {
    title: '2️⃣ Khám phá khoa học',
    items: [
      { id: 'animals', name: 'Con vật sống ở đâu?', emoji: '🐾', color: 'bg-[#FF6B9E]' },
      { id: 'plants', name: 'Cây cần gì để lớn?', emoji: '🌱', color: 'bg-[#34A4E4]' },
      { id: 'day-night', name: 'Hiện tượng ngày – đêm', emoji: '🌞', color: 'bg-[#8DE065]' },
      { id: 'weather', name: 'Thời tiết', emoji: '⛅', color: 'bg-[#FFD13B]' },
    ]
  },
  {
    title: '3️⃣ Phân loại – so sánh',
    items: [
      { id: 'size', name: 'To – nhỏ', emoji: '🐘', color: 'bg-[#FF6B9E]' },
      { id: 'height', name: 'Cao – thấp', emoji: '🦒', color: 'bg-[#34A4E4]' },
      { id: 'length', name: 'Dài – ngắn', emoji: '📏', color: 'bg-[#8DE065]' },
      { id: 'colors', name: 'Màu sắc', emoji: '🎨', color: 'bg-[#FFD13B]' },
    ]
  }
];

const LEARNING_SECTIONS = [
  { id: 'lessons', title: 'Bài học', description: 'Ngắn – trực quan', icon: '📺', color: 'bg-[#CDEBFF]' },
  { id: 'games', title: 'Trò chơi tương tác', description: 'Học mà chơi', icon: '🎮', color: 'bg-[#C8F7DC]' },
  { id: 'records', title: 'Ghi nhận kết quả', description: 'Lưu lại khoảnh khắc', icon: '📸', color: 'bg-[#FFD6E8]' },
  { id: 'reports', title: 'Báo cáo tiến bộ', description: 'Theo dõi sự phát triển', icon: '📈', color: 'bg-[#E5D9FF]' },
];

const PRAISE_PHRASES = [
  "Chúc mừng bé đã làm đúng!",
  "Giỏi lắm!",
  "Tuyệt vời quá!",
  "Bé thật thông minh!"
];

const ENCOURAGE_PHRASES = [
  "Con hãy thử lại nhé!",
  "Gần đúng rồi, cố lên nào!",
  "Không sao, mình làm lại nhé!"
];

// Audio Context for playing PCM data from Gemini
let audioCtx: AudioContext | null = null;

const playBase64PCM = async (base64Data: string): Promise<void> => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }

  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const buffer = new Int16Array(bytes.buffer);
  const audioBuffer = audioCtx.createBuffer(1, buffer.length, 24000);
  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < buffer.length; i++) {
    channelData[i] = buffer[i] / 32768.0;
  }

  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);

  return new Promise<void>((resolve) => {
    source.onended = () => resolve();
    source.start();
  });
};

const speak = async (text: string, isPraise = false, lang = 'vi'): Promise<void> => {
  await readAssistantMessage(text, true, lang);
};

const getCurrentItemsList = (currentView: string, selectedAge: string | null, letterLang: string) => {
  if (currentView === 'language') {
    let stories: any[] = [];
    let poems: any[] = [];
    if (selectedAge === 'toddler') { stories = STORIES_TODDLER; poems = POEMS_TODDLER; }
    else if (selectedAge === '3-4') { stories = STORIES_3_4; poems = POEMS_3_4; }
    else if (selectedAge === '4-5') { stories = STORIES_4_5; poems = POEMS_4_5; }
    else if (selectedAge === '5-6') { stories = STORIES_5_6; poems = POEMS_5_6; }

    const letters = letterLang === 'vi' ? LETTERS : ENGLISH_LETTERS;
    let initialList: any[] = [];
    if (selectedAge === '5-6') initialList = [...LETTER_LESSONS_5_6, ...letters, ...stories, ...poems];
    else if (selectedAge === 'toddler' || selectedAge === '3-4') initialList = [...stories, ...poems];
    else initialList = [...letters, ...stories, ...poems];
    return initialList;
  }

  if (currentView === 'physical') {
    if (selectedAge === 'toddler') return PHYSICAL_TODDLER_ACTIVITIES;
    if (selectedAge === '3-4') return PHYSICAL_3_4_ACTIVITIES;
    if (selectedAge === '4-5') return PHYSICAL_4_5_ACTIVITIES;
    if (selectedAge === '5-6') return PHYSICAL_5_6_ACTIVITIES;
  }
  if (currentView === 'social') {
    if (selectedAge === 'toddler') return SOCIAL_TODDLER_ACTIVITIES;
    if (selectedAge === '3-4') return SOCIAL_3_4_ACTIVITIES;
    if (selectedAge === '4-5') return SOCIAL_4_5_ACTIVITIES;
    if (selectedAge === '5-6') return SOCIAL_5_6_ACTIVITIES;
  }
  return [];
};

export default function App({ startAtHome = false }: { startAtHome?: boolean }) {
  const { user: accountUser, openAccount } = useAccount();
  const isTeacher = accountUser?.role === 'teacher';
  const ownerScope = accountUser?.id || 'guest';
  const [localStorage] = useState(getLearnerStorage);
  const mounted = useRef(false);
  const pronunciation = useRef<{ stream?: MediaStream; recorder?: MediaRecorder; timer?: ReturnType<typeof setTimeout>; controller: AbortController } | null>(null);
  const isCurrentOwner = () => mounted.current && getLearnerScope() === ownerScope;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const active = pronunciation.current;
      pronunciation.current = null;
      if (!active) return;
      active.controller.abort();
      clearTimeout(active.timer);
      if (active.recorder) {
        active.recorder.onstop = null;
        active.recorder.ondataavailable = null;
        if (active.recorder.state !== 'inactive') active.recorder.stop();
      }
      active.stream?.getTracks().forEach(track => track.stop());
    };
  }, []);
  const deviceFetch = useMemo<typeof fetch>(() => (input, init) => {
    if (getLearnerScope() !== ownerScope) return Promise.reject(new DOMException('Tài khoản đã thay đổi', 'AbortError'));
    return fetchDeviceData(input, init);
  }, [ownerScope]);
  const routeFromPath = (): TeacherRoute => location.pathname === '/giao-vien/giao-an' ? 'lessons' : location.pathname === '/giao-vien/hoc-sinh' ? 'students' : location.pathname === '/giao-vien/hop-thu' ? 'inbox' : location.pathname === '/giao-vien/chuan-bi-bai' ? 'prepare' : location.pathname === '/giao-vien/tu-hoc' ? 'self-study' : 'home';
  const startsInTeacherArea = isTeacher && location.pathname.startsWith('/giao-vien');
  const [showSplash, setShowSplash] = useState(!startAtHome && !startsInTeacherArea);
  const [currentView, setCurrentView] = useState(startsInTeacherArea ? 'teacher' : 'home');
  const [currentTab, setCurrentTab] = useState(startsInTeacherArea ? 'teacher' : 'home');
  const [teacherRoute, setTeacherRoute] = useState<TeacherRoute>(routeFromPath);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [letterLang, setLetterLang] = useState<'vi' | 'en'>('vi');
  const [stars, setStars, starsData] = useDeviceDocument('stars', () => readStoredNumber('kvtt.stars.v1'));
  const [activeMathGame, setActiveMathGame] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string, url: string, name: string, type: 'image' | 'video' }[]>([]);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [emotionHistory, setEmotionHistory, emotionsData] = useDeviceDocument<EmotionRecord[]>('emotions', readEmotionHistory);
  const [studyTime, setStudyTime, studyData] = useDeviceDocument('study-time', () => ({ day: localDay(), seconds: getTodayStudySeconds() }));
  const studySeconds = studyTime.day === localDay() ? studyTime.seconds : 0;
  const setStudySeconds = (update: number | ((previous: number) => number)) => setStudyTime(previous => ({ day: localDay(), seconds: typeof update === 'function' ? update(previous.day === localDay() ? previous.seconds : 0) : update }));
  const studyDay = useRef(localDay());
  const [storageError, setStorageError] = useState('');
  const [emotionSpeechError, setEmotionSpeechError] = useState('');
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState !== 'hidden');
  const [sessionTimeLeft, setSessionTimeLeft] = useState(30 * 60); // 30 minutes
  const [settings, setSettings, settingsData] = useDeviceDocument('settings', () => ({ sessionMinutes: 30, dailyActivityTarget: 3 }));
  const sessionTimeLimit = settings.sessionMinutes;
  const setSessionTimeLimit = (value: number) => setSettings(previous => ({ ...previous, sessionMinutes: value }));
  const [showSessionEndModal, setShowSessionEndModal] = useState(false);
  const [showEyeExercise, setShowEyeExercise] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [userEmotion, setUserEmotion] = useState<string | null>(() => {
    const latest = readEmotionHistory()[0];
    return latest && localDay(new Date(latest.date)) === localDay() ? latest.emotion : null;
  });
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<string | null>(null);
  const [stickers, setStickers] = useState<string[]>([]);
  const [showBreathing, setShowBreathing] = useState(false);

  const dailyActivityTarget = settings.dailyActivityTarget;
  const setDailyActivityTarget = (value: number) => setSettings(previous => ({ ...previous, dailyActivityTarget: value }));
  const [dailyActivity, setDailyActivity, dailyActivityData] = useDeviceDocument('daily-activity', () => ({ day: localDay(), count: 0, items: [] as string[] }));
  const activitiesCompleted = dailyActivity.day === localDay() ? dailyActivity.count : 0;
  const setActivitiesCompleted = (update: number | ((previous: number) => number)) => setDailyActivity(previous => ({ ...previous, day: localDay(), count: typeof update === 'function' ? update(previous.day === localDay() ? previous.count : 0) : update }));
  const [searchQuery, setSearchQuery] = useState('');
  const [homeMode, setHomeMode] = useState<'kids' | 'teachers'>('kids');
  const [selectedFilterAge, setSelectedFilterAge] = useState<string | null>(null);
  const completedItems = dailyActivity.items;
  const setCompletedItems = (update: string[] | ((previous: string[]) => string[])) => setDailyActivity(previous => ({ ...previous, items: typeof update === 'function' ? update(previous.items) : update }));
  const [englishInitialTarget, setEnglishInitialTarget] = useState<'kids' | 'teachers' | 'games'>('kids');
  const [englishInitialAge, setEnglishInitialAge] = useState<'3-4' | '4-5' | '5-6'>('3-4');

  const openTeacherRoute = (route: TeacherRoute, path: string, replace = false) => {
    if (!isTeacher) return;
    window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
    setTeacherRoute(route); setCurrentView('teacher'); setCurrentTab('teacher'); setShowSplash(false);
  };
  useEffect(() => {
    if (!isTeacher && location.pathname.startsWith('/giao-vien')) window.history.replaceState({}, '', '/');
    const pop = () => { if (isTeacher && location.pathname.startsWith('/giao-vien')) { setTeacherRoute(routeFromPath()); setCurrentView('teacher'); setCurrentTab('teacher'); } else { setCurrentView('home'); setCurrentTab('home'); } };
    window.addEventListener('popstate', pop); return () => window.removeEventListener('popstate', pop);
  }, [isTeacher]);

  const openEnglishModule = (target: 'kids' | 'teachers' | 'games' = 'kids', age: '3-4' | '4-5' | '5-6' = '3-4') => {
    if (target === 'teachers' && !isTeacher) return;
    if (window.location.pathname.startsWith('/giao-vien')) {
      window.history.pushState({}, '', '/');
    }
    setEnglishInitialTarget(target);
    setEnglishInitialAge(age);
    setCurrentTab('home');
    setCurrentView('english');
    setSelectedAge(null);
    setSelectedSection(null);
    speak(target === 'teachers' ? "Tiếng Anh cùng cô giáo" : target === 'games' ? "Trò chơi tiếng Anh mầm non" : `Tiếng Anh mầm non ${age} tuổi`);
  };

  const [learningStats, setLearningStats, statsData] = useDeviceDocument<LearningProgressStats>('learning-stats', readLearningStats);
  const [unlockedBadgeIds, setUnlockedBadgeIds, badgesData] = useDeviceDocument<string[]>('badges', readUnlockedBadges);
  const deviceData = [starsData, emotionsData, studyData, settingsData, statsData, badgesData, dailyActivityData];
  const dataLoading = deviceData.some(item => item.loading);
  const dataFailure = deviceData.find(item => item.error);

  useEffect(() => { setSessionTimeLeft(sessionTimeLimit * 60); }, [sessionTimeLimit]);
  useEffect(() => {
    const latest = emotionHistory[0];
    setUserEmotion(latest && localDay(new Date(latest.date)) === localDay() ? latest.emotion : null);
  }, [emotionHistory]);
  useEffect(() => {
    let cancelled = false;
    void deviceFetch('/api/device/uploads').then(async response => {
      if (!response.ok) throw new Error();
      const files = await response.json();
      if (!Array.isArray(files)) throw new Error();
      if (!cancelled) setUploadedFiles(files);
    }).catch(() => { if (!cancelled) setUploadError('Chưa tải được thư viện ảnh và video. Hãy thử tải lại màn hình.'); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab, currentView, selectedAge, selectedSection]);

  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<BadgeItem | null>(null);

  const checkBadgeUnlocks = (newStats: LearningProgressStats, currentStars: number, currentUnlocked: string[]) => {
    const newlyEarned: BadgeItem[] = [];
    BADGES_LIST.forEach(badge => {
      if (currentUnlocked.includes(badge.id)) return;
      let val = 0;
      switch (badge.id) {
        case 'math-superhero':
          val = newStats.mathStreak || newStats.mathCount;
          break;
        case 'little-orator':
          val = newStats.speechStreak || newStats.speechCount;
          break;
        case 'streak-master':
          val = newStats.streakCount;
          break;
        case 'young-scientist':
          val = newStats.scienceCount;
          break;
        case 'bilingual-knight':
          val = newStats.englishCount;
          break;
        case 'creative-artist':
          val = newStats.artCount;
          break;
        case 'physical-champion':
          val = newStats.physicalCount;
          break;
        case 'kind-heart':
          val = newStats.socialCount;
          break;
        case 'first-star':
          val = currentStars;
          break;
        case 'super-star':
          val = currentStars;
          break;
        case 'grand-champion':
          val = currentStars;
          break;
      }
      if (val >= badge.targetCount) {
        newlyEarned.push(badge);
      }
    });

    if (newlyEarned.length > 0) {
      const firstNew = newlyEarned[0];
      setNewlyUnlockedBadge(firstNew);
      setUnlockedBadgeIds(prev => {
        const updated = Array.from(new Set([...prev, ...newlyEarned.map(b => b.id)]));
        try {
          localStorage.setItem('mamnon_unlocked_badges', JSON.stringify(updated));
        } catch { }
        return updated;
      });
      speak(`Tuyệt vời! Bé đã xuất sắc mở khóa huy hiệu: ${firstNew.title}!`);
      try {
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.5 }
        });
      } catch { }
    }
  };

  const triggerCompletionReward = (itemName?: string, categoryHint?: string) => {
    if (!isCurrentOwner()) return;
    const nextStars = stars + 1;
    setStars(nextStars);
    setActivitiesCompleted(prev => prev + 1);
    if (itemName && !completedItems.includes(itemName)) {
      setCompletedItems(prev => [...prev, itemName]);
    }

    const cat = categoryHint || currentView;
    const nameLower = (itemName || '').toLowerCase();
    const isMath = cat === 'math' || (cat === 'cognitive' && (
      nameLower.includes('toán') ||
      nameLower.includes('đếm') ||
      nameLower.includes('số') ||
      nameLower.includes('hình') ||
      nameLower.includes('math') ||
      nameLower.includes('1-5') ||
      nameLower.includes('1-10')
    ));
    const isScience = cat === 'cognitive' && !isMath;
    const isSpeech = cat === 'speech' || cat === 'language' || nameLower.includes('thơ') || nameLower.includes('truyện') || nameLower.includes('phát âm') || nameLower.includes('nói') || nameLower.includes('đọc');
    const isEnglish = cat === 'english';
    const isArt = cat === 'aesthetic';
    const isPhysical = cat === 'physical';
    const isSocial = cat === 'social';

    setLearningStats(prev => {
      const nextStreak = prev.streakCount + 1;
      const nextMathStreak = isMath ? prev.mathStreak + 1 : prev.mathStreak;
      const nextSpeechStreak = isSpeech ? prev.speechStreak + 1 : prev.speechStreak;

      const updated: LearningProgressStats = {
        ...prev,
        streakCount: nextStreak,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
        mathCount: isMath ? prev.mathCount + 1 : prev.mathCount,
        mathStreak: nextMathStreak,
        speechCount: isSpeech ? prev.speechCount + 1 : prev.speechCount,
        speechStreak: nextSpeechStreak,
        scienceCount: isScience ? prev.scienceCount + 1 : prev.scienceCount,
        englishCount: isEnglish ? prev.englishCount + 1 : prev.englishCount,
        artCount: isArt ? prev.artCount + 1 : prev.artCount,
        physicalCount: isPhysical ? prev.physicalCount + 1 : prev.physicalCount,
        socialCount: isSocial ? prev.socialCount + 1 : prev.socialCount,
      };

      try {
        localStorage.setItem('mamnon_learning_stats', JSON.stringify(updated));
      } catch { }

      checkBadgeUnlocks(updated, nextStars, unlockedBadgeIds);
      return updated;
    });

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error(e);
    }
    speak("Giỏi lắm! Bé đã hoàn thành bài học và nhận được một ngôi sao lấp lánh!", true);
  };

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    setIsTimerRunning(!dataLoading && !showSplash && currentTab === 'home' && !showCheckIn && !showEyeExercise && !showSessionEndModal && pageVisible && sessionTimeLeft > 0);
  }, [dataLoading, showSplash, currentTab, showCheckIn, showEyeExercise, showSessionEndModal, pageVisible, sessionTimeLeft]);

  useEffect(() => {
    try { localStorage.setItem('kvtt.stars.v1', String(stars)); }
    catch { setStorageError('Chưa lưu được dữ liệu trên thiết bị. Dữ liệu vẫn có trong lượt mở này.'); }
  }, [stars]);

  useEffect(() => {
    try { localStorage.setItem('kvtt.emotions.v1', JSON.stringify(emotionHistory)); }
    catch { setStorageError('Chưa lưu được nhật ký trên thiết bị. Cảm xúc vẫn có trong lượt mở này.'); }
  }, [emotionHistory]);

  useEffect(() => {
    try { localStorage.setItem('kvtt.study-time.v1', JSON.stringify({ day: studyDay.current, seconds: studySeconds })); }
    catch { setStorageError('Chưa lưu được thời gian học trên thiết bị.'); }
  }, [studySeconds]);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && sessionTimeLeft > 0) {
      interval = setInterval(() => {
        setSessionTimeLeft((prev) => Math.max(0, prev - 1));
        const day = localDay();
        if (studyDay.current !== day) {
          studyDay.current = day;
          setStudySeconds(1);
        } else setStudySeconds(prev => prev + 1);
      }, 1000);
    } else if (isTimerRunning && sessionTimeLeft === 0) {
      setIsTimerRunning(false);
      setShowEyeExercise(true);
      speak("Bạn ơi, mắt tớ mỏi rồi, chúng mình cùng đi uống nước và nhìn ra xa một lát nhé!", true);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, sessionTimeLeft]);

  const handleCategoryClick = (id: string) => {
    setCurrentView(id);
    setSelectedAge(null);
    setSelectedSection(null);

    if (id === 'english') {
      speak('Chào mừng bé và cô đến với phân hệ Tiếng Anh');
      return;
    }

    const audioUrls: Record<string, string> = {
      physical: "https://www.image2url.com/r2/default/files/1777167115114-1c2c97ec-84f7-4844-a7f7-bf77d87b9c02.wav",
      cognitive: "https://www.image2url.com/r2/default/files/1777167238984-701fa9e6-3525-41d8-a041-d70665e56a82.wav",
      language: "https://www.image2url.com/r2/default/files/1777167334797-d682aca0-3956-48f9-a603-f1274beaa5d0.wav",
      aesthetic: "https://www.image2url.com/r2/default/files/1777167372114-fb88452f-2787-4744-8f56-c7ee6b45f39b.wav",
      social: "https://www.image2url.com/r2/default/files/1777167419292-69e65ec0-5627-4213-a8d1-15acba370496.wav"
    };

    if (audioUrls[id]) {
      const audio = new Audio(audioUrls[id]);
      audio.play().catch(e => console.error("Audio play failed", e));
    } else {
      speak(CATEGORIES.find(c => c.id === id)?.title || '');
    }
  };

  const getItemSpeechText = (item: any) => {
    let textToSpeak = item.name;
    let lang = 'vi';

    const phoneticMap: Record<string, string> = {
      'a': 'a', 'ă': 'á', 'â': 'ớ', 'b': 'bờ', 'c': 'cờ',
      'd': 'dờ', 'đ': 'đờ', 'e': 'e', 'ê': 'ê', 'g': 'gờ',
      'h': 'hờ', 'i': 'i', 'k': 'ca', 'l': 'lờ', 'm': 'mờ',
      'n': 'nờ', 'o': 'o', 'ô': 'ô', 'ơ': 'ơ', 'p': 'pờ',
      'q': 'cu', 'r': 'rờ', 's': 'sờ', 't': 'tờ', 'u': 'u',
      'ư': 'ư', 'v': 'vờ', 'x': 'xờ', 'y': 'i dài',
      'A': 'a', 'Ă': 'á', 'Â': 'ớ', 'B': 'bờ', 'C': 'cờ',
      'D': 'dờ', 'Đ': 'đờ', 'E': 'e', 'Ê': 'ê', 'G': 'gờ',
      'H': 'hờ', 'I': 'i', 'K': 'ca', 'L': 'lờ', 'M': 'mờ',
      'N': 'nờ', 'O': 'o', 'Ô': 'ô', 'Ơ': 'ơ', 'P': 'pờ',
      'Q': 'cu', 'R': 'rờ', 'S': 'sờ', 'T': 'tờ', 'U': 'u',
      'Ư': 'ư', 'V': 'vờ', 'X': 'xờ', 'Y': 'i dài'
    };

    if (currentView === 'language') {
      if (item.id && (item.id.toString().startsWith('story-') || item.id.toString().startsWith('poem-'))) {
        textToSpeak = item.name;
        lang = 'vi';
      } else if (item.id && item.id.toString().startsWith('lesson-')) {
        const lessonPhoneticMap: Record<string, string> = {
          'lesson-itc': 'Làm quen chữ cái: i, tờ, cờ',
          'lesson-uu': 'Trò chơi với chữ cái u, ư',
          'lesson-sx': 'Làm quen với chữ cái sờ, xờ',
          'lesson-hk': 'Làm quen với chữ cái hờ, ca',
          'lesson-aaa': 'Làm quen chữ cái: a, á, ớ',
          'lesson-ee': 'Làm quen chữ cái e, ê',
          'lesson-pq': 'Làm quen chữ cái pờ, cu',
          'lesson-bdd': 'Làm quen chữ cái bờ, dờ, đờ',
          'lesson-vr': 'Làm quen chữ cái vờ, rờ'
        };
        textToSpeak = lessonPhoneticMap[item.id] || item.name;
        lang = 'vi';
      } else if (letterLang === 'vi') {
        const letterSound = phoneticMap[item.id] || item.id;
        const description = item.name.split(' – ')[1] || item.name;
        const phoneticDescription = description.startsWith(item.id + ' ')
          ? description.replace(item.id + ' ', letterSound + ' ')
          : description;

        textToSpeak = `Chữ ${letterSound}. ${phoneticDescription}`;
        lang = 'vi';
      } else {
        // For English, we provide a Vietnamese explanation but read the English word clearly.
        textToSpeak = `Chữ ${item.id} tiếng Anh. Đọc là: ${item.word}. Nghĩa là: ${item.name.split(', ')[1] || item.name}`;
        lang = 'vi';
      }
    }
    return { text: textToSpeak, lang };
  };

  const handleItemClick = async (item: any) => {
    setSelectedItem(item);
    setPronunciationFeedback(null);
    setIsGeneratingAudio(true);

    // Update progress when a lesson is opened
    setActivitiesCompleted(prev => {
      if (prev < dailyActivityTarget) return prev + 1;
      return prev;
    });

    const letterAudioUrls: Record<string, string> = {
      'A': 'https://www.image2url.com/r2/default/files/1777169658486-52b7bedb-200b-4635-baa0-7784b6d6c37b.wav',
      'Ă': 'https://www.image2url.com/r2/default/files/1777169774368-2f308ba6-b694-4b04-8796-d22f6a349875.wav',
      'Â': 'https://www.image2url.com/r2/default/files/1777169808441-844083db-07ee-4547-9c33-1482f60c88b4.wav',
      'B': 'https://www.image2url.com/r2/default/files/1777169845229-feabb339-f00f-4c40-b7e4-46abf8ab300c.wav',
      'C': 'https://www.image2url.com/r2/default/files/1777169884177-101a83a7-34cb-4ce4-bf2b-db7ab4fb5f48.wav',
      'D': 'https://www.image2url.com/r2/default/files/1777169921167-d9d5cc5b-6cf1-4394-9cef-fbbf80e798f9.wav',
      'Đ': 'https://www.image2url.com/r2/default/files/1777169951518-0047c945-bafb-4c15-9f27-0ea3f57b60f5.wav',
      'E': 'https://www.image2url.com/r2/default/files/1777169989434-9a95738a-97f8-46b8-8f40-869a405f3236.wav'
    };

    if (item.audioUrl) {
      const audio = new Audio(item.audioUrl);
      try {
        await audio.play();
      } catch (e) {
        console.error("Audio play failed", e);
      }
      setIsGeneratingAudio(false);
    } else if (currentView === 'language' && letterAudioUrls[item.id]) {
      const audio = new Audio(letterAudioUrls[item.id]);
      try {
        await audio.play();
      } catch (e) {
        console.error("Audio play failed", e);
      }
      setIsGeneratingAudio(false);
    } else {
      const { text, lang } = getItemSpeechText(item);
      await speak(text, false, lang);
      setIsGeneratingAudio(false);
    }
  };

  const handlePronunciationPractice = async () => {
    if (!selectedItem || pronunciation.current || !isCurrentOwner()) return;
    const active: NonNullable<typeof pronunciation.current> = { controller: new AbortController() };
    pronunciation.current = active;
    const isCurrentPractice = () => isCurrentOwner() && pronunciation.current === active && !active.controller.signal.aborted;
    setIsPracticing(true);
    setPronunciationFeedback("Bé hãy đọc to lên nhé! 🎤");
    speak("Bé hãy đọc to lên nhé!");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!isCurrentPractice()) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      active.stream = stream;
      const mediaRecorder = new MediaRecorder(stream);
      active.recorder = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        try {
          if (!isCurrentPractice()) return;
          stream.getTracks().forEach(track => track.stop());
          const mimeType = mediaRecorder.mimeType || chunks[0]?.type || 'audio/webm';
          const audioBlob = new Blob(chunks, { type: mimeType });
          const reader = new FileReader();
          const base64Audio = await new Promise<string>((resolve, reject) => {
            reader.onerror = () => reject(new Error('Không đọc được bản ghi âm.'));
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(audioBlob);
          });
          if (!isCurrentPractice()) return;

          const targetWord = currentView === 'language' ? (letterLang === 'vi' ? selectedItem.word : selectedItem.word) : selectedItem.name;

          const response = await fetch('/api/pronunciation/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64: base64Audio, targetWord, mimeType }),
            signal: active.controller.signal,
          });
          if (!response.ok) throw new Error('Không thể nhận xét giọng đọc lúc này.');
          const result = await response.json() as { feedback?: string };
          if (!isCurrentPractice()) return;
          if (typeof result.feedback !== 'string' || !result.feedback.trim()) throw new Error('Invalid feedback');
          const feedback = result.feedback;
          setPronunciationFeedback(feedback);
          speak(feedback);
          triggerCompletionReward(`Luyện phát âm: ${targetWord}`, 'speech');
        } catch {
          if (!isCurrentPractice()) return;
          setPronunciationFeedback('Chưa thể nhận xét lúc này. Bé có thể thử lại sau nhé!');
        } finally {
          if (isCurrentPractice()) setIsPracticing(false);
          if (pronunciation.current === active) pronunciation.current = null;
          clearTimeout(active.timer);
          stream.getTracks().forEach(t => t.stop());
        }
      };

      mediaRecorder.start();
      active.timer = setTimeout(() => { if (isCurrentPractice() && mediaRecorder.state !== 'inactive') mediaRecorder.stop(); }, 3000);
    } catch (error) {
      active.stream?.getTracks().forEach(track => track.stop());
      if (!isCurrentPractice()) return;
      pronunciation.current = null;
      console.error("Mic error:", error);
      setIsPracticing(false);
      setPronunciationFeedback("Ôi, micro có chút vấn đề rồi bé ơi!");
    }
  };

  const handleEmotionSelect = (emotion: EmotionId) => {
    setEmotionSpeechError('');
    setUserEmotion(emotion);
    setShowCheckIn(false);

    const feedback = EMOTIONS.find(item => item.id === emotion)!.feedback;

    setEmotionHistory(prev => [{
      emotion,
      date: new Date().toISOString(),
      feedback
    }, ...prev].slice(0, 20)); // Keep last 20 records

    void readEmotionFeedback(emotion).catch(error => {
      if (getLearnerScope() !== ownerScope) return;
      setEmotionSpeechError(`${error instanceof Error ? error.message : 'Chưa đọc được lời động viên.'} Bé có thể chọn lại cảm xúc để nghe lại.`);
    });
  };

  const closeItem = () => {
    setSelectedItem(null);
  };

  const playRandomPraise = () => {
    const phrase = PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
    speak(phrase, true);
  };

  const playRandomEncourage = () => {
    const phrase = ENCOURAGE_PHRASES[Math.floor(Math.random() * ENCOURAGE_PHRASES.length)];
    speak(phrase, true);
  };

  // Searchable items index for fast lookup
  const allSearchableItems = useMemo(() => {
    const list: any[] = [];

    // Stories
    const storyGroups = [
      { data: STORIES_TODDLER, age: 'Nhà trẻ' },
      { data: STORIES_3_4, age: '3 - 4 Tuổi' },
      { data: STORIES_4_5, age: '4 - 5 Tuổi' },
      { data: STORIES_5_6, age: '5 - 6 Tuổi' }
    ];
    storyGroups.forEach(g => {
      g.data.forEach(item => {
        list.push({
          id: `story-${item.id}`,
          title: item.name,
          categoryTitle: 'Truyện kể mầm non',
          category: 'language',
          age: g.age,
          emoji: item.emoji || '📖',
          itemData: item,
          type: 'lesson'
        });
      });
    });

    // Poems
    const poemGroups = [
      { data: POEMS_TODDLER, age: 'Nhà trẻ' },
      { data: POEMS_3_4, age: '3 - 4 Tuổi' },
      { data: POEMS_4_5, age: '4 - 5 Tuổi' },
      { data: POEMS_5_6, age: '5 - 6 Tuổi' }
    ];
    poemGroups.forEach(g => {
      g.data.forEach(item => {
        list.push({
          id: `poem-${item.id}`,
          title: item.name,
          categoryTitle: 'Thơ mầm non',
          category: 'language',
          age: g.age,
          emoji: item.emoji || '📜',
          itemData: item,
          type: 'lesson'
        });
      });
    });

    // Physical
    const physicalGroups = [
      { data: PHYSICAL_TODDLER_ACTIVITIES, age: 'Nhà trẻ' },
      { data: PHYSICAL_3_4_ACTIVITIES, age: '3 - 4 Tuổi' },
      { data: PHYSICAL_4_5_ACTIVITIES, age: '4 - 5 Tuổi' },
      { data: PHYSICAL_5_6_ACTIVITIES, age: '5 - 6 Tuổi' }
    ];
    physicalGroups.forEach(g => {
      g.data.forEach(item => {
        list.push({
          id: `phy-${item.id}`,
          title: item.name,
          categoryTitle: 'Thể chất vận động',
          category: 'physical',
          age: g.age,
          emoji: item.emoji || '🏃‍♂️',
          itemData: item,
          type: 'lesson'
        });
      });
    });

    // Social
    const socialGroups = [
      { data: SOCIAL_TODDLER_ACTIVITIES, age: 'Nhà trẻ' },
      { data: SOCIAL_3_4_ACTIVITIES, age: '3 - 4 Tuổi' },
      { data: SOCIAL_4_5_ACTIVITIES, age: '4 - 5 Tuổi' },
      { data: SOCIAL_5_6_ACTIVITIES, age: '5 - 6 Tuổi' }
    ];
    socialGroups.forEach(g => {
      g.data.forEach(item => {
        list.push({
          id: `soc-${item.id}`,
          title: item.name,
          categoryTitle: 'Kỹ năng xã hội & An toàn',
          category: 'social',
          age: g.age,
          emoji: item.emoji || '🤝',
          itemData: item,
          type: 'lesson'
        });
      });
    });

    // Letter lessons 5-6
    LETTER_LESSONS_5_6.forEach(item => {
      list.push({
        id: `letter-${item.id}`,
        title: item.name,
        categoryTitle: 'Làm quen chữ cái',
        category: 'language',
        age: '5 - 6 Tuổi',
        emoji: item.emoji || '🔤',
        itemData: item,
        type: 'lesson'
      });
    });

    // Interactive games
    MATH_GAMES_DATA.forEach(game => {
      list.push({
        id: `game-${game.id}`,
        title: game.title,
        categoryTitle: 'Trò chơi tương tác',
        category: game.category || 'cognitive',
        age: game.ageGroups?.map(a => a === 'toddler' ? 'Nhà trẻ' : `${a}T`).join(', ') || '3 - 6 Tuổi',
        emoji: '🎮',
        gameData: game,
        type: 'game'
      });
    });

    // English Highlights
    list.push({
      id: 'eng-kids-all',
      title: 'Tiếng Anh vui cùng bé và cô (Từ vựng, bài hát & phản xạ)',
      categoryTitle: 'Tiếng Anh mầm non',
      category: 'english',
      age: '3 - 6 Tuổi',
      emoji: '🇬🇧',
      type: 'english'
    });

    return list;
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    return allSearchableItems.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.categoryTitle.toLowerCase().includes(q) ||
      item.age.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery, allSearchableItems]);

  const handleSearchResultClick = (item: any) => {
    setSearchQuery('');
    if (item.type === 'english') {
      setCurrentTab('home');
      setCurrentView('english');
      setSelectedAge(null);
      setSelectedSection(null);
      return;
    }
    const destination = getSearchDestination(item);
    setCurrentTab('home');
    setCurrentView(destination.view);
    setSelectedAge(destination.age);
    setSelectedSection(destination.section);
    setActiveMathGame(null);
    if (item.type === 'game') {
      if (item.gameData?.externalLink) {
        setSelectedItem({
          id: item.id,
          name: item.title,
          emoji: '🎮',
          color: 'bg-white',
          externalLink: item.gameData.externalLink
        });
      } else {
        setActiveMathGame(item.gameData.id);
      }
      return;
    }
    if (item.itemData) {
      handleItemClick(item.itemData);
    }
  };

  const renderHome = () => (
    <div className="flex flex-col items-center w-full pb-36 relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
          className="absolute -top-12 -right-12 text-[140px] opacity-75 drop-shadow-sm select-none"
        >
          🌞
        </motion.div>

        <motion.div
          animate={{ x: [0, 80, 0] }}
          transition={{ repeat: Infinity, duration: 24, ease: "easeInOut" }}
          className="absolute top-16 left-8 text-5xl opacity-60 select-none"
        >
          ☁️
        </motion.div>
        <motion.div
          animate={{ x: [0, -60, 0] }}
          transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
          className="absolute top-36 right-16 text-6xl opacity-50 select-none"
        >
          ☁️
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="absolute top-28 left-1/3 text-5xl opacity-80 select-none"
        >
          🎈
        </motion.div>
        <div className="absolute top-8 left-8 text-6xl opacity-70 transform -rotate-12 select-none">
          🌈
        </div>
      </div>

      {/* KHU VỰC 1: BANNER HOẠT HÌNH 3D CAO CẤP - THẾ GIỚI VUI HỌC CỦA BÉ */}
      <section className="w-full pt-4 pb-6 px-4 sm:px-6 relative z-10 max-w-7xl mx-auto">

        {/* Top Header Branding Bar - Modern Preschool */}
        <div className="mb-6 bg-white/95 backdrop-blur-md rounded-[28px] px-5 sm:px-8 py-3.5 border border-sky-100 shadow-[0_4px_20px_rgba(14,165,233,0.06)] flex flex-wrap items-center justify-between gap-4">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <img
              src="/school-logo.jpg"
              alt="Logo Trường Mầm Non Tô Hiến Thành"
              className="w-11 h-11 rounded-full object-cover shrink-0"
            />
            <div>
              <p className="text-[10px] sm:text-xs font-black tracking-wider text-sky-600 uppercase">Trường Mầm Non</p>
              <h2 className="text-sm sm:text-base font-black text-slate-800 tracking-tight leading-tight">TÔ HIẾN THÀNH</h2>
            </div>
          </div>

          {/* Center Title Badge */}
          <div className="hidden md:flex flex-col items-center">
            <div className="flex items-center gap-1.5 font-black text-lg">
              <span className="text-sky-600">Mầm</span>
              <span className="text-teal-500">Non</span>
              <span className="text-rose-500">Vui</span>
              <span className="text-emerald-600 flex items-center gap-1">
                Học <span className="text-base">☀️</span>
              </span>
            </div>
            <p className="text-[11px] text-sky-700 font-bold">Cùng bé khám phá – Cùng bé trưởng thành</p>
          </div>

          {/* Profile & Settings Controls */}
          <div className="flex items-center gap-2.5">
            <motion.button
              type="button"
              aria-label={accountUser ? 'Mở tài khoản của bạn' : 'Đăng nhập hoặc đăng ký'}
              whileHover={{ scale: 1.02 }}
              onClick={openAccount}
              className="flex items-center gap-2.5 bg-sky-50/90 hover:bg-sky-100/80 border border-sky-200/70 rounded-full py-1.5 pl-2 pr-4 cursor-pointer transition-all shadow-xs"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-sm shadow-xs">
                👦
              </div>
              <div className="text-left">
                <p className="text-[9px] text-slate-500 font-bold leading-none">Xin chào</p>
                <p className="max-w-28 truncate text-xs font-black text-sky-950 leading-tight">{accountUser?.fullName || 'Đăng nhập'} ✨</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08, rotate: 30 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentTab('settings');
                speak("Mở cài đặt ứng dụng");
              }}
              className="w-9 h-9 rounded-full bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-600 border border-slate-200 shadow-xs flex items-center justify-center transition-colors"
            >
              <Settings size={17} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>

        <Hero3DScene
          onExploreClick={() => {
            const el = document.getElementById('functional-categories-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            } else {
              handleCategoryClick('physical');
            }
            speak("Chào mừng bé khám phá các hoạt động vui học trong khu vườn tri thức!");
          }}
          onEnglishClick={() => {
            handleCategoryClick('english');
            speak("Chào mừng bé và cô giáo đến với góc Tiếng Anh mầm non và luyện phát âm!");
          }}
        />

        {/* Quick Search & Interaction Controls Bar */}
        <div className="mt-6 bg-white/95 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-sky-100 shadow-[0_8px_24px_rgba(14,165,233,0.06)] flex flex-col lg:flex-row items-center justify-between gap-4">

          {/* Quick Search Input */}
          <div className="relative w-full lg:max-w-md">
            <div className="relative flex items-center">
              <div className="absolute left-4 text-emerald-600 pointer-events-none">
                <Search size={20} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài học, truyện cổ tích, thơ, game..."
                className="w-full pl-11 pr-10 py-3 bg-slate-50/80 hover:bg-white focus:bg-white rounded-2xl border-2 border-emerald-200 text-slate-900 font-black text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 placeholder:text-slate-400 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Instant Search Results Dropdown */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border-2 border-sky-100 p-3 z-30 max-h-80 overflow-y-auto"
                >
                  <div className="text-xs font-black text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                    Tìm thấy {searchResults.length} hoạt động phù hợp:
                  </div>
                  <div className="space-y-1">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSearchResultClick(item)}
                        className="w-full text-left p-2.5 rounded-2xl hover:bg-sky-50 flex items-center justify-between gap-3 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-sm truncate">{item.title}</p>
                            <p className="text-xs text-slate-600 font-bold">{item.categoryTitle} · {item.age}</p>
                          </div>
                        </div>
                        <span className="shrink-0 text-xs font-black px-3.5 py-1 rounded-full bg-sky-500 text-white shadow-xs group-hover:bg-sky-600 transition-colors">
                          Bắt đầu ➔
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Chips: Mode, Emotion, Stars & Daily Progress */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 w-full lg:w-auto">

            {/* Mode Switcher Pill */}
            <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center border border-slate-200/80 shadow-inner">
              <button
                onClick={() => {
                  setHomeMode('kids');
                  speak("Không gian Bé Vui Học");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${homeMode === 'kids'
                    ? 'bg-white text-sky-900 shadow-xs border border-sky-100'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <span>🎈</span>
                <span>Bé Vui Học</span>
              </button>
              {isTeacher && <button
                onClick={() => {
                  setHomeMode('teachers');
                  openTeacherRoute('home', '/giao-vien');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${homeMode === 'teachers'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-purple-700'
                  }`}
              >
                <span>👩‍🏫</span>
                <span>Góc Của Cô</span>
              </button>}
            </div>

            {/* Emotion Check-in Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCheckIn(true)}
              className="px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-950 text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span className="text-base">
                {userEmotion === 'vui' ? '😊' : userEmotion === 'buon' ? '😢' : userEmotion === 'tuc-gian' ? '😠' : '🎭'}
              </span>
              <span>
                {userEmotion
                  ? `${userEmotion === 'vui' ? 'Vui vẻ' : userEmotion === 'buon' ? 'Buồn bã' : 'Tức giận'}`
                  : 'Cảm xúc'}
              </span>
            </motion.button>

            {/* Stars Count */}
            <div className="px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-black flex items-center gap-1.5 shadow-xs">
              <Star size={16} className="text-amber-500 fill-amber-500" />
              <span>{stars} ⭐</span>
            </div>

            {/* Daily Goal Mini */}
            <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 shadow-xs">
              <div className="text-xs font-black text-emerald-950 flex items-center gap-1">
                <span>Mục tiêu:</span>
                <span className="text-emerald-800">{activitiesCompleted}/{dailyActivityTarget}</span>
              </div>
              <div className="w-14 h-2 bg-emerald-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (activitiesCompleted / dailyActivityTarget) * 100)}%` }}
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* EMOTION SUGGESTIONS (IF SELECTED) - COMPACT & NEAT TOAST */}
      <AnimatePresence>
        {userEmotion && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-8 relative z-10"
          >
            <div className={`rounded-3xl p-5 sm:p-6 border-3 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative ${userEmotion === 'vui'
                ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-emerald-50 border-amber-300'
                : userEmotion === 'tuc-gian'
                  ? 'bg-gradient-to-r from-rose-50 via-orange-50 to-pink-50 border-rose-300'
                  : 'bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border-sky-300'
              }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">
                  {userEmotion === 'vui' ? '🌟' : userEmotion === 'tuc-gian' ? '🌬️' : '✨'}
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800">
                    {userEmotion === 'vui' && 'Bé đang rất vui vẻ! Cùng lan tỏa năng lượng tích cực nhé! 🌸'}
                    {userEmotion === 'tuc-gian' && 'Cùng cô và bạn nhỏ hít thở sâu để hạ hỏa và bình tĩnh nhé! 🎈'}
                    {userEmotion === 'buon' && 'Gợi ý ấm áp giúp bé phấn chấn và nở nụ cười trở lại! 💕'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-bold">
                    {userEmotion === 'vui' && 'Gợi ý: Cùng vẽ tranh, ca hát hoặc tặng nụ cười đến bố mẹ và cô giáo.'}
                    {userEmotion === 'tuc-gian' && 'Gợi ý: Thổi bong bóng hạ hỏa, vận động lắc lư hoặc tâm sự cùng cô.'}
                    {userEmotion === 'buon' && 'Gợi ý: Nghe câu chuyện cổ tích ấm áp, bài hát thiếu nhi vui nhộn.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                {userEmotion === 'vui' && (
                  <button
                    onClick={() => {
                      setCurrentView('aesthetic');
                      setSelectedAge('4-5');
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition-colors"
                  >
                    🎨 Vẽ tranh vui ➔
                  </button>
                )}
                {userEmotion === 'tuc-gian' && (
                  <button
                    onClick={() => setShowBreathing(true)}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl shadow-xs transition-colors"
                  >
                    🎈 Thổi bóng hạ hỏa ➔
                  </button>
                )}
                {userEmotion === 'buon' && (
                  <button
                    onClick={() => {
                      setCurrentView('language');
                      setSelectedAge('3-4');
                      setSelectedSection('lessons');
                    }}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-xs transition-colors"
                  >
                    📖 Nghe truyện cổ tích ➔
                  </button>
                )}
                <button
                  onClick={() => setUserEmotion(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-colors"
                  title="Đóng gợi ý"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* PHẦN 1: NĂM LĨNH VỰC PHÁT TRIỂN TOÀN DIỆN CHO TRẺ MẦM NON (CHUẨN BỘ GD&ĐT) */}
      {/* ========================================================================= */}
      <section id="functional-categories-section" className="w-full px-4 sm:px-6 mb-12 max-w-7xl mx-auto z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black mb-1.5 border border-emerald-300 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>5 LĨNH VỰC PHÁT TRIỂN CỐT LÕI</span>
              <span>·</span>
              <span className="text-teal-700">CHUẨN BỘ GIÁO DỤC & ĐÀO TẠO</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-2.5">
              <span>🌟</span> Năm Lĩnh Vực Phát Triển Toàn Diện
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-bold">
              Chương trình giáo dục mầm non chuẩn quốc gia, thiết kế sinh động, trực quan giúp bé vừa chơi vừa học hào hứng
            </p>
          </div>
          <span className="text-xs font-black px-4 py-2 rounded-2xl bg-white text-emerald-800 border-2 border-emerald-200 shadow-xs flex items-center gap-1.5">
            <span className="text-sm">✨</span>
            <span>Icon Phong Cách Pixar 3D</span>
          </span>
        </div>

        {/* 5 Cards Row on Widescreen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`${cat.color} card-3d-premium rounded-[32px] p-5 sm:p-6 border-3 ${cat.border} relative overflow-hidden flex flex-col justify-between min-h-[320px] group transition-all`}
            >
              {/* Ambient Top Glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/50 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>

              {/* Card Top: 3D Illustration Icon & Number Badge */}
              <div className="flex items-start justify-between gap-2 relative z-10 mb-4">
                <div className="group-hover:scale-105 transition-transform duration-300">
                  <Category3DIcon type={cat.icon3D} size={76} />
                </div>
                <span className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl text-[11px] font-black text-slate-700 shadow-xs border border-white">
                  0{idx + 1}
                </span>
              </div>

              {/* Card Body: Title, Subtitle, Description */}
              <div className="relative z-10 mb-5 flex-1">
                <h3 className={`text-base sm:text-lg font-black ${cat.textColor} leading-tight mb-1`}>
                  {cat.title}
                </h3>
                <p className="text-xs font-black text-slate-700/80 mb-2">
                  {cat.subtitle}
                </p>
                <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                  {cat.description}
                </p>
              </div>

              {/* Card Bottom: Tactile 3D Action Button */}
              <div className="relative z-10 pt-3 border-t border-black/10">
                <button
                  aria-label={`Khám phá ${cat.subtitle}`}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`btn-3d w-full py-3 px-4 rounded-2xl ${(cat as any).btnColor || 'bg-emerald-600 text-white'} font-black text-xs sm:text-sm border-2 border-white/60 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer`}
                >
                  <span>Khám phá ngay</span>
                  <span className="text-base font-black leading-none">➔</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PHẦN 2: PHÂN HỆ TIẾNG ANH MẦM NON & KHU TRÒ CHƠI 3D (ĐẶC SẮC & GỌN GÀNG)  */}
      {/* ========================================================================= */}
      <section className="w-full px-4 sm:px-6 mb-12 max-w-7xl mx-auto z-10">
        <div className="bg-gradient-to-br from-indigo-50/95 via-sky-50/90 to-purple-50/95 rounded-[36px] p-6 sm:p-8 border-4 border-indigo-200/90 shadow-xl shadow-indigo-950/5 relative overflow-hidden">

          {/* Subtle Ambient Stars */}
          <div className="absolute top-4 right-6 text-3xl opacity-40 pointer-events-none">✨</div>
          <div className="absolute bottom-4 left-6 text-2xl opacity-30 pointer-events-none">🎈</div>
          <div className="absolute -top-16 -right-16 w-52 h-52 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none"></div>

          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-7 relative z-10">
            <div>
              <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black mb-2 border border-indigo-200 shadow-xs">
                <span>🌟 PHÂN HỆ TIẾNG ANH BỔ TRỢ</span>
                <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
                <span>🐢 Nghe Chậm 0.6x</span>
                <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
                <span>🎙️ Luyện Phát Âm Chấm Điểm 3D</span>
                <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
                <span>🎮 4 Trò Chơi Mới</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-2.5">
                <span>🇬🇧</span> Tiếng Anh Mầm Non & Khu Trò Chơi Kỳ Diệu
              </h2>
              <p className="text-indigo-900/80 text-xs sm:text-sm font-bold">
                Lộ trình 3 lứa tuổi làm quen tự nhiên, phòng luyện phát âm cùng cô và khu vui chơi lật thẻ 3D, bắt bóng bay, tên lửa Phonics
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openEnglishModule('kids', '3-4')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg flex items-center gap-2 border-2 border-white shrink-0 transition-all cursor-pointer"
            >
              <span>Vào toàn bộ Tiếng Anh</span>
              <span>➔</span>
            </motion.button>
          </div>

          {/* 4 Dedicated Cards Grid: 3 Age Tracks + 1 Game Arcade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10 mb-6">

            {/* Track 1: 3-4 Tuổi */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/95 rounded-3xl p-5 border-2 border-sky-200 shadow-sm flex flex-col justify-between hover:border-sky-400 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl group-hover:scale-110 transition-transform">🎈</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-black">
                    Nghe & Bắt chước
                  </span>
                </div>
                <h4 className="font-black text-indigo-950 text-base sm:text-lg mb-1.5">
                  Bé 3–4 tuổi: Làm quen
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                  Chào hỏi Hello/Goodbye, bản thân, gia đình, màu sắc, số 1-5, thú cưng và các bộ phận cơ thể.
                </p>
              </div>
              <button
                onClick={() => openEnglishModule('kids', '3-4')}
                className="w-full py-2.5 bg-sky-50 hover:bg-sky-500 text-sky-800 hover:text-white font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-sky-200 cursor-pointer"
              >
                <span>Học bài 3–4 tuổi</span>
                <span>➔</span>
              </button>
            </motion.div>

            {/* Track 2: 4-5 Tuổi */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/95 rounded-3xl p-5 border-2 border-emerald-200 shadow-sm flex flex-col justify-between hover:border-emerald-400 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl group-hover:scale-110 transition-transform">🚀</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                    Ghép từ & Phản xạ
                  </span>
                </div>
                <h4 className="font-black text-emerald-950 text-base sm:text-lg mb-1.5">
                  Bé 4–5 tuổi: Khám phá
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                  Mở rộng vốn từ động vật, trái cây, khẩu lệnh vui nhộn (Stand up, sit down) và câu My name is...
                </p>
              </div>
              <button
                onClick={() => openEnglishModule('kids', '4-5')}
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-emerald-200 cursor-pointer"
              >
                <span>Học bài 4–5 tuổi</span>
                <span>➔</span>
              </button>
            </motion.div>

            {/* Track 3: 5-6 Tuổi */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/95 rounded-3xl p-5 border-2 border-amber-200 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl group-hover:scale-110 transition-transform">🎓</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black">
                    Hội thoại & Phonics
                  </span>
                </div>
                <h4 className="font-black text-amber-950 text-base sm:text-lg mb-1.5">
                  Bé 5–6 tuổi: Tự tin
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                  Hỏi đáp What color is it?, What do you like?, làm quen ngữ âm Phonics chuẩn bị vào Lớp 1.
                </p>
              </div>
              <button
                onClick={() => openEnglishModule('kids', '5-6')}
                className="w-full py-2.5 bg-amber-50 hover:bg-amber-500 text-amber-800 hover:text-white font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-amber-200 cursor-pointer"
              >
                <span>Học bài 5–6 tuổi</span>
                <span>➔</span>
              </button>
            </motion.div>

            {/* Track 4: Khu Trò Chơi Tiếng Anh 3D (Đặc sắc vừa tạo) */}
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-gradient-to-b from-purple-500 to-indigo-600 text-white rounded-3xl p-5 border-2 border-purple-300 shadow-lg flex flex-col justify-between transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full pointer-events-none"></div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl group-hover:scale-110 transition-transform">🎮</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-900 text-[11px] font-black shadow-xs">
                    4 Game Mới ⭐
                  </span>
                </div>
                <h4 className="font-black text-white text-base sm:text-lg mb-1.5">
                  Trò Chơi Tiếng Anh 3D
                </h4>
                <p className="text-xs text-purple-100 font-medium leading-relaxed mb-4">
                  Lật thẻ ghép đôi siêu trí nhớ, Bắt bóng bay từ vựng, Tên lửa Phonics và Hộp quà bí mật!
                </p>
              </div>
              <button
                onClick={() => openEnglishModule('games')}
                className="btn-3d w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>Vào Chơi Game Ngay 🎮</span>
              </button>
            </motion.div>

          </div>

          {/* Teacher English Integrated Banner Stripe */}
          {isTeacher && <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border-2 border-indigo-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center text-2xl shadow-xs shrink-0">
                👩‍🏫
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-black text-indigo-950">
                    Tiếng Anh Cùng Cô Giáo & Luyện Phát Âm Sư Phạm
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                    Phân hệ Giáo viên
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-bold">
                  Khẩu lệnh lớp học chuẩn có phiên âm, phòng luyện phát âm AI chấm điểm sư phạm và giáo án 4 cấp độ.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
              <button
                onClick={() => openEnglishModule('teachers')}
                className="btn-3d px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Cô Luyện Phát Âm 🎙️</span>
              </button>
              <button
                onClick={() => openEnglishModule('teachers')}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-black text-xs border border-indigo-200 transition-colors cursor-pointer"
              >
                <span>Khẩu Lệnh Lớp Học 🇬🇧</span>
              </button>
            </div>
          </div>}
        </div>
      </section>
    </div>
  );

  const renderBottomNav = () => (
    <div className="fixed bottom-0 left-0 w-full z-40 pb-6 pt-10 px-4 pointer-events-none">
      {/* Stars Display */}
      {currentTab === 'home' && !showSplash && <div className="absolute top-[-80px] right-6 pointer-events-auto">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border-2 border-yellow-200 flex items-center gap-3"
        >
          <Star size={28} className="text-yellow-500 fill-yellow-500" />
          <span className="text-2xl font-black text-yellow-700">{stars}</span>
        </motion.div>
      </div>}

      <div className={`${isTeacher ? 'sm:max-w-2xl' : 'sm:max-w-lg'} max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-full p-2 border-2 border-white/90 shadow-[0_12px_36px_rgba(14,165,233,0.12)] flex items-center justify-between relative z-10 pointer-events-auto px-2 sm:px-3`}>
        {[
          { id: 'home', icon: '🏠', label: 'Trang chủ', activeColor: 'bg-emerald-600' },
          { id: 'english', icon: 'Aa', label: 'Tiếng Anh', activeColor: 'bg-indigo-600' },
          { id: 'assistant', icon: '🤖', label: 'Trợ lý AI', activeColor: 'bg-amber-600' },
          { id: 'achievements', icon: '🏆', label: 'Thành tích', activeColor: 'bg-yellow-500' },
          { id: 'parents', icon: '👨‍👩‍👧', label: 'Phụ huynh', activeColor: 'bg-rose-500' },
          ...(isTeacher ? [{ id: 'teacher', icon: '👩‍🏫', label: 'Cô giáo', activeColor: 'bg-teal-600' }] : []),
        ].map(tab => {
          const isActive = (currentTab === tab.id && (tab.id !== 'home' || currentView !== 'english')) ||
            (tab.id === 'english' && currentTab === 'home' && currentView === 'english');
          return (
            <motion.button
              key={tab.id}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (tab.id === 'teacher') { openTeacherRoute('home', '/giao-vien'); return; }
                if (tab.id === 'english') {
                  setCurrentTab('home');
                  setCurrentView('english');
                  setSelectedAge(null);
                  setSelectedSection(null);
                  speak('Tiếng Anh');
                  return;
                }
                setCurrentTab(tab.id as any);
                speak(tab.label);
                if (location.pathname.startsWith('/giao-vien')) window.history.pushState({}, '', '/');
                if (tab.id === 'home') {
                  setCurrentView('home');
                  setSelectedAge(null);
                  setSelectedSection(null);
                }
              }}
              className={`flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-full transition-all ${isActive
                  ? `${tab.activeColor} text-white shadow-md font-black`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold'
                }`}
            >
              <span aria-hidden="true" className={`text-xl sm:text-2xl drop-shadow-xs select-none ${tab.id === 'english' ? 'font-black leading-none' : ''}`}>{tab.icon}</span>
              {isActive && (
                <span className="text-xs font-black tracking-tight whitespace-nowrap">
                  {tab.label}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  const renderAgeSelection = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return (
      <div className="flex flex-col items-center w-full pt-12 pb-40 relative z-10">
        <div className="flex items-center mb-12 gap-4 sticky top-4 z-20 bg-white/80 backdrop-blur-md p-4 rounded-[28px] shadow-sm border-2 border-white w-full max-w-4xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentView('home');
              speak("Quay lại trang chủ");
            }}
            className="p-3 bg-sky-50 rounded-full shadow-sm text-sky-600 border border-sky-100 hover:bg-sky-100 transition-colors"
          >
            <ArrowLeft size={28} strokeWidth={3} />
          </motion.button>
          {category?.icon3D && (
            <Category3DIcon type={category.icon3D} size={52} />
          )}
          <h2 className={`text-2xl sm:text-4xl font-black ${category?.textColor} capitalize truncate`}>
            {category?.title}
          </h2>
        </div>

        <motion.h3
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl sm:text-4xl font-black text-sky-800 mb-10 text-center px-4 drop-shadow-sm"
        >
          Bé hãy chọn độ tuổi nhé! ✨
        </motion.h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-4 max-w-4xl mx-auto w-full">
          {AGE_GROUPS.map((age) => (
            <motion.button
              key={age.id}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedAge(age.id);
                const ageAudioUrls: Record<string, string> = {
                  toddler: "https://www.image2url.com/r2/default/files/1777167760490-aed58972-ea7a-4348-bca8-397a630d5de1.wav",
                  '3-4': "https://www.image2url.com/r2/default/files/1777167824596-e73663df-67b6-4386-b944-2b77c444c26e.wav",
                  '4-5': "https://www.image2url.com/r2/default/files/1777167861434-cda53e08-4000-4f6a-b9f0-f3712e38dd5f.wav",
                  '5-6': "https://www.image2url.com/r2/default/files/1777167894452-2c368529-ec45-4418-8d1e-dd7d76fa51fb.wav"
                };
                if (ageAudioUrls[age.id]) {
                  const audio = new Audio(ageAudioUrls[age.id]);
                  audio.play().catch(e => console.error("Audio play failed", e));
                } else {
                  speak(`Độ tuổi ${age.name}`);
                }
              }}
              className={`${age.color} rounded-[32px] p-10 flex flex-col items-center justify-center gap-6 shadow-xl border-4 border-white/80 relative overflow-hidden group`}
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/30 rounded-full blur-2xl group-hover:bg-white/40 transition-colors"></div>
              <div className="absolute top-4 left-4 text-2xl opacity-50">⭐</div>

              <span className="text-8xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{age.icon}</span>
              <h2 className="text-4xl font-black text-slate-800/80 drop-shadow-sm tracking-wide bg-white/40 px-6 py-2 rounded-full backdrop-blur-sm">{age.name}</h2>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  const getCognitiveSections = () => {
    const sections = JSON.parse(JSON.stringify(COGNITIVE_SECTIONS));
    const mathSection = sections.find((s: any) => s.title.includes('Làm quen toán'));

    const scienceSection = sections.find((s: any) => s.title.includes('Khám phá khoa học'));
    const classificationSection = sections.find((s: any) => s.title.includes('Phân loại – so sánh'));

    if (selectedAge === 'toddler') {
      return [
        {
          title: 'Nhận biết - phân biệt',
          items: [
            { id: 'toddler-big-small', name: 'Nhận biết to - nhỏ', emoji: '🐘', color: 'bg-[#FF6B9E]', videoId: 'D4yEo4oxy-g', audioUrl: 'https://www.image2url.com/r2/default/files/1777259156073-508c7d4a-5bfa-4ea1-86c0-a0e247674530.wav' },
            { id: 'toddler-shapes', name: 'Nhận biết hình tròn – hình vuông', emoji: '⭕', color: 'bg-[#34A4E4]', videoId: 'Ac8YpNVTinQ', audioUrl: 'https://www.image2url.com/r2/default/files/1777259185014-e7d179cd-a697-4793-8e07-426683c878b6.wav' },
            { id: 'toddler-one-many', name: 'Nhận biết một và nhiều', emoji: '🔢', color: 'bg-[#8DE065]', videoId: 'hNLpZqwWoxo', audioUrl: 'https://www.image2url.com/r2/default/files/1777259227085-57c629f9-7cef-4fec-87d7-a2cb9808bea7.wav' },
            { id: 'toddler-animals', name: 'Nhận biết con gà – con vịt', emoji: '🐥', color: 'bg-[#FFD13B]', videoId: 'X5ZEUj54huE', audioUrl: 'https://www.image2url.com/r2/default/files/1777259317413-3a7119ec-4000-4357-aac8-5b2e587b1b7f.wav' },
            { id: 'toddler-vehicles', name: 'Nhận biết xe đạp – xe máy', emoji: '🚲', color: 'bg-[#FF6B9E]', videoId: 'TQk4xmV7LfI' },
            { id: 'toddler-weather', name: 'Nhận biết Trời nắng - trời mưa', emoji: '🌦️', color: 'bg-[#34A4E4]', videoId: '-xvFUGZqGgg' },
            { id: 'toddler-clothes', name: 'Nhận biết Quần đùi – áo cộc', emoji: '👕', color: 'bg-[#8DE065]', videoId: 'Z7R1-z2mRXs' },
            { id: 'toddler-pets', name: 'Nhận biết con chó, con mèo', emoji: '🐶', color: 'bg-[#FFD13B]', videoId: 'QSeyMIW_N18' },
            { id: 'toddler-up-down', name: 'Nhận biết phía trên - phía dưới', emoji: '↕️', color: 'bg-[#FF6B9E]', videoId: 'voWbLDte3gg' },
            { id: 'toddler-front-back', name: 'Nhận biết phía trước - phía sau', emoji: '↔️', color: 'bg-[#34A4E4]', videoId: 'khxa02LgyIA' },
            { id: 'toddler-colors-rgb', name: 'Nhận biết phân biệt xanh đỏ vàng', emoji: '🎨', color: 'bg-[#8DE065]', videoId: 'fZxzgE5UPKE' },
            { id: 'toddler-train', name: 'Nhận biết tập nói tàu hỏa', emoji: '🚂', color: 'bg-[#FFD13B]', videoId: 'Tviz3Ae-AAw' },
          ]
        }
      ];
    } else if (selectedAge === '3-4') {
      if (mathSection) {
        mathSection.items = [
          { id: 'numbers-1-5', name: 'Bé tập đếm từ 1 đến 5', emoji: '🌟', color: 'bg-[#FF6B9E]', value: 5, videoId: 'WntRcFcsFmM' },
          { id: 'compare-qty-1-5', name: 'So sánh nhiều – ít (PV 5)', emoji: '⚖️', color: 'bg-[#34A4E4]', videoId: 'R4MzsCdp30s' },
          { id: 'shapes-basic', name: 'Hình học cơ bản', emoji: '🔺', color: 'bg-[#8DE065]', videoId: 'JUWkZ3jozwc' },
          { id: 'math-front-back', name: 'Nhận biết phía trước phía sau của bản thân', emoji: '↔️', color: 'bg-[#FFD13B]', videoId: 'hOCtSqse3o8' },
          { id: 'math-left-right', name: 'Xác định phía phải phía trái của bản thân', emoji: '⬅️', color: 'bg-[#FF6B9E]', videoId: 't5Sw1WaXL3c' },
          { id: 'math-count-3', name: 'Dạy trẻ đếm đối tượng trong phạm vi 3', emoji: '🔢', color: 'bg-[#34A4E4]', videoId: '9K6WhdyvWDI' },
          { id: 'math-circle-triangle', name: 'Nhận biết hình tròn, hình Tam giác', emoji: '⭕', color: 'bg-[#8DE065]', videoId: 'rmZ2LtVyIL0' },
          { id: 'math-one-to-one', name: 'Xếp tương ứng 1-1', emoji: '🧩', color: 'bg-[#FFD13B]', videoId: 'a-hHlCgS2a0' },
          { id: 'math-split-group', name: 'Tách một nhóm đối tượng', emoji: '✂️', color: 'bg-[#FF6B9E]', videoId: 'FN5GSt_9Oxk' },
          { id: 'math-review-compare-5', name: 'Ôn so sánh số lượng (PV 5)', emoji: '⚖️', color: 'bg-[#34A4E4]', videoId: 'CRqOHQAsVxE' },
          { id: 'math-compare-length', name: 'So sánh dài hơn - ngắn hơn', emoji: '📏', color: 'bg-[#FFD13B]', videoId: 'ZtId0nZd-fs' },
          { id: 'cognitive-interactive-3-4-external', name: 'Trò chơi tương tác Wordwall', emoji: '🎮', color: 'bg-[#C8F7DC]', externalLink: 'https://wordwall.net/play/103907/131/692' },
        ];
      }
      if (scienceSection) {
        scienceSection.items = [
          { id: 'farm-animals', name: 'Vật nuôi gia đình', emoji: '🐶', color: 'bg-[#FF6B9E]', videoId: 'PFn6EEezM9M' },
          { id: 'plant-parts', name: 'Các bộ phận của cây', emoji: '🌳', color: 'bg-[#34A4E4]', videoId: 'gzFWrkNv-jg' },
          { id: 'sun-moon', name: 'Mặt trời & Mặt trăng', emoji: '🌞', color: 'bg-[#8DE065]' },
          { id: 'qua-thanh-long', name: 'Tìm hiểu về quả thanh long', emoji: '🌵', color: 'bg-[#FF6B9E]', videoId: 'oXEU419LERE' },
          { id: 'bo-phan-co-the', name: 'Khám phá các bộ phận trên cơ thể bé', emoji: '👦', color: 'bg-[#34A4E4]', videoId: 'UE80w3pMg_c' },
          { id: 'giay-an', name: 'Khám phá giấy ăn', emoji: '🧻', color: 'bg-[#8DE065]', videoId: 'j0xrN3w2j1U' },
          { id: 'cai-mui', name: 'Tìm hiểu về cái mũi', emoji: '👃', color: 'bg-[#FFD13B]', videoId: 's8xulOz4NXU' },
          { id: 'hoa-hong', name: 'Khám phá hoa hồng', emoji: '🌹', color: 'bg-[#FF6B9E]', videoId: 'Y5HYyO0hK_w' },
          { id: 'cac-loai-rau', name: 'Khám phá một số loại rau', emoji: '🥬', color: 'bg-[#34A4E4]', videoId: 'Mic3cGQnmeo' },
          { id: 'cac-loai-qua', name: 'Khám phá một số loại quả', emoji: '🍎', color: 'bg-[#8DE065]', videoId: 'HxTSLmawGY4' },
          { id: 'crocodile-life-cycle', name: 'Vòng đời của cá sấu', emoji: '🐊', color: 'bg-[#FFD13B]', videoId: 'vUsEusb-l2Q' },
          { id: 'insects-discovery', name: 'Tìm hiểu về côn trùng', emoji: '🐞', color: 'bg-[#FF6B9E]', videoId: 'x3m28dNgkpc' },
          { id: 'carrot-discovery', name: 'Tìm hiểu về củ cà rốt', emoji: '🥕', color: 'bg-[#34A4E4]', videoId: 'CXicJuKFZOM' },
          { id: 'egg-sink-float', name: 'Trứng chìm, trứng nổi', emoji: '🥚', color: 'bg-[#8DE065]', videoId: '9UOcvKnfQbM' },
          { id: 'color-magic', name: 'Sự kỳ diệu của màu sắc', emoji: '🎨', color: 'bg-[#FFD13B]', videoId: '8rk3MRkAlsM' },
          { id: 'day-night-discovery', name: 'Tìm hiểu ngày và đêm', emoji: '🌞🌛', color: 'bg-[#FF6B9E]', videoId: 'rDZXERvCjec' },
          { id: 'why-rain', name: 'Vì sao có mưa', emoji: '🌧️', color: 'bg-[#34A4E4]', videoId: 'ri17hd2ihb4' },
          { id: 'electric-appliances', name: 'Đồ dùng sử dụng điện', emoji: '🔌', color: 'bg-[#8DE065]', videoId: 'HSB6pvdw6Vw' },
          { id: 'jungle-animals', name: 'Một số động vật sống trong rừng', emoji: '🦁', color: 'bg-[#FFD13B]', videoId: 'Bi9_PezdCNo' },
          { id: 'aquatic-animals', name: 'Một số con vật sống dưới nước', emoji: '🐟', color: 'bg-[#FF6B9E]', videoId: '6s4cVYY7ozw' },
        ];
      }
      if (classificationSection) {
        classificationSection.items = [
          { id: 'big-small', name: 'To – nhỏ', emoji: '🐘', color: 'bg-[#FF6B9E]' },
          { id: 'colors-basic', name: 'Màu sắc cơ bản', emoji: '🎨', color: 'bg-[#34A4E4]' },
        ];
      }
    } else if (selectedAge === '4-5') {
      if (mathSection) {
        mathSection.items = [
          { id: 'math-patterns-3', name: 'Qui tắc sắp xếp 3 đối tượng', emoji: '🧩', color: 'bg-[#FFD13B]', videoId: 'I2Y3pyFd7uQ' },
          { id: 'math-count-5', name: 'Đếm đến 5. Nhận biết chữ số 5', emoji: '🖐️', color: 'bg-[#FF6B9E]', videoId: 'aKpQjINn7fg' },
          { id: 'math-ordinal-5', name: 'Số thứ tự trong phạm vi 5', emoji: '🔢', color: 'bg-[#34A4E4]', videoId: 'icMt1EzhcaI' },
          { id: 'math-measure', name: 'Đo độ dài của đối tượng', emoji: '📏', color: 'bg-[#8DE065]', videoId: 'VwJYKmaudKc' },
          { id: 'math-right-left-other', name: 'Phía phải, phía trái so với người khác', emoji: '↔️', color: 'bg-[#FFD13B]', videoId: '4q454GefMm8' },
          { id: 'math-more-less-relation', name: 'Mối quan hệ nhiều hơn, ít hơn', emoji: '⚖️', color: 'bg-[#34A4E4]', videoId: 'rWFztLVWuL0' },
          { id: 'math-count-3-new', name: 'Đếm đến 3. Nhận biết chữ số 3', emoji: '3️⃣', color: 'bg-[#8DE065]', videoId: 'kXmMUGdD-yU' },
          { id: 'math-ordinal-3', name: 'Số thứ tự trong phạm vi 3', emoji: '🔢', color: 'bg-[#FFD13B]', videoId: 'lUT1LnBcbaE' },
          { id: 'math-split-5', name: 'Tách nhóm 5 thành 2 phần', emoji: '✂️', color: 'bg-[#FF6B9E]', videoId: 'v5nqso6YoWQ' },
          { id: 'math-split-4-groups', name: 'Tách 4 nhóm đối tượng thành 2 phần bằng các cách khác nhau', emoji: '🧩', color: 'bg-[#FF6B9E]', videoId: 'om6vVB2tyUg' },
          { id: 'math-review-count-3', name: 'Củng cố đếm đến 3, nhận biết chữ số 3', emoji: '3️⃣', color: 'bg-[#34A4E4]', videoId: 'e00dltyLYiA' },
          { id: 'math-review-count-2', name: 'Củng cố đếm đến 2, nhận biết chữ số 2', emoji: '2️⃣', color: 'bg-[#8DE065]', videoId: 'idrTRoirr80' },
          { id: 'math-review-count-5', name: 'Ôn đếm xác định số lượng các nhóm đối tượng trong phạm vi 5', emoji: '🖐️', color: 'bg-[#FFD13B]', videoId: 'vEUPK-fRVAQ' },
          { id: 'math-review-count-5-new', name: 'Ôn đếm xác định SL các nhóm đối tượng PV 5', emoji: '🔢', color: 'bg-[#FF6B9E]', videoId: 'MiAziQ4pB2A', isNew: true },
        ];
      }
      if (scienceSection) {
        scienceSection.items = [
          { id: 'wild-animals', name: 'Động vật hoang dã', emoji: '🦁', color: 'bg-[#FF6B9E]' },
          { id: 'plant-needs', name: 'Cây cần gì để sống?', emoji: '💧', color: 'bg-[#34A4E4]' },
          { id: 'weather-fun', name: 'Thời tiết quanh bé', emoji: '🌈', color: 'bg-[#8DE065]' },
          { id: 'cay-ngo', name: 'Quá trình phát triển của cây ngô', emoji: '🌽', color: 'bg-[#FFD13B]', videoId: 'mS7PLFk9dpQ' },
          { id: 'hoa-sen', name: 'Tìm hiểu về hoa sen', emoji: '🪷', color: 'bg-[#FF6B9E]', videoId: 'QRfhEEq7_Zo' },
          { id: 'vong-doi-kien', name: 'Vòng đời của loài kiến', emoji: '🐜', color: 'bg-[#34A4E4]', videoId: 'IrUQGsES7lc' },
          { id: 'cac-loai-ca', name: 'Khám phá các loài cá', emoji: '🐟', color: 'bg-[#8DE065]', videoId: 'vylufagWb_I' },
          { id: 'dong-vat-mau-da', name: 'Động vật theo màu da', emoji: '🦓', color: 'bg-[#FFD13B]', videoId: 'EXKNfAbMtVo' },
          { id: 'dong-vat-song-o-dau', name: 'Động vật sống ở đâu?', emoji: '🏠', color: 'bg-[#FF6B9E]', videoId: 'mJrJLEezRFo' },
          { id: 'dong-vat-4-chan', name: 'Động vật đi bằng 4 chân', emoji: '🐕', color: 'bg-[#34A4E4]', videoId: 'jRcu4ROfzjI' },
          { id: 'plant-parts-new', name: 'Tìm hiểu một số bộ phận của cây', emoji: '🌳', color: 'bg-[#8DE065]', videoId: '_jmJkFXZku4' },
          { id: 'bean-growth', name: 'Quá trình phát triển của cây đỗ', emoji: '🫘', color: 'bg-[#FFD13B]', videoId: 'Vr7-M0l2rVI' },
          { id: 'rice-growth', name: 'Quá trình phát triển của cây lúa', emoji: '🌾', color: 'bg-[#FF6B9E]', videoId: 'dyJMbiX_FKg' },
          { id: 'flower-classification', name: 'Phân biệt hoa cánh tròn, cánh dài', emoji: '🌸', color: 'bg-[#34A4E4]', videoId: 'cwjYFppK8Cs' },
          { id: 'tree-benefits', name: 'Ích lợi của cây xanh', emoji: '🌳', color: 'bg-[#8DE065]', videoId: 'O5UA66vhbmU' },
          { id: 'explore-spring', name: 'Tìm hiểu về mùa xuân', emoji: '🌸', color: 'bg-[#FFD13B]', videoId: 'B2eq2sfVv9I', isNew: true },
          { id: 'explore-summer', name: 'Tìm hiểu về mùa hè', emoji: '☀️', color: 'bg-[#FF6B9E]', videoId: 'YJ-NgHRfJKk', isNew: true },
          { id: 'times-of-day', name: 'Nhận biết các buổi sáng - trưa - chiều - tối trong ngày', emoji: '🌞', color: 'bg-[#34A4E4]', videoId: 'CX-Qfv7Laiw' },
          { id: 'vitamin-foods', name: 'Khám phá thực phẩm giàu vitamin', emoji: '🥦', color: 'bg-[#8DE065]', videoId: 'UQVrKqfF7hY' },
        ];
      }
      if (classificationSection) {
        classificationSection.items = [
          { id: 'tall-short', name: 'Cao – thấp', emoji: '🦒', color: 'bg-[#FF6B9E]' },
          { id: 'colors-adv', name: 'Phối màu sắc', emoji: '🎨', color: 'bg-[#34A4E4]' },
        ];
      }
    } else if (selectedAge === '5-6') {
      if (mathSection) {
        mathSection.items = [
          { id: 'numbers-1-20', name: 'Thử thách số 1–20', emoji: '🌟', color: 'bg-[#FF6B9E]', value: 20 },
          { id: 'addition-basic', name: 'Phép cộng vui vẻ', emoji: '➕', color: 'bg-[#34A4E4]' },
          { id: 'patterns-advanced', name: 'Quy luật phức tạp', emoji: '🧩', color: 'bg-[#FFD13B]' },
          { id: 'math-pair-objects', name: 'Ghép thành cặp đối tượng liên quan', emoji: '🔗', color: 'bg-[#FF6B9E]', videoId: 'ZRBSlbkuW3Y' },
          { id: 'math-count-6', name: 'NB chữ số 6, SL, STT (PV 6)', emoji: '6️⃣', color: 'bg-[#34A4E4]', videoId: '8wU27-jZH1E' },
          { id: 'math-split-6', name: 'Tách 6 đối tượng thành 2 phần', emoji: '✂️', color: 'bg-[#8DE065]', videoId: 'PNsHLgQWncs' },
          { id: 'math-count-7', name: 'NB chữ số 7, SL, STT (PV 7)', emoji: '7️⃣', color: 'bg-[#FFD13B]', videoId: '4F4H-wF5O9Q' },
          { id: 'math-compare-3-groups-7', name: 'So sánh 3 nhóm đối tượng (PV 7)', emoji: '⚖️', color: 'bg-[#FF6B9E]', videoId: '63j7veOEBz4' },
          { id: 'math-count-9', name: 'NB chữ số 9, SL, STT (PV 9)', emoji: '9️⃣', color: 'bg-[#34A4E4]', videoId: 'v9O0q9Z74Fo' },
          { id: 'math-number-meaning', name: 'Ý nghĩa của các con số', emoji: '🔢', color: 'bg-[#8DE065]', videoId: 'QSHO3kKx-MM' },
          { id: 'math-split-10', name: 'Tách 10 đối tượng thành 2 phần bằng các cách khác nhau', emoji: '🔢', color: 'bg-[#FFD13B]', videoId: '4QOH-fV4NDA' },
        ];
      }
      if (scienceSection) {
        scienceSection.items = [
          { id: 'life-cycles', name: 'Vòng đời sinh trưởng', emoji: '🦋', color: 'bg-[#FF6B9E]' },
          { id: 'environment', name: 'Bảo vệ môi trường', emoji: '🌍', color: 'bg-[#34A4E4]' },
          { id: 'space', name: 'Khám phá vũ trụ', emoji: '🚀', color: 'bg-[#8DE065]' },
          { id: 'vong-tuan-hoan-nuoc', name: 'Vòng tuần hoàn của nước', emoji: '💧', color: 'bg-[#FFD13B]', videoId: 'hvDzG60cq0I' },
          { id: 'dan-toc-thai', name: 'Tìm hiểu về dân tộc Thái Việt Nam', emoji: '🏘️', color: 'bg-[#FF6B9E]', videoId: '2itNKerzmEs' },
          { id: 'bao-ve-moi-truong-be', name: 'Bé bảo vệ môi trường', emoji: '♻️', color: 'bg-[#34A4E4]', videoId: 'cDOZGlbAyb0' },
          { id: 'su-dung-dien-an-toan', name: 'Sử dụng điện an toàn', emoji: '⚡', color: 'bg-[#8DE065]', videoId: '6o2JKPJOUGA' },
          { id: 'xu-ly-duoi-nuoc', name: 'Xử lý khi gặp đuối nước', emoji: '🌊', color: 'bg-[#FFD13B]', videoId: 'idJw6WAu5m1Cpd8v' },
          { id: 'wind-discovery', name: 'Tìm hiểu về gió', emoji: '🌬️', color: 'bg-[#FF6B9E]', videoId: 'U9LkQaX2YDw' },
          { id: 'egg-magic', name: 'Sự kỳ diệu của quả trứng', emoji: '🥚', color: 'bg-[#34A4E4]', videoId: 'Nt2eASSvDRU' },
          { id: 'transportation-discovery', name: 'Một số phương tiện giao thông', emoji: '🚗', color: 'bg-[#8DE065]', videoId: 'LIzirahWZSg' },
          { id: 'seasons-discovery', name: 'Các mùa trong năm', emoji: '🍂', color: 'bg-[#FFD13B]', videoId: '71aDil4_fao' },
          { id: 'space-objects', name: 'Mặt trăng, mặt trời và các vì sao', emoji: '✨', color: 'bg-[#FF6B9E]', videoId: 'a8s58FYCepA' },
          { id: 'waste-classification', name: 'Phân loại rác', emoji: '🗑️', color: 'bg-[#34A4E4]', videoId: 'OETc0LuzyKs' },
          { id: 'light-origin', name: 'Khám phá “ Ánh sáng có từ đâu ?”', emoji: '💡', color: 'bg-[#8DE065]', videoId: 'Z6Yt0e7N_FQ' },
          { id: 'water-benefits', name: 'Khám phá lợi ích của nguồn nước', emoji: '💧', color: 'bg-[#FFD13B]', videoId: 'b2JCK_mlBSE' },
        ];
      }
      if (classificationSection) {
        classificationSection.items = [
          { id: 'long-short', name: 'Dài – ngắn (Đo lường)', emoji: '📏', color: 'bg-[#FF6B9E]' },
          { id: 'heavy-light', name: 'Nặng – nhẹ', emoji: '⚖️', color: 'bg-[#34A4E4]' },
        ];
      }
    }

    return sections;
  };

  const renderCognitiveGrid = () => (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sticky top-4 z-10 bg-sky-50/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-white/50 gap-4">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedSection(null)}
            className="p-3 bg-white rounded-full shadow-md text-sky-500 border border-sky-100"
          >
            <ArrowLeft size={28} strokeWidth={3} />
          </motion.button>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-700 capitalize">
            Phát Triển Nhận Thức
          </h2>
        </div>
        <div className="bg-[#FFD13B]/20 text-amber-700 font-bold py-2 px-4 rounded-full shadow-sm flex items-center gap-2 border-2 border-[#FFD13B]/50">
          🏆 Huy hiệu: Nhà khám phá nhí
        </div>
      </div>

      {getCognitiveSections().map((section: any, sIdx: number) => (
        <div key={sIdx} className="mb-12 bg-white/40 p-6 rounded-[3rem] border-4 border-white/50 shadow-sm">
          <h3 className="text-2xl font-black text-sky-800 mb-6 px-4">{section.title}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {section.items.map((item: any, index: number) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedItem(item);
                  if (!isGeneratingAudio) {
                    setIsGeneratingAudio(true);
                    speak(item.name).finally(() => setIsGeneratingAudio(false));
                  }
                }}
                className={`${item.color} rounded-[2rem] p-4 sm:p-6 flex flex-col items-center justify-center gap-3 shadow-lg border-4 border-white/50 relative overflow-hidden group aspect-square`}
              >
                {item.isNew && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm z-20 animate-bounce">
                    MỚI
                  </div>
                )}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-colors"></div>
                <span className="text-6xl sm:text-7xl drop-shadow-md">{item.emoji}</span>
                <span className="text-lg sm:text-xl font-bold text-white text-center leading-tight z-10 drop-shadow-md">
                  {item.name}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderAestheticView = () => (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sticky top-4 z-10 bg-sky-50/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-white/50 gap-4">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setSelectedSection(null);
              speak("Quay lại");
            }}
            className="p-3 bg-white rounded-full shadow-md text-sky-500 border border-sky-100"
          >
            <ArrowLeft size={28} strokeWidth={3} />
          </motion.button>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-700 capitalize">
            Phát Triển Thẩm Mỹ
          </h2>
        </div>
        <div className="bg-[#E5D9FF] text-purple-700 font-bold py-2 px-4 rounded-full shadow-sm flex items-center gap-2 border-2 border-purple-300">
          🎨 Huy hiệu: Họa sĩ tí hon
        </div>
      </div>

      {selectedAge ? (
        (() => {
          let sections = [];
          if (selectedAge === 'toddler') sections = AESTHETIC_TODDLER_SECTIONS;
          else if (selectedAge === '3-4') sections = AESTHETIC_3_4_SECTIONS;
          else if (selectedAge === '4-5') sections = AESTHETIC_4_5_SECTIONS;
          else if (selectedAge === '5-6') sections = AESTHETIC_5_6_SECTIONS;

          if (sections.length === 0) {
            return (
              <div className="bg-white/80 backdrop-blur-md p-12 rounded-[3rem] shadow-xl border-4 border-white text-center max-w-lg mx-auto mt-10">
                <span className="text-8xl mb-6 block">🚧</span>
                <h3 className="text-3xl font-black text-slate-700 mb-4">Phần này đang được xây dựng!</h3>
                <p className="text-xl text-slate-500 font-bold">Bé hãy quay lại sau nhé.</p>
              </div>
            );
          }

          return sections.map((section: any, sIdx: number) => (
            <div key={sIdx} className="mb-12 bg-white/40 p-6 rounded-[3rem] border-4 border-white/50 shadow-sm">
              <h3 className="text-2xl font-black text-purple-800 mb-6 px-4">{section.title}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {section.items.map((item: any, index: number) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedItem(item);
                      if (!isGeneratingAudio) {
                        setIsGeneratingAudio(true);
                        speak(item.name).finally(() => setIsGeneratingAudio(false));
                      }
                    }}
                    className={`${item.color} rounded-[2rem] p-4 sm:p-6 flex flex-col items-center justify-center gap-3 shadow-lg border-4 border-white/50 relative overflow-hidden group aspect-square`}
                  >
                    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-colors"></div>
                    <span className="text-6xl sm:text-7xl drop-shadow-md">{item.emoji}</span>
                    <span className="text-lg sm:text-xl font-bold text-white text-center leading-tight z-10 drop-shadow-md">
                      {item.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          ));
        })()
      ) : null}
    </div>
  );

  const renderGrid = (items: any[], type: string) => (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8 sticky top-4 z-10 bg-sky-50/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-white/50">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setSelectedSection(null);
              speak("Quay lại");
            }}
            className="p-3 bg-white rounded-full shadow-md text-sky-500 border border-sky-100"
          >
            <ArrowLeft size={28} strokeWidth={3} />
          </motion.button>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-700 capitalize">
            {CATEGORIES.find(c => c.id === type)?.title}
          </h2>
        </div>
        {type === 'language' && (
          <div className="flex bg-white/50 p-1 rounded-full shadow-inner border border-white/60">
            <button
              onClick={() => setLetterLang('vi')}
              className={`px-4 py-2 rounded-full font-bold transition-colors ${letterLang === 'vi' ? 'bg-emerald-400 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
            >
              Tiếng Việt
            </button>
            <button
              onClick={() => setLetterLang('en')}
              className={`px-4 py-2 rounded-full font-bold transition-colors ${letterLang === 'en' ? 'bg-blue-400 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
            >
              English
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {items.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleItemClick(item)}
            className={`${item.color || 'bg-white'} rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg border-4 border-white/60 aspect-square relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
            {type === 'cognitive' ? (
              <span className="text-6xl sm:text-7xl font-black text-slate-700 drop-shadow-sm">{item.value}</span>
            ) : type === 'language' ? (
              <>
                <span className="text-5xl sm:text-6xl font-black text-slate-700 drop-shadow-sm">{item.id} {item.id.toLowerCase()}</span>
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-2 right-2 bg-white/80 p-2 rounded-full shadow-md text-sky-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item);
                  }}
                >
                  <Volume2 size={20} strokeWidth={3} />
                </motion.div>
              </>
            ) : (
              <span className="text-6xl sm:text-7xl drop-shadow-md">{item.emoji}</span>
            )}
            <span className="text-xl sm:text-2xl font-bold text-slate-700 text-center leading-tight z-10">
              {type === 'cognitive' ? item.name.split(' – ')[1] : type === 'language' ? item.word : item.name.replace('Con ', '')}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderLanguageView = () => {
    if (selectedAge) {
      let stories: any[] = [];
      let poems: any[] = [];

      if (selectedAge === 'toddler') {
        stories = STORIES_TODDLER;
        poems = POEMS_TODDLER;
      } else if (selectedAge === '3-4') {
        stories = STORIES_3_4;
        poems = POEMS_3_4;
      } else if (selectedAge === '4-5') {
        stories = STORIES_4_5;
        poems = POEMS_4_5;
      } else if (selectedAge === '5-6') {
        stories = STORIES_5_6;
        poems = POEMS_5_6;
      }

      return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto pb-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sticky top-4 z-10 bg-sky-50/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-white/50 gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedSection(null)}
                className="p-3 bg-white rounded-full shadow-md text-sky-500 border border-sky-100"
              >
                <ArrowLeft size={28} strokeWidth={3} />
              </motion.button>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-700 capitalize">
                Phát triển ngôn ngữ
              </h2>
            </div>
            {selectedAge !== 'toddler' && selectedAge !== '3-4' && (
              <div className="flex bg-white/50 p-1 rounded-full shadow-inner border border-white/60">
                <button
                  onClick={() => {
                    setLetterLang('vi');
                    speak("Tiếng Việt");
                  }}
                  className={`px-4 py-2 rounded-full font-bold transition-colors ${letterLang === 'vi' ? 'bg-emerald-400 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
                >
                  Tiếng Việt
                </button>
                <button
                  onClick={() => {
                    setLetterLang('en');
                    speak("English");
                  }}
                  className={`px-4 py-2 rounded-full font-bold transition-colors ${letterLang === 'en' ? 'bg-blue-400 text-white shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
                >
                  English
                </button>
              </div>
            )}
          </div>

          <div className="space-y-12">
            {selectedAge === '5-6' && (
              <section>
                <h3 className="text-2xl font-black text-emerald-800 mb-6 flex items-center gap-2">
                  <span className="bg-emerald-100 p-2 rounded-xl">✍️</span> Bài học chữ cái
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {LETTER_LESSONS_5_6.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleItemClick(item)}
                      className="bg-white p-6 rounded-[2rem] shadow-lg border-4 border-emerald-100 flex items-center gap-4 text-left group"
                    >
                      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        {item.emoji}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-700 text-lg leading-tight">{item.name}</h4>
                        <span className="text-emerald-500 font-bold text-sm">Xem bài học 📺</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </section>
            )}

            {selectedAge !== 'toddler' && selectedAge !== '3-4' && (
              <section>
                <h3 className="text-2xl font-black text-sky-800 mb-6 flex items-center gap-2">
                  <span className="bg-sky-100 p-2 rounded-xl">🔤</span> Bảng chữ cái
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                  {(letterLang === 'vi' ? LETTERS : ENGLISH_LETTERS).map((item, index) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleItemClick(item)}
                      className={`${item.color || 'bg-white'} rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg border-4 border-white/60 aspect-square relative overflow-hidden`}
                    >
                      <span className="text-5xl font-black text-slate-700">{item.id} {item.id.toLowerCase()}</span>
                      <span className="text-xl font-bold text-slate-700">{item.word}</span>
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-2 right-2 bg-white/80 p-2 rounded-full shadow-md text-sky-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                      >
                        <Volume2 size={20} strokeWidth={3} />
                      </motion.div>
                    </motion.button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-2xl font-black text-pink-800 mb-6 flex items-center gap-2">
                <span className="bg-pink-100 p-2 rounded-xl">📚</span> Truyện kể cho bé
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {stories.map((item, index) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemClick(item)}
                    className="bg-white rounded-3xl p-6 flex items-center gap-6 shadow-xl border-4 border-pink-50 text-left group"
                  >
                    <span className="text-6xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                    <div>
                      <h4 className="text-xl font-black text-slate-700">{item.name}</h4>
                      <p className="text-slate-500 font-bold">Xem truyện video 📺</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-black text-emerald-800 mb-6 flex items-center gap-2">
                <span className="bg-emerald-100 p-2 rounded-xl">📜</span> Thơ mầm non
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {poems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemClick(item)}
                    className="bg-white rounded-3xl p-6 flex items-center gap-6 shadow-xl border-4 border-emerald-50 text-left group"
                  >
                    <span className="text-6xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                    <div>
                      <h4 className="text-xl font-black text-slate-700">{item.name}</h4>
                      <p className="text-slate-500 font-bold">Xem thơ video 📺</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>
          </div>
        </div>
      );
    }

    return renderGrid(letterLang === 'vi' ? LETTERS : ENGLISH_LETTERS, 'language');
  };

  const renderRecords = () => {
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || uploadBusy) return;
      if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'].includes(file.type) || file.size > 8 * 1024 * 1024) {
        setUploadError('Chọn ảnh PNG, JPG, WebP, GIF hoặc video MP4, WebM, OGG nhỏ hơn 8 MB.');
        return;
      }
      setUploadBusy(true);
      setUploadError('');
      try {
        const response = await deviceFetch('/api/device/uploads', { method: 'POST', headers: { 'Content-Type': file.type, 'X-File-Name': encodeURIComponent(file.name) }, body: file });
        if (!response.ok) throw new Error();
        const saved = await response.json();
        if (!saved?.id || !saved.url?.startsWith('/api/device/uploads/')) throw new Error();
        setUploadedFiles(prev => [saved, ...prev.filter(item => item.id !== saved.id)]);
        speak(`Bé đã tải ${type === 'image' ? 'ảnh' : 'video'} lên thành công! Giỏi lắm!`);
      } catch { setUploadError('Chưa tải được tệp lên máy chủ. Hãy kiểm tra kết nối và thử lại; ảnh/video tối đa 8 MB, thư viện tối đa 64 MB.'); }
      finally { setUploadBusy(false); }
    };

    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto pb-24">
        <div className="flex items-center mb-8 gap-4 sticky top-4 z-10 bg-sky-50/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-white/50">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedSection(null)}
            className="p-3 bg-white rounded-full shadow-md text-sky-500 border border-sky-100"
          >
            <ArrowLeft size={28} strokeWidth={3} />
          </motion.button>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-700 capitalize">
            Ghi nhận kết quả
          </h2>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3rem] shadow-xl border-4 border-white flex flex-col items-center gap-8">
          <div className="text-center">
            <span className="text-8xl mb-4 block">📸</span>
            <h3 className="text-3xl font-black text-sky-800 mb-2">Khoảnh khắc của bé</h3>
            <p className="text-xl text-sky-600 font-bold">Tải lên những hình ảnh hoặc video bài tập của bé nhé!</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <label className="cursor-pointer bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-xl py-4 px-8 rounded-full shadow-xl border-4 border-white hover:scale-105 transition-transform flex items-center gap-3">
              <input type="file" aria-label="Tải ảnh lên" disabled={uploadBusy} className="hidden" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => void handleFileUpload(e, 'image')} />
              <ImageIcon size={28} />
              <span>Tải ảnh lên</span>
            </label>

            <label className="cursor-pointer bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black text-xl py-4 px-8 rounded-full shadow-xl border-4 border-white hover:scale-105 transition-transform flex items-center gap-3">
              <input type="file" aria-label="Tải video lên" disabled={uploadBusy} className="hidden" accept="video/mp4,video/webm,video/ogg" onChange={(e) => void handleFileUpload(e, 'video')} />
              <Video size={28} />
              <span>Tải video lên</span>
            </label>
          </div>

          {uploadBusy && <p role="status">Đang lưu tệp lên máy chủ…</p>}
          {uploadError && <p role="alert" className="text-sm font-bold text-red-800">{uploadError}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full mt-8">
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-lg relative group bg-slate-100"
              >
                {file.type === 'image' ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <video src={file.url} controls preload="metadata" className="w-full h-full object-cover" />
                )}
                <div className="pointer-events-none absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Star size={40} className="text-yellow-400 fill-yellow-400" />
                  {file.type === 'video' && <Video size={40} className="text-white absolute top-2 right-2" />}
                </div>
              </motion.div>
            ))}
            {uploadedFiles.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-bold italic">
                Chưa có nội dung nào được tải lên. Bé hãy bắt đầu ghi lại những khoảnh khắc đẹp nhé!
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto pb-32 pt-12">
      <button type="button" onClick={() => setCurrentTab('parents')} className="mb-5 flex min-h-11 items-center gap-2 rounded-full border-2 border-white bg-white px-5 py-2 font-black text-emerald-800 shadow-sm focus-visible:outline-4 focus-visible:outline-emerald-600"><ArrowLeft size={20} /> Về không gian phụ huynh</button>
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-[3rem] shadow-xl border-4 border-white">
        <h2 className="text-4xl font-black text-slate-700 mb-8 flex items-center gap-4">
          <span className="bg-slate-100 p-3 rounded-2xl">⚙️</span> Cài đặt cho Phụ huynh
        </h2>

        <div className="space-y-10">
          <section className="rounded-3xl border-2 border-emerald-100 bg-emerald-50 p-5">
            <h3 className="text-2xl font-black text-emerald-900">Khu vườn của bạn</h3>
            <p className="mt-2 text-slate-700">{accountUser ? `${accountUser.fullName} · @${accountUser.username}. Tiến độ đang được lưu riêng vào tài khoản này.` : 'Đăng nhập để lưu tiến độ riêng và tiếp tục học trên thiết bị khác.'}</p>
            <button type="button" onClick={openAccount} className="mt-4 min-h-11 rounded-full bg-emerald-600 px-5 py-3 font-black text-white">{accountUser ? 'Xem tài khoản' : 'Đăng nhập / Đăng ký'}</button>
          </section>
          <section>
            <h3 className="text-2xl font-black text-sky-800 mb-6">Giới hạn thời gian học (Screen Time)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[15, 20, 30].map((limit) => (
                <motion.button
                  key={limit}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSessionTimeLimit(limit);
                    setSessionTimeLeft(limit * 60);
                    setShowEyeExercise(false);
                    setShowSessionEndModal(false);
                    speak(`Đã cài đặt thời gian học là ${limit} phút.`);
                  }}
                  className={`p-6 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-2 ${sessionTimeLimit === limit ? 'bg-sky-500 border-sky-200 text-white shadow-lg' : 'bg-white border-sky-50 text-sky-700 hover:bg-sky-50'}`}
                >
                  <span className="text-3xl font-black">{limit}</span>
                  <span className="font-bold">Phút</span>
                </motion.button>
              ))}
            </div>
            <p className="mt-4 text-slate-500 font-medium italic">Sau khi hết thời gian, ứng dụng sẽ nhắc nhở bé nghỉ ngơi và tập thể dục mắt.</p>
          </section>

          <section>
            <h3 className="text-2xl font-black text-purple-800 mb-6">Âm thanh & Giọng nói</h3>
            <div className="flex items-center justify-between p-6 bg-purple-50 rounded-[2rem] border-2 border-purple-100">
              <div>
                <p className="font-black text-purple-900 text-xl">Giọng nói trợ lý</p>
                <p className="text-purple-700 font-medium">Giọng bé gái dễ thương</p>
              </div>
              <Volume2 className="text-purple-500" size={40} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  const renderEyeExercise = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gradient-to-b from-sky-400 to-blue-600"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[4rem] p-12 max-w-2xl w-full shadow-2xl border-8 border-white text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-4 bg-sky-200"></div>

        <div className="mb-8">
          <span className="text-[10rem] block animate-bounce">🐰</span>
          <h2 className="text-4xl font-black text-sky-800 mb-4">Mắt tớ mỏi rồi bé ơi!</h2>
          <p className="text-2xl text-sky-600 font-bold italic">"Chúng mình cùng đi uống nước và nhìn ra xa một lát nhé!"</p>
        </div>

        <div className="bg-sky-50 p-8 rounded-[3rem] border-4 border-sky-100 mb-10">
          <h3 className="text-2xl font-black text-slate-700 mb-6">Bài tập thể dục mắt đơn giản</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-2">
              <span className="text-5xl">⬆️⬇️</span>
              <p className="font-bold text-slate-600">Nhìn lên xuống</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-5xl">⬅️➡️</span>
              <p className="font-bold text-slate-600">Nhìn trái phải</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-5xl">🔄</span>
              <p className="font-bold text-slate-600">Xoay tròn mắt</p>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowEyeExercise(false);
            setShowSessionEndModal(true);
          }}
          className="bg-sky-500 text-white font-black text-2xl py-6 px-12 rounded-full shadow-xl border-4 border-white"
        >
          Nghỉ ngơi thôi nào! 💤
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderReports = () => <LearningReport stats={learningStats} stars={stars} studySeconds={studySeconds} onBack={() => setSelectedSection(null)} />;

  const renderLearningSections = () => {
    const category = CATEGORIES.find(c => c.id === currentView);
    const ageGroup = AGE_GROUPS.find(a => a.id === selectedAge);

    return (
      <div className="flex flex-col items-center w-full pt-12 pb-40 relative z-10 px-4">
        <div className="flex items-center mb-12 gap-4 sticky top-4 z-20 bg-white/80 backdrop-blur-md p-4 rounded-[28px] shadow-sm border-2 border-white w-full max-w-4xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setSelectedAge(null);
              speak("Quay lại chọn lứa tuổi");
            }}
            className="p-3 sm:p-4 bg-white rounded-full shadow-md text-sky-500 border-2 border-sky-100"
          >
            <ArrowLeft size={28} strokeWidth={3} />
          </motion.button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-700 capitalize">
              {category?.title}
            </h2>
            <p className="text-sky-600 font-bold text-sm sm:text-base">Lứa tuổi: {ageGroup?.name}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto w-full">
          {LEARNING_SECTIONS.map((section) => (
            <motion.button
              key={section.id}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedSection(section.id);
                const learningAudioUrls: Record<string, string> = {
                  lessons: "https://www.image2url.com/r2/default/files/1777168188779-69be2ba2-e665-4731-bd1c-757537f11bdd.wav",
                  games: "https://www.image2url.com/r2/default/files/1777168241405-361f6e40-7ccd-48c4-8ca2-543a4b31064a.wav",
                  records: "https://www.image2url.com/r2/default/files/1777168364750-59bf6c79-4a41-4ff8-9a97-03bfe76b19ad.wav",
                  reports: "https://www.image2url.com/r2/default/files/1777168450238-4cad95f9-0912-4708-b771-f6c11b17db0a.wav"
                };
                if (learningAudioUrls[section.id]) {
                  const audio = new Audio(learningAudioUrls[section.id]);
                  audio.play().catch(e => console.error("Audio play failed", e));
                } else {
                  speak(section.title);
                }
              }}
              className={`${section.color} rounded-[2rem] p-6 sm:p-8 flex flex-col items-center justify-center gap-4 shadow-lg border-4 border-white/60 relative overflow-hidden group min-h-[220px] w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]`}
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/30 rounded-full blur-2xl group-hover:bg-white/40 transition-colors"></div>
              <span className="text-6xl sm:text-7xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">{section.icon}</span>
              <div className="text-center z-10">
                <h3 className="text-2xl font-black text-slate-800 mb-2">{section.title}</h3>
                <p className="text-slate-700 font-bold bg-white/40 px-4 py-1 rounded-full text-sm inline-block backdrop-blur-sm">{section.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans selection:bg-transparent bg-polka-white relative overflow-x-hidden">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="app-splash fixed inset-0 z-50 flex flex-col items-center justify-center bg-polka-white overflow-y-auto px-4 py-8"
          >
            {/* Splash Decorations */}
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 50, ease: "linear" }} className="absolute -top-20 -right-20 text-[200px] opacity-50">🌞</motion.div>
            <motion.div animate={{ x: [0, 50, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} className="absolute top-1/4 left-10 text-6xl opacity-70">☁️</motion.div>
            <motion.div animate={{ x: [0, -50, 0] }} transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }} className="absolute bottom-1/4 right-10 text-7xl opacity-70">☁️</motion.div>

            <motion.div
              animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-[6rem] sm:text-[12rem] leading-none whitespace-nowrap drop-shadow-2xl mb-6 relative shrink-0"
            >
              🐰🎒
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute top-0 right-0 text-5xl">✨</motion.div>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-3 px-4"
            >
              <span className="text-5xl sm:text-6xl animate-bounce">🌱</span>
              <h1 className="text-5xl sm:text-7xl font-black title-khu-vuon-tri-thuc-solid text-center">
                Khu Vườn Tri Thức
              </h1>
              <span className="text-5xl sm:text-6xl animate-pulse">🌸</span>
            </motion.div>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-2xl sm:text-3xl text-sky-800/90 font-bold mt-4 text-center px-6 bg-white/60 py-2.5 rounded-full backdrop-blur-sm mb-12 shadow-sm border border-white"
            >
              Khám phá mỗi ngày – Lớn khôn từng bước 🌱
            </motion.p>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={async () => {
                if (!audioCtx) {
                  audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                }
                if (audioCtx.state === 'suspended') {
                  await audioCtx.resume();
                }
                setShowSplash(false);
                setShowCheckIn(true);
                window.speechSynthesis?.cancel();
                const welcomeAudio = new Audio('/audio/welcome.wav');
                welcomeAudio.play().catch(e => console.error('Welcome audio play failed', e));
              }}
              className="bg-white text-sky-600 font-black text-xl sm:text-4xl py-5 sm:py-8 px-6 sm:px-16 rounded-full shadow-2xl border-4 sm:border-8 border-white hover:bg-sky-50 transition-colors flex items-center gap-4 shrink-0"
              disabled={dataLoading}
            >
              {dataLoading ? 'Đang tải dữ liệu…' : 'Bắt đầu học thôi! 🚀'}
            </motion.button>
          </motion.div>
        ) : currentTab === 'teacher' && isTeacher ? (
          <TeacherWorkspace route={teacherRoute} onNavigate={openTeacherRoute} onBack={() => { window.history.pushState({}, '', '/'); setCurrentTab('home'); setCurrentView('home'); setHomeMode('kids'); }} onEnglish={() => openEnglishModule('teachers')} />
        ) : currentTab === 'assistant' ? (
          <AIAssistant
            onBack={() => {
              setCurrentTab('home');
              setCurrentView('home');
              speak('Chào mừng bé quay lại trang chủ!');
            }}
            speak={readAssistantMessage}
            isSpeaking={isGeneratingAudio}
          />
        ) : currentTab === 'parents' ? (
          <div className="min-h-screen pb-32">
            <ParentDashboard onBack={() => {
              setCurrentTab('home');
              setCurrentView('home');
              setSelectedAge(null);
              setSelectedSection(null);
              speak("Quay lại trang chủ");
            }} stars={stars} emotionHistory={emotionHistory} stats={learningStats} studySeconds={studySeconds}
              onOpenSettings={() => setCurrentTab('settings')}
              onCheckIn={() => setShowCheckIn(true)}
              onOpenActivity={target => {
                setCurrentTab('home');
                setSelectedAge(null);
                setSelectedSection(null);
                setCurrentView(target);
              }} speak={speak} />
          </div>
        ) : currentTab === 'settings' ? (
          renderSettings()
        ) : currentTab === 'achievements' ? (
          <BadgesGallery
            stars={stars}
            stats={learningStats}
            unlockedBadgeIds={unlockedBadgeIds}
            onNavigate={(targetView) => {
              setCurrentTab('home');
              setSelectedSection(null);
              if (targetView === 'math') {
                setCurrentView('cognitive');
                setSelectedSection('games');
              } else if (targetView === 'language') {
                setCurrentView('language');
                setSelectedSection('lessons');
              } else if (targetView === 'english') {
                setCurrentView('english');
              } else if (targetView === 'aesthetic') {
                setCurrentView('aesthetic');
                setSelectedSection('lessons');
              } else if (targetView === 'physical') {
                setCurrentView('physical');
                setSelectedSection('lessons');
              } else if (targetView === 'social') {
                setCurrentView('social');
                setSelectedSection('lessons');
              } else if (targetView === 'cognitive') {
                setCurrentView('cognitive');
                setSelectedSection('lessons');
              } else {
                setCurrentView(targetView as any);
              }
            }}
            speak={speak}
          />
        ) : currentTab === 'home' ? (
          currentView === 'english' ? (
            <motion.div
              key="english-module"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen relative z-10"
            >
              <EnglishModule
                onLessonComplete={lesson => triggerCompletionReward(lesson.name, 'english')}
                onGameComplete={title => triggerCompletionReward(title, 'english')}
                initialTarget={englishInitialTarget}
                initialAge={englishInitialAge}
                onBack={() => {
                  setCurrentView('home');
                  setSelectedAge(null);
                  setSelectedSection(null);
                }}
              />
            </motion.div>
          ) : currentView === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen flex flex-col relative z-10"
            >
              <div className="flex-1 flex items-start justify-center">
                {renderHome()}
              </div>
            </motion.div>
          ) : !selectedAge ? (
            <motion.div
              key="age-selection"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen flex flex-col relative z-10"
            >
              {renderAgeSelection(currentView)}
            </motion.div>
          ) : !selectedSection ? (
            <motion.div
              key="learning-sections"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen flex flex-col relative z-10"
            >
              {renderLearningSections()}
            </motion.div>
          ) : selectedSection === 'lessons' ? (
            <React.Fragment key="category-view">
              {currentView === 'language' && (
                <motion.div key="language" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="min-h-screen relative z-10 pb-20">
                  {renderLanguageView()}
                </motion.div>
              )}
              {currentView === 'cognitive' && (
                <motion.div key="cognitive" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="min-h-screen relative z-10 pb-20">
                  {renderCognitiveGrid()}
                </motion.div>
              )}
              {currentView === 'aesthetic' && (
                <motion.div key="aesthetic" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="min-h-screen relative z-10 pb-20">
                  {renderAestheticView()}
                </motion.div>
              )}
              {currentView === 'physical' && selectedAge === 'toddler' && (
                <motion.div key="physical-toddler" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="min-h-screen relative z-10 pb-20">
                  {renderGrid(PHYSICAL_TODDLER_ACTIVITIES, 'physical')}
                </motion.div>
              )}
              {currentView === 'physical' && selectedAge === '3-4' && (
                <motion.div key="physical-3-4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="min-h-screen relative z-10 pb-20">
                  {renderGrid(PHYSICAL_3_4_ACTIVITIES, 'physical')}
                </motion.div>
              )}
              {currentView === 'physical' && selectedAge === '4-5' && (
                <motion.div key="physical-4-5" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="min-h-screen relative z-10 pb-20">
                  {renderGrid(PHYSICAL_4_5_ACTIVITIES, 'physical')}
                </motion.div>
              )}
              {currentView === 'physical' && selectedAge === '5-6' && (
                <motion.div key="physical-5-6" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="min-h-screen relative z-10 pb-20">
                  {renderGrid(PHYSICAL_5_6_ACTIVITIES, 'physical')}
                </motion.div>
              )}
              {currentView === 'social' && (selectedAge === 'toddler' || selectedAge === '3-4' || selectedAge === '4-5' || selectedAge === '5-6') && (
                <motion.div key={`social-${selectedAge}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="min-h-screen relative z-10 pb-20">
                  {renderGrid(
                    selectedAge === 'toddler' ? SOCIAL_TODDLER_ACTIVITIES :
                      selectedAge === '3-4' ? SOCIAL_3_4_ACTIVITIES :
                        selectedAge === '4-5' ? SOCIAL_4_5_ACTIVITIES :
                          SOCIAL_5_6_ACTIVITIES,
                    'social'
                  )}
                </motion.div>
              )}
              {['social'].includes(currentView) && !['toddler', '3-4', '4-5', '5-6'].includes(selectedAge) && (
                <motion.div key="coming-soon" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="min-h-screen relative z-10 flex flex-col items-center pt-20 pb-20">
                  <div className="flex items-center mb-8 gap-4 sticky top-4 z-10 bg-sky-50/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-white/50">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedSection(null)}
                      className="p-3 bg-white rounded-full shadow-md text-sky-500 border border-sky-100"
                    >
                      <ArrowLeft size={28} strokeWidth={3} />
                    </motion.button>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-700 capitalize">
                      {CATEGORIES.find(c => c.id === currentView)?.title}
                    </h2>
                  </div>
                  <div className="bg-white/80 backdrop-blur-md p-12 rounded-[3rem] shadow-xl border-4 border-white text-center max-w-lg mx-4 mt-10">
                    <span className="text-8xl mb-6 block">🚧</span>
                    <h3 className="text-3xl font-black text-slate-700 mb-4">Phần này đang được xây dựng!</h3>
                    <p className="text-xl text-slate-500 font-bold">Bé hãy quay lại sau nhé.</p>
                  </div>
                </motion.div>
              )}
            </React.Fragment>
          ) : selectedSection === 'games' && (currentView === 'cognitive' || currentView === 'language' || currentView === 'physical' || currentView === 'social' || currentView === 'aesthetic') ? (
            <motion.div key="interactive-games" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="min-h-screen relative z-10 pb-20">
              {activeMathGame ? (
                <MathGame
                  game={MATH_GAMES_DATA.find(g => g.id === activeMathGame)!}
                  onBack={() => setActiveMathGame(null)}
                  onComplete={(newStars) => {
                    const foundGame = MATH_GAMES_DATA.find(g => g.id === activeMathGame);
                    const isCognitiveOrMath = foundGame?.category === 'math' || currentView === 'cognitive';
                    triggerCompletionReward(foundGame?.title || 'Trò chơi toán học', isCognitiveOrMath ? 'math' : (foundGame?.category || currentView));
                    setActiveMathGame(null);
                  }}
                  speak={speak}
                />
              ) : (
                <div className="p-4 sm:p-6 max-w-5xl mx-auto pb-24">
                  <div className="flex items-center mb-8 gap-4 sticky top-4 z-10 bg-sky-50/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-white/50">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setSelectedSection(null);
                        speak("Quay lại");
                      }}
                      className="p-3 bg-white rounded-full shadow-md text-sky-500 border border-sky-100"
                    >
                      <ArrowLeft size={28} strokeWidth={3} />
                    </motion.button>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-700 capitalize">
                      Trò chơi tương tác
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {(() => {
                      const filteredGames = MATH_GAMES_DATA.filter(game => {
                        const isAgeMatch = !game.ageGroups || (selectedAge && game.ageGroups.includes(selectedAge));
                        if (!isAgeMatch) return false;

                        const isPhysicalGame = game.id.startsWith('physical-');
                        const isSocialGame = game.category === 'social' || game.id.startsWith('social-') || game.id.startsWith('skill-') || game.id.includes('an-toan') || game.id.includes('phong-tranh') || game.id.includes('ky-nang') || game.title.toLowerCase().includes('kỹ năng');
                        const isAestheticGame = game.id.startsWith('aesthetic-') || game.title.toLowerCase().includes('tạo hình') || game.title.toLowerCase().includes('âm nhạc');
                        const isLanguageGame = game.category === 'language' || game.id.startsWith('language-') || game.id.startsWith('story-') || game.id.startsWith('poem-') || game.title.toLowerCase().includes('truyện') || game.title.toLowerCase().includes('thơ') || (game.id.includes('chữ cái') && !game.id.includes('toán'));

                        if (currentView === 'language') {
                          return isLanguageGame;
                        }

                        if (currentView === 'physical') return isPhysicalGame;
                        if (currentView === 'social') return isSocialGame;
                        if (currentView === 'aesthetic') return isAestheticGame;
                        if (currentView === 'cognitive') {
                          // Allow games explicitly marked as cognitive even if they match other categories' keywords
                          if (game.category === 'math' || game.category === 'discovery' || game.id.startsWith('cognitive-') || game.id.startsWith('math-') || game.id.startsWith('cog-')) return true;
                          return !isPhysicalGame && !isSocialGame && !isAestheticGame && !isLanguageGame;
                        }

                        return true;
                      });

                      const renderGameButton = (game: any) => (
                        <motion.button
                          key={game.id}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (game.externalLink) {
                              setSelectedItem({
                                id: game.id,
                                name: game.title,
                                emoji: '🧩',
                                color: 'bg-white',
                                externalLink: game.externalLink
                              });
                            } else {
                              setActiveMathGame(game.id);
                            }
                            speak(game.title);
                          }}
                          className="bg-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 shadow-xl border-4 border-sky-100 relative overflow-hidden group min-h-[220px]"
                        >
                          {game.id === 'counting-1-5' && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md z-20 animate-bounce">
                              MỚI
                            </div>
                          )}
                          <div className="absolute -top-12 -right-12 w-40 h-40 bg-sky-50 rounded-full blur-2xl group-hover:bg-sky-100 transition-colors"></div>
                          <span className="text-8xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {
                              game.id.includes('numbers') ? '🔢' :
                                game.id.includes('compare') ? '⚖️' :
                                  game.id.includes('shapes') ? '🔺' :
                                    game.id.includes('patterns') ? '🧩' :
                                      game.id.includes('addition') ? '➕' :
                                        game.id.includes('count') ? '🖐️' :
                                          game.id.includes('split') ? '✂️' :
                                            game.id.includes('ordinal') ? '🔢' :
                                              game.id.includes('measure') ? '📏' :
                                                game.id.includes('right-left') ? '↔️' :
                                                  game.id.includes('big-small') ? '🐘' :
                                                    game.id.includes('one-many') ? '🔢' :
                                                      game.id.includes('animals') ? '🐥' :
                                                        game.id.includes('vehicles') ? '🚲' :
                                                          game.id.startsWith('physical-') ? '🏃' :
                                                            game.id.startsWith('game-') ? (game.title.includes('Truyện') ? '📖' : '📜') :
                                                              game.id.includes('language') ? '📚' :
                                                                game.id === 'counting-1-5' ? '🍎' : '🧩'
                            }
                          </span>
                          <h3 className="text-3xl font-black text-sky-800 text-center leading-tight">{game.title}</h3>
                          <p className="text-sky-600 font-bold bg-sky-50 px-6 py-2 rounded-full">
                            {game.externalLink ? 'Khám phá ngay!' : `${game.questions.length} Câu hỏi vui nhộn!`}
                          </p>
                        </motion.button>
                      );

                      if (currentView === 'language') {
                        const groupedGames = {
                          poem: filteredGames.filter(g => g.subcategory === 'poem' || g.title.toLowerCase().includes('thơ') || g.id.startsWith('poem-')),
                          story: filteredGames.filter(g => g.subcategory === 'story' || g.title.toLowerCase().includes('truyện') || g.id.startsWith('story-')),
                          alphabet: (selectedAge === '4-5' || selectedAge === '5-6')
                            ? filteredGames.filter(g => g.subcategory === 'alphabet' || g.title.toLowerCase().includes('chữ cái') || g.id.startsWith('language-') || g.id.includes('chữ-cái'))
                            : []
                        };

                        return (
                          <div className="col-span-full flex flex-col gap-10">
                            {groupedGames.poem.length > 0 && (
                              <section>
                                <h3 className="text-2xl font-black text-pink-600 mb-6 flex items-center gap-2 drop-shadow-sm">
                                  <span className="bg-pink-100 p-2 rounded-xl">📜</span> CÁC BÀI THƠ
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                  {groupedGames.poem.map(game => renderGameButton(game))}
                                </div>
                              </section>
                            )}

                            {groupedGames.story.length > 0 && (
                              <section>
                                <h3 className="text-2xl font-black text-sky-600 mb-6 flex items-center gap-2 drop-shadow-sm">
                                  <span className="bg-sky-100 p-2 rounded-xl">📚</span> TRUYỆN KỂ
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                  {groupedGames.story.map(game => renderGameButton(game))}
                                </div>
                              </section>
                            )}

                            {groupedGames.alphabet.length > 0 && (
                              <section>
                                <h3 className="text-2xl font-black text-amber-600 mb-6 flex items-center gap-2 drop-shadow-sm">
                                  <span className="bg-amber-100 p-2 rounded-xl">🔤</span> TRÒ CHƠI CHỮ CÁI
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                  {groupedGames.alphabet.map(game => renderGameButton(game))}
                                </div>
                              </section>
                            )}
                          </div>
                        );
                      }

                      if (currentView === 'cognitive' && selectedAge !== 'toddler') {
                        const mathKeywords = ['toán', 'số', 'đếm', 'phạm vi', 'hình', 'quy tắc', 'qui tắc', 'quy luật', 'phép cộng', 'tách', 'gộp', 'so sánh', 'dài', 'ngắn', 'nặng', 'nhẹ', 'to', 'nhỏ', 'phía', 'xếp tương ứng', '1-1', '1:1', 'ordinal', 'pattern', 'math', 'qty'];

                        const mathGames = filteredGames.filter(g => {
                          if (g.category === 'math') return true;
                          if (g.category === 'discovery') return false;
                          return mathKeywords.some(k => g.title.toLowerCase().includes(k)) ||
                            ['numbers', 'shapes', 'compare', 'count', 'math', 'qty', 'patterns'].some(p => g.id.toLowerCase().includes(p));
                        });

                        const discoveryGames = filteredGames.filter(g => !mathGames.includes(g));

                        return (
                          <div className="col-span-full space-y-16">
                            {mathGames.length > 0 && (
                              <section>
                                <div className="flex items-center gap-4 mb-8">
                                  <div className="w-16 h-16 bg-sky-100 rounded-3xl flex items-center justify-center text-3xl shadow-inner shadow-sky-200/50 font-black text-sky-600">🔢</div>
                                  <div>
                                    <h3 className="text-3xl font-black text-sky-800 uppercase tracking-tight">Hoạt động làm quen với toán</h3>
                                    <p className="text-slate-500 font-medium">Bé vui học số, hình khối và logic</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                  {mathGames.map(game => renderGameButton(game))}
                                </div>
                              </section>
                            )}

                            {discoveryGames.length > 0 && (
                              <section>
                                <div className="flex items-center gap-4 mb-8">
                                  <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-3xl shadow-inner shadow-emerald-200/50 font-black text-emerald-600">🔍</div>
                                  <div>
                                    <h3 className="text-3xl font-black text-emerald-800 uppercase tracking-tight">Hoạt động khám phá</h3>
                                    <p className="text-slate-500 font-medium">Tìm hiểu và khám phá thế giới quanh bé</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                  {discoveryGames.map(game => renderGameButton(game))}
                                </div>
                              </section>
                            )}
                          </div>
                        );
                      }

                      return (
                        <React.Fragment>
                          {filteredGames.map(game => renderGameButton(game))}
                        </React.Fragment>
                      );
                    })()}

                  </div>
                </div>
              )}
            </motion.div>
          ) : selectedSection === 'records' ? (
            <motion.div key="records-section" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="min-h-screen relative z-10 pb-20">
              {renderRecords()}
            </motion.div>
          ) : selectedSection === 'reports' ? (
            <motion.div key="reports-section" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="min-h-screen relative z-10 pb-20">
              {renderReports()}
            </motion.div>
          ) : (
            <motion.div key="coming-soon-section" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="min-h-screen relative z-10 flex flex-col items-center pt-20 pb-20">
              <div className="flex items-center mb-8 gap-4 sticky top-4 z-10 bg-sky-50/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-white/50">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setSelectedSection(null);
                    speak("Quay lại");
                  }}
                  className="p-3 bg-white rounded-full shadow-md text-sky-500 border border-sky-100"
                >
                  <ArrowLeft size={28} strokeWidth={3} />
                </motion.button>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-700 capitalize">
                  {LEARNING_SECTIONS.find(s => s.id === selectedSection)?.title}
                </h2>
              </div>
              <div className="bg-white/80 backdrop-blur-md p-12 rounded-[3rem] shadow-xl border-4 border-white text-center max-w-lg mx-4 mt-10">
                <span className="text-8xl mb-6 block">🚧</span>
                <h3 className="text-3xl font-black text-slate-700 mb-4">Phần này đang được xây dựng!</h3>
                <p className="text-xl text-slate-500 font-bold">Bé hãy quay lại sau nhé.</p>
              </div>
            </motion.div>
          )
        ) : (
          <motion.div key="other-tab" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="min-h-screen flex flex-col items-center justify-center pt-20 pb-32">
            <div className="bg-white/80 backdrop-blur-md p-12 rounded-[3rem] shadow-xl border-4 border-white text-center max-w-lg mx-4">
              <span className="text-8xl mb-6 block">🚧</span>
              <h3 className="text-3xl font-black text-slate-700 mb-4">Phần này đang được xây dựng!</h3>
              <p className="text-xl text-slate-500 font-bold">Bé hãy quay lại sau nhé.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSplash && <AuthorFooter />}
      {renderBottomNav()}

      {/* Eye Exercise Modal */}
      <AnimatePresence>
        {showEyeExercise && renderEyeExercise()}
      </AnimatePresence>

      {/* Breathing Exercise Modal */}
      <AnimatePresence>
        {showBreathing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-red-400/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[4rem] p-12 max-w-2xl w-full shadow-2xl border-8 border-white text-center relative overflow-hidden"
            >
              <button
                onClick={() => setShowBreathing(false)}
                className="absolute top-6 right-6 p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
              >
                <X size={32} strokeWidth={3} />
              </button>

              <div className="mb-8">
                <motion.div
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="text-[10rem] block"
                >
                  🎈
                </motion.div>
                <h2 className="text-4xl font-black text-red-800 mb-4">Cùng thổi bong bóng nào!</h2>
                <p className="text-2xl text-red-600 font-bold italic">"Hít vào thật sâu... và thở ra thật mạnh để thổi bong bóng to nhé!"</p>
              </div>

              <div className="flex justify-center gap-8 mb-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl animate-pulse">🌬️</div>
                  <p className="font-bold text-slate-600">Hít vào</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-4xl animate-bounce">💨</div>
                  <p className="font-bold text-slate-600">Thở ra</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowBreathing(false);
                  speak("Bé làm tốt lắm! Bé đã thấy thoải mái hơn chưa nào?");
                }}
                className="bg-red-500 text-white font-black text-2xl py-6 px-12 rounded-full shadow-xl border-4 border-white"
              >
                Con thấy nhẹ lòng rồi! 😊
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showCheckIn && <EmotionCheckIn onSelect={handleEmotionSelect} onClose={() => setShowCheckIn(false)} />}

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed inset-0 z-50 flex flex-col ${selectedItem.color || 'bg-white'} overflow-hidden`}
            onClick={(e) => {
              if (!isGeneratingAudio) {
                setIsGeneratingAudio(true);
                if (selectedItem.audioUrl) {
                  const audio = new Audio(selectedItem.audioUrl);
                  audio.play().then(() => setIsGeneratingAudio(false)).catch(err => {
                    console.error("Audio play failed", err);
                    setIsGeneratingAudio(false);
                  });
                } else {
                  const { text, lang } = getItemSpeechText(selectedItem);
                  speak(text, false, lang).finally(() => setIsGeneratingAudio(false));
                }
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>

            <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex justify-between items-center z-20 pointer-events-none">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  closeItem();
                  speak("Quay lại");
                }}
                className="p-3 sm:p-4 bg-white/90 hover:bg-white rounded-full text-sky-600 transition-all shadow-lg border-2 border-sky-100 pointer-events-auto"
              >
                <ArrowLeft size={32} strokeWidth={3} />
              </motion.button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeItem();
                }}
                className="p-3 sm:p-4 bg-white/90 hover:bg-white rounded-full text-slate-600 transition-all shadow-lg border-2 border-slate-100 pointer-events-auto"
              >
                <X size={32} strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 w-full h-full z-10">
              {selectedItem.videoId ? (
                <div className="w-full h-full max-w-6xl mx-auto flex flex-col rounded-3xl overflow-hidden shadow-2xl border-4 sm:border-8 border-white bg-slate-900">
                  <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-900/90 backdrop-blur-md text-white border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl">{selectedItem.emoji || '📺'}</span>
                      <h3 className="font-black text-base sm:text-xl truncate text-white">{selectedItem.name}</h3>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerCompletionReward(selectedItem.name);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 font-black rounded-full text-xs sm:text-sm shadow-md flex items-center gap-1.5 shrink-0"
                    >
                      <Star size={16} className="fill-slate-900 text-slate-900" />
                      <span>Hoàn thành! (+1 ⭐)</span>
                    </motion.button>
                  </div>
                  <div className="flex-1 w-full bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${selectedItem.videoId}?autoplay=1`}
                      title={selectedItem.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              ) : selectedItem.externalLink ? (
                <div className="w-full h-full flex flex-col rounded-3xl overflow-hidden shadow-2xl border-4 sm:border-8 border-white bg-white">
                  <div className="flex justify-between items-center p-3.5 sm:p-4 bg-white/95 backdrop-blur-md border-b-2 border-slate-100 shrink-0 gap-2">
                    <h3 className="text-base sm:text-xl font-black text-slate-800 flex items-center gap-2 truncate">
                      <span>{selectedItem.emoji || '🎮'}</span>
                      <span className="truncate">{selectedItem.name}</span>
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerCompletionReward(selectedItem.name);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 font-black rounded-full text-xs sm:text-sm shadow-md flex items-center gap-1.5"
                      >
                        <Star size={16} className="fill-slate-900 text-slate-900" />
                        <span>Hoàn thành! (+1 ⭐)</span>
                      </motion.button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(selectedItem.externalLink, '_blank');
                        }}
                        className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-full font-bold text-xs border border-sky-200 transition-colors flex items-center gap-1"
                      >
                        <span>Cửa sổ mới</span> ↗️
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 w-full bg-white">
                    <iframe
                      width="100%"
                      height="100%"
                      src={selectedItem.externalLink}
                      title={selectedItem.name}
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              ) : currentView === 'cognitive' && selectedItem.value ? (
                <div className="flex flex-col items-center gap-8">
                  <span className="text-[12rem] sm:text-[18rem] font-black text-slate-800 leading-none drop-shadow-2xl">
                    {selectedItem.value}
                  </span>
                  <div className="flex flex-wrap justify-center gap-4 max-w-2xl bg-white/40 p-8 rounded-[3rem]">
                    {Array.from({ length: selectedItem.value || 0 }).map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1, type: 'spring' }}
                        className="text-6xl sm:text-7xl drop-shadow-lg"
                      >
                        {selectedItem.emoji}
                      </motion.span>
                    ))}
                  </div>
                </div>
              ) : currentView === 'language' ? (
                <div className="flex flex-col items-center gap-8">
                  <div className="flex flex-col items-center gap-6 relative">
                    <span className="text-[8rem] sm:text-[12rem] md:text-[15rem] font-black text-slate-800 leading-none drop-shadow-2xl">
                      {selectedItem.id} {selectedItem.id.toLowerCase()}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isGeneratingAudio) {
                          setIsGeneratingAudio(true);

                          const letterAudioUrls: Record<string, string> = {
                            'A': 'https://www.image2url.com/r2/default/files/1777169658486-52b7bedb-200b-4635-baa0-7784b6d6c37b.wav',
                            'Ă': 'https://www.image2url.com/r2/default/files/1777169774368-2f308ba6-b694-4b04-8796-d22f6a349875.wav',
                            'Â': 'https://www.image2url.com/r2/default/files/1777169808441-844083db-07ee-4547-9c33-1482f60c88b4.wav',
                            'B': 'https://www.image2url.com/r2/default/files/1777169845229-feabb339-f00f-4c40-b7e4-46abf8ab300c.wav',
                            'C': 'https://www.image2url.com/r2/default/files/1777169884177-101a83a7-34cb-4ce4-bf2b-db7ab4fb5f48.wav',
                            'D': 'https://www.image2url.com/r2/default/files/1777169921167-d9d5cc5b-6cf1-4394-9cef-fbbf80e798f9.wav',
                            'Đ': 'https://www.image2url.com/r2/default/files/1777169951518-0047c945-bafb-4c15-9f27-0ea3f57b60f5.wav',
                            'E': 'https://www.image2url.com/r2/default/files/1777169989434-9a95738a-97f8-46b8-8f40-869a405f3236.wav'
                          };

                          if (letterAudioUrls[selectedItem.id]) {
                            const audio = new Audio(letterAudioUrls[selectedItem.id]);
                            audio.play().then(() => setIsGeneratingAudio(false)).catch(e => {
                              console.error("Audio play failed", e);
                              setIsGeneratingAudio(false);
                            });
                          } else {
                            const { text, lang } = getItemSpeechText(selectedItem);
                            speak(text, false, lang).finally(() => setIsGeneratingAudio(false));
                          }
                        }
                      }}
                      className="p-5 sm:p-6 bg-white rounded-full shadow-2xl text-sky-500 border-4 border-white z-20 flex items-center justify-center"
                    >
                      <Volume2 size={40} className="sm:w-16 sm:h-16" strokeWidth={3} />
                    </motion.button>
                  </div>
                  <div className="flex items-center gap-6 bg-white/60 px-8 sm:px-12 py-4 sm:py-6 rounded-full shadow-lg border-4 border-white">
                    <span className="text-7xl sm:text-8xl drop-shadow-lg">{selectedItem.emoji}</span>
                    <span className="text-5xl sm:text-6xl font-bold text-slate-700">{selectedItem.word}</span>
                  </div>

                  {/* Pronunciation Practice Button */}
                  <div className="flex flex-col items-center gap-4 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePronunciationPractice();
                      }}
                      disabled={isPracticing}
                      className={`p-6 rounded-full shadow-xl border-4 border-white flex items-center gap-3 ${isPracticing ? 'bg-red-500 text-white animate-pulse' : 'bg-gradient-to-r from-pink-400 to-rose-500 text-white'}`}
                    >
                      <Mic size={32} />
                      <span className="text-2xl font-black">Bé tập đọc</span>
                    </motion.button>
                    {pronunciationFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/90 px-6 py-3 rounded-2xl shadow-md border-2 border-pink-100 text-xl font-bold text-pink-600"
                      >
                        {pronunciationFeedback}
                      </motion.div>
                    )}
                  </div>
                </div>
              ) : (
                <motion.span
                  animate={{ y: [0, -20, 0], rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="text-[15rem] sm:text-[20rem] drop-shadow-2xl"
                >
                  {selectedItem.emoji}
                </motion.span>
              )}
            </div>

            {(!selectedItem.videoId && !selectedItem.externalLink) && (
              <div className="p-8 pb-12 w-full flex justify-center z-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`bg-white/90 backdrop-blur-md px-12 py-6 rounded-full flex items-center justify-center gap-6 shadow-xl border-4 border-white cursor-pointer ${isGeneratingAudio ? 'opacity-70' : ''}`}
                >
                  <Volume2 size={48} className={`text-sky-500 ${isGeneratingAudio ? 'animate-pulse' : ''}`} strokeWidth={3} />
                  <h3 className="text-4xl sm:text-5xl font-black text-slate-800 capitalize">
                    {currentView === 'language'
                      ? (letterLang === 'vi' ? selectedItem.name.split(' – ')[1] || selectedItem.name : selectedItem.word)
                      : selectedItem.name}
                  </h3>
                </motion.div>
              </div>
            )}

            {/* Bottom Navigation Bar */}
            <div className="absolute bottom-6 left-0 w-full flex justify-between px-6 sm:px-10 z-30 pointer-events-none">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  let items = getCurrentItemsList(currentView, selectedAge, letterLang);
                  if (currentView === 'cognitive') items = getCognitiveSections().flatMap((s: any) => s.items);
                  if (currentView === 'aesthetic') {
                    let sections: any[] = [];
                    if (selectedAge === 'toddler') sections = AESTHETIC_TODDLER_SECTIONS;
                    else if (selectedAge === '3-4') sections = AESTHETIC_3_4_SECTIONS;
                    else if (selectedAge === '4-5') sections = AESTHETIC_4_5_SECTIONS;
                    else if (selectedAge === '5-6') sections = AESTHETIC_5_6_SECTIONS;
                    items = (sections || []).flatMap((s: any) => s.items);
                  }

                  const currentIndex = items.findIndex((i: any) => i.id === selectedItem.id);
                  if (currentIndex > 0) {
                    handleItemClick(items[currentIndex - 1]);
                  } else {
                    closeItem();
                    speak("Quay lại");
                  }
                }}
                className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg border-2 border-sky-100 text-sky-600 font-black text-lg flex items-center gap-2 pointer-events-auto"
              >
                <ArrowLeft size={20} />
                Quay lại
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  let items = getCurrentItemsList(currentView, selectedAge, letterLang);
                  if (currentView === 'cognitive') items = getCognitiveSections().flatMap((s: any) => s.items);
                  if (currentView === 'aesthetic') {
                    let sections: any[] = [];
                    if (selectedAge === 'toddler') sections = AESTHETIC_TODDLER_SECTIONS;
                    else if (selectedAge === '3-4') sections = AESTHETIC_3_4_SECTIONS;
                    else if (selectedAge === '4-5') sections = AESTHETIC_4_5_SECTIONS;
                    else if (selectedAge === '5-6') sections = AESTHETIC_5_6_SECTIONS;
                    items = (sections || []).flatMap((s: any) => s.items);
                  }

                  const currentIndex = items.findIndex((i: any) => i.id === selectedItem.id);
                  if (currentIndex !== -1 && currentIndex < items.length - 1) {
                    handleItemClick(items[currentIndex + 1]);
                    speak("Tiếp tục bài học");
                  } else {
                    speak("Bé đã hoàn thành các bài học ở phần này rồi! Giỏi quá!");
                  }
                }}
                className="bg-sky-500 px-6 py-3 rounded-2xl shadow-lg border-2 border-white text-white font-black text-lg flex items-center gap-2 group pointer-events-auto"
              >
                Tiếp tục bài học
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>🚀</motion.span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session End Modal */}
      <AnimatePresence>
        {showSessionEndModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border-8 border-sky-100 text-center relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-50 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-50 rounded-full blur-3xl"></div>

              <span className="text-9xl mb-6 block drop-shadow-lg">⏰😴</span>
              <h2 className="text-4xl font-black text-sky-800 mb-4">Hết giờ học rồi!</h2>
              <p className="text-xl text-slate-600 font-bold mb-8 leading-relaxed">
                Bé đã học rất chăm chỉ trong {sessionTimeLimit} phút vừa qua. Bây giờ là lúc để đôi mắt và cơ thể được nghỉ ngơi nhé!
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowSessionEndModal(false);
                  setSessionTimeLeft(sessionTimeLimit * 60);
                  setIsTimerRunning(true);
                }}
                className="bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black text-2xl py-5 px-10 rounded-full shadow-xl border-4 border-white"
              >
                Đã hiểu ạ! ✨
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge Unlock Celebration Modal */}
      <AnimatePresence>
        {newlyUnlockedBadge && (
          <BadgeUnlockModal
            badge={newlyUnlockedBadge}
            onClose={() => setNewlyUnlockedBadge(null)}
            onNavigateToAchievements={() => {
              setNewlyUnlockedBadge(null);
              setCurrentTab('achievements');
              speak("Xem bảng thành tích huy hiệu");
            }}
          />
        )}
      </AnimatePresence>

      {/* Timer Display (Optional, subtle) */}
      {!showSplash && currentTab === 'home' && currentView === 'home' && <div className="fixed top-4 left-4 z-40 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border-2 border-white flex items-center gap-2">
          <span className="text-xl">⏳</span>
          <span className="font-black text-sky-800 tabular-nums">
            {Math.floor(sessionTimeLeft / 60)}:{(sessionTimeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>}
      {(storageError || emotionSpeechError) && <div role="status" className="fixed bottom-28 left-4 right-4 z-[110] mx-auto max-w-lg rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-950">{storageError || emotionSpeechError}</div>}
      {dataFailure && <div role="alert" className="fixed bottom-28 left-4 right-4 z-[111] mx-auto max-w-xl rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-950">{dataFailure.error}<div className="mt-2 flex gap-3"><button type="button" onClick={() => deviceData.forEach(item => item.retry())} className="min-h-11 underline">Thử lưu lại</button><button type="button" onClick={() => deviceData.filter(item => item.error).forEach(item => item.restoreRemote())} className="min-h-11 underline">Tải bản đã lưu</button></div></div>}
    </div>
  );
}
