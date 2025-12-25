import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { createEditor, Descendant, Editor, Range, BaseEditor, Transforms } from 'slate';
import { Slate, Editable, withReact, RenderLeafProps, useSlate, ReactEditor } from 'slate-react';
import { Bold } from 'lucide-react';
import { PRESET_FONTS } from '../../constants';

// 커스텀 텍스트 타입 정의
export interface CustomText {
    text: string;
    bold?: boolean;
    fontFamily?: string;
    fontSize?: number;
    color?: string;
}

export interface CustomElement {
    type: 'paragraph';
    children: CustomText[];
}

declare module 'slate' {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}

// 초기값 생성 헬퍼
export const createInitialValue = (content: string): Descendant[] => {
    return [
        {
            type: 'paragraph',
            children: [{ text: content || '' }],
        },
    ];
};

// Descendant[]를 plain text로 변환
export const serializeToPlainText = (nodes: Descendant[]): string => {
    return nodes.map(n => {
        if ('children' in n) {
            return (n as CustomElement).children.map(c => c.text).join('');
        }
        return '';
    }).join('\n');
};

// Leaf 렌더러 - 폰트, 크기, 색상 적용
const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
    const style: React.CSSProperties = {
        fontFamily: leaf.fontFamily || undefined,
        fontSize: leaf.fontSize ? `${leaf.fontSize}px` : undefined,
        color: leaf.color || undefined,
        fontWeight: leaf.bold ? 'bold' : undefined,
    };

    return (
        <span {...attributes} style={style}>
            {children}
        </span>
    );
};

// 플로팅 툴바 컴포넌트
const FloatingToolbar: React.FC<{
    editor: BaseEditor & ReactEditor;
    onClose: () => void;
}> = ({ editor, onClose }) => {
    const [showFontDropdown, setShowFontDropdown] = useState(false);

    // 현재 선택 영역의 마크 가져오기
    const marks = Editor.marks(editor);
    const currentFont = marks?.fontFamily || "'Gowun Dodum', sans-serif";
    const currentSize = marks?.fontSize || 16;
    const currentColor = marks?.color || '#000000';
    const isBold = marks?.bold || false;

    const applyMark = (key: keyof CustomText, value: any) => {
        // 에디터에 포커스 복원 후 마크 적용
        ReactEditor.focus(editor);
        Editor.addMark(editor, key, value);
    };

    const toggleBold = () => {
        ReactEditor.focus(editor);
        if (isBold) {
            Editor.removeMark(editor, 'bold');
        } else {
            Editor.addMark(editor, 'bold', true);
        }
    };

    return (
        <div
            className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1.5"
            onMouseDown={(e) => e.preventDefault()} // 포커스 이동 방지
        >
            {/* 폰트 선택 */}
            <div className="relative">
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowFontDropdown(!showFontDropdown)}
                    className="px-2 py-1 text-xs border rounded hover:bg-gray-50 min-w-[80px] text-left truncate"
                >
                    {PRESET_FONTS.find(f => f.value === currentFont)?.label || '폰트'}
                </button>
                {showFontDropdown && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowFontDropdown(false)} />
                        <div className="absolute top-full left-0 mt-1 z-50 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto w-40">
                            {PRESET_FONTS.map(font => (
                                <button
                                    key={font.value}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                        applyMark('fontFamily', font.value);
                                        setShowFontDropdown(false);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50"
                                    style={{ fontFamily: font.value }}
                                >
                                    {font.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* 크기 입력 */}
            <input
                type="number"
                value={currentSize}
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => {
                    const size = parseInt(e.target.value) || 16;
                    applyMark('fontSize', size);
                }}
                className="w-12 px-1 py-1 text-xs border rounded text-center"
                min={8}
                max={200}
            />

            {/* 굵게 버튼 */}
            <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={toggleBold}
                className={`p-1.5 rounded ${isBold ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            >
                <Bold className="w-3.5 h-3.5" />
            </button>

            {/* 색상 선택 */}
            <div className="relative">
                <input
                    type="color"
                    value={currentColor}
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) => applyMark('color', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border"
                />
            </div>
        </div>
    );
};

interface RichTextEditorProps {
    value: Descendant[];
    onChange: (value: Descendant[]) => void;
    onBlur?: () => void;
    defaultFontFamily?: string;
    defaultFontSize?: number;
    defaultColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    onBlur,
    defaultFontFamily = "'Gowun Dodum', sans-serif",
    defaultFontSize = 16,
    defaultColor = '#000000',
    textAlign = 'center',
    placeholder = '텍스트를 입력하세요'
}) => {
    const editor = useMemo(() => withReact(createEditor()), []);
    const [showToolbar, setShowToolbar] = useState(false);
    const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

    const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);

    // 선택 영역 변경 시 툴바 표시/위치 업데이트
    const updateToolbar = useCallback(() => {
        const { selection } = editor;

        if (selection && !Range.isCollapsed(selection)) {
            const domSelection = window.getSelection();
            if (domSelection && domSelection.rangeCount > 0) {
                const domRange = domSelection.getRangeAt(0);
                const rect = domRange.getBoundingClientRect();
                setToolbarPosition({
                    top: rect.top - 50,
                    left: Math.max(10, rect.left + rect.width / 2 - 120),
                });
                setShowToolbar(true);
            }
        } else {
            setShowToolbar(false);
        }
    }, [editor]);

    return (
        <div className="w-full h-full relative">
            <Slate
                editor={editor}
                initialValue={value}
                onChange={(newValue) => {
                    onChange(newValue);
                    updateToolbar();
                }}
            >
                {/* 플로팅 툴바 */}
                {showToolbar && (
                    <div
                        className="fixed z-[9999]"
                        style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
                    >
                        <FloatingToolbar
                            editor={editor}
                            onClose={() => setShowToolbar(false)}
                        />
                    </div>
                )}

                <Editable
                    renderLeaf={renderLeaf}
                    placeholder={placeholder}
                    onBlur={(e) => {
                        // 툴바 클릭 시 blur 무시
                        const relatedTarget = e.relatedTarget as HTMLElement;
                        if (relatedTarget?.closest('.floating-toolbar')) {
                            return;
                        }
                        setShowToolbar(false);
                        onBlur?.();
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={updateToolbar}
                    onKeyUp={updateToolbar}
                    style={{
                        width: '100%',
                        height: '100%',
                        outline: 'none',
                        fontFamily: defaultFontFamily,
                        fontSize: `${defaultFontSize}px`,
                        color: defaultColor,
                        textAlign: textAlign,
                        lineHeight: 1.4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
                    }}
                />
            </Slate>
        </div>
    );
};

export default RichTextEditor;
