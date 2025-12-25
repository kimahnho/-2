import React from 'react';
import { DesignElement } from '../../../types';
import { RichTextEditor, createInitialValue, serializeToPlainText } from '../RichTextEditor';
import { Descendant } from 'slate';

interface TextRendererProps {
    element: DesignElement;
    isEditing: boolean;
    onUpdate?: (val: string) => void;
    onUpdateRichText?: (val: Descendant[]) => void;
    onBlur?: () => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export const TextRenderer: React.FC<TextRendererProps> = ({
    element,
    isEditing,
    onUpdate,
    onUpdateRichText,
    onBlur,
    textareaRef
}) => {
    const fontStyle = {
        fontFamily: element.fontFamily || "'Gowun Dodum', sans-serif",
        fontWeight: element.fontWeight || 400,
    };

    const textAlignment = element.textAlign || 'center';
    const justifyContent = textAlignment === 'left' ? 'flex-start' : textAlignment === 'right' ? 'flex-end' : 'center';

    const commonStyle: React.CSSProperties = {
        color: element.color,
        fontSize: `${element.fontSize}px`,
        ...fontStyle,
        width: '100%',
        height: '100%',
        lineHeight: 1.2
    };

    // 리치 텍스트 값 가져오기 또는 기본값 생성
    const richTextValue = element.richTextContent || createInitialValue(element.content || '');

    if (isEditing) {
        return (
            <RichTextEditor
                value={richTextValue}
                onChange={(newValue) => {
                    // 리치 텍스트 저장
                    onUpdateRichText?.(newValue);
                    // 플레인 텍스트도 동기화 (호환성)
                    onUpdate?.(serializeToPlainText(newValue));
                }}
                onBlur={onBlur}
                defaultFontFamily={element.fontFamily || "'Gowun Dodum', sans-serif"}
                defaultFontSize={element.fontSize || 16}
                defaultColor={element.color || '#000000'}
                textAlign={textAlignment}
                placeholder="더블 클릭하여 편집"
            />
        );
    }

    // 보기 모드: 리치 텍스트가 있으면 렌더링, 없으면 기존 content 표시
    if (element.richTextContent && element.richTextContent.length > 0) {
        return (
            <div
                style={{
                    ...commonStyle,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    textAlign: textAlignment,
                    userSelect: 'none',
                    pointerEvents: 'none',
                    whiteSpace: 'pre-wrap'
                }}
            >
                {element.richTextContent.map((node: any, i: number) => {
                    if (node.type === 'paragraph') {
                        return (
                            <div key={i} style={{ textAlign: textAlignment, width: '100%' }}>
                                {node.children.map((leaf: any, j: number) => (
                                    <span
                                        key={j}
                                        style={{
                                            fontFamily: leaf.fontFamily || fontStyle.fontFamily,
                                            fontSize: leaf.fontSize ? `${leaf.fontSize}px` : `${element.fontSize}px`,
                                            color: leaf.color || element.color || '#000000',
                                            fontWeight: leaf.bold ? 'bold' : (fontStyle.fontWeight || 400),
                                        }}
                                    >
                                        {leaf.text}
                                    </span>
                                ))}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        );
    }

    // 폴백: 기존 content 표시
    return (
        <div
            style={{
                ...commonStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: justifyContent,
                textAlign: textAlignment,
                userSelect: 'none',
                pointerEvents: 'none',
                whiteSpace: 'pre-wrap'
            }}
        >
            {element.content || '더블 클릭하여 편집'}
        </div>
    );
};
