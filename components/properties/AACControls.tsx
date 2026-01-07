import React, { useState } from 'react';
import { DesignElement, TextCommand, TextStyle } from '../../types/editor.types';
import { PopoverColorPicker } from './inputs/PopoverColorPicker';
import { SimpleNumberInput } from './inputs/SimpleNumberInput';

interface AACControlsProps {
    element: DesignElement;
    displayElement: DesignElement; // For showing active styles
    selectedElements: DesignElement[]; // For batch operations
    selectedIds: string[]; // IDs for filtering
    isMultiSelect: boolean;
    hasAACCards: boolean;
    activeTextStyle?: TextStyle | null;
    onUpdate: (id: string, updates: Partial<DesignElement>) => void;
    onCommit: (id: string, updates: Partial<DesignElement>) => void;
    onBatchUpdate?: (updates: Array<{ id: string; changes: Partial<DesignElement> }>) => void;
    onBatchCommit?: (updates: Array<{ id: string; changes: Partial<DesignElement> }>) => void;
    onTextCommand?: (cmd: TextCommand) => void;
}

/**
 * AACControls - AAC 카드 전용 컨트롤
 * 글씨 크기/두께/색상, 상징 크기, 텍스트 위치
 */
export const AACControls: React.FC<AACControlsProps> = ({
    element,
    displayElement,
    selectedElements,
    selectedIds,
    isMultiSelect,
    hasAACCards,
    activeTextStyle,
    onUpdate,
    onCommit,
    onBatchUpdate,
    onBatchCommit,
    onTextCommand
}) => {
    // Local state for symbol scale slider (immediate feedback)
    const [localSymbolScale, setLocalSymbolScale] = useState<number>(4);
    const [localLabelPosition, setLocalLabelPosition] = useState<string>('above');

    // Sync local state with first selected AAC card
    React.useEffect(() => {
        const firstAAC = selectedElements.find(el => el.metadata?.isAACCard);
        if (firstAAC?.metadata?.aacData) {
            setLocalSymbolScale(Math.round((firstAAC.metadata.aacData.symbolScale || 0.4) * 10));
            setLocalLabelPosition(firstAAC.metadata.aacData.labelPosition || 'above');
        }
    }, [selectedIds, selectedElements]);

    // Bulk commit helper
    const handleBulkCommit = (updates: Partial<DesignElement>) => {
        selectedElements.forEach(el => onCommit(el.id, updates));
    };

    const isAACCard = element.type === 'card' && element.metadata?.isAACCard;

    return (
        <div className="space-y-4">
            <div className="flex items-end gap-3">
                {/* 글씨 크기 */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">
                        글씨 크기{isMultiSelect && ' (일괄 적용)'}
                    </label>
                    <SimpleNumberInput
                        value={isAACCard ? (element.metadata?.aacData?.fontSize || 20) : (displayElement.fontSize || 16)}
                        min={8} max={200} unit="px"
                        onChange={(v: number) => {
                            if (activeTextStyle && onTextCommand) {
                                onTextCommand({ type: 'fontSize', value: v, id: element.id });
                            } else if (hasAACCards && onBatchUpdate) {
                                const aacCards = selectedElements.filter(el => el.metadata?.isAACCard);
                                const updates = aacCards.map(card => ({
                                    id: card.id,
                                    changes: {
                                        metadata: {
                                            ...card.metadata,
                                            aacData: { ...card.metadata?.aacData, fontSize: v }
                                        }
                                    }
                                }));
                                if (updates.length > 0) onBatchUpdate(updates);
                            } else {
                                // Single element update
                                onUpdate(element.id, {
                                    metadata: {
                                        ...element.metadata,
                                        aacData: { ...element.metadata?.aacData, fontSize: v }
                                    }
                                });
                            }
                        }}
                        onCommit={(v: number) => {
                            if (activeTextStyle && onTextCommand) {
                                onTextCommand({ type: 'fontSize', value: v, id: element.id });
                            } else if (hasAACCards && onBatchCommit) {
                                const aacCards = selectedElements.filter(el => el.metadata?.isAACCard);
                                const updates = aacCards.map(card => ({
                                    id: card.id,
                                    changes: {
                                        metadata: {
                                            ...card.metadata,
                                            aacData: { ...card.metadata?.aacData, fontSize: v }
                                        }
                                    }
                                }));
                                if (updates.length > 0) onBatchCommit(updates);
                            } else {
                                handleBulkCommit({ fontSize: v });
                            }
                        }}
                    />
                </div>

                {/* 두껍게 버튼 */}
                <button
                    onClick={() => {
                        const currentWeight = isAACCard ? (element.metadata?.aacData?.fontWeight || 400) : (displayElement.fontWeight || 400);
                        const newWeight = currentWeight >= 600 ? 400 : 700;

                        if (activeTextStyle && onTextCommand) {
                            onTextCommand({ type: 'bold', value: newWeight >= 600, id: element.id });
                        } else if (hasAACCards && onBatchCommit) {
                            const aacCards = selectedElements.filter(el => el.metadata?.isAACCard);
                            const updates = aacCards.map(card => ({
                                id: card.id,
                                changes: {
                                    metadata: {
                                        ...card.metadata,
                                        aacData: { ...card.metadata?.aacData, fontWeight: newWeight }
                                    }
                                }
                            }));
                            if (updates.length > 0) onBatchCommit(updates);
                        } else {
                            onCommit(element.id, { fontWeight: newWeight });
                        }
                    }}
                    className={`h-[38px] px-4 text-sm font-medium rounded border transition-colors ${((isAACCard ? element.metadata?.aacData?.fontWeight : displayElement.fontWeight) || 400) >= 600
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    두껍게
                </button>
            </div>

            {/* 글씨 색상 */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">
                    글씨 색상{isMultiSelect && ' (일괄 적용)'}
                </label>
                <PopoverColorPicker
                    color={isAACCard ? (element.metadata?.aacData?.color || '#000000') : (displayElement.color || '#000000')}
                    onChange={() => { }}
                    onCommit={(c: string) => {
                        if (activeTextStyle && onTextCommand) {
                            onTextCommand({ type: 'foreColor', value: c, id: element.id });
                        } else if (hasAACCards && onBatchCommit) {
                            const aacCards = selectedElements.filter(el => el.metadata?.isAACCard);
                            const updates = aacCards.map(card => ({
                                id: card.id,
                                changes: {
                                    metadata: {
                                        ...card.metadata,
                                        aacData: { ...card.metadata?.aacData, color: c }
                                    }
                                }
                            }));
                            if (updates.length > 0) onBatchCommit(updates);
                        } else {
                            handleBulkCommit({ color: c });
                        }
                    }}
                />
            </div>

            {/* AAC 카드 전용: 상징 크기 & 텍스트 위치 */}
            {hasAACCards && (
                <>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">
                            상징 크기{isMultiSelect && ' (일괄 적용)'}
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="1"
                                max="25"
                                step="1"
                                value={localSymbolScale}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setLocalSymbolScale(val);
                                    const scale = val / 10;

                                    const aacCards = selectedElements.filter(el => el.metadata?.isAACCard);
                                    const updates = aacCards.map(card => ({
                                        id: card.id,
                                        changes: {
                                            metadata: {
                                                ...card.metadata,
                                                aacData: { ...card.metadata?.aacData, symbolScale: scale }
                                            }
                                        }
                                    }));

                                    if (onBatchUpdate && updates.length > 0) {
                                        onBatchUpdate(updates);
                                    }
                                }}
                                onMouseUp={() => {
                                    const scale = localSymbolScale / 10;
                                    const aacCards = selectedElements.filter(el => el.metadata?.isAACCard);
                                    const updates = aacCards.map(card => ({
                                        id: card.id,
                                        changes: {
                                            metadata: {
                                                ...card.metadata,
                                                aacData: { ...card.metadata?.aacData, symbolScale: scale }
                                            }
                                        }
                                    }));

                                    if (onBatchCommit && updates.length > 0) {
                                        onBatchCommit(updates);
                                    }
                                }}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5500FF]"
                            />
                            <span className="text-xs text-gray-500 w-8 text-right">
                                {(localSymbolScale / 10).toFixed(1)}x
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">
                            텍스트 위치{isMultiSelect && ' (일괄 적용)'}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'above', label: '상징 위' },
                                { value: 'below', label: '상징 아래' },
                                { value: 'none', label: '없음' }
                            ].map((option) => {
                                const isActive = localLabelPosition === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setLocalLabelPosition(option.value);
                                            const aacCards = selectedElements.filter(el => el.metadata?.isAACCard);
                                            const updates = aacCards.map(card => ({
                                                id: card.id,
                                                changes: {
                                                    metadata: {
                                                        ...card.metadata,
                                                        aacData: { ...card.metadata?.aacData, labelPosition: option.value as 'above' | 'below' | 'none' }
                                                    }
                                                }
                                            }));

                                            if (onBatchCommit && updates.length > 0) {
                                                onBatchCommit(updates);
                                            }
                                        }}
                                        className={`px-2 py-2 text-xs font-medium rounded-lg border transition-all ${isActive
                                            ? 'bg-[#5500FF] text-white border-[#5500FF]'
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-[#5500FF] hover:text-[#5500FF]'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
