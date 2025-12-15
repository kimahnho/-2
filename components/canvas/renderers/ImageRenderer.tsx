import React from 'react';
import { DesignElement } from '../../../types';

interface ImageRendererProps {
    element: DesignElement;
    imageUrl?: string;
}

/**
 * ImageRenderer - View mode
 * 
 * SIMPLE CSS PERCENTAGE SYSTEM:
 * - backgroundScale: zoom level (100 = fit, 150 = 1.5x zoom)
 * - backgroundPosition: { x: 0-1, y: 0-1 } as CSS position %
 *   - 0 = left/top, 0.5 = center, 1 = right/bottom
 * 
 * CSS background-size % is RELATIVE to container → scales with frame!
 * CSS background-position % aligns proportionally → scales with frame!
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
    const scale = element.backgroundScale ?? 100;
    const pos = element.backgroundPosition ?? { x: 0.5, y: 0.5 }; // Default: centered

    // Convert to CSS
    // background-size: percentage of container
    const bgSize = `${scale}%`;
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
