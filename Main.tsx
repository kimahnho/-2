import React, { useState, useEffect } from 'react';
import { EditorPage } from './components/editor/EditorPage';
import { Dashboard } from './components/Dashboard';
import { Landing } from './components/Landing';
import { storageService } from './services/storageService';
import { ProjectData, StudentProfile, StudentGroup } from './types';
import { Header } from './components/layout/Header';
import { authService, type AuthUser } from './services';
import { LoginPage } from './components/auth/LoginPage';

type ViewState = 'landing' | 'dashboard' | 'editor';

export const Main: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Context: Student OR Group
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [currentGroup, setCurrentGroup] = useState<StudentGroup | null>(null);

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<ProjectData | undefined>(undefined);
  const [initialTitle, setInitialTitle] = useState<string>('');

  // Load User Info
  useEffect(() => {
    authService.getCurrentUser().then((session) => {
      setUser(session);
      // If logged in, maybe redirect to dashboard if on landing?
      // But user might want to see landing still? let's keep default behavior.
    });
    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      setUser(session);
      if (session) setShowLoginModal(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 1. Landing -> Dashboard (Student)
  const handleSelectStudent = (student: StudentProfile) => {
    setCurrentStudent(student);
    setCurrentGroup(null);
    setView('dashboard');
  };

  // 2. Landing -> Dashboard (Group)
  const handleSelectGroup = (group: StudentGroup) => {
    setCurrentGroup(group);
    setCurrentStudent(null);
    setView('dashboard');
  };

  const handleSwitchProfile = () => {
    setCurrentStudent(null);
    setCurrentGroup(null);
    setCurrentProjectId(null);
    setInitialData(undefined);
    setView('landing');
  };

  // 3. Dashboard -> Editor (Open Existing)
  const handleOpenProject = async (id: string) => {
    const data = await storageService.getProject(id);
    const allProjects = await storageService.getAllProjects();
    const meta = allProjects.find(p => p.id === id);
    if (data && meta) {
      setCurrentProjectId(id);
      setInitialData(data);
      setInitialTitle(meta.title);
      setView('editor');
    }
  };

  // 4. Dashboard -> Editor (New Project)
  const handleNewProject = async () => {
    let newId: string;

    if (currentGroup) {
      // Create project for Group
      newId = await storageService.createProject('제목 없는 디자인', currentGroup.id, true);
    } else if (currentStudent) {
      // Create project for Student
      newId = await storageService.createProject('제목 없는 디자인', currentStudent.id, false);
    } else {
      // Create generic project (My Library)
      newId = await storageService.createProject('제목 없는 디자인');
    }

    const allProjects = await storageService.getAllProjects();
    const meta = allProjects.find(p => p.id === newId);
    const data = await storageService.getProject(newId);

    if (data && meta) {
      setCurrentProjectId(newId);
      setInitialData(data);
      setInitialTitle(meta.title);
      setView('editor');
    }
  };

  // 5. Landing -> Editor (Quick Start)
  const handleQuickStart = async () => {
    // Guest Mode Check
    if (!user) {
      // Create in-memory project for guest
      const guestData: ProjectData = {
        elements: [],
        pages: [{ id: 'page-1', elements: [], background: '#ffffff', width: 794, height: 1123 }]
      };
      setInitialData(guestData);
      setCurrentProjectId('guest-session'); // Special ID for guest
      setInitialTitle('게스트 프로젝트');
      setInitialTitle('제목 없는 디자인');

      setCurrentStudent(null);
      setCurrentGroup(null);
      setView('editor');
      return;
    }

    // Logged-in User Logic
    const newId = await storageService.createProject('제목 없는 디자인');
    const allProjects = await storageService.getAllProjects();
    const meta = allProjects.find(p => p.id === newId);
    const data = await storageService.getProject(newId);

    if (data && meta) {
      setCurrentStudent(null);
      setCurrentGroup(null);
      setCurrentProjectId(newId);
      setInitialData(data);
      setInitialTitle(meta.title);
      setView('editor');
    }
  };

  // 6. Landing -> Dashboard (Open Storage)
  const handleOpenStorage = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setCurrentStudent(null);
    setCurrentGroup(null);
    setView('dashboard');
  };

  const handleBackToDashboard = () => {
    if (!user) {
      // Guest goes back to landing
      setView('landing');
      setCurrentProjectId(null);
      setInitialData(undefined);
      return;
    }
    setView('dashboard');
    setCurrentProjectId(null);
    setInitialData(undefined);
  };

  // Layout wrapper (excludes Editor)
  const renderWithLayout = (content: React.ReactNode) => (
    <div style={{ paddingTop: '64px' }}>
      <Header user={user} onLogin={() => setShowLoginModal(true)} />
      {content}
    </div>
  );

  // Login Modal Overlay
  if (showLoginModal) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'white' }}>
        <button
          onClick={() => setShowLoginModal(false)}
          style={{ position: 'absolute', top: 20, right: 20, padding: 10, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}
        >✕</button>
        <LoginPage onLoginSuccess={() => setShowLoginModal(false)} />
      </div>
    );
  }

  if (view === 'editor' && currentProjectId) {
    return (
      <EditorPage
        projectId={currentProjectId}
        initialData={initialData}
        initialTitle={initialTitle}
        onBack={handleBackToDashboard}
        isGuest={!user} // Pass guest flag
      />
    );
  }

  if (view === 'dashboard') {
    // If not logged in, redirect to Landing (Security Check)
    if (!user) {
      setView('landing');
      return null; // Will re-render
    }

    return renderWithLayout(
      <Dashboard
        currentStudent={currentStudent}
        currentGroup={currentGroup}
        onOpenProject={handleOpenProject}
        onNewProject={handleNewProject}
        onSwitchProfile={handleSwitchProfile}
        onSelectStudent={handleSelectStudent}
        onSelectGroup={handleSelectGroup}
      />
    );
  }

  // Default: Landing Page
  return renderWithLayout(
    <Landing
      onSelectStudent={handleSelectStudent}
      onSelectGroup={handleSelectGroup}
      onQuickStart={handleQuickStart}
      onOpenStorage={handleOpenStorage}
      isGuest={!user}
      onRequireLogin={() => setShowLoginModal(true)}
    />
  );
};