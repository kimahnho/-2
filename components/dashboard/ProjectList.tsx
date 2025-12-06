
import React, { useState, useEffect } from 'react';
import { SavedProjectMetadata } from '../../types';
import { Search, Layout, Plus, MoreVertical, Trash2, Clock } from 'lucide-react';

interface Props {
  projects: SavedProjectMetadata[];
  displayName: string;
  searchQuery: string;
  onOpenProject: (id: string) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectList: React.FC<Props> = ({ 
  projects, 
  displayName, 
  searchQuery, 
  onOpenProject, 
  onNewProject,
  onDeleteProject 
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleGlobalClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleMenuClick = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setActiveMenuId(prev => prev === id ? null : id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(null);
    onDeleteProject(id);
  };

  if (projects.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
             {searchQuery ? (
                 <>
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p>검색 결과가 없습니다.</p>
                 </>
             ) : (
                 <>
                    <Layout className="w-16 h-16 mb-4 text-[#5500FF] opacity-20" />
                    <p className="text-lg font-medium text-gray-500 mb-2">{displayName}을 위한 자료가 아직 없습니다.</p>
                    <p className="text-sm mb-6">첫 학습 자료를 만들어보세요!</p>
                    <button 
                        onClick={onNewProject}
                        className="bg-[#5500FF] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#4400cc] transition-all shadow-lg shadow-[#5500FF]/20 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> 자료 만들기
                    </button>
                 </>
             )}
        </div>
     );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {/* New Project Card (Quick Action) */}
        <button 
        onClick={onNewProject}
        className="group bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-[#5500FF] hover:bg-[#5500FF]/5 flex flex-col items-center justify-center gap-4 h-[280px] transition-all"
        >
            <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-gray-400 group-hover:text-[#5500FF] group-hover:shadow-md transition-all">
                <Plus className="w-6 h-6" />
            </div>
            <span className="font-bold text-gray-500 group-hover:text-[#5500FF]">새 자료 만들기</span>
        </button>

        {/* Project Cards */}
        {projects.map(project => (
            <div 
            key={project.id}
            onClick={() => onOpenProject(project.id)}
            className="group bg-white rounded-xl border border-gray-200 hover:border-[#B0C0ff] hover:shadow-xl transition-all overflow-visible cursor-pointer flex flex-col h-[280px] relative"
            >
                {/* Thumbnail Area */}
                <div className="flex-1 bg-gray-50 relative overflow-hidden flex items-center justify-center rounded-t-xl">
                    {project.thumbnail ? (
                        <img src={project.thumbnail} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                        <div className="w-24 h-32 bg-white shadow-sm border border-gray-100 rounded flex flex-col items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-gray-100 rounded-full"></div>
                            <div className="w-12 h-2 bg-gray-100 rounded-full"></div>
                            <div className="w-16 h-16 rounded-full bg-blue-50 mt-2 opacity-50"></div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>

                {/* Info Area */}
                <div className="p-4 bg-white border-t border-gray-100 rounded-b-xl relative">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800 truncate pr-6 group-hover:text-[#5500FF] transition-colors flex-1" title={project.title}>
                        {project.title || '제목 없는 디자인'}
                        </h3>
                        
                        {/* Context Menu Trigger */}
                        <div className="relative">
                            <button 
                            onClick={(e) => handleMenuClick(e, project.id)}
                            className={`text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors ${activeMenuId === project.id ? 'bg-gray-100 text-gray-700' : ''}`}
                            title="더보기"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuId === project.id && (
                                <div 
                                onClick={(e) => e.stopPropagation()} 
                                className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                                >
                                    <button 
                                    onClick={(e) => handleDelete(e, project.id)}
                                    className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                    >
                                    <Trash2 className="w-3.5 h-3.5" /> 삭제하기
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
        ))}
    </div>
  );
};
