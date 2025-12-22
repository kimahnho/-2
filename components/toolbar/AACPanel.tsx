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
    cloudinaryUrl?: string;
}

// AAC 카드 카테고리
const AAC_CATEGORIES = [
    { id: 'basic', name: '기본', icon: <Grid className="w-4 h-4" /> },
    { id: 'needs', name: '요구', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'feelings', name: '감정', icon: <Heart className="w-4 h-4" /> },
    { id: 'actions', name: '행동', icon: <Play className="w-4 h-4" /> },
    { id: 'places', name: '장소', icon: <Home className="w-4 h-4" /> },
    { id: 'food', name: '음식', icon: <Utensils className="w-4 h-4" /> },
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
const AAC_CACHE_VERSION = 'v3';
const getCloudinaryAACUrl = (cardId: string): string => {
    // 폴더 구조: muru-cards/AAC-cards/illustration/Food/aac_{cardId}.png
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/muru-cards/AAC-cards/illustration/Food/aac_${cardId}.png?${AAC_CACHE_VERSION}`;
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

    // 음식 (Cloudinary 이미지 있음 - 55개)
    { id: 'watermelon', label: '수박', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#22C55E', emoji: '🍉' },
    { id: 'yogurt', label: '요거트', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F472B6', emoji: '🥛' },
    { id: 'tomato', label: '토마토', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#EF4444', emoji: '🍅' },
    { id: 'strawberry', label: '딸기', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#EF4444', emoji: '🍓' },
    { id: 'pizza', label: '피자', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F97316', emoji: '🍕' },
    { id: 'sweet_potato', label: '고구마', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#9F580A', emoji: '🍠' },
    { id: 'sugar', label: '설탕', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#FAFAFA', emoji: '🧂' },
    { id: 'potato', label: '감자', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#D4A574', emoji: '🥔' },
    { id: 'spaghetti', label: '스파게티', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F59E0B', emoji: '🍝' },
    { id: 'milk', label: '우유', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#FAFAFA', emoji: '🥛' },
    { id: 'noodles', label: '국수', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F59E0B', emoji: '🍜' },
    { id: 'peanuts', label: '땅콩', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#D4A574', emoji: '🥜' },
    { id: 'snack', label: '과자', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F59E0B', emoji: '🍪' },
    { id: 'mango', label: '망고', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#FBBF24', emoji: '🥭' },
    { id: 'napa_cabbage', label: '배추', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#84CC16', emoji: '🥬' },
    { id: 'melon', label: '멜론', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#84CC16', emoji: '🍈' },
    { id: 'mandarine', label: '귤', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F97316', emoji: '🍊' },
    { id: 'french', label: '감자튀김', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#FBBF24', emoji: '🍟' },
    { id: 'lemon', label: '레몬', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#FBBF24', emoji: '🍋' },
    { id: 'juice', label: '주스', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F97316', emoji: '🧃' },
    { id: 'instant_ramen', label: '라면', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#EF4444', emoji: '🍜' },
    { id: 'tteokbbgi', label: '떡볶이', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#EF4444', emoji: '🌶️' },
    { id: 'ice', label: '얼음', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#60A5FA', emoji: '🧊' },
    { id: 'ice_cream', label: '아이스크림', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F472B6', emoji: '🍦' },
    { id: 'hotdog', label: '핫도그', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F59E0B', emoji: '🌭' },
    { id: 'hamburger', label: '햄버거', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F97316', emoji: '🍔' },
    { id: 'grape_purple', label: '포도', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#8B5CF6', emoji: '🍇' },
    { id: 'grape_green', label: '청포도', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#84CC16', emoji: '🍇' },
    { id: 'fruit', label: '과일', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#22C55E', emoji: '🍎' },
    { id: 'food', label: '음식', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F97316', emoji: '🍽️' },
    { id: 'fish', label: '생선', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#3B82F6', emoji: '🐟' },
    { id: 'egg', label: '계란', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#FBBF24', emoji: '🥚' },
    { id: 'donut', label: '도넛', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F472B6', emoji: '🍩' },
    { id: 'coffee', label: '커피', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#78350F', emoji: '☕' },
    { id: 'cookie', label: '쿠키', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#D4A574', emoji: '🍪' },
    { id: 'cola', label: '콜라', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#78350F', emoji: '🥤' },
    { id: 'corn', label: '옥수수', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#FBBF24', emoji: '🌽' },
    { id: 'chips', label: '감자칩', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F59E0B', emoji: '🍟' },
    { id: 'chocolate', label: '초콜릿', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#78350F', emoji: '🍫' },
    { id: 'chicken_meat', label: '치킨', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F97316', emoji: '🍗' },
    { id: 'cheese', label: '치즈', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#FBBF24', emoji: '🧀' },
    { id: 'chewing_gum', label: '껌', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#EC4899', emoji: '🫧' },
    { id: 'chestnut', label: '밤', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#78350F', emoji: '🌰' },
    { id: 'carrot', label: '당근', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F97316', emoji: '🥕' },
    { id: 'candy', label: '사탕', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#EC4899', emoji: '🍬' },
    { id: 'cake', label: '케이크', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F472B6', emoji: '🎂' },
    { id: 'bread', label: '빵', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#D4A574', emoji: '🍞' },
    { id: 'apple', label: '사과', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#EF4444', emoji: '🍎' },
    { id: 'banana', label: '바나나', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#FBBF24', emoji: '🍌' },
    { id: 'orange', label: '오렌지', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F97316', emoji: '🍊' },
    { id: 'peach', label: '복숭아', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F472B6', emoji: '🍑' },
    { id: 'rice', label: '밥', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#FAFAFA', emoji: '🍚' },
    { id: 'water', label: '물', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#60A5FA', emoji: '💧' },
    { id: 'kimchi', label: '김치', category: 'food', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#EF4444', emoji: '🥬' },
];

// Cloudinary URL이 포함된 AAC 카드 생성 함수
const getAACCards = () => AAC_CARD_DEFINITIONS.map(card => ({
    ...card,
    cloudinaryUrl: getCloudinaryAACUrl(card.id),
}));

export const AACPanel: React.FC<Props> = ({ onSelectAACCard, currentCardIndex, totalCards }) => {
    const [selectedCategory, setSelectedCategory] = React.useState('basic');
    const [cardStyle, setCardStyle] = React.useState<AACCardStyle>('illustration');
    const [searchQuery, setSearchQuery] = React.useState('');

    const aacCards = React.useMemo(() => getAACCards(), []);

    // 검색어가 있으면 전체에서 검색, 없으면 카테고리별 필터
    const filteredCards = React.useMemo(() => {
        if (searchQuery.trim()) {
            return aacCards.filter(card =>
                card.label.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return aacCards.filter(card => card.category === selectedCategory);
    }, [aacCards, searchQuery, selectedCategory]);

    return (
        <div className="space-y-4">
            {/* 검색 입력 */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="카드 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 pl-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5500FF] focus:border-transparent"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* 안내 메시지 */}
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 text-center">
                {searchQuery ? `"${searchQuery}" 검색 결과: ${filteredCards.length}개` : '카드를 선택하면 자동으로 다음 칸으로 이동합니다'}
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
                {/* 그림 스타일이면 Cloudinary 이미지 표시, 아니면 준비중 */}
                {cardStyle === 'illustration' ? (
                    filteredCards.map(card => (
                        <button
                            key={card.id}
                            onClick={() => onSelectAACCard(card)}
                            className="flex flex-col items-center p-3 rounded-xl border-2 border-gray-200 hover:border-[#5500FF] hover:shadow-md transition-all group"
                        >
                            <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform overflow-hidden bg-white"
                            >
                                <img
                                    src={card.cloudinaryUrl}
                                    alt={card.label}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        // Cloudinary 이미지 실패시 이모지로 대체
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-3xl">${card.emoji}</span>`;
                                    }}
                                />
                            </div>
                            <span className="text-xs font-medium text-gray-700">{card.label}</span>
                        </button>
                    ))
                ) : (
                    // 실제 사진/선그림: 준비중 표시
                    <div className="col-span-2 text-center py-12 text-gray-400">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                            {cardStyle === 'photo' ? '📷' : '✏️'}
                        </div>
                        <p className="text-sm font-medium mb-1">
                            {cardStyle === 'photo' ? '실제 사진' : '선그림'} 카드 준비 중
                        </p>
                    </div>
                )}
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
