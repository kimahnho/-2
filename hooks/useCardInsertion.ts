/**
 * useCardInsertion - 카드 삽입 헬퍼
 * MECE: 감정 카드/AAC 빈 카드 삽입 버튼 로직만 담당
 */

interface UseCardInsertionProps {
    elements: any[];
    activePageId: string;
    updateElements: (elements: any[], commit?: boolean) => void;
    setSelectedIds: (ids: string[]) => void;
    selectedIds: string[];
}

interface UseCardInsertionReturn {
    handleAddEmotionCard: () => void;
    handleAddAACCard: () => void;
}

export const useCardInsertion = ({
    elements,
    activePageId,
    updateElements,
    setSelectedIds,
    selectedIds
}: UseCardInsertionProps): UseCardInsertionReturn => {

    // 감정 카드 삽입 - 겹치지 않게 위치 오프셋 적용 또는 선택된 요소 교체
    const handleAddEmotionCard = () => {
        const cardId = `emotion-card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        // 선택된 요소 확인 (첫 번째 요소만 고려)
        const selectedId = selectedIds.length > 0 ? selectedIds[0] : null;
        const selectedElement = selectedId ? elements.find(el => el.id === selectedId) : null;

        let x, y, width, height, zIndex;

        if (selectedElement) {
            // 선택된 요소 위치/크기 계승
            x = selectedElement.x;
            y = selectedElement.y;
            width = selectedElement.width;
            height = selectedElement.height;
            zIndex = selectedElement.zIndex;
        } else {
            // 기존 오프셋 로직
            const existingEmotionCards = elements.filter(
                el => el.pageId === activePageId && el.metadata?.isEmotionCard
            ).length;
            const offset = existingEmotionCards * 30;
            x = 100 + offset;
            y = 100 + offset;
            width = 150;
            height = 180;
            // zIndex는 자동 계산
        }

        const newCard = {
            id: cardId,
            type: 'card' as const,
            x,
            y,
            width,
            height,
            rotation: 0,
            backgroundColor: '#FFF0F5',
            borderRadius: 16,
            borderWidth: 2,
            borderColor: '#F472B6',
            borderStyle: 'solid' as const,
            zIndex: zIndex || (100 + elements.length),
            pageId: activePageId,
            isEmotionPlaceholder: true,
            metadata: {
                isEmotionCard: true,
                emotionData: {
                    imageUrl: undefined,
                    label: undefined,
                    isFilled: false
                }
            }
        };

        // 선택된 요소가 있으면 제거하고 새 카드로 교체
        let nextElements = [...elements];
        if (selectedElement) {
            nextElements = nextElements.filter(el => el.id !== selectedId);
        }
        nextElements.push(newCard as any);

        updateElements(nextElements);
        setSelectedIds([cardId]);
    };

    // AAC 카드 삽입 - 겹치지 않게 위치 오프셋 적용 또는 선택된 요소 교체
    const handleAddAACCard = () => {
        const cardId = `aac-card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        // 선택된 요소 확인
        const selectedId = selectedIds.length > 0 ? selectedIds[0] : null;
        const selectedElement = selectedId ? elements.find(el => el.id === selectedId) : null;

        let x, y, width, height, zIndex;

        if (selectedElement) {
            // 선택된 요소 위치/크기 계승
            x = selectedElement.x;
            y = selectedElement.y;
            width = selectedElement.width;
            height = selectedElement.height;
            zIndex = selectedElement.zIndex;
        } else {
            // 기존 오프셋 로직
            const existingAACCards = elements.filter(
                el => el.pageId === activePageId && el.metadata?.isAACCard && el.id.startsWith('aac-card-')
            ).length;
            const offset = existingAACCards * 30;
            x = 100 + offset;
            y = 100 + offset;
            width = 120;
            height = 144;
            // zIndex 자동 계산
        }

        const newCard = {
            id: cardId,
            type: 'card' as const,
            x,
            y,
            width,
            height,
            rotation: 0,
            backgroundColor: '#ffffff',
            borderRadius: 12,
            borderWidth: 2,
            borderColor: '#E5E7EB',
            borderStyle: 'solid' as const,
            zIndex: zIndex || (100 + elements.length),
            pageId: activePageId,
            metadata: {
                isAACCard: true,
                aacRow: 0,
                aacCol: 0,
                aacIndex: 0,
                aacData: {
                    emoji: undefined,
                    label: undefined,
                    isFilled: false,
                    fontSize: 20,
                    fontWeight: 400,
                    color: '#000000',
                    symbolScale: 0.7,
                    labelPosition: 'below' as 'above' | 'below' | 'none'
                }
            }
        };

        // 선택된 요소가 있으면 제거하고 새 카드로 교체
        let nextElements = [...elements];
        if (selectedElement) {
            nextElements = nextElements.filter(el => el.id !== selectedId);
        }
        nextElements.push(newCard as any);

        updateElements(nextElements);
        setSelectedIds([cardId]);
    };

    return {
        handleAddEmotionCard,
        handleAddAACCard
    };
};
