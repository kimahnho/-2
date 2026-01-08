
import React from 'react';
import { DesignElement, TextCommand, TextStyle } from '../../../types/editor.types';
import { RichTextEditor } from '../RichTextEditor';

class EditorErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("TextEditor Crash:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ color: 'red', fontSize: '12px', padding: '8px', border: '1px solid red', background: 'white', zIndex: 1000 }}>
                    에러 발생: {this.state.error?.message}
                    <button onClick={() => this.setState({ hasError: false })} style={{ marginLeft: '8px', textDecoration: 'underline', cursor: 'pointer' }}>재시도</button>
                </div>
            );
        }
        return this.props.children;
    }
}

interface TextRendererProps {
    element: DesignElement;
    isEditing: boolean;
    onUpdate?: (val: string | Partial<DesignElement>) => void;
    onUpdateRichText?: (val: string) => void;
    onBlur?: (html?: string) => void;
    textareaRef: React.RefObject<any>;
    command?: TextCommand | null;
    onStyleChange?: (style: TextStyle) => void;
    onTab?: () => void;
}



export const TextRenderer: React.FC<TextRendererProps> = (props) => {
    const {
        element,
        isEditing,
        onUpdate,
        onUpdateRichText,
        onBlur,
        textareaRef,
        command,
        onStyleChange
    } = props;
    const fontStyle = {
        fontFamily: element.fontFamily || "'Gowun Dodum', sans-serif",
        fontWeight: element.fontWeight || 400,
        fontStyle: element.fontStyle || 'normal',
        textDecoration: element.textDecoration || 'none',
    };

    const textAlignment = element.textAlign || 'center';
    const justifyContent = textAlignment === 'left' ? 'flex-start' : textAlignment === 'right' ? 'flex-end' : 'center';

    const commonStyle: React.CSSProperties = {
        color: element.color || '#000000',
        fontSize: `${element.fontSize || 16}px`,
        ...fontStyle,
        width: '100%',
        height: '100%',
        lineHeight: element.lineHeight ?? 1.4,
        letterSpacing: element.letterSpacing !== undefined ? `${element.letterSpacing}em` : undefined,
        overflow: 'hidden'
    };

    // Unified ResizeObserver for both View and Edit modes
    // We need to measure the actual content size. 
    // In Edit mode, it's the RichTextEditor's Editable.
    // In View mode, it's the rendered div.
    const contentRef = React.useRef<HTMLDivElement>(null);
    const resizeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        if (!contentRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { scrollWidth, scrollHeight } = entry.target as HTMLElement;

                // Logic derived from user request: 
                // Fix Width (allow text wrap), Auto-adjust Height.

                // DEBOUNCE: Prevent rapid updates during resize which causes lag/fighting.
                // We use a local timeout to wait until resize 'settles'.
                if (resizeTimeoutRef.current) {
                    clearTimeout(resizeTimeoutRef.current);
                }

                resizeTimeoutRef.current = setTimeout(() => {
                    const currentHeight = element.height || 0;

                    // USER FIX: "Return to initial size" logic.
                    // We enable bidirectional auto-sizing.
                    // If content grows, box grows. If content shrinks, box shrinks.
                    // Trade-off: Manual height resizing specifically for text boxes might be overridden 
                    // if it doesn't match content height. But this aligns with the user's request
                    // for elastic text boxes.
                    // USER FIX: Only auto-resize when editing to prevent template load jitter.
                    if (isEditing) {
                        const diff = Math.abs(scrollHeight - currentHeight);
                        if (diff > 2) {
                            onUpdate?.({ height: scrollHeight });
                        }
                    }
                }, 100); // 100ms debounce
            }
        });

        observer.observe(contentRef.current);
        return () => {
            observer.disconnect();
            if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
        };
    }, [onUpdate, element.content, element.richTextHtml, element.fontSize, element.lineHeight, element.width, element.fontFamily, element.fontWeight, element.letterSpacing]); // User Request: Don't include element.height to avoid snapping back when user manually resizes height. Only resize when content/style/width changes.

    if (isEditing) {
        return (
            <div
                style={{
                    ...commonStyle,
                    width: '100%',
                    height: '100%',
                    cursor: 'text',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center', // Vertically center the editor container? 
                    // Actually if we want auto-height, the container should grow. 
                    // The CanvasElement wrapper sets the outer bounds.
                    // If we update element.height, the wrapper updates.
                    alignItems: 'stretch'
                }}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Wrap Editor in a div we can measure */}
                {/* Remove height: '100%' to allow parent (Flex) to vertically center this container */}
                <div ref={contentRef} style={{ width: '100%' }}>
                    <EditorErrorBoundary>
                        <RichTextEditor
                            initialHtml={
                                element.richTextHtml ||
                                ((['제목 텍스트 추가', '본문 텍스트 내용을 입력하세요', '본문 텍스트 추가'].includes(element.content || ''))
                                    ? ''
                                    : (element.content === '“○○”을 찾아봐!')
                                        ? '“ ”을 찾아봐!'
                                        : element.content || '')
                            }
                            onChange={(html) => {
                                // Atomic update of both content representations
                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = html;
                                const content = tempDiv.textContent || '';

                                onUpdate?.({
                                    content,
                                    richTextHtml: html
                                });
                            }}
                            onBlur={onBlur}
                            command={command}
                            onStyleChange={onStyleChange}
                            defaultFontFamily={element.fontFamily || "'Gowun Dodum', sans-serif"}
                            defaultFontSize={element.fontSize || 16}
                            defaultColor={element.color || '#000000'}
                            textAlign={element.textAlign || 'center'}
                            textareaRef={textareaRef}
                            initialCursorOffset={element.content === '“○○”을 찾아봐!' ? 2 : undefined}
                            onTab={props.onTab}
                        // Removed internal onContentSizeChange, using local ResizeObserver
                        />
                    </EditorErrorBoundary>
                </div>
            </div>
        );
    }

    // View Mode
    // Check if richTextHtml has actual content (not just empty tags like <p></p>)
    const isRichTextEmpty = !element.richTextHtml ||
        element.richTextHtml.replace(/<[^>]*>/g, '').trim() === '';

    const htmlContent = isRichTextEmpty
        ? (element.content ? element.content.replace(/\n/g, '<br/>') : '더블 클릭하여 편집')
        : element.richTextHtml;
    const isHtml = !isRichTextEmpty || (element.content && /<[a-z][\s\S]*>/i.test(element.content));

    return (
        <div
            style={{
                ...commonStyle,
                display: 'flex',
                flexDirection: 'column',
                alignItems: justifyContent === 'flex-start' ? 'flex-start' : justifyContent === 'flex-end' ? 'flex-end' : 'center',
                justifyContent: 'center',
                textAlign: textAlignment,
                userSelect: 'none',
                pointerEvents: 'none',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
            }}
        >
            {/* Measure wrapper */}
            <div ref={contentRef} style={{ width: '100%' }}>
                {isHtml ? (
                    <div
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                        style={{ width: '100%' }}
                    />
                ) : (
                    element.content || '더블 클릭하여 편집'
                )}
            </div>
        </div>
    );
};

