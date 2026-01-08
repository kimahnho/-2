// @ts-ignore
import thumbnailImg from '../../src/assets/images/emotion-worksheet-thumb.svg';
import { DesignElement } from '../../types';
import { TemplateDefinition } from '../types';

export const EMOTION_WORKSHEET_TEMPLATE: TemplateDefinition = {
    id: 't2',
    name: '감정 워크시트 (심화)',
    thumbnail: thumbnailImg,
    category: 'emotion',
    elements: [
        // 1. Background Shapes
        // Main Scene
        { type: 'shape', x: 100, y: 200, width: 600, height: 250, backgroundColor: '#C4C4C4', borderRadius: 16, rotation: 0 },

        // Section 2 Input Box
        { type: 'shape', x: 100, y: 740, width: 600, height: 40, backgroundColor: '#F3E8FF', borderRadius: 8, rotation: 0 },

        // Section 3 Input Box
        { type: 'shape', x: 100, y: 850, width: 600, height: 40, backgroundColor: '#F3E8FF', borderRadius: 8, rotation: 0 },

        // Section 4 Input Box
        { type: 'shape', x: 100, y: 960, width: 600, height: 150, backgroundColor: '#F3E8FF', borderRadius: 16, rotation: 0 },

        // Lines (Section 4)
        { type: 'line', x: 120, y: 1000, width: 560, height: 1, borderColor: '#000000', borderWidth: 1, borderStyle: 'dashed', rotation: 0 },
        { type: 'line', x: 120, y: 1040, width: 560, height: 1, borderColor: '#000000', borderWidth: 1, borderStyle: 'dashed', rotation: 0 },
        { type: 'line', x: 120, y: 1080, width: 560, height: 1, borderColor: '#000000', borderWidth: 1, borderStyle: 'dashed', rotation: 0 },

        // 2. Content Elements (Text & Images)
        { type: 'text', x: 50, y: 50, width: 200, height: 40, content: 'MURU.AI', fontSize: 24, color: '#5500FF', rotation: 0 },
        { type: 'text', x: 550, y: 50, width: 200, height: 40, content: '   월    일    요일', fontSize: 20, color: '#000000', rotation: 0 },

        // Title
        { type: 'text', x: 100, y: 110, width: 600, height: 60, content: '제목을 입력하세요', fontSize: 40, color: '#000000', rotation: 0, fontFamily: "'Fredoka', sans-serif" },

        // Section 1
        { type: 'text', x: 100, y: 480, width: 600, height: 30, content: '1. 표정을 따라 그려보아요', fontSize: 20, color: '#000000', rotation: 0 },
        { type: 'image', x: 325, y: 520, width: 150, height: 150, content: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Smilies/Grinning%20face/3D/grinning_face_3d.png', borderRadius: 100, rotation: 0 },

        // Section 2
        { type: 'text', x: 100, y: 700, width: 600, height: 30, content: '2. 아이는 어떤 기분일까요?', fontSize: 20, color: '#000000', rotation: 0 },
        { type: 'text', x: 150, y: 750, width: 50, height: 20, content: '①', fontSize: 16, color: '#000000', rotation: 0 },
        { type: 'text', x: 280, y: 750, width: 50, height: 20, content: '②', fontSize: 16, color: '#000000', rotation: 0 },
        { type: 'text', x: 410, y: 750, width: 50, height: 20, content: '③', fontSize: 16, color: '#000000', rotation: 0 },
        { type: 'text', x: 540, y: 750, width: 50, height: 20, content: '④', fontSize: 16, color: '#000000', rotation: 0 },

        // Section 3
        { type: 'text', x: 100, y: 810, width: 600, height: 30, content: '3. 내 기분은 어떨까요?', fontSize: 20, color: '#000000', rotation: 0 },
        { type: 'text', x: 150, y: 860, width: 50, height: 20, content: '①', fontSize: 16, color: '#000000', rotation: 0 },
        { type: 'text', x: 280, y: 860, width: 50, height: 20, content: '②', fontSize: 16, color: '#000000', rotation: 0 },
        { type: 'text', x: 410, y: 860, width: 50, height: 20, content: '③', fontSize: 16, color: '#000000', rotation: 0 },
        { type: 'text', x: 540, y: 860, width: 50, height: 20, content: '④', fontSize: 16, color: '#000000', rotation: 0 },

        // Section 4 Title
        { type: 'text', x: 100, y: 920, width: 600, height: 30, content: '4. 왜 그렇게 생각했나요?', fontSize: 20, color: '#000000', rotation: 0 },
    ] as Partial<DesignElement>[] as DesignElement[]
};
