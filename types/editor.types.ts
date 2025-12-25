/**
 * Editor Types - 에디터 관련 타입 정의
 * 디자인 요소, 페이지, 캐릭터, 감정 카드
 * @module types/editor
 */

export type ElementType = 'text' | 'image' | 'shape' | 'card' | 'line' | 'arrow' | 'circle';
export type TabType = 'design' | 'templates' | 'elements' | 'text' | 'uploads' | 'emotions' | 'aac';

export interface DesignElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    content?: string;
    richTextHtml?: string; // HTML 형식 리치 텍스트 저장
    backgroundColor?: string;
    backgroundImage?: string;

    // Image Editing Properties
    backgroundPosition?: { x: number; y: number };
    backgroundScale?: number;

    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number;
    textAlign?: 'left' | 'center' | 'right';
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    arrowHeadType?: 'triangle' | 'circle' | 'square' | 'none';
    opacity?: number;
    zIndex: number;
    pageId?: string;
    isPassThrough?: boolean;
    isEmotionPlaceholder?: boolean;
    metadata?: {
        isAACCard?: boolean;
        aacRow?: number;
        aacCol?: number;
        aacIndex?: number;
        // AAC 카드 데이터 (통합 구조)
        aacData?: {
            emoji?: string;      // 이모지 (예: "🎁")
            label?: string;      // 라벨 (예: "선물")
            isFilled?: boolean;  // 카드가 채워졌는지 여부
            fontSize?: number;   // 라벨 폰트 크기
            fontWeight?: number; // 라벨 폰트 두께
            color?: string;      // 라벨 폰트 색상
        };
        isAACSentenceArea?: boolean;
        isAACSentenceItem?: boolean;
        parentSentenceAreaId?: string;
        itemCount?: number;
        [key: string]: any;
    };
}

export interface Page {
    id: string;
    orientation?: 'portrait' | 'landscape';
}

export interface EmotionCard {
    id: string;
    label: string;
    imageUrl: string;
    createdAt: number;
}

export interface CharacterProfile {
    id: string;
    name: string;
    description: string;
    baseImageUrl?: string;
    style: 'character' | 'realistic' | 'emoji';
    emotions: EmotionCard[];
}
