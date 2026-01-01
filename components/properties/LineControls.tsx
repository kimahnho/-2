import React from 'react';
import { DesignElement } from '../../types';
import { PopoverColorPicker } from './inputs/PopoverColorPicker';
import { SimpleNumberInput } from './inputs/SimpleNumberInput';
import { AlignJustify, Minus, MoreHorizontal } from 'lucide-react';

interface LineControlsProps {
    element: DesignElement;
    onUpdate: (id: string, updates: Partial<DesignElement>) => void;
    onCommit: (id: string, updates: Partial<DesignElement>) => void;
}

export const LineControls: React.FC<LineControlsProps> = ({
    element,
    onUpdate,
    onCommit
}) => {
    return (
        <div className="space-y-6">
            {/* 테두리 두께 */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500">선 두께</label>
                    <SimpleNumberInput
                        value={element.borderWidth || 2}
                        min={1}
                        max={50}
                        unit="px"
                        onChange={(v) => onUpdate(element.id, { borderWidth: v })}
                        onCommit={(v) => onCommit(element.id, { borderWidth: v })}
                    />
                </div>
            </div>

            {/* 테두리 색상 */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">선 색상</label>
                <PopoverColorPicker
                    color={element.borderColor || '#000000'}
                    onChange={(c) => onUpdate(element.id, { borderColor: c })}
                    onCommit={(c) => onCommit(element.id, { borderColor: c })}
                />
            </div>

            {/* 선 스타일 (실선, 파선, 점선) */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">선 스타일</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            onUpdate(element.id, { borderStyle: 'solid' });
                            onCommit(element.id, { borderStyle: 'solid' });
                        }}
                        className={`flex-1 p-2 border rounded flex items-center justify-center hover:bg-gray-50 h-9 ${element.borderStyle === 'solid' || !element.borderStyle ? 'border-[#5500FF] bg-blue-50 text-[#5500FF]' : 'border-gray-200 text-gray-600'}`}
                        title="실선"
                    >
                        <div className="w-full max-w-[24px] border-b-2 border-solid border-current" />
                    </button>
                    <button
                        onClick={() => {
                            onUpdate(element.id, { borderStyle: 'dashed' });
                            onCommit(element.id, { borderStyle: 'dashed' });
                        }}
                        className={`flex-1 p-2 border rounded flex items-center justify-center hover:bg-gray-50 h-9 ${element.borderStyle === 'dashed' ? 'border-[#5500FF] bg-blue-50 text-[#5500FF]' : 'border-gray-200 text-gray-600'}`}
                        title="파선 (긴 점선)"
                    >
                        <div className="w-full max-w-[24px] border-b-2 border-dashed border-current" />
                    </button>
                    <button
                        onClick={() => {
                            onUpdate(element.id, { borderStyle: 'dotted' });
                            onCommit(element.id, { borderStyle: 'dotted' });
                        }}
                        className={`flex-1 p-2 border rounded flex items-center justify-center hover:bg-gray-50 h-9 ${element.borderStyle === 'dotted' ? 'border-[#5500FF] bg-blue-50 text-[#5500FF]' : 'border-gray-200 text-gray-600'}`}
                        title="점선 (짧은 점선)"
                    >
                        <div className="w-full max-w-[24px] border-b-2 border-dotted border-current" />
                    </button>
                </div>
            </div>

            {/* 점선 간격 비율 (점선일 때만 표시) */}
            {(element.borderStyle === 'dashed' || element.borderStyle === 'dotted') && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-500">점선 간격 비율</label>
                        <span className="text-xs text-gray-400">x{element.borderDashScale || 1}</span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={element.borderDashScale || 1}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            onUpdate(element.id, { borderDashScale: val });
                        }}
                        onMouseUp={(e) => {
                            const val = parseFloat((e.target as HTMLInputElement).value);
                            onCommit(element.id, { borderDashScale: val });
                        }}
                        className="w-full accent-[#5500FF]"
                    />
                </div>
            )}
        </div>
    );
};
