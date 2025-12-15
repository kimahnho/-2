import React from 'react';
import { DesignElement } from '../../../types';

interface LineRendererProps {
    element: DesignElement;
}

export const LineRenderer: React.FC<LineRendererProps> = ({ element }) => {
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
