/**
 * AACConfigModal - AAC 의사소통판 설정 모달
 * 그리드 크기 및 용지 방향 선택
 */

import React, { useState } from 'react';
import { X, Grid, Smartphone, Monitor } from 'lucide-react';
import { DesignElement } from '../../types';

interface Props {
    onClose: () => void;
    onApply: (elements: DesignElement[]) => void;
}

// 그리드 크기 옵션
const GRID_OPTIONS = [
    { cols: 2, rows: 2, label: '2×2', cards: 4 },
    { cols: 3, rows: 3, label: '3×3', cards: 9 },
    { cols: 4, rows: 4, label: '4×4', cards: 16 },
    { cols: 5, rows: 5, label: '5×5', cards: 25 },
    { cols: 6, rows: 6, label: '6×6', cards: 36 },
    { cols: 4, rows: 3, label: '4×3', cards: 12 },
    { cols: 3, rows: 4, label: '3×4', cards: 12 },
];

// 용지 크기 상수
const CANVAS_PORTRAIT = { width: 800, height: 1132 }; // 세로
const CANVAS_LANDSCAPE = { width: 1132, height: 800 }; // 가로

export const AACConfigModal: React.FC<Props> = ({ onClose, onApply }) => {
    const [selectedGrid, setSelectedGrid] = useState(GRID_OPTIONS[2]); // 4x4 기본
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

    // AAC 그리드 요소 생성
    const generateAACElements = (): DesignElement[] => {
        const elements: DesignElement[] = [];
        const canvas = orientation === 'portrait' ? CANVAS_PORTRAIT : CANVAS_LANDSCAPE;

        const padding = 40;
        const gap = 12;
        const headerHeight = 80;
        const footerHeight = 100;

        const availableWidth = canvas.width - padding * 2;
        const availableHeight = canvas.height - padding * 2 - headerHeight - footerHeight;

        const cardWidth = Math.floor((availableWidth - gap * (selectedGrid.cols - 1)) / selectedGrid.cols);
        const cardHeight = Math.floor((availableHeight - gap * (selectedGrid.rows - 1)) / selectedGrid.rows);
        const cardSize = Math.min(cardWidth, cardHeight);

        const startX = padding + (availableWidth - (cardSize * selectedGrid.cols + gap * (selectedGrid.cols - 1))) / 2;
        const startY = padding + headerHeight;

        // 제목
        elements.push({
            id: `aac-title-${Date.now()}`,
            type: 'text',
            x: padding,
            y: padding,
            width: 300,
            height: 50,
            content: 'AAC 의사소통 판',
            fontSize: 32,
            color: '#5500FF',
            rotation: 0,
            zIndex: 1,
            pageId: '',
            fontFamily: "'Gowun Dodum', sans-serif"
        } as DesignElement);

        // 그리드 크기 라벨
        elements.push({
            id: `aac-label-${Date.now()}`,
            type: 'text',
            x: canvas.width - padding - 100,
            y: padding + 15,
            width: 100,
            height: 30,
            content: selectedGrid.label,
            fontSize: 18,
            color: '#9CA3AF',
            rotation: 0,
            zIndex: 1,
            pageId: '',
            fontFamily: "'Gowun Dodum', sans-serif"
        } as DesignElement);

        // 카드 그리드 생성
        for (let row = 0; row < selectedGrid.rows; row++) {
            for (let col = 0; col < selectedGrid.cols; col++) {
                const x = startX + col * (cardSize + gap);
                const y = startY + row * (cardSize + gap);
                const cardId = `aac-card-${row}-${col}-${Date.now()}`;

                // 카드 배경
                elements.push({
                    id: cardId,
                    type: 'card',
                    x, y,
                    width: cardSize,
                    height: cardSize,
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    borderWidth: 3,
                    borderColor: '#E5E7EB',
                    borderStyle: 'solid',
                    rotation: 0,
                    zIndex: 2 + row * selectedGrid.cols + col,
                    pageId: ''
                } as DesignElement);

                // 플레이스홀더 텍스트
                elements.push({
                    id: `${cardId}-text`,
                    type: 'text',
                    x: x + 10,
                    y: y + cardSize / 2 - 12,
                    width: cardSize - 20,
                    height: 24,
                    content: '카드 추가',
                    fontSize: cardSize > 120 ? 16 : 12,
                    color: '#9CA3AF',
                    rotation: 0,
                    zIndex: 100 + row * selectedGrid.cols + col,
                    pageId: '',
                    fontFamily: "'Gowun Dodum', sans-serif"
                } as DesignElement);
            }
        }

        // 문장 구성 영역
        const sentenceY = startY + selectedGrid.rows * (cardSize + gap) + 20;
        const sentenceWidth = selectedGrid.cols * (cardSize + gap) - gap;

        elements.push({
            id: `aac-sentence-bg-${Date.now()}`,
            type: 'shape',
            x: startX,
            y: sentenceY,
            width: Math.min(sentenceWidth, canvas.width - padding * 2),
            height: 70,
            backgroundColor: '#F3E8FF',
            borderRadius: 16,
            rotation: 0,
            zIndex: 1,
            pageId: ''
        } as DesignElement);

        elements.push({
            id: `aac-sentence-text-${Date.now()}`,
            type: 'text',
            x: startX + 20,
            y: sentenceY + 22,
            width: 200,
            height: 26,
            content: '문장 구성 영역',
            fontSize: 18,
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
        onApply(elements);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#5500FF] rounded-xl text-white">
                            <Grid className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">AAC 의사소통 판</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* 그리드 크기 선택 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                            판 개수 (그리드 크기)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {GRID_OPTIONS.map(option => (
                                <button
                                    key={option.label}
                                    onClick={() => setSelectedGrid(option)}
                                    className={`p-3 rounded-xl border-2 transition-all ${selectedGrid.label === option.label
                                            ? 'border-[#5500FF] bg-[#5500FF]/10 text-[#5500FF]'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                        }`}
                                >
                                    <div className="text-lg font-bold">{option.label}</div>
                                    <div className="text-xs opacity-70">{option.cards}칸</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 용지 방향 선택 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                            용지 방향
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setOrientation('portrait')}
                                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${orientation === 'portrait'
                                        ? 'border-[#5500FF] bg-[#5500FF]/10'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${orientation === 'portrait' ? 'bg-[#5500FF] text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <div className={`font-bold ${orientation === 'portrait' ? 'text-[#5500FF]' : 'text-gray-700'}`}>
                                        세로
                                    </div>
                                    <div className="text-xs text-gray-500">800 × 1132px</div>
                                </div>
                            </button>

                            <button
                                onClick={() => setOrientation('landscape')}
                                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${orientation === 'landscape'
                                        ? 'border-[#5500FF] bg-[#5500FF]/10'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${orientation === 'landscape' ? 'bg-[#5500FF] text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    <Monitor className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <div className={`font-bold ${orientation === 'landscape' ? 'text-[#5500FF]' : 'text-gray-700'}`}>
                                        가로
                                    </div>
                                    <div className="text-xs text-gray-500">1132 × 800px</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* 미리보기 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                            미리보기
                        </label>
                        <div className="bg-gray-50 rounded-xl p-4 flex justify-center">
                            <div
                                className={`bg-white border-2 border-gray-200 rounded-lg shadow-sm flex items-center justify-center ${orientation === 'portrait' ? 'w-24 h-32' : 'w-32 h-24'
                                    }`}
                            >
                                <div
                                    className="grid gap-0.5"
                                    style={{
                                        gridTemplateColumns: `repeat(${selectedGrid.cols}, 1fr)`,
                                        gridTemplateRows: `repeat(${selectedGrid.rows}, 1fr)`,
                                    }}
                                >
                                    {Array.from({ length: selectedGrid.cards }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-2 h-2 bg-[#5500FF]/30 rounded-sm"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-6 py-2 bg-[#5500FF] text-white rounded-lg font-medium hover:bg-[#4400cc] transition-colors"
                    >
                        캔버스에 추가
                    </button>
                </div>
            </div>
        </div>
    );
};
