
import React, { useState } from 'react';
import { DesignElement } from '../types';
import { PRESET_COLORS, PRESET_FONTS } from '../constants';
import {
  Trash2, Copy, Move, Sliders, ImagePlus, XCircle,
  ChevronUp, ChevronDown, ChevronsUp, ChevronsDown,
  AlignLeft, AlignCenter, AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Triangle, Circle, Square, Minus, Sparkles, Upload, Loader2, Type
} from 'lucide-react';

interface Props {
  elements: DesignElement[];
  selectedIds: string[];
  onUpdate: (id: string, updates: Partial<DesignElement>) => void; // Live update
  onCommit: (id: string, updates: Partial<DesignElement>) => void; // History update
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

export const PropertiesPanel: React.FC<Props> = ({
  elements,
  selectedIds,
  onUpdate,
  onCommit,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onUploadImage,
  onAlign,
  onGenerateImage
}) => {
  const [activeImageTab, setActiveImageTab] = useState<'upload' | 'ai'>('upload');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState<'character' | 'realistic' | 'emoji'>('character');
  const [isGenerating, setIsGenerating] = useState(false);

  if (selectedIds.length === 0) {
    return (
      <div className="w-[280px] bg-white border-l border-gray-200 h-full p-6 text-center text-gray-400 flex flex-col items-center justify-center no-print z-20">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Move className="w-6 h-6 text-gray-300" />
        </div>
        <p className="text-sm font-medium">요소를 선택하여<br />편집을 시작하세요</p>
        <p className="text-xs mt-2 opacity-70">드래그하여 여러 요소를<br />선택할 수 있습니다.</p>
      </div>
    );
  }

  // --- Multi Selection View ---
  if (selectedIds.length > 1) {
    return (
      <div className="w-[280px] bg-white border-l border-gray-200 h-full flex flex-col shadow-sm z-20 no-print">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-[#5500FF]/5">
          <div className="flex items-center justify-center w-5 h-5 bg-[#5500FF] rounded text-white text-[10px] font-bold">
            {selectedIds.length}
          </div>
          <h2 className="text-sm font-bold text-gray-700">개 요소 선택됨</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Bulk Actions */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block">정렬 및 배분</label>
              <div className="grid grid-cols-4 gap-2">
                <button onClick={() => onAlign?.('left')} className="p-2 border rounded hover:bg-gray-50 flex justify-center" title="왼쪽 맞춤"><AlignLeft className="w-4 h-4" /></button>
                <button onClick={() => onAlign?.('center')} className="p-2 border rounded hover:bg-gray-50 flex justify-center" title="가운데 맞춤"><AlignCenter className="w-4 h-4" /></button>
                <button onClick={() => onAlign?.('right')} className="p-2 border rounded hover:bg-gray-50 flex justify-center" title="오른쪽 맞춤"><AlignRight className="w-4 h-4" /></button>
                <button onClick={() => onAlign?.('distribute-horizontal')} className="p-2 border rounded hover:bg-gray-50 flex justify-center disabled:opacity-30 disabled:hover:bg-transparent" title="가로 간격 동일하게" disabled={selectedIds.length < 3}><AlignHorizontalDistributeCenter className="w-4 h-4" /></button>

                <button onClick={() => onAlign?.('top')} className="p-2 border rounded hover:bg-gray-50 flex justify-center" title="위쪽 맞춤"><AlignVerticalJustifyStart className="w-4 h-4" /></button>
                <button onClick={() => onAlign?.('middle')} className="p-2 border rounded hover:bg-gray-50 flex justify-center" title="중간 맞춤"><AlignVerticalJustifyCenter className="w-4 h-4" /></button>
                <button onClick={() => onAlign?.('bottom')} className="p-2 border rounded hover:bg-gray-50 flex justify-center" title="아래쪽 맞춤"><AlignVerticalJustifyEnd className="w-4 h-4" /></button>
                <button onClick={() => onAlign?.('distribute-vertical')} className="p-2 border rounded hover:bg-gray-50 flex justify-center disabled:opacity-30 disabled:hover:bg-transparent" title="세로 간격 동일하게" disabled={selectedIds.length < 3}><AlignVerticalDistributeCenter className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <button
                onClick={() => onDuplicate(selectedIds)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium bg-[#B0C0ff]/20 hover:bg-[#B0C0ff]/30 text-[#5500FF] rounded-lg transition-colors border border-[#B0C0ff]/20"
              >
                <Copy className="w-3.5 h-3.5" /> 선택 요소 복제하기
              </button>
              <button
                onClick={() => onDelete(selectedIds)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-100"
              >
                <Trash2 className="w-3.5 h-3.5" /> 선택 요소 삭제하기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Single Selection View ---
  const element = elements.find(el => el.id === selectedIds[0]);
  if (!element) return null;

  const isLineOrArrow = element.type === 'line' || element.type === 'arrow';

  return (
    <div className="w-[280px] bg-white border-l border-gray-200 h-full flex flex-col shadow-sm z-20 no-print">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <Sliders className="w-4 h-4 text-gray-500" />
        <h2 className="text-sm font-bold text-gray-700">속성 편집</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">

        {/* Content Editing for Text */}
        {element.type === 'text' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500">텍스트 내용</label>
              <textarea
                value={element.content}
                onChange={(e) => onUpdate(element.id, { content: e.target.value })}
                onBlur={(e) => onCommit(element.id, { content: e.target.value })}
                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B0C0ff] focus:border-[#5500FF] transition-all resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <Type className="w-3 h-3" /> 글꼴(폰트)
              </label>
              <select
                value={element.fontFamily || PRESET_FONTS[0].value}
                onChange={(e) => {
                  onUpdate(element.id, { fontFamily: e.target.value });
                  onCommit(element.id, { fontFamily: e.target.value });
                }}
                className="w-full p-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#5500FF]"
              >
                {PRESET_FONTS.map((font, idx) => (
                  <option key={idx} value={font.value} style={{ fontFamily: font.value }}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Image Handling for Shapes/Cards */}
        {(element.type === 'shape' || element.type === 'card' || element.type === 'circle') && (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-500">이미지 채우기</label>

            <div className="flex p-1 bg-gray-100 rounded-lg gap-1">
              <button
                onClick={() => setActiveImageTab('upload')}
                className={`flex-1 py-1 text-xs font-medium rounded-md flex items-center justify-center gap-1 transition-all ${activeImageTab === 'upload' ? 'bg-white shadow-sm text-[#5500FF]' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Upload className="w-3 h-3" /> 업로드
              </button>
              <button
                onClick={() => setActiveImageTab('ai')}
                className={`flex-1 py-1 text-xs font-medium rounded-md flex items-center justify-center gap-1 transition-all ${activeImageTab === 'ai' ? 'bg-white shadow-sm text-[#5500FF]' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Sparkles className="w-3 h-3" /> AI 생성
              </button>
            </div>

            {activeImageTab === 'upload' ? (
              <div className="flex gap-2">
                <button
                  onClick={onUploadImage}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium bg-[#B0C0ff]/10 hover:bg-[#B0C0ff]/20 text-[#5500FF] rounded-lg transition-colors border border-[#B0C0ff]/20"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  {element.backgroundImage ? '이미지 변경' : '이미지 선택'}
                </button>
                {element.backgroundImage && (
                  <button
                    onClick={() => onCommit(element.id, { backgroundImage: undefined })}
                    className="flex items-center justify-center px-3 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                    title="이미지 제거"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2 bg-[#5500FF]/5 p-3 rounded-lg border border-[#5500FF]/10">
                <select
                  value={aiStyle}
                  onChange={(e) => setAiStyle(e.target.value as any)}
                  className="w-full text-[10px] p-1.5 rounded border border-gray-200 bg-white"
                >
                  <option value="character">캐릭터/일러스트</option>
                  <option value="realistic">실사/사진</option>
                  <option value="emoji">3D 이모지</option>
                </select>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="생성할 이미지 묘사 (예: 노란색 별)"
                  className="w-full p-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#5500FF] h-16 resize-none bg-white"
                />
                <button
                  onClick={async () => {
                    if (onGenerateImage && aiPrompt) {
                      setIsGenerating(true);
                      await onGenerateImage(element.id, aiPrompt, aiStyle);
                      setIsGenerating(false);
                      setAiPrompt('');
                    }
                  }}
                  disabled={isGenerating || !aiPrompt}
                  className="w-full py-1.5 bg-[#5500FF] text-white rounded text-xs font-medium hover:bg-[#4400cc] disabled:bg-gray-300 flex items-center justify-center gap-1"
                >
                  {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : '이미지 생성 및 채우기'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Alignment for Single Element */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-2 block">캔버스 정렬</label>
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => onAlign?.('left')} className="p-2 border rounded hover:bg-gray-50 flex justify-center" title="왼쪽 맞춤"><AlignLeft className="w-4 h-4" /></button>
            <button onClick={() => onAlign?.('center')} className="p-2 border rounded hover:bg-gray-50 flex justify-center" title="가운데 맞춤"><AlignCenter className="w-4 h-4" /></button>
            <button onClick={() => onAlign?.('right')} className="p-2 border rounded hover:bg-gray-50 flex justify-center" title="오른쪽 맞춤"><AlignRight className="w-4 h-4" /></button>
            <button onClick={() => onAlign?.('distribute-horizontal')} className="p-2 border rounded hover:bg-gray-50 flex justify-center disabled:opacity-30 disabled:hover:bg-transparent" title="가로 간격 동일하게" disabled={true}><AlignHorizontalDistributeCenter className="w-4 h-4" /></button>

            <button onClick={() => onAlign?.('top')} className="p-2 border rounded hover:bg-gray-50 flex justify-center" title="위쪽 맞춤"><AlignVerticalJustifyStart className="w-4 h-4" /></button>
            <button onClick={() => onAlign?.('middle')} className="p-2 border rounded hover:bg-gray-50 flex justify-center" title="중간 맞춤"><AlignVerticalJustifyCenter className="w-4 h-4" /></button>
            <button onClick={() => onAlign?.('bottom')} className="p-2 border rounded hover:bg-gray-50 flex justify-center" title="아래쪽 맞춤"><AlignVerticalJustifyEnd className="w-4 h-4" /></button>
            <button onClick={() => onAlign?.('distribute-vertical')} className="p-2 border rounded hover:bg-gray-50 flex justify-center disabled:opacity-30 disabled:hover:bg-transparent" title="세로 간격 동일하게" disabled={true}><AlignVerticalDistributeCenter className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Arrow Head Style Options */}
        {element.type === 'arrow' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500">화살표 끝 모양</label>
            <div className="flex gap-2">
              <button
                onClick={() => onCommit(element.id, { arrowHeadType: 'triangle' })}
                className={`flex-1 h-8 border rounded flex items-center justify-center hover:bg-gray-50 transition-colors ${(!element.arrowHeadType || element.arrowHeadType === 'triangle') ? 'border-[#5500FF] bg-[#5500FF]/5' : 'border-gray-200'}`}
                title="삼각형"
              >
                <Triangle className="w-4 h-4 rotate-90 fill-current" />
              </button>
              <button
                onClick={() => onCommit(element.id, { arrowHeadType: 'circle' })}
                className={`flex-1 h-8 border rounded flex items-center justify-center hover:bg-gray-50 transition-colors ${element.arrowHeadType === 'circle' ? 'border-[#5500FF] bg-[#5500FF]/5' : 'border-gray-200'}`}
                title="원"
              >
                <Circle className="w-4 h-4 fill-current" />
              </button>
              <button
                onClick={() => onCommit(element.id, { arrowHeadType: 'square' })}
                className={`flex-1 h-8 border rounded flex items-center justify-center hover:bg-gray-50 transition-colors ${element.arrowHeadType === 'square' ? 'border-[#5500FF] bg-[#5500FF]/5' : 'border-gray-200'}`}
                title="사각형"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
              <button
                onClick={() => onCommit(element.id, { arrowHeadType: 'none' })}
                className={`flex-1 h-8 border rounded flex items-center justify-center hover:bg-gray-50 transition-colors ${element.arrowHeadType === 'none' ? 'border-[#5500FF] bg-[#5500FF]/5' : 'border-gray-200'}`}
                title="없음"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Colors */}
        {(element.type === 'shape' || element.type === 'card' || element.type === 'circle' || element.type === 'text' || isLineOrArrow) && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500">
              {element.type === 'text' ? '텍스트 색상' : (isLineOrArrow ? '선 색상' : '채우기 색상')}
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(color => {
                const currentColor = element.type === 'text'
                  ? element.color
                  : (isLineOrArrow ? element.borderColor : element.backgroundColor);

                return (
                  <button
                    key={color}
                    onClick={() => {
                      let updates = {};
                      if (element.type === 'text') updates = { color };
                      else if (isLineOrArrow) updates = { borderColor: color };
                      else updates = { backgroundColor: color };
                      onCommit(element.id, updates);
                    }}
                    className={`w-7 h-7 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 active:scale-95 ${currentColor === color ? 'ring-2 ring-offset-2 ring-[#5500FF]' : ''
                      }`}
                    style={{ backgroundColor: color }}
                  />
                );
              })}
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                <input
                  type="color"
                  value={
                    element.type === 'text'
                      ? element.color
                      : (isLineOrArrow ? element.borderColor : element.backgroundColor) || '#000000'
                  }
                  onChange={(e) => {
                    let updates = {};
                    if (element.type === 'text') updates = { color: e.target.value };
                    else if (isLineOrArrow) updates = { borderColor: e.target.value };
                    else updates = { backgroundColor: e.target.value };
                    onUpdate(element.id, updates);
                  }}
                  onBlur={(e) => {
                    let updates = {};
                    if (element.type === 'text') updates = { color: e.target.value };
                    else if (isLineOrArrow) updates = { borderColor: e.target.value };
                    else updates = { backgroundColor: e.target.value };
                    onCommit(element.id, updates);
                  }}
                  className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 border-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Text Specifics */}
        {element.type === 'text' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-500">글자 크기</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="12"
                  max="200"
                  value={element.fontSize || 24}
                  onChange={(e) => onUpdate(element.id, { fontSize: parseInt(e.target.value) || 12 })}
                  onBlur={(e) => onCommit(element.id, { fontSize: parseInt(e.target.value) || 12 })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onCommit(element.id, { fontSize: parseInt((e.target as HTMLInputElement).value) || 12 });
                    }
                  }}
                  className="w-12 p-1 text-xs border border-gray-200 rounded text-right focus:outline-none focus:border-[#5500FF]"
                />
                <span className="text-xs text-gray-400">px</span>
              </div>
            </div>
            <input
              type="range"
              min="12"
              max="120"
              value={element.fontSize}
              onChange={(e) => onUpdate(element.id, { fontSize: parseInt(e.target.value) })}
              onMouseUp={(e) => onCommit(element.id, { fontSize: parseInt((e.target as HTMLInputElement).value) })}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5500FF]"
            />
          </div>
        )}

        {/* Border / Radius / Line Thickness */}
        {(element.type !== 'text') && (
          <div className="space-y-5">
            {!isLineOrArrow && element.type !== 'circle' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-500">둥근 모서리</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={element.borderRadius || 0}
                      onChange={(e) => onUpdate(element.id, { borderRadius: parseInt(e.target.value) || 0 })}
                      onBlur={(e) => onCommit(element.id, { borderRadius: parseInt(e.target.value) || 0 })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onCommit(element.id, { borderRadius: parseInt((e.target as HTMLInputElement).value) || 0 });
                        }
                      }}
                      className="w-12 p-1 text-xs border border-gray-200 rounded text-right focus:outline-none focus:border-[#5500FF]"
                    />
                    <span className="text-xs text-gray-400">px</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={element.borderRadius || 0}
                  onChange={(e) => onUpdate(element.id, { borderRadius: parseInt(e.target.value) })}
                  onMouseUp={(e) => onCommit(element.id, { borderRadius: parseInt((e.target as HTMLInputElement).value) })}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5500FF]"
                />
              </div>
            )}

            {element.type !== 'image' && (
              <div className="space-y-3">
                {/* 테두리 두께 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-500">
                      {isLineOrArrow ? '선 두께' : '테두리 두께'}
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={element.borderWidth || 0}
                        onChange={(e) => onUpdate(element.id, { borderWidth: parseInt(e.target.value) || 0 })}
                        onBlur={(e) => onCommit(element.id, { borderWidth: parseInt(e.target.value) || 0 })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onCommit(element.id, { borderWidth: parseInt((e.target as HTMLInputElement).value) || 0 });
                          }
                        }}
                        className="w-12 p-1 text-xs border border-gray-200 rounded text-right focus:outline-none focus:border-[#5500FF]"
                      />
                      <span className="text-xs text-gray-400">px</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={element.borderWidth || 0}
                      onChange={(e) => onUpdate(element.id, { borderWidth: parseInt(e.target.value) })}
                      onMouseUp={(e) => onCommit(element.id, { borderWidth: parseInt((e.target as HTMLInputElement).value) })}
                      className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5500FF]"
                    />
                    <button
                      onClick={() => onCommit(element.id, { borderWidth: 0 })}
                      className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${(element.borderWidth || 0) === 0
                          ? 'bg-[#5500FF] text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                      없음
                    </button>
                  </div>
                </div>

                {/* 테두리 색상 (두께가 있을 때만 표시) */}
                {!isLineOrArrow && (element.borderWidth || 0) > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500">테두리 색상</label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => onCommit(element.id, { borderColor: color })}
                          className={`w-6 h-6 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 active:scale-95 ${element.borderColor === color ? 'ring-2 ring-offset-1 ring-[#5500FF]' : ''
                            }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                        <input
                          type="color"
                          value={element.borderColor || '#000000'}
                          onChange={(e) => onUpdate(element.id, { borderColor: e.target.value })}
                          onBlur={(e) => onCommit(element.id, { borderColor: e.target.value })}
                          className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 border-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Line Style Options */}
            {isLineOrArrow && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500">선 종류</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onCommit(element.id, { borderStyle: 'solid' })}
                    className={`flex-1 h-8 border rounded flex items-center justify-center hover:bg-gray-50 transition-colors ${(!element.borderStyle || element.borderStyle === 'solid') ? 'border-[#5500FF] bg-[#5500FF]/5' : 'border-gray-200'}`}
                    title="실선"
                  >
                    <div className="w-8 h-0.5 bg-current text-gray-800"></div>
                  </button>
                  <button
                    onClick={() => onCommit(element.id, { borderStyle: 'dashed' })}
                    className={`flex-1 h-8 border rounded flex items-center justify-center hover:bg-gray-50 transition-colors ${element.borderStyle === 'dashed' ? 'border-[#5500FF] bg-[#5500FF]/5' : 'border-gray-200'}`}
                    title="파선"
                  >
                    <div className="w-8 h-0.5 bg-transparent border-t-2 border-dashed border-gray-800"></div>
                  </button>
                  <button
                    onClick={() => onCommit(element.id, { borderStyle: 'dotted' })}
                    className={`flex-1 h-8 border rounded flex items-center justify-center hover:bg-gray-50 transition-colors ${element.borderStyle === 'dotted' ? 'border-[#5500FF] bg-[#5500FF]/5' : 'border-gray-200'}`}
                    title="점선"
                  >
                    <div className="w-8 h-0.5 bg-transparent border-t-2 border-dotted border-gray-800"></div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Layering & Actions */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">레이어 순서</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => onSendToBack?.(element.id)}
                className="flex items-center justify-center p-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-colors"
                title="맨 뒤로"
              >
                <ChevronsDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSendBackward(element.id)}
                className="flex items-center justify-center p-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-colors"
                title="뒤로"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => onBringForward(element.id)}
                className="flex items-center justify-center p-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-colors"
                title="앞으로"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => onBringToFront?.(element.id)}
                className="flex items-center justify-center p-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 transition-colors"
                title="맨 앞으로"
              >
                <ChevronsUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onDuplicate([element.id])}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium bg-[#B0C0ff]/20 hover:bg-[#B0C0ff]/30 text-[#5500FF] rounded-lg transition-colors border border-[#B0C0ff]/20"
            >
              <Copy className="w-3.5 h-3.5" /> 요소 복제하기
            </button>
            <button
              onClick={() => onDelete([element.id])}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-100"
            >
              <Trash2 className="w-3.5 h-3.5" /> 요소 삭제하기
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
