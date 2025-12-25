import React from 'react';
import { DesignElement } from '../../../types';
import { SimpleRichTextEditor, htmlToPlainText, plainTextToHtml } from '../SimpleRichTextEditor';

interface TextRendererProps {
    element: DesignElement;
    isEditing: boolean;
    onUpdate?: (val: string) => void;
    onUpdateRichText?: (val: string) => void;
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
        color: element.color || '#000000',
        fontSize: `${element.fontSize || 16}px`,
        ...fontStyle,
        width: '100%',
        height: '100%',
        lineHeight: 1.4
    };

    // 리치 HTML 값 가져오기 또는 기본값 생성
    const richHtml = element.richTextHtml || plainTextToHtml(element.content || '');

    if (isEditing) {
        return (
            <SimpleRichTextEditor
                initialHtml={richHtml}
                onChange={(html) => {
                    // 리치 HTML 저장
                    onUpdateRichText?.(html);
                    // 플레인 텍스트도 동기화 (호환성)
                    onUpdate?.(htmlToPlainText(html));
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

    // 보기 모드: 리치 HTML이 있으면 렌더링, 없으면 기존 content 표시
    if (element.richTextHtml) {
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
                dangerouslySetInnerHTML={{ __html: element.richTextHtml }}
            />
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
