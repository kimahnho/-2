
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

// Helper: Render Image/Shape/Card/Circle
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
      {/* Rotation Handle */}
      {isSelected && !isEditing && onRotateStart && (
         <div 
           className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-sm cursor-grab active:cursor-grabbing hover:bg-gray-50 z-30"
           onMouseDown={(e) => onRotateStart(e, element.id)}
         >
           <RotateCw className="w-4 h-4 text-gray-600" />
         </div>
      )}

      {/* Selection Border */}
      {isSelected && !isEditing && (
        <div className="absolute -inset-1 border-2 border-[#5500FF] pointer-events-none rounded-sm z-10" />
      )}

      {/* Editing Border (Subtle dash) */}
      {isEditing && (
         <div className="absolute -inset-2 border border-dashed border-[#B0C0ff] pointer-events-none rounded-sm" />
      )}

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
        
        {(element.type === 'image' || element.type === 'shape' || element.type === 'card' || element.type === 'circle') && (
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

      {/* Resize Handles (Only show when selected AND NOT editing) */}
      {isSelected && !isEditing && (
        <>
          <div style={{ ...handleStyle, top: -5, left: -5, cursor: 'nw-resize' }} onMouseDown={(e) => onResizeStart(e, element.id, 'nw')} />
          <div style={{ ...handleStyle, top: -5, right: -5, cursor: 'ne-resize' }} onMouseDown={(e) => onResizeStart(e, element.id, 'ne')} />
          <div style={{ ...handleStyle, bottom: -5, left: -5, cursor: 'sw-resize' }} onMouseDown={(e) => onResizeStart(e, element.id, 'sw')} />
          <div style={{ ...handleStyle, bottom: -5, right: -5, cursor: 'se-resize' }} onMouseDown={(e) => onResizeStart(e, element.id, 'se')} />
        </>
      )}
    </div>
  );
};
