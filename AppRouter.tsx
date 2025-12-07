/**
 * AppRouter - URL 라우팅 설정
 * 모든 페이지 경로를 정의합니다.
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { EditorPage } from './components/editor/EditorPage';
import { Dashboard } from './components/Dashboard';
import { Landing } from './components/Landing';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { PricingPage } from './components/pricing/PricingPage';
import { storageService } from './services/storageService';
import { authService, type AuthUser } from './services';
import { ProjectData, StudentProfile, StudentGroup } from './types';

// Layout wrapper with Header
const MainLayout: React.FC<{ children: React.ReactNode; user: AuthUser | null; onLogin: () => void }> = ({ children, user, onLogin }) => (
    <div style={{ paddingTop: '64px' }}>
        <Header user={user} onLogin={onLogin} />
        {children}
    </div>
);

// Landing Page Route
const LandingRoute: React.FC<{ user: AuthUser | null; onLogin: () => void }> = ({ user, onLogin }) => {
    const navigate = useNavigate();

    const handleSelectStudent = (student: StudentProfile) => {
        navigate(`/dashboard?studentId=${student.id}`);
    };

    const handleSelectGroup = (group: StudentGroup) => {
        navigate(`/dashboard?groupId=${group.id}`);
    };

    const handleQuickStart = async () => {
        if (!user) {
            navigate('/editor/guest-session');
            return;
        }
        const newId = await storageService.createProject('제목 없는 디자인');
        navigate(`/editor/${newId}`);
    };

    const handleOpenStorage = () => {
        if (!user) {
            if (confirm('로그인이 필요한 기능입니다. 로그인하시겠습니까?')) {
                navigate('/login');
            }
            return;
        }
        navigate('/dashboard');
    };

    return (
        <MainLayout user={user} onLogin={onLogin}>
            <Landing
                onSelectStudent={handleSelectStudent}
                onSelectGroup={handleSelectGroup}
                onQuickStart={handleQuickStart}
                onOpenStorage={handleOpenStorage}
                isGuest={!user}
                onRequireLogin={() => navigate('/login')}
            />
        </MainLayout>
    );
};

// Login Page Route
const LoginRoute: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'white' }}>
            <button
                onClick={() => navigate(-1)}
                style={{ position: 'absolute', top: 20, right: 20, padding: 10, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}
            >✕</button>
            <LoginPage onLoginSuccess={() => navigate('/')} />
        </div>
    );
};

// Dashboard Route
const DashboardRoute: React.FC<{ user: AuthUser | null; onLogin: () => void }> = ({ user, onLogin }) => {
    const navigate = useNavigate();
    const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
    const [currentGroup, setCurrentGroup] = useState<StudentGroup | null>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    if (!user) return null;

    const handleOpenProject = (id: string) => {
        navigate(`/editor/${id}`);
    };

    const handleNewProject = async () => {
        let newId: string;
        if (currentGroup) {
            newId = await storageService.createProject('제목 없는 디자인', currentGroup.id, true);
        } else if (currentStudent) {
            newId = await storageService.createProject('제목 없는 디자인', currentStudent.id, false);
        } else {
            newId = await storageService.createProject('제목 없는 디자인');
        }
        navigate(`/editor/${newId}`);
    };

    const handleSwitchProfile = () => {
        setCurrentStudent(null);
        setCurrentGroup(null);
        navigate('/');
    };

    const handleSelectStudent = (student: StudentProfile) => {
        setCurrentStudent(student);
        setCurrentGroup(null);
    };

    const handleSelectGroup = (group: StudentGroup) => {
        setCurrentGroup(group);
        setCurrentStudent(null);
    };

    return (
        <MainLayout user={user} onLogin={onLogin}>
            <Dashboard
                currentStudent={currentStudent}
                currentGroup={currentGroup}
                onOpenProject={handleOpenProject}
                onNewProject={handleNewProject}
                onSwitchProfile={handleSwitchProfile}
                onSelectStudent={handleSelectStudent}
                onSelectGroup={handleSelectGroup}
            />
        </MainLayout>
    );
};

// Editor Route
const EditorRoute: React.FC<{ user: AuthUser | null }> = ({ user }) => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const [initialData, setInitialData] = useState<ProjectData | undefined>(undefined);
    const [initialTitle, setInitialTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProject = async () => {
            if (!projectId) {
                navigate('/');
                return;
            }

            // Guest session
            if (projectId === 'guest-session') {
                setInitialData({
                    elements: [],
                    pages: [{ id: 'page-1', elements: [], background: '#ffffff', width: 794, height: 1123 }]
                });
                setInitialTitle('제목 없는 디자인');
                setLoading(false);
                return;
            }

            // Load existing project
            const data = await storageService.getProject(projectId);
            const allProjects = await storageService.getAllProjects();
            const meta = allProjects.find(p => p.id === projectId);

            if (data && meta) {
                setInitialData(data);
                setInitialTitle(meta.title);
            }
            setLoading(false);
        };

        loadProject();
    }, [projectId, navigate]);

    const handleBack = () => {
        if (!user) {
            navigate('/');
        } else {
            navigate('/dashboard');
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>로딩 중...</div>;
    }

    if (!projectId) return null;

    return (
        <EditorPage
            projectId={projectId}
            initialData={initialData}
            initialTitle={initialTitle}
            onBack={handleBack}
            isGuest={!user}
        />
    );
};

// Pricing Route
const PricingRoute: React.FC<{ user: AuthUser | null; onLogin: () => void }> = ({ user, onLogin }) => {
    console.log('🎯 PricingRoute is rendering!', { user });
    return (
        <MainLayout user={user} onLogin={onLogin}>
            <PricingPage user={user} />
        </MainLayout>
    );
};

// Main App Router
export const AppRouter: React.FC = () => {
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        authService.getCurrentUser().then(setUser);
        const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
            setUser(session);
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = () => {
        // This will be handled by navigation
        window.location.href = '/login';
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingRoute user={user} onLogin={handleLogin} />} />
                <Route path="/login" element={<LoginRoute />} />
                <Route path="/dashboard" element={<DashboardRoute user={user} onLogin={handleLogin} />} />
                <Route path="/editor/:projectId" element={<EditorRoute user={user} />} />
                <Route path="/pricing" element={<PricingRoute user={user} onLogin={handleLogin} />} />
            </Routes>
        </BrowserRouter>
    );
};
