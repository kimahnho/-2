/**
 * useCardInsertion - 카드 삽입 헬퍼
 * MECE: 감정 카드/AAC 빈 카드 삽입 버튼 로직만 담당
 */

interface UseCardInsertionProps {
    elements: any[];
    activePageId: string;
    updateElements: (elements: any[], commit?: boolean) => void;
    setSelectedIds: (ids: string[]) => void;
}

interface UseCardInsertionReturn {
    handleAddEmotionCard: () => void;
    handleAddAACCard: () => void;
}

export const useCardInsertion = ({
    elements,
    activePageId,
    updateElements,
    setSelectedIds
}: UseCardInsertionProps): UseCardInsertionReturn => {

    // 감정 카드 삽입 - 겹치지 않게 위치 오프셋 적용
    const handleAddEmotionCard = () => {
        const cardId = `emotion-card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        // 현재 페이지의 감정 카드 개수로 오프셋 계산
        const existingEmotionCards = elements.filter(
            el => el.pageId === activePageId && el.metadata?.isEmotionCard
        ).length;
        const offset = existingEmotionCards * 30;

        const newCard = {
            id: cardId,
            type: 'card' as const,
            x: 100 + offset,
            y: 100 + offset,
            width: 150,
            height: 180,
            rotation: 0,
            backgroundColor: '#FFF0F5',
            borderRadius: 16,
            borderWidth: 2,
            borderColor: '#F472B6',
            borderStyle: 'solid' as const,
            zIndex: 100 + existingEmotionCards,
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
        updateElements([...elements, newCard as any]);
        // 카드 선택만 하고 탭은 변경하지 않음 (여러 개 추가 가능)
        setSelectedIds([cardId]);
    };

    // AAC 카드 삽입 - 겹치지 않게 위치 오프셋 적용
    const handleAddAACCard = () => {
        const cardId = `aac-card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        // 현재 페이지의 AAC 카드 개수로 오프셋 계산 (템플릿 AAC 카드는 제외, 직접 추가된 것만)
        const existingAACCards = elements.filter(
            el => el.pageId === activePageId && el.metadata?.isAACCard && el.id.startsWith('aac-card-')
        ).length;
        const offset = existingAACCards * 30;

        const newCard = {
            id: cardId,
            type: 'card' as const,
            x: 100 + offset,
            y: 100 + offset,
            width: 120,
            height: 144,
            rotation: 0,
            backgroundColor: '#ffffff',
            borderRadius: 12,
            borderWidth: 2,
            borderColor: '#E5E7EB',
            borderStyle: 'solid' as const,
            zIndex: 100 + existingAACCards,
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
        updateElements([...elements, newCard as any]);
        // 카드 선택만 하고 탭은 변경하지 않음 (여러 개 추가 가능)
        setSelectedIds([cardId]);
    };

    return {
        handleAddEmotionCard,
        handleAddAACCard
    };
};
