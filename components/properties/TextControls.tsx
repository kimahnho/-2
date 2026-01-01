import React from 'react';
import { DesignElement, TextCommand, TextStyle } from '../../types/editor.types';
import { resetStylesInHtml } from '../../utils/textUtils';
import { PRESET_FONTS } from '../../constants';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Strikethrough } from 'lucide-react';
import { PopoverColorPicker } from './inputs/PopoverColorPicker';
import { SimpleNumberInput } from './inputs/SimpleNumberInput';

interface TextControlsProps {
    element: DesignElement;
    displayElement: DesignElement;
    selectedElements: DesignElement[];
    isMultiSelect: boolean;
    activeTextStyle?: TextStyle | null;
    onUpdate: (id: string, updates: Partial<DesignElement>) => void;
    onCommit: (id: string, updates: Partial<DesignElement>) => void;
    onTextCommand?: (cmd: TextCommand) => void;
}

/**
 * TextControls - 텍스트 전용 컨트롤
 * 폰트, 크기, 색상, 정렬, 자간, 행간
 */
export const TextControls: React.FC<TextControlsProps> = ({
    element,
    displayElement,
    selectedElements,
    isMultiSelect,
    activeTextStyle,
    onUpdate,
    onCommit,
    onTextCommand
}) => {
    // Helper to toggle text decoration
    const toggleTextDecoration = (current: string | undefined, type: 'underline' | 'line-through'): 'none' | 'underline' | 'line-through' | 'underline line-through' => {
        const parts = (current || 'none').split(' ').filter(p => p !== 'none' && p !== '');
        const hasType = parts.includes(type);

        let newParts = hasType
            ? parts.filter(p => p !== type)
            : [...parts, type];

        // Sort to match union type order consistency if needed, though strictly exact match might not be required by TS if typed as string, but here we have strict union.
        // Union: 'none' | 'underline' | 'line-through' | 'underline line-through'
        // Let's normalize: 'underline', 'line-through', 'underline line-through'

        const hasUnderline = newParts.includes('underline');
        const hasLineThrough = newParts.includes('line-through');

        if (hasUnderline && hasLineThrough) return 'underline line-through';
        if (hasUnderline) return 'underline';
        if (hasLineThrough) return 'line-through';
        return 'none';
    };

    return (
        <div className="space-y-2">
            {/* 폰트 선택 */}
            <label className="text-xs font-bold text-gray-500">
                폰트{isMultiSelect && ' (일괄 적용)'}
            </label>
            <select
                value={displayElement.fontFamily || "'Gowun Dodum', sans-serif"}
                onChange={(e) => {
                    const newFont = e.target.value;
                    if (activeTextStyle && onTextCommand) {
                        onTextCommand({ type: 'fontName', value: newFont, id: element.id });
                    } else if (isMultiSelect) {
                        selectedElements.filter(el => el.type === 'text').forEach(el => {
                            let updates: Partial<DesignElement> = { fontFamily: newFont };
                            if (el.richTextHtml) {
                                updates.richTextHtml = resetStylesInHtml(el.richTextHtml, ['font-family']);
                            }
                            onUpdate(el.id, updates);
                        });
                    } else {
                        let updates: Partial<DesignElement> = { fontFamily: newFont };
                        if (element.richTextHtml) {
                            updates.richTextHtml = resetStylesInHtml(element.richTextHtml, ['font-family']);
                        }
                        onUpdate(element.id, updates);
                    }
                }}
                className="w-full p-2.5 text-sm border border-gray-300 rounded focus:border-[#5500FF] outline-none bg-white cursor-pointer"
            >
                {PRESET_FONTS.map((font) => (
                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                        {font.label}
                    </option>
                ))}
            </select>

            {/* 폰트 미리보기 */}
            <div
                className="p-3 border border-gray-200 rounded bg-gray-50 text-center"
                style={{
                    fontFamily: displayElement.fontFamily || "'Gowun Dodum', sans-serif",
                    fontWeight: displayElement.fontWeight,
                    fontStyle: displayElement.fontStyle,
                    textDecoration: displayElement.textDecoration
                }}
            >
                <span className="text-lg">가나다 ABC 123</span>
            </div>

            {/* 글씨 크기 */}
            <div className="space-y-1 mt-3">
                <label className="text-xs font-bold text-gray-500">글씨 크기</label>
                <SimpleNumberInput
                    value={displayElement.fontSize || 16}
                    min={8}
                    max={200}
                    unit="px"
                    onChange={(v: number) => {
                        if (activeTextStyle && onTextCommand) {
                            onTextCommand({ type: 'fontSize', value: v, id: element.id });
                        } else if (isMultiSelect) {
                            selectedElements.filter(el => el.type === 'text').forEach(el => {
                                let updates: Partial<DesignElement> = { fontSize: v };
                                if (el.richTextHtml) {
                                    updates.richTextHtml = resetStylesInHtml(el.richTextHtml, ['font-size']);
                                }
                                onUpdate(el.id, updates);
                            });
                        } else {
                            let updates: Partial<DesignElement> = { fontSize: v };
                            if (element.richTextHtml) {
                                updates.richTextHtml = resetStylesInHtml(element.richTextHtml, ['font-size']);
                            }
                            onUpdate(element.id, updates);
                        }
                    }}
                    onCommit={(v: number) => {
                        if (activeTextStyle && onTextCommand) {
                            onTextCommand({ type: 'fontSize', value: v, id: element.id });
                        } else if (isMultiSelect) {
                            selectedElements.filter(el => el.type === 'text').forEach(el => {
                                let updates: Partial<DesignElement> = { fontSize: v };
                                if (el.richTextHtml) {
                                    updates.richTextHtml = resetStylesInHtml(el.richTextHtml, ['font-size']);
                                }
                                onCommit(el.id, updates);
                            });
                        } else {
                            let updates: Partial<DesignElement> = { fontSize: v };
                            if (element.richTextHtml) {
                                updates.richTextHtml = resetStylesInHtml(element.richTextHtml, ['font-size']);
                            }
                            onCommit(element.id, updates);
                        }
                    }}
                />
            </div>

            {/* 스타일 (B I U S) */}
            <div className="grid grid-cols-4 gap-2 mt-3">
                {/* Bold */}
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                        const currentWeight = displayElement.fontWeight || 400;
                        const newWeight = currentWeight >= 600 ? 400 : 700;

                        if (activeTextStyle && onTextCommand) {
                            onTextCommand({ type: 'bold', value: newWeight >= 600, id: element.id });
                        } else if (isMultiSelect) {
                            selectedElements.filter(el => el.type === 'text').forEach(el => {
                                let updates: Partial<DesignElement> = { fontWeight: newWeight };
                                if (el.richTextHtml) updates.richTextHtml = resetStylesInHtml(el.richTextHtml, ['font-weight']);
                                onCommit(el.id, updates);
                            });
                        } else {
                            let updates: Partial<DesignElement> = { fontWeight: newWeight };
                            if (element.richTextHtml) updates.richTextHtml = resetStylesInHtml(element.richTextHtml, ['font-weight']);
                            onCommit(element.id, updates);
                        }
                    }}
                    className={`h-[38px] flex items-center justify-center rounded border transition-colors ${(displayElement.fontWeight || 400) >= 600
                        ? 'bg-[#5500FF] text-white border-[#5500FF]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#5500FF] hover:text-[#5500FF]'
                        }`}
                    title="굵게"
                >
                    <Bold className="w-4 h-4" />
                </button>

                {/* Italic */}
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                        const isItalic = displayElement.fontStyle === 'italic';
                        const newStyle = isItalic ? 'normal' : 'italic';

                        if (activeTextStyle && onTextCommand) {
                            onTextCommand({ type: 'italic', value: !isItalic, id: element.id });
                        } else if (isMultiSelect) {
                            selectedElements.filter(el => el.type === 'text').forEach(el => {
                                let updates: Partial<DesignElement> = { fontStyle: newStyle };
                                // Can't easily reset italic in inline HTML via current resetStylesInHtml
                                onCommit(el.id, updates);
                            });
                        } else {
                            let updates: Partial<DesignElement> = { fontStyle: newStyle };
                            onCommit(element.id, updates);
                        }
                    }}
                    className={`h-[38px] flex items-center justify-center rounded border transition-colors ${displayElement.fontStyle === 'italic'
                        ? 'bg-[#5500FF] text-white border-[#5500FF]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#5500FF] hover:text-[#5500FF]'
                        }`}
                    title="기울임"
                >
                    <Italic className="w-4 h-4" />
                </button>

                {/* Underline */}
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                        const currentDecoration = displayElement.textDecoration;
                        const newDecoration = toggleTextDecoration(currentDecoration, 'underline');

                        if (activeTextStyle && onTextCommand) {
                            onTextCommand({ type: 'underline', value: !currentDecoration?.includes('underline'), id: element.id });
                        } else if (isMultiSelect) {
                            selectedElements.filter(el => el.type === 'text').forEach(el => {
                                let updates: Partial<DesignElement> = { textDecoration: newDecoration };
                                onCommit(el.id, updates);
                            });
                        } else {
                            let updates: Partial<DesignElement> = { textDecoration: newDecoration };
                            onCommit(element.id, updates);
                        }
                    }}
                    className={`h-[38px] flex items-center justify-center rounded border transition-colors ${displayElement.textDecoration?.includes('underline')
                        ? 'bg-[#5500FF] text-white border-[#5500FF]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#5500FF] hover:text-[#5500FF]'
                        }`}
                    title="밑줄"
                >
                    <Underline className="w-4 h-4" />
                </button>

                {/* Strikethrough */}
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                        const currentDecoration = displayElement.textDecoration;
                        const newDecoration = toggleTextDecoration(currentDecoration, 'line-through');

                        if (activeTextStyle && onTextCommand) {
                            onTextCommand({ type: 'strikethrough', value: !currentDecoration?.includes('line-through'), id: element.id });
                        } else if (isMultiSelect) {
                            selectedElements.filter(el => el.type === 'text').forEach(el => {
                                let updates: Partial<DesignElement> = { textDecoration: newDecoration };
                                onCommit(el.id, updates);
                            });
                        } else {
                            let updates: Partial<DesignElement> = { textDecoration: newDecoration };
                            onCommit(element.id, updates);
                        }
                    }}
                    className={`h-[38px] flex items-center justify-center rounded border transition-colors ${displayElement.textDecoration?.includes('line-through')
                        ? 'bg-[#5500FF] text-white border-[#5500FF]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#5500FF] hover:text-[#5500FF]'
                        }`}
                    title="취소선"
                >
                    <Strikethrough className="w-4 h-4" />
                </button>
            </div>

            {/* 글씨 색상 */}
            <div className="space-y-2 mt-3">
                <label className="text-xs font-bold text-gray-500">글씨 색상</label>
                <PopoverColorPicker
                    color={displayElement.color || '#000000'}
                    onChange={(c: string) => {
                        // Color picker onChange should also update immediately
                        if (activeTextStyle && onTextCommand) {
                            onTextCommand({ type: 'foreColor', value: c, id: element.id });
                        } else if (isMultiSelect) {
                            selectedElements.filter(el => el.type === 'text').forEach(el => {
                                let updates: Partial<DesignElement> = { color: c };
                                if (el.richTextHtml) {
                                    updates.richTextHtml = resetStylesInHtml(el.richTextHtml, ['color']);
                                }
                                onUpdate(el.id, updates);
                            });
                        } else {
                            let updates: Partial<DesignElement> = { color: c };
                            if (element.richTextHtml) {
                                updates.richTextHtml = resetStylesInHtml(element.richTextHtml, ['color']);
                            }
                            onUpdate(element.id, updates);
                        }
                    }}
                    onCommit={(c: string) => {
                        if (activeTextStyle && onTextCommand) {
                            onTextCommand({ type: 'foreColor', value: c, id: element.id });
                        } else if (isMultiSelect) {
                            selectedElements.filter(el => el.type === 'text').forEach(el => {
                                let updates: Partial<DesignElement> = { color: c };
                                if (el.richTextHtml) {
                                    updates.richTextHtml = resetStylesInHtml(el.richTextHtml, ['color']);
                                }
                                onCommit(el.id, updates);
                            });
                        } else {
                            let updates: Partial<DesignElement> = { color: c };
                            if (element.richTextHtml) {
                                updates.richTextHtml = resetStylesInHtml(element.richTextHtml, ['color']);
                            }
                            onCommit(element.id, updates);
                        }
                    }}
                />
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
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    if (isMultiSelect) {
                                        selectedElements.filter(el => el.type === 'text').forEach(el => {
                                            let updates: Partial<DesignElement> = { textAlign: value };
                                            if (el.richTextHtml) {
                                                updates.richTextHtml = resetStylesInHtml(el.richTextHtml, ['text-align']);
                                            }
                                            onCommit(el.id, updates);
                                        });
                                    } else {
                                        let updates: Partial<DesignElement> = { textAlign: value };
                                        if (element.richTextHtml) {
                                            updates.richTextHtml = resetStylesInHtml(element.richTextHtml, ['text-align']);
                                        }
                                        onCommit(element.id, updates);
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

            {/* 자간 & 행간 */}
            <div className="flex items-end gap-3 mt-3">
                {/* 행간 (Line Height) */}
                <div className="space-y-1 flex-1">
                    <label className="text-xs font-bold text-gray-500">행간</label>
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 px-3 py-2 gap-2 hover:border-gray-300 focus-within:border-[#5500FF] focus-within:bg-white transition-colors">
                        <span className="text-gray-400 text-sm font-medium select-none shrink-0">
                            <span className="text-xs" style={{ textDecoration: 'overline underline', textDecorationColor: '#9CA3AF' }}>가</span>
                        </span>
                        <input
                            type="number"
                            value={Math.round((displayElement.lineHeight ?? 1.5) * 100)}
                            onChange={(e) => {
                                const val = (parseInt(e.target.value) || 150) / 100;
                                if (isMultiSelect) {
                                    selectedElements.filter(el => el.type === 'text').forEach(el => {
                                        onUpdate(el.id, { lineHeight: val });
                                    });
                                } else {
                                    onUpdate(element.id, { lineHeight: val });
                                }
                            }}
                            onBlur={(e) => {
                                const val = Math.max(0.5, Math.min(5, (parseInt(e.target.value) || 150) / 100));
                                if (isMultiSelect) {
                                    selectedElements.filter(el => el.type === 'text').forEach(el => {
                                        onCommit(el.id, { lineHeight: val });
                                    });
                                } else {
                                    onCommit(element.id, { lineHeight: val });
                                }
                            }}
                            className="w-12 text-sm font-medium outline-none text-right bg-transparent"
                        />
                        <span className="text-xs text-gray-400">%</span>
                    </div>
                </div>

                {/* 자간 (Letter Spacing) */}
                <div className="space-y-1 flex-1">
                    <label className="text-xs font-bold text-gray-500">자간</label>
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 px-3 py-2 gap-2 hover:border-gray-300 focus-within:border-[#5500FF] focus-within:bg-white transition-colors">
                        <span className="text-gray-400 text-sm font-medium select-none shrink-0 flex items-center">
                            <span className="text-gray-300">|</span>
                            <span className="text-xs">가</span>
                            <span className="text-gray-300">|</span>
                        </span>
                        <input
                            type="number"
                            value={Math.round((displayElement.letterSpacing ?? 0) * 100)}
                            onChange={(e) => {
                                const val = (parseInt(e.target.value) || 0) / 100;
                                if (isMultiSelect) {
                                    selectedElements.filter(el => el.type === 'text').forEach(el => {
                                        onUpdate(el.id, { letterSpacing: val });
                                    });
                                } else {
                                    onUpdate(element.id, { letterSpacing: val });
                                }
                            }}
                            onBlur={(e) => {
                                const val = (parseInt(e.target.value) || 0) / 100;
                                if (isMultiSelect) {
                                    selectedElements.filter(el => el.type === 'text').forEach(el => {
                                        onCommit(el.id, { letterSpacing: val });
                                    });
                                } else {
                                    onCommit(element.id, { letterSpacing: val });
                                }
                            }}
                            className="w-12 text-sm font-medium outline-none text-right bg-transparent"
                        />
                        <span className="text-xs text-gray-400">%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
