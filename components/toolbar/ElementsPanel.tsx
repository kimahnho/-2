
import React from 'react';
import { Square, Circle, Layout, Minus, MoveRight } from 'lucide-react';
import { ElementType } from '../../types';

interface Props {
  onAddElement: (type: ElementType, content?: string) => void;
}

export const ElementsPanel: React.FC<Props> = ({ onAddElement }) => {
  return (
    <div className="space-y-6">
        <div>
            <h3 className="font-bold text-sm text-gray-700 mb-3">도형 & 선</h3>
            <div className="grid grid-cols-3 gap-3">
                <ElementButton onClick={() => onAddElement('shape')} icon={<Square />} label="사각형" />
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
