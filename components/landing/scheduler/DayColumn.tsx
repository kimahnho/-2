
import React from 'react';
import { ScheduleItem, StudentProfile, StudentGroup } from '../../../types';
import { DayKey, DAY_LABELS, formatDateShort, formatIsoDate, HOURS } from './utils';
import { HourSlot } from './HourSlot';

interface DayColumnProps {
    day: DayKey;
    date: Date;
    isToday: boolean;
    dayItems: ScheduleItem[];
    students: StudentProfile[];
    groups: StudentGroup[];
    onEdit: (item: ScheduleItem) => void;
    onDeleteRequest: (id: string) => void;
    onAdd: (day: DayKey, dateStr: string, time?: string) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDrop: (day: DayKey, dateStr: string, time: string) => void;
}

export const DayColumn: React.FC<DayColumnProps> = ({
    day, date, isToday, dayItems, students, groups,
    onEdit, onDeleteRequest, onAdd, onDragStart, onDrop
}) => {
    const dateStr = formatIsoDate(date);
    const todayIso = formatIsoDate(new Date());
    const isPast = dateStr < todayIso;

    return (
        <div className={`flex-1 flex flex-col min-w-[120px] relative`}>
            {/* Column Header */}
            <div className={`
                h-10 flex items-center justify-center gap-2 border-b border-r last:border-r-0 border-gray-200 sticky top-0 z-20 
                ${isToday ? 'bg-[#5500FF] text-white' : 'bg-gray-50 text-gray-700'}
            `}>
                <span className="text-xs font-medium opacity-80">{DAY_LABELS[day]}</span>
                <span className="text-sm font-bold font-mono">{formatDateShort(date)}</span>
            </div>

            {/* Grid Body */}
            <div className="flex-1 bg-white">
                {HOURS.map(hour => {
                    // Filter items for this hour (e.g. 09:00 and 09:30)
                    const hourItems = dayItems.filter(i => i.time.startsWith(hour));
                    return (
                        <HourSlot
                            key={`${day}-${hour}`}
                            hour={hour}
                            hourItems={hourItems}
                            students={students}
                            groups={groups}
                            isPast={isPast}
                            isToday={isToday}
                            onEdit={onEdit}
                            onDeleteRequest={onDeleteRequest}
                            onDragStart={onDragStart}
                            onDrop={(droppedTime) => onDrop(day, dateStr, droppedTime)}
                            onAdd={(clickedTime) => onAdd(day, dateStr, clickedTime)}
                        />
                    );
                })}
            </div>
        </div>
    );
};
