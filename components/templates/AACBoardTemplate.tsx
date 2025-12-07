/**
 * AACBoardTemplate - AAC 의사소통 판 템플릿
 * 그리드 기반 AAC 카드 배치 및 문장 구성 기능
 */

import React, { useState, useCallback } from 'react';
import { Grid, Plus, MessageSquare, ArrowRight, X, Sparkles, Check } from 'lucide-react';
import { AACCard, AAC_CATEGORIES, DEFAULT_AAC_CARDS } from '../../types';

interface Props {
    onClose?: () => void;
}

export const AACBoardTemplate: React.FC<Props> = ({ onClose }) => {
    // 그리드 크기 (2~8)
    const [gridSize, setGridSize] = useState(4);

    // 그리드에 배치된 카드 (2D 배열, null은 빈 셀)
    const [gridCards, setGridCards] = useState<(AACCard | null)[][]>(() =>
        Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
    );

    // 문장 구성 영역 카드
    const [sentenceCards, setSentenceCards] = useState<AACCard[]>([]);

    // 현재 선택된 셀 (row, col)
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

    // 카드 선택 패널 표시 여부
    const [showCardPicker, setShowCardPicker] = useState(false);

    // 선택된 카테고리
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // 문장 영역 삽입 모드
    const [isSentenceInsertMode, setIsSentenceInsertMode] = useState(false);

    // 그리드 크기 변경
    const handleGridSizeChange = (newSize: number) => {
        setGridSize(newSize);
        setGridCards(Array(newSize).fill(null).map(() => Array(newSize).fill(null)));
        setSelectedCell(null);
    };

    // 셀 클릭
    const handleCellClick = (row: number, col: number) => {
        if (isSentenceInsertMode) {
            // 문장 삽입 모드: 셀의 카드를 문장에 추가
            const card = gridCards[row][col];
            if (card) {
                setSentenceCards(prev => [...prev, card]);
            }
        } else {
            // 일반 모드: 카드 선택 패널 열기
            setSelectedCell({ row, col });
            setShowCardPicker(true);
        }
    };

    // 카드 선택
    const handleCardSelect = (card: AACCard) => {
        if (!selectedCell) return;

        const { row, col } = selectedCell;

        // 그리드에 카드 삽입
        setGridCards(prev => {
            const newGrid = prev.map(r => [...r]);
            newGrid[row][col] = card;
            return newGrid;
        });

        // 다음 셀로 자동 이동
        const nextCol = col + 1;
        const nextRow = nextCol >= gridSize ? row + 1 : row;
        const actualNextCol = nextCol >= gridSize ? 0 : nextCol;

        if (nextRow < gridSize) {
            setSelectedCell({ row: nextRow, col: actualNextCol });
        } else {
            // 마지막 셀이면 선택 해제
            setSelectedCell(null);
            setShowCardPicker(false);
        }
    };

    // 문장에서 카드 제거
    const handleRemoveFromSentence = (index: number) => {
        setSentenceCards(prev => prev.filter((_, i) => i !== index));
    };

    // 필터된 카드 목록
    const filteredCards = selectedCategory === 'all'
        ? DEFAULT_AAC_CARDS
        : DEFAULT_AAC_CARDS.filter(c => c.category === selectedCategory);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#5500FF]/10 rounded-xl">
                            <Grid className="w-5 h-5 text-[#5500FF]" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-gray-900">AAC 의사소통 판</h2>
                            <p className="text-xs text-gray-500">카드를 배치하고 문장을 구성하세요</p>
                        </div>
                    </div>

                    {/* Grid Size Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">그리드 크기:</span>
                        <select
                            value={gridSize}
                            onChange={(e) => handleGridSizeChange(parseInt(e.target.value))}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#5500FF]"
                        >
                            {[2, 3, 4, 5, 6, 7, 8].map(size => (
                                <option key={size} value={size}>{size} x {size}</option>
                            ))}
                        </select>

                        <button
                            onClick={onClose}
                            className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* AAC Grid */}
                    <div
                        className="grid gap-2 mb-6"
                        style={{
                            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                            maxWidth: `${gridSize * 80}px`,
                            margin: '0 auto'
                        }}
                    >
                        {gridCards.map((row, rowIndex) =>
                            row.map((card, colIndex) => (
                                <button
                                    key={`${rowIndex}-${colIndex}`}
                                    onClick={() => handleCellClick(rowIndex, colIndex)}
                                    className={`
                                        aspect-square rounded-xl border-2 transition-all flex flex-col items-center justify-center p-2 gap-1
                                        ${selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                                            ? 'border-[#5500FF] bg-[#5500FF]/5 ring-2 ring-[#5500FF]/30'
                                            : card
                                                ? 'border-gray-200 bg-white hover:border-[#5500FF]/50'
                                                : 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
                                        }
                                    `}
                                >
                                    {card ? (
                                        <>
                                            {card.imageUrl ? (
                                                <img src={card.imageUrl} alt={card.label} className="w-8 h-8 object-contain" />
                                            ) : (
                                                <div className="w-10 h-10 bg-[#5500FF]/10 rounded-lg flex items-center justify-center">
                                                    <span className="text-lg">📌</span>
                                                </div>
                                            )}
                                            <span className="text-[10px] font-medium text-gray-700 text-center truncate w-full">
                                                {card.label}
                                            </span>
                                        </>
                                    ) : (
                                        <Plus className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Sentence Composition Area */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-[#5500FF]" />
                                <span className="font-bold text-sm text-gray-700">문장 구성</span>
                            </div>
                            <button
                                onClick={() => setIsSentenceInsertMode(!isSentenceInsertMode)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${isSentenceInsertMode
                                        ? 'bg-[#5500FF] text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {isSentenceInsertMode ? (
                                    <><Check className="w-3 h-3" /> 삽입 완료</>
                                ) : (
                                    <><Plus className="w-3 h-3" /> 카드 삽입하기</>
                                )}
                            </button>
                        </div>

                        <div className="min-h-[80px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-3 flex items-center gap-2 flex-wrap">
                            {sentenceCards.length === 0 ? (
                                <p className="text-xs text-gray-400 w-full text-center">
                                    {isSentenceInsertMode
                                        ? '위의 카드를 클릭하면 여기에 추가됩니다'
                                        : '"카드 삽입하기"를 눌러서 문장을 만드세요'
                                    }
                                </p>
                            ) : (
                                <>
                                    {sentenceCards.map((card, index) => (
                                        <React.Fragment key={index}>
                                            <div
                                                className="relative bg-white rounded-lg border border-gray-200 p-2 flex flex-col items-center gap-1 min-w-[60px] group"
                                            >
                                                <button
                                                    onClick={() => handleRemoveFromSentence(index)}
                                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </button>
                                                <div className="w-8 h-8 bg-[#5500FF]/10 rounded flex items-center justify-center text-sm">
                                                    📌
                                                </div>
                                                <span className="text-[10px] font-medium text-gray-700">{card.label}</span>
                                            </div>
                                            {index < sentenceCards.length - 1 && (
                                                <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Card Picker Panel */}
                {showCardPicker && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4 max-h-[250px] overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-gray-700">AAC 카드 선택</span>
                            <button
                                onClick={() => { setShowCardPicker(false); setSelectedCell(null); }}
                                className="text-xs text-gray-500 hover:text-gray-700"
                            >
                                닫기
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-all ${selectedCategory === 'all'
                                        ? 'bg-[#5500FF] text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                전체
                            </button>
                            {AAC_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-all flex items-center gap-1 ${selectedCategory === cat.id
                                            ? 'bg-[#5500FF] text-white'
                                            : 'bg-white text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <span>{cat.icon}</span>
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* Card List */}
                        <div className="grid grid-cols-6 gap-2">
                            {filteredCards.map(card => (
                                <button
                                    key={card.id}
                                    onClick={() => handleCardSelect(card)}
                                    className="p-2 bg-white rounded-lg border border-gray-200 hover:border-[#5500FF] hover:bg-[#5500FF]/5 transition-all flex flex-col items-center gap-1"
                                >
                                    <div className="w-8 h-8 bg-[#5500FF]/10 rounded flex items-center justify-center text-sm">
                                        📌
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-700 truncate w-full text-center">
                                        {card.label}
                                    </span>
                                </button>
                            ))}

                            {/* Add Custom Card Button */}
                            <button
                                className="p-2 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-[#5500FF] hover:bg-[#5500FF]/5 transition-all flex flex-col items-center justify-center gap-1"
                            >
                                <Sparkles className="w-5 h-5 text-[#5500FF]" />
                                <span className="text-[10px] font-medium text-[#5500FF]">AI 생성</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        취소
                    </button>
                    <button
                        className="px-6 py-2 bg-[#5500FF] text-white text-sm font-medium rounded-lg hover:bg-[#4400CC] transition-colors"
                    >
                        캔버스에 추가
                    </button>
                </div>
            </div>
        </div>
    );
};
