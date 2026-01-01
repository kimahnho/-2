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
    backgroundScaleX?: number; // Independent horizontal scale (1 = 100%)
    backgroundScaleY?: number; // Independent vertical scale (1 = 100%)

    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number;
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline' | 'line-through' | 'underline line-through';
    textAlign?: 'left' | 'center' | 'right';
    letterSpacing?: number; // 자간 (em 단위, 0 = 기본, 양수 = 넓게, 음수 = 좁게)
    lineHeight?: number; // 행간 (비율, 1 = 100%, 1.5 = 150%)
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    borderDashScale?: number; // 점선/파선 간격 비율 (기본 1)
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
    groupId?: string; // Grouping Identifier
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

export interface TextStyle {
    fontFamily: string;
    fontSize: number;
    color: string;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    isStrikethrough: boolean;
}

export interface TextCommand {
    type: 'fontName' | 'fontSize' | 'foreColor' | 'bold' | 'italic' | 'underline' | 'strikethrough';
    value?: string | number | boolean;
    id: string;
}
