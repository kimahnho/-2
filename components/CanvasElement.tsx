
import React, { useRef, useEffect } from 'react';
import { DesignElement } from '../types';
import { RotateCw, Move } from 'lucide-react';

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

// Helper: Render Text Element
const TextRenderer: React.FC<{
    element: DesignElement,
    isEditing: boolean,
    onUpdate?: (val: string) => void,
    onBlur?: () => void,
    textareaRef: React.RefObject<HTMLTextAreaElement>
}> = ({ element, isEditing, onUpdate, onBlur, textareaRef }) => {
    const fontStyle = {
        fontFamily: element.fontFamily || "'Gowun Dodum', sans-serif",
    };

    const commonStyle = {
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

// Helper: Render AAC Card (통합된 AAC 카드 렌더러)
const AACCardRenderer: React.FC<{
    element: DesignElement;
    onUpdate?: (update: Partial<DesignElement>) => void;
    onCommit?: (update: Partial<DesignElement>) => void;
}> = ({ element, onUpdate, onCommit }) => {
    const [isEditingLabel, setIsEditingLabel] = React.useState(false);
    const [labelValue, setLabelValue] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    const aacData = element.metadata?.aacData;
    const isFilled = aacData?.isFilled;
    const isSentenceItem = element.metadata?.isAACSentenceItem;
    const size = Math.min(element.width, element.height);

    React.useEffect(() => {
        if (isEditingLabel && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditingLabel]);

    const handleLabelClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLabelValue(aacData?.label || '');
        setIsEditingLabel(true);
    };

    const handleLabelBlur = () => {
        setIsEditingLabel(false);
        if (onCommit && element.metadata) {
            onCommit({
                metadata: {
                    ...element.metadata,
                    aacData: { ...aacData, label: labelValue }
                }
            });
        }
    };

    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLabelValue(e.target.value);
        if (onUpdate && element.metadata) {
            onUpdate({
                metadata: {
                    ...element.metadata,
                    aacData: { ...aacData, label: e.target.value }
                }
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLabelBlur();
        }
    };

    // 문장 영역 아이템 (작은 크기)
    if (isSentenceItem) {
        return (
            <div
                className="w-full h-full relative overflow-hidden"
                style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #E5E7EB',
                    borderRadius: 6,
                }}
            >
                {/* 라벨 (상단) */}
                {aacData?.label && (
                    <div
                        className="absolute top-1 left-0 right-0 text-center text-gray-600 truncate px-1"
                        style={{ fontSize: Math.max(7, size * 0.12) }}
                    >
                        {aacData.label}
                    </div>
                )}
                {/* 이모지 (중앙) */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: aacData?.label ? 8 : 0 }}>
                    <span style={{ fontSize: size * 0.45, lineHeight: 1 }}>
                        {aacData?.emoji || '❓'}
                    </span>
                </div>
            </div>
        );
    }

    // 일반 AAC 카드
    return (
        <div
            className="w-full h-full relative overflow-hidden"
            style={{
                backgroundColor: element.backgroundColor || '#ffffff',
                border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : '2px solid #E5E7EB',
                borderRadius: element.borderRadius || 12,
            }}
        >
            {/* 라벨 (상단) - 클릭 시 편집 가능 */}
            {isFilled && (
                <div
                    className="absolute top-2 left-0 right-0 text-center px-1"
                    style={{ zIndex: 10 }}
                >
                    {isEditingLabel ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={labelValue}
                            onChange={handleLabelChange}
                            onBlur={handleLabelBlur}
                            onKeyDown={handleKeyDown}
                            className="w-full text-center bg-white border border-blue-400 rounded px-1 outline-none"
                            style={{ fontSize: 12 }}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <div
                            className="text-gray-700 font-medium cursor-text hover:bg-blue-50 rounded px-1 transition-colors"
                            style={{ fontSize: 12 }}
                            onClick={handleLabelClick}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            {aacData?.label || '라벨 추가'}
                        </div>
                    )}
                </div>
            )}

            {/* 이모지 (중앙) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {isFilled && aacData?.emoji ? (
                    <span style={{ fontSize: size * 0.45 }}>
                        {aacData.emoji}
                    </span>
                ) : (
                    <span className="text-gray-300" style={{ fontSize: size * 0.1 }}>
                        카드 추가
                    </span>
                )}
            </div>
        </div>
    );
};

const ImageShapeRenderer: React.FC<{
    element: DesignElement,
    isEditing: boolean,
    imageUrl?: string,
    onUpdate?: (update: Partial<DesignElement>) => void,
    onBlur?: () => void,
    onDragStart: (e: React.MouseEvent) => void
}> = ({ element, isEditing, imageUrl, onUpdate, onBlur, onDragStart }) => {

    // Editing Mode (Pan/Zoom for Image)
    if (isEditing && imageUrl) {
        const currentScale = element.backgroundScale || 100;
        const currentPos = element.backgroundPosition || { x: 0, y: 0 };

        return (
            <div className="w-full h-full relative overflow-hidden"
                style={{ borderRadius: element.type === 'circle' ? '50%' : element.borderRadius }}>

                {/* The Image being edited */}
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: `${currentScale}%`,
                        backgroundPosition: `${currentPos.x}px ${currentPos.y}px`,
                        backgroundRepeat: 'no-repeat',
                        opacity: 0.8,
                        cursor: 'move'
                    }}
                    onMouseDown={onDragStart}
                />

                {/* Edit Controls Overlay (Slider Only) */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 border border-gray-200 z-50" onMouseDown={e => e.stopPropagation()}>
                    <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">확대/축소</span>
                    <input
                        type="range" min="100" max="300"
                        value={currentScale}
                        onChange={(e) => onUpdate?.({ backgroundScale: Number(e.target.value) })}
                        onMouseUp={onBlur} // Commit on release
                        className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5500FF]"
                    />
                </div>

                {/* Visual Hint */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-white drop-shadow-md">
                    <Move className="w-8 h-8 opacity-70" />
                </div>
            </div>
        );
    }

    // View Mode
    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: element.backgroundColor || 'transparent',
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
            backgroundSize: element.backgroundScale ? `${element.backgroundScale}%` : (element.type === 'image' ? 'contain' : 'cover'),
            backgroundPosition: element.backgroundPosition ? `${element.backgroundPosition.x}px ${element.backgroundPosition.y}px` : 'center',
            backgroundRepeat: 'no-repeat',
            border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : undefined,
            borderRadius: element.type === 'circle' ? '50%' : element.borderRadius,
            opacity: element.opacity,
        }} />
    );
};

// Helper: Render Line/Arrow
const LineArrowRenderer: React.FC<{ element: DesignElement }> = ({ element }) => {
    const dashArray = element.borderStyle === 'dashed'
        ? `${(element.borderWidth || 2) * 4}, ${(element.borderWidth || 2) * 2}`
        : element.borderStyle === 'dotted'
            ? `${element.borderWidth || 2}, ${(element.borderWidth || 2) * 2}`
            : undefined;

    const strokeColor = element.borderColor || '#000000';
    const isArrow = element.type === 'arrow';

    return (
        <div className="w-full h-full flex items-center justify-center">
            <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                {isArrow && (
                    <defs>
                        <marker id={`arrow-${element.id}-triangle`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill={strokeColor} />
                        </marker>
                        <marker id={`arrow-${element.id}-circle`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                            <circle cx="4" cy="4" r="3" fill={strokeColor} />
                        </marker>
                        <marker id={`arrow-${element.id}-square`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                            <rect x="1" y="1" width="6" height="6" fill={strokeColor} />
                        </marker>
                    </defs>
                )}
                <line
                    x1="0" y1="50%" x2="100%" y2="50%"
                    stroke={strokeColor}
                    strokeWidth={element.borderWidth || 2}
                    strokeLinecap="round"
                    markerEnd={isArrow && element.arrowHeadType && element.arrowHeadType !== 'none' ? `url(#arrow-${element.id}-${element.arrowHeadType})` : undefined}
                    strokeDasharray={dashArray}
                />
            </svg>
        </div>
    );
};


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
    const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number } | null>(null);

    // Focus textarea when text editing starts
    useEffect(() => {
        if (isEditing && element.type === 'text' && textareaRef.current) {
            textareaRef.current.focus();
            const len = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(len, len);
        }
    }, [isEditing, element.type]);

    const handleStyle: React.CSSProperties = {
        position: 'absolute',
        width: '10px',
        height: '10px',
        backgroundColor: '#5500FF',
        border: '1px solid white',
        borderRadius: '50%',
        zIndex: 20,
    };

    const handleImageDragStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        const startPan = element.backgroundPosition || { x: 0, y: 0 };

        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: startPan.x,
            initialY: startPan.y
        };

        const handleMove = (ev: MouseEvent) => {
            if (!dragRef.current) return;
            const deltaX = ev.clientX - dragRef.current.startX;
            const deltaY = ev.clientY - dragRef.current.startY;

            if (onUpdate) {
                onUpdate({
                    backgroundPosition: {
                        x: dragRef.current.initialX + deltaX,
                        y: dragRef.current.initialY + deltaY
                    }
                });
            }
        };

        const handleUp = () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            dragRef.current = null;
            if (onBlur) onBlur();
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
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
                cursor: isEditing ? (element.type === 'text' ? 'text' : 'default') : (element.isEmotionPlaceholder ? 'pointer' : (isSelected ? 'move' : 'default')),
                boxSizing: 'border-box',
                pointerEvents: element.isPassThrough ? 'none' : undefined,
            }}
            onMouseDown={(e) => onMouseDown(e, element.id)}
            onDoubleClick={(e) => onDoubleClick?.(e, element.id)}
            className="group"
        >
            {/* Actual Content - Delegated to sub-components */}
            <div className="w-full h-full relative">
                {element.type === 'text' && (
                    <TextRenderer
                        element={element}
                        isEditing={isEditing}
                        onUpdate={(val) => onUpdate?.(val)}
                        onBlur={onBlur}
                        textareaRef={textareaRef}
                    />
                )}

                {/* AAC 카드 및 문장 아이템 카드는 전용 렌더러 사용 */}
                {element.type === 'card' && (element.metadata?.isAACCard || element.metadata?.isAACSentenceItem) && (
                    <AACCardRenderer
                        element={element}
                        onUpdate={(val) => onUpdate?.(val)}
                        onCommit={(val) => onUpdate?.(val)}
                    />
                )}

                {/* 일반 이미지/도형/카드/원형 (AAC 카드 및 문장 아이템 제외) */}
                {(element.type === 'image' || element.type === 'shape' || element.type === 'circle' ||
                    (element.type === 'card' && !element.metadata?.isAACCard && !element.metadata?.isAACSentenceItem)) && (
                        <ImageShapeRenderer
                            element={element}
                            isEditing={isEditing}
                            imageUrl={element.type === 'image' ? element.content : element.backgroundImage}
                            onUpdate={(val) => onUpdate?.(val)}
                            onBlur={onBlur}
                            onDragStart={handleImageDragStart}
                        />
                    )}

                {(element.type === 'line' || element.type === 'arrow') && (
                    <LineArrowRenderer element={element} />
                )}
            </div>

            {/* Selection UI - 캔버스 내 요소들보다는 높지만 툴바보다는 낮은 z-index */}
            {isSelected && !isEditing && (
                <>
                    {/* Selection Border */}
                    <div
                        className="absolute -inset-1 border-2 border-[#5500FF] pointer-events-none rounded-sm"
                        style={{ zIndex: 10 }}
                    />

                    {/* Rotation Handle */}
                    {onRotateStart && (
                        <div
                            className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-sm cursor-grab active:cursor-grabbing hover:bg-gray-50"
                            style={{ zIndex: 11 }}
                            onMouseDown={(e) => onRotateStart(e, element.id)}
                        >
                            <RotateCw className="w-4 h-4 text-gray-600" />
                        </div>
                    )}

                    {/* Resize Handles */}
                    <div style={{ ...handleStyle, top: -5, left: -5, cursor: 'nw-resize', zIndex: 11 }} onMouseDown={(e) => onResizeStart(e, element.id, 'nw')} />
                    <div style={{ ...handleStyle, top: -5, right: -5, cursor: 'ne-resize', zIndex: 11 }} onMouseDown={(e) => onResizeStart(e, element.id, 'ne')} />
                    <div style={{ ...handleStyle, bottom: -5, left: -5, cursor: 'sw-resize', zIndex: 11 }} onMouseDown={(e) => onResizeStart(e, element.id, 'sw')} />
                    <div style={{ ...handleStyle, bottom: -5, right: -5, cursor: 'se-resize', zIndex: 11 }} onMouseDown={(e) => onResizeStart(e, element.id, 'se')} />
                </>
            )}

            {/* Editing Border (Subtle dash) */}
            {isEditing && (
                <div className="absolute -inset-2 border border-dashed border-[#B0C0ff] pointer-events-none rounded-sm" style={{ zIndex: 10 }} />
            )}
        </div>
    );
};
