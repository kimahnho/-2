import React from 'react';
import { DesignElement } from '../../../types';

interface AACCardRendererProps {
    element: DesignElement;
    onUpdate?: (update: Partial<DesignElement>) => void;
    onCommit?: (update: Partial<DesignElement>) => void;
}

export const AACCardRenderer: React.FC<AACCardRendererProps> = ({
    element,
    onUpdate,
    onCommit
}) => {
    const [isEditingLabel, setIsEditingLabel] = React.useState(false);
    const [labelValue, setLabelValue] = React.useState('');
    const [imageError, setImageError] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const aacData = element.metadata?.aacData;

    // Reset image error state when emoji URL changes
    React.useEffect(() => {
        setImageError(false);
    }, [aacData?.emoji]);
    const isFilled = aacData?.isFilled;
    const isSentenceItem = element.metadata?.isAACSentenceItem;
    const size = Math.min(element.width, element.height);

    React.useEffect(() => {
        if (isEditingLabel && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditingLabel]);

    const handleLabelDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLabelValue(aacData?.label || '');
        setIsEditingLabel(true);
    };

    const handleLabelBlur = () => {
        setIsEditingLabel(false);
        if (onCommit && element.metadata) {
            onCommit({
                metadata: {
                    ...element.metadata,
                    aacData: { ...aacData, label: labelValue }
                }
            });
        }
    };

    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLabelValue(e.target.value);
        if (onUpdate && element.metadata) {
            onUpdate({
                metadata: {
                    ...element.metadata,
                    aacData: { ...aacData, label: e.target.value }
                }
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLabelBlur();
        }
    };

    // 문장 영역 아이템 (작은 크기)
    if (isSentenceItem) {
        const isEmojiUrl = aacData?.emoji?.startsWith('http') && !imageError;
        return (
            <div
                className="w-full h-full relative overflow-hidden"
                style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #E5E7EB',
                    borderRadius: 6,
                }}
            >
                {aacData?.label && (
                    <div
                        className="absolute top-1 left-0 right-0 text-center text-gray-600 truncate px-1"
                        style={{ fontSize: Math.max(7, size * 0.12) }}
                    >
                        {aacData.label}
                    </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: aacData?.label ? 8 : 0 }}>
                    {isEmojiUrl ? (
                        <img
                            src={aacData?.emoji}
                            alt={aacData?.label || ''}
                            crossOrigin="anonymous"
                            style={{ width: size * 0.6, height: size * 0.6, objectFit: 'contain' }}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <span style={{ fontSize: size * 0.45, lineHeight: 1 }}>
                            {aacData?.emoji || '❓'}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    // 일반 AAC 카드
    const labelPosition = aacData?.labelPosition || 'above';
    const symbolScale = aacData?.symbolScale || 0.45;

    return (
        <div
            className="w-full h-full relative overflow-hidden"
            style={{
                backgroundColor: element.backgroundColor || '#ffffff',
                border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : '2px solid #E5E7EB',
                borderRadius: element.borderRadius || 12,
            }}
        >
            {isFilled && labelPosition !== 'none' && (
                <div className={`absolute left-0 right-0 text-center px-1 ${labelPosition === 'above' ? 'top-2' : 'bottom-2'}`}>
                    {isEditingLabel ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={labelValue}
                            onChange={handleLabelChange}
                            onBlur={handleLabelBlur}
                            onKeyDown={handleKeyDown}
                            className="w-full text-center bg-white border border-blue-400 rounded px-1 outline-none"
                            style={{
                                fontSize: aacData?.fontSize || 20,
                                fontWeight: aacData?.fontWeight || 400,
                                color: aacData?.color || '#000000'
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <div
                            className="cursor-pointer hover:bg-blue-50 rounded px-1 transition-colors"
                            style={{
                                fontSize: aacData?.fontSize || 20,
                                fontWeight: aacData?.fontWeight || 400,
                                color: aacData?.color || '#000000'
                            }}
                            onDoubleClick={handleLabelDoubleClick}
                        >
                            {aacData?.label || '라벨 추가'}
                        </div>
                    )}
                </div>
            )}

            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                    paddingTop: labelPosition === 'above' && isFilled ? size * 0.15 : 0,
                    paddingBottom: labelPosition === 'below' && isFilled ? size * 0.15 : 0
                }}
            >
                {isFilled && aacData?.emoji ? (
                    aacData.emoji.startsWith('http') && !imageError ? (
                        <img
                            src={aacData.emoji}
                            alt={aacData.label || ''}
                            crossOrigin="anonymous"
                            style={{
                                width: size * symbolScale,
                                height: size * symbolScale,
                                objectFit: 'contain'
                            }}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <span style={{ fontSize: size * symbolScale }}>
                            {aacData.emoji}
                        </span>
                    )
                ) : (
                    <span className="text-gray-300" style={{ fontSize: size * 0.1 }}>
                        카드 추가
                    </span>
                )}
            </div>
        </div>
    );
};
