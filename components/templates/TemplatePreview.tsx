/**
 * TemplatePreview - 템플릿 미리보기 컴포넌트
 * 실제 템플릿 요소들을 축소하여 미리보기로 표시
 */

import React from 'react';
import { DesignElement } from '../../types';
import { MiniElementRenderer } from '../MiniElementRenderer';

interface Props {
    elements: Partial<DesignElement>[];
    width?: number;
    height?: number;
}

// A4 기본 크기 (세로)
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 1131;

export const TemplatePreview: React.FC<Props> = ({
    elements,
    width = 120,
    height = 160
}) => {
    // 캔버스 대비 축소 비율 계산
    const scaleX = width / CANVAS_WIDTH;
    const scaleY = height / CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    // 축소된 캔버스 크기
    const scaledWidth = CANVAS_WIDTH * scale;
    const scaledHeight = CANVAS_HEIGHT * scale;

    // 중앙 정렬을 위한 오프셋 계산
    const offsetX = (width - scaledWidth) / 2;
    const offsetY = (height - scaledHeight) / 2;

    return (
        <div
            style={{
                width,
                height,
                backgroundColor: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 4,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    left: offsetX,
                    top: offsetY,
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                }}
            >
                {elements.map((element, index) => {
                    // 기본값 채우기
                    const fullElement: DesignElement = {
                        id: `preview-${index}`,
                        type: element.type || 'shape',
                        x: element.x || 0,
                        y: element.y || 0,
                        width: element.width || 100,
                        height: element.height || 100,
                        rotation: element.rotation || 0,
                        zIndex: element.zIndex || index,
                        content: element.content,
                        backgroundColor: element.backgroundColor,
                        borderRadius: element.borderRadius,
                        borderColor: element.borderColor,
                        borderWidth: element.borderWidth,
                        fontSize: element.fontSize,
                        color: element.color,
                        fontFamily: element.fontFamily,
                        fontWeight: element.fontWeight,
                        opacity: element.opacity,
                        pageId: '',
                    } as DesignElement;

                    return (
                        <MiniElementRenderer
                            key={index}
                            element={fullElement}
                        />
                    );
                })}
            </div>
        </div>
    );
};
