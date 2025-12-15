import React from 'react';
import { DesignElement } from '../../../types';

interface TextRendererProps {
    element: DesignElement;
    isEditing: boolean;
    onUpdate?: (val: string) => void;
    onBlur?: () => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export const TextRenderer: React.FC<TextRendererProps> = ({
    element,
    isEditing,
    onUpdate,
    onBlur,
    textareaRef
}) => {
    const fontStyle = {
        fontFamily: element.fontFamily || "'Gowun Dodum', sans-serif",
        fontWeight: element.fontWeight || 400,
    };

    const commonStyle: React.CSSProperties = {
        color: element.color,
        fontSize: `${element.fontSize}px`,
        ...fontStyle,
        width: '100%',
        height: '100%',
        lineHeight: 1.2
    };

    if (isEditing) {
        return (
            <textarea
                ref={textareaRef}
                value={element.content}
                onChange={(e) => onUpdate?.(e.target.value)}
                onBlur={onBlur}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                    ...commonStyle,
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    textAlign: 'center',
                    padding: 0,
                    overflow: 'hidden'
                }}
            />
        );
    }

    return (
        <div
            style={{
                ...commonStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                userSelect: 'none',
                pointerEvents: 'none',
                whiteSpace: 'pre-wrap'
            }}
        >
            {element.content || '더블 클릭하여 편집'}
        </div>
    );
};
