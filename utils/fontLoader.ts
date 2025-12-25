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

// CDN에서 TTF 파일 로드 (jsDelivr를 통한 Google Fonts mirror)
const FONT_URLS: Record<string, string> = {
    // 실제 등록할 한글 폰트들 (TTF 파일)
    'GowunDodum': 'https://cdn.jsdelivr.net/gh/nicennnnnnnlee/nicennnnnnnlee.github.io@master/fonts/GowunDodum-Regular.ttf',
    'NotoSansKR': 'https://cdn.jsdelivr.net/gh/nicennnnnnnlee/nicennnnnnnlee.github.io@master/fonts/NotoSansKR-Regular.ttf',
    'NanumGothic': 'https://cdn.jsdelivr.net/gh/nicennnnnnnlee/nicennnnnnnlee.github.io@master/fonts/NanumGothic-Regular.ttf',
};

/**
 * PRESET_FONTS의 value와 jsPDF 폰트 이름 매핑
 * style.constants.ts의 PRESET_FONTS와 정확히 동기화
 */
const FONT_MAPPING: Record<string, string> = {
    // 기본 본문용 폰트
    "gowun dodum": 'GowunDodum',           // 고운 돋움
    "noto sans kr": 'NotoSansKR',          // 노토 산스 KR
    "nanum gothic": 'NanumGothic',         // 나눔고딕
    "nanum myeongjo": 'NanumGothic',       // 나눔명조 → 나눔고딕으로 대체

    // 제목/강조용 폰트
    "black han sans": 'NotoSansKR',        // 블랙 한 산스 → Noto Sans KR로 대체
    "do hyeon": 'NotoSansKR',              // 도현 → Noto Sans KR로 대체
    "sunflower": 'NotoSansKR',             // 조선일보명조 → Noto Sans KR로 대체

    // 손글씨/귀여운 폰트
    "nanum pen script": 'NanumGothic',     // 나눔손글씨 펜 → 나눔고딕으로 대체
    "gaegu": 'GowunDodum',                 // 개구쟁이 → 고운 돋움으로 대체
    "cute font": 'GowunDodum',             // 귀여운 폰트 → 고운 돋움으로 대체
    "gowun batang": 'GowunDodum',          // 고운 바탕 → 고운 돋움으로 대체

    // 영문 폰트
    "fredoka": 'helvetica',                // 프레도카 → helvetica
    "inter": 'helvetica',                  // Inter → helvetica
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
                pdf.addFont(`${fontName}.ttf`, fontName, 'normal');
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
            pdf.addFont(`${fontName}.ttf`, fontName, 'normal');
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
