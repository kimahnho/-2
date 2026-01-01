import React from 'react';
import { DesignElement } from '../../types';
import { RotateCw } from 'lucide-react';

interface Props {
    selectedIds: string[];
    elements: DesignElement[];
    zoom: number;
    onResizeStart: (e: React.MouseEvent, id: string, handle: string) => void;
    onRotateStart: (e: React.MouseEvent, id: string) => void;
    showRotationHandle?: boolean;
}

const FIGMA_BLUE = '#0099FF';

export const SelectionOverlay: React.FC<Props> = ({
    selectedIds,
    elements,
    zoom,
    onResizeStart,
    onRotateStart,
    showRotationHandle = true
}) => {
    if (selectedIds.length === 0) return null;

    // 1. Calculate Bounding Box
    const selectedElements = elements.filter(el => selectedIds.includes(el.id));
    if (selectedElements.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    // If single element, use its rotation? 
    // If multiple, normally AABB (Axis Aligned Bounding Box).
    const isSingle = selectedElements.length === 1;
    const singleEl = isSingle ? selectedElements[0] : null;

    if (isSingle && singleEl) {
        // Allow rotation transform
        // We will render it exactly like the element, with rotation
        return (
            <div
                style={{
                    position: 'absolute',
                    left: singleEl.x,
                    top: singleEl.y,
                    width: singleEl.width,
                    height: singleEl.height,
                    transform: `rotate(${singleEl.rotation}deg)`,
                    pointerEvents: 'none', // Allow clicking through to element? No, handles catch events.
                    zIndex: 20 // Above elements
                }}
            >
                {/* Render Frame + Handles (Reuse logic from CanvasElement) */}
                <FrameUI
                    width={singleEl.width}
                    height={singleEl.height}
                    onResizeStart={(e, h) => onResizeStart(e, singleEl.id, h)}
                    onRotateStart={(e) => onRotateStart(e, singleEl.id)}
                    showResize={true}
                    showRotate={true}
                />
            </div>
        );
    }

    // Multi-selection: AABB
    selectedElements.forEach(el => {
        // Ideally we calculate AABB of ROTATED elements.
        // For MVP, assuming unrotated AABB for multi-select is confusing if elements are rotated?
        // But standard interaction is fine.
        // If elements are rotated, the bbox should cover their turned corners.
        // Simplified: Just use x, y, w, h. If rotated, it might be inaccurate visually if we don't account for it.
        // But calculating rotated AABB is math-heavy. 
        // Most tools (Figma) do show AABB for multi-selection.

        // We'll stick to simple unrotated rects for now, or just min/max of x/y/w/h.
        // Note: This matches useCanvasEvents handleResizeStart logic (lines 146-149).
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + el.width);
        maxY = Math.max(maxY, el.y + el.height);
    });

    const width = maxX - minX;
    const height = maxY - minY;

    // If width/height invalid (e.g. infinite), return null
    if (!Number.isFinite(width) || !Number.isFinite(height)) return null;

    return (
        <div
            style={{
                position: 'absolute',
                left: minX,
                top: minY,
                width: width,
                height: height,
                pointerEvents: 'none',
                zIndex: 20
            }}
        >
            <FrameUI
                width={width}
                height={height}
                onResizeStart={(e, h) => onResizeStart(e, selectedIds[0], h)} // Pass first ID, logic handles multi
                showResize={true}
                showRotate={false} // Disable rotation for multi-select for now
            />
        </div>
    );
};

// Internal Component for Handles
const FrameUI: React.FC<{
    width: number;
    height: number;
    onResizeStart: (e: React.MouseEvent, handle: string) => void;
    onRotateStart?: (e: React.MouseEvent) => void;
    showResize: boolean;
    showRotate: boolean;
}> = ({ width, height, onResizeStart, onRotateStart, showResize, showRotate }) => {
    const handleStyle: React.CSSProperties = {
        position: 'absolute',
        width: 8,
        height: 8,
        backgroundColor: 'white',
        border: `1px solid ${FIGMA_BLUE}`,
        boxSizing: 'border-box',
        zIndex: 30, // Handles above everything
        pointerEvents: 'auto'
    };

    return (
        <>
            {/* Bounding Box Border */}
            <div
                style={{
                    position: 'absolute',
                    inset: -1,
                    border: `2px solid ${FIGMA_BLUE}`,
                    pointerEvents: 'none',
                }}
            />

            {showRotate && onRotateStart && (
                <div
                    className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-sm cursor-grab"
                    style={{ zIndex: 31, pointerEvents: 'auto' }}
                    onMouseDown={onRotateStart}
                >
                    <RotateCw className="w-4 h-4 text-gray-600" />
                </div>
            )}

            {showResize && (
                <>
                    {/* Corner Handles */}
                    <div style={{ ...handleStyle, top: -4, left: -4, cursor: 'nwse-resize' }} onMouseDown={(e) => onResizeStart(e, 'nw')} />
                    <div style={{ ...handleStyle, top: -4, right: -4, cursor: 'nesw-resize' }} onMouseDown={(e) => onResizeStart(e, 'ne')} />
                    <div style={{ ...handleStyle, bottom: -4, left: -4, cursor: 'nesw-resize' }} onMouseDown={(e) => onResizeStart(e, 'sw')} />
                    <div style={{ ...handleStyle, bottom: -4, right: -4, cursor: 'nwse-resize' }} onMouseDown={(e) => onResizeStart(e, 'se')} />

                    {/* Edge Handles */}
                    <div style={{ ...handleStyle, top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' }} onMouseDown={(e) => onResizeStart(e, 'n')} />
                    <div style={{ ...handleStyle, bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' }} onMouseDown={(e) => onResizeStart(e, 's')} />
                    <div style={{ ...handleStyle, left: -4, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' }} onMouseDown={(e) => onResizeStart(e, 'w')} />
                    <div style={{ ...handleStyle, right: -4, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' }} onMouseDown={(e) => onResizeStart(e, 'e')} />

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
                        {Math.round(width)} × {Math.round(height)}
                    </div>
                </>
            )}
        </>
    );
};
