/**
 * CanvasElement - Thin orchestrator for element rendering
 * MECE Structure:
 * - TextRenderer: text elements
 * - AACCardRenderer: AAC cards
 * - ImageRenderer: image/shape view mode
 * - ImageCropEditor: image edit mode
 * - LineRenderer: line/arrow elements
 * - SelectionControl: resize handles (selection mode)
 */

import React, { useRef, useEffect } from 'react';
import { DesignElement } from '../types';
import { RotateCw } from 'lucide-react';

// Import renderers
import { TextRenderer } from './canvas/renderers/TextRenderer';
import { AACCardRenderer } from './canvas/renderers/AACCardRenderer';
import { ImageRenderer } from './canvas/renderers/ImageRenderer';
import { LineRenderer } from './canvas/renderers/LineRenderer';
import { ImageCropEditor } from './canvas/ImageCropEditor';

interface Props {
    element: DesignElement;
    isSelected: boolean;
    isEditing?: boolean;
    onMouseDown: (e: React.MouseEvent, id: string) => void;
    onDoubleClick?: (e: React.MouseEvent, id: string) => void;
    onResizeStart: (e: React.MouseEvent, id: string, handle: string) => void;
    onRotateStart?: (e: React.MouseEvent, id: string) => void;
    onUpdate?: (update: string | Partial<DesignElement>) => void;
    onBlur?: () => void;
}

const FIGMA_BLUE = '#0099FF';

export const CanvasElement: React.FC<Props> = ({
    element,
    isSelected,
    isEditing = false,
    onMouseDown,
    onDoubleClick,
    onResizeStart,
    onRotateStart,
    onUpdate,
    onBlur
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Focus textarea when text editing starts
    useEffect(() => {
        if (isEditing && element.type === 'text' && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
        }
    }, [isEditing, element.type]);

    // Determine which renderer to use
    const isAAC = element.type === 'card' && (element.metadata?.isAACCard || element.metadata?.isAACSentenceItem);
    const isImageOrShape = element.type === 'image' || element.type === 'shape' || element.type === 'circle' ||
        (element.type === 'card' && !element.metadata?.isAACCard && !element.metadata?.isAACSentenceItem);
    const isLine = element.type === 'line' || element.type === 'arrow';
    const imageUrl = element.type === 'image' ? element.content : element.backgroundImage;

    // Handle style for selection handles
    const handleStyle: React.CSSProperties = {
        position: 'absolute',
        width: 8,
        height: 8,
        backgroundColor: 'white',
        border: `1px solid ${FIGMA_BLUE}`,
        boxSizing: 'border-box',
        zIndex: 20,
    };

    return (
        <div
            style={{
                position: 'absolute',
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                transform: `rotate(${element.rotation}deg)`,
                zIndex: element.zIndex,
                cursor: isEditing ? (element.type === 'text' ? 'text' : 'default') : (isSelected ? 'move' : 'default'),
                boxSizing: 'border-box',
                pointerEvents: element.isPassThrough ? 'none' : undefined,
            }}
            onMouseDown={(e) => onMouseDown(e, element.id)}
            onDoubleClick={(e) => onDoubleClick?.(e, element.id)}
            className="group"
        >
            {/* Content Layer */}
            <div className="w-full h-full relative">
                {/* Text */}
                {element.type === 'text' && (
                    <TextRenderer
                        element={element}
                        isEditing={isEditing}
                        onUpdate={(val) => onUpdate?.(val)}
                        onUpdateRichText={(val) => onUpdate?.({ richTextContent: val })}
                        onBlur={onBlur}
                        textareaRef={textareaRef}
                    />
                )}

                {/* AAC Card */}
                {isAAC && (
                    <AACCardRenderer
                        element={element}
                        onUpdate={(val) => onUpdate?.(val)}
                        onCommit={(val) => onUpdate?.(val)}
                    />
                )}

                {/* Image/Shape - Edit Mode */}
                {isImageOrShape && isEditing && imageUrl && (
                    <ImageCropEditor
                        element={element}
                        imageUrl={imageUrl}
                        onUpdate={(val) => onUpdate?.(val)}
                    />
                )}

                {/* Image/Shape - View Mode */}
                {isImageOrShape && !isEditing && (
                    <ImageRenderer element={element} imageUrl={imageUrl} />
                )}

                {/* Line/Arrow */}
                {isLine && <LineRenderer element={element} />}
            </div>

            {/* Selection UI - Only when selected and not editing */}
            {isSelected && !isEditing && (
                <>
                    {/* Bounding Box */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: -1,
                            border: `2px solid ${FIGMA_BLUE}`,
                            pointerEvents: 'none',
                            zIndex: 10,
                        }}
                    />

                    {/* Rotation Handle */}
                    {onRotateStart && (
                        <div
                            className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-sm cursor-grab"
                            style={{ zIndex: 11 }}
                            onMouseDown={(e) => onRotateStart(e, element.id)}
                        >
                            <RotateCw className="w-4 h-4 text-gray-600" />
                        </div>
                    )}

                    {/* Corner Handles */}
                    <div style={{ ...handleStyle, top: -4, left: -4, cursor: 'nwse-resize' }} onMouseDown={(e) => onResizeStart(e, element.id, 'nw')} />
                    <div style={{ ...handleStyle, top: -4, right: -4, cursor: 'nesw-resize' }} onMouseDown={(e) => onResizeStart(e, element.id, 'ne')} />
                    <div style={{ ...handleStyle, bottom: -4, left: -4, cursor: 'nesw-resize' }} onMouseDown={(e) => onResizeStart(e, element.id, 'sw')} />
                    <div style={{ ...handleStyle, bottom: -4, right: -4, cursor: 'nwse-resize' }} onMouseDown={(e) => onResizeStart(e, element.id, 'se')} />

                    {/* Edge Handles */}
                    <div style={{ ...handleStyle, top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' }} onMouseDown={(e) => onResizeStart(e, element.id, 'n')} />
                    <div style={{ ...handleStyle, bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' }} onMouseDown={(e) => onResizeStart(e, element.id, 's')} />
                    <div style={{ ...handleStyle, left: -4, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' }} onMouseDown={(e) => onResizeStart(e, element.id, 'w')} />
                    <div style={{ ...handleStyle, right: -4, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' }} onMouseDown={(e) => onResizeStart(e, element.id, 'e')} />

                    {/* Dimension Label */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: -22,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: FIGMA_BLUE,
                            color: 'white',
                            fontSize: 10,
                            fontWeight: 500,
                            padding: '2px 6px',
                            borderRadius: 4,
                            whiteSpace: 'nowrap',
                            zIndex: 20,
                        }}
                    >
                        {Math.round(element.width)} × {Math.round(element.height)}
                    </div>
                </>
            )}

            {/* Editing Border */}
            {isEditing && (
                <div
                    style={{
                        position: 'absolute',
                        inset: -2,
                        border: `1px dashed ${FIGMA_BLUE}`,
                        pointerEvents: 'none',
                        zIndex: 10,
                    }}
                />
            )}
        </div>
    );
};
