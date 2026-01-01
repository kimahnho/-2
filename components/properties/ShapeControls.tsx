import React from 'react';
import { DesignElement } from '../../types';
import { PopoverColorPicker } from './inputs/PopoverColorPicker';
import { SimpleNumberInput } from './inputs/SimpleNumberInput';

interface ShapeControlsProps {
    element: DesignElement;
    isLine: boolean;
    onUpdate: (id: string, updates: Partial<DesignElement>) => void;
    onCommit: (id: string, updates: Partial<DesignElement>) => void;
}

/**
 * ShapeControls - 도형 전용 컨트롤
 * 배경색, 테두리 (두께, 색상), 둥근 모서리
 */
export const ShapeControls: React.FC<ShapeControlsProps> = ({
    element,
    isLine,
    onUpdate,
    onCommit
}) => {
    return (
        <div className="space-y-6">
            {/* 배경 색상 */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-500">배경 색상</label>
                    <button
                        onClick={() => {
                            onUpdate(element.id, { backgroundColor: 'transparent' });
                            onCommit(element.id, { backgroundColor: 'transparent' });
                        }}
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
                {/* 테두리 두께 */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-500">테두리 두께</label>
                        <SimpleNumberInput
                            value={element.borderWidth || 0}
                            min={0}
                            max={20}
                            unit="px"
                            onChange={(v: number) => onUpdate(element.id, { borderWidth: v })}
                            onCommit={(v: number) => onCommit(element.id, { borderWidth: v })}
                        />
                    </div>
                </div>

                {/* 테두리 색상 */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">테두리 색상</label>
                    <PopoverColorPicker
                        color={element.borderColor || '#000000'}
                        onChange={(c: string) => onUpdate(element.id, { borderColor: c })}
                        onCommit={(c: string) => onCommit(element.id, { borderColor: c })}
                    />
                </div>

                {/* 둥근 모서리 (선이 아닐 때만) */}
                {!isLine && (
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-500">둥근 모서리</label>
                        <SimpleNumberInput
                            value={element.borderRadius || 0}
                            min={0}
                            max={100}
                            unit="px"
                            onChange={(v: number) => onUpdate(element.id, { borderRadius: v })}
                            onCommit={(v: number) => onCommit(element.id, { borderRadius: v })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
