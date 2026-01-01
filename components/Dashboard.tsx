
import React, { useState, useEffect, useCallback } from 'react';
import { SavedProjectMetadata, StudentProfile, StudentGroup } from '../types';
import { storageService } from '../services/storageService';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { ProjectList } from './dashboard/ProjectList';
import { ConfirmModal } from './common/ConfirmModal';
import { Grid, List, Users } from 'lucide-react';

interface Props {
    currentStudent: StudentProfile | null;
    currentGroup: StudentGroup | null;
    onOpenProject: (id: string) => void;
    onNewProject: () => void;
    onSwitchProfile: () => void;
    onSelectStudent: (student: StudentProfile) => void;
    onSelectGroup: (group: StudentGroup) => void;
}

export const Dashboard: React.FC<Props> = ({
    currentStudent,
    currentGroup,
    onOpenProject,
    onNewProject,
    onSwitchProfile,
    onSelectStudent,
    onSelectGroup
}) => {
    const [projects, setProjects] = useState<SavedProjectMetadata[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // General Mode Lists
    const [allStudents, setAllStudents] = useState<StudentProfile[]>([]);
    const [allGroups, setAllGroups] = useState<StudentGroup[]>([]);

    const isGeneralMode = !currentStudent && !currentGroup;

    // Helper to get display info
    const displayName = currentStudent ? currentStudent.name : (currentGroup ? currentGroup.name : '내 보관함');

    const loadProjects = useCallback(async () => {
        const allProjects = await storageService.getAllProjects();
        let filtered: SavedProjectMetadata[] = [];

        if (currentStudent) {
            filtered = allProjects.filter(p => p.studentId === currentStudent.id);
        } else if (currentGroup) {
            filtered = allProjects.filter(p => p.groupId === currentGroup.id);
        } else {
            // General Mode (Quick Start Projects - No Owner)
            filtered = allProjects.filter(p => !p.studentId && !p.groupId);
        }
        setProjects(filtered);
    }, [currentStudent, currentGroup]);

    const loadGeneralData = useCallback(async () => {
        if (isGeneralMode) {
            const [students, groups] = await Promise.all([
                storageService.getAllStudents(),
                storageService.getAllGroups()
            ]);
            setAllStudents(students);
            setAllGroups(groups);
        }
    }, [isGeneralMode]);

    useEffect(() => {
        loadProjects();
        loadGeneralData();
    }, [loadProjects, loadGeneralData]);

    // Reset search when profile changes
    useEffect(() => {
        setSearchQuery('');
    }, [currentStudent?.id, currentGroup?.id]);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const handleDeleteProject = async (id: string) => {
        setDeleteTarget(id);
    };

    const confirmDelete = async () => {
        if (deleteTarget) {
            await storageService.deleteProject(deleteTarget);
            setProjects(prev => prev.filter(p => p.id !== deleteTarget));
            setDeleteTarget(null);
        }
    };

    const handleDuplicateProject = async (id: string) => {
        try {
            await storageService.duplicateProject(id);
            await loadProjects();
        } catch (error) {
            console.error("Failed to duplicate project", error);
            alert("프로젝트 복제에 실패했습니다.");
        }
    };

    const handleProfileSelect = (type: 'student' | 'group', data: StudentProfile | StudentGroup) => {
        setSearchQuery(''); // Clear search immediately
        if (type === 'student') {
            onSelectStudent(data as StudentProfile);
        } else if (type === 'group') {
            onSelectGroup(data as StudentGroup);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <DashboardHeader
                currentStudent={currentStudent}
                currentGroup={currentGroup}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onNewProject={onNewProject}
                onSwitchProfile={onSwitchProfile}
            />

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">

                {/* Registered Profiles Section (Only in General Mode) */}
                {isGeneralMode && (
                    <div className="mb-12 space-y-6 animate-in fade-in duration-500">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                등록된 학습자 및 그룹
                            </h2>

                            {allStudents.length === 0 && allGroups.length === 0 ? (
                                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                                    등록된 프로필이 없습니다. 랜딩 페이지에서 학습자나 그룹을 추가해보세요.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {/* Students */}
                                    {allStudents.map(student => (
                                        <button
                                            type="button"
                                            key={student.id}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleProfileSelect('student', student);
                                            }}
                                            className="relative z-10 bg-white p-4 rounded-xl border border-gray-200 hover:border-[#5500FF] hover:shadow-md transition-all flex flex-col items-center gap-3 group h-[140px] justify-center cursor-pointer"
                                        >
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-110 transition-transform pointer-events-none"
                                                style={{ backgroundColor: student.avatarColor || '#5500FF' }}
                                            >
                                                {student.name[0]}
                                            </div>
                                            <div className="text-center w-full pointer-events-none">
                                                <span className="font-bold text-gray-700 text-sm truncate block">{student.name}</span>
                                                <span className="text-[10px] text-gray-400 block mt-1">개별 학습자</span>
                                            </div>
                                        </button>
                                    ))}

                                    {/* Groups */}
                                    {allGroups.map(group => (
                                        <button
                                            type="button"
                                            key={group.id}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleProfileSelect('group', group);
                                            }}
                                            className="relative z-10 bg-white p-4 rounded-xl border border-gray-200 hover:border-[#5500FF] hover:shadow-md transition-all flex flex-col items-center gap-3 group h-[140px] justify-center cursor-pointer"
                                        >
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-110 transition-transform pointer-events-none"
                                                style={{ backgroundColor: group.color || '#f97316' }}
                                            >
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <div className="text-center w-full pointer-events-none">
                                                <span className="font-bold text-gray-700 text-sm truncate block">{group.name}</span>
                                                <span className="text-[10px] text-gray-400 block mt-1">그룹 수업 ({group.studentIds.length}명)</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-200 pt-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                바로 만들기 자료 <span className="text-sm font-normal text-gray-400">(미지정)</span>
                            </h2>
                        </div>
                    </div>
                )}

                {/* Filters / Sort bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <select className="bg-transparent text-sm font-medium text-gray-600 outline-none cursor-pointer">
                            <option>전체 디자인</option>
                            <option>최근 수정순</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-200 rounded text-gray-500"><Grid className="w-5 h-5" /></button>
                        <button className="p-2 hover:bg-gray-200 rounded text-gray-500"><List className="w-5 h-5" /></button>
                    </div>
                </div>

                <ProjectList
                    projects={filteredProjects}
                    displayName={displayName}
                    searchQuery={searchQuery}
                    onOpenProject={onOpenProject}
                    onNewProject={onNewProject}
                    onDeleteProject={handleDeleteProject}
                    onDuplicateProject={handleDuplicateProject}
                />
            </main>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteTarget !== null}
                title="디자인 삭제"
                message={`정말 이 디자인을 삭제하시겠습니까?
삭제된 디자인은 복구할 수 없습니다.`}
                confirmText="삭제"
                cancelText="취소"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
                variant="danger"
            />
        </div>
    );
};
