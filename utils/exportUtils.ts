
import html2canvas from 'html2canvas';

// 폰트 URL들을 인라인으로 로드하기 위한 헬퍼 함수
const loadFontsForExport = async (): Promise<string> => {
  const fontUrl = "https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Cute+Font&family=Do+Hyeon&family=Fredoka:wght@300;400;500;600&family=Gaegu&family=Gowun+Batang&family=Gowun+Dodum&family=Inter:wght@400;500;600&family=Nanum+Gothic:wght@400;700&family=Nanum+Myeongjo:wght@400;700&family=Nanum+Pen+Script&family=Noto+Sans+KR:wght@400;500;700&family=Sunflower:wght@300;500;700&display=swap";

  try {
    const response = await fetch(fontUrl);
    const cssText = await response.text();

    // CSS 내의 url()들을 추출하고 폰트 파일을 base64로 변환
    const urlRegex = /url\(([^)]+)\)/g;
    let match;
    const urls = new Set<string>();

    while ((match = urlRegex.exec(cssText)) !== null) {
      urls.add(match[1].replace(/['"]/g, ''));
    }

    // 폰트 파일을 base64로 변환하여 인라인화
    const fontPromises = Array.from(urls).map(async (url) => {
      try {
        const fontResponse = await fetch(url);
        const fontBlob = await fontResponse.blob();
        return new Promise<{ url: string; dataUrl: string }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({ url, dataUrl: reader.result as string });
          };
          reader.readAsDataURL(fontBlob);
        });
      } catch {
        return { url, dataUrl: url };
      }
    });

    const fontResults = await Promise.all(fontPromises);
    let inlinedCss = cssText;

    fontResults.forEach(({ url, dataUrl }) => {
      inlinedCss = inlinedCss.replace(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), dataUrl);
    });

    return inlinedCss;
  } catch {
    // 폴백: 빈 문자열 반환
    return '';
  }
};

export const downloadPageAsImage = async (
  pageId: string,
  fileName: string = 'design'
): Promise<void> => {
  const pageContainer = document.getElementById(`page-container-${pageId}`);
  if (!pageContainer) return;

  try {
    // Target the inner container usually used for printing/display to ignore UI overlays if any
    const target = pageContainer.querySelector('.print-container') as HTMLElement;

    // Wait for fonts and images to load
    await document.fonts.ready;

    // 폰트 CSS를 미리 로드
    const fontCss = await loadFontsForExport();

    // Temporarily hide selection UI elements
    const selectionElements = (target || pageContainer).querySelectorAll('[class*="border-[#5500FF]"]');
    selectionElements.forEach(el => (el as HTMLElement).style.visibility = 'hidden');

    // Capture with high resolution and proper settings for emoji/fonts
    const canvas = await html2canvas(target || pageContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      removeContainer: true,
      onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
        // 폰트 CSS를 클론된 문서에 추가
        const fontStyle = clonedDoc.createElement('style');
        fontStyle.innerHTML = fontCss;
        clonedDoc.head.appendChild(fontStyle);

        // 기본 스타일 추가 (개별 폰트 설정은 유지)
        const baseStyle = clonedDoc.createElement('style');
        baseStyle.innerHTML = `
          .print-container * { 
            visibility: visible !important; 
          }
          .print-container {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        `;
        clonedDoc.head.appendChild(baseStyle);

        // 클론된 요소의 모든 텍스트 요소에서 인라인 스타일의 font-family 보존
        const textElements = clonedElement.querySelectorAll('[style*="font-family"]');
        textElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const computedStyle = window.getComputedStyle(el);
          const fontFamily = computedStyle.fontFamily;
          if (fontFamily) {
            // 이모지 폰트 폴백 추가
            htmlEl.style.fontFamily = `${fontFamily}, 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji'`;
          }
        });

        // 이미지 요소들의 크로스오리진 설정
        const images = clonedElement.querySelectorAll('img');
        images.forEach((img) => {
          img.crossOrigin = 'anonymous';
        });
      }
    });

    // Restore selection UI visibility
    selectionElements.forEach(el => (el as HTMLElement).style.visibility = '');

    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error("Export failed:", error);
    throw new Error("이미지 저장에 실패했습니다.");
  }
};

export const printCanvas = () => {
  window.print();
};
