/**
 * Emotion Constants - 감정 관련 상수
 * 감정 카드 이모지 목록
 * @module constants/emotion
 * 
 * 이미지 소스:
 * - Cloudinary 커스텀 이미지 (우선)
 * - Twemoji (CC-BY 4.0) - 출처 표기만 필요, 상업적 사용 가능
 *   https://github.com/twitter/twemoji
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
 * Twemoji URL 생성 (CC-BY 4.0 - 출처 표기만 필요, 상업적 사용 가능)
 * @param emojiCode 이모지 코드 (예: '1f604' for 😄)
 */
const getTwemojiUrl = (emojiCode: string): string => {
    // Twemoji CDN (SVG)
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${emojiCode}.svg`;
};

/**
 * 감정 카드 정의
 * - cloudinaryUrl: Cloudinary에 업로드된 커스텀 이미지 (없으면 fallback 사용)
 * - fallbackUrl: Twemoji (CC-BY 4.0, 상업적 사용 가능, 출처 표기 필요)
 */
const EMOTION_CARD_DEFINITIONS = [
    { label: "기뻐요", emoji: "1f604", cloudinaryFile: "기뻐요.png" },       // 😄
    { label: "슬퍼요", emoji: "1f622", cloudinaryFile: "슬퍼요.png" },       // 😢
    { label: "화나요", emoji: "1f621", cloudinaryFile: "화나요.png" },       // 😡
    { label: "놀라워요", emoji: "1f632", cloudinaryFile: "놀라워요.png" },   // 😲
    { label: "싫어요", emoji: "1f44e", cloudinaryFile: "싫어요.png" },       // 👎
    { label: "무서워요", emoji: "1f628", cloudinaryFile: "무서워요.png" },   // 😨
    { label: "헷갈려요", emoji: "1f615", cloudinaryFile: "헷갈려요.png" },   // 😕
    { label: "신나요", emoji: "1f929", cloudinaryFile: "신나요.png" },       // 🤩
    { label: "힘들어요", emoji: "1f62b", cloudinaryFile: "힘들어요.png" },   // 😫
    { label: "아쉬워요", emoji: "1f61e", cloudinaryFile: "아쉬워요.png" },   // 😞
    { label: "짜증나요", emoji: "1f624", cloudinaryFile: "짜증나요.png" },   // 😤
    { label: "아파요", emoji: "1f912", cloudinaryFile: "아파요.png" },       // 🤒
    { label: "심심해요", emoji: "1f971", cloudinaryFile: "심심해요.png" },   // 🥱
    { label: "사랑해요", emoji: "1f970", cloudinaryFile: "사랑해요.png" },   // 🥰
    { label: "좋아요", emoji: "1f44d", cloudinaryFile: "좋아요.png" },       // 👍
    { label: "기다려요", emoji: "23f3", cloudinaryFile: "기다려요.png" },    // ⏳
    { label: "도와주세요", emoji: "1f198", cloudinaryFile: "도와주세요.png" }, // 🆘
    { label: "궁금해요", emoji: "1f914", cloudinaryFile: "궁금해요.png" },   // 🤔
    { label: "잘 모르겠어요", emoji: "1f937", cloudinaryFile: "잘 모르겠어요.png" }, // 🤷
    { label: "피곤해요", emoji: "1f634", cloudinaryFile: "피곤해요.png" },   // 😴
];

/**
 * EMOTION_CARDS - Cloudinary URL 우선, Twemoji fallback
 * 
 * 라이선스: Twemoji (CC-BY 4.0)
 * - 상업적 사용 가능
 * - 출처 표기 필요: "Twemoji by Twitter, CC-BY 4.0"
 */
export const EMOTION_CARDS = EMOTION_CARD_DEFINITIONS.map(def => ({
    label: def.label,
    // Cloudinary URL (이미지 업로드 후 사용됨)
    url: getCloudinaryUrl(def.cloudinaryFile),
    // Fallback URL - Twemoji (CC-BY 4.0)
    fallbackUrl: getTwemojiUrl(def.emoji),
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
