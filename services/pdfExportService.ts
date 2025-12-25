/**
 * PDF Export Service - 벡터 기반 PDF 내보내기
 * html2canvas 래스터 방식 대신 jsPDF 직접 렌더링으로 용량 대폭 감소
 */

import { jsPDF } from 'jspdf';
import { DesignElement, Page } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/canvasUtils';
import { registerKoreanFont, mapFontToJsPDF } from '../utils/fontLoader';

// PDF 좌표계는 pt(포인트) 단위 사용 - A4: 595.28 x 841.89 pt
const PX_TO_PT = 72 / 96; // 1px = 0.75pt

// 색상 파싱 헬퍼
const parseColor = (color: string | undefined, defaultColor = '#000000'): { r: number; g: number; b: number } => {
    const hex = (color || defaultColor).replace('#', '');
    return {
        r: parseInt(hex.substring(0, 2), 16) || 0,
        g: parseInt(hex.substring(2, 4), 16) || 0,
        b: parseInt(hex.substring(4, 6), 16) || 0
    };
};

// px를 pt로 변환
const pxToPt = (px: number): number => px * PX_TO_PT;

// 요소에 회전 적용하여 좌표 계산
const applyRotation = (
    x: number, y: number,
    width: number, height: number,
    rotation: number
): { centerX: number; centerY: number; angle: number } => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    return { centerX: pxToPt(centerX), centerY: pxToPt(centerY), angle: rotation };
};

// 회전 변환 행렬 적용 (jsPDF 호환)
const applyRotationMatrix = (pdf: jsPDF, centerX: number, centerY: number, angleDeg: number): void => {
    const angleRad = angleDeg * Math.PI / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    // jsPDF internal API를 사용하여 변환 적용
    (pdf as any).internal.write(
        `q ${cos.toFixed(4)} ${sin.toFixed(4)} ${(-sin).toFixed(4)} ${cos.toFixed(4)} ${centerX.toFixed(2)} ${centerY.toFixed(2)} cm`
    );
};

/**
 * 텍스트 요소 렌더링
 */
const renderTextElement = (pdf: jsPDF, element: DesignElement): void => {
    if (!element.content) return;

    const color = parseColor(element.color);
    pdf.setTextColor(color.r, color.g, color.b);

    // 폰트 크기 설정 (px → pt)
    const fontSize = pxToPt(element.fontSize || 16);
    pdf.setFontSize(fontSize);

    // 한글 폰트 매핑 사용
    const fontName = mapFontToJsPDF(element.fontFamily);
    try {
        pdf.setFont(fontName);
    } catch {
        // 폰트가 없으면 기본 폰트 사용
        pdf.setFont('helvetica');
    }

    const x = pxToPt(element.x);
    const y = pxToPt(element.y);
    const width = pxToPt(element.width);
    const height = pxToPt(element.height);

    // 회전 적용
    if (element.rotation && element.rotation !== 0) {
        const { centerX, centerY, angle } = applyRotation(element.x, element.y, element.width, element.height, element.rotation);

        // 회전은 복잡하므로 현재는 생략하고 기본 위치에 렌더링
        // TODO: 회전 지원 추가
        const textX = pxToPt(element.x) + width / 2;
        const textY = pxToPt(element.y) + height / 2 + fontSize / 3;

        pdf.text(element.content, textX, textY, {
            maxWidth: width,
            align: 'center'
        });
    } else {
        // 텍스트 중앙 정렬
        const textX = x + width / 2;
        const textY = y + height / 2 + fontSize / 3; // 수직 중앙 보정

        pdf.text(element.content, textX, textY, {
            maxWidth: width,
            align: 'center'
        });
    }
};

/**
 * 도형 요소 렌더링 (shape, circle)
 */
const renderShapeElement = (pdf: jsPDF, element: DesignElement): void => {
    const x = pxToPt(element.x);
    const y = pxToPt(element.y);
    const width = pxToPt(element.width);
    const height = pxToPt(element.height);
    const borderRadius = pxToPt(element.borderRadius || 0);
    const borderWidth = pxToPt(element.borderWidth || 0);

    // 배경색 설정
    if (element.backgroundColor) {
        const bgColor = parseColor(element.backgroundColor);
        pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);
    }

    // 테두리색 설정
    if (element.borderColor && borderWidth > 0) {
        const borderColor = parseColor(element.borderColor);
        pdf.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
        pdf.setLineWidth(borderWidth);
    }

    // 회전 처리 - 현재는 회전 없이 기본 위치에 렌더링
    // TODO: 회전 지원 추가
    drawShape(pdf, x, y, width, height, element.type === 'circle', borderRadius, borderWidth > 0, !!element.backgroundColor);
};

const drawShape = (
    pdf: jsPDF,
    x: number, y: number,
    width: number, height: number,
    isCircle: boolean,
    borderRadius: number,
    hasBorder: boolean,
    hasFill: boolean
): void => {
    const style = hasFill && hasBorder ? 'FD' : hasFill ? 'F' : hasBorder ? 'D' : '';

    if (isCircle) {
        // 원형
        const radius = Math.min(width, height) / 2;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        pdf.circle(centerX, centerY, radius, style as 'F' | 'D' | 'FD');
    } else if (borderRadius > 0) {
        // 둥근 모서리 사각형
        pdf.roundedRect(x, y, width, height, borderRadius, borderRadius, style as 'F' | 'D' | 'FD');
    } else {
        // 일반 사각형
        pdf.rect(x, y, width, height, style as 'F' | 'D' | 'FD');
    }
};

/**
 * 선/화살표 요소 렌더링
 */
const renderLineElement = (pdf: jsPDF, element: DesignElement): void => {
    const x = pxToPt(element.x);
    const y = pxToPt(element.y);
    const width = pxToPt(element.width);
    const height = pxToPt(element.height);
    const borderWidth = pxToPt(element.borderWidth || 2);

    const strokeColor = parseColor(element.borderColor);
    pdf.setDrawColor(strokeColor.r, strokeColor.g, strokeColor.b);
    pdf.setLineWidth(borderWidth);

    // 선 스타일 (dashed, dotted)
    if (element.borderStyle === 'dashed') {
        pdf.setLineDashPattern([borderWidth * 4, borderWidth * 2], 0);
    } else if (element.borderStyle === 'dotted') {
        pdf.setLineDashPattern([borderWidth, borderWidth * 2], 0);
    } else {
        pdf.setLineDashPattern([], 0);
    }

    // 회전 처리 - 현재는 회전 없이 기본 위치에 렌더링
    // TODO: 회전 지원 추가

    // 가로 중앙에 선 그리기
    const lineY = y + height / 2;
    pdf.line(x, lineY, x + width, lineY);

    // 화살표 머리
    if (element.type === 'arrow' && element.arrowHeadType && element.arrowHeadType !== 'none') {
        drawArrowHead(pdf, x + width, lineY, 0, element.arrowHeadType, strokeColor, borderWidth);
    }

    // 선 스타일 리셋
    pdf.setLineDashPattern([], 0);
};

const drawArrowHead = (
    pdf: jsPDF,
    tipX: number, tipY: number,
    angle: number,
    type: string,
    color: { r: number; g: number; b: number },
    lineWidth: number
): void => {
    pdf.setFillColor(color.r, color.g, color.b);
    const size = lineWidth * 4;

    if (type === 'triangle') {
        // 삼각형 화살표
        pdf.triangle(
            tipX, tipY,
            tipX - size, tipY - size / 2,
            tipX - size, tipY + size / 2,
            'F'
        );
    } else if (type === 'circle') {
        pdf.circle(tipX - size / 2, tipY, size / 2, 'F');
    } else if (type === 'square') {
        pdf.rect(tipX - size, tipY - size / 2, size, size, 'F');
    }
};

/**
 * 이미지 요소 렌더링 - base64 또는 URL에서 로드
 */
const renderImageElement = async (pdf: jsPDF, element: DesignElement): Promise<void> => {
    const imageUrl = element.backgroundImage || element.content;
    if (!imageUrl) return;

    const x = pxToPt(element.x);
    const y = pxToPt(element.y);
    const width = pxToPt(element.width);
    const height = pxToPt(element.height);

    try {
        // 이미지를 base64로 변환
        const imgData = await loadImageAsBase64(imageUrl);

        // 회전 처리 - 현재는 회전 없이 기본 위치에 렌더링
        // TODO: 회전 지원 추가
        pdf.addImage(imgData, 'JPEG', x, y, width, height);
    } catch (error) {
        console.warn('이미지 로드 실패:', imageUrl, error);
        // 이미지 로드 실패 시 회색 박스 표시
        pdf.setFillColor(200, 200, 200);
        pdf.rect(x, y, width, height, 'F');
    }
};

const loadImageAsBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        // 이미 base64면 그대로 반환
        if (url.startsWith('data:')) {
            resolve(url);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png', 0.8)); // 품질 80%로 압축
            } else {
                reject(new Error('Canvas context 생성 실패'));
            }
        };

        img.onerror = () => reject(new Error('이미지 로드 실패'));
        img.src = url;
    });
};

/**
 * AAC 카드 렌더링
 */
const renderAACCard = async (pdf: jsPDF, element: DesignElement): Promise<void> => {
    const x = pxToPt(element.x);
    const y = pxToPt(element.y);
    const width = pxToPt(element.width);
    const height = pxToPt(element.height);
    const borderRadius = pxToPt(element.borderRadius || 12);

    // 카드 배경
    const bgColor = parseColor(element.backgroundColor, '#ffffff');
    pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);

    // 테두리
    const borderColor = parseColor(element.borderColor, '#E5E7EB');
    const borderWidth = pxToPt(element.borderWidth || 2);
    pdf.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
    pdf.setLineWidth(borderWidth);

    pdf.roundedRect(x, y, width, height, borderRadius, borderRadius, 'FD');

    const aacData = element.metadata?.aacData as any;
    if (!aacData?.isFilled) return;

    const size = Math.min(element.width, element.height);
    const labelPosition = (aacData.labelPosition as string) || 'above';
    const symbolScale = (aacData.symbolScale as number) || 0.45;

    // 라벨 렌더링
    if (aacData.label && labelPosition !== 'none') {
        const labelColor = parseColor(aacData.color, '#000000');
        pdf.setTextColor(labelColor.r, labelColor.g, labelColor.b);
        const labelFontSize = pxToPt(aacData.fontSize || 20);
        pdf.setFontSize(labelFontSize);

        const labelX = x + width / 2;
        const labelY = labelPosition === 'above'
            ? y + pxToPt(16) + labelFontSize / 2
            : y + height - pxToPt(8);

        pdf.text(aacData.label, labelX, labelY, { align: 'center' });
    }

    // 심볼(이모지/이미지) 렌더링
    if (aacData.emoji) {
        const symbolSize = pxToPt(size * symbolScale);
        const symbolX = x + (width - symbolSize) / 2;
        const paddingTop = labelPosition === 'above' && aacData.isFilled ? pxToPt(size * 0.15) : 0;
        const paddingBottom = labelPosition === 'below' && aacData.isFilled ? pxToPt(size * 0.15) : 0;
        const symbolY = y + paddingTop + (height - paddingTop - paddingBottom - symbolSize) / 2;

        if (aacData.emoji.startsWith('http')) {
            // 이미지 URL
            try {
                const imgData = await loadImageAsBase64(aacData.emoji);
                pdf.addImage(imgData, 'PNG', symbolX, symbolY, symbolSize, symbolSize);
            } catch {
                // 이미지 로드 실패 시 텍스트로 표시
                pdf.setFontSize(symbolSize * 0.8);
                pdf.text('?', x + width / 2, symbolY + symbolSize / 2, { align: 'center' });
            }
        } else {
            // 이모지 - 텍스트로 렌더링 (폰트 지원 필요)
            pdf.setFontSize(symbolSize * 0.8);
            pdf.text(aacData.emoji, x + width / 2, symbolY + symbolSize * 0.7, { align: 'center' });
        }
    }
};

/**
 * 메인 PDF 내보내기 함수
 */
export const exportToPdf = async (
    pages: Page[],
    allElements: DesignElement[],
    selectedPageIndices: number[],
    projectTitle: string,
    onProgress?: (progress: number) => void
): Promise<void> => {
    if (selectedPageIndices.length === 0) return;

    let pdf: jsPDF | null = null;
    const totalPages = selectedPageIndices.length;

    for (let i = 0; i < selectedPageIndices.length; i++) {
        const pageIndex = selectedPageIndices[i];
        const page = pages[pageIndex];
        const isLandscape = page.orientation === 'landscape';

        const pageWidth = pxToPt(isLandscape ? CANVAS_HEIGHT : CANVAS_WIDTH);
        const pageHeight = pxToPt(isLandscape ? CANVAS_WIDTH : CANVAS_HEIGHT);

        if (!pdf) {
            pdf = new jsPDF({
                orientation: isLandscape ? 'landscape' : 'portrait',
                unit: 'pt',
                format: [pageWidth, pageHeight]
            });
        } else {
            pdf.addPage([pageWidth, pageHeight], isLandscape ? 'landscape' : 'portrait');
        }

        // 현재 페이지의 요소들 (zIndex 순서대로)
        const pageElements = allElements
            .filter(el => el.pageId === page.id)
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

        // 각 요소 렌더링
        for (const element of pageElements) {
            try {
                switch (element.type) {
                    case 'text':
                        renderTextElement(pdf, element);
                        break;
                    case 'shape':
                        renderShapeElement(pdf, element);
                        // shape에 텍스트가 있으면 텍스트도 렌더링
                        if (element.content) {
                            renderTextElement(pdf, element);
                        }
                        break;
                    case 'circle':
                        renderShapeElement(pdf, element);
                        break;
                    case 'line':
                    case 'arrow':
                        renderLineElement(pdf, element);
                        break;
                    case 'image':
                        await renderImageElement(pdf, element);
                        break;
                    case 'card':
                        await renderAACCard(pdf, element);
                        break;
                }
            } catch (error) {
                console.warn(`요소 렌더링 실패 (${element.type}):`, error);
            }
        }

        onProgress?.(Math.round(((i + 1) / totalPages) * 100));
    }

    if (pdf) {
        pdf.save(`${projectTitle || '학습지'}.pdf`);
    }
};

/**
 * 하이브리드 내보내기: 벡터 렌더링 + 폴백으로 html2canvas 사용
 * 복잡한 요소(AAC 카드 등)는 래스터로 처리
 */
export const exportToPdfHybrid = async (
    pages: Page[],
    allElements: DesignElement[],
    selectedPageIndices: number[],
    projectTitle: string,
    capturePageCanvas: (pageId: string) => Promise<HTMLCanvasElement | null>,
    onProgress?: (progress: number) => void
): Promise<void> => {
    if (selectedPageIndices.length === 0) return;

    let pdf: jsPDF | null = null;
    const totalPages = selectedPageIndices.length;

    for (let i = 0; i < selectedPageIndices.length; i++) {
        const pageIndex = selectedPageIndices[i];
        const page = pages[pageIndex];
        const isLandscape = page.orientation === 'landscape';

        const pageWidthPx = isLandscape ? CANVAS_HEIGHT : CANVAS_WIDTH;
        const pageHeightPx = isLandscape ? CANVAS_WIDTH : CANVAS_HEIGHT;
        const pageWidth = pxToPt(pageWidthPx);
        const pageHeight = pxToPt(pageHeightPx);

        if (!pdf) {
            pdf = new jsPDF({
                orientation: isLandscape ? 'landscape' : 'portrait',
                unit: 'pt',
                format: [pageWidth, pageHeight]
            });
            // 한글 폰트 등록
            await registerKoreanFont(pdf);
        } else {
            pdf.addPage([pageWidth, pageHeight], isLandscape ? 'landscape' : 'portrait');
        }

        // 현재 페이지의 요소들 (zIndex 순서대로)
        const pageElements = allElements
            .filter(el => el.pageId === page.id)
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

        // 이미지나 AAC 카드가 있는지 확인
        const hasImageOrCard = pageElements.some(el =>
            el.type === 'image' || el.type === 'card'
        );

        if (hasImageOrCard) {
            // 이미지나 AAC 카드가 있으면 해당 페이지만 래스터로 폴백
            // 하지만 scale을 낮추고 JPEG 품질을 조정하여 용량 최소화
            const canvas = await capturePageCanvas(page.id);
            if (canvas) {
                // JPEG 80% 품질로 텍스트 선명도 유지
                const imgData = canvas.toDataURL('image/jpeg', 0.80);
                pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
            }
        } else {
            // 텍스트, 도형, 선만 있으면 벡터로 렌더링 (용량 매우 작음)
            for (const element of pageElements) {
                try {
                    switch (element.type) {
                        case 'text':
                            renderTextElement(pdf, element);
                            break;
                        case 'shape':
                            renderShapeElement(pdf, element);
                            if (element.content) {
                                renderTextElement(pdf, element);
                            }
                            break;
                        case 'circle':
                            renderShapeElement(pdf, element);
                            break;
                        case 'line':
                        case 'arrow':
                            renderLineElement(pdf, element);
                            break;
                    }
                } catch (error) {
                    console.warn(`요소 렌더링 실패 (${element.type}):`, error);
                }
            }
        }

        onProgress?.(Math.round(((i + 1) / totalPages) * 100));
    }

    if (pdf) {
        pdf.save(`${projectTitle || '학습지'}.pdf`);
    }
};
