import React from 'react';

interface CommonActionsProps {
    elementId: string;
    onBringForward: (id: string) => void;
    onSendBackward: (id: string) => void;
    onBringToFront?: (id: string) => void;
    onSendToBack?: (id: string) => void;
    onAlign?: (type: 'center' | 'middle') => void;
}

/**
 * CommonActions - 레이어 순서 및 정렬
 */
export const CommonActions: React.FC<CommonActionsProps> = ({
    elementId,
    onBringForward,
    onSendBackward,
    onBringToFront,
    onSendToBack,
    onAlign
}) => {
    return (
        <div className="space-y-3 pb-8">
            <label className="text-xs font-bold text-gray-500">레이어 순서</label>

            {/* Z-Order 버튼 */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => onBringToFront?.(elementId)}
                    className="py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                >
                    맨 앞으로
                </button>
                <button
                    onClick={() => onBringForward(elementId)}
                    className="py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                >
                    앞으로
                </button>
                <button
                    onClick={() => onSendBackward(elementId)}
                    className="py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                >
                    뒤로
                </button>
                <button
                    onClick={() => onSendToBack?.(elementId)}
                    className="py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                >
                    맨 뒤로
                </button>
            </div>

            {/* 정렬 버튼 */}
            <div className="flex gap-2 mt-2">
                <button
                    onClick={() => onAlign?.('center')}
                    className="flex-1 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                >
                    가로 중앙
                </button>
                <button
                    onClick={() => onAlign?.('middle')}
                    className="flex-1 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                >
                    세로 중앙
                </button>
            </div>
        </div>
    );
};
