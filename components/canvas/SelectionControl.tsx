import React from 'react';

interface SelectionControlProps {
    width: number;
    height: number;
    isSelected?: boolean;
}

/**
 * Figma-style Object Selection & Transform Control
 * Visual UI component with bounding box, resize handles, and dimension label
 */
export const SelectionControl: React.FC<React.PropsWithChildren<SelectionControlProps>> = ({
    width,
    height,
    isSelected = true,
    children
}) => {
    const FIGMA_BLUE = '#0099FF';
    const HANDLE_SIZE = 8;
    const HANDLE_OFFSET = -4; // Centers the 8px handle on the border

    // Base handle style
    const handleStyle: React.CSSProperties = {
        position: 'absolute',
        width: HANDLE_SIZE,
        height: HANDLE_SIZE,
        backgroundColor: 'white',
        border: `1px solid ${FIGMA_BLUE}`,
        boxSizing: 'border-box',
        zIndex: 10,
    };

    if (!isSelected) {
        return <>{children}</>;
    }

    return (
        <div
            className="selection-control"
            style={{
                position: 'relative',
                width,
                height,
                display: 'inline-block',
            }}
        >
            {/* The actual content (image) */}
            <div style={{ width: '100%', height: '100%' }}>
                {children}
            </div>

            {/* Bounding Box Border */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    border: `2px solid ${FIGMA_BLUE}`,
                    pointerEvents: 'none',
                    zIndex: 5,
                }}
            />

            {/* === CORNER HANDLES (4) === */}
            {/* Top-Left */}
            <div
                style={{
                    ...handleStyle,
                    top: HANDLE_OFFSET,
                    left: HANDLE_OFFSET,
                    cursor: 'nwse-resize',
                }}
            />
            {/* Top-Right */}
            <div
                style={{
                    ...handleStyle,
                    top: HANDLE_OFFSET,
                    right: HANDLE_OFFSET,
                    cursor: 'nesw-resize',
                }}
            />
            {/* Bottom-Left */}
            <div
                style={{
                    ...handleStyle,
                    bottom: HANDLE_OFFSET,
                    left: HANDLE_OFFSET,
                    cursor: 'nesw-resize',
                }}
            />
            {/* Bottom-Right */}
            <div
                style={{
                    ...handleStyle,
                    bottom: HANDLE_OFFSET,
                    right: HANDLE_OFFSET,
                    cursor: 'nwse-resize',
                }}
            />

            {/* === EDGE HANDLES (4) === */}
            {/* Top Center */}
            <div
                style={{
                    ...handleStyle,
                    top: HANDLE_OFFSET,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    cursor: 'ns-resize',
                }}
            />
            {/* Bottom Center */}
            <div
                style={{
                    ...handleStyle,
                    bottom: HANDLE_OFFSET,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    cursor: 'ns-resize',
                }}
            />
            {/* Left Center */}
            <div
                style={{
                    ...handleStyle,
                    left: HANDLE_OFFSET,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'ew-resize',
                }}
            />
            {/* Right Center */}
            <div
                style={{
                    ...handleStyle,
                    right: HANDLE_OFFSET,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'ew-resize',
                }}
            />

            {/* === DIMENSION LABEL (HUD) === */}
            <div
                style={{
                    position: 'absolute',
                    bottom: -25,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: FIGMA_BLUE,
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 500,
                    padding: '2px 6px',
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                }}
            >
                {Math.round(width)} × {Math.round(height)}
            </div>
        </div>
    );
};

/**
 * Demo component showing 3 characters with selection control
 */
export const SelectionControlDemo: React.FC = () => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 40,
                padding: 60,
                backgroundColor: '#f5f5f5',
            }}
        >
            {/* Left Character - Ghosted (unselected) */}
            <div style={{ opacity: 0.5 }}>
                <img
                    src="/character.png"
                    alt="Character"
                    style={{ width: 143, height: 218 }}
                />
            </div>

            {/* Center Character - Selected with Controls */}
            <SelectionControl width={143} height={218} isSelected={true}>
                <img
                    src="/character.png"
                    alt="Character"
                    style={{ width: '100%', height: '100%', display: 'block' }}
                />
            </SelectionControl>

            {/* Right Character - Ghosted (unselected) */}
            <div style={{ opacity: 0.5 }}>
                <img
                    src="/character.png"
                    alt="Character"
                    style={{ width: 143, height: 218 }}
                />
            </div>
        </div>
    );
};

export default SelectionControl;
