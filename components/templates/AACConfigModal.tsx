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
    onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
}

// 용지 크기 상수
const CANVAS_PORTRAIT = { width: 800, height: 1132 }; // 세로
const CANVAS_LANDSCAPE = { width: 1132, height: 800 }; // 가로

export const AACConfigModal: React.FC<Props> = ({ onClose, onApply, onOrientationChange }) => {
    const [cols, setCols] = useState(4);
    const [rows, setRows] = useState(4);
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

    // 방향 변경 핸들러 - 즉시 캔버스 방향 동기화
    const handleOrientationChange = (newOrientation: 'portrait' | 'landscape') => {
        setOrientation(newOrientation);
        if (onOrientationChange) {
            onOrientationChange(newOrientation);
        }
    };

    // 숫자 입력 핸들러 (1-8 제한)
    const handleColsChange = (value: string) => {
        const num = parseInt(value) || 1;
        setCols(Math.min(8, Math.max(1, num)));
    };

    const handleRowsChange = (value: string) => {
        const num = parseInt(value) || 1;
        setRows(Math.min(8, Math.max(1, num)));
    };

    // AAC 그리드 요소 생성 - 제목 없이 전체 영역 활용
    const generateAACElements = (): DesignElement[] => {
        const elements: DesignElement[] = [];

        // 용지 방향에 따른 캔버스 크기 (A4 기준: 794x1123)
        const canvasW = orientation === 'portrait' ? CANVAS_PORTRAIT.width : CANVAS_LANDSCAPE.width;
        const canvasH = orientation === 'portrait' ? CANVAS_PORTRAIT.height : CANVAS_LANDSCAPE.height;

        // === 레이아웃 상수 ===
        const MARGIN = 24;                    // 캔버스 여백
        const SENTENCE_H = 60;                // 문장 구성 영역 높이
        const GAP = 10;                       // 카드 간격

        // === 영역 계산 ===
        // 그리드: 상단 여백 ~ 문장 영역 바로 위까지 전체 사용
        const gridAreaY = MARGIN;
        const sentenceY = canvasH - MARGIN - SENTENCE_H;
        const gridAreaH = sentenceY - gridAreaY - 15;  // 문장 위 약간의 여백
        const gridAreaW = canvasW - MARGIN * 2;

        // === 카드 크기 계산 (영역 최대 활용) ===
        const maxCardByWidth = Math.floor((gridAreaW - GAP * (cols - 1)) / cols);
        const maxCardByHeight = Math.floor((gridAreaH - GAP * (rows - 1)) / rows);
        const cardSize = Math.max(50, Math.min(maxCardByWidth, maxCardByHeight));

        // === 실제 그리드 총 크기 ===
        const gridTotalW = cardSize * cols + GAP * (cols - 1);
        const gridTotalH = cardSize * rows + GAP * (rows - 1);

        // === 그리드 시작점 (캔버스 중앙 정렬) ===
        const gridStartX = Math.round((canvasW - gridTotalW) / 2);
        const gridStartY = Math.round(gridAreaY + (gridAreaH - gridTotalH) / 2);

        // ========== 카드 그리드 생성 ==========
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = gridStartX + col * (cardSize + GAP);
                const y = gridStartY + row * (cardSize + GAP);
                const uid = `${Date.now()}-${row}-${col}-${Math.random().toString(36).slice(2, 6)}`;

                // AAC 카드 (통합 구조 - 이모지와 라벨을 aacData에 저장)
                elements.push({
                    id: `card-${uid}`,
                    type: 'card',
                    x: x,
                    y: y,
                    width: cardSize,
                    height: cardSize,
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: '#E5E7EB',
                    borderStyle: 'solid',
                    rotation: 0,
                    zIndex: 10 + row * cols + col,
                    pageId: '',
                    metadata: {
                        isAACCard: true,
                        aacRow: row,
                        aacCol: col,
                        aacIndex: row * cols + col,
                        aacData: {
                            emoji: undefined,
                            label: undefined,
                            isFilled: false
                        }
                    }
                } as DesignElement);
            }
        }

        // 문장 영역 배경의 ID를 저장하여 텍스트와 연결
        const sentenceAreaId = `sentence-bg-${Date.now()}`;

        elements.push({
            id: sentenceAreaId,
            type: 'shape',
            x: MARGIN,
            y: sentenceY,
            width: canvasW - MARGIN * 2,
            height: SENTENCE_H,
            backgroundColor: '#F3E8FF',
            borderRadius: 12,
            rotation: 0,
            zIndex: 1,
            pageId: '',
            metadata: {
                isAACSentenceArea: true,
                itemCount: 0
            }
        } as DesignElement);

        elements.push({
            id: `sentence-txt-${Date.now()}`,
            type: 'text',
            x: MARGIN + 16,
            y: sentenceY + (SENTENCE_H - 18) / 2,
            width: 140,
            height: 18,
            content: '문장 구성 영역',
            fontSize: 14,
            color: '#7C3AED',
            rotation: 0,
            zIndex: 2,
            pageId: '',
            fontFamily: "'Gowun Dodum', sans-serif",
            metadata: {
                isAACSentencePlaceholder: true,
                parentSentenceAreaId: sentenceAreaId
            }
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
                                onClick={() => handleOrientationChange('portrait')}
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
                                onClick={() => handleOrientationChange('landscape')}
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
