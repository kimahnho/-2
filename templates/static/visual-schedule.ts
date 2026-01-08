// @ts-ignore
import thumbnailImg from '../../src/assets/images/visual-schedule-thumb.svg';
import { DesignElement } from '../../types';
import { TemplateDefinition } from '../types';

export const VISUAL_SCHEDULE_TEMPLATE: TemplateDefinition = {
    id: 't3',
    name: '시각적 스케줄표',
    category: 'cognitive',
    thumbnail: thumbnailImg,
    elements: [
        // 1. Background Shapes & Frames
        // 테두리 프레임
        { type: 'shape', x: 50, y: 140, width: 700, height: 960, backgroundColor: '#FFFDE7', borderColor: '#555555', borderWidth: 3, borderRadius: 0, rotation: 0 },

        // 파란색 헤더 배경
        { type: 'shape', x: 50, y: 80, width: 700, height: 60, backgroundColor: '#A8D4F0', borderRadius: 0, rotation: 0 },

        // 열 헤더 배경
        { type: 'shape', x: 60, y: 150, width: 80, height: 50, backgroundColor: '#E0E0E0', borderRadius: 0, rotation: 0 },
        { type: 'shape', x: 150, y: 150, width: 310, height: 50, backgroundColor: '#90CAF9', borderRadius: 0, rotation: 0 },
        { type: 'shape', x: 470, y: 150, width: 270, height: 50, backgroundColor: '#A5D6A7', borderRadius: 0, rotation: 0 },

        // Row Backgrounds
        // Row 1
        { type: 'shape', x: 60, y: 210, width: 80, height: 210, backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', borderWidth: 1, borderRadius: 4, rotation: 0 },
        { type: 'shape', x: 150, y: 210, width: 310, height: 210, backgroundColor: '#BBDEFB', borderRadius: 8, rotation: 0 },
        { type: 'shape', x: 470, y: 210, width: 270, height: 210, backgroundColor: '#C8E6C9', borderRadius: 8, rotation: 0 },
        // Row 2
        { type: 'shape', x: 60, y: 430, width: 80, height: 210, backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', borderWidth: 1, borderRadius: 4, rotation: 0 },
        { type: 'shape', x: 150, y: 430, width: 310, height: 210, backgroundColor: '#BBDEFB', borderRadius: 8, rotation: 0 },
        { type: 'shape', x: 470, y: 430, width: 270, height: 210, backgroundColor: '#C8E6C9', borderRadius: 8, rotation: 0 },
        // Row 3
        { type: 'shape', x: 60, y: 650, width: 80, height: 210, backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', borderWidth: 1, borderRadius: 4, rotation: 0 },
        { type: 'shape', x: 150, y: 650, width: 310, height: 210, backgroundColor: '#BBDEFB', borderRadius: 8, rotation: 0 },
        { type: 'shape', x: 470, y: 650, width: 270, height: 210, backgroundColor: '#C8E6C9', borderRadius: 8, rotation: 0 },
        // Row 4
        { type: 'shape', x: 60, y: 870, width: 80, height: 210, backgroundColor: '#FFFFFF', borderColor: '#CCCCCC', borderWidth: 1, borderRadius: 4, rotation: 0 },
        { type: 'shape', x: 150, y: 870, width: 310, height: 210, backgroundColor: '#BBDEFB', borderRadius: 8, rotation: 0 },
        { type: 'shape', x: 470, y: 870, width: 270, height: 210, backgroundColor: '#C8E6C9', borderRadius: 8, rotation: 0 },

        // 2. Text Content (Always on top)
        // MURU.AI 로고
        { type: 'text', x: 50, y: 30, width: 200, height: 40, content: 'MURU.AI', fontSize: 24, color: '#5500FF', rotation: 0 },

        // 헤더 텍스트
        { type: 'text', x: 50, y: 90, width: 700, height: 40, content: '오늘의 수업', fontSize: 32, color: '#1a365d', rotation: 0, fontWeight: 700 },

        // 열 헤더 텍스트
        { type: 'text', x: 60, y: 160, width: 80, height: 30, content: '순서', fontSize: 18, color: '#333333', rotation: 0, fontWeight: 700 },
        { type: 'text', x: 150, y: 160, width: 310, height: 30, content: '할 일', fontSize: 20, color: '#333333', rotation: 0, fontWeight: 700 },
        { type: 'text', x: 470, y: 160, width: 270, height: 30, content: '끝!', fontSize: 20, color: '#333333', rotation: 0, fontWeight: 700 },

        // Row Numbers
        { type: 'text', x: 60, y: 300, width: 80, height: 40, content: '1', fontSize: 36, color: '#333333', rotation: 0, fontWeight: 700 },
        { type: 'text', x: 60, y: 520, width: 80, height: 40, content: '2', fontSize: 36, color: '#333333', rotation: 0, fontWeight: 700 },
        { type: 'text', x: 60, y: 740, width: 80, height: 40, content: '3', fontSize: 36, color: '#333333', rotation: 0, fontWeight: 700 },
        { type: 'text', x: 60, y: 960, width: 80, height: 40, content: '4', fontSize: 36, color: '#333333', rotation: 0, fontWeight: 700 },
    ] as Partial<DesignElement>[] as DesignElement[]
};
