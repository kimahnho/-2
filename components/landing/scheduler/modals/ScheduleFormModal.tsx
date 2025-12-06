
import React from 'react';
import { ScheduleItem, StudentProfile, StudentGroup } from '../../../../types';
import { Clock, Plus, X, User, Users, CalendarDays, Repeat, ChevronLeft } from 'lucide-react';
import { HOURS, DAYS, DAY_LABELS, DayKey } from '../utils';

interface ScheduleFormModalProps {
    isOpen: boolean;
    editingItem: ScheduleItem | null;
    formData: any;
    setFormData: (data: any) => void;
    students: StudentProfile[];
    groups: StudentGroup[];
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({ 
    isOpen, editingItem, formData, setFormData, students, groups, onClose, onSubmit 
}) => {
    if (!isOpen) return null;

    // Generate time options for select box (09:00 ~ 18:30)
    const timeOptions: string[] = [];
    HOURS.forEach(h => {
        timeOptions.push(`${h}:00`);
        timeOptions.push(`${h}:30`);
    });

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {editingItem ? <Clock className="w-5 h-5 text-[#5500FF]" /> : <Plus className="w-5 h-5 text-[#5500FF]" />}
                        {editingItem ? '일정 수정' : '새 일정 추가'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 block">수업 대상</label>
                        <div className="flex gap-2">
                            <button 
                                type="button" 
                                onClick={() => setFormData({ ...formData, targetType: 'student', targetId: '' })}
                                className={`flex-1 py-2.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-2 ${formData.targetType === 'student' ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e] shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <User className="w-3.5 h-3.5" /> 개별 학습자
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setFormData({ ...formData, targetType: 'group', targetId: '' })}
                                className={`flex-1 py-2.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-2 ${formData.targetType === 'group' ? 'border-[#f97316] bg-[#f97316]/10 text-[#f97316] shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Users className="w-3.5 h-3.5" /> 그룹 수업
                            </button>
                        </div>
                        <div className="relative">
                            <select 
                                value={formData.targetId} 
                                onChange={e => setFormData({ ...formData, targetId: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#5500FF] focus:bg-white transition-colors appearance-none"
                            >
                                <option value="">미지정 (일반 일정)</option>
                                {formData.targetType === 'student' 
                                    ? students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                                    : groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)
                                }
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronLeft className="w-4 h-4 -rotate-90" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                                <CalendarDays className="w-3.5 h-3.5" /> 날짜 및 시간
                            </label>
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}>
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.isRecurring ? 'bg-[#5500FF] border-[#5500FF]' : 'bg-white border-gray-300'}`}>
                                    {formData.isRecurring && <Repeat className="w-3 h-3 text-white" />}
                                </div>
                                <span className="text-xs text-gray-700 font-medium select-none">매주 반복</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {formData.isRecurring ? (
                                <div className="relative col-span-2">
                                    <select 
                                        value={formData.day} 
                                        onChange={e => setFormData({ ...formData, day: e.target.value as DayKey })}
                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#5500FF]"
                                    >
                                        {DAYS.map(d => <option key={d} value={d}>매주 {DAY_LABELS[d]}요일</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div className="col-span-2">
                                    <input 
                                        type="date"
                                        value={formData.specificDate}
                                        onChange={e => setFormData({ ...formData, specificDate: e.target.value })}
                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#5500FF]"
                                    />
                                </div>
                            )}

                            <div className="col-span-2">
                                <select 
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#5500FF] font-mono"
                                >
                                    {timeOptions.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                    {!timeOptions.includes(formData.time) && <option value={formData.time}>{formData.time}</option>}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 block">수업 내용</label>
                        <input 
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="예: 언어 치료, 사회성 훈련"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#5500FF] focus:bg-white transition-colors"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-bold transition-colors">취소</button>
                        <button type="submit" className="flex-1 py-3 bg-[#5500FF] text-white rounded-xl text-sm font-bold hover:bg-[#4400cc] shadow-lg shadow-[#5500FF]/20 transition-all">
                            {editingItem ? '수정 완료' : '일정 등록'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
