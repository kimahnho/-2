/**
 * AdminPanel - 관리자 전용 자료 열람 패널
 * 모든 사용자의 프로젝트, 학습자, 그룹을 열람 (읽기 전용)
 * 다운로드 기능 지원
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, AdminResource } from '../../services/adminService';
import { Shield, Download, ArrowLeft, FileText, Calendar, Users, ChevronRight, Mail, User, BookOpen } from 'lucide-react';

interface UserInfo {
    userId: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    provider: string;
    projectCount: number;
}

interface StudentInfo {
    id: string;
    name: string;
    birthYear?: number;
    notes?: string;
    userId: string;
    createdAt: string;
}

interface GroupInfo {
    id: string;
    name: string;
    description?: string;
    memberCount?: number;
    userId: string;
    createdAt: string;
}

type MainTab = 'projects' | 'students' | 'groups';
type ViewMode = 'list' | 'detail';

export const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // 메인 탭
    const [mainTab, setMainTab] = useState<MainTab>('projects');
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    // 프로젝트 관련
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
    const [projects, setProjects] = useState<AdminResource[]>([]);
    const [selectedProject, setSelectedProject] = useState<AdminResource | null>(null);

    // 학습자/그룹 관련
    const [students, setStudents] = useState<StudentInfo[]>([]);
    const [groups, setGroups] = useState<GroupInfo[]>([]);

    // 관리자 권한 확인
    useEffect(() => {
        const checkAdmin = async () => {
            const admin = await adminService.isAdmin();
            setIsAdmin(admin);
            if (!admin) {
                navigate('/dashboard');
            }
            setLoading(false);
        };
        checkAdmin();
    }, [navigate]);

    // 탭 변경 시 데이터 로드
    useEffect(() => {
        if (!isAdmin) return;
        loadData();
    }, [isAdmin, mainTab]);

    const loadData = async () => {
        setViewMode('list');
        setSelectedUser(null);

        if (mainTab === 'projects') {
            const data = await adminService.getUsersWithProjects();
            setUsers(data.sort((a, b) => b.projectCount - a.projectCount));
        } else if (mainTab === 'students') {
            const data = await adminService.getAllStudents();
            setStudents(data);
        } else if (mainTab === 'groups') {
            const data = await adminService.getAllGroups();
            setGroups(data);
        }
    };

    const handleSelectUser = async (user: UserInfo) => {
        setSelectedUser(user);
        setViewMode('detail');
        const data = await adminService.getProjectsByUser(user.userId);
        setProjects(data);
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedUser(null);
        setProjects([]);
    };

    // 이미지 다운로드 (새 탭에서 열기 방식으로 변경 - CORS 우회)
    const handleDownloadThumbnail = (project: AdminResource) => {
        if (!project.thumbnail) {
            alert('미리보기 이미지가 없습니다.');
            return;
        }
        // 새 탭에서 이미지 열기 (사용자가 우클릭으로 저장 가능)
        window.open(project.thumbnail, '_blank');
    };

    const getProviderBadge = (provider: string) => {
        const colors: Record<string, string> = { 'kakao': 'bg-yellow-100 text-yellow-800', 'google': 'bg-blue-100 text-blue-800', 'email': 'bg-gray-100 text-gray-800' };
        const names: Record<string, string> = { 'kakao': '카카오', 'google': '구글', 'email': '이메일' };
        return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[provider] || 'bg-gray-100'}`}>{names[provider] || provider}</span>;
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5500FF]"></div></div>;
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {viewMode === 'detail' ? (
                            <button onClick={handleBackToList} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
                        ) : (
                            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
                        )}
                        <Shield className="w-6 h-6 text-[#5500FF]" />
                        <h1 className="text-xl font-bold text-gray-800">
                            {viewMode === 'list' ? '관리자 패널' : selectedUser?.displayName || '상세보기'}
                        </h1>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Main Tabs */}
                {viewMode === 'list' && (
                    <div className="flex gap-2 mb-6">
                        <button onClick={() => setMainTab('projects')} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${mainTab === 'projects' ? 'bg-[#5500FF] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                            <FileText className="w-4 h-4" /> 프로젝트
                        </button>
                        <button onClick={() => setMainTab('students')} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${mainTab === 'students' ? 'bg-[#5500FF] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                            <User className="w-4 h-4" /> 개별학습자
                        </button>
                        <button onClick={() => setMainTab('groups')} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${mainTab === 'groups' ? 'bg-[#5500FF] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                            <BookOpen className="w-4 h-4" /> 그룹수업
                        </button>
                    </div>
                )}

                {/* Projects Tab - User List */}
                {mainTab === 'projects' && viewMode === 'list' && (
                    <>
                        {users.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center text-gray-500"><Users className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>등록된 유저가 없습니다.</p></div>
                        ) : (
                            <div className="space-y-3">
                                {users.map((user) => (
                                    <div key={user.userId} onClick={() => handleSelectUser(user)} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.displayName} className="w-12 h-12 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gradient-to-br from-[#5500FF] to-[#8855FF] rounded-full flex items-center justify-center text-white font-bold">{user.displayName.slice(0, 2).toUpperCase()}</div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-800">{user.displayName}</p>
                                                    {getProviderBadge(user.provider)}
                                                </div>
                                                <p className="text-sm text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{user.email || '이메일 없음'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right"><p className="text-lg font-bold text-[#5500FF]">{user.projectCount}</p><p className="text-xs text-gray-500">프로젝트</p></div>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Projects Tab - User's Projects */}
                {mainTab === 'projects' && viewMode === 'detail' && (
                    <>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-700 flex items-center gap-2"><Shield className="w-4 h-4" />읽기 전용 모드입니다.</div>
                        {projects.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center text-gray-500"><FileText className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>저장된 프로젝트가 없습니다.</p></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {projects.map((project) => (
                                    <div key={project.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="aspect-video bg-gray-100 relative cursor-pointer" onClick={() => setSelectedProject(project)}>
                                            {project.thumbnail ? <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><FileText className="w-8 h-8" /></div>}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-800 mb-2 truncate">{project.title}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3"><Calendar className="w-3 h-3" />{new Date(project.submittedAt).toLocaleDateString('ko-KR')}</div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleDownloadThumbnail(project)} className="flex-1 py-2 text-xs bg-[#5500FF] hover:bg-[#4400DD] text-white rounded-lg flex items-center justify-center gap-1" disabled={!project.thumbnail}><Download className="w-3 h-3" />다운로드</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Students Tab */}
                {mainTab === 'students' && (
                    <>
                        <div className="mb-4 text-sm text-gray-500">총 {students.length}명의 학습자</div>
                        {students.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center text-gray-500"><User className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>등록된 학습자가 없습니다.</p></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {students.map((student) => (
                                    <div key={student.id} className="bg-white rounded-xl p-4 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">{student.name.slice(0, 1)}</div>
                                            <div>
                                                <p className="font-medium text-gray-800">{student.name}</p>
                                                {student.birthYear && <p className="text-xs text-gray-500">{student.birthYear}년생</p>}
                                            </div>
                                        </div>
                                        {student.notes && <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{student.notes}</p>}
                                        <p className="text-xs text-gray-400 mt-2">{new Date(student.createdAt).toLocaleDateString('ko-KR')} 등록</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Groups Tab */}
                {mainTab === 'groups' && (
                    <>
                        <div className="mb-4 text-sm text-gray-500">총 {groups.length}개의 그룹</div>
                        {groups.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center text-gray-500"><BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>등록된 그룹이 없습니다.</p></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {groups.map((group) => (
                                    <div key={group.id} className="bg-white rounded-xl p-4 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">{group.name.slice(0, 1)}</div>
                                            <div>
                                                <p className="font-medium text-gray-800">{group.name}</p>
                                                {group.memberCount !== undefined && <p className="text-xs text-gray-500">{group.memberCount}명</p>}
                                            </div>
                                        </div>
                                        {group.description && <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{group.description}</p>}
                                        <p className="text-xs text-gray-400 mt-2">{new Date(group.createdAt).toLocaleDateString('ko-KR')} 등록</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Project Preview Modal */}
            {selectedProject && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold">{selectedProject.title}</h2>
                                    <p className="text-sm text-gray-500">{new Date(selectedProject.submittedAt).toLocaleString('ko-KR')}</p>
                                </div>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">읽기 전용</span>
                            </div>
                            {selectedProject.thumbnail ? <img src={selectedProject.thumbnail} alt="Preview" className="w-full rounded-lg mb-4 border" /> : <div className="w-full aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400"><FileText className="w-16 h-16" /></div>}
                            <div className="flex gap-3">
                                <button onClick={() => handleDownloadThumbnail(selectedProject)} className="flex-1 py-3 bg-[#5500FF] hover:bg-[#4400DD] text-white rounded-lg font-medium flex items-center justify-center gap-2" disabled={!selectedProject.thumbnail}><Download className="w-5 h-5" />이미지 다운로드</button>
                            </div>
                            <button onClick={() => setSelectedProject(null)} className="w-full mt-3 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium">닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
