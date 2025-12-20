/**
 * Cloudinary Assets Service - 카드 에셋 관리
 * @module services/cloudinaryAssetsService
 * 
 * Cloudinary 폴더 구조:
 * muru-cards/
 * ├── emotion-cards/   (감정 카드 이미지)
 * └── aac-cards/       (AAC 카드 이미지)
 *     ├── basic/
 *     ├── needs/
 *     ├── feelings/
 *     ├── actions/
 *     └── places/
 */

// Cloudinary 설정
const CLOUD_NAME = 'dabbfycew';
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

// 폴더 경로
const FOLDERS = {
    emotionCards: 'muru-cards/emotion-cards',
    aacCards: {
        basic: 'muru-cards/aac-cards/basic',
        needs: 'muru-cards/aac-cards/needs',
        feelings: 'muru-cards/aac-cards/feelings',
        actions: 'muru-cards/aac-cards/actions',
        places: 'muru-cards/aac-cards/places'
    }
};

/**
 * 감정 카드 타입
 */
export interface EmotionCardAsset {
    id: string;
    label: string;
    url: string;
    thumbnailUrl: string;
}

/**
 * AAC 카드 타입
 */
export interface AACCardAsset {
    id: string;
    label: string;
    category: string;
    url: string;
    thumbnailUrl: string;
    backgroundColor: string;
}

/**
 * Cloudinary URL 생성 헬퍼
 * @param folder 폴더 경로
 * @param filename 파일명 (확장자 제외)
 * @param transformations 변환 옵션
 */
const getCloudinaryUrl = (
    folder: string,
    filename: string,
    transformations: string = ''
): string => {
    const transform = transformations ? `${transformations}/` : '';
    return `${BASE_URL}/${transform}${folder}/${encodeURIComponent(filename)}`;
};

/**
 * 감정 카드 목록
 * 파일명 = 라벨 (예: 기뻐요.png, 슬퍼요.png)
 */
export const CLOUDINARY_EMOTION_CARDS: EmotionCardAsset[] = [
    { id: 'happy', label: '기뻐요', url: '', thumbnailUrl: '' },
    { id: 'sad', label: '슬퍼요', url: '', thumbnailUrl: '' },
    { id: 'angry', label: '화나요', url: '', thumbnailUrl: '' },
    { id: 'surprised', label: '놀라워요', url: '', thumbnailUrl: '' },
    { id: 'scared', label: '무서워요', url: '', thumbnailUrl: '' },
    { id: 'confused', label: '헷갈려요', url: '', thumbnailUrl: '' },
    { id: 'excited', label: '신나요', url: '', thumbnailUrl: '' },
    { id: 'tired', label: '힘들어요', url: '', thumbnailUrl: '' },
    { id: 'disappointed', label: '아쉬워요', url: '', thumbnailUrl: '' },
    { id: 'annoyed', label: '짜증나요', url: '', thumbnailUrl: '' },
    { id: 'sick', label: '아파요', url: '', thumbnailUrl: '' },
    { id: 'bored', label: '심심해요', url: '', thumbnailUrl: '' },
    { id: 'love', label: '사랑해요', url: '', thumbnailUrl: '' },
    { id: 'like', label: '좋아요', url: '', thumbnailUrl: '' },
    { id: 'dislike', label: '싫어요', url: '', thumbnailUrl: '' },
    { id: 'curious', label: '궁금해요', url: '', thumbnailUrl: '' },
    { id: 'sleepy', label: '피곤해요', url: '', thumbnailUrl: '' },
].map(card => ({
    ...card,
    url: getCloudinaryUrl(FOLDERS.emotionCards, card.label),
    thumbnailUrl: getCloudinaryUrl(FOLDERS.emotionCards, card.label, 'w_100,h_100,c_fill')
}));

/**
 * AAC 카드 목록 - 기본
 */
const AAC_BASIC_CARDS: Omit<AACCardAsset, 'url' | 'thumbnailUrl'>[] = [
    { id: 'yes', label: '예', category: 'basic', backgroundColor: '#22C55E' },
    { id: 'no', label: '아니오', category: 'basic', backgroundColor: '#EF4444' },
    { id: 'help', label: '도와주세요', category: 'basic', backgroundColor: '#F59E0B' },
    { id: 'more', label: '더 주세요', category: 'basic', backgroundColor: '#8B5CF6' },
    { id: 'stop', label: '그만', category: 'basic', backgroundColor: '#EF4444' },
    { id: 'wait', label: '기다려요', category: 'basic', backgroundColor: '#6366F1' },
];

/**
 * AAC 카드 목록 - 요구
 */
const AAC_NEEDS_CARDS: Omit<AACCardAsset, 'url' | 'thumbnailUrl'>[] = [
    { id: 'eat', label: '먹고 싶어요', category: 'needs', backgroundColor: '#F97316' },
    { id: 'drink', label: '마시고 싶어요', category: 'needs', backgroundColor: '#06B6D4' },
    { id: 'bathroom', label: '화장실', category: 'needs', backgroundColor: '#3B82F6' },
    { id: 'clothes', label: '옷 갈아입기', category: 'needs', backgroundColor: '#EC4899' },
    { id: 'sleep', label: '자고 싶어요', category: 'needs', backgroundColor: '#6366F1' },
    { id: 'outside', label: '밖에 나가요', category: 'needs', backgroundColor: '#FBBF24' },
];

/**
 * AAC 카드 목록 - 감정
 */
const AAC_FEELINGS_CARDS: Omit<AACCardAsset, 'url' | 'thumbnailUrl'>[] = [
    { id: 'f-happy', label: '기뻐요', category: 'feelings', backgroundColor: '#F472B6' },
    { id: 'f-sad', label: '슬퍼요', category: 'feelings', backgroundColor: '#60A5FA' },
    { id: 'f-angry', label: '화나요', category: 'feelings', backgroundColor: '#EF4444' },
    { id: 'f-scared', label: '무서워요', category: 'feelings', backgroundColor: '#A78BFA' },
    { id: 'f-love', label: '사랑해요', category: 'feelings', backgroundColor: '#F43F5E' },
    { id: 'f-tired', label: '피곤해요', category: 'feelings', backgroundColor: '#94A3B8' },
];

/**
 * AAC 카드 목록 - 행동
 */
const AAC_ACTIONS_CARDS: Omit<AACCardAsset, 'url' | 'thumbnailUrl'>[] = [
    { id: 'play', label: '놀아요', category: 'actions', backgroundColor: '#22C55E' },
    { id: 'read', label: '책 읽어요', category: 'actions', backgroundColor: '#8B5CF6' },
    { id: 'watch', label: 'TV 봐요', category: 'actions', backgroundColor: '#3B82F6' },
    { id: 'music', label: '음악 들어요', category: 'actions', backgroundColor: '#EC4899' },
    { id: 'call', label: '전화해요', category: 'actions', backgroundColor: '#14B8A6' },
    { id: 'drive', label: '차 타요', category: 'actions', backgroundColor: '#F59E0B' },
];

/**
 * AAC 카드 목록 - 장소
 */
const AAC_PLACES_CARDS: Omit<AACCardAsset, 'url' | 'thumbnailUrl'>[] = [
    { id: 'home', label: '집', category: 'places', backgroundColor: '#F97316' },
    { id: 'school', label: '학교', category: 'places', backgroundColor: '#3B82F6' },
    { id: 'hospital', label: '병원', category: 'places', backgroundColor: '#EF4444' },
    { id: 'store', label: '마트', category: 'places', backgroundColor: '#22C55E' },
    { id: 'park', label: '공원', category: 'places', backgroundColor: '#84CC16' },
    { id: 'friend', label: '친구 집', category: 'places', backgroundColor: '#A855F7' },
];

/**
 * URL이 포함된 AAC 카드 생성
 */
const createAACCardsWithUrls = (
    cards: Omit<AACCardAsset, 'url' | 'thumbnailUrl'>[],
    folder: string
): AACCardAsset[] => {
    return cards.map(card => ({
        ...card,
        url: getCloudinaryUrl(folder, card.label),
        thumbnailUrl: getCloudinaryUrl(folder, card.label, 'w_100,h_100,c_fill')
    }));
};

/**
 * 모든 AAC 카드 (Cloudinary URL 포함)
 */
export const CLOUDINARY_AAC_CARDS: AACCardAsset[] = [
    ...createAACCardsWithUrls(AAC_BASIC_CARDS, FOLDERS.aacCards.basic),
    ...createAACCardsWithUrls(AAC_NEEDS_CARDS, FOLDERS.aacCards.needs),
    ...createAACCardsWithUrls(AAC_FEELINGS_CARDS, FOLDERS.aacCards.feelings),
    ...createAACCardsWithUrls(AAC_ACTIONS_CARDS, FOLDERS.aacCards.actions),
    ...createAACCardsWithUrls(AAC_PLACES_CARDS, FOLDERS.aacCards.places),
];

/**
 * 카테고리별 AAC 카드 가져오기
 */
export const getAACCardsByCategory = (category: string): AACCardAsset[] => {
    return CLOUDINARY_AAC_CARDS.filter(card => card.category === category);
};

/**
 * 감정 카드 URL이 유효한지 확인 (이미지가 업로드되었는지)
 */
export const isCardImageAvailable = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
};

/**
 * Cloudinary에 카드를 사용할 준비가 되었는지 확인
 * (적어도 하나의 이미지가 업로드되었는지)
 */
export const checkCloudinaryCardsReady = async (): Promise<{
    emotionCards: boolean;
    aacCards: boolean;
}> => {
    // 첫 번째 카드 URL로 확인
    const emotionReady = CLOUDINARY_EMOTION_CARDS.length > 0
        ? await isCardImageAvailable(CLOUDINARY_EMOTION_CARDS[0].url)
        : false;

    const aacReady = CLOUDINARY_AAC_CARDS.length > 0
        ? await isCardImageAvailable(CLOUDINARY_AAC_CARDS[0].url)
        : false;

    return { emotionCards: emotionReady, aacCards: aacReady };
};

// AAC 카테고리 (UI 표시용)
export const AAC_CARD_CATEGORIES = [
    { id: 'basic', name: '기본' },
    { id: 'needs', name: '요구' },
    { id: 'feelings', name: '감정' },
    { id: 'actions', name: '행동' },
    { id: 'places', name: '장소' },
];
