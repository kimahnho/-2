/**
 * AdminPanel - 관리자 전용 자료 관리 패널
 * 모든 사용자의 프로젝트를 열람할 수 있음
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, AdminResource } from '../../services/adminService';
import { Shield, Eye, ArrowLeft, FileText, Calendar, User } from 'lucide-react';

export const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<AdminResource[]>([]);
    const [selectedProject, setSelectedProject] = useState<AdminResource | null>(null);

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

    // 프로젝트 로드
    useEffect(() => {
        if (!isAdmin) return;
        loadProjects();
    }, [isAdmin]);

    const loadProjects = async () => {
        const data = await adminService.getAllProjects();
        setProjects(data);
    };

    const handleOpenInEditor = (projectId: string) => {
        window.open(`/editor/${projectId}`, '_blank');
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
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <Shield className="w-6 h-6 text-[#5500FF]" />
                        <h1 className="text-xl font-bold text-gray-800">관리자 패널</h1>
                    </div>
                    <div className="text-sm text-gray-500">
                        전체 프로젝트: {projects.length}개
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Project Grid */}
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
                                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setSelectedProject(project)}
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video bg-gray-100 relative">
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
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(project.submittedAt).toLocaleDateString('ko-KR')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedProject && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold">{selectedProject.title}</h2>
                                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(selectedProject.submittedAt).toLocaleString('ko-KR')}
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                        <User className="w-4 h-4" />
                                        작성자 ID: {selectedProject.submittedBy?.slice(0, 8)}...
                                    </p>
                                </div>
                            </div>

                            {/* Preview */}
                            {selectedProject.thumbnail && (
                                <img
                                    src={selectedProject.thumbnail}
                                    alt="Preview"
                                    className="w-full rounded-lg mb-4"
                                />
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleOpenInEditor(selectedProject.id)}
                                    className="flex-1 py-3 bg-[#5500FF] hover:bg-[#4400DD] text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                >
                                    <Eye className="w-5 h-5" />
                                    에디터에서 열기
                                </button>
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
