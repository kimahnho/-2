
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
    const selectedId = project.selectedIds.length === 1 ? project.selectedIds[0] : null;
    const selected = selectedId ? project.elements.find(el => el.id === selectedId) : null;

    const cardId = selected ? selected.id : generateId(); // Reuse ID if replacing (though replacing with new ID is safer, let's try new ID to avoid stale render issues, or reuse to keep connections?) 
    // Reuse ID might be confusing if type changes. Let's use new ID for safety, or keep ID if we are sure?
    // Actually replacing element completely is cleaner.

    const newId = generateId();

    let x, y, width, height, zIndex;

    if (selected) {
      x = selected.x;
      y = selected.y;
      width = selected.width;
      height = selected.height;
      zIndex = selected.zIndex;
    } else {
      // Default position
      const widthVal = 150;
      const heightVal = 180;
      x = (CANVAS_WIDTH - widthVal) / 2;
      y = (CANVAS_HEIGHT - heightVal) / 2;
      width = widthVal;
      height = heightVal;
      zIndex = project.elements.length + 1;
    }

    const emotionCard: DesignElement = {
      id: newId,
      type: 'card',
      x, y, width, height,
      backgroundColor: '#FFF0F5',
      borderRadius: 16,
      borderWidth: 2,
      borderColor: '#F472B6',
      borderStyle: 'solid',
      rotation: 0,
      zIndex,
      pageId: project.activePageId,
      metadata: {
        isEmotionCard: true,
        emotionData: {
          imageUrl: imageUrl,
          label: label,
          isFilled: true
        }
      }
    } as DesignElement;

    if (selected) {
      // Replace
      const nextElements = project.elements.map(el => el.id === selected.id ? emotionCard : el);
      project.updateElements(nextElements);
      project.setSelectedIds([newId]);
    } else {
      // Add new
      project.updateElements([...project.elements, emotionCard]);
      project.setSelectedIds([newId]);
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
