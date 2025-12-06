
import React, { useRef } from 'react';
import { ScheduleItem } from '../../../types';

interface ScheduleCardProps {
    item: ScheduleItem;
    targetName: string;
    color: string;
    isPast: boolean;
    isToday: boolean;
    onEdit: (item: ScheduleItem) => void;
    onDeleteRequest: (id: string) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ 
    item, targetName, color, isPast, isToday, 
    onEdit, onDeleteRequest, onDragStart 
}) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPress = useRef(false);

    // Long Press Handlers
    const startPress = () => {
        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
            onDeleteRequest(item.id);
        }, 700); // 700ms threshold for long press
    };

    const cancelPress = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // If it was a long press, don't trigger edit
        if (isLongPress.current) {
            isLongPress.current = false;
            return;
        }
        onEdit(item);
    };

    return (
        <div className="relative w-full h-full group/card select-none py-px px-0.5">
            <div
                draggable
                onDragStart={(e) => {
                    cancelPress(); // Cancel long press on drag
                    e.stopPropagation();
                    onDragStart(e, item.id);
                }}
                onMouseDown={startPress}
                onMouseUp={cancelPress}
                onMouseLeave={cancelPress}
                onTouchStart={startPress}
                onTouchEnd={cancelPress}
                onClick={handleClick}
                className={`
                    w-full h-full z-10
                    rounded shadow-sm
                    hover:shadow-md
                    transition-all cursor-grab active:cursor-grabbing
                    ${isPast && !isToday ? 'opacity-60 grayscale' : ''}
                    flex items-center gap-2 px-2 overflow-hidden
                    relative text-xs active:scale-95
                `}
                style={{ 
                    // Background tint (Increased to 20 hex ~ 12% for better visibility)
                    backgroundColor: `${color}20`, 
                    // Strong Left Border
                    borderLeft: `4px solid ${color}`,
                    // Subtle surrounding border
                    borderTop: `1px solid ${color}40`,
                    borderRight: `1px solid ${color}40`,
                    borderBottom: `1px solid ${color}40`,
                }}
                title={`${targetName} (꾹 눌러서 삭제)`}
            >
                <div 
                    className="flex-shrink-0 text-[10px] font-bold font-mono w-8"
                    style={{ color: color }}
                >
                    {item.time}
                </div>
                
                <div className="flex-1 min-w-0 flex items-center h-full">
                     {/* Text color matches the border color for stronger visual cue */}
                     <span className="font-bold truncate" style={{ color: color }}>
                        {targetName}
                     </span>
                </div>
            </div>
        </div>
    );
};
