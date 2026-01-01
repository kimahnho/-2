/**
 * 한글 폰트 로더 - jsPDF용 폰트 등록
 * PRESET_FONTS (style.constants.ts)와 동기화됨
 * 모든 폰트는 OFL 라이선스 (무료 상업적 사용 가능)
 */

import { jsPDF } from 'jspdf';

// 폰트 캐시
const fontCache: Map<string, string> = new Map();
let fontsLoaded = false;

/**
 * PRESET_FONTS와 동기화된 폰트 목록
 * 
 * 서비스에서 사용 가능한 폰트:
 * 1. 고운 돋움 (Gowun Dodum)
 * 2. 노토 산스 KR (Noto Sans KR)
 * 3. 나눔고딕 (Nanum Gothic)
 * 4. 나눔명조 (Nanum Myeongjo)
 * 5. 블랙 한 산스 (Black Han Sans)
 * 6. 도현 (Do Hyeon)
 * 7. 조선일보명조 (Sunflower)
 * 8. 나눔손글씨 펜 (Nanum Pen Script)
 * 9. 개구쟁이 (Gaegu)
 * 10. 귀여운 폰트 (Cute Font)
 * 11. 고운 바탕 (Gowun Batang)
 * 12. 프레도카 (Fredoka) - 영문
 */

// Google Fonts에서 직접 제공하는 TTF 파일 URL (더 안정적)
const FONT_URLS: Record<string, string> = {
    // 실제 등록할 한글 폰트들 (TTF 파일) - Google Fonts 직접 URL
    'NotoSansKR': 'https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgm20HzDDYgA.ttf',
};

/**
 * PRESET_FONTS의 value와 jsPDF 폰트 이름 매핑
 * 모든 한글 폰트를 NotoSansKR로 통일 (안정성 보장)
 */
const FONT_MAPPING: Record<string, string> = {
    // 모든 한글 폰트 → NotoSansKR로 통일
    "gowun dodum": 'NotoSansKR',
    "noto sans kr": 'NotoSansKR',
    "nanum gothic": 'NotoSansKR',
    "nanum myeongjo": 'NotoSansKR',
    "black han sans": 'NotoSansKR',
    "do hyeon": 'NotoSansKR',
    "sunflower": 'NotoSansKR',
    "nanum pen script": 'NotoSansKR',
    "gaegu": 'NotoSansKR',
    "cute font": 'NotoSansKR',
    "gowun batang": 'NotoSansKR',

    // 영문 폰트
    "fredoka": 'helvetica',
    "inter": 'helvetica',
};

/**
 * 폰트 파일을 다운로드하여 base64로 변환
 */
async function fetchFontAsBase64(fontName: string, url: string): Promise<string> {
    if (fontCache.has(fontName)) {
        return fontCache.get(fontName)!;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${fontName}`);

        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                fontCache.set(fontName, base64);
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn(`폰트 로드 실패 (${fontName}):`, error);
        throw error;
    }
}

/**
 * jsPDF에 한글 폰트들 등록
 * PRESET_FONTS에서 사용하는 모든 한글 폰트 지원
 */
export async function registerKoreanFont(pdf: jsPDF): Promise<void> {
    if (fontsLoaded) {
        // 이미 로드된 폰트 재사용
        for (const [fontName, base64] of fontCache.entries()) {
            try {
                pdf.addFileToVFS(`${fontName}.ttf`, base64);
                pdf.addFont(`${fontName}.ttf`, fontName, 'normal', 'Identity-H');
            } catch {
                // 이미 등록된 경우 무시
            }
        }
        return;
    }

    // 모든 폰트 병렬 로드
    const loadPromises = Object.entries(FONT_URLS).map(async ([fontName, url]) => {
        try {
            const base64 = await fetchFontAsBase64(fontName, url);
            pdf.addFileToVFS(`${fontName}.ttf`, base64);
            pdf.addFont(`${fontName}.ttf`, fontName, 'normal', 'Identity-H');
            console.log(`폰트 등록 완료: ${fontName}`);
        } catch (error) {
            console.warn(`폰트 등록 실패 (${fontName}):`, error);
        }
    });

    await Promise.all(loadPromises);
    fontsLoaded = true;
}

/**
 * 폰트 이름을 jsPDF 호환 이름으로 매핑
 * PRESET_FONTS의 value 값을 받아서 jsPDF 폰트 이름 반환
 */
export function mapFontToJsPDF(fontFamily: string | undefined): string {
    if (!fontFamily) return 'NotoSansKR';

    // fontFamily에서 폰트 이름만 추출 (예: "'Gowun Dodum', sans-serif" → "gowun dodum")
    const font = fontFamily.toLowerCase().replace(/['"]/g, '').split(',')[0].trim();

    // 매핑 테이블에서 찾기
    for (const [key, value] of Object.entries(FONT_MAPPING)) {
        if (font.includes(key)) {
            return value;
        }
    }

    // 매핑되지 않은 폰트는 기본 한글 폰트 사용
    return 'NotoSansKR';
}
