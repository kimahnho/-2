/**
 * PDF Export Service - 스크린샷 기반 PDF 내보내기
 * 
 * 접근 방식: html2canvas로 캡쳐한 이미지를 그대로 PDF에 삽입
 * - 장점: 100% WYSIWYG (화면과 동일한 결과), 폰트/이미지 문제 없음
 * - 단점: 파일 크기가 큼 (페이지당 약 1-2MB)
 */

import { jsPDF } from 'jspdf';
import { Page } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/canvasUtils';

// PDF 좌표계는 pt(포인트) 단위 사용
const PX_TO_PT = 72 / 96; // 1px = 0.75pt

/**
 * 스크린샷 기반 PDF 내보내기
 * 
 * @param pages - 모든 페이지 목록
 * @param selectedPageIndices - 내보낼 페이지 인덱스 배열
 * @param projectTitle - 프로젝트 제목 (파일명)
 * @param capturePageCanvas - 페이지 ID로 캔버스 캡쳐하는 함수
 * @param onProgress - 진행률 콜백
 */
export const exportToPdfHybrid = async (
    pages: Page[],
    _allElements: any[], // 사용하지 않음 (스크린샷 방식)
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

        // 페이지 크기 계산 (pt 단위)
        const pageWidthPx = isLandscape ? CANVAS_HEIGHT : CANVAS_WIDTH;
        const pageHeightPx = isLandscape ? CANVAS_WIDTH : CANVAS_HEIGHT;
        const pageWidthPt = pageWidthPx * PX_TO_PT;
        const pageHeightPt = pageHeightPx * PX_TO_PT;

        // 페이지 캡쳐
        onProgress?.(Math.round((i / totalPages) * 50)); // 0-50%: 캡쳐 단계

        const canvas = await capturePageCanvas(page.id);
        if (!canvas) {
            console.warn(`페이지 캡쳐 실패: ${page.id}`);
            continue;
        }

        // 캔버스를 이미지 데이터로 변환
        const imgData = canvas.toDataURL('image/jpeg', 0.92); // JPEG 92% 품질

        if (!pdf) {
            // 첫 페이지: PDF 생성
            pdf = new jsPDF({
                orientation: isLandscape ? 'landscape' : 'portrait',
                unit: 'pt',
                format: [pageWidthPt, pageHeightPt]
            });
        } else {
            // 추가 페이지
            pdf.addPage([pageWidthPt, pageHeightPt], isLandscape ? 'landscape' : 'portrait');
        }

        // 이미지를 페이지 전체에 삽입
        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthPt, pageHeightPt);

        onProgress?.(Math.round(((i + 1) / totalPages) * 100)); // 50-100%: 삽입 단계
    }

    if (pdf) {
        pdf.save(`${projectTitle || '학습지'}.pdf`);
    }
};

/**
 * Legacy alias - 동일한 함수 사용
 */
export const exportToPdf = exportToPdfHybrid;
