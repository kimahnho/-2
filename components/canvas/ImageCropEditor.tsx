import React from 'react';
import { DesignElement } from '../../types';

const FIGMA_BLUE = '#0099FF';

interface ImageCropEditorProps {
    element: DesignElement;
    imageUrl: string;
    onUpdate: (update: Partial<DesignElement>) => void;
}

/**
 * Image Crop Editor
 * 
 * SIMPLE SYSTEM:
 * - backgroundScale: zoom % (100 = fit, 200 = 2x zoom)
 * - backgroundPosition: { x: 0-1, y: 0-1 }
 *   - 0 = left/top edge, 0.5 = center, 1 = right/bottom edge
 * 
 * These are CSS percentages that scale WITH the frame.
 */
export const ImageCropEditor: React.FC<ImageCropEditorProps> = ({
    element,
    imageUrl,
    onUpdate
}) => {
    const [naturalSize, setNaturalSize] = React.useState({ width: 0, height: 0 });
    const dragRef = React.useRef<{
        type: 'pan' | 'scale';
        startX: number;
        startY: number;
        startScale: number;
        startPos: { x: number; y: number };
    } | null>(null);

    React.useEffect(() => {
        const img = new Image();
        img.onload = () => setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        img.src = imageUrl;
    }, [imageUrl]);

    const frameW = element.width;
    const frameH = element.height;

    const scale = element.backgroundScale ?? 100;
    const pos = element.backgroundPosition ?? { x: 0.5, y: 0.5 };

    // For visual display, calculate pixel positions
    const aspect = naturalSize.width > 0 ? naturalSize.width / naturalSize.height : 1;
    const imgW = frameW * (scale / 100);
    const imgH = imgW / aspect;

    // CSS background-position % means: align X% of image with X% of container
    // To show as pixels: image position relative to frame
    // When pos.x = 0, left edges align
    // When pos.x = 1, right edges align
    // When pos.x = 0.5, centers align
    const displayX = -(imgW - frameW) * pos.x;
    const displayY = -(imgH - frameH) * pos.y;

    // === PAN ===
    const handlePan = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        dragRef.current = {
            type: 'pan',
            startX: e.clientX, startY: e.clientY,
            startScale: scale, startPos: { ...pos }
        };

        const onMove = (ev: MouseEvent) => {
            if (!dragRef.current) return;
            const dx = ev.clientX - dragRef.current.startX;
            const dy = ev.clientY - dragRef.current.startY;

            // Calculate how much we can scroll
            const currentImgW = frameW * (dragRef.current.startScale / 100);
            const currentImgH = currentImgW / aspect;
            const scrollableX = currentImgW - frameW;
            const scrollableY = currentImgH - frameH;

            // Convert pixel drag to position change
            let newPosX = dragRef.current.startPos.x;
            let newPosY = dragRef.current.startPos.y;

            if (scrollableX > 0) {
                newPosX = Math.max(0, Math.min(1, dragRef.current.startPos.x - dx / scrollableX));
            }
            if (scrollableY > 0) {
                newPosY = Math.max(0, Math.min(1, dragRef.current.startPos.y - dy / scrollableY));
            }

            onUpdate({ backgroundPosition: { x: newPosX, y: newPosY } });
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            dragRef.current = null;
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    // === SCALE ===
    const handleScale = (e: React.MouseEvent, handle: string) => {
        e.stopPropagation();
        e.preventDefault();
        dragRef.current = {
            type: 'scale',
            startX: e.clientX, startY: e.clientY,
            startScale: scale, startPos: { ...pos }
        };

        const onMove = (ev: MouseEvent) => {
            if (!dragRef.current) return;
            const dx = ev.clientX - dragRef.current.startX;
            const dy = ev.clientY - dragRef.current.startY;

            let delta = 0;
            if (handle === 'se') delta = (dx + dy) / 3;
            else if (handle === 'sw') delta = (-dx + dy) / 3;
            else if (handle === 'ne') delta = (dx - dy) / 3;
            else if (handle === 'nw') delta = (-dx - dy) / 3;

            const newScale = Math.max(100, Math.min(300, dragRef.current.startScale + delta));
            onUpdate({ backgroundScale: Math.round(newScale) });
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            dragRef.current = null;
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    const scaleHandle: React.CSSProperties = {
        position: 'absolute', width: 12, height: 12,
        backgroundColor: FIGMA_BLUE, borderRadius: '50%',
        border: '2px solid white',
        zIndex: 200, pointerEvents: 'auto', cursor: 'nwse-resize',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    };

    return (
        <div className="w-full h-full relative" style={{ overflow: 'visible' }}>
            {/* GHOST IMAGE */}
            <div
                style={{
                    position: 'absolute',
                    left: displayX, top: displayY,
                    width: imgW, height: imgH,
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: '100% 100%',
                    opacity: 0.25,
                    pointerEvents: 'none',
                    zIndex: 1,
                    border: `2px dashed ${FIGMA_BLUE}`,
                }}
            />

            {/* SCALE HANDLES */}
            <div style={{ ...scaleHandle, left: displayX - 6, top: displayY - 6 }} onMouseDown={e => handleScale(e, 'nw')} />
            <div style={{ ...scaleHandle, left: displayX + imgW - 6, top: displayY - 6 }} onMouseDown={e => handleScale(e, 'ne')} />
            <div style={{ ...scaleHandle, left: displayX - 6, top: displayY + imgH - 6 }} onMouseDown={e => handleScale(e, 'sw')} />
            <div style={{ ...scaleHandle, left: displayX + imgW - 6, top: displayY + imgH - 6 }} onMouseDown={e => handleScale(e, 'se')} />

            {/* CLIP FRAME */}
            <div
                style={{
                    position: 'absolute',
                    left: 0, top: 0,
                    width: frameW, height: frameH,
                    overflow: 'hidden',
                    border: `2px solid ${FIGMA_BLUE}`,
                    borderRadius: element.type === 'circle' ? '50%' : element.borderRadius,
                    zIndex: 50,
                    boxSizing: 'border-box',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        left: displayX, top: displayY,
                        width: imgW, height: imgH,
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: '100% 100%',
                        cursor: 'grab',
                    }}
                    onMouseDown={handlePan}
                />
            </div>

            {/* ZOOM LABEL */}
            <div style={{
                position: 'absolute',
                bottom: -26, left: '50%',
                transform: 'translateX(-50%)',
                background: FIGMA_BLUE,
                color: 'white',
                padding: '3px 10px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                zIndex: 100,
            }}>
                {scale}%
            </div>
        </div>
    );
};
