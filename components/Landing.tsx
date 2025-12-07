
import React, { useState } from 'react';
import { StudentProfile, StudentGroup } from '../types';
import { ProfileManager } from './landing/ProfileManager';
import { WeeklyScheduler } from './landing/WeeklyScheduler';
import { TemplateSection } from './landing/TemplateSection';
import { Zap, Folder } from 'lucide-react';

interface Props {
  onSelectStudent: (student: StudentProfile) => void;
  onSelectGroup: (group: StudentGroup) => void;
  onQuickStart: () => void;
  onOpenStorage: () => void;
  isGuest?: boolean; // Added
  onRequireLogin?: () => void; // Added
}

export const Landing: React.FC<Props> = ({ onSelectStudent, onSelectGroup, onQuickStart, onOpenStorage, isGuest, onRequireLogin }) => {
  const [dataVersion, setDataVersion] = useState(0);

  const handleDataChange = () => {
    setDataVersion(prev => prev + 1);
  };

  const handleSelectTemplate = (templateId: string) => {
    console.log('Selected template:', templateId);
    // TODO: 템플릿 선택 시 에디터로 이동
    onQuickStart();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-8 font-sans overflow-y-auto">
      <div className="max-w-5xl w-full space-y-8 mb-20">
        {/* Header */}
        <div className="text-center space-y-2 mt-0">
          <h1 className="text-3xl font-bold text-gray-900 mt-4">수업 준비를 시작해볼까요?</h1>
          <p className="text-gray-500">개별 학습자 또는 그룹 수업을 선택하여 맞춤형 자료를 만들어보세요.</p>

          <div className="pt-6 flex justify-center gap-4">
            <button
              onClick={onQuickStart}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-[#5500FF]/30 text-[#5500FF] rounded-xl font-bold hover:bg-[#5500FF] hover:text-white hover:shadow-lg transition-all shadow-sm group"
            >
              <div className="p-1 bg-[#5500FF]/10 rounded-full group-hover:bg-white/20 transition-colors">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              바로 만들기
            </button>

            <button
              onClick={onOpenStorage}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all shadow-sm group"
            >
              <div className="p-1 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                <Folder className="w-4 h-4 fill-current" />
              </div>
              내 학습자료
            </button>
          </div>
        </div>

        {/* Managers */}
        <ProfileManager
          onSelectStudent={onSelectStudent}
          onSelectGroup={onSelectGroup}
          onDataChange={handleDataChange}
          isGuest={isGuest}
          onRequireLogin={onRequireLogin}
        />
      </div>

      {/* Templates Section */}
      <TemplateSection onSelectTemplate={handleSelectTemplate} />

      {/* Schedule */}
      <div className="w-full max-w-5xl mt-12">
        <WeeklyScheduler
          lastUpdate={dataVersion}
          isGuest={isGuest}
          onRequireLogin={onRequireLogin}
        />
      </div>
    </div>
  );
};
