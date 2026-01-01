import React, { useState } from 'react';
import { Pipette } from 'lucide-react';

export interface PopoverColorPickerProps {
    color: string;
    onChange?: (color: string) => void;
    onCommit: (color: string) => void;
}

const PRESET_COLORS = [
    '#000000', '#FFFFFF', '#374151', '#9CA3AF',
    '#EF4444', '#F87171', '#F59E0B', '#FBBF24',
    '#10B981', '#34D399', '#3B82F6', '#60A5FA',
    '#6366F1', '#818CF8', '#8B5CF6', '#A78BFA'
];

/**
 * 팝오버 컬러 피커 (팔레트 숨김, 클릭 시 노출)
 */
export const PopoverColorPicker: React.FC<PopoverColorPickerProps> = ({
    color,
    onChange,
    onCommit
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white group"
            >
                <div className="flex items-center gap-2">
                    <div
                        className="w-5 h-5 rounded border border-gray-200 shadow-sm shrink-0"
                        style={{ backgroundColor: color || '#000000' }}
                    />
                    <span className="text-xs text-gray-600 font-medium uppercase group-hover:text-gray-900">
                        {color || '#000000'}
                    </span>
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
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => {
                                        onChange?.(c);
                                        onCommit(c);
                                        setIsOpen(false);
                                    }}
                                    className={`w-5 h-5 rounded border hover:scale-110 transition-transform ${(color || '#000000') === c
                                            ? 'border-[#5500FF] ring-1 ring-[#5500FF]'
                                            : 'border-gray-200'
                                        }`}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                        </div>

                        <div className="h-px bg-gray-100 my-2" />

                        <div className="text-[10px] font-bold text-gray-400 mb-2">사용자 지정</div>
                        <div className="flex items-center gap-2">
                            {/* Native Color Picker */}
                            <label className="relative cursor-pointer">
                                <input
                                    type="color"
                                    value={color || '#000000'}
                                    onChange={(e) => {
                                        onChange?.(e.target.value);
                                        onCommit(e.target.value);
                                        setIsOpen(false);
                                    }}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                />
                                <div className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <Pipette className="w-4 h-4 text-gray-600" />
                                </div>
                            </label>

                            {/* HEX input */}
                            <input
                                type="text"
                                value={color || '#000000'}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                                        onChange?.(val);
                                    }
                                }}
                                onBlur={(e) => {
                                    const val = e.target.value;
                                    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                                        onCommit(val);
                                        setIsOpen(false);
                                    }
                                }}
                                placeholder="#000000"
                                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs font-medium uppercase focus:outline-none focus:border-[#5500FF]"
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
