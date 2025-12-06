import React, { useState } from 'react';
import { EditorPage } from './components/editor/EditorPage';
import { Dashboard } from './components/Dashboard';
import { Landing } from './components/Landing';
import { storageService } from './services/storageService';
import { ProjectData, StudentProfile, StudentGroup } from './types';

type ViewState = 'landing' | 'dashboard' | 'editor';

export const Main: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');

  // Context: Student OR Group
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [currentGroup, setCurrentGroup] = useState<StudentGroup | null>(null);

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<ProjectData | undefined>(undefined);
  const [initialTitle, setInitialTitle] = useState<string>('');

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

  // 5. Landing -> Editor (Quick Start without Profile)
  const handleQuickStart = async () => {
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
    setCurrentStudent(null);
    setCurrentGroup(null);
    setView('dashboard');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setCurrentProjectId(null);
    setInitialData(undefined);
  };

  if (view === 'editor' && currentProjectId) {
    return (
      <EditorPage
        projectId={currentProjectId}
        initialData={initialData}
        initialTitle={initialTitle}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (view === 'dashboard') {
    return (
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
  return (
    <Landing
      onSelectStudent={handleSelectStudent}
      onSelectGroup={handleSelectGroup}
      onQuickStart={handleQuickStart}
      onOpenStorage={handleOpenStorage}
    />
  );
};