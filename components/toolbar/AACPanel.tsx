/**
 * AACPanel - AAC 카드 선택 패널
 * AAC 템플릿의 카드를 채우기 위한 카드 목록 표시
 */

import React from 'react';
import {
    Grid, MessageSquare, Home, User, Heart, ThumbsUp, ThumbsDown,
    Utensils, Coffee, Bath, Shirt, Moon, Sun, Play, Pause, HelpCircle,
    Clock, Book, Tv, Gift, Car, Phone, Music, Camera, Palette, Pencil
} from 'lucide-react';

interface Props {
    onSelectAACCard: (card: AACCard) => void;
    currentCardIndex?: number;
    totalCards?: number;
}

// AAC 카드 타입
export interface AACCard {
    id: string;
    label: string;
    category: string;
    icon: React.ReactNode;
    backgroundColor: string;
    emoji: string;
}

// AAC 카드 카테고리
const AAC_CATEGORIES = [
    { id: 'basic', name: '기본', icon: <Grid className="w-4 h-4" /> },
    { id: 'needs', name: '요구', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'feelings', name: '감정', icon: <Heart className="w-4 h-4" /> },
    { id: 'actions', name: '행동', icon: <Play className="w-4 h-4" /> },
    { id: 'places', name: '장소', icon: <Home className="w-4 h-4" /> },
];

// 카드 스타일 타입
export type AACCardStyle = 'photo' | 'illustration' | 'line-drawing';

// 스타일 옵션
const AAC_CARD_STYLES: { id: AACCardStyle; name: string; icon: React.ReactNode }[] = [
    { id: 'photo', name: '실제 사진', icon: <Camera className="w-3 h-3" /> },
    { id: 'illustration', name: '그림', icon: <Palette className="w-3 h-3" /> },
    { id: 'line-drawing', name: '선그림', icon: <Pencil className="w-3 h-3" /> },
];

// Cloudinary 설정
const CLOUDINARY_CLOUD_NAME = 'dabbfycew';
const getCloudinaryAACUrl = (style: AACCardStyle, category: string, label: string): string => {
    // 폴더 구조: muru-cards/aac-cards/{style}/{category}/{label}.png
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/muru-cards/aac-cards/${style}/${category}/${encodeURIComponent(label)}.png`;
};

// AAC 카드 정의
interface AACCardDef {
    id: string;
    label: string;
    category: string;
    icon: React.ReactNode;
    backgroundColor: string;
    emoji: string;
}

// AAC 카드 목록 (기본 제공) - Cloudinary URL 자동 생성
const AAC_CARD_DEFINITIONS: AACCardDef[] = [
    // 기본
    { id: 'yes', label: '예', category: 'basic', icon: <ThumbsUp className="w-8 h-8" />, backgroundColor: '#22C55E', emoji: '👍' },
    { id: 'no', label: '아니오', category: 'basic', icon: <ThumbsDown className="w-8 h-8" />, backgroundColor: '#EF4444', emoji: '👎' },
    { id: 'help', label: '도와주세요', category: 'basic', icon: <HelpCircle className="w-8 h-8" />, backgroundColor: '#F59E0B', emoji: '🆘' },
    { id: 'more', label: '더 주세요', category: 'basic', icon: <Gift className="w-8 h-8" />, backgroundColor: '#8B5CF6', emoji: '🎁' },
    { id: 'stop', label: '그만', category: 'basic', icon: <Pause className="w-8 h-8" />, backgroundColor: '#EF4444', emoji: '🛑' },
    { id: 'wait', label: '기다려요', category: 'basic', icon: <Clock className="w-8 h-8" />, backgroundColor: '#6366F1', emoji: '⏳' },

    // 요구
    { id: 'eat', label: '먹고 싶어요', category: 'needs', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F97316', emoji: '🍽️' },
    { id: 'drink', label: '마시고 싶어요', category: 'needs', icon: <Coffee className="w-8 h-8" />, backgroundColor: '#06B6D4', emoji: '🥤' },
    { id: 'bathroom', label: '화장실', category: 'needs', icon: <Bath className="w-8 h-8" />, backgroundColor: '#3B82F6', emoji: '🚽' },
    { id: 'clothes', label: '옷 갈아입기', category: 'needs', icon: <Shirt className="w-8 h-8" />, backgroundColor: '#EC4899', emoji: '👕' },
    { id: 'sleep', label: '자고 싶어요', category: 'needs', icon: <Moon className="w-8 h-8" />, backgroundColor: '#6366F1', emoji: '😴' },
    { id: 'outside', label: '밖에 나가요', category: 'needs', icon: <Sun className="w-8 h-8" />, backgroundColor: '#FBBF24', emoji: '☀️' },

    // 감정
    { id: 'happy', label: '기뻐요', category: 'feelings', icon: <Heart className="w-8 h-8" />, backgroundColor: '#F472B6', emoji: '😊' },
    { id: 'sad', label: '슬퍼요', category: 'feelings', icon: <Heart className="w-8 h-8" />, backgroundColor: '#60A5FA', emoji: '😢' },
    { id: 'angry', label: '화나요', category: 'feelings', icon: <Heart className="w-8 h-8" />, backgroundColor: '#EF4444', emoji: '😠' },
    { id: 'scared', label: '무서워요', category: 'feelings', icon: <Heart className="w-8 h-8" />, backgroundColor: '#A78BFA', emoji: '😨' },
    { id: 'love', label: '사랑해요', category: 'feelings', icon: <Heart className="w-8 h-8" />, backgroundColor: '#F43F5E', emoji: '❤️' },
    { id: 'tired', label: '피곤해요', category: 'feelings', icon: <Moon className="w-8 h-8" />, backgroundColor: '#94A3B8', emoji: '😫' },

    // 행동
    { id: 'play', label: '놀아요', category: 'actions', icon: <Play className="w-8 h-8" />, backgroundColor: '#22C55E', emoji: '🎾' },
    { id: 'read', label: '책 읽어요', category: 'actions', icon: <Book className="w-8 h-8" />, backgroundColor: '#8B5CF6', emoji: '📖' },
    { id: 'watch', label: 'TV 봐요', category: 'actions', icon: <Tv className="w-8 h-8" />, backgroundColor: '#3B82F6', emoji: '📺' },
    { id: 'music', label: '음악 들어요', category: 'actions', icon: <Music className="w-8 h-8" />, backgroundColor: '#EC4899', emoji: '🎵' },
    { id: 'call', label: '전화해요', category: 'actions', icon: <Phone className="w-8 h-8" />, backgroundColor: '#14B8A6', emoji: '📞' },
    { id: 'drive', label: '차 타요', category: 'actions', icon: <Car className="w-8 h-8" />, backgroundColor: '#F59E0B', emoji: '🚗' },

    // 장소
    { id: 'home', label: '집', category: 'places', icon: <Home className="w-8 h-8" />, backgroundColor: '#F97316', emoji: '🏠' },
    { id: 'school', label: '학교', category: 'places', icon: <Book className="w-8 h-8" />, backgroundColor: '#3B82F6', emoji: '🏫' },
    { id: 'hospital', label: '병원', category: 'places', icon: <HelpCircle className="w-8 h-8" />, backgroundColor: '#EF4444', emoji: '🏥' },
    { id: 'store', label: '마트', category: 'places', icon: <Gift className="w-8 h-8" />, backgroundColor: '#22C55E', emoji: '🏪' },
    { id: 'park', label: '공원', category: 'places', icon: <Sun className="w-8 h-8" />, backgroundColor: '#84CC16', emoji: '🌳' },
    { id: 'friend', label: '친구 집', category: 'places', icon: <User className="w-8 h-8" />, backgroundColor: '#A855F7', emoji: '🧑‍🤝‍🧑' },
];

// Cloudinary URL이 포함된 AAC 카드 생성 함수
const getAACCards = (style: AACCardStyle) => AAC_CARD_DEFINITIONS.map(card => ({
    ...card,
    cloudinaryUrl: getCloudinaryAACUrl(style, card.category, card.label),
}));

export const AACPanel: React.FC<Props> = ({ onSelectAACCard, currentCardIndex, totalCards }) => {
    const [selectedCategory, setSelectedCategory] = React.useState('basic');
    const [cardStyle, setCardStyle] = React.useState<AACCardStyle>('illustration');

    const aacCards = React.useMemo(() => getAACCards(cardStyle), [cardStyle]);
    const filteredCards = aacCards.filter(card => card.category === selectedCategory);

    return (
        <div className="space-y-4">
            {/* 안내 메시지 */}
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 text-center">
                카드를 선택하면 자동으로 다음 칸으로 이동합니다
            </div>

            {/* 스타일 선택기 */}
            <div className="flex gap-1">
                {AAC_CARD_STYLES.map(style => (
                    <button
                        key={style.id}
                        onClick={() => setCardStyle(style.id)}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${cardStyle === style.id
                                ? 'bg-[#5500FF] text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {style.icon}
                        {style.name}
                    </button>
                ))}
            </div>

            {/* 카테고리 선택 */}
            <div className="flex flex-wrap gap-1.5">
                {AAC_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${selectedCategory === cat.id
                            ? 'bg-[#5500FF] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {cat.icon}
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* 카드 목록 */}
            <div className="grid grid-cols-2 gap-2">
                {filteredCards.map(card => (
                    <button
                        key={card.id}
                        onClick={() => onSelectAACCard(card)}
                        className="flex flex-col items-center p-3 rounded-xl border-2 border-gray-200 hover:border-[#5500FF] hover:shadow-md transition-all group"
                    >
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform overflow-hidden"
                            style={{ backgroundColor: card.backgroundColor }}
                        >
                            {/* Cloudinary 이미지 우선, 실패 시 이모지 표시 */}
                            <img
                                src={card.cloudinaryUrl}
                                alt={card.label}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // 이미지 로드 실패 시 이모지로 대체
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    // 다음 sibling (span.emoji-fallback)을 표시
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                            />
                            <span
                                className="text-2xl hidden items-center justify-center w-full h-full"
                                style={{ display: 'none' }}
                            >
                                {card.emoji}
                            </span>
                        </div>
                        <span className="text-xs font-medium text-gray-700">{card.label}</span>
                    </button>
                ))}
            </div>

            {/* 빈 상태 */}
            {filteredCards.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                    <Grid className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">카드가 없습니다</p>
                </div>
            )}
        </div>
    );
};
