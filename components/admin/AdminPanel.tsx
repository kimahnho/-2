/**
 * AdminPanel - 관리자 전용 자료 열람 패널
 * 모든 사용자의 프로젝트를 유저별로 구분하여 열람 (읽기 전용)
 * 다운로드 기능 지원
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, AdminResource } from '../../services/adminService';
import { Shield, Download, ArrowLeft, FileText, Calendar, Users, ChevronRight, Mail } from 'lucide-react';

interface UserInfo {
    userId: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    provider: string;
    projectCount: number;
}

type ViewMode = 'users' | 'projects';

export const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('users');

    // 유저 목록
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);

    // 선택된 유저의 프로젝트
    const [projects, setProjects] = useState<AdminResource[]>([]);

    // 선택된 프로젝트 (미리보기용)
    const [selectedProject, setSelectedProject] = useState<AdminResource | null>(null);
    const [downloading, setDownloading] = useState(false);

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

    // 유저 목록 로드
    useEffect(() => {
        if (!isAdmin) return;
        loadUsers();
    }, [isAdmin]);

    const loadUsers = async () => {
        const data = await adminService.getUsersWithProjects();
        setUsers(data.sort((a, b) => b.projectCount - a.projectCount));
    };

    const handleSelectUser = async (user: UserInfo) => {
        setSelectedUser(user);
        setViewMode('projects');
        const data = await adminService.getProjectsByUser(user.userId);
        setProjects(data);
    };

    const handleBackToUsers = () => {
        setViewMode('users');
        setSelectedUser(null);
        setProjects([]);
    };

    // 이미지 다운로드
    const handleDownloadThumbnail = async (project: AdminResource) => {
        if (!project.thumbnail) {
            alert('미리보기 이미지가 없습니다.');
            return;
        }

        try {
            const response = await fetch(project.thumbnail);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.title}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            alert('다운로드에 실패했습니다.');
        }
    };

    // JSON 데이터 다운로드
    const handleDownloadData = async (project: AdminResource) => {
        setDownloading(true);
        try {
            const data = await adminService.getProjectData(project.id);
            if (!data) {
                alert('데이터를 가져올 수 없습니다.');
                return;
            }

            const exportData = {
                id: project.id,
                title: project.title,
                createdAt: project.submittedAt,
                elements: data.elements,
                pages: data.pages
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.title}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            alert('다운로드에 실패했습니다.');
        } finally {
            setDownloading(false);
        }
    };

    // 프로바이더 배지
    const getProviderBadge = (provider: string) => {
        const colors: Record<string, string> = {
            'kakao': 'bg-yellow-100 text-yellow-800',
            'google': 'bg-blue-100 text-blue-800',
            'email': 'bg-gray-100 text-gray-800',
        };
        const names: Record<string, string> = {
            'kakao': '카카오',
            'google': '구글',
            'email': '이메일',
        };
        return (
            <span className={`text-xs px-2 py-0.5 rounded-full ${colors[provider] || 'bg-gray-100 text-gray-600'}`}>
                {names[provider] || provider}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5500FF]"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {viewMode === 'projects' ? (
                            <button
                                onClick={handleBackToUsers}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <Shield className="w-6 h-6 text-[#5500FF]" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">
                                {viewMode === 'users' ? '관리자 패널' : selectedUser?.displayName || '유저 자료'}
                            </h1>
                            {viewMode === 'projects' && selectedUser?.email && (
                                <p className="text-xs text-gray-500">{selectedUser.email}</p>
                            )}
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        {viewMode === 'users'
                            ? `총 ${users.length}명의 유저`
                            : `${projects.length}개 프로젝트`
                        }
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* User List View */}
                {viewMode === 'users' && (
                    <>
                        {users.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p>등록된 유저가 없습니다.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {users.map((user) => (
                                    <div
                                        key={user.userId}
                                        onClick={() => handleSelectUser(user)}
                                        className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            {user.avatarUrl ? (
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={user.displayName}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gradient-to-br from-[#5500FF] to-[#8855FF] rounded-full flex items-center justify-center text-white font-bold">
                                                    {user.displayName.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-800">
                                                        {user.displayName}
                                                    </p>
                                                    {getProviderBadge(user.provider)}
                                                </div>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email || '이메일 없음'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-[#5500FF]">{user.projectCount}</p>
                                                <p className="text-xs text-gray-500">프로젝트</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Projects List View */}
                {viewMode === 'projects' && (
                    <>
                        {/* 읽기 전용 안내 */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-700 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            읽기 전용 모드입니다. 자료 편집은 불가능합니다.
                        </div>

                        {projects.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p>저장된 프로젝트가 없습니다.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                        {/* Thumbnail */}
                                        <div
                                            className="aspect-video bg-gray-100 relative cursor-pointer"
                                            onClick={() => setSelectedProject(project)}
                                        >
                                            {project.thumbnail ? (
                                                <img
                                                    src={project.thumbnail}
                                                    alt={project.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <FileText className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-800 mb-2 truncate">
                                                {project.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(project.submittedAt).toLocaleDateString('ko-KR')}
                                            </div>

                                            {/* Download Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleDownloadThumbnail(project)}
                                                    className="flex-1 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-1"
                                                    disabled={!project.thumbnail}
                                                >
                                                    <Download className="w-3 h-3" /> 이미지
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadData(project)}
                                                    className="flex-1 py-2 text-xs bg-[#5500FF] hover:bg-[#4400DD] text-white rounded-lg flex items-center justify-center gap-1"
                                                    disabled={downloading}
                                                >
                                                    <Download className="w-3 h-3" /> 데이터
                                                </button>
                                            </div>
                                        </div>
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
                                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(selectedProject.submittedAt).toLocaleString('ko-KR')}
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                    읽기 전용
                                </span>
                            </div>

                            {/* Large Preview */}
                            {selectedProject.thumbnail ? (
                                <img
                                    src={selectedProject.thumbnail}
                                    alt="Preview"
                                    className="w-full rounded-lg mb-4 border"
                                />
                            ) : (
                                <div className="w-full aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                                    <FileText className="w-16 h-16" />
                                </div>
                            )}

                            {/* Download Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDownloadThumbnail(selectedProject)}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium flex items-center justify-center gap-2"
                                    disabled={!selectedProject.thumbnail}
                                >
                                    <Download className="w-5 h-5" />
                                    이미지 다운로드
                                </button>
                                <button
                                    onClick={() => handleDownloadData(selectedProject)}
                                    className="flex-1 py-3 bg-[#5500FF] hover:bg-[#4400DD] text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                    disabled={downloading}
                                >
                                    <Download className="w-5 h-5" />
                                    데이터(JSON) 다운로드
                                </button>
                            </div>

                            <button
                                onClick={() => setSelectedProject(null)}
                                className="w-full mt-3 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
