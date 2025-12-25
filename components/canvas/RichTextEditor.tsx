import React, { useCallback, useMemo, useState, useRef } from 'react';
import { createEditor, Descendant, Editor, Range, BaseEditor, Transforms, Selection } from 'slate';
import { Slate, Editable, withReact, RenderLeafProps, ReactEditor } from 'slate-react';
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
    const savedSelection = useRef<Selection>(null);

    const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);

    // 선택 영역 저장
    const saveSelection = useCallback(() => {
        if (editor.selection) {
            savedSelection.current = JSON.parse(JSON.stringify(editor.selection));
        }
    }, [editor]);

    // 선택 영역 복원 및 마크 적용
    const applyMarkToSelection = useCallback((key: keyof CustomText, markValue: any) => {
        // 저장된 선택 영역 복원
        if (savedSelection.current) {
            Transforms.select(editor, savedSelection.current);
        }

        // 에디터 포커스
        ReactEditor.focus(editor);

        // 마크 적용
        Editor.addMark(editor, key, markValue);
    }, [editor]);

    const toggleBold = useCallback(() => {
        if (savedSelection.current) {
            Transforms.select(editor, savedSelection.current);
        }
        ReactEditor.focus(editor);

        const marks = Editor.marks(editor);
        const isBold = marks?.bold || false;

        if (isBold) {
            Editor.removeMark(editor, 'bold');
        } else {
            Editor.addMark(editor, 'bold', true);
        }
    }, [editor]);

    // 선택 영역 변경 시 툴바 표시/위치 업데이트
    const updateToolbar = useCallback(() => {
        const { selection } = editor;

        if (selection && !Range.isCollapsed(selection)) {
            saveSelection();
            const domSelection = window.getSelection();
            if (domSelection && domSelection.rangeCount > 0) {
                const domRange = domSelection.getRangeAt(0);
                const rect = domRange.getBoundingClientRect();
                setToolbarPosition({
                    top: rect.top - 50,
                    left: Math.max(10, rect.left + rect.width / 2 - 150),
                });
                setShowToolbar(true);
            }
        } else {
            setShowToolbar(false);
        }
    }, [editor, saveSelection]);

    // 현재 마크 가져오기
    const marks = Editor.marks(editor);
    const currentFont = marks?.fontFamily || defaultFontFamily;
    const currentSize = marks?.fontSize || defaultFontSize;
    const currentColor = marks?.color || defaultColor;
    const isBold = marks?.bold || false;

    const [showFontDropdown, setShowFontDropdown] = useState(false);

    return (
        <div className="w-full h-full relative">
            <Slate
                editor={editor}
                initialValue={value}
                onChange={(newValue) => {
                    // 실제 콘텐츠 변경 시에만 onChange 호출
                    const isAstChange = editor.operations.some(
                        op => op.type !== 'set_selection'
                    );
                    if (isAstChange) {
                        onChange(newValue);
                    }
                    updateToolbar();
                }}
            >
                {/* 플로팅 툴바 */}
                {showToolbar && (
                    <div
                        className="fixed z-[9999]"
                        style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1.5">
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
                                                        applyMarkToSelection('fontFamily', font.value);
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
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    const size = parseInt(e.target.value) || 16;
                                    applyMarkToSelection('fontSize', size);
                                }}
                                className="w-14 px-1 py-1 text-xs border rounded text-center"
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
                            <input
                                type="color"
                                value={currentColor}
                                onMouseDown={(e) => e.stopPropagation()}
                                onChange={(e) => applyMarkToSelection('color', e.target.value)}
                                className="w-6 h-6 rounded cursor-pointer border"
                            />
                        </div>
                    </div>
                )}

                <Editable
                    renderLeaf={renderLeaf}
                    placeholder={placeholder}
                    onBlur={(e) => {
                        // 툴바 영역 클릭 시 blur 무시
                        setTimeout(() => {
                            if (!showToolbar) {
                                onBlur?.();
                            }
                        }, 100);
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
