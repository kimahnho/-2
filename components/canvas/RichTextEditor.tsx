
import React, { useCallback, useMemo, useEffect, KeyboardEvent } from 'react';
import { createEditor, Descendant, Editor, Transforms, Text, Element as SlateElement, BaseEditor } from 'slate';
import { Slate, Editable, withReact, RenderLeafProps, RenderElementProps, ReactEditor } from 'slate-react';
import { withHistory, HistoryEditor } from 'slate-history';
import { TextCommand, TextStyle } from '../../types/editor.types';

// 커스텀 타입 정의
export type CustomText = {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    color?: string;
    fontFamily?: string;
    fontSize?: number;
};

export type CustomElement = {
    type: 'paragraph';
    align?: 'left' | 'center' | 'right';
    children: Descendant[];
};

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

declare module 'slate' {
    interface CustomTypes {
        Editor: CustomEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}

// HTML <-> Slate 변환 유틸리티
// (간단한 구현, 실제로는 더 복잡한 파서가 필요할 수 있음)
const serialize = (node: Descendant): string => {
    if (Text.isText(node)) {
        let string = node.text;
        if (node.bold) string = `<strong>${string}</strong>`;
        if (node.italic) string = `<em>${string}</em>`;
        if (node.underline) string = `<u>${string}</u>`;
        if (node.strikethrough) string = `<s>${string}</s>`;
        // Do NOT add inline styles for color/font-family/font-size
        // These are controlled at the container level for consistency between Edit and View modes
        return string;
    }

    const element = node as CustomElement;
    const children = element.children.map(n => serialize(n)).join('');

    switch (element.type) {
        case 'paragraph':
            const style = element.align ? `style="text-align:${element.align}"` : '';
            return `<p ${style}>${children}</p>`;
        default:
            return children;
    }
};

const deserialize = (html: string): Descendant[] => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const body = doc.body;

    const deserializeNode = (el: Node): Descendant[] => {
        if (el.nodeType === 3) { // Text node
            return [{ text: el.textContent || '' }];
        } else if (el.nodeType !== 1) {
            return [];
        }

        const node = el as HTMLElement;
        let children: Descendant[] = Array.from(node.childNodes).flatMap(deserializeNode);

        // 빈 텍스트 노드 처리 ( Slate는 최소 하나의 텍스트 자식 필요)
        if (children.length === 0) {
            children = [{ text: '' }];
        }

        // Apply styles based on tags
        if (node.nodeName === 'STRONG' || node.nodeName === 'B' || node.style.fontWeight === 'bold' || Number(node.style.fontWeight) >= 700) {
            children = children.map(c => Text.isText(c) ? { ...c, bold: true } : c);
        }
        if (node.nodeName === 'EM' || node.nodeName === 'I' || node.style.fontStyle === 'italic') {
            children = children.map(c => Text.isText(c) ? { ...c, italic: true } : c);
        }
        if (node.nodeName === 'U' || node.style.textDecoration.includes('underline')) {
            children = children.map(c => Text.isText(c) ? { ...c, underline: true } : c);
        }
        if (node.nodeName === 'S' || node.nodeName === 'DEL' || node.nodeName === 'STRIKE' || node.style.textDecoration.includes('line-through')) {
            children = children.map(c => Text.isText(c) ? { ...c, strikethrough: true } : c);
        }

        // Style attributes
        if (node.style.color) {
            children = children.map(c => Text.isText(c) ? { ...c, color: node.style.color } : c);
        }
        if (node.style.fontFamily) {
            children = children.map(c => Text.isText(c) ? { ...c, fontFamily: node.style.fontFamily.replace(/['"]/g, '') } : c);
        }
        if (node.style.fontSize) {
            const size = parseInt(node.style.fontSize);
            if (!isNaN(size)) {
                children = children.map(c => Text.isText(c) ? { ...c, fontSize: size } : c);
            }
        }

        // Block elements
        if (node.nodeName === 'P' || node.nodeName === 'DIV') {
            return [{
                type: 'paragraph',
                align: (node.style.textAlign as any) || undefined,
                children
            }];
        }

        return children;
    };

    // 만약 빈 내용이면 기본값 반환
    if (!html.trim()) {
        return [{ type: 'paragraph', children: [{ text: '' }] }];
    }

    const nodes = Array.from(body.childNodes).flatMap(deserializeNode);
    // Ensure standard block structure
    return nodes.map(n => Text.isText(n) ? { type: 'paragraph', children: [n] } : n);
};

interface RichTextEditorProps {
    initialHtml?: string;
    onChange: (html: string) => void;
    onBlur?: (html?: string) => void;
    command?: TextCommand | null;
    onStyleChange?: (style: TextStyle) => void;
    defaultFontFamily: string;
    defaultFontSize: number;
    defaultColor: string;
    textAlign: 'left' | 'center' | 'right';
    placeholder?: string;
    textareaRef?: React.RefObject<any>; // Focus handling
    onContentSizeChange?: (width: number, height: number) => void; // NEW
    initialCursorOffset?: number; // NEW
    onTab?: () => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    initialHtml,
    onChange,
    onBlur,
    command,
    onStyleChange,
    defaultFontFamily,
    defaultFontSize,
    defaultColor,
    textAlign,
    placeholder,
    textareaRef,
    onContentSizeChange,
    initialCursorOffset,
    onTab
}) => {
    // Editor instance
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);

    // Initial value memoization
    const initialValue = useMemo(() => {
        if (initialHtml) {
            return deserialize(initialHtml);
        }
        // 기본값: 부모 요소 스타일 상속
        return [{
            type: 'paragraph',
            align: textAlign,
            children: [{
                text: '',
                fontFamily: defaultFontFamily,
                fontSize: defaultFontSize,
                color: defaultColor
            }]
        }] as Descendant[];
    }, []); // Only once

    // NEW: React to external HTML changes (e.g. from Property Panel via resetStylesInHtml)
    // We need to be careful not to overwrite user typing, but if the prop changes significantly 
    // (and we are not focusing/typing?), we should update.
    // Actually, usually in "Selection Mode", the editor is effectively read-only or not active.
    // If we want to force update from props:
    // React to external HTML changes
    useEffect(() => {
        if (initialHtml !== undefined) {
            // Check if already focused to prevent "Echo Loop" flicker while typing.
            // If we are typing, we are the source of truth. We shouldn't accept prop updates 
            // that are just echoes of our own changes.
            if (ReactEditor.isFocused(editor)) {
                return;
            }

            // Check if content matches to avoid unnecessary resets (and state loss)
            const currentHtml = editor.children.map(n => serialize(n)).join('');

            if (currentHtml !== initialHtml) {
                const newDescendants = deserialize(initialHtml);
                editor.children = newDescendants;
                // We don't call onChange here to avoid loops, just update internal model
                editor.onChange();
            }
        }
    }, [initialHtml, editor]);

    // Command Handling
    useEffect(() => {
        if (!command) return;

        // Apply formatting to selection
        switch (command.type) {
            case 'bold':
                if (command.value === true) Editor.addMark(editor, 'bold', true);
                else if (command.value === false) Editor.removeMark(editor, 'bold');
                else {
                    const isActive = Editor.marks(editor)?.bold;
                    if (isActive) Editor.removeMark(editor, 'bold');
                    else Editor.addMark(editor, 'bold', true);
                }
                break;
            case 'italic':
                if (command.value === true) Editor.addMark(editor, 'italic', true);
                else if (command.value === false) Editor.removeMark(editor, 'italic');
                else {
                    const isActive = Editor.marks(editor)?.italic;
                    if (isActive) Editor.removeMark(editor, 'italic');
                    else Editor.addMark(editor, 'italic', true);
                }
                break;
            case 'underline':
                if (command.value === true) Editor.addMark(editor, 'underline', true);
                else if (command.value === false) Editor.removeMark(editor, 'underline');
                else {
                    const isActive = Editor.marks(editor)?.underline;
                    if (isActive) Editor.removeMark(editor, 'underline');
                    else Editor.addMark(editor, 'underline', true);
                }
                break;
            case 'strikethrough':
                if (command.value === true) Editor.addMark(editor, 'strikethrough', true);
                else if (command.value === false) Editor.removeMark(editor, 'strikethrough');
                else {
                    const isActive = Editor.marks(editor)?.strikethrough;
                    if (isActive) Editor.removeMark(editor, 'strikethrough');
                    else Editor.addMark(editor, 'strikethrough', true);
                }
                break;
            case 'foreColor':
                if (typeof command.value === 'string') {
                    Editor.addMark(editor, 'color', command.value);
                }
                break;
            case 'fontName':
                if (typeof command.value === 'string') {
                    Editor.addMark(editor, 'fontFamily', command.value);
                }
                break;
            case 'fontSize':
                if (typeof command.value === 'number') {
                    Editor.addMark(editor, 'fontSize', command.value);
                }
                break;
        }
    }, [command, editor]);

    // Force focus on mount to ensure user can type immediately
    useEffect(() => {
        // Use requestAnimationFrame for better timing with React rendering
        const focusEditor = () => {
            if (editor && !ReactEditor.isFocused(editor)) {
                try {
                    ReactEditor.focus(editor);

                    // Move cursor
                    if (initialCursorOffset !== undefined) {
                        Transforms.select(editor, {
                            anchor: { path: [0, 0], offset: initialCursorOffset },
                            focus: { path: [0, 0], offset: initialCursorOffset }
                        });
                    } else {
                        // Move cursor to end by default
                        Transforms.select(editor, Editor.end(editor, []));
                    }
                } catch (e) {
                    // Fallback to start if end selection fails
                    try {
                        Transforms.select(editor, Editor.start(editor, []));
                    } catch (err) {
                        // Ignore errors during focus attempts (e.g. unmounted)
                    }
                }
            }
        };

        // Try immediately, and also with RAF to ensure layout is ready
        focusEditor();
        const rafId = requestAnimationFrame(focusEditor);

        return () => cancelAnimationFrame(rafId);
    }, [editor, initialCursorOffset]);

    // Handle Selection Change -> Report Style
    const handleSelectionChange = useCallback(() => {
        if (!editor.selection || !onStyleChange) return;

        const marks = Editor.marks(editor);
        // Default values from props if marks are missing
        const currentStyle: TextStyle = {
            isBold: marks?.bold === true,
            isItalic: marks?.italic === true,
            isUnderline: marks?.underline === true,
            isStrikethrough: marks?.strikethrough === true,
            color: marks?.color || defaultColor,
            fontFamily: marks?.fontFamily || defaultFontFamily,
            fontSize: marks?.fontSize || defaultFontSize,
        };
        onStyleChange(currentStyle);
    }, [editor, onStyleChange, defaultColor, defaultFontFamily, defaultFontSize]);

    // Old ResizeObserver removed (managed by parent TextRenderer now)


    // Renderers
    const renderLeaf = useCallback((props: RenderLeafProps) => {
        let { attributes, children, leaf } = props;

        if (leaf.bold) {
            children = <strong>{children}</strong>;
        }
        if (leaf.italic) {
            children = <em>{children}</em>;
        }
        if (leaf.underline) {
            children = <u>{children}</u>;
        }
        if (leaf.strikethrough) {
            children = <s>{children}</s>;
        }

        // Do NOT apply inline styles - inherit from container for Edit/View mode consistency
        return <span {...attributes}>{children}</span>;
    }, []);

    const renderElement = useCallback((props: RenderElementProps) => {
        const { attributes, children, element } = props;
        const style = { textAlign: (element as CustomElement).align || textAlign };
        return <p {...attributes} style={style}>{children}</p>;
    }, [textAlign]);

    // Key handlers
    // Key handlers
    const onKeyDown = (event: KeyboardEvent) => {
        // Handle Tab
        if (event.key === 'Tab') {
            event.preventDefault();
            onTab?.();
            return;
        }

        const isCtrlOrCmd = event.ctrlKey || event.metaKey;

        // Bold (Ctrl+B)
        if (event.key.toLowerCase() === 'b' && isCtrlOrCmd) {
            event.preventDefault();
            const isActive = Editor.marks(editor)?.bold;
            if (isActive) Editor.removeMark(editor, 'bold');
            else Editor.addMark(editor, 'bold', true);
            return;
        }

        // Italic (Ctrl+I)
        if (event.key.toLowerCase() === 'i' && isCtrlOrCmd) {
            event.preventDefault();
            const isActive = Editor.marks(editor)?.italic;
            if (isActive) Editor.removeMark(editor, 'italic');
            else Editor.addMark(editor, 'italic', true);
            return;
        }

        // Underline (Ctrl+U)
        if (event.key.toLowerCase() === 'u' && isCtrlOrCmd) {
            event.preventDefault();
            const isActive = Editor.marks(editor)?.underline;
            if (isActive) Editor.removeMark(editor, 'underline');
            else Editor.addMark(editor, 'underline', true);
            return;
        }

        // Strikethrough (Ctrl+Shift+X or Ctrl+Shift+S)
        // Let's support both for convenience
        if ((event.key.toLowerCase() === 'x' || event.key.toLowerCase() === 's') && isCtrlOrCmd && event.shiftKey) {
            event.preventDefault();
            const isActive = Editor.marks(editor)?.strikethrough;
            if (isActive) Editor.removeMark(editor, 'strikethrough');
            else Editor.addMark(editor, 'strikethrough', true);
            return;
        }
    };

    return (
        <Slate
            editor={editor}
            initialValue={initialValue}
            onChange={(value) => {
                const isAstChange = editor.operations.some(op => 'set_selection' !== op.type);
                if (isAstChange) {
                    const html = value.map(n => serialize(n)).join('');
                    onChange(html);
                }
                handleSelectionChange();
            }}
        >
            <div style={{ padding: 0, height: 'auto', width: '100%', outline: 'none' }} className="rich-editor-container">
                <div style={{ display: 'inline-block', width: '100%' }}>
                    <Editable
                        renderLeaf={renderLeaf}
                        renderElement={renderElement}
                        onKeyDown={onKeyDown}
                        onBlur={() => {
                            const html = editor.children.map(n => serialize(n)).join('');
                            onBlur?.(html);
                        }}
                        autoFocus
                        spellCheck={false}
                        style={{
                            minHeight: 'auto', // Let content determine height so it can be vertically centered
                            outline: 'none',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            textAlign: textAlign // Apply text align here
                        }}
                        onSelect={() => handleSelectionChange()}
                    />
                </div>
            </div>
        </Slate>
    );
};
