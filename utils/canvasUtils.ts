
import { DesignElement, Guide, Position } from '../types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 1123;
export const SNAP_THRESHOLD = 5;

// --- Alignment Utilities ---

export const alignElements = (
  elements: DesignElement[], 
  selectedIds: string[], 
  type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'distribute-horizontal' | 'distribute-vertical'
): DesignElement[] => {
  if (selectedIds.length === 0) return elements;

  // Single Element Alignment (to Canvas)
  if (selectedIds.length === 1) {
    const id = selectedIds[0];
    const el = elements.find(e => e.id === id);
    if (!el) return elements;

    let updates: Partial<DesignElement> = {};
    switch (type) {
      case 'left': updates.x = 0; break;
      case 'center': updates.x = (CANVAS_WIDTH - el.width) / 2; break;
      case 'right': updates.x = CANVAS_WIDTH - el.width; break;
      case 'top': updates.y = 0; break;
      case 'middle': updates.y = (CANVAS_HEIGHT - el.height) / 2; break;
      case 'bottom': updates.y = CANVAS_HEIGHT - el.height; break;
      default: return elements;
    }
    return elements.map(e => e.id === id ? { ...e, ...updates } : e);
  }

  // Multiple Elements Alignment
  const selectedElements = elements.filter(el => selectedIds.includes(el.id));
  if (selectedElements.length === 0) return elements;

  // Distribution Logic
  if (type === 'distribute-horizontal' || type === 'distribute-vertical') {
    if (selectedElements.length < 3) return elements;
    
    const sorted = [...selectedElements].sort((a, b) => {
      if (type === 'distribute-horizontal') return a.x - b.x;
      return a.y - b.y;
    });

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    
    // Calculate updates map
    const updatesMap = new Map<string, number>();
    
    if (type === 'distribute-horizontal') {
      const span = (last.x + last.width) - first.x;
      const totalWidth = sorted.reduce((sum, el) => sum + el.width, 0);
      const availableSpace = span - totalWidth;
      const gap = availableSpace / (sorted.length - 1);
      
      let currentX = first.x;
      sorted.forEach((el, i) => {
        if (i === 0) {
           currentX += el.width + gap;
           return;
        }
        updatesMap.set(el.id, currentX);
        currentX += el.width + gap;
      });
      
      return elements.map(el => {
         if (updatesMap.has(el.id)) {
             return { ...el, x: updatesMap.get(el.id)! };
         }
         return el;
      });
    } else {
      const span = (last.y + last.height) - first.y;
      const totalHeight = sorted.reduce((sum, el) => sum + el.height, 0);
      const availableSpace = span - totalHeight;
      const gap = availableSpace / (sorted.length - 1);
      
      let currentY = first.y;
      sorted.forEach((el, i) => {
        if (i === 0) {
           currentY += el.height + gap;
           return;
        }
        updatesMap.set(el.id, currentY);
        currentY += el.height + gap;
      });
      
      return elements.map(el => {
         if (updatesMap.has(el.id)) {
             return { ...el, y: updatesMap.get(el.id)! };
         }
         return el;
      });
    }
  }

  // Standard Alignment (Left, Center, Top, etc.)
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  selectedElements.forEach(el => {
    minX = Math.min(minX, el.x);
    maxX = Math.max(maxX, el.x + el.width);
    minY = Math.min(minY, el.y);
    maxY = Math.max(maxY, el.y + el.height);
  });
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return elements.map(el => {
    if (!selectedIds.includes(el.id)) return el;
    let newEl = { ...el };
    switch (type) {
      case 'left': newEl.x = minX; break;
      case 'center': newEl.x = centerX - el.width / 2; break;
      case 'right': newEl.x = maxX - el.width; break;
      case 'top': newEl.y = minY; break;
      case 'middle': newEl.y = centerY - el.height / 2; break;
      case 'bottom': newEl.y = maxY - el.height; break;
    }
    return newEl;
  });
};

// --- Snapping Utilities ---

export const calculateSnapping = (
  movingElements: DesignElement[], 
  otherElements: DesignElement[],
  deltaX: number,
  deltaY: number,
  initialPositions: Record<string, Position>
): { 
  snapDeltaX: number; 
  snapDeltaY: number; 
  guides: Guide[];
  newPositions: Record<string, Position>;
} => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  // Calculate tentative bounding box of moving elements
  const tentativeBounds = movingElements.map(el => {
      const initial = initialPositions[el.id];
      if (!initial) return { ...el };
      return { ...el, x: initial.x + deltaX, y: initial.y + deltaY };
  });

  tentativeBounds.forEach(b => {
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width);
      maxY = Math.max(maxY, b.y + b.height);
  });

  const boxCenterX = (minX + maxX) / 2;
  const boxCenterY = (minY + maxY) / 2;

  let snapDeltaX = 0;
  let snapDeltaY = 0;
  const newGuides: Guide[] = [];

  const canvasCenterX = CANVAS_WIDTH / 2;
  const canvasCenterY = CANVAS_HEIGHT / 2;

  // Snap to Canvas Center
  if (Math.abs(boxCenterX - canvasCenterX) < SNAP_THRESHOLD) {
      snapDeltaX = canvasCenterX - boxCenterX;
      newGuides.push({ type: 'vertical', position: canvasCenterX });
  }
  if (Math.abs(boxCenterY - canvasCenterY) < SNAP_THRESHOLD) {
      snapDeltaY = canvasCenterY - boxCenterY;
      newGuides.push({ type: 'horizontal', position: canvasCenterY });
  }

  // Snap to Other Elements
  otherElements.forEach(target => {
      const tCx = target.x + target.width / 2;
      const tCy = target.y + target.height / 2;

      // Vertical Snaps (X-axis)
      if (Math.abs(minX - target.x) < SNAP_THRESHOLD) { snapDeltaX = target.x - minX; newGuides.push({ type: 'vertical', position: target.x }); }
      else if (Math.abs(minX - (target.x + target.width)) < SNAP_THRESHOLD) { snapDeltaX = (target.x + target.width) - minX; newGuides.push({ type: 'vertical', position: target.x + target.width }); }
      else if (Math.abs(maxX - target.x) < SNAP_THRESHOLD) { snapDeltaX = target.x - maxX; newGuides.push({ type: 'vertical', position: target.x }); }
      else if (Math.abs(boxCenterX - tCx) < SNAP_THRESHOLD) { snapDeltaX = tCx - boxCenterX; newGuides.push({ type: 'vertical', position: tCx }); }

      // Horizontal Snaps (Y-axis)
      if (Math.abs(minY - target.y) < SNAP_THRESHOLD) { snapDeltaY = target.y - minY; newGuides.push({ type: 'horizontal', position: target.y }); }
      else if (Math.abs(minY - (target.y + target.height)) < SNAP_THRESHOLD) { snapDeltaY = (target.y + target.height) - minY; newGuides.push({ type: 'horizontal', position: target.y + target.height }); }
      else if (Math.abs(maxY - target.y) < SNAP_THRESHOLD) { snapDeltaY = target.y - maxY; newGuides.push({ type: 'horizontal', position: target.y }); }
      else if (Math.abs(boxCenterY - tCy) < SNAP_THRESHOLD) { snapDeltaY = tCy - boxCenterY; newGuides.push({ type: 'horizontal', position: tCy }); }
  });

  const newPositions: Record<string, Position> = {};
  movingElements.forEach(el => {
      const initial = initialPositions[el.id];
      if (initial) {
          newPositions[el.id] = {
              x: initial.x + deltaX + snapDeltaX,
              y: initial.y + deltaY + snapDeltaY
          };
      }
  });

  return { snapDeltaX, snapDeltaY, guides: newGuides, newPositions };
};

// --- Layer Sorting ---

export const normalizeZIndex = (els: DesignElement[]) => els.map((el, i) => ({ ...el, zIndex: i + 1 }));

export const moveLayer = (elements: DesignElement[], id: string, direction: 'forward' | 'backward' | 'front' | 'back') => {
    const index = elements.findIndex(el => el.id === id);
    if (index === -1) return elements;
    
    const newElements = [...elements];
    
    if (direction === 'forward') {
        if (index === elements.length - 1) return elements;
        [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
    } else if (direction === 'backward') {
        if (index === 0) return elements;
        [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
    } else if (direction === 'front') {
        const [removed] = newElements.splice(index, 1);
        newElements.push(removed);
    } else if (direction === 'back') {
        const [removed] = newElements.splice(index, 1);
        newElements.unshift(removed);
    }
    
    return normalizeZIndex(newElements);
};

// --- Geometry Helpers ---

export const calculateRotation = (
    centerX: number, 
    centerY: number, 
    mouseX: number, 
    mouseY: number, 
    snapToGrid: boolean = false
): number => {
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = angleRad * (180 / Math.PI);
    angleDeg += 90;
    
    if (snapToGrid) {
        angleDeg = Math.round(angleDeg / 15) * 15;
    }
    return angleDeg;
};
