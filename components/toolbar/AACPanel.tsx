/**
 * AACPanel - AAC 카드 선택 패널
 * AAC 템플릿의 카드를 채우기 위한 카드 목록 표시
 * 
 * 카테고리:
 * - 음식 (Food)
 * - 동물 (Animal)
 * - 옷 (Clothes)
 * (Supabase `aac_cards` 테이블에서 동적으로 로드됨)
 */

import React, { useEffect, useState } from 'react';
import { Utensils, Search, X, PawPrint, Shirt, Loader2, Activity } from 'lucide-react';
import { fetchAACCards } from '../../services/aacService';

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

type CategoryType = 'food' | 'animal' | 'clothes' | 'verb';

// ========== 컴포넌트 ==========

export const AACPanel: React.FC<Props> = ({ onSelectAACCard }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<CategoryType>('food');
    const [aacCards, setAacCards] = useState<AACCard[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // 카테고리별 카드 데이터 로드
    useEffect(() => {
        const loadCards = async () => {
            setIsLoading(true);
            try {
                const cards = await fetchAACCards(activeCategory);
                // 서비스의 카드 데이터를 컴포넌트 타입으로 변환
                const mappedCards: AACCard[] = cards.map(card => ({
                    id: card.slug, // slug를 id로 사용 (기존 로직 호환성)
                    label: card.label,
                    category: card.category,
                    emoji: card.emoji,
                    cloudinaryUrl: card.cloudinaryUrl
                }));
                setAacCards(mappedCards);
            } catch (error) {
                console.error('Failed to load AAC cards:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCards();
    }, [activeCategory]);

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
        { id: 'food' as CategoryType, label: '음식', icon: Utensils },
        { id: 'animal' as CategoryType, label: '동물', icon: PawPrint },
        { id: 'clothes' as CategoryType, label: '옷', icon: Shirt },
        { id: 'verb' as CategoryType, label: '행동', icon: Activity },
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
                    </button>
                ))}
            </div>

            {/* 검색 */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder={`${activeCategory === 'food' ? '음식' : activeCategory === 'animal' ? '동물' : activeCategory === 'clothes' ? '옷' : '행동'} 검색...`}
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
            <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                <span>
                    {searchQuery
                        ? `"${searchQuery}" 검색 결과: ${filteredCards.length}개`
                        : '카드를 선택하면 자동으로 다음 칸으로 이동합니다'}
                </span>
                {/* 로딩 인디케이터 */}
                {isLoading && <Loader2 className="w-3 h-3 animate-spin text-[#5500FF]" />}
            </div>

            {/* 카드 그리드 */}
            {isLoading && aacCards.length === 0 ? (
                <div className="grid grid-cols-2 gap-2 h-64">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-24"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2 pr-1">
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
            )}

            {/* 빈 결과 */}
            {!isLoading && filteredCards.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">"{searchQuery}"에 맞는 카드가 없습니다</p>
                </div>
            )}
        </div>
    );
};
