
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

        // Hide selection UI
        const selectionElements = target.querySelectorAll('[class*="border-[#5500FF]"]');
        selectionElements.forEach(el => (el as HTMLElement).style.visibility = 'hidden');

        // 폰트가 완전히 로드될 때까지 대기
        await document.fonts.ready;

        // 추가 대기시간 (폰트 렌더링 안정화)
        await new Promise(r => setTimeout(r, 200));

        try {
            const canvas = await html2canvas(target, {
                scale: 1.75, // 텍스트 품질 향상
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                imageTimeout: 15000,
                // 정확한 크기 사용
                width: target.offsetWidth,
                height: target.offsetHeight,
                onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
                    // Google Fonts 링크 추가
                    const fontLink = clonedDoc.createElement('link');
                    fontLink.rel = 'stylesheet';
                    fontLink.href = "https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Cute+Font&family=Do+Hyeon&family=Fredoka:wght@300;400;500;600&family=Gaegu&family=Gowun+Batang&family=Gowun+Dodum&family=Inter:wght@400;500;600&family=Nanum+Gothic:wght@400;700&family=Nanum+Myeongjo:wght@400;700&family=Nanum+Pen+Script&family=Noto+Sans+KR:wght@400;500;700&family=Sunflower:wght@300;500;700&display=swap";
                    clonedDoc.head.appendChild(fontLink);

                    // 원본 요소들의 computed style을 클론된 요소에 강제 적용
                    const originalElements = target.querySelectorAll('*');
                    const clonedElements = clonedElement.querySelectorAll('*');

                    originalElements.forEach((origEl, index) => {
                        const clonedEl = clonedElements[index] as HTMLElement;
                        if (!clonedEl) return;

                        const computedStyle = window.getComputedStyle(origEl);

                        // 폰트 관련 스타일 강제 적용
                        clonedEl.style.fontFamily = computedStyle.fontFamily;
                        clonedEl.style.fontSize = computedStyle.fontSize;
                        clonedEl.style.fontWeight = computedStyle.fontWeight;
                        clonedEl.style.lineHeight = computedStyle.lineHeight;
                        clonedEl.style.letterSpacing = computedStyle.letterSpacing;
                        clonedEl.style.textAlign = computedStyle.textAlign;

                        // 위치 관련 스타일 강제 적용
                        clonedEl.style.position = computedStyle.position;
                        clonedEl.style.left = computedStyle.left;
                        clonedEl.style.top = computedStyle.top;
                        clonedEl.style.width = computedStyle.width;
                        clonedEl.style.height = computedStyle.height;
                        clonedEl.style.transform = computedStyle.transform;
                    });

                    // 이미지 요소들의 크로스오리진 설정
                    const images = clonedElement.querySelectorAll('img');
                    images.forEach((img) => {
                        img.crossOrigin = 'anonymous';
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
