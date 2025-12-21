/**
 * Emotion Constants - 감정 관련 상수
 * 감정 카드 이모지 목록
 * @module constants/emotion
 * 
 * 이미지 소스:
 * - Cloudinary 커스텀 이미지 (스타일별)
 * - Twemoji (CC-BY 4.0) - fallback
 * 
 * Cloudinary 폴더 구조:
 * muru-cards/emotion-cards/
 * ├── photo/       (실제 사진)
 * ├── illustration/ (그림)
 * └── line-drawing/ (선그림)
 */

// Cloudinary 설정
const CLOUDINARY_CLOUD_NAME = 'dabbfycew';
const CLOUDINARY_BASE_FOLDER = 'muru-cards/emotion-cards';

/**
 * 카드 스타일 타입
 */
export type CardStyle = 'photo' | 'illustration' | 'line-drawing';

/**
 * 캐릭터 타입 (사진 스타일용)
 */
export type CharacterType = 'boy' | 'girl';

/**
 * 스타일 옵션 (UI 표시용)
 */
export const CARD_STYLES: { id: CardStyle; name: string; icon: string }[] = [
    { id: 'photo', name: '실제 사진', icon: '📷' },
    { id: 'illustration', name: '그림', icon: '🎨' },
    { id: 'line-drawing', name: '선그림', icon: '✏️' },
];

/**
 * 캐릭터 타입 옵션 (사진 스타일용)
 */
export const CHARACTER_TYPES: { id: CharacterType; name: string; icon: string }[] = [
    { id: 'boy', name: '남자아이', icon: '👦' },
    { id: 'girl', name: '여자아이', icon: '👧' },
];

/**
 * 스타일별 Cloudinary URL 생성
 * @param style 카드 스타일
 * @param label 감정 라벨 (파일명으로 사용)
 * @param characterType 캐릭터 타입 (photo 스타일에서만 사용)
 */
const CACHE_VERSION = 'v4'; // 이미지 업데이트 시 버전 변경
const getCloudinaryUrl = (style: CardStyle, emotionId: string, characterType?: CharacterType): string => {
    // photo 스타일은 캐릭터 타입 서브폴더 사용, 영어 ID를 파일명으로
    if (style === 'photo' && characterType) {
        return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${CLOUDINARY_BASE_FOLDER}/${style}/${characterType}/${emotionId}.png?${CACHE_VERSION}`;
    }
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${CLOUDINARY_BASE_FOLDER}/${style}/${emotionId}.png?${CACHE_VERSION}`;
};

/**
 * Twemoji URL 생성 (CC-BY 4.0 - fallback)
 * @param emojiCode 이모지 코드
 */
const getTwemojiUrl = (emojiCode: string): string => {
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${emojiCode}.svg`;
};

const EMOTION_CARD_DEFINITIONS = [
    // Cloudinary에 업로드된 감정 (photo 스타일에서 표시) - 14개
    { id: 'happy', label: "기뻐요", emoji: "1f604", hasPhoto: true },
    { id: 'sad', label: "슬퍼요", emoji: "1f622", hasPhoto: true },
    { id: 'angry', label: "화나요", emoji: "1f621", hasPhoto: true },
    { id: 'surprised', label: "놀라워요", emoji: "1f632", hasPhoto: true },
    { id: 'scared', label: "무서워요", emoji: "1f628", hasPhoto: true },
    { id: 'comfortable', label: "편안해요", emoji: "1f60c", hasPhoto: true },
    { id: 'bad', label: "별로에요", emoji: "1f612", hasPhoto: true },
    { id: 'dislike', label: "싫어요", emoji: "1f44e", hasPhoto: true },
    { id: 'exhausted', label: "힘들어요", emoji: "1f62b", hasPhoto: true },
    { id: 'disappointed', label: "아쉬워요", emoji: "1f61e", hasPhoto: true },
    { id: 'sick', label: "아파요", emoji: "1f912", hasPhoto: true },
    { id: 'curious', label: "궁금해요", emoji: "1f914", hasPhoto: true },
    // 아직 업로드 안 된 감정 (illustration에서만 표시)
    { id: 'confused', label: "헷갈려요", emoji: "1f615", hasPhoto: false },
    { id: 'excited', label: "신나요", emoji: "1f929", hasPhoto: false },
    { id: 'annoyed', label: "짜증나요", emoji: "1f624", hasPhoto: true },
    { id: 'bored', label: "심심해요", emoji: "1f971", hasPhoto: false },
    { id: 'love', label: "사랑해요", emoji: "1f970", hasPhoto: false },
    { id: 'like', label: "좋아요", emoji: "1f44d", hasPhoto: false },
    { id: 'waiting', label: "기다려요", emoji: "23f3", hasPhoto: false },
    { id: 'help', label: "도와주세요", emoji: "1f198", hasPhoto: false },
    { id: 'uncertain', label: "잘 모르겠어요", emoji: "1f937", hasPhoto: false },
    { id: 'sleepy', label: "피곤해요", emoji: "1f634", hasPhoto: true },
];

/**
 * 스타일별 감정 카드 URL 가져오기
 * @param style 카드 스타일
 * @param characterType 캐릭터 타입 (photo 스타일에서만 사용)
 */
export const getEmotionCardsByStyle = (style: CardStyle, characterType?: CharacterType) => {
    // photo/line-drawing 스타일은 hasPhoto가 true인 것만 필터링
    const definitions = (style === 'photo' || style === 'line-drawing')
        ? EMOTION_CARD_DEFINITIONS.filter(def => def.hasPhoto)
        : EMOTION_CARD_DEFINITIONS;

    return definitions.map(def => ({
        id: def.id,
        label: def.label,
        url: getCloudinaryUrl(style, def.id, characterType),
        fallbackUrl: getTwemojiUrl(def.emoji),
    }));
};

/**
 * 기본 감정 카드 (Twemoji fallback 포함)
 * 하위 호환성을 위해 유지
 */
export const EMOTION_CARDS = getEmotionCardsByStyle('illustration');

/**
 * Cloudinary 이미지가 준비되었는지 확인
 * @param style 확인할 스타일
 */
export const checkEmotionCardsReady = async (style: CardStyle = 'illustration'): Promise<boolean> => {
    try {
        const cards = getEmotionCardsByStyle(style);
        const response = await fetch(cards[0].url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
};

/**
 * 라이선스 정보 (앱 정보 페이지에 표기 필요)
 */
export const EMOTION_CARDS_LICENSE = {
    name: 'Twemoji',
    author: 'Twitter',
    license: 'CC-BY 4.0',
    url: 'https://github.com/twitter/twemoji',
    attribution: 'Twemoji by Twitter, CC-BY 4.0'
};

