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
import { DesignElement, TextCommand, TextStyle } from '../types/editor.types';
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
    onBlur?: (val?: any) => void;
    textCommand?: TextCommand | null;
    onTextStyleChange?: (style: TextStyle) => void;
    onContextMenu?: (e: React.MouseEvent, id: string) => void;
    onTab?: (id: string) => void;
    selectionStyle?: 'none' | 'border' | 'default';
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
    onBlur,
    textCommand,
    onTextStyleChange,
    onContextMenu,
    onTab,
    selectionStyle = 'default'
}) => {
    // ... ref/effect ... (lines 56-65) skipped in diff if unchanged, but I need to include context or rely on replace.
    // Actually, I'll just replacing the top part and the bottom render part.
    // Wait, replace_file_content needs contiguous block.
    // I will replace separate blocks if needed or just the prop definition and the render block. 
    // Let's do multi-replace.

    // ...
    // Ah, I need to match the file content. 
    // Let's just update the Component Definition and Returns.

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
    const isEmotionCard = element.type === 'card' && element.metadata?.isEmotionCard;
    const isImageOrShape = element.type === 'image' || element.type === 'shape' || element.type === 'circle' ||
        (element.type === 'card' && !element.metadata?.isAACCard && !element.metadata?.isAACSentenceItem && !element.metadata?.isEmotionCard);
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
            onContextMenu={(e) => onContextMenu?.(e, element.id)}
            className="group"
            data-element-id={element.id} // PDF 내보내기 시 데이터 매핑을 위한 ID
        >
            {/* Content Layer */}
            <div className="w-full h-full relative">
                {/* Text */}
                {element.type === 'text' && (
                    <TextRenderer
                        element={element}
                        isEditing={isEditing}
                        onUpdate={(val) => onUpdate?.(val)}
                        onUpdateRichText={(val) => onUpdate?.({ richTextHtml: val })}
                        onBlur={onBlur}
                        textareaRef={textareaRef}
                        command={textCommand}
                        onStyleChange={onTextStyleChange}
                        onTab={() => onTab?.(element.id)}
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

                {/* Emotion Card */}
                {isEmotionCard && (
                    <div
                        className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center"
                        style={{
                            backgroundColor: element.backgroundColor || '#FFF0F5',
                            border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : '2px solid #F472B6',
                            borderRadius: element.borderRadius || 16,
                        }}
                    >
                        {element.metadata?.emotionData?.imageUrl ? (
                            <>
                                <img
                                    src={element.metadata.emotionData.imageUrl}
                                    alt={element.metadata.emotionData.label || ''}
                                    className="w-full h-3/4 object-contain"
                                    crossOrigin="anonymous"
                                />
                                {element.metadata.emotionData.label && (
                                    <div className="text-center text-sm font-medium text-gray-700 mt-1">
                                        {element.metadata.emotionData.label}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center text-pink-300">
                                <div className="text-3xl mb-1">😊</div>
                                <div className="text-xs">감정 선택</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Image/Shape - Edit Mode */}
                {isImageOrShape && isEditing && imageUrl && (
                    <ImageCropEditor
                        element={element}
                        imageUrl={imageUrl}
                        onUpdate={(val) => onUpdate?.(val)}
                        onClose={() => onBlur?.()}
                    />
                )}

                {/* Image/Shape - View Mode */}
                {isImageOrShape && !isEditing && (
                    <ImageRenderer element={element} imageUrl={imageUrl} />
                )}

                {/* Line/Arrow */}
                {isLine && <LineRenderer element={element} />}
            </div>

            {/* Selection UI */}
            {
                isSelected && !isEditing && selectionStyle !== 'none' && (
                    <>
                        {/* Bounding Box (Always shown if not none) */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: -1,
                                border: `2px solid ${FIGMA_BLUE}`,
                                pointerEvents: 'none',
                                zIndex: 10,
                            }}
                        />

                        {/* Handles (Only if default) */}
                        {selectionStyle === 'default' && (
                            <>
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
                    </>
                )
            }

            {/* Editing Border */}
            {
                isEditing && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: -2,
                            border: `1px dashed ${FIGMA_BLUE}`,
                            pointerEvents: 'none',
                            zIndex: 10,
                        }}
                    />
                )
            }
        </div >
    );
};
