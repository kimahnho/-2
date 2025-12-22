/**
 * AACPanel - AAC 카드 선택 패널
 * AAC 템플릿의 카드를 채우기 위한 카드 목록 표시
 * 
 * 카테고리:
 * - 음식 (Food): 55개
 * - 동물 (Animal): 41개
 */

import React from 'react';
import { Utensils, Search, X, PawPrint } from 'lucide-react';

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

type CategoryType = 'food' | 'animal';

// ========== Cloudinary 설정 ==========

const CLOUDINARY_CONFIG = {
    cloudName: 'dabbfycew',
    basePathFood: 'muru-cards/AAC-cards/illustration/Food',
    basePathAnimal: 'muru-cards/AAC-cards/illustration/animal',
    cacheVersion: 'v5'  // 캐시 버스팅
} as const;

const getCloudinaryUrl = (cardId: string, category: CategoryType): string => {
    const basePath = category === 'food'
        ? CLOUDINARY_CONFIG.basePathFood
        : CLOUDINARY_CONFIG.basePathAnimal;
    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${basePath}/aac_${cardId}.png?${CLOUDINARY_CONFIG.cacheVersion}`;
};

// ========== AAC 카드 데이터 ==========

interface AACCardData {
    id: string;
    label: string;
    emoji: string;
}

// 동물 카드 목록 (Cloudinary 이미지 사용) - 41개
const ANIMAL_CARDS: AACCardData[] = [
    { id: 'animal', label: '동물', emoji: '🐾' },
    { id: 'ant', label: '개미', emoji: '🐜' },
    { id: 'bear', label: '곰', emoji: '🐻' },
    { id: 'bee', label: '벌', emoji: '🐝' },
    { id: 'bird', label: '새', emoji: '🐦' },
    { id: 'bug', label: '벌레', emoji: '🐛' },
    { id: 'butterfly', label: '나비', emoji: '🦋' },
    { id: 'calf', label: '송아지', emoji: '🐄' },
    { id: 'cat', label: '고양이', emoji: '🐱' },
    { id: 'chick', label: '병아리', emoji: '🐤' },
    { id: 'chicken', label: '닭', emoji: '🐔' },
    { id: 'cow', label: '소', emoji: '🐄' },
    { id: 'crocodile', label: '악어', emoji: '🐊' },
    { id: 'deer', label: '사슴', emoji: '🦌' },
    { id: 'dinosaur', label: '공룡', emoji: '🦕' },
    { id: 'dog', label: '강아지', emoji: '🐶' },
    { id: 'donkey', label: '당나귀', emoji: '🫏' },
    { id: 'duck', label: '오리', emoji: '🦆' },
    { id: 'elephant', label: '코끼리', emoji: '🐘' },
    { id: 'fish', label: '물고기', emoji: '🐟' },
    { id: 'fox', label: '여우', emoji: '🦊' },
    { id: 'frog', label: '개구리', emoji: '🐸' },
    { id: 'giraffe', label: '기린', emoji: '🦒' },
    { id: 'goat', label: '염소', emoji: '🐐' },
    { id: 'goose', label: '거위', emoji: '🪿' },
    { id: 'hippo', label: '하마', emoji: '🦛' },
    { id: 'horse', label: '말', emoji: '🐴' },
    { id: 'lion', label: '사자', emoji: '🦁' },
    { id: 'monkey', label: '원숭이', emoji: '🐵' },
    { id: 'mouse', label: '쥐', emoji: '🐭' },
    { id: 'owl', label: '부엉이', emoji: '🦉' },
    { id: 'penguin', label: '펭귄', emoji: '🐧' },
    { id: 'pig', label: '돼지', emoji: '🐷' },
    { id: 'pigeon', label: '비둘기', emoji: '🕊️' },
    { id: 'rabbit', label: '토끼', emoji: '🐰' },
    { id: 'sheep', label: '양', emoji: '🐑' },
    { id: 'snake', label: '뱀', emoji: '🐍' },
    { id: 'sparrow', label: '참새', emoji: '🐦' },
    { id: 'squirrel', label: '다람쥐', emoji: '🐿️' },
    { id: 'tiger', label: '호랑이', emoji: '🐯' },
    { id: 'turtle', label: '거북이', emoji: '🐢' },
];

// 음식 카드 목록 (Cloudinary 이미지 사용) - 52개
const FOOD_CARDS: AACCardData[] = [
    { id: 'apple', label: '사과', emoji: '🍎' },
    { id: 'banana', label: '바나나', emoji: '🍌' },
    { id: 'beans', label: '콩', emoji: '🫘' },
    { id: 'bread', label: '빵', emoji: '🍞' },
    { id: 'cake', label: '케이크', emoji: '🎂' },
    { id: 'candy', label: '사탕', emoji: '🍬' },
    { id: 'carrot', label: '당근', emoji: '🥕' },
    { id: 'cheese', label: '치즈', emoji: '🧀' },
    { id: 'chestnut', label: '밤', emoji: '🌰' },
    { id: 'chewing_gum', label: '껌', emoji: '🫧' },
    { id: 'chicken_meet', label: '닭고기', emoji: '🍗' },
    { id: 'chips', label: '감자칩', emoji: '🍟' },
    { id: 'chocolate', label: '초콜릿', emoji: '🍫' },
    { id: 'cider', label: '사이다', emoji: '🥤' },
    { id: 'coffee', label: '커피', emoji: '☕' },
    { id: 'cola', label: '콜라', emoji: '🥤' },
    { id: 'corn', label: '옥수수', emoji: '🌽' },
    { id: 'daikon', label: '무', emoji: '🥬' },
    { id: 'donut', label: '도넛', emoji: '🍩' },
    { id: 'egg', label: '계란', emoji: '🥚' },
    { id: 'fish', label: '생선', emoji: '🐟' },
    { id: 'food', label: '음식', emoji: '🍽️' },
    { id: 'fruit', label: '과일', emoji: '🍎' },
    { id: 'grape_green', label: '청포도', emoji: '🍇' },
    { id: 'grape_purple', label: '포도', emoji: '🍇' },
    { id: 'hamburger', label: '햄버거', emoji: '🍔' },
    { id: 'hotdog', label: '핫도그', emoji: '🌭' },
    { id: 'hotteok', label: '호떡', emoji: '🥞' },
    { id: 'ice', label: '얼음', emoji: '🧊' },
    { id: 'ice_cream', label: '아이스크림', emoji: '🍦' },
    { id: 'instant_ramen', label: '라면', emoji: '🍜' },
    { id: 'juice', label: '주스', emoji: '🧃' },
    { id: 'kimchi', label: '김치', emoji: '🥬' },
    { id: 'laver', label: '김', emoji: '🍙' },
    { id: 'mandarine', label: '귤', emoji: '🍊' },
    { id: 'meat', label: '고기', emoji: '🥩' },
    { id: 'melon', label: '멜론', emoji: '🍈' },
    { id: 'milk', label: '우유', emoji: '🥛' },
    { id: 'napa_cabbage', label: '배추', emoji: '🥬' },
    { id: 'noodles', label: '국수', emoji: '🍜' },
    { id: 'orange', label: '오렌지', emoji: '🍊' },
    { id: 'peach', label: '복숭아', emoji: '🍑' },
    { id: 'peanuts', label: '땅콩', emoji: '🥜' },
    { id: 'pizza', label: '피자', emoji: '🍕' },
    { id: 'pumpkin', label: '호박', emoji: '🎃' },
    { id: 'rice', label: '밥', emoji: '🍚' },
    { id: 'snack', label: '과자', emoji: '🍪' },
    { id: 'spagetti', label: '스파게티', emoji: '🍝' },
    { id: 'strawberry', label: '딸기', emoji: '🍓' },
    { id: 'sugar', label: '설탕', emoji: '🧂' },
    { id: 'sweet_potato', label: '고구마', emoji: '🍠' },
    { id: 'tomato', label: '토마토', emoji: '🍅' },
    { id: 'tteok', label: '떡', emoji: '🍡' },
    { id: 'water', label: '물', emoji: '💧' },
    { id: 'watermelon', label: '수박', emoji: '🍉' },
    { id: 'yogurt', label: '요거트', emoji: '🥛' },
];

const getAACCards = (category: CategoryType): AACCard[] => {
    const cards = category === 'food' ? FOOD_CARDS : ANIMAL_CARDS;
    return cards.map(card => ({
        id: card.id,
        label: card.label,
        category: category,
        emoji: card.emoji,
        cloudinaryUrl: getCloudinaryUrl(card.id, category),
    }));
};

// ========== 컴포넌트 ==========

export const AACPanel: React.FC<Props> = ({ onSelectAACCard }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeCategory, setActiveCategory] = React.useState<CategoryType>('food');

    const aacCards = React.useMemo(() => getAACCards(activeCategory), [activeCategory]);

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

    const categories = [
        { id: 'food' as CategoryType, label: '음식', icon: Utensils, count: FOOD_CARDS.length },
        { id: 'animal' as CategoryType, label: '동물', icon: PawPrint, count: ANIMAL_CARDS.length },
    ];

    return (
        <div className="space-y-4">
            {/* 카테고리 탭 */}
            <div className="flex gap-2">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setActiveCategory(cat.id);
                            setSearchQuery('');
                        }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === cat.id
                            ? 'bg-[#5500FF] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <cat.icon className="w-4 h-4" />
                        <span>{cat.label}</span>
                        <span className={`text-xs ${activeCategory === cat.id ? 'text-white/70' : 'text-gray-400'}`}>
                            {cat.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* 검색 */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder={`${activeCategory === 'food' ? '음식' : '동물'} 검색...`}
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
