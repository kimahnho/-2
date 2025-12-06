
import { useState } from 'react';
import { DesignElement } from '../types';
import { generateTherapyImage } from '../services/geminiService';
import { downloadPageAsImage } from '../utils/exportUtils';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/canvasUtils';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface ProjectActions {
  elements: DesignElement[];
  activePageId: string;
  selectedIds: string[];
  updateElements: (elements: DesignElement[]) => void;
  updateElement: (id: string, updates: Partial<DesignElement>, commit?: boolean) => void;
  addElement: (type: any, content?: string) => void;
  setSelectedIds: (ids: string[]) => void;
}

export const useAppActions = (
  project: ProjectActions, 
  title: string,
  onSaveAsset: (url: string) => void
) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleAddImageWithCaption = (url: string, captionText: string) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      // Create Image
      const width = Math.min(300, img.width);
      const height = (img.height / img.width) * width;
      const x = (CANVAS_WIDTH - width) / 2;
      const y = (CANVAS_HEIGHT - height) / 2;
      
      const imgEl = { 
        id: generateId(), type: 'image', x, y, width, height, content: url, rotation: 0, zIndex: project.elements.length + 1, pageId: project.activePageId, borderRadius: 0 
      } as DesignElement;

      // Create Text
      const textEl = {
        id: generateId(), type: 'text', x, y: y + height + 10, width, height: 40, content: captionText, fontSize: 24, color: '#000000', rotation: 0, zIndex: project.elements.length + 2, pageId: project.activePageId, fontFamily: "'Gowun Dodum', sans-serif"
      } as DesignElement;

      project.updateElements([...project.elements, imgEl, textEl]);
      project.setSelectedIds([imgEl.id, textEl.id]);
    };
  };

  const handleApplyEmotion = (imageUrl: string, label: string) => {
      const selected = project.elements.find(el => project.selectedIds.includes(el.id));
      
      if (selected && ['shape','card','circle'].includes(selected.type)) {
          // Find text below to update label automatically
          const bottomY = selected.y + selected.height;
          const labelText = project.elements.find(el => 
             el.type === 'text' && 
             el.pageId === selected.pageId &&
             el.y >= bottomY - 10 && el.y <= bottomY + 100 &&
             Math.abs((el.x + el.width/2) - (selected.x + selected.width/2)) < 60
          );
          
          let newElements = project.elements.map(el => {
              // Apply image to shape
              if (el.id === selected.id) return { ...el, backgroundImage: imageUrl, borderColor: '#000000', borderWidth: 1, borderStyle: 'solid', backgroundColor: '#ffffff' };
              // Update text label if found
              if (labelText && el.id === labelText.id) return { ...el, content: label, color: '#000000' };
              return el;
          });
          
          // Remove placeholder text if present
          newElements = newElements.filter(el => !el.content?.includes('클릭하여'));
          project.updateElements(newElements as DesignElement[]);
      } else {
          // Default behavior: Add new image and caption
          handleAddImageWithCaption(imageUrl, label);
      }
  };

  const handleAiImageFill = async (id: string, prompt: string, style: 'character' | 'realistic' | 'emoji') => {
      try {
          const imageUrl = await generateTherapyImage(prompt, style);
          project.updateElement(id, { backgroundImage: imageUrl }, true);
          onSaveAsset(imageUrl);
      } catch (e) { 
          alert("이미지 생성 실패"); 
      }
  };

  const handleExport = async () => {
      setIsExporting(true);
      project.setSelectedIds([]); // Clear selection for clean screenshot
      await new Promise(r => setTimeout(r, 100)); // Wait for render
      try {
          await downloadPageAsImage(project.activePageId, title);
      } catch (e) {
          console.error(e);
          alert("저장 실패");
      } finally {
          setIsExporting(false);
      }
  };

  return {
      isExporting,
      handleAddImageWithCaption,
      handleApplyEmotion,
      handleAiImageFill,
      handleExport
  };
};
