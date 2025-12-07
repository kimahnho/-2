/**
 * AAC 카드 타입 정의
 * AAC (Augmentative and Alternative Communication) 카드 시스템
 */

export interface AACCard {
    id: string;
    label: string;
    imageUrl?: string;
    category: string;
    createdAt: number;
    isCustom: boolean; // 사용자 생성 여부
}

export interface AACCategory {
    id: string;
    name: string;
    icon: string;
}

export interface AACBoard {
    id: string;
    name: string;
    gridSize: number; // 2~8
    cards: (string | null)[][]; // 카드 ID 2D 배열
    sentenceCards: string[]; // 문장 구성 카드 ID 배열
}

// 기본 카테고리
export const AAC_CATEGORIES: AACCategory[] = [
    { id: 'action', name: '행동', icon: '🏃' },
    { id: 'emotion', name: '감정', icon: '😊' },
    { id: 'food', name: '음식', icon: '🍎' },
    { id: 'place', name: '장소', icon: '🏠' },
    { id: 'object', name: '사물', icon: '📦' },
    { id: 'person', name: '사람', icon: '👤' },
    { id: 'time', name: '시간', icon: '⏰' },
    { id: 'greeting', name: '인사', icon: '👋' },
    { id: 'question', name: '질문', icon: '❓' },
    { id: 'response', name: '대답', icon: '💬' },
];

// 기본 AAC 카드 (플레이스홀더 - 이미지는 추후 추가)
export const DEFAULT_AAC_CARDS: AACCard[] = [
    // 인사
    { id: 'hi', label: '안녕', category: 'greeting', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'bye', label: '안녕히 가세요', category: 'greeting', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'thanks', label: '감사합니다', category: 'greeting', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'sorry', label: '미안해요', category: 'greeting', imageUrl: '', createdAt: Date.now(), isCustom: false },

    // 대답
    { id: 'yes', label: '네', category: 'response', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'no', label: '아니요', category: 'response', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'maybe', label: '모르겠어요', category: 'response', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'wait', label: '잠깐만요', category: 'response', imageUrl: '', createdAt: Date.now(), isCustom: false },

    // 감정
    { id: 'happy', label: '행복해요', category: 'emotion', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'sad', label: '슬퍼요', category: 'emotion', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'angry', label: '화나요', category: 'emotion', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'scared', label: '무서워요', category: 'emotion', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'tired', label: '피곤해요', category: 'emotion', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'excited', label: '신나요', category: 'emotion', imageUrl: '', createdAt: Date.now(), isCustom: false },

    // 행동
    { id: 'eat', label: '먹다', category: 'action', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'drink', label: '마시다', category: 'action', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'play', label: '놀다', category: 'action', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'go', label: '가다', category: 'action', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'come', label: '오다', category: 'action', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'sleep', label: '자다', category: 'action', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'study', label: '공부하다', category: 'action', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'help', label: '도와주세요', category: 'action', imageUrl: '', createdAt: Date.now(), isCustom: false },

    // 음식
    { id: 'water', label: '물', category: 'food', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'rice', label: '밥', category: 'food', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'snack', label: '간식', category: 'food', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'fruit', label: '과일', category: 'food', imageUrl: '', createdAt: Date.now(), isCustom: false },

    // 장소
    { id: 'home', label: '집', category: 'place', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'school', label: '학교', category: 'place', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'bathroom', label: '화장실', category: 'place', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'outside', label: '밖', category: 'place', imageUrl: '', createdAt: Date.now(), isCustom: false },

    // 사람
    { id: 'me', label: '나', category: 'person', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'mom', label: '엄마', category: 'person', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'dad', label: '아빠', category: 'person', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'teacher', label: '선생님', category: 'person', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'friend', label: '친구', category: 'person', imageUrl: '', createdAt: Date.now(), isCustom: false },

    // 질문
    { id: 'what', label: '뭐?', category: 'question', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'where', label: '어디?', category: 'question', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'when', label: '언제?', category: 'question', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'why', label: '왜?', category: 'question', imageUrl: '', createdAt: Date.now(), isCustom: false },
    { id: 'who', label: '누구?', category: 'question', imageUrl: '', createdAt: Date.now(), isCustom: false },
];
