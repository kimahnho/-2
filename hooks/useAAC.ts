/**
 * useAAC - AAC 카드 관련 로직
 * MECE: AAC 카드 삽입, 문장 빌더 모드, 탭 전환만 담당
 */

import { useState, useEffect, useCallback } from 'react';
import { AACCard } from '../components/toolbar/AACPanel';
import { TabType } from '../types';
import { trackAACCardSelected } from '../services/mixpanelService';
import { convertCloudinaryToBase64 } from '../utils/imageUtils';

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
    const handleSelectAACCard = useCallback(async (card: AACCard) => {
        // 원본 이모지 (최후의 fallback용)
        const originalEmoji = card.emoji || '❓';

        // ★ 이미지 결정 로직:
        let imageToUse: string;
        if (card.cloudinaryUrl) {
            const base64Result = await convertCloudinaryToBase64(card.cloudinaryUrl, undefined);
            imageToUse = base64Result || card.cloudinaryUrl;
        } else {
            imageToUse = originalEmoji;
        }

        // 문장 빌더 모드가 활성화되어 있으면 해당 영역에 카드 추가
        if (sentenceBuilderId) {
            const sentenceArea = elements.find(el => el.id === sentenceBuilderId);
            if (sentenceArea?.metadata?.isAACSentenceArea) {
                addSentenceItem(sentenceBuilderId, imageToUse, card.label || '');
                trackAACCardSelected(card.id, card.category);
                return;
            }
        }

        // 선택된 요소 확인 (첫 번째 요소)
        const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
        const selectedEl = selectedId ? elements.find(el => el.id === selectedId) : null;

        // 문장 구성 영역 선택 시: 카드 추가 (prioritize builder behavior)
        if (selectedEl?.metadata?.isAACSentenceArea) {
            addSentenceItem(selectedId!, imageToUse, card.label || '');
            return;
        }

        const cardId = `aac-card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        let x, y, width, height, zIndex;

        if (selectedEl) {
            // 선택된 요소 있으면 위치/크기/zIndex 계승 (교체)
            x = selectedEl.x;
            y = selectedEl.y;
            width = selectedEl.width;
            height = selectedEl.height;
            zIndex = selectedEl.zIndex;
        } else {
            // 없으면 새 위치 계산
            const existingCards = elements.filter(
                el => el.pageId === activePageId && el.metadata?.isAACCard
            ).length;
            const offset = existingCards * 30;
            x = 100 + offset;
            y = 100 + offset;
            width = 120;
            height = 144;
            zIndex = 100 + existingCards;
        }

        const newCard = {
            id: cardId,
            type: 'card' as const,
            x,
            y,
            width,
            height,
            backgroundColor: '#ffffff',
            borderRadius: 12,
            borderWidth: 2,
            borderColor: '#E5E7EB',
            rotation: 0,
            zIndex: zIndex || (100 + elements.length),
            pageId: activePageId,
            metadata: {
                isAACCard: true,
                aacRow: 0,
                aacCol: 0,
                aacIndex: 0, // 인덱스 관리는 복잡하므로 0으로 초기화하거나 재계산 필요하지만 일단 0
                aacData: {
                    emoji: imageToUse,
                    label: card.label,
                    isFilled: true,
                    isCloudinaryImage: !!card.cloudinaryUrl,
                    fontSize: selectedEl?.metadata?.aacData?.fontSize || 20,
                    fontWeight: selectedEl?.metadata?.aacData?.fontWeight || 400,
                    color: selectedEl?.metadata?.aacData?.color || '#000000',
                    symbolScale: selectedEl?.metadata?.aacData?.symbolScale || 0.7,
                    labelPosition: (selectedEl?.metadata?.aacData?.labelPosition as 'above' | 'below' | 'none') || 'below'
                }
            }
        };

        let nextElements = [...elements];
        // 선택된 요소가 있으면 제거하고 그 자리에 새 카드 넣음 (교체)
        if (selectedEl) {
            nextElements = nextElements.filter(el => el.id !== selectedId);
        }
        nextElements.push(newCard as any);

        updateElements(nextElements);
        setSelectedIds([cardId]);
        trackAACCardSelected(card.id, card.category);

    }, [sentenceBuilderId, elements, selectedIds, activePageId, updateElements, setSelectedIds]);

    return {
        currentAACCardIndex,
        totalAACCards,
        handleSelectAACCard,
        handleCanvasDoubleClick
    };
};
