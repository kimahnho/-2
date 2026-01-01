import React from 'react';
import {
    AlignLeft, AlignCenter, AlignRight,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd
} from 'lucide-react';

interface AlignmentControlsProps {
    selectedIds: string[];
    onAlign?: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'distribute-horizontal' | 'distribute-vertical') => void;
    onDuplicate: (ids: string[]) => void;
    onDelete: (ids: string[]) => void;
}

/**
 * AlignmentControls - 다중 선택 시 정렬/배분
 */
export const AlignmentControls: React.FC<AlignmentControlsProps> = ({
    selectedIds,
    onAlign,
    onDuplicate,
    onDelete
}) => {
    return (
        <div className="space-y-3 border-t border-gray-100 pt-4">
            <label className="text-xs font-bold text-gray-500">정렬 및 배분</label>

            {/* 정렬 버튼 */}
            <div className="flex flex-wrap gap-1">
                <button onClick={() => onAlign?.('left')} className="p-2 border rounded hover:bg-gray-50" title="왼쪽">
                    <AlignLeft className="w-4 h-4" />
                </button>
                <button onClick={() => onAlign?.('center')} className="p-2 border rounded hover:bg-gray-50" title="가운데">
                    <AlignCenter className="w-4 h-4" />
                </button>
                <button onClick={() => onAlign?.('right')} className="p-2 border rounded hover:bg-gray-50" title="오른쪽">
                    <AlignRight className="w-4 h-4" />
                </button>
                <button onClick={() => onAlign?.('top')} className="p-2 border rounded hover:bg-gray-50" title="위쪽">
                    <AlignVerticalJustifyStart className="w-4 h-4" />
                </button>
                <button onClick={() => onAlign?.('middle')} className="p-2 border rounded hover:bg-gray-50" title="중간">
                    <AlignVerticalJustifyCenter className="w-4 h-4" />
                </button>
                <button onClick={() => onAlign?.('bottom')} className="p-2 border rounded hover:bg-gray-50" title="아래쪽">
                    <AlignVerticalJustifyEnd className="w-4 h-4" />
                </button>
            </div>

            {/* 배분 버튼 */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => onAlign?.('distribute-horizontal')}
                    className="px-3 py-2 text-xs border rounded hover:bg-gray-50"
                >
                    가로 간격 동일
                </button>
                <button
                    onClick={() => onAlign?.('distribute-vertical')}
                    className="px-3 py-2 text-xs border rounded hover:bg-gray-50"
                >
                    세로 간격 동일
                </button>
            </div>

            {/* 복제/삭제 */}
            <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                    onClick={() => onDuplicate(selectedIds)}
                    className="py-2 text-sm font-medium text-[#5500FF] border border-[#5500FF] rounded hover:bg-[#5500FF]/5"
                >
                    복제하기
                </button>
                <button
                    onClick={() => onDelete(selectedIds)}
                    className="py-2 text-sm font-medium text-red-500 border border-red-500 rounded hover:bg-red-50"
                >
                    삭제하기
                </button>
            </div>
        </div>
    );
};
