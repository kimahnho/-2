
import React from 'react';
import { DesignElement } from '../types';

interface Props {
    element: DesignElement;
}

export const MiniElementRenderer: React.FC<Props> = ({ element }) => {
    // 1. AAC 카드 렌더링
    if (element.type === 'card' && (element.metadata?.isAACCard || element.metadata?.isAACSentenceItem)) {
        const aacData = element.metadata?.aacData;
        const isFilled = aacData?.isFilled;
        const size = Math.min(element.width, element.height);
        const isSentenceItem = element.metadata?.isAACSentenceItem;

        // 문장 아이템 (작은 카드)
        if (isSentenceItem) {
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
                        backgroundColor: '#ffffff',
                        border: '1px solid #E5E7EB',
                        borderRadius: element.borderRadius || 6,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {aacData?.label && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 2, left: 0, right: 0,
                                textAlign: 'center',
                                fontSize: Math.max(5, size * 0.12),
                                color: '#4B5563',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden'
                            }}
                        >
                            {aacData.label}
                        </div>
                    )}
                    <div style={{ fontSize: size * 0.45, lineHeight: 1, marginTop: aacData?.label ? 4 : 0 }}>
                        {aacData?.emoji || '❓'}
                    </div>
                </div>
            );
        }

        // 일반 AAC 카드
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
                    backgroundColor: element.backgroundColor || '#ffffff',
                    border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : '1px solid #E5E7EB',
                    borderRadius: element.borderRadius || 12,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {isFilled && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 4, left: 0, right: 0,
                            textAlign: 'center',
                            // 수정: PageManager는 transform scale을 사용하므로 원래 px 값을 써야 함.
                            fontSize: aacData?.fontSize || 20,
                            fontWeight: aacData?.fontWeight || 400,
                            color: aacData?.color || '#000000',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden'
                        }}
                    >
                        {aacData?.label || '라벨'}
                    </div>
                )}
                <div style={{
                    fontSize: size * 0.45,
                    lineHeight: 1,
                    marginTop: isFilled && aacData?.label ? 0 : 0,
                    pointerEvents: 'none'
                }}>
                    {isFilled && aacData?.emoji ? aacData.emoji : (!isFilled ? 'Card' : '')}
                </div>
            </div>
        );
    }

    // 2. 일반 텍스트
    if (element.type === 'text') {
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
                    color: element.color,
                    fontSize: element.fontSize,
                    fontFamily: element.fontFamily,
                    fontWeight: element.fontWeight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.2
                }}
            >
                {element.content}
            </div>
        );
    }

    // 3. 이미지
    if (element.type === 'image') {
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
                    opacity: element.opacity
                }}
            >
                <img src={element.content} className="w-full h-full object-contain" alt="" />
            </div>
        );
    }

    // 4. 도형 / 일반 카드 / 기타
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
                backgroundColor: element.backgroundColor,
                backgroundImage: element.backgroundImage ? `url(${element.backgroundImage})` : undefined,
                backgroundSize: element.backgroundScale ? `${element.backgroundScale}%` : 'cover',
                backgroundPosition: element.backgroundPosition ? `${element.backgroundPosition.x}px ${element.backgroundPosition.y}px` : 'center',
                backgroundRepeat: 'no-repeat',
                border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : undefined,
                borderRadius: element.type === 'circle' ? '50%' : element.borderRadius,
                opacity: element.opacity
            }}
        />
    );
};
