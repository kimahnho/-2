
import React, { useState, useEffect, useCallback } from 'react';
import { ScheduleItem, StudentProfile, StudentGroup } from '../../types';
import { storageService } from '../../services/storageService';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import { DAYS, HOURS, DayKey, addDays, formatIsoDate, getMonday, formatDateRange } from './scheduler/utils';
import { DayColumn } from './scheduler/DayColumn';
import { ScheduleFormModal } from './scheduler/modals/ScheduleFormModal';
import { DeleteConfirmationModal } from './scheduler/modals/DeleteConfirmationModal';

interface WeeklySchedulerProps {
    lastUpdate?: number;
    isGuest?: boolean;
    onRequireLogin?: () => void;
}

// --- Main Container: WeeklyScheduler ---
export const WeeklyScheduler: React.FC<WeeklySchedulerProps> = ({ lastUpdate = 0, isGuest, onRequireLogin }) => {
    // ... (existing state)
    const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [groups, setGroups] = useState<StudentGroup[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

    // Modals & State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null); // For Delete Confirmation

    const [formData, setFormData] = useState({
        targetType: 'student' as 'student' | 'group',
        targetId: '',
        subject: '',
        time: '10:00',
        isRecurring: true,
        day: 'Mon' as DayKey,
        specificDate: ''
    });

    const refreshData = useCallback(async () => {
        const [items, loadedStudents, loadedGroups] = await Promise.all([
            storageService.getAllScheduleItems(),
            storageService.getAllStudents(),
            storageService.getAllGroups()
        ]);
        setScheduleItems(items);
        setStudents(loadedStudents);
        setGroups(loadedGroups);
    }, []);

    useEffect(() => {
        refreshData();
        setFormData(prev => ({ ...prev, specificDate: new Date().toISOString().split('T')[0] }));
    }, [lastUpdate, refreshData]);

    const startOfWeek = getMonday(currentDate);

    const navigateWeek = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
    };

    const goToToday = () => setCurrentDate(new Date());

    const handleDeleteRequest = (id: string) => {
        if (isGuest) {
            onRequireLogin?.();
            return;
        }
        setItemToDelete(id); // Open delete modal
    };

    const handleConfirmDelete = async () => {
        if (itemToDelete) {
            await storageService.deleteScheduleItem(itemToDelete);
            await refreshData();
            setItemToDelete(null);
        }
    };

    const handleOpenAdd = (day?: DayKey, dateStr?: string, time?: string) => {
        if (isGuest) {
            onRequireLogin?.();
            return;
        }
        setEditingItem(null);
        setFormData({
            targetType: 'student',
            targetId: '',
            subject: '',
            time: time || '10:00',
            isRecurring: !dateStr,
            day: day || 'Mon',
            specificDate: dateStr || new Date().toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: ScheduleItem) => {
        if (isGuest) {
            onRequireLogin?.();
            return;
        }
        setEditingItem(item);
        let specificDate = new Date().toISOString().split('T')[0];
        let isRecurring = true;
        if (item.date) {
            specificDate = item.date;
            isRecurring = false;
        }
        setFormData({
            targetType: item.targetType,
            targetId: item.targetId || '',
            subject: item.subject,
            time: item.time,
            isRecurring,
            day: item.day,
            specificDate
        });
        setIsModalOpen(true);
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        if (isGuest) return; // Disable drag for guest
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
    };

    const handleDrop = async (day: DayKey, dateStr: string, time: string) => {
        if (!draggedItemId) return;

        const draggedItem = scheduleItems.find(i => i.id === draggedItemId);
        if (!draggedItem) return;

        let targetDate: string | undefined = undefined;
        if (draggedItem.date) {
            targetDate = dateStr;
        }

        const hasCollision = scheduleItems.some(item => {
            if (item.id === draggedItemId) return false;
            if (item.time !== time) return false;
            if (targetDate) return item.date === targetDate;
            if (!item.date && item.day === day) return true; // Recurring vs Recurring
            if (!item.date && item.day === day) return true; // Specific vs Recurring (basic block)
            if (item.date === dateStr) return true; // Recurring vs Specific (basic block)
            return false;
        });

        if (hasCollision) {
            alert("이미 해당 시간에 일정이 있습니다.");
            setDraggedItemId(null);
            return;
        }

        const updates: Partial<ScheduleItem> = { day: day, time: time };
        if (draggedItem.date) updates.date = dateStr;

        await storageService.updateScheduleItem(draggedItemId, updates);
        await refreshData();
        setDraggedItemId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let finalDate: string | undefined = undefined;
        let finalDay = formData.day;

        if (!formData.isRecurring) {
            finalDate = formData.specificDate;
            const d = new Date(formData.specificDate);
            const dayIndex = d.getDay();
            if (dayIndex >= 0 && dayIndex <= 6) {
                const dayMap: { [key: number]: DayKey } = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 0: 'Sun' };
                if (dayMap[dayIndex]) finalDay = dayMap[dayIndex];
            }
        }

        const hasCollision = scheduleItems.some(item => {
            if (editingItem && item.id === editingItem.id) return false;
            if (item.time !== formData.time) return false;
            if (finalDate) return item.date === finalDate;
            if (!item.date && item.day === finalDay) return true;
            return false;
        });

        if (hasCollision) {
            alert("해당 시간에 이미 일정이 있습니다.");
            return;
        }

        const payload = {
            day: finalDay,
            date: finalDate,
            time: formData.time,
            subject: formData.subject,
            targetId: formData.targetId,
            targetType: formData.targetType
        };

        if (editingItem) {
            await storageService.updateScheduleItem(editingItem.id, payload);
        } else {
            await storageService.addScheduleItem(payload);
        }

        await refreshData();
        setIsModalOpen(false);
    };

    return (
        <div className="w-full pt-8 pb-20 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F3E8FF] rounded-2xl flex items-center justify-center text-[#5500FF] shadow-sm transform rotate-3 hover:rotate-0 transition-all">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">주간 수업 계획표</h2>
                        <p className="text-sm text-gray-500 mt-0.5 font-medium">{formatDateRange(startOfWeek)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm h-10 overflow-hidden">
                        <button onClick={() => navigateWeek('prev')} className="w-9 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 border-r border-gray-100 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={goToToday} className="px-4 h-full flex items-center justify-center text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            오늘
                        </button>
                        <button onClick={() => navigateWeek('next')} className="w-9 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 border-l border-gray-100 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={() => handleOpenAdd()}
                        className="flex items-center gap-2 text-sm font-bold text-white bg-[#5500FF] hover:bg-[#4400cc] px-5 h-10 rounded-xl transition-all shadow-md shadow-[#5500FF]/20"
                    >
                        <Plus className="w-4 h-4" /> 일정 등록
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex select-none relative">
                <div className="flex-none w-16 bg-gray-50">
                    {/* Explicit Header Cell matching DayColumn header height/style */}
                    <div className="h-10 border-b border-gray-200 bg-gray-50 sticky top-0 z-30"></div>

                    {HOURS.map(hour => {
                        return (
                            <div key={hour} className="h-16 flex items-start justify-center pt-1.5 text-[11px] font-bold text-gray-500 font-mono">
                                {hour}:00
                            </div>
                        );
                    })}
                </div>

                <div className="flex-1 flex overflow-x-auto">
                    {DAYS.map((day, i) => {
                        const colDate = addDays(startOfWeek, i);
                        const isToday = formatIsoDate(colDate) === formatIsoDate(new Date());
                        const colDateStr = formatIsoDate(colDate);

                        const dayItems = scheduleItems.filter(item => {
                            if (item.date) return item.date === colDateStr;
                            return item.day === day;
                        });

                        return (
                            <DayColumn
                                key={day}
                                day={day}
                                date={colDate}
                                isToday={isToday}
                                dayItems={dayItems}
                                students={students}
                                groups={groups}
                                onEdit={handleOpenEdit}
                                onDeleteRequest={handleDeleteRequest}
                                onAdd={handleOpenAdd}
                                onDragStart={handleDragStart}
                                onDrop={handleDrop}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Modals */}
            <ScheduleFormModal
                isOpen={isModalOpen}
                editingItem={editingItem}
                formData={formData}
                setFormData={setFormData}
                students={students}
                groups={groups}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
            />

            <DeleteConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};
