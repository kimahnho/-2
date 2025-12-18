/**
 * AdminPanel - 관리자 전용 자료 관리 패널
 * 선생님들이 제출한 자료를 열람하고 승인/거부할 수 있음
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, AdminResource } from '../../services/adminService';
import { Shield, Check, X, Eye, Trash2, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

type TabType = 'pending' | 'approved' | 'rejected' | 'all';

export const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [resources, setResources] = useState<AdminResource[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [selectedResource, setSelectedResource] = useState<AdminResource | null>(null);
    const [adminNotes, setAdminNotes] = useState('');

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

    // 자료 로드
    useEffect(() => {
        if (!isAdmin) return;
        loadResources();
    }, [isAdmin, activeTab]);

    const loadResources = async () => {
        const status = activeTab === 'all' ? undefined : activeTab;
        const data = await adminService.getAllResources(status);
        setResources(data);
    };

    const handleApprove = async (id: string) => {
        await adminService.updateResourceStatus(id, 'approved', adminNotes);
        setSelectedResource(null);
        setAdminNotes('');
        loadResources();
    };

    const handleReject = async (id: string) => {
        await adminService.updateResourceStatus(id, 'rejected', adminNotes);
        setSelectedResource(null);
        setAdminNotes('');
        loadResources();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        await adminService.deleteResource(id);
        loadResources();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> 대기중</span>;
            case 'approved':
                return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> 승인됨</span>;
            case 'rejected':
                return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> 거부됨</span>;
            default:
                return null;
        }
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
                        총 {resources.length}개 자료
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['pending', 'approved', 'rejected', 'all'] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab
                                    ? 'bg-[#5500FF] text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {tab === 'pending' && '대기중'}
                            {tab === 'approved' && '승인됨'}
                            {tab === 'rejected' && '거부됨'}
                            {tab === 'all' && '전체'}
                        </button>
                    ))}
                </div>

                {/* Resource Grid */}
                {resources.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center text-gray-500">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>제출된 자료가 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resources.map((resource) => (
                            <div
                                key={resource.id}
                                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video bg-gray-100 relative">
                                    {resource.thumbnail ? (
                                        <img
                                            src={resource.thumbnail}
                                            alt={resource.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            미리보기 없음
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        {getStatusBadge(resource.status)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-medium text-gray-800 mb-2 truncate">
                                        {resource.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-3">
                                        {new Date(resource.submittedAt).toLocaleDateString('ko-KR')} 제출
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedResource(resource)}
                                            className="flex-1 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-1"
                                        >
                                            <Eye className="w-4 h-4" /> 상세보기
                                        </button>
                                        {resource.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(resource.id)}
                                                    className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg"
                                                    title="승인"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(resource.id)}
                                                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
                                                    title="거부"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDelete(resource.id)}
                                            className="p-2 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 rounded-lg"
                                            title="삭제"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedResource && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold">{selectedResource.title}</h2>
                                    <p className="text-sm text-gray-500">
                                        {new Date(selectedResource.submittedAt).toLocaleString('ko-KR')}
                                    </p>
                                </div>
                                {getStatusBadge(selectedResource.status)}
                            </div>

                            {/* Preview */}
                            {selectedResource.thumbnail && (
                                <img
                                    src={selectedResource.thumbnail}
                                    alt="Preview"
                                    className="w-full rounded-lg mb-4"
                                />
                            )}

                            {/* Admin Notes */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    관리자 메모
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="w-full p-3 border rounded-lg resize-none"
                                    rows={3}
                                    placeholder="승인/거부 사유를 입력하세요..."
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleApprove(selectedResource.id)}
                                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                                >
                                    승인
                                </button>
                                <button
                                    onClick={() => handleReject(selectedResource.id)}
                                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
                                >
                                    거부
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedResource(null);
                                        setAdminNotes('');
                                    }}
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
