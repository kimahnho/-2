import React from 'react';
import { DesignElement } from '../../../types';

interface ImageRendererProps {
    element: DesignElement;
    imageUrl?: string;
}

/**
 * ImageRenderer - View mode
 * 
 * Supports both legacy single scale and new independent X/Y scales:
 * - backgroundScale: legacy zoom level (100 = fit)
 * - backgroundScaleX/Y: new independent scales (1 = 100%)
 * - backgroundPosition: { x: 0-1, y: 0-1 } as CSS position %
 */
export const ImageRenderer: React.FC<ImageRendererProps> = ({ element, imageUrl }) => {
    if (!imageUrl) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: element.backgroundColor || '#f3f4f6',
                border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : undefined,
                borderRadius: element.type === 'circle' ? '50%' : element.borderRadius,
                opacity: element.opacity,
            }} />
        );
    }

    // Get stored values or defaults
    const pos = element.backgroundPosition ?? { x: 0.5, y: 0.5 }; // Default: centered

    // Use independent X/Y scales if available, otherwise fall back to single scale
    const hasIndependentScale = element.backgroundScaleX !== undefined || element.backgroundScaleY !== undefined;

    let bgSize: string;
    if (hasIndependentScale) {
        // New: independent X/Y scaling
        const scaleX = element.backgroundScaleX ?? 1;
        const scaleY = element.backgroundScaleY ?? 1;
        bgSize = `${scaleX * 100}% ${scaleY * 100}%`;
    } else {
        // Legacy: single scale
        const scale = element.backgroundScale ?? 100;
        bgSize = `${scale}%`;
    }

    // background-position: 0-100% for x and y
    const bgPosX = pos.x * 100;
    const bgPosY = pos.y * 100;

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: bgSize,
            backgroundPosition: `${bgPosX}% ${bgPosY}%`,
            backgroundRepeat: 'no-repeat',
            border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : undefined,
            borderRadius: element.type === 'circle' ? '50%' : element.borderRadius,
            opacity: element.opacity,
        }} />
    );
};
