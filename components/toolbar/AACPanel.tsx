/**
 * AACPanel - AAC 카드 선택 패널
 * AAC 템플릿의 카드를 채우기 위한 카드 목록 표시
 * 
 * 리팩토링 완료:
 * - 사용되지 않는 imports 제거
 * - 불필요한 icon 필드 제거 (Cloudinary 이미지만 사용)
 * - 단일 카테고리/스타일이므로 선택 UI 제거
 */

import React from 'react';
import { Utensils, Search, X } from 'lucide-react';

// ========== 타입 정의 ==========

interface Props {
    onSelectAACCard: (card: AACCard) => void;
    currentCardIndex?: number;
    totalCards?: number;
}

export interface AACCard {
    id: string;
    label: string;
    category: string;
    emoji: string;
    cloudinaryUrl?: string;
}

// ========== Cloudinary 설정 ==========

const CLOUDINARY_CONFIG = {
    cloudName: 'dabbfycew',
    basePath: 'muru-cards/AAC-cards/illustration/Food',
    cacheVersion: 'v3'
} as const;

const getCloudinaryUrl = (cardId: string): string =>
    `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${CLOUDINARY_CONFIG.basePath}/aac_${cardId}.png?${CLOUDINARY_CONFIG.cacheVersion}`;

// ========== AAC 카드 데이터 ==========

interface AACCardData {
    id: string;
    label: string;
    emoji: string;
}

// 음식 카드 목록 (Cloudinary 이미지 사용)
const FOOD_CARDS: AACCardData[] = [
    { id: 'watermelon', label: '수박', emoji: '🍉' },
    { id: 'yogurt', label: '요거트', emoji: '🥛' },
    { id: 'tomato', label: '토마토', emoji: '🍅' },
    { id: 'strawberry', label: '딸기', emoji: '🍓' },
    { id: 'pizza', label: '피자', emoji: '🍕' },
    { id: 'sweet_potato', label: '고구마', emoji: '🍠' },
    { id: 'sugar', label: '설탕', emoji: '🧂' },
    { id: 'potato', label: '감자', emoji: '🥔' },
    { id: 'spaghetti', label: '스파게티', emoji: '🍝' },
    { id: 'milk', label: '우유', emoji: '🥛' },
    { id: 'noodles', label: '국수', emoji: '🍜' },
    { id: 'peanuts', label: '땅콩', emoji: '🥜' },
    { id: 'snack', label: '과자', emoji: '🍪' },
    { id: 'mango', label: '망고', emoji: '🥭' },
    { id: 'napa_cabbage', label: '배추', emoji: '🥬' },
    { id: 'melon', label: '멜론', emoji: '🍈' },
    { id: 'mandarine', label: '귤', emoji: '🍊' },
    { id: 'french', label: '감자튀김', emoji: '🍟' },
    { id: 'lemon', label: '레몬', emoji: '🍋' },
    { id: 'juice', label: '주스', emoji: '🧃' },
    { id: 'instant_ramen', label: '라면', emoji: '🍜' },
    { id: 'tteokbbgi', label: '떡볶이', emoji: '🌶️' },
    { id: 'ice', label: '얼음', emoji: '🧊' },
    { id: 'ice_cream', label: '아이스크림', emoji: '🍦' },
    { id: 'hotdog', label: '핫도그', emoji: '🌭' },
    { id: 'hamburger', label: '햄버거', emoji: '🍔' },
    { id: 'grape_purple', label: '포도', emoji: '🍇' },
    { id: 'grape_green', label: '청포도', emoji: '🍇' },
    { id: 'fruit', label: '과일', emoji: '🍎' },
    { id: 'food', label: '음식', emoji: '🍽️' },
    { id: 'fish', label: '생선', emoji: '🐟' },
    { id: 'egg', label: '계란', emoji: '🥚' },
    { id: 'donut', label: '도넛', emoji: '🍩' },
    { id: 'coffee', label: '커피', emoji: '☕' },
    { id: 'cookie', label: '쿠키', emoji: '🍪' },
    { id: 'cola', label: '콜라', emoji: '🥤' },
    { id: 'corn', label: '옥수수', emoji: '🌽' },
    { id: 'chips', label: '감자칩', emoji: '🍟' },
    { id: 'chocolate', label: '초콜릿', emoji: '🍫' },
    { id: 'chicken_meat', label: '치킨', emoji: '🍗' },
    { id: 'cheese', label: '치즈', emoji: '🧀' },
    { id: 'chewing_gum', label: '껌', emoji: '🫧' },
    { id: 'chestnut', label: '밤', emoji: '🌰' },
    { id: 'carrot', label: '당근', emoji: '🥕' },
    { id: 'candy', label: '사탕', emoji: '🍬' },
    { id: 'cake', label: '케이크', emoji: '🎂' },
    { id: 'bread', label: '빵', emoji: '🍞' },
    { id: 'apple', label: '사과', emoji: '🍎' },
    { id: 'banana', label: '바나나', emoji: '🍌' },
    { id: 'orange', label: '오렌지', emoji: '🍊' },
    { id: 'peach', label: '복숭아', emoji: '🍑' },
    { id: 'rice', label: '밥', emoji: '🍚' },
    { id: 'water', label: '물', emoji: '💧' },
    { id: 'kimchi', label: '김치', emoji: '🥬' },
];

// Cloudinary URL이 포함된 AAC 카드 생성
const getAACCards = (): AACCard[] => FOOD_CARDS.map(card => ({
    id: card.id,
    label: card.label,
    category: 'food',
    emoji: card.emoji,
    cloudinaryUrl: getCloudinaryUrl(card.id),
}));

// ========== 컴포넌트 ==========

export const AACPanel: React.FC<Props> = ({ onSelectAACCard }) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    const aacCards = React.useMemo(() => getAACCards(), []);

    // 검색 필터링
    const filteredCards = React.useMemo(() => {
        if (!searchQuery.trim()) return aacCards;
        return aacCards.filter(card =>
            card.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [aacCards, searchQuery]);

    // 이미지 로드 실패 시 이모지로 대체
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, emoji: string) => {
        const img = e.target as HTMLImageElement;
        img.style.display = 'none';
        if (img.parentElement) {
            img.parentElement.innerHTML = `<span class="text-3xl">${emoji}</span>`;
        }
    };

    return (
        <div className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Utensils className="w-4 h-4" />
                <span>음식 카드</span>
                <span className="text-gray-400 text-xs">({filteredCards.length}개)</span>
            </div>

            {/* 검색 */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="카드 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 pl-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5500FF] focus:border-transparent"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* 안내 메시지 */}
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 text-center">
                {searchQuery
                    ? `"${searchQuery}" 검색 결과: ${filteredCards.length}개`
                    : '카드를 선택하면 자동으로 다음 칸으로 이동합니다'}
            </p>

            {/* 카드 그리드 */}
            <div className="grid grid-cols-2 gap-2">
                {filteredCards.map(card => (
                    <button
                        key={card.id}
                        onClick={() => onSelectAACCard(card)}
                        className="flex flex-col items-center p-3 rounded-xl border-2 border-gray-200 hover:border-[#5500FF] hover:shadow-md transition-all group"
                    >
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform overflow-hidden bg-white">
                            <img
                                src={card.cloudinaryUrl}
                                alt={card.label}
                                className="w-full h-full object-contain"
                                onError={(e) => handleImageError(e, card.emoji)}
                            />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{card.label}</span>
                    </button>
                ))}
            </div>

            {/* 빈 결과 */}
            {filteredCards.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">"{searchQuery}"에 맞는 카드가 없습니다</p>
                </div>
            )}
        </div>
    );
};
