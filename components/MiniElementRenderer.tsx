
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
            const isEmojiUrl = aacData?.emoji?.startsWith('http') || aacData?.emoji?.startsWith('data:');
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
                    <div
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingTop: aacData?.label ? 4 : 0
                        }}
                    >
                        {isEmojiUrl ? (
                            <img
                                src={aacData?.emoji}
                                alt=""
                                className="object-contain"
                                style={{ width: size * 0.6, height: size * 0.6 }}
                            />
                        ) : (
                            <div style={{ fontSize: size * 0.45, lineHeight: 1 }}>
                                {aacData?.emoji || '❓'}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // 일반 AAC 카드
        const labelPosition = aacData?.labelPosition || 'above';
        const symbolScale = aacData?.symbolScale || 0.45;
        const isEmojiUrl = aacData?.emoji?.startsWith('http') || aacData?.emoji?.startsWith('data:');

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
                }}
            >
                {isFilled && labelPosition !== 'none' && (
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: labelPosition === 'above' ? 4 : 'auto',
                            bottom: labelPosition === 'below' ? 4 : 'auto',
                            textAlign: 'center',
                            fontSize: aacData?.fontSize || 20,
                            fontWeight: aacData?.fontWeight || 400,
                            color: aacData?.color || '#000000',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            padding: '0 4px',
                            lineHeight: 1.2
                        }}
                    >
                        {aacData?.label || '라벨'}
                    </div>
                )}

                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        paddingTop: labelPosition === 'above' && isFilled ? size * 0.15 : 0,
                        paddingBottom: labelPosition === 'below' && isFilled ? size * 0.15 : 0
                    }}
                >
                    {isFilled && aacData?.emoji ? (
                        isEmojiUrl ? (
                            <img
                                src={aacData.emoji}
                                alt={aacData.label || ''}
                                className="object-contain"
                                style={{
                                    width: size * symbolScale,
                                    height: size * symbolScale
                                }}
                            />
                        ) : (
                            <div style={{ fontSize: size * symbolScale, lineHeight: 1 }}>
                                {aacData.emoji}
                            </div>
                        )
                    ) : (
                        !isFilled && (
                            <div style={{ fontSize: size * 0.1, color: '#D1D5DB' }}>
                                Card
                            </div>
                        )
                    )}
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
