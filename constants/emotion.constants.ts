/**
 * Emotion Constants - 감정 관련 상수
 * 감정 카드 이모지 목록
 * @module constants/emotion
 * 
 * Cloudinary 폴더: muru-cards/emotion-cards/
 * 파일명 규칙: {label}.png (예: 기뻐요.png)
 */

// Cloudinary 설정
const CLOUDINARY_CLOUD_NAME = 'dabbfycew';
const CLOUDINARY_FOLDER = 'muru-cards/emotion-cards';

/**
 * Cloudinary URL 생성
 * @param label 감정 라벨 (파일명으로 사용)
 */
const getCloudinaryUrl = (label: string): string => {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${CLOUDINARY_FOLDER}/${encodeURIComponent(label)}`;
};

/**
 * 감정 카드 정의
 * - cloudinaryUrl: Cloudinary에 업로드된 커스텀 이미지 (없으면 fallback 사용)
 * - fallbackUrl: OpenMoji SVG (항상 사용 가능)
 */
const EMOTION_CARD_DEFINITIONS = [
    { label: "기뻐요", emoji: "1F604", cloudinaryFile: "기뻐요.png" },
    { label: "슬퍼요", emoji: "1F622", cloudinaryFile: "슬퍼요.png" },
    { label: "화나요", emoji: "1F621", cloudinaryFile: "화나요.png" },
    { label: "놀라워요", emoji: "1F632", cloudinaryFile: "놀라워요.png" },
    { label: "싫어요", emoji: "1F44E", cloudinaryFile: "싫어요.png" },
    { label: "무서워요", emoji: "1F628", cloudinaryFile: "무서워요.png" },
    { label: "헷갈려요", emoji: "1F615", cloudinaryFile: "헷갈려요.png" },
    { label: "신나요", emoji: "1F929", cloudinaryFile: "신나요.png" },
    { label: "힘들어요", emoji: "1F62B", cloudinaryFile: "힘들어요.png" },
    { label: "아쉬워요", emoji: "1F61E", cloudinaryFile: "아쉬워요.png" },
    { label: "짜증나요", emoji: "1F624", cloudinaryFile: "짜증나요.png" },
    { label: "아파요", emoji: "1F912", cloudinaryFile: "아파요.png" },
    { label: "심심해요", emoji: "1F971", cloudinaryFile: "심심해요.png" },
    { label: "사랑해요", emoji: "1F970", cloudinaryFile: "사랑해요.png" },
    { label: "좋아요", emoji: "1F44D", cloudinaryFile: "좋아요.png" },
    { label: "기다려요", emoji: "23F3", cloudinaryFile: "기다려요.png" },
    { label: "도와주세요", emoji: "1F198", cloudinaryFile: "도와주세요.png" },
    { label: "궁금해요", emoji: "1F914", cloudinaryFile: "궁금해요.png" },
    { label: "잘 모르겠어요", emoji: "1F937", cloudinaryFile: "잘 모르겠어요.png" },
    { label: "피곤해요", emoji: "1F634", cloudinaryFile: "피곤해요.png" },
];

/**
 * EMOTION_CARDS - Cloudinary URL 우선, OpenMoji fallback
 * 
 * Cloudinary에 이미지가 업로드되면 자동으로 사용됨
 * 업로드 전에는 OpenMoji SVG 사용
 */
export const EMOTION_CARDS = EMOTION_CARD_DEFINITIONS.map(def => ({
    label: def.label,
    // Cloudinary URL (이미지 업로드 후 사용됨)
    url: getCloudinaryUrl(def.cloudinaryFile),
    // Fallback URL (Cloudinary 이미지 로드 실패 시)
    fallbackUrl: `https://openmoji.org/data/color/svg/${def.emoji}.svg`,
}));

/**
 * Cloudinary 감정 카드가 준비되었는지 확인
 * (첫 번째 이미지 로드 가능 여부로 판단)
 */
export const checkEmotionCardsReady = async (): Promise<boolean> => {
    try {
        const response = await fetch(EMOTION_CARDS[0].url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
};

