import React, { useEffect, useRef } from 'react';
import { Copy, Scissors, Clipboard, Trash2, X } from 'lucide-react';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onCopy: () => void;
    onCut: () => void;
    onPaste: () => void;
    onDelete: () => void;
    hasSelection: boolean;
    canPaste: boolean;
    onGroup: () => void;
    onUngroup: () => void;
    canGroup: boolean;
    canUngroup: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
    x,
    y,
    onClose,
    onCopy,
    onCut,
    onPaste,
    onDelete,
    hasSelection,
    canPaste,
    onGroup,
    onUngroup,
    canGroup,
    canUngroup
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleScroll = () => {
            onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('scroll', handleScroll, true); // Close on scroll
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, [onClose]);

    // Calculate position to keep within viewport
    // Handle edge detection (if x + width > viewport, show left)
    // For now assuming standard positioning
    const style: React.CSSProperties = {
        top: y,
        left: x,
        position: 'fixed',
        zIndex: 9999,
    };

    return (
        <div
            ref={menuRef}
            style={style}
            className="bg-white rounded-lg shadow-xl border border-gray-100 py-1 min-w-[180px] animate-in fade-in zoom-in-95 duration-100"
            onContextMenu={(e) => e.preventDefault()} // Prevent native menu on custom menu
        >
            <div className="px-1 space-y-0.5">
                <button
                    onClick={onCopy}
                    disabled={!hasSelection}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <span className="flex items-center gap-2">
                        <Copy className="w-4 h-4 text-gray-500 group-hover:text-[#5500FF]" />
                        복사하기
                    </span>
                    <span className="text-xs text-gray-400">Ctrl+C</span>
                </button>
                <button
                    onClick={onCut}
                    disabled={!hasSelection}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <span className="flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-gray-500 group-hover:text-[#5500FF]" />
                        잘라내기
                    </span>
                    <span className="text-xs text-gray-400">Ctrl+X</span>
                </button>
                <button
                    onClick={onPaste}
                    disabled={!canPaste}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <span className="flex items-center gap-2">
                        <Clipboard className="w-4 h-4 text-gray-500 group-hover:text-[#5500FF]" />
                        붙여넣기
                    </span>
                    <span className="text-xs text-gray-400">Ctrl+V</span>
                </button>

                <div className="h-px bg-gray-100 my-1 mx-2" />

                {/* Grouping Actions */}
                {(canGroup || canUngroup) && (
                    <>
                        {canGroup && (
                            <button
                                onClick={onGroup}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-between group"
                            >
                                <span className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-500 group-hover:text-[#5500FF]">
                                        <rect width="7" height="7" x="3" y="3" rx="1" />
                                        <rect width="7" height="7" x="14" y="3" rx="1" />
                                        <rect width="7" height="7" x="14" y="14" rx="1" />
                                        <rect width="7" height="7" x="3" y="14" rx="1" />
                                    </svg>
                                    그룹으로 묶기
                                </span>
                                <span className="text-xs text-gray-400">Ctrl+G</span>
                            </button>
                        )}
                        {canUngroup && (
                            <button
                                onClick={onUngroup}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-between group"
                            >
                                <span className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-500 group-hover:text-[#5500FF]">
                                        <path d="M7 7h.01" />
                                        <path d="M7 17h.01" />
                                        <path d="M17 7h.01" />
                                        <path d="M17 17h.01" />
                                        <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 4" />
                                    </svg>
                                    그룹 해제
                                </span>
                                <span className="text-xs text-gray-400">⇧+Ctrl+G</span>
                            </button>
                        )}
                        <div className="h-px bg-gray-100 my-1 mx-2" />
                    </>
                )}


                <button
                    onClick={onDelete}
                    disabled={!hasSelection}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <span className="flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-red-500" />
                        삭제하기
                    </span>
                    <span className="text-xs text-red-300">Del</span>
                </button>
            </div>
        </div>
    );
};
