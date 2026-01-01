/**
 * SimpleRichTextEditor - contenteditable 기반 리치 텍스트 에디터
 * 외부(PropertiesPanel)에서 제어 가능한 구조
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';

export interface TextCommand {
    type: 'fontName' | 'fontSize' | 'foreColor' | 'bold';
    value?: string | number | boolean;
    id: string; // 명령 고유 ID (같은 값 반복 적용을 위해)
}

export interface TextStyle {
    fontFamily: string;
    fontSize: number;
    color: string;
    isBold: boolean;
}

interface SimpleRichTextEditorProps {
    initialHtml: string;
    onChange: (html: string) => void;
    onBlur?: () => void;
    onStyleChange?: (style: TextStyle) => void; // 선택 영역 스타일 변경 알림
    command?: TextCommand | null; // 외부에서 내려오는 명령
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
    onStyleChange,
    command,
    defaultFontFamily = "'Gowun Dodum', sans-serif",
    defaultFontSize = 16,
    defaultColor = '#000000',
    textAlign = 'center',
    placeholder = '텍스트를 입력하세요'
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const savedRange = useRef<Range | null>(null);

    // 초기 HTML 설정
    useEffect(() => {
        if (editorRef.current && initialHtml && editorRef.current.innerHTML !== initialHtml) {
            editorRef.current.innerHTML = initialHtml;
        }
    }, [initialHtml]);

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

    // 현재 캐럿 위치의 스타일 감지
    const detectCurrentStyle = useCallback(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !editorRef.current) return;

        let node = selection.anchorNode;
        if (node && node.nodeType === 3 && node.parentNode) {
            node = node.parentNode;
        }

        let computedStyle: CSSStyleDeclaration | null = null;
        if (node instanceof Element) {
            computedStyle = window.getComputedStyle(node);
        } else if (editorRef.current) {
            computedStyle = window.getComputedStyle(editorRef.current);
        }

        if (computedStyle && onStyleChange) {
            const fontSize = parseInt(computedStyle.fontSize) || defaultFontSize;
            const fontFamily = computedStyle.fontFamily.replace(/['"]/g, '') || defaultFontFamily;
            const color = computedStyle.color;
            const isBold = parseInt(computedStyle.fontWeight) >= 600 || computedStyle.fontWeight === 'bold';

            onStyleChange({
                fontFamily,
                fontSize,
                color,
                isBold
            });
        }
    }, [defaultFontFamily, defaultFontSize, onStyleChange]);

    // 외부 명령 처리
    useEffect(() => {
        if (!command) return;

        console.log('[SimpleRichTextEditor] Execute command:', command);
        if (editorRef.current) editorRef.current.focus();
        restoreSelection();

        // execCommand 사용
        switch (command.type) {
            case 'bold':
                document.execCommand('bold', false);
                break;
            case 'foreColor':
                document.execCommand('styleWithCSS', false, 'true');
                document.execCommand('foreColor', false, command.value as string);
                break;
            case 'fontSize':
                // 임시: execCommand fontSize는 1-7 제한.
                // 꼼수: insertHTML로 span 삽입
                const size = command.value;
                const selection = window.getSelection();
                if (selection && !selection.isCollapsed) {
                    const range = selection.getRangeAt(0);
                    const span = document.createElement('span');
                    span.style.fontSize = `${size}px`;
                    try {
                        range.surroundContents(span);
                    } catch {
                        const content = range.extractContents();
                        span.appendChild(content);
                        range.insertNode(span);
                    }
                }
                break;
            case 'fontName':
                const fontName = command.value as string;
                const sel = window.getSelection();
                if (sel && !sel.isCollapsed) {
                    const range = sel.getRangeAt(0);
                    const span = document.createElement('span');
                    span.style.fontFamily = fontName;
                    try {
                        range.surroundContents(span);
                    } catch {
                        const content = range.extractContents();
                        span.appendChild(content);
                        range.insertNode(span);
                    }
                }
                break;
        }

        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
        detectCurrentStyle();
    }, [command]);

    return (
        <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={() => {
                if (editorRef.current) {
                    onChange(editorRef.current.innerHTML);
                }
            }}
            onBlur={onBlur}
            onMouseUp={() => {
                saveSelection();
                detectCurrentStyle();
            }}
            onKeyUp={() => {
                saveSelection();
                detectCurrentStyle();
            }}
            onClick={() => {
                saveSelection();
                detectCurrentStyle();
            }}
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
    );
};

// 유틸리티 함수 export
export const htmlToPlainText = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
};

export const plainTextToHtml = (text: string): string => {
    return text.replace(/\n/g, '<br>');
};

export default SimpleRichTextEditor;
