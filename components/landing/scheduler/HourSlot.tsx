
import React, { useState } from 'react';
import { ScheduleItem, StudentProfile, StudentGroup } from '../../../types';
import { Plus } from 'lucide-react';
import { ScheduleCard } from './ScheduleCard';

interface HourSlotProps {
    hour: string; // "09", "10" etc
    hourItems: ScheduleItem[]; // Items belonging to this hour (00 and 30)
    students: StudentProfile[];
    groups: StudentGroup[];
    isPast: boolean;
    isToday: boolean;
    onEdit: (item: ScheduleItem) => void;
    onDeleteRequest: (id: string) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDrop: (time: string) => void;
    onAdd: (time: string) => void;
}

export const HourSlot: React.FC<HourSlotProps> = ({ 
    hour, hourItems, students, groups, isPast, isToday, 
    onEdit, onDeleteRequest, onDragStart, onDrop, onAdd 
}) => {
    // 3시간 단위 구분선 (9시 기준)
    const isMajorBorder = parseInt(hour) % 3 === 0;

    // Split items into :00 and :30
    const itemTop = hourItems.find(i => i.time.endsWith(':00'));
    const itemBottom = hourItems.find(i => i.time.endsWith(':30'));

    const renderHalfSlot = (isBottom: boolean) => {
        const time = `${hour}:${isBottom ? '30' : '00'}`;
        const item = isBottom ? itemBottom : itemTop;

        const [isDragOver, setIsDragOver] = useState(false);

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            if (!item) setIsDragOver(true);
        };

        const handleDragLeave = () => setIsDragOver(false);

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            if (!item) onDrop(time);
        };

        // Resolve Target Logic
        let target: StudentProfile | StudentGroup | undefined = undefined;
        let displayName = '미지정';
        let color = '#94a3b8'; // Default Gray

        if (item?.targetId) {
            // Apply Fixed Colors based on Type immediately
            if (item.targetType === 'student') {
                color = '#22c55e'; // Green
                target = students.find(s => s.id === item.targetId);
                if (target) {
                    displayName = target.name;
                }
            } else {
                color = '#f97316'; // Orange
                target = groups.find(g => g.id === item.targetId);
                if (target) {
                    const group = target as StudentGroup;
                    const memberNames = group.studentIds
                        .map(sid => students.find(s => s.id === sid)?.name)
                        .filter(Boolean);
                    
                    if (memberNames.length > 0) {
                        displayName = memberNames.join(', ');
                    } else {
                        displayName = group.name;
                    }
                }
            }
        }

        return (
            <div 
                className={`
                    h-8 w-full relative transition-all group/half
                    ${isDragOver ? 'bg-[#5500FF]/10' : ''}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!item) onAdd(time);
                }}
            >
                {/* Hover Plus Icon for Empty Slot */}
                {!item && !isDragOver && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/half:opacity-100 transition-opacity pointer-events-none">
                        <Plus className="w-3 h-3 text-gray-300" />
                    </div>
                )}
                
                {/* Item Render */}
                {item && (
                    <ScheduleCard 
                        item={item}
                        targetName={displayName}
                        color={color}
                        isPast={isPast}
                        isToday={isToday}
                        onEdit={onEdit}
                        onDeleteRequest={onDeleteRequest}
                        onDragStart={onDragStart}
                    />
                )}
            </div>
        );
    };

    return (
        <div 
            className={`
                flex flex-col w-full border-r last:border-r-0 border-gray-200
                ${isMajorBorder ? 'border-t-2 border-t-gray-300' : 'border-t border-t-gray-200 border-dashed'}
            `}
        >
            {renderHalfSlot(false)} {/* 00분 */}
            {renderHalfSlot(true)}  {/* 30분 */}
        </div>
    );
};
