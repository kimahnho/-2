
import React from 'react';
import { Circle, Layout, Minus, MoveRight, Heart, Grid } from 'lucide-react';
import { ElementType } from '../../types';

interface Props {
  onAddElement: (type: ElementType, content?: string, options?: any) => void;
  onAddEmotionCard?: () => void;
  onAddAACCard?: () => void;
}

export const ElementsPanel: React.FC<Props> = ({
  onAddElement,
  onAddEmotionCard,
  onAddAACCard
}) => {
  return (
    <div className="space-y-6">
      {/* 자동화 요소 */}
      <div>
        <h3 className="font-bold text-sm text-gray-700 mb-3">자동화 요소</h3>
        <p className="text-xs text-gray-500 mb-3">클릭하면 자동으로 채워지는 카드</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onAddEmotionCard}
            className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 rounded-xl hover:border-pink-400 hover:shadow-md transition-all group"
          >
            <div className="p-2 bg-pink-500 rounded-xl text-white group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-pink-700">감정카드</span>
          </button>
          <button
            onClick={onAddAACCard}
            className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-md transition-all group"
          >
            <div className="p-2 bg-[#5500FF] rounded-xl text-white group-hover:scale-110 transition-transform">
              <Grid className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-purple-700">AAC 카드</span>
          </button>
        </div>
      </div>

      {/* 도형 & 선 */}
      <div>
        <h3 className="font-bold text-sm text-gray-700 mb-3">도형 & 선</h3>
        <div className="grid grid-cols-3 gap-3">
          <ElementButton onClick={() => onAddElement('shape')} icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="7" y="7" width="13" height="13" className="fill-gray-400" rx="1" />
              <path d="M4 20V5a1 1 0 0 1 1-1h15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          } label="사각형" />
          <ElementButton onClick={() => onAddElement('shape', undefined, { borderRadius: 15 })} icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 20V12a5 5 0 0 1 5-5h8v13H7z" className="fill-gray-400" />
              <path d="M4 20V12a8 8 0 0 1 8-8h8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          } label="둥근 사각형" />
          <ElementButton onClick={() => onAddElement('circle')} icon={<Circle />} label="원" />
          <ElementButton onClick={() => onAddElement('card')} icon={<Layout />} label="카드" />
          <ElementButton onClick={() => onAddElement('line')} icon={<Minus />} label="선" />
          <ElementButton onClick={() => onAddElement('arrow')} icon={<MoveRight />} label="화살표" />
        </div>
      </div>
    </div>
  );
};

const ElementButton = ({ onClick, icon, label }: { onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className="aspect-square bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white hover:shadow-md hover:border-[#B0C0ff] hover:text-[#5500FF] transition-all text-gray-500"
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);
