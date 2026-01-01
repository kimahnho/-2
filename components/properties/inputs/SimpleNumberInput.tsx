import React from 'react';

export interface SimpleNumberInputProps {
    value: number;
    min?: number;
    max?: number;
    step?: number | string;
    unit?: string;
    onChange?: (value: number) => void;
    onCommit: (value: number) => void;
}

/**
 * 단순한 숫자 입력 컴포넌트
 */
export const SimpleNumberInput: React.FC<SimpleNumberInputProps> = ({
    value,
    min = 0,
    max = 9999,
    step = 1,
    unit = '',
    onChange,
    onCommit
}) => (
    <div className="flex items-center gap-1">
        <button
            onClick={() => onCommit(Math.max(min, value - (typeof step === 'number' ? step : 1)))}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-gray-600 transition-colors"
        >
            -
        </button>
        <div className="flex items-center border border-gray-300 rounded bg-white px-2 py-1.5 focus-within:border-[#5500FF] transition-colors w-20">
            <input
                type="number"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) onChange?.(val);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.currentTarget.blur();
                    }
                }}
                onBlur={(e) => {
                    const rawVal = parseFloat(e.target.value) || min;
                    const clampedVal = Math.min(max, Math.max(min, rawVal));
                    onCommit(clampedVal);
                }}
                className="w-full text-sm font-medium outline-none text-center bg-transparent appearance-none"
            />
            {unit && <span className="text-xs text-gray-500 ml-1">{unit}</span>}
        </div>
        <button
            onClick={() => onCommit(Math.min(max, value + (typeof step === 'number' ? step : 1)))}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-gray-600 transition-colors"
        >
            +
        </button>
    </div>
);
