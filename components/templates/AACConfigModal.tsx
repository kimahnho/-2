/**
 * AACConfigModal - AAC 의사소통판 설정 모달
 * 그리드 크기 (숫자 입력) 및 용지 방향 선택
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Grid, Smartphone, Monitor } from 'lucide-react';
import { DesignElement } from '../../types';

interface Props {
    onClose: () => void;
    onApply: (elements: DesignElement[], orientation: 'portrait' | 'landscape') => void;
}

// 용지 크기 상수
const CANVAS_PORTRAIT = { width: 800, height: 1132 }; // 세로
const CANVAS_LANDSCAPE = { width: 1132, height: 800 }; // 가로

export const AACConfigModal: React.FC<Props> = ({ onClose, onApply }) => {
    const [cols, setCols] = useState(4);
    const [rows, setRows] = useState(4);
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

    // 숫자 입력 핸들러 (1-8 제한)
    const handleColsChange = (value: string) => {
        const num = parseInt(value) || 1;
        setCols(Math.min(8, Math.max(1, num)));
    };

    const handleRowsChange = (value: string) => {
        const num = parseInt(value) || 1;
        setRows(Math.min(8, Math.max(1, num)));
    };

    // AAC 그리드 요소 생성
    const generateAACElements = (): DesignElement[] => {
        const elements: DesignElement[] = [];
        const canvas = orientation === 'portrait' ? CANVAS_PORTRAIT : CANVAS_LANDSCAPE;

        // 기본 여백 설정
        const PADDING = 40;
        const GAP = 12;
        const HEADER_HEIGHT = 60;
        const SENTENCE_HEIGHT = 80;
        const SENTENCE_MARGIN = 30;

        // 레이아웃 계산
        // 문장 영역: 캔버스 하단에 고정
        const sentenceY = canvas.height - PADDING - SENTENCE_HEIGHT;

        // 그리드 영역: 헤더 아래 ~ 문장 영역 위
        const gridTop = PADDING + HEADER_HEIGHT;
        const gridBottom = sentenceY - SENTENCE_MARGIN;
        const gridAreaHeight = gridBottom - gridTop;
        const gridAreaWidth = canvas.width - PADDING * 2;

        // 카드 크기 계산 (영역에 맞게 + 최대 크기 제한)
        const maxCardW = Math.floor((gridAreaWidth - GAP * (cols - 1)) / cols);
        const maxCardH = Math.floor((gridAreaHeight - GAP * (rows - 1)) / rows);
        const cardSize = Math.min(maxCardW, maxCardH, 150);

        // 실제 그리드 크기
        const totalGridWidth = cardSize * cols + GAP * (cols - 1);
        const totalGridHeight = cardSize * rows + GAP * (rows - 1);

        // 그리드 시작점 (캔버스 중앙 정렬)
        const gridStartX = (canvas.width - totalGridWidth) / 2;
        const gridStartY = gridTop + (gridAreaHeight - totalGridHeight) / 2;

        // === 1. 제목 ===
        elements.push({
            id: `aac-title-${Date.now()}`,
            type: 'text',
            x: PADDING,
            y: PADDING,
            width: 280,
            height: 40,
            content: 'AAC 의사소통 판',
            fontSize: 26,
            color: '#5500FF',
            rotation: 0,
            zIndex: 1,
            pageId: '',
            fontFamily: "'Gowun Dodum', sans-serif"
        } as DesignElement);

        // === 2. 그리드 크기 라벨 ===
        elements.push({
            id: `aac-label-${Date.now()}`,
            type: 'text',
            x: canvas.width - PADDING - 60,
            y: PADDING + 8,
            width: 60,
            height: 24,
            content: `${cols}×${rows}`,
            fontSize: 14,
            color: '#9CA3AF',
            rotation: 0,
            zIndex: 1,
            pageId: '',
            fontFamily: "'Gowun Dodum', sans-serif"
        } as DesignElement);

        // === 3. 카드 그리드 ===
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cardX = gridStartX + c * (cardSize + GAP);
                const cardY = gridStartY + r * (cardSize + GAP);
                const cardId = `aac-card-${r}-${c}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

                // 카드 배경
                elements.push({
                    id: cardId,
                    type: 'card',
                    x: cardX,
                    y: cardY,
                    width: cardSize,
                    height: cardSize,
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: '#E5E7EB',
                    borderStyle: 'solid',
                    rotation: 0,
                    zIndex: 10 + r * cols + c,
                    pageId: ''
                } as DesignElement);

                // 플레이스홀더 텍스트
                elements.push({
                    id: `${cardId}-txt`,
                    type: 'text',
                    x: cardX + 8,
                    y: cardY + cardSize / 2 - 8,
                    width: cardSize - 16,
                    height: 16,
                    content: '카드 추가',
                    fontSize: 11,
                    color: '#BCBCBC',
                    rotation: 0,
                    zIndex: 100 + r * cols + c,
                    pageId: '',
                    fontFamily: "'Gowun Dodum', sans-serif"
                } as DesignElement);
            }
        }

        // === 4. 문장 구성 영역 (하단 고정) ===
        elements.push({
            id: `aac-sentence-bg-${Date.now()}`,
            type: 'shape',
            x: PADDING,
            y: sentenceY,
            width: canvas.width - PADDING * 2,
            height: SENTENCE_HEIGHT,
            backgroundColor: '#F3E8FF',
            borderRadius: 12,
            rotation: 0,
            zIndex: 1,
            pageId: ''
        } as DesignElement);

        elements.push({
            id: `aac-sentence-txt-${Date.now()}`,
            type: 'text',
            x: PADDING + 16,
            y: sentenceY + (SENTENCE_HEIGHT - 22) / 2,
            width: 160,
            height: 22,
            content: '문장 구성 영역',
            fontSize: 16,
            color: '#7C3AED',
            rotation: 0,
            zIndex: 2,
            pageId: '',
            fontFamily: "'Gowun Dodum', sans-serif"
        } as DesignElement);

        return elements;
    };

    const handleApply = () => {
        const elements = generateAACElements();
        onApply(elements, orientation);
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
            style={{ zIndex: 99999 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-[400px] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#5500FF] rounded-xl text-white">
                            <Grid className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">AAC 의사소통 판</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                    {/* 그리드 크기 입력 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                            판 개수
                        </label>
                        <div className="flex items-center justify-center gap-3">
                            <div className="flex flex-col items-center">
                                <input
                                    type="number"
                                    min="1"
                                    max="8"
                                    value={cols}
                                    onChange={(e) => handleColsChange(e.target.value)}
                                    className="w-20 h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#5500FF] focus:outline-none transition-colors"
                                />
                                <span className="text-xs text-gray-400 mt-1">가로</span>
                            </div>
                            <span className="text-3xl font-bold text-gray-300">×</span>
                            <div className="flex flex-col items-center">
                                <input
                                    type="number"
                                    min="1"
                                    max="8"
                                    value={rows}
                                    onChange={(e) => handleRowsChange(e.target.value)}
                                    className="w-20 h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#5500FF] focus:outline-none transition-colors"
                                />
                                <span className="text-xs text-gray-400 mt-1">세로</span>
                            </div>
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-2">
                            총 {cols * rows}칸 (최대 8×8)
                        </p>
                    </div>

                    {/* 용지 방향 선택 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                            용지 방향
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setOrientation('portrait')}
                                className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${orientation === 'portrait'
                                    ? 'border-[#5500FF] bg-[#5500FF]/10'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Smartphone className={`w-5 h-5 ${orientation === 'portrait' ? 'text-[#5500FF]' : 'text-gray-400'}`} />
                                <div className="text-left">
                                    <div className={`font-bold text-sm ${orientation === 'portrait' ? 'text-[#5500FF]' : 'text-gray-700'}`}>
                                        세로
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setOrientation('landscape')}
                                className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${orientation === 'landscape'
                                    ? 'border-[#5500FF] bg-[#5500FF]/10'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Monitor className={`w-5 h-5 ${orientation === 'landscape' ? 'text-[#5500FF]' : 'text-gray-400'}`} />
                                <div className="text-left">
                                    <div className={`font-bold text-sm ${orientation === 'landscape' ? 'text-[#5500FF]' : 'text-gray-700'}`}>
                                        가로
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* 미리보기 */}
                    <div className="bg-gray-50 rounded-xl p-4 flex justify-center">
                        <div
                            className={`bg-white border-2 border-gray-200 rounded-lg shadow-sm flex items-center justify-center ${orientation === 'portrait' ? 'w-20 h-28' : 'w-28 h-20'
                                }`}
                        >
                            <div
                                className="grid gap-0.5"
                                style={{
                                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                                }}
                            >
                                {Array.from({ length: cols * rows }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-[#5500FF]/30 rounded-sm"
                                        style={{
                                            width: Math.max(3, Math.floor(50 / Math.max(cols, rows))),
                                            height: Math.max(3, Math.floor(50 / Math.max(cols, rows)))
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 px-4 py-2.5 bg-[#5500FF] text-white rounded-xl font-medium hover:bg-[#4400cc] transition-colors"
                    >
                        캔버스에 추가
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
