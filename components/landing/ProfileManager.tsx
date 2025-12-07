
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StudentProfile, StudentGroup } from '../../types';
import { storageService } from '../../services/storageService';
import { User, Plus, ArrowRight, Users, Check } from 'lucide-react';
import { DeleteConfirmationModal } from './scheduler/modals/DeleteConfirmationModal';

interface Props {
    onSelectStudent: (student: StudentProfile) => void;
    onSelectGroup: (group: StudentGroup) => void;
    onDataChange?: () => void;
    isGuest?: boolean; // Added
    onRequireLogin?: () => void; // Added
}

export const ProfileManager: React.FC<Props> = ({ onSelectStudent, onSelectGroup, onDataChange, isGuest, onRequireLogin }) => {
    const [activeTab, setActiveTab] = useState<'students' | 'groups'>('students');
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [groups, setGroups] = useState<StudentGroup[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    // ... (existing state)
    // Delete State
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'student' | 'group', id: string } | null>(null);
    const timerRef = useRef<any>(null);
    const isLongPress = useRef(false);

    // New Student Form
    const [newName, setNewName] = useState('');
    const [newBirthYear, setNewBirthYear] = useState('');
    const [newNotes, setNewNotes] = useState('');

    // New Group Form
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

    const loadData = useCallback(async () => {
        const [loadedStudents, loadedGroups] = await Promise.all([
            storageService.getAllStudents(),
            storageService.getAllGroups()
        ]);
        setStudents(loadedStudents);
        setGroups(loadedGroups);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const calculateAge = (birthYear?: number) => {
        if (!birthYear) return null;
        const currentYear = new Date().getFullYear();
        return currentYear - birthYear;
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        await storageService.createStudent(newName, newBirthYear, newNotes);
        await loadData();
        setIsAdding(false);
        resetForms();
        if (onDataChange) onDataChange();
    };

    const handleAddGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim() || selectedStudentIds.length === 0) return;

        await storageService.createGroup(newGroupName, selectedStudentIds, newGroupDesc);
        await loadData();
        setIsAdding(false);
        resetForms();
        if (onDataChange) onDataChange();
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        if (deleteTarget.type === 'student') {
            await storageService.deleteStudent(deleteTarget.id);
        } else {
            await storageService.deleteGroup(deleteTarget.id);
        }

        await loadData();
        if (onDataChange) onDataChange();
        setDeleteTarget(null);
    };

    const toggleStudentSelection = (id: string) => {
        setSelectedStudentIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const resetForms = () => {
        setNewName(''); setNewBirthYear(''); setNewNotes('');
        setNewGroupName(''); setNewGroupDesc(''); setSelectedStudentIds([]);
    };

    // Long Press Handlers
    const startPress = (type: 'student' | 'group', id: string) => {
        if (isGuest) return; // Disable delete for guest
        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            if (navigator.vibrate) navigator.vibrate(50);
            setDeleteTarget({ type, id });
        }, 700);
    };

    const cancelPress = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleCardClick = (type: 'student' | 'group', data: any) => {
        if (isGuest) {
            onRequireLogin?.();
            return;
        }
        if (isLongPress.current) {
            isLongPress.current = false;
            return;
        }
        if (type === 'student') onSelectStudent(data);
        else onSelectGroup(data);
    };

    const handleAddClick = () => {
        if (isGuest) {
            onRequireLogin?.();
            return;
        }
        setIsAdding(true);
    };

    return (
        <div className="w-full space-y-8 mb-12">
            {/* Tabs */}
            <div className="flex justify-center mb-6">
                <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex gap-1">
                    <button
                        onClick={() => { setActiveTab('students'); setIsAdding(false); }}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'students' ? 'bg-[#5500FF] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <User className="w-4 h-4" /> 개별 학습자
                    </button>
                    <button
                        onClick={() => { setActiveTab('groups'); setIsAdding(false); }}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'groups' ? 'bg-[#5500FF] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Users className="w-4 h-4" /> 그룹 수업
                    </button>
                </div>
            </div>

            {/* --- STUDENTS VIEW --- */}
            {activeTab === 'students' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-300">
                    {/* Add New Profile Card */}
                    {isAdding ? (
                        <form onSubmit={handleAddStudent} className="bg-white rounded-2xl p-6 border-2 border-[#5500FF] shadow-xl flex flex-col gap-4 col-span-1 min-h-[240px]">
                            <h3 className="font-bold text-gray-800">새 학습자 등록</h3>
                            <div className="space-y-3 flex-1">
                                <input
                                    value={newName} onChange={e => setNewName(e.target.value)}
                                    placeholder="이름 (필수)" autoFocus
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#5500FF] outline-none"
                                />
                                <input
                                    type="number"
                                    value={newBirthYear} onChange={e => setNewBirthYear(e.target.value)}
                                    placeholder="태어난 연도 (예: 2015)"
                                    min="1900" max={new Date().getFullYear()}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#5500FF] outline-none"
                                />
                                <textarea
                                    value={newNotes} onChange={e => setNewNotes(e.target.value)}
                                    placeholder="특이사항/학습목표"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#5500FF] outline-none h-20 resize-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium">취소</button>
                                <button type="submit" disabled={!newName} className="flex-1 py-2 bg-[#5500FF] text-white rounded-lg text-sm font-bold hover:bg-[#4400cc] disabled:bg-gray-300">등록</button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={handleAddClick}
                            className="bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#5500FF] hover:bg-[#5500FF]/5 flex flex-col items-center justify-center gap-4 h-[240px] transition-all group"
                        >
                            <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-gray-400 group-hover:text-[#5500FF] group-hover:shadow-md transition-all">
                                <Plus className="w-8 h-8" />
                            </div>
                            <span className="font-bold text-gray-500 group-hover:text-[#5500FF]">새 학습자 추가</span>
                        </button>
                    )}

                    {/* Existing Students */}
                    {students.map(student => {
                        const age = calculateAge(student.birthYear);
                        return (
                            <div
                                key={student.id}
                                onMouseDown={() => startPress('student', student.id)}
                                onMouseUp={cancelPress}
                                onMouseLeave={cancelPress}
                                onTouchStart={() => startPress('student', student.id)}
                                onTouchEnd={cancelPress}
                                onTouchMove={cancelPress}
                                onClick={() => handleCardClick('student', student)}
                                className="group relative bg-white rounded-2xl border border-gray-200 hover:border-[#B0C0ff] hover:shadow-xl transition-all cursor-pointer h-[240px] p-6 flex flex-col items-center text-center overflow-hidden select-none active:scale-95"
                                title="꾹 눌러서 삭제"
                            >
                                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none z-0" />

                                <div
                                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md mb-4 z-10 transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: student.avatarColor || '#5500FF' }}
                                >
                                    {student.name[0]}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-1">{student.name}</h3>
                                {age !== null ? (
                                    <p className="text-sm text-gray-500 mb-3">만 {age}세 ({student.birthYear})</p>
                                ) : (
                                    <p className="text-sm text-gray-500 mb-3">-</p>
                                )}

                                <p className="text-xs text-gray-400 line-clamp-2 px-4">
                                    {student.notes || "특이사항 없음"}
                                </p>

                                <div className="mt-auto flex items-center gap-2 text-[#5500FF] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    수업 준비하기 <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* --- GROUPS VIEW --- */}
            {activeTab === 'groups' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-300">
                    {/* Add New Group Card */}
                    {isAdding ? (
                        <form onSubmit={handleAddGroup} className="bg-white rounded-2xl p-6 border-2 border-[#5500FF] shadow-xl flex flex-col gap-4 col-span-1 min-h-[400px]">
                            <h3 className="font-bold text-gray-800">새 그룹 생성</h3>
                            <div className="space-y-3 flex-1 flex flex-col min-h-0">
                                <input
                                    value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
                                    placeholder="그룹 이름 (예: 사회성 A반)" autoFocus
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#5500FF] outline-none"
                                />
                                <input
                                    value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)}
                                    placeholder="설명 (선택)"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#5500FF] outline-none"
                                />

                                {/* Multi-Select Students (Enhanced List for Web/Responsive) */}
                                <div className="mt-2 flex-1 flex flex-col min-h-0">
                                    <label className="text-xs font-bold text-gray-500 mb-2 block">
                                        멤버 선택 <span className="text-[#5500FF]">({selectedStudentIds.length}명)</span>
                                    </label>
                                    {students.length === 0 ? (
                                        <p className="text-xs text-red-400">등록된 학습자가 없습니다. 먼저 개별 학습자를 등록해주세요.</p>
                                    ) : (
                                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 border border-gray-100 rounded-xl bg-gray-50/50 p-2 space-y-2 max-h-[220px]">
                                            {students.map(s => {
                                                const isSelected = selectedStudentIds.includes(s.id);
                                                const age = calculateAge(s.birthYear);
                                                return (
                                                    <div
                                                        key={s.id}
                                                        onClick={() => toggleStudentSelection(s.id)}
                                                        className={`cursor-pointer p-3 rounded-xl border transition-all flex items-start gap-3 ${isSelected
                                                            ? 'bg-[#5500FF]/5 border-[#5500FF] ring-1 ring-[#5500FF]'
                                                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {/* Avatar */}
                                                        <div
                                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 mt-0.5"
                                                            style={{ backgroundColor: s.avatarColor || '#5500FF' }}
                                                        >
                                                            {s.name[0]}
                                                        </div>

                                                        {/* Info - Improved Layout for readability */}
                                                        <div className="flex-1 min-w-0 flex flex-col">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-bold text-base text-gray-900 truncate">{s.name}</span>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                {age !== null && (
                                                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                                                                        만 {age}세
                                                                    </span>
                                                                )}
                                                                <span className="text-xs text-gray-400 truncate flex-1">
                                                                    {s.notes || "특이사항 없음"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Checkbox */}
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 mt-2 ${isSelected ? 'bg-[#5500FF] border-[#5500FF]' : 'border-gray-300 bg-white'
                                                            }`}>
                                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium">취소</button>
                                <button type="submit" disabled={!newGroupName || selectedStudentIds.length === 0} className="flex-1 py-2 bg-[#5500FF] text-white rounded-lg text-sm font-bold hover:bg-[#4400cc] disabled:bg-gray-300">그룹 생성</button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={handleAddClick}
                            className="bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#5500FF] hover:bg-[#5500FF]/5 flex flex-col items-center justify-center gap-4 h-[240px] transition-all group"
                        >
                            <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-gray-400 group-hover:text-[#5500FF] group-hover:shadow-md transition-all">
                                <Users className="w-8 h-8" />
                            </div>
                            <span className="font-bold text-gray-500 group-hover:text-[#5500FF]">새 그룹 만들기</span>
                        </button>
                    )}

                    {/* Existing Groups */}
                    {groups.map(group => (
                        <div
                            key={group.id}
                            onMouseDown={() => startPress('group', group.id)}
                            onMouseUp={cancelPress}
                            onMouseLeave={cancelPress}
                            onTouchStart={() => startPress('group', group.id)}
                            onTouchEnd={cancelPress}
                            onTouchMove={cancelPress}
                            onClick={() => handleCardClick('group', group)}
                            className="group relative bg-white rounded-2xl border border-gray-200 hover:border-[#B0C0ff] hover:shadow-xl transition-all cursor-pointer h-[240px] p-6 flex flex-col items-center text-center overflow-hidden select-none active:scale-95"
                            title="꾹 눌러서 삭제"
                        >
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none z-0" />

                            <div
                                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md mb-4 z-10 transition-transform group-hover:scale-110"
                                style={{ backgroundColor: group.color || '#5500FF' }}
                            >
                                <Users className="w-8 h-8" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1">{group.name}</h3>
                            <p className="text-sm text-gray-500 mb-3 bg-gray-100 px-2 py-0.5 rounded-full inline-block">멤버 {group.studentIds.length}명</p>

                            <p className="text-xs text-gray-400 line-clamp-2 px-4">
                                {group.description || "설명 없음"}
                            </p>

                            <div className="mt-auto flex items-center gap-2 text-[#5500FF] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                그룹 수업 준비하기 <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title={deleteTarget?.type === 'student' ? "학습자를 삭제하시겠습니까?" : "그룹을 삭제하시겠습니까?"}
                description={deleteTarget?.type === 'student' ? "해당 학습자의 모든 학습 자료와 그룹에서도 제거됩니다." : "그룹의 학습 자료도 함께 삭제됩니다."}
            />
        </div>
    );
};
