import { DesignElement } from '../../types';
import { TemplateDefinition } from '../types';

export const FIND_OBJECT_TEMPLATE: TemplateDefinition = {
    id: 't4',
    name: '사물 찾기',
    category: 'cognitive',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=100&h=140&fit=crop',
    elements: [
        // 1. Background Shapes (Grid)
        // Row 1
        { type: 'shape', x: 100, y: 300, width: 280, height: 280, backgroundColor: '#b0c0ff', borderRadius: 20, rotation: 0 },
        { type: 'shape', x: 420, y: 300, width: 280, height: 280, backgroundColor: '#b0c0ff', borderRadius: 20, rotation: 0 },

        // Row 2
        { type: 'shape', x: 100, y: 620, width: 280, height: 280, backgroundColor: '#b0c0ff', borderRadius: 20, rotation: 0 },
        { type: 'shape', x: 420, y: 620, width: 280, height: 280, backgroundColor: '#b0c0ff', borderRadius: 20, rotation: 0 },

        // 2. Text Content
        // Title with Placeholder
        {
            type: 'text',
            x: 100,
            y: 150,
            width: 600,
            height: 80,
            content: '“○○”을 찾아봐!',
            fontSize: 60,
            color: '#000000',
            textAlign: 'center',
            rotation: 0,
            fontFamily: "'Fredoka', sans-serif"
        },
    ] as Partial<DesignElement>[] as DesignElement[]
};
