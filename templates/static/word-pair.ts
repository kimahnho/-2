import { DesignElement } from '../../types';
import { TemplateDefinition } from '../types';

const generateGridRow = (startY: number, rowIndex: number) => {
    const cols = [50, 290, 530]; // Grid X positions
    return cols.flatMap((x, colIndex) => [
        // Text (Top)
        {
            type: 'text',
            x,
            y: startY + 15,
            width: 220,
            height: 40,
            content: '단어 입력',
            fontSize: 24,
            textAlign: 'center',
            fontFamily: "'Gowun Dodum', sans-serif",
            color: '#000000',
            zIndex: 2
        } as Partial<DesignElement>,
        // Image Placeholder (Middle) - Using gray rect as placeholder for now
        {
            type: 'shape',
            x: x + 35,
            y: startY + 60,
            width: 150,
            height: 110,
            backgroundColor: '#F0F0F0', // Placeholder gray
            borderRadius: 4,
            rotation: 0,
            zIndex: 2
        } as Partial<DesignElement>,
        // Writing Line (Bottom)
        {
            type: 'line',
            x: x + 20,
            y: startY + 180,
            width: 180,
            height: 2,
            color: '#000000',
            rotation: 0,
            zIndex: 2
        } as Partial<DesignElement>
    ]);
};

export const WORD_PAIR_TEMPLATE: TemplateDefinition = {
    id: 't5',
    name: '낱말 짝꿍 (단어+그림)',
    category: 'cognitive',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=100&h=140&fit=crop', // Placeholder thumb
    elements: [
        // Header Background
        {
            type: 'shape',
            x: 0,
            y: 0,
            width: 800,
            height: 100,
            backgroundColor: '#90CAF9', // Light Blue
            borderRadius: 0,
            rotation: 0
        },
        // Header Title
        {
            type: 'text',
            x: 0,
            y: 25,
            width: 800,
            height: 50,
            content: '제목',
            fontSize: 40,
            color: '#FFFFFF',
            textAlign: 'center',
            fontFamily: "'Fredoka', sans-serif",
            fontWeight: 700
        },
        // Subtitle
        {
            type: 'text',
            x: 0,
            y: 110,
            width: 800,
            height: 40,
            content: '낱말 짝꿍을 비교해요.',
            fontSize: 24,
            color: '#000000',
            textAlign: 'center',
            fontFamily: "'Gowun Dodum', sans-serif"
        },
        // Grid Generation (3 Cols x 4 Rows)
        // Row 1
        ...generateGridRow(160, 0),
        ...generateGridRow(380, 1),
        ...generateGridRow(600, 2),
        ...generateGridRow(820, 3)
    ] as Partial<DesignElement>[] as DesignElement[]
};
