/**
 * AACPanel - AAC 카드 선택 패널
 * AAC 템플릿의 카드를 채우기 위한 카드 목록 표시
 */

import React from 'react';
import {
    Grid, MessageSquare, Home, User, Heart, ThumbsUp, ThumbsDown,
    Utensils, Coffee, Bath, Shirt, Moon, Sun, Play, Pause, HelpCircle,
    Clock, Calendar, Music, Book, Tv, Gift, Car, Phone
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
}

// AAC 카드 카테고리
const AAC_CATEGORIES = [
    { id: 'basic', name: '기본', icon: <Grid className="w-4 h-4" /> },
    { id: 'needs', name: '요구', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'feelings', name: '감정', icon: <Heart className="w-4 h-4" /> },
    { id: 'actions', name: '행동', icon: <Play className="w-4 h-4" /> },
    { id: 'places', name: '장소', icon: <Home className="w-4 h-4" /> },
];

// AAC 카드 목록 (기본 제공)
const AAC_CARDS: AACCard[] = [
    // 기본
    { id: 'yes', label: '예', category: 'basic', icon: <ThumbsUp className="w-8 h-8" />, backgroundColor: '#22C55E' },
    { id: 'no', label: '아니오', category: 'basic', icon: <ThumbsDown className="w-8 h-8" />, backgroundColor: '#EF4444' },
    { id: 'help', label: '도와주세요', category: 'basic', icon: <HelpCircle className="w-8 h-8" />, backgroundColor: '#F59E0B' },
    { id: 'more', label: '더 주세요', category: 'basic', icon: <Gift className="w-8 h-8" />, backgroundColor: '#8B5CF6' },
    { id: 'stop', label: '그만', category: 'basic', icon: <Pause className="w-8 h-8" />, backgroundColor: '#EF4444' },
    { id: 'wait', label: '기다려요', category: 'basic', icon: <Clock className="w-8 h-8" />, backgroundColor: '#6366F1' },

    // 요구
    { id: 'eat', label: '먹고 싶어요', category: 'needs', icon: <Utensils className="w-8 h-8" />, backgroundColor: '#F97316' },
    { id: 'drink', label: '마시고 싶어요', category: 'needs', icon: <Coffee className="w-8 h-8" />, backgroundColor: '#06B6D4' },
    { id: 'bathroom', label: '화장실', category: 'needs', icon: <Bath className="w-8 h-8" />, backgroundColor: '#3B82F6' },
    { id: 'clothes', label: '옷 갈아입기', category: 'needs', icon: <Shirt className="w-8 h-8" />, backgroundColor: '#EC4899' },
    { id: 'sleep', label: '자고 싶어요', category: 'needs', icon: <Moon className="w-8 h-8" />, backgroundColor: '#6366F1' },
    { id: 'outside', label: '밖에 나가요', category: 'needs', icon: <Sun className="w-8 h-8" />, backgroundColor: '#FBBF24' },

    // 감정
    { id: 'happy', label: '기뻐요', category: 'feelings', icon: <Heart className="w-8 h-8" />, backgroundColor: '#F472B6' },
    { id: 'sad', label: '슬퍼요', category: 'feelings', icon: <Heart className="w-8 h-8" />, backgroundColor: '#60A5FA' },
    { id: 'angry', label: '화나요', category: 'feelings', icon: <Heart className="w-8 h-8" />, backgroundColor: '#EF4444' },
    { id: 'scared', label: '무서워요', category: 'feelings', icon: <Heart className="w-8 h-8" />, backgroundColor: '#A78BFA' },
    { id: 'love', label: '사랑해요', category: 'feelings', icon: <Heart className="w-8 h-8" />, backgroundColor: '#F43F5E' },
    { id: 'tired', label: '피곤해요', category: 'feelings', icon: <Moon className="w-8 h-8" />, backgroundColor: '#94A3B8' },

    // 행동
    { id: 'play', label: '놀아요', category: 'actions', icon: <Play className="w-8 h-8" />, backgroundColor: '#22C55E' },
    { id: 'read', label: '책 읽어요', category: 'actions', icon: <Book className="w-8 h-8" />, backgroundColor: '#8B5CF6' },
    { id: 'watch', label: 'TV 봐요', category: 'actions', icon: <Tv className="w-8 h-8" />, backgroundColor: '#3B82F6' },
    { id: 'music', label: '음악 들어요', category: 'actions', icon: <Music className="w-8 h-8" />, backgroundColor: '#EC4899' },
    { id: 'call', label: '전화해요', category: 'actions', icon: <Phone className="w-8 h-8" />, backgroundColor: '#14B8A6' },
    { id: 'drive', label: '차 타요', category: 'actions', icon: <Car className="w-8 h-8" />, backgroundColor: '#F59E0B' },

    // 장소
    { id: 'home', label: '집', category: 'places', icon: <Home className="w-8 h-8" />, backgroundColor: '#F97316' },
    { id: 'school', label: '학교', category: 'places', icon: <Book className="w-8 h-8" />, backgroundColor: '#3B82F6' },
    { id: 'hospital', label: '병원', category: 'places', icon: <HelpCircle className="w-8 h-8" />, backgroundColor: '#EF4444' },
    { id: 'store', label: '마트', category: 'places', icon: <Gift className="w-8 h-8" />, backgroundColor: '#22C55E' },
    { id: 'park', label: '공원', category: 'places', icon: <Sun className="w-8 h-8" />, backgroundColor: '#84CC16' },
    { id: 'friend', label: '친구 집', category: 'places', icon: <User className="w-8 h-8" />, backgroundColor: '#A855F7' },
];

export const AACPanel: React.FC<Props> = ({ onSelectAACCard, currentCardIndex, totalCards }) => {
    const [selectedCategory, setSelectedCategory] = React.useState('basic');

    const filteredCards = AAC_CARDS.filter(card => card.category === selectedCategory);

    return (
        <div className="space-y-4">
            {/* 현재 진행 상태 */}
            {currentCardIndex !== undefined && totalCards !== undefined && (
                <div className="bg-[#5500FF]/10 rounded-xl p-3 border border-[#5500FF]/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[#5500FF]">카드 채우기 진행</span>
                        <span className="text-xs font-bold text-[#5500FF]">{currentCardIndex + 1} / {totalCards}</span>
                    </div>
                    <div className="w-full h-2 bg-[#5500FF]/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#5500FF] transition-all duration-300"
                            style={{ width: `${((currentCardIndex + 1) / totalCards) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* 안내 메시지 */}
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 text-center">
                카드를 선택하면 자동으로 다음 칸으로 이동합니다
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
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: card.backgroundColor }}
                        >
                            {card.icon}
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
