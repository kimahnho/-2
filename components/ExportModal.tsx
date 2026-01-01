
import React, { useState } from 'react';
import { X, Download, FileImage, FileText, CheckSquare, Square, Loader2 } from 'lucide-react';
import { Page, DesignElement } from '../types';
import html2canvas from 'html2canvas';
import { trackPdfDownloaded, trackEvent } from '../services/mixpanelService';
import { exportToPdfHybrid } from '../services/pdfExportService';

interface Props {
    pages: Page[];
    elements: DesignElement[];
    onClose: () => void;
    projectTitle: string;
}

export const ExportModal: React.FC<Props> = ({ pages, elements, onClose, projectTitle }) => {
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set(pages.map((_, i) => i)));
    const [exportFormat, setExportFormat] = useState<'pdf' | 'images'>('pdf');
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);

    const togglePage = (index: number) => {
        const newSelected = new Set(selectedPages);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedPages(newSelected);
    };

    const selectAll = () => {
        setSelectedPages(new Set(pages.map((_, i) => i)));
    };


    const deselectAll = () => {
        setSelectedPages(new Set());
    };

    const capturePageCanvas = async (pageId: string): Promise<HTMLCanvasElement | null> => {
        const pageContainer = document.getElementById(`page-container-${pageId}`);
        if (!pageContainer) return null;

        const target = pageContainer.querySelector('.print-container') as HTMLElement;
        if (!target) return null;

        // 현재 페이지 정보 가져오기
        const page = pages.find(p => p.id === pageId);
        if (!page) return null;

        const isLandscape = page.orientation === 'landscape';
        const canvasW = isLandscape ? 1123 : 800; // CANVAS_HEIGHT : CANVAS_WIDTH
        const canvasH = isLandscape ? 800 : 1123;

        // Hide selection UI
        const selectionElements = target.querySelectorAll('[class*="border-[#5500FF]"]');
        selectionElements.forEach(el => (el as HTMLElement).style.visibility = 'hidden');

        // ★ FIX 2: 폰트 로딩 - 충분한 대기시간 확보
        await document.fonts.ready;
        // 모든 폰트가 렌더링에 적용될 때까지 추가 대기
        await new Promise(r => setTimeout(r, 500));

        // 폰트가 완전히 로드될 때까지 대기
        await document.fonts.ready;
        // 추가 대기시간 (폰트 렌더링 안정화)
        await new Promise(r => setTimeout(r, 500));

        try {
            const canvas = await html2canvas(target, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                imageTimeout: 15000,
                width: canvasW,
                height: canvasH,
                onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
                    // 필수: zoom transform 제거 (이미 원본 크기를 지정했으므로)
                    clonedElement.style.transform = 'none';

                    // 이미지 CORS 설정
                    const images = clonedElement.querySelectorAll('img');
                    images.forEach((img) => {
                        img.crossOrigin = 'anonymous';
                    });

                    // 2. Data-Driven Layout Enforcement (데이터 기반 강제 배치)
                    // JSON 데이터를 기준으로 DOM 요소의 위치/크기를 강제 설정하여 렌더링 오차 제거
                    elements.forEach(el => {
                        const domEl = clonedElement.querySelector(`[data-element-id="${el.id}"]`) as HTMLElement;
                        if (domEl) {
                            // 좌표 및 크기 강제 고정 (픽셀 단위)
                            domEl.style.position = 'absolute';
                            domEl.style.left = `${el.x}px`;
                            domEl.style.top = `${el.y}px`;
                            domEl.style.width = `${el.width}px`;
                            domEl.style.height = `${el.height}px`;
                            domEl.style.transform = `rotate(${el.rotation || 0}deg)`; // 회전값도 데이터 기준

                            // 텍스트 요소인 경우 
                            if (el.type === 'text') {
                                domEl.style.zIndex = el.zIndex ? `${el.zIndex}` : 'auto';
                            }
                        }
                    });

                    // 텍스트 요소 라인하이트/베이스라인 보정
                    const originalElements = target.querySelectorAll('*');
                    const clonedElements = clonedElement.querySelectorAll('*');

                    originalElements.forEach((origEl, index) => {
                        const clonedEl = clonedElements[index] as HTMLElement;
                        if (!clonedEl) return;

                        // 텍스트를 포함한 요소만 타겟팅 (공백 제외)
                        if (origEl.textContent && origEl.textContent.trim().length > 0) {
                            // 자식이 없는 말단 요소(Leaf node)이거나, 텍스트 노드만 있는 경우 타겟팅
                            // (중첩된 부모 요소들에 중복 적용 방지)
                            const hasChildElements = origEl.children.length > 0;
                            const isLeafText = !hasChildElements && origEl.textContent.trim().length > 0;

                            // RichTextEditor 내부 div 같은 래퍼들도 고려
                            // TextRenderer의 구조: CanvasElement -> div(flex/block) -> div(ref) -> text/html

                            if (isLeafText || (origEl.tagName === 'DIV' && origEl.style.whiteSpace === 'pre-wrap')) {
                                const computedStyle = window.getComputedStyle(origEl);

                                // 1. 잘림 방지 (필수)
                                clonedEl.style.overflow = 'visible';

                                // 2. 라인하이트 메트릭 고정
                                if (computedStyle.lineHeight && computedStyle.lineHeight !== 'normal') {
                                    clonedEl.style.lineHeight = computedStyle.lineHeight;
                                }

                                // 3. 폰트 패밀리 명시
                                clonedEl.style.fontFamily = computedStyle.fontFamily;

                                // 4. ★ 수직 위치 재보정 (사용자 요청: "오프셋 일단 넣어")
                                // 데이터 기반 배치만으로는 해결되지 않는 브라우저/캔버스 간 렌더링 차이 보정
                                clonedEl.style.transform = 'translateY(-8px)';
                                clonedEl.style.marginTop = '0';
                                clonedEl.style.paddingTop = '0';
                            }
                        }
                    });
                }
            });
            return canvas;
        } finally {
            selectionElements.forEach(el => (el as HTMLElement).style.visibility = '');
        }
    };


    const handleExport = async () => {
        if (selectedPages.size === 0) {
            alert('내보낼 페이지를 선택해주세요.');
            return;
        }

        setIsExporting(true);
        setProgress(0);

        const selectedPageIndices = Array.from(selectedPages).sort((a, b) => a - b);
        const totalPages = selectedPageIndices.length;

        try {
            await document.fonts.ready;

            if (exportFormat === 'pdf') {
                // 벡터 기반 PDF 내보내기 (하이브리드 모드: 간단한 요소는 벡터, 복잡한 요소는 래스터)
                await exportToPdfHybrid(
                    pages,
                    elements,
                    selectedPageIndices as number[],
                    projectTitle,
                    capturePageCanvas,
                    (prog) => setProgress(prog)
                );

                // Track PDF download (Referral)
                trackPdfDownloaded(projectTitle || 'untitled');
            } else {
                // Export as separate images
                for (let i = 0; i < selectedPageIndices.length; i++) {
                    const pageIndex = selectedPageIndices[i];
                    const page = pages[pageIndex];
                    const canvas = await capturePageCanvas(page.id);

                    if (!canvas) continue;

                    const link = document.createElement('a');
                    link.download = `${projectTitle || '학습지'}_${pageIndex + 1}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();

                    // Small delay between downloads
                    await new Promise(r => setTimeout(r, 300));
                    setProgress(Math.round(((i + 1) / totalPages) * 100));
                }
                // Track image export
                trackEvent('Images Downloaded', { project_title: projectTitle, page_count: selectedPageIndices.length });
            }

            onClose();
        } catch (error) {
            console.error('Export failed:', error);
            alert('내보내기에 실패했습니다.');
        } finally {
            setIsExporting(false);
            setProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-bold text-gray-800">내보내기</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Format Selection */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">내보내기 형식</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setExportFormat('pdf')}
                                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${exportFormat === 'pdf'
                                    ? 'border-[#5500FF] bg-[#5500FF]/5 text-[#5500FF]'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <FileText className="w-5 h-5" />
                                <span className="font-medium">PDF (합본)</span>
                            </button>
                            <button
                                onClick={() => setExportFormat('images')}
                                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${exportFormat === 'images'
                                    ? 'border-[#5500FF] bg-[#5500FF]/5 text-[#5500FF]'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <FileImage className="w-5 h-5" />
                                <span className="font-medium">이미지 (개별)</span>
                            </button>
                        </div>
                    </div>

                    {/* Page Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">페이지 선택</label>
                            <div className="flex gap-2">
                                <button onClick={selectAll} className="text-xs text-[#5500FF] hover:underline">전체 선택</button>
                                <span className="text-gray-300">|</span>
                                <button onClick={deselectAll} className="text-xs text-gray-500 hover:underline">전체 해제</button>
                            </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto border rounded-xl">
                            {pages.map((page, index) => (
                                <button
                                    key={page.id}
                                    onClick={() => togglePage(index)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${index !== pages.length - 1 ? 'border-b' : ''
                                        }`}
                                >
                                    {selectedPages.has(index) ? (
                                        <CheckSquare className="w-5 h-5 text-[#5500FF]" />
                                    ) : (
                                        <Square className="w-5 h-5 text-gray-300" />
                                    )}
                                    <span className={`font-medium ${selectedPages.has(index) ? 'text-gray-800' : 'text-gray-400'}`}>
                                        페이지 {index + 1}
                                    </span>
                                    <span className="text-xs text-gray-400 ml-auto">
                                        {page.orientation === 'landscape' ? '가로' : '세로'}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {selectedPages.size}개 페이지 선택됨
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
                    {isExporting ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">내보내는 중...</span>
                                <span className="font-medium text-[#5500FF]">{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#5500FF] transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleExport}
                            disabled={selectedPages.size === 0}
                            className="w-full py-3 bg-[#5500FF] text-white rounded-xl font-medium hover:bg-[#4400cc] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                        >
                            <Download className="w-5 h-5" />
                            {exportFormat === 'pdf' ? 'PDF로 내보내기' : '이미지로 내보내기'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
