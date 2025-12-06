
import React from 'react';
import { StudentProfile, StudentGroup } from '../../types';
import { ChevronLeft, Users, Search, Plus, Folder } from 'lucide-react';

interface Props {
  currentStudent: StudentProfile | null;
  currentGroup: StudentGroup | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNewProject: () => void;
  onSwitchProfile: () => void;
}

export const DashboardHeader: React.FC<Props> = ({
  currentStudent,
  currentGroup,
  searchQuery,
  setSearchQuery,
  onNewProject,
  onSwitchProfile
}) => {
  // Helper to get display info
  const displayName = currentStudent ? currentStudent.name : (currentGroup ? currentGroup.name : '내 보관함');
  const displayColor = currentStudent ? currentStudent.avatarColor : (currentGroup ? currentGroup.color : '#5500FF');
  const displayNotes = currentStudent ? currentStudent.notes : (currentGroup ? currentGroup.description : '');
  const groupMemberCount = currentGroup ? currentGroup.studentIds.length : 0;

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={onSwitchProfile}
            className="flex items-center gap-2 text-gray-500 hover:text-[#5500FF] transition-colors"
            title="홈으로 돌아가기"
          >
              <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                style={{ backgroundColor: displayColor || '#5500FF' }}
            >
                {currentGroup ? <Users className="w-5 h-5" /> : (currentStudent ? displayName[0] : <Folder className="w-5 h-5" />)}
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-800 leading-none">{displayName} {currentGroup && '그룹'}</h1>
                    {currentGroup && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                            {groupMemberCount}명
                        </span>
                    )}
                </div>
                <span className="text-xs text-gray-400">{displayNotes || (currentGroup ? '그룹 수업 자료' : (!currentStudent ? '바로 만들기 자료' : '특이사항 없음'))}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`${displayName} 검색`}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent focus:bg-white border focus:border-[#5500FF] rounded-lg text-sm outline-none transition-all"
                />
            </div>
        </div>

        <div className="flex items-center gap-3">
             <button 
                onClick={onNewProject}
                className="bg-[#5500FF] hover:bg-[#4400cc] text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#5500FF]/20 transition-all transform hover:scale-105"
             >
                 <Plus className="w-4 h-4" />
                 새 자료 만들기
             </button>
        </div>
    </header>
  );
};
