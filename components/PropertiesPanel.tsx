import React, { useState } from 'react';
import { DesignElement, TextCommand, TextStyle } from '../types/editor.types';
import { resetStylesInHtml } from '../utils/textUtils';
import { PRESET_FONTS } from '../constants';
import {
  Trash2, Copy,
  AlignLeft, AlignCenter, AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd
} from 'lucide-react';
import { AlignmentControls, CommonActions, ShapeControls, TextControls, AACControls, ImageFillControls, LineControls } from './properties';

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
  activeTextStyle?: TextStyle | null;
  onTextCommand?: (cmd: TextCommand) => void;
}

export const PropertiesPanel: React.FC<Props> = ({
  elements, selectedIds, onUpdate, onCommit, onBatchUpdate, onBatchCommit, onDelete, onDuplicate,
  onBringForward, onSendBackward, onBringToFront, onSendToBack,
  onUploadImage, onAlign, onGenerateImage,
  activeTextStyle, onTextCommand
}) => {

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



  // 텍스트 편집 중일 때 선택된 스타일 보여주기
  const displayElement = (activeTextStyle && element.type === 'text' && selectedIds.length === 1) ? {
    ...element,
    fontSize: activeTextStyle.fontSize,
    fontFamily: activeTextStyle.fontFamily,
    fontWeight: activeTextStyle.isBold ? 700 : 400,
    color: activeTextStyle.color,
    fontStyle: activeTextStyle.isItalic ? 'italic' : 'normal',
    textDecoration: [
      activeTextStyle.isUnderline ? 'underline' : '',
      activeTextStyle.isStrikethrough ? 'line-through' : ''
    ].filter(Boolean).join(' ') || 'none'
  } : element;

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

        {/* 텍스트 컨트롤 */}
        {isText && (
          <TextControls
            element={element}
            displayElement={displayElement}
            selectedElements={selectedElements}
            isMultiSelect={isMultiSelect}
            activeTextStyle={activeTextStyle}
            onUpdate={onUpdate}
            onCommit={onCommit}
            onTextCommand={onTextCommand}
          />
        )}

        {/* 2. AAC 카드 전용 컨트롤 - hasAACCards일 때 표시 */}
        {hasAACCards && (
          <AACControls
            element={element}
            displayElement={displayElement}
            selectedElements={selectedElements}
            selectedIds={selectedIds}
            isMultiSelect={isMultiSelect}
            hasAACCards={hasAACCards}
            activeTextStyle={activeTextStyle}
            onUpdate={onUpdate}
            onCommit={onCommit}
            onBatchUpdate={onBatchUpdate}
            onBatchCommit={onBatchCommit}
            onTextCommand={onTextCommand}
          />
        )}

        {/* 다중 선택 시 정렬 및 배분 */}
        {isMultiSelect && (
          <AlignmentControls
            selectedIds={selectedIds}
            onAlign={onAlign}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        )}

        <div className="h-px bg-gray-100" />

        {/* 3. 배경 채우기 & 테두리 */}
        {!isText && (
          <div className="space-y-6">
            {!isLine && !isAACCard && (
              <ImageFillControls
                element={element}
                onUploadImage={onUploadImage}
                onGenerateImage={onGenerateImage}
              />
            )}

            {isLine ? (
              <LineControls
                element={element}
                onUpdate={onUpdate}
                onCommit={onCommit}
              />
            ) : (
              <ShapeControls
                element={element}
                isLine={false} // Always false here since we separated LineControls
                onUpdate={onUpdate}
                onCommit={onCommit}
              />
            )}
          </div>
        )}

        <div className="h-px bg-gray-100" />

        {/* 4. 순서 및 정렬 레이어 */}
        <CommonActions
          elementId={element.id}
          onBringForward={onBringForward}
          onSendBackward={onSendBackward}
          onBringToFront={onBringToFront}
          onSendToBack={onSendToBack}
          onAlign={onAlign}
        />

      </div>
    </div>
  );
};
