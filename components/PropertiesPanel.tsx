
import React, { useState } from 'react';
import { DesignElement } from '../types';
import { PRESET_COLORS, PRESET_FONTS } from '../constants';
import {
  Trash2, Copy,
  AlignLeft, AlignCenter, AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Sparkles, Upload, Pipette
} from 'lucide-react';

interface Props {
  elements: DesignElement[];
  selectedIds: string[];
  onUpdate: (id: string, updates: Partial<DesignElement>) => void;
  onCommit: (id: string, updates: Partial<DesignElement>) => void;
  onBatchUpdate?: (updates: Array<{ id: string; changes: Partial<DesignElement> }>) => void;
  onBatchCommit?: (updates: Array<{ id: string; changes: Partial<DesignElement> }>) => void;
  onDelete: (ids: string[]) => void;
  onDuplicate: (ids: string[]) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onBringToFront?: (id: string) => void;
  onSendToBack?: (id: string) => void;
  onUploadImage?: () => void;
  onAlign?: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'distribute-horizontal' | 'distribute-vertical') => void;
  onGenerateImage?: (id: string, prompt: string, style: 'character' | 'realistic' | 'emoji') => Promise<void>;
}

// 1. 단순한 숫자 입력
const SimpleNumberInput = ({ value, min, max, unit, onChange, onCommit }: any) => (
  <div className="flex items-center border border-gray-300 rounded bg-white px-2 py-1.5 focus-within:border-[#5500FF] transition-colors w-20">
    <input
      type="number"
      value={value}
      onChange={(e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val)) onChange(val);
      }}
      onBlur={(e) => onCommit(Math.min(max, Math.max(min, parseInt(e.target.value) || min)))}
      className="w-full text-sm font-medium outline-none text-right bg-transparent minus-nums"
    />
    <span className="text-xs text-gray-500 ml-1">{unit}</span>
  </div>
);

// 2. 팝오버 컬러 피커 (팔레트 숨김, 클릭 시 노출)
const PopoverColorPicker = ({ color, onChange, onCommit }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const presets = [
    '#000000', '#FFFFFF', '#374151', '#9CA3AF',
    '#EF4444', '#F87171', '#F59E0B', '#FBBF24',
    '#10B981', '#34D399', '#3B82F6', '#60A5FA',
    '#6366F1', '#818CF8', '#8B5CF6', '#A78BFA'
  ];

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white group"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded border border-gray-200 shadow-sm shrink-0" style={{ backgroundColor: color || '#000000' }} />
          <span className="text-xs text-gray-600 font-medium uppercase group-hover:text-gray-900">{color || '#000000'}</span>
        </div>
        <div className="text-[10px] text-gray-400">변경</div>
      </button>

      {/* Popover Content */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 z-40 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-[220px] animate-in fade-in zoom-in-95 duration-100">
            <div className="text-[10px] font-bold text-gray-400 mb-2">프리셋 색상</div>
            <div className="grid grid-cols-8 gap-1.5 mb-3">
              {presets.map(c => (
                <button
                  key={c}
                  onClick={() => { onChange(c); onCommit(c); setIsOpen(false); }}
                  className={`w-5 h-5 rounded border hover:scale-110 transition-transform ${(color || '#000000') === c ? 'border-[#5500FF] ring-1 ring-[#5500FF]' : 'border-gray-200'
                    }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>

            <div className="h-px bg-gray-100 my-2" />

            <div className="text-[10px] font-bold text-gray-400 mb-2">사용자 지정</div>
            <div className="flex items-center gap-2">
              {/* Eyedropper / Native Color Picker */}
              <div className="relative w-8 h-8 rounded border border-gray-200 overflow-hidden shrink-0 group cursor-pointer hover:border-gray-300" title="색상 선택 (스포이드)">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 pointer-events-none">
                  <Pipette className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                </div>
                <input
                  type="color"
                  value={color || '#000000'}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={(e) => onCommit(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Hex Input */}
              <div className="flex-1 border border-gray-200 rounded px-2 py-1.5 bg-gray-50 flex items-center focus-within:border-[#5500FF] focus-within:bg-white transition-colors">
                <span className="text-gray-400 text-xs mr-1">#</span>
                <input
                  type="text"
                  value={color?.replace('#', '') || ''}
                  onChange={(e) => onChange(`#${e.target.value}`)}
                  onBlur={(e) => onCommit(color)}
                  className="w-full text-xs bg-transparent outline-none uppercase text-gray-700 font-medium"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const PropertiesPanel: React.FC<Props> = ({
  elements, selectedIds, onUpdate, onCommit, onBatchUpdate, onBatchCommit, onDelete, onDuplicate,
  onBringForward, onSendBackward, onBringToFront, onSendToBack,
  onUploadImage, onAlign, onGenerateImage
}) => {
  const [activeImageTab, setActiveImageTab] = useState<'upload' | 'ai'>('upload');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Local state for sliders (for immediate UI feedback)
  const [localSymbolScale, setLocalSymbolScale] = useState<number>(4);
  const [localLabelPosition, setLocalLabelPosition] = useState<string>('above');

  // Sync local state with first selected element's values
  React.useEffect(() => {
    const firstAAC = elements.find(
      el => selectedIds.includes(el.id) && el.metadata?.isAACCard
    );
    if (firstAAC?.metadata?.aacData) {
      setLocalSymbolScale(Math.round((firstAAC.metadata.aacData.symbolScale || 0.4) * 10));
      setLocalLabelPosition(firstAAC.metadata.aacData.labelPosition || 'above');
    }
  }, [selectedIds, elements]);

  // --- Empty State ---
  if (selectedIds.length === 0) {
    return (
      <div className="w-[280px] bg-white border-l border-gray-200 h-full p-6 flex flex-col items-center justify-center text-gray-400 select-none">
        <p className="text-sm">요소를 선택하여 편집하세요</p>
      </div>
    );
  }

  // --- Unified Selection Handling (Single & Multi) ---
  const selectedElements = elements.filter(el => selectedIds.includes(el.id));
  const isMultiSelect = selectedIds.length > 1;

  // Primary element for displaying values (first selected)
  const element = selectedElements[0];
  if (!element) return null;

  // Filter by type for bulk operations
  const aacCards = selectedElements.filter(el => el.metadata?.isAACCard);
  const hasAACCards = aacCards.length > 0;
  const allAreAACCards = selectedElements.every(el => el.metadata?.isAACCard);

  const isAACCard = element.type === 'card' && element.metadata?.isAACCard;
  const isLine = element.type === 'line' || element.type === 'arrow';
  const isText = element.type === 'text';

  // Bulk update handlers - apply to all selected elements
  const handleBulkUpdate = (updates: Partial<DesignElement>) => {
    selectedElements.forEach(el => onUpdate(el.id, updates));
  };

  const handleBulkCommit = (updates: Partial<DesignElement>) => {
    selectedElements.forEach(el => onCommit(el.id, updates));
  };

  // AAC-specific bulk handlers - elements prop에서 직접 필터링
  const handleBulkAACUpdate = (aacUpdates: any) => {
    // elements prop에서 직접 선택된 AAC 카드 필터링
    const currentAACCards = elements.filter(
      el => selectedIds.includes(el.id) && el.metadata?.isAACCard
    );
    currentAACCards.forEach(card => {
      const currentAACData = card.metadata?.aacData || {};
      onUpdate(card.id, {
        metadata: {
          ...card.metadata,
          aacData: {
            ...currentAACData,
            ...aacUpdates
          }
        }
      });
    });
  };

  const handleBulkAACCommit = (aacUpdates: any) => {
    // elements prop에서 직접 선택된 AAC 카드 필터링
    const currentAACCards = elements.filter(
      el => selectedIds.includes(el.id) && el.metadata?.isAACCard
    );
    currentAACCards.forEach(card => {
      const currentAACData = card.metadata?.aacData || {};
      onCommit(card.id, {
        metadata: {
          ...card.metadata,
          aacData: {
            ...currentAACData,
            ...aacUpdates
          }
        }
      });
    });
  };

  return (
    <div className="w-[280px] bg-white border-l border-gray-200 h-full flex flex-col shadow-sm z-20 overflow-y-auto">

      {/* 상단 타이틀 & 삭제 */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-800">
            {isMultiSelect
              ? (allAreAACCards ? `AAC 카드 편집 (${selectedIds.length}개)` : `요소 편집 (${selectedIds.length}개)`)
              : (isAACCard ? 'AAC 카드 편집' : '속성 편집')
            }
          </h2>
          {isMultiSelect && hasAACCards && !allAreAACCards && (
            <p className="text-xs text-gray-500 mt-0.5">AAC 카드 {aacCards.length}개 포함</p>
          )}
        </div>
        <button onClick={() => onDelete(selectedIds)} className="text-gray-400 hover:text-red-500 p-1">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-6">

        {/* 1. 라벨/텍스트 내용 - 단일 선택시만 표시 */}
        {!isMultiSelect && (isAACCard || isText) && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500">
              {isAACCard ? '라벨 내용' : '텍스트 내용'}
            </label>
            {isAACCard ? (
              <input
                type="text"
                value={element.metadata?.aacData?.label || ''}
                onChange={(e) => onUpdate(element.id, { metadata: { ...element.metadata, aacData: { ...element.metadata!.aacData, label: e.target.value } } })}
                onBlur={(e) => onCommit(element.id, { metadata: { ...element.metadata, aacData: { ...element.metadata!.aacData, label: e.target.value } } })}
                className="w-full p-2.5 text-sm border border-gray-300 rounded focus:border-[#5500FF] outline-none"
                placeholder="내용을 입력하세요"
              />
            ) : (
              <textarea
                value={element.content}
                onChange={(e) => onUpdate(element.id, { content: e.target.value })}
                onBlur={(e) => onCommit(element.id, { content: e.target.value })}
                className="w-full p-2.5 text-sm border border-gray-300 rounded focus:border-[#5500FF] outline-none resize-none"
                rows={3}
              />
            )}
          </div>
        )}

        {/* 폰트 선택 - 텍스트 요소 선택 시 표시 */}
        {isText && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500">
              폰트{isMultiSelect && ' (일괄 적용)'}
            </label>
            <select
              value={element.fontFamily || "'Gowun Dodum', sans-serif"}
              onChange={(e) => {
                const newFont = e.target.value;
                if (isMultiSelect) {
                  const textElements = selectedElements.filter(el => el.type === 'text');
                  textElements.forEach(el => onCommit(el.id, { fontFamily: newFont }));
                } else {
                  onCommit(element.id, { fontFamily: newFont });
                }
              }}
              className="w-full p-2.5 text-sm border border-gray-300 rounded focus:border-[#5500FF] outline-none bg-white cursor-pointer"
            >
              {PRESET_FONTS.map((font) => (
                <option
                  key={font.value}
                  value={font.value}
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </option>
              ))}
            </select>
            {/* 폰트 미리보기 */}
            <div
              className="p-3 border border-gray-200 rounded bg-gray-50 text-center"
              style={{ fontFamily: element.fontFamily || "'Gowun Dodum', sans-serif" }}
            >
              <span className="text-lg">가나다 ABC 123</span>
            </div>

            {/* 텍스트 정렬 */}
            <div className="space-y-2 mt-3">
              <label className="text-xs font-bold text-gray-500">
                텍스트 정렬{isMultiSelect && ' (일괄 적용)'}
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'left' as const, icon: AlignLeft, label: '왼쪽' },
                  { value: 'center' as const, icon: AlignCenter, label: '가운데' },
                  { value: 'right' as const, icon: AlignRight, label: '오른쪽' }
                ].map(({ value, icon: Icon, label }) => {
                  const isActive = (element.textAlign || 'left') === value;
                  return (
                    <button
                      key={value}
                      onClick={() => {
                        if (isMultiSelect) {
                          const textElements = selectedElements.filter(el => el.type === 'text');
                          textElements.forEach(el => onCommit(el.id, { textAlign: value }));
                        } else {
                          onCommit(element.id, { textAlign: value });
                        }
                      }}
                      className={`flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-medium rounded border transition-all ${isActive
                          ? 'bg-[#5500FF] text-white border-[#5500FF]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-[#5500FF] hover:text-[#5500FF]'
                        }`}
                      title={label}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. AAC 카드 전용 컨트롤 - hasAACCards일 때 표시 */}
        {hasAACCards && (
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">
                  글씨 크기{isMultiSelect && ' (일괄 적용)'}
                </label>
                <SimpleNumberInput
                  value={isAACCard ? (element.metadata?.aacData?.fontSize || 20) : (element.fontSize || 16)}
                  min={8} max={200} unit="px"
                  onChange={(v: number) => {
                    if (hasAACCards && onBatchUpdate) {
                      const aacCards = elements.filter(
                        el => selectedIds.includes(el.id) && el.metadata?.isAACCard
                      );
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
                      handleBulkUpdate({ fontSize: v });
                    }
                  }}
                  onCommit={(v: number) => {
                    if (hasAACCards && onBatchCommit) {
                      const aacCards = elements.filter(
                        el => selectedIds.includes(el.id) && el.metadata?.isAACCard
                      );
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
              <button
                onClick={() => {
                  const currentWeight = isAACCard ? (element.metadata?.aacData?.fontWeight || 400) : (element.fontWeight || 400);
                  const newWeight = currentWeight >= 600 ? 400 : 700;

                  if (hasAACCards && onBatchCommit) {
                    const aacCards = elements.filter(
                      el => selectedIds.includes(el.id) && el.metadata?.isAACCard
                    );
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
                className={`h-[38px] px-4 text-sm font-medium rounded border transition-colors ${((isAACCard ? element.metadata?.aacData?.fontWeight : element.fontWeight) || 400) >= 600
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                두껍게
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">
                글씨 색상{isMultiSelect && ' (일괄 적용)'}
              </label>
              <PopoverColorPicker
                color={isAACCard ? (element.metadata?.aacData?.color || '#000000') : (element.color || '#000000')}
                onChange={(c: string) => {
                  if (hasAACCards && onBatchUpdate) {
                    const aacCards = elements.filter(
                      el => selectedIds.includes(el.id) && el.metadata?.isAACCard
                    );
                    const updates = aacCards.map(card => ({
                      id: card.id,
                      changes: {
                        metadata: {
                          ...card.metadata,
                          aacData: { ...card.metadata?.aacData, color: c }
                        }
                      }
                    }));
                    if (updates.length > 0) onBatchUpdate(updates);
                  } else {
                    handleBulkUpdate({ color: c });
                  }
                }}
                onCommit={(c: string) => {
                  if (hasAACCards && onBatchCommit) {
                    const aacCards = elements.filter(
                      el => selectedIds.includes(el.id) && el.metadata?.isAACCard
                    );
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
                      max="8"
                      step="1"
                      value={localSymbolScale}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setLocalSymbolScale(val);
                        const scale = val / 10; // 1-8 → 0.1-0.8

                        // Build batch updates array for all AAC cards
                        const aacCards = elements.filter(
                          el => selectedIds.includes(el.id) && el.metadata?.isAACCard
                        );
                        const updates = aacCards.map(card => ({
                          id: card.id,
                          changes: {
                            metadata: {
                              ...card.metadata,
                              aacData: { ...card.metadata?.aacData, symbolScale: scale }
                            }
                          }
                        }));

                        // Single batch update call
                        if (onBatchUpdate && updates.length > 0) {
                          onBatchUpdate(updates);
                        }
                      }}
                      onMouseUp={() => {
                        const scale = localSymbolScale / 10; // 1-8 → 0.1-0.8

                        // Build batch commits array for all AAC cards
                        const aacCards = elements.filter(
                          el => selectedIds.includes(el.id) && el.metadata?.isAACCard
                        );
                        const updates = aacCards.map(card => ({
                          id: card.id,
                          changes: {
                            metadata: {
                              ...card.metadata,
                              aacData: { ...card.metadata?.aacData, symbolScale: scale }
                            }
                          }
                        }));

                        // Single batch commit call
                        if (onBatchCommit && updates.length > 0) {
                          onBatchCommit(updates);
                        }
                      }}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5500FF]"
                    />
                    <span className="text-xs text-gray-500 w-8 text-right">
                      {localSymbolScale}
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

                            // Build batch commits array for all AAC cards
                            const aacCards = elements.filter(
                              el => selectedIds.includes(el.id) && el.metadata?.isAACCard
                            );
                            const updates = aacCards.map(card => ({
                              id: card.id,
                              changes: {
                                metadata: {
                                  ...card.metadata,
                                  aacData: { ...card.metadata?.aacData, labelPosition: option.value }
                                }
                              }
                            }));

                            // Single batch commit call
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
        )}

        {/* 다중 선택 시 정렬 및 배분 */}
        {isMultiSelect && (
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <label className="text-xs font-bold text-gray-500">정렬 및 배분</label>
            <div className="flex flex-wrap gap-1">
              <button onClick={() => onAlign?.('left')} className="p-2 border rounded hover:bg-gray-50" title="왼쪽"><AlignLeft className="w-4 h-4" /></button>
              <button onClick={() => onAlign?.('center')} className="p-2 border rounded hover:bg-gray-50" title="가운데"><AlignCenter className="w-4 h-4" /></button>
              <button onClick={() => onAlign?.('right')} className="p-2 border rounded hover:bg-gray-50" title="오른쪽"><AlignRight className="w-4 h-4" /></button>
              <button onClick={() => onAlign?.('top')} className="p-2 border rounded hover:bg-gray-50" title="위쪽"><AlignVerticalJustifyStart className="w-4 h-4" /></button>
              <button onClick={() => onAlign?.('middle')} className="p-2 border rounded hover:bg-gray-50" title="중간"><AlignVerticalJustifyCenter className="w-4 h-4" /></button>
              <button onClick={() => onAlign?.('bottom')} className="p-2 border rounded hover:bg-gray-50" title="아래쪽"><AlignVerticalJustifyEnd className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onAlign?.('distribute-horizontal')} className="px-3 py-2 text-xs border rounded hover:bg-gray-50">가로 간격 동일</button>
              <button onClick={() => onAlign?.('distribute-vertical')} className="px-3 py-2 text-xs border rounded hover:bg-gray-50">세로 간격 동일</button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button onClick={() => onDuplicate(selectedIds)} className="py-2 text-sm font-medium text-[#5500FF] border border-[#5500FF] rounded hover:bg-[#5500FF]/5">복제하기</button>
              <button onClick={() => onDelete(selectedIds)} className="py-2 text-sm font-medium text-red-500 border border-red-500 rounded hover:bg-red-50">삭제하기</button>
            </div>
          </div>
        )}

        <div className="h-px bg-gray-100" />

        {/* 3. 배경 채우기 & 테두리 */}
        {!isLine && !isText && (
          <div className="space-y-6">
            {/* 이미지 업로드 */}
            {!isAACCard && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">이미지 채우기</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onUploadImage?.(); }}
                    className="flex-1 py-2 text-xs font-bold text-gray-700 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5" /> 업로드
                  </button>
                  <button type="button" onClick={() => activeImageTab === 'ai' ? setActiveImageTab('upload') : setActiveImageTab('ai')} className="flex-1 py-2 text-xs font-bold text-[#5500FF] border border-[#5500FF] rounded hover:bg-[#5500FF]/5 flex items-center justify-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> AI 생성
                  </button>
                </div>
                {activeImageTab === 'ai' && (
                  <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <input
                      value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                      placeholder="프롬프트 입력..." className="w-full text-xs p-2 border rounded mb-2 outline-none focus:border-[#5500FF]"
                    />
                    <button onClick={async () => {
                      if (!onGenerateImage) return;
                      setIsGenerating(true);
                      await onGenerateImage(element.id, aiPrompt, 'character');
                      setIsGenerating(false);
                    }} className="w-full py-1.5 bg-[#5500FF] text-white text-xs font-bold rounded">생성하기</button>
                  </div>
                )}
              </div>
            )}

            {/* 배경색 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-500">배경 색상</label>
                <button
                  onClick={() => { onUpdate(element.id, { backgroundColor: 'transparent' }); onCommit(element.id, { backgroundColor: 'transparent' }); }}
                  className="text-[10px] underline text-gray-400 hover:text-gray-600"
                >
                  배경 없음
                </button>
              </div>
              <PopoverColorPicker
                color={element.backgroundColor || '#ffffff'}
                onChange={(c: string) => onUpdate(element.id, { backgroundColor: c })}
                onCommit={(c: string) => onCommit(element.id, { backgroundColor: c })}
              />
            </div>

            {/* 테두리 & 둥글기 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500">테두리 두께</label>
                  <SimpleNumberInput
                    value={element.borderWidth || 0} min={0} max={20} unit="px"
                    onChange={(v: number) => onUpdate(element.id, { borderWidth: v })}
                    onCommit={(v: number) => onCommit(element.id, { borderWidth: v })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">테두리 색상</label>
                <PopoverColorPicker
                  color={element.borderColor || '#000000'}
                  onChange={(c: string) => onUpdate(element.id, { borderColor: c })}
                  onCommit={(c: string) => onCommit(element.id, { borderColor: c })}
                />
              </div>
              {!isLine && (
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500">둥근 모서리</label>
                  <SimpleNumberInput
                    value={element.borderRadius || 0} min={0} max={100} unit="px"
                    onChange={(v: number) => onUpdate(element.id, { borderRadius: v })}
                    onCommit={(v: number) => onCommit(element.id, { borderRadius: v })}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="h-px bg-gray-100" />

        {/* 4. 순서 및 정렬 레이어 */}
        <div className="space-y-3 pb-8">
          <label className="text-xs font-bold text-gray-500">레이어 순서</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onBringToFront?.(element.id)} className="py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700">맨 앞으로</button>
            <button onClick={() => onBringForward(element.id)} className="py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700">앞으로</button>
            <button onClick={() => onSendBackward(element.id)} className="py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700">뒤로</button>
            <button onClick={() => onSendToBack?.(element.id)} className="py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700">맨 뒤로</button>
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => onAlign?.('center')} className="flex-1 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700">가로 중앙</button>
            <button onClick={() => onAlign?.('middle')} className="flex-1 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700">세로 중앙</button>
          </div>
        </div>

      </div>
    </div>
  );
};
