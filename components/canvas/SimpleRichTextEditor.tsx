/**
 * SimpleRichTextEditor - contenteditable 기반 리치 텍스트 에디터
 * 텍스트 부분 선택 후 폰트/크기/색상 변경 가능
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Bold } from 'lucide-react';
import { PRESET_FONTS } from '../../constants';

interface SimpleRichTextEditorProps {
    initialHtml: string;
    onChange: (html: string) => void;
    onBlur?: () => void;
    defaultFontFamily?: string;
    defaultFontSize?: number;
    defaultColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    placeholder?: string;
}

export const SimpleRichTextEditor: React.FC<SimpleRichTextEditorProps> = ({
    initialHtml,
    onChange,
    onBlur,
    defaultFontFamily = "'Gowun Dodum', sans-serif",
    defaultFontSize = 16,
    defaultColor = '#000000',
    textAlign = 'center',
    placeholder = '텍스트를 입력하세요'
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [showToolbar, setShowToolbar] = useState(false);
    const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
    const [showFontDropdown, setShowFontDropdown] = useState(false);
    const savedRange = useRef<Range | null>(null);

    // 초기 HTML 설정
    useEffect(() => {
        if (editorRef.current && initialHtml) {
            editorRef.current.innerHTML = initialHtml;
        }
    }, []);

    // 선택 영역 저장
    const saveSelection = useCallback(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            savedRange.current = selection.getRangeAt(0).cloneRange();
        }
    }, []);

    // 선택 영역 복원
    const restoreSelection = useCallback(() => {
        if (savedRange.current) {
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(savedRange.current);
            }
        }
    }, []);

    // 툴바 위치 업데이트
    const updateToolbar = useCallback(() => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim()) {
            saveSelection();
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setToolbarPosition({
                top: rect.top - 55,
                left: Math.max(10, rect.left + rect.width / 2 - 150),
            });
            setShowToolbar(true);
        } else {
            setShowToolbar(false);
        }
    }, [saveSelection]);

    // 스타일 적용 함수
    const applyStyle = useCallback((command: string, value?: string) => {
        restoreSelection();
        editorRef.current?.focus();

        // execCommand로 스타일 적용
        document.execCommand(command, false, value);

        // 변경 내용 저장
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }

        saveSelection();
    }, [restoreSelection, saveSelection, onChange]);

    // 폰트 적용
    const applyFont = useCallback((fontFamily: string) => {
        restoreSelection();
        editorRef.current?.focus();

        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
            // 선택 영역을 span으로 감싸고 폰트 적용
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.fontFamily = fontFamily;

            try {
                range.surroundContents(span);
            } catch {
                // 복잡한 선택의 경우 extractContents 사용
                const fragment = range.extractContents();
                span.appendChild(fragment);
                range.insertNode(span);
            }

            // 선택 유지
            selection.removeAllRanges();
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            selection.addRange(newRange);
        }

        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
        saveSelection();
        setShowFontDropdown(false);
    }, [restoreSelection, saveSelection, onChange]);

    // 폰트 크기 적용
    const applyFontSize = useCallback((size: number) => {
        restoreSelection();
        editorRef.current?.focus();

        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.fontSize = `${size}px`;

            try {
                range.surroundContents(span);
            } catch {
                const fragment = range.extractContents();
                span.appendChild(fragment);
                range.insertNode(span);
            }

            selection.removeAllRanges();
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            selection.addRange(newRange);
        }

        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
        saveSelection();
    }, [restoreSelection, saveSelection, onChange]);

    // 색상 적용
    const applyColor = useCallback((color: string) => {
        restoreSelection();
        editorRef.current?.focus();
        document.execCommand('foreColor', false, color);

        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
        saveSelection();
    }, [restoreSelection, saveSelection, onChange]);

    // 굵게 토글
    const toggleBold = useCallback(() => {
        applyStyle('bold');
    }, [applyStyle]);

    return (
        <div className="w-full h-full relative">
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
                                폰트
                            </button>
                            {showFontDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowFontDropdown(false)}
                                    />
                                    <div className="absolute top-full left-0 mt-1 z-50 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto w-40">
                                        {PRESET_FONTS.map(font => (
                                            <button
                                                key={font.value}
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => applyFont(font.value)}
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
                            defaultValue={defaultFontSize}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => {
                                const size = parseInt(e.target.value) || 16;
                                applyFontSize(size);
                            }}
                            className="w-14 px-1 py-1 text-xs border rounded text-center"
                            min={8}
                            max={200}
                        />

                        {/* 굵게 버튼 */}
                        <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={toggleBold}
                            className="p-1.5 rounded hover:bg-gray-100"
                        >
                            <Bold className="w-3.5 h-3.5" />
                        </button>

                        {/* 색상 선택 */}
                        <input
                            type="color"
                            defaultValue={defaultColor}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => applyColor(e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border"
                        />
                    </div>
                </div>
            )}

            {/* 에디터 영역 */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={() => {
                    if (editorRef.current) {
                        onChange(editorRef.current.innerHTML);
                    }
                }}
                onMouseUp={updateToolbar}
                onKeyUp={updateToolbar}
                onBlur={(e) => {
                    // 툴바 클릭 시 blur 무시
                    setTimeout(() => {
                        if (!showToolbar) {
                            onBlur?.();
                        }
                    }, 100);
                }}
                onMouseDown={(e) => e.stopPropagation()}
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
                data-placeholder={placeholder}
            />
        </div>
    );
};

// HTML을 plain text로 변환
export const htmlToPlainText = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
};

// plain text를 HTML로 변환
export const plainTextToHtml = (text: string): string => {
    return text.replace(/\n/g, '<br>');
};

export default SimpleRichTextEditor;
