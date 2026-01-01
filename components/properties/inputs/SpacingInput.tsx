import React from 'react';

interface SpacingInputProps {
    type: 'lineHeight' | 'letterSpacing';
    value: number;
    onChange?: (value: number) => void;
    onCommit: (value: number) => void;
}

/**
 * 자간/행간 입력 컴포넌트 (Figma 스타일)
 * - 행간(lineHeight): 가↕ + 퍼센트
 * - 자간(letterSpacing): |가| + 퍼센트
 */
export const SpacingInput: React.FC<SpacingInputProps> = ({
    type,
    value,
    onChange,
    onCommit
}) => {
    const isLineHeight = type === 'lineHeight';

    // Convert to display value
    const displayValue = isLineHeight
        ? Math.round(value * 100) // 1.5 → 150%
        : Math.round(value * 100); // 0.05 → 5%

    const handleChange = (newDisplayValue: number) => {
        const actualValue = isLineHeight
            ? newDisplayValue / 100 // 150% → 1.5
            : newDisplayValue / 100; // 5% → 0.05
        onChange?.(actualValue);
    };

    const handleCommit = (newDisplayValue: number) => {
        const actualValue = isLineHeight
            ? Math.max(0.5, Math.min(5, newDisplayValue / 100)) // 50%-500%
            : Math.max(-50, Math.min(100, newDisplayValue / 100)); // -50%-100%
        onCommit(actualValue);
    };

    return (
        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 px-3 py-2 gap-2 hover:border-gray-300 focus-within:border-[#5500FF] focus-within:bg-white transition-colors">
            {/* Icon */}
            <span className="text-gray-400 text-sm font-medium select-none shrink-0">
                {isLineHeight ? (
                    // 행간: 가↕
                    <span className="flex items-center gap-0.5">
                        <span className="text-xs leading-none" style={{ textDecoration: 'overline underline', textDecorationColor: '#9CA3AF' }}>가</span>
                    </span>
                ) : (
                    // 자간: |가|
                    <span className="flex items-center">
                        <span className="text-gray-300">|</span>
                        <span className="text-xs">가</span>
                        <span className="text-gray-300">|</span>
                    </span>
                )}
            </span>

            {/* Input */}
            <input
                type="number"
                value={displayValue}
                onChange={(e) => handleChange(parseInt(e.target.value) || 0)}
                onBlur={(e) => handleCommit(parseInt(e.target.value) || (isLineHeight ? 150 : 0))}
                className="w-12 text-sm font-medium outline-none text-right bg-transparent"
            />

            {/* Unit */}
            <span className="text-xs text-gray-400">%</span>
        </div>
    );
};
