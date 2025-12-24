/**
 * useAAC - AAC 카드 관련 로직
 * MECE: AAC 카드 삽입, 문장 빌더 모드, 탭 전환만 담당
 */

import { useState, useEffect, useCallback } from 'react';
import { AACCard } from '../components/toolbar/AACPanel';
import { TabType } from '../types';
import { trackAACCardSelected } from '../services/mixpanelService';

interface UseAACProps {
    elements: any[];
    selectedIds: string[];
    activePageId: string;
    activeTab: TabType | null;
    setActiveTab: (tab: TabType) => void;
    updateElements: (elements: any[], commit?: boolean) => void;
    setSelectedIds: (ids: string[]) => void;
}

interface UseAACReturn {
    currentAACCardIndex: number | undefined;
    totalAACCards: number | undefined;
    handleSelectAACCard: (card: AACCard) => void;
    handleCanvasDoubleClick: () => void;
}

export const useAAC = ({
    elements,
    selectedIds,
    activePageId,
    activeTab,
    setActiveTab,
    updateElements,
    setSelectedIds
}: UseAACProps): UseAACReturn => {
    const [currentAACCardIndex, setCurrentAACCardIndex] = useState<number | undefined>(undefined);
    const [totalAACCards, setTotalAACCards] = useState<number | undefined>(undefined);
    const [sentenceBuilderId, setSentenceBuilderId] = useState<string | null>(null);

    // 문장 구성 영역 더블클릭 핸들러
    const handleCanvasDoubleClick = useCallback(() => {
        if (selectedIds.length === 1) {
            const el = elements.find(e => e.id === selectedIds[0]);
            if (el?.metadata?.isAACSentenceArea) {
                setSentenceBuilderId(el.id);
            }
        }
    }, [selectedIds, elements]);

    // 문장 빌더 모드 로직 (캔버스 내 카드 클릭 감지)
    useEffect(() => {
        if (!sentenceBuilderId) return;

        // 선택 해제 시 모드 종료 (빈 공간 클릭)
        if (selectedIds.length === 0) {
            setSentenceBuilderId(null);
            return;
        }

        // 자기 자신(문장 영역) 선택 시 유지
        if (selectedIds[0] === sentenceBuilderId) return;

        const selectedEl = elements.find(el => el.id === selectedIds[0]);

        // AAC 카드 선택 시 아이템 추가
        if (selectedEl?.metadata?.isAACCard && selectedEl.metadata.aacIndex !== undefined) {
            const aacData = selectedEl.metadata?.aacData;
            const emoji = aacData?.emoji || '❓';
            const label = aacData?.label || '';
            addSentenceItem(sentenceBuilderId, emoji, label);
        } else {
            // 엉뚱한 요소 클릭 시 모드 종료
            setSentenceBuilderId(null);
        }
    }, [selectedIds, sentenceBuilderId]);

    // AAC 카드 또는 감정 카드 선택 시 자동 탭 전환
    useEffect(() => {
        if (selectedIds.length === 1) {
            const selectedId = selectedIds[0];
            const selectedEl = elements.find(el => el.id === selectedId);

            // AAC 요소 (카드 또는 문장 영역) 선택 시 'aac' 탭으로 전환
            const isAACCard = selectedEl?.metadata?.isAACCard && selectedEl.metadata.aacIndex !== undefined;
            const isSentenceArea = selectedEl?.metadata?.isAACSentenceArea;

            if (isAACCard || isSentenceArea) {
                if (activeTab !== 'aac') setActiveTab('aac');

                // 문장 영역 선택 시 자동으로 빌더 모드 활성화
                if (isSentenceArea) {
                    setSentenceBuilderId(selectedId);
                }

                // 카드 선택 시 진행도 표시
                if (isAACCard) {
                    const aacCards = elements
                        .filter(el => el.pageId === activePageId && el.metadata?.isAACCard && el.type === 'card' && el.metadata.aacIndex !== undefined)
                        .sort((a, b) => (a.metadata!.aacIndex!) - (b.metadata!.aacIndex!));

                    setTotalAACCards(aacCards.length);

                    const currentIdx = selectedEl!.metadata!.aacIndex;
                    const isValid = aacCards.some(c => c.metadata!.aacIndex === currentIdx);
                    if (isValid) setCurrentAACCardIndex(currentIdx);
                } else {
                    setCurrentAACCardIndex(undefined);
                    setTotalAACCards(undefined);
                }
            }

            // 감정 카드/플레이스홀더 선택 시 'emotions' 탭으로 전환
            const isEmotionCard = selectedEl?.metadata?.isEmotionPlaceholder || selectedEl?.metadata?.isEmotionCard;
            if (isEmotionCard) {
                if (activeTab !== 'emotions') setActiveTab('emotions');
            }
        }
    }, [selectedIds, elements, activePageId, activeTab, setActiveTab]);

    // 문장 구성 아이템 추가 헬퍼 함수
    const addSentenceItem = (areaId: string, emoji: string, label: string) => {
        const areaEl = elements.find(el => el.id === areaId);
        if (!areaEl) return;

        const itemCount = areaEl.metadata?.itemCount || 0;

        const ITEM_SIZE = Math.min(areaEl.height * 0.8, 50);
        const GAP = 8;
        const START_PADDING = 16;

        const nextX = areaEl.x + START_PADDING + itemCount * (ITEM_SIZE + GAP);
        const nextY = areaEl.y + (areaEl.height - ITEM_SIZE) / 2;

        if (nextX + ITEM_SIZE > areaEl.x + areaEl.width - START_PADDING) return;

        const newItemId = `sentence-card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const newItem = {
            id: newItemId,
            type: 'card' as const,
            x: nextX,
            y: nextY,
            width: ITEM_SIZE,
            height: ITEM_SIZE,
            rotation: 0,
            backgroundColor: '#ffffff',
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            zIndex: 100 + itemCount,
            pageId: activePageId,
            metadata: {
                isAACSentenceItem: true,
                parentSentenceAreaId: areaId,
                aacData: {
                    emoji: emoji,
                    label: label,
                    isFilled: true
                }
            }
        };

        let updatedElements = elements.map(el => {
            if (el.id === areaId) {
                return {
                    ...el,
                    metadata: {
                        ...el.metadata,
                        itemCount: itemCount + 1
                    }
                };
            }
            return el;
        });

        if (itemCount === 0) {
            updatedElements = updatedElements.filter(el => {
                if (el.metadata?.isAACSentencePlaceholder && el.metadata?.parentSentenceAreaId === areaId) {
                    return false;
                }
                if (el.type === 'text' && el.content === '문장 구성 영역') {
                    if (el.x >= areaEl.x && el.x <= areaEl.x + areaEl.width &&
                        el.y >= areaEl.y && el.y <= areaEl.y + areaEl.height) {
                        return false;
                    }
                }
                return true;
            });
        }

        updateElements([...updatedElements, newItem as any]);
    };

    // AAC 카드 선택 핸들러
    const handleSelectAACCard = useCallback((card: AACCard) => {
        // 문장 빌더 모드가 활성화되어 있으면 해당 영역에 카드 추가
        if (sentenceBuilderId) {
            const sentenceArea = elements.find(el => el.id === sentenceBuilderId);
            if (sentenceArea?.metadata?.isAACSentenceArea) {
                addSentenceItem(sentenceBuilderId, card.cloudinaryUrl || card.emoji || '❓', card.label || '');
                // Track AAC card selection
                trackAACCardSelected(card.id, card.category);
                return;
            }
        }

        // 헬퍼: 새 AAC 카드 생성 함수
        const createNewAACCard = () => {
            const cardId = `aac-card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            const existingCards = elements.filter(
                el => el.pageId === activePageId && el.metadata?.isAACCard
            ).length;
            const offset = existingCards * 30;

            const newCard = {
                id: cardId,
                type: 'card' as const,
                x: 100 + offset,
                y: 100 + offset,
                width: 120,
                height: 144,
                backgroundColor: '#ffffff',
                borderRadius: 12,
                borderWidth: 2,
                borderColor: '#E5E7EB',
                rotation: 0,
                zIndex: 100 + existingCards,
                pageId: activePageId,
                metadata: {
                    isAACCard: true,
                    aacRow: 0,
                    aacCol: 0,
                    aacIndex: existingCards,
                    aacData: {
                        emoji: card.cloudinaryUrl || card.emoji || '❓',
                        label: card.label,
                        isFilled: true,
                        isCloudinaryImage: !!card.cloudinaryUrl,
                        fontSize: 20,
                        fontWeight: 400,
                        color: '#000000',
                        symbolScale: 0.7,
                        labelPosition: 'below' as 'above' | 'below' | 'none'
                    }
                }
            };
            updateElements([...elements, newCard as any]);
            setSelectedIds([cardId]);
            // Track AAC card selection
            trackAACCardSelected(card.id, card.category);
        };

        // 선택된 요소가 없거나 1개가 아닌 경우: 새 AAC 카드 생성
        if (selectedIds.length !== 1) {
            createNewAACCard();
            return;
        }

        const selectedId = selectedIds[0];
        const selectedEl = elements.find(el => el.id === selectedId);

        if (!selectedEl) return;

        // 문장 구성 영역 선택 시: 카드 추가
        if (selectedEl.metadata?.isAACSentenceArea) {
            addSentenceItem(selectedId, card.cloudinaryUrl || card.emoji || '❓', card.label || '');
            return;
        }

        // 일반 AAC 카드 선택 시
        if (selectedEl.metadata?.isAACCard && selectedEl.type === 'card') {
            const isPlaceholder = !selectedEl.metadata.aacData?.isFilled;

            // 이미 채워진 카드라면 새 카드 생성
            if (!isPlaceholder) {
                createNewAACCard();
                return;
            }

            // 빈 카드(Placeholder)라면 내용을 업데이트
            const newElements = elements.map(el => {
                if (el.id === selectedId) {
                    return {
                        ...el,
                        metadata: {
                            ...el.metadata,
                            aacData: {
                                ...el.metadata?.aacData,
                                emoji: card.cloudinaryUrl || card.emoji || '❓',
                                label: card.label,
                                isFilled: true,
                                isCloudinaryImage: !!card.cloudinaryUrl
                            }
                        }
                    };
                }
                return el;
            });

            updateElements(newElements);

            // 다음 카드로 자동 이동
            const aacCards = newElements
                .filter(el => el.pageId === activePageId && el.metadata?.isAACCard && el.type === 'card' && el.metadata.aacIndex !== undefined)
                .sort((a, b) => {
                    const xDiff = a.x - b.x;
                    if (Math.abs(xDiff) > 10) return xDiff;
                    return a.y - b.y;
                });

            const currentArrayIdx = aacCards.findIndex(el => el.id === selectedId);

            if (currentArrayIdx !== -1 && currentArrayIdx < aacCards.length - 1) {
                const nextCard = aacCards[currentArrayIdx + 1];
                setTimeout(() => {
                    setSelectedIds([nextCard.id]);
                }, 100);
            }
        }
    }, [sentenceBuilderId, elements, selectedIds, activePageId, updateElements, setSelectedIds]);

    return {
        currentAACCardIndex,
        totalAACCards,
        handleSelectAACCard,
        handleCanvasDoubleClick
    };
};
