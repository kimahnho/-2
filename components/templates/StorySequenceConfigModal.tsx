/**
 * StorySequenceConfigModal - 이야기 장면 순서 맞추기 설정 모달
 * 카드 개수 선택 (2-8개) 및 용지 방향 선택
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Layers, Smartphone, Monitor, ArrowRight, ArrowDown } from 'lucide-react';
import { DesignElement } from '../../types';

interface Props {
    onClose: () => void;
    onApply: (elements: DesignElement[], orientation: 'portrait' | 'landscape') => void;
    onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
}

// 용지 크기 상수
const CANVAS_PORTRAIT = { width: 800, height: 1132 }; // 세로
const CANVAS_LANDSCAPE = { width: 1132, height: 800 }; // 가로

export const StorySequenceConfigModal: React.FC<Props> = ({ onClose, onApply, onOrientationChange }) => {
    const [cardCount, setCardCount] = useState(4);
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [flowDirection, setFlowDirection] = useState<'horizontal' | 'vertical'>('horizontal');

    // 방향 변경 핸들러
    const handleOrientationChange = (newOrientation: 'portrait' | 'landscape') => {
        setOrientation(newOrientation);
        if (onOrientationChange) {
            onOrientationChange(newOrientation);
        }
    };

    // 카드 개수 변경 핸들러 (2-8 제한)
    const handleCardCountChange = (value: string) => {
        const num = parseInt(value) || 2;
        setCardCount(Math.min(8, Math.max(2, num)));
    };

    // 이야기 순서 요소 생성
    const generateStorySequenceElements = (): DesignElement[] => {
        const elements: DesignElement[] = [];
        const generateId = () => Math.random().toString(36).substr(2, 9);

        const canvasW = orientation === 'portrait' ? CANVAS_PORTRAIT.width : CANVAS_LANDSCAPE.width;
        const canvasH = orientation === 'portrait' ? CANVAS_PORTRAIT.height : CANVAS_LANDSCAPE.height;

        const MARGIN = 40;
        const HEADER_HEIGHT = 80;
        const GAP = 20;

        // 제목
        elements.push({
            id: generateId(),
            type: 'text',
            x: MARGIN,
            y: MARGIN,
            width: canvasW - MARGIN * 2,
            height: 50,
            content: '이야기 장면 순서 맞추기',
            fontSize: 32,
            color: '#1a365d',
            rotation: 0,
            zIndex: 1,
            pageId: '',
            fontWeight: 700,
        } as DesignElement);

        // 그리드 영역 계산
        const gridAreaY = MARGIN + HEADER_HEIGHT;
        const gridAreaH = canvasH - gridAreaY - MARGIN;
        const gridAreaW = canvasW - MARGIN * 2;

        let cols: number;
        let rows: number;

        if (flowDirection === 'vertical') {
            // 세로 방향: 2열로 위에서 아래로
            cols = 2;
            rows = Math.ceil(cardCount / cols);
        } else {
            // 가로 방향: 기존 로직
            cols = 2;
            rows = Math.ceil(cardCount / cols);

            if (orientation === 'landscape' && cardCount <= 4) {
                cols = cardCount;
                rows = 1;
            } else if (orientation === 'landscape') {
                cols = Math.min(4, cardCount);
                rows = Math.ceil(cardCount / cols);
            }
        }

        // 카드 크기 계산
        const maxCardW = Math.floor((gridAreaW - GAP * (cols - 1)) / cols);
        const maxCardH = Math.floor((gridAreaH - GAP * (rows - 1)) / rows);
        const cardSize = Math.min(maxCardW, maxCardH);

        // 그리드 총 크기 및 시작점
        const totalGridW = cardSize * cols + GAP * (cols - 1);
        const totalGridH = cardSize * rows + GAP * (rows - 1);
        const startX = Math.round((canvasW - totalGridW) / 2);
        const startY = Math.round(gridAreaY + (gridAreaH - totalGridH) / 2);

        // 카드 생성
        for (let i = 0; i < cardCount; i++) {
            let row: number;
            let col: number;

            if (flowDirection === 'vertical') {
                // 세로 방향: 열 우선 (위→아래, 왼→오)
                col = Math.floor(i / rows);
                row = i % rows;
                // 홀수 개수일 때 마지막 카드는 왼쪽 열 마지막에
                if (i === cardCount - 1 && cardCount % 2 === 1) {
                    col = 0;
                    row = rows - 1;
                }
            } else {
                // 가로 방향: 행 우선 (왼→오, 위→아래)
                row = Math.floor(i / cols);
                col = i % cols;
            }

            const x = startX + col * (cardSize + GAP);
            const y = startY + row * (cardSize + GAP);

            // 카드 배경
            elements.push({
                id: generateId(),
                type: 'shape',
                x: x,
                y: y,
                width: cardSize,
                height: cardSize,
                backgroundColor: '#E8F4FD',
                borderColor: '#2563EB',
                borderWidth: 2,
                borderRadius: 8,
                rotation: 0,
                zIndex: 2 + i,
                pageId: '',
            } as DesignElement);

            // 숫자 라벨
            elements.push({
                id: generateId(),
                type: 'text',
                x: x,
                y: y + cardSize / 2 - 20,
                width: cardSize,
                height: 40,
                content: String(i + 1),
                fontSize: 36,
                color: '#94A3B8',
                rotation: 0,
                zIndex: 3 + i,
                pageId: '',
            } as DesignElement);
        }

        return elements;
    };

    const handleApply = () => {
        const elements = generateStorySequenceElements();
        onApply(elements, orientation);
    };

    // 미리보기 렌더링
    const renderPreview = () => {
        const previewW = orientation === 'portrait' ? 120 : 170;
        const previewH = orientation === 'portrait' ? 170 : 120;

        let cols: number;
        let rows: number;

        if (flowDirection === 'vertical') {
            cols = 2;
            rows = Math.ceil(cardCount / cols);
        } else {
            cols = 2;
            rows = Math.ceil(cardCount / cols);
            if (orientation === 'landscape' && cardCount <= 4) {
                cols = cardCount;
                rows = 1;
            } else if (orientation === 'landscape') {
                cols = Math.min(4, cardCount);
                rows = Math.ceil(cardCount / cols);
            }
        }

        const padding = 10;
        const gap = 4;
        const headerH = 15;
        const cardW = Math.floor((previewW - padding * 2 - gap * (cols - 1)) / cols);
        const cardH = Math.floor((previewH - padding * 2 - headerH - gap * (rows - 1)) / rows);
        const size = Math.min(cardW, cardH, 35);

        // 카드 배열 생성
        const cards = Array.from({ length: cardCount }).map((_, i) => {
            let row: number;
            let col: number;

            if (flowDirection === 'vertical') {
                col = Math.floor(i / rows);
                row = i % rows;
                if (i === cardCount - 1 && cardCount % 2 === 1) {
                    col = 0;
                    row = rows - 1;
                }
            } else {
                row = Math.floor(i / cols);
                col = i % cols;
            }

            return { i, row, col };
        });

        return (
            <div
                className="bg-white border-2 border-gray-300 rounded-lg mx-auto"
                style={{ width: previewW, height: previewH }}
            >
                <div className="text-[6px] font-bold text-center py-1 text-gray-600">
                    이야기 장면 순서 맞추기
                </div>
                <div
                    className="grid px-2 mx-auto"
                    style={{
                        gridTemplateColumns: `repeat(${cols}, ${size}px)`,
                        gridTemplateRows: `repeat(${rows}, ${size}px)`,
                        gap: gap,
                        width: 'fit-content'
                    }}
                >
                    {cards.map(({ i, row, col }) => (
                        <div
                            key={i}
                            className="bg-blue-100 border border-blue-400 rounded flex items-center justify-center"
                            style={{
                                width: size,
                                height: size,
                                gridColumn: col + 1,
                                gridRow: row + 1
                            }}
                        >
                            <span className="text-[10px] text-blue-400 font-bold">{i + 1}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Layers className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">이야기 장면 순서 맞추기</h2>
                            <p className="text-blue-100 text-sm">카드 개수와 용지 방향을 선택하세요</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Card Count */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-3 block">카드 개수</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="2"
                                max="8"
                                value={cardCount}
                                onChange={(e) => setCardCount(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="2"
                                    max="8"
                                    value={cardCount}
                                    onChange={(e) => handleCardCountChange(e.target.value)}
                                    className="w-16 px-3 py-2 border-2 border-gray-200 rounded-lg text-center font-bold text-lg focus:border-blue-500 focus:outline-none"
                                />
                                <span className="text-gray-500">개</span>
                            </div>
                        </div>
                    </div>

                    {/* Flow Direction */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-3 block">카드 순서 방향</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setFlowDirection('horizontal')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${flowDirection === 'horizontal'
                                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                <ArrowRight className="w-5 h-5" />
                                <span className="font-medium text-sm">왼→오</span>
                            </button>
                            <button
                                onClick={() => setFlowDirection('vertical')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${flowDirection === 'vertical'
                                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                <ArrowDown className="w-5 h-5" />
                                <span className="font-medium text-sm">위→아래</span>
                            </button>
                        </div>
                    </div>

                    {/* Orientation */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-3 block">용지 방향</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleOrientationChange('portrait')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${orientation === 'portrait'
                                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                <Smartphone className="w-5 h-5" />
                                <span className="font-medium text-sm">세로</span>
                            </button>
                            <button
                                onClick={() => handleOrientationChange('landscape')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${orientation === 'landscape'
                                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                <Monitor className="w-5 h-5" />
                                <span className="font-medium text-sm">가로</span>
                            </button>
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-3 block">미리보기</label>
                        <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center min-h-[180px]">
                            {renderPreview()}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        적용하기
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
