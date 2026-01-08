// @ts-ignore
import thumbnailImg from '../../src/assets/images/emotion-inference-thumb.svg';
import { DesignElement } from '../../types';
import { TemplateDefinition } from '../types';

export const EMOTION_INFERENCE_TEMPLATE: TemplateDefinition = {
    id: 't1',
    name: '감정 추론 활동',
    thumbnail: thumbnailImg,
    category: 'emotion',
    elements: [
        // 1. Background Shapes
        // Main Scene Box
        { type: 'shape', x: 150, y: 180, width: 500, height: 300, backgroundColor: '#C4C4C4', borderRadius: 20, rotation: 0 },

        // Footer Box
        { type: 'shape', x: 200, y: 920, width: 400, height: 80, backgroundColor: '#E5E7EB', borderRadius: 40, rotation: 0 },

        // Option Cards (Shapes/Placeholders)
        { id: 't1-opt1', type: 'card', x: 130, y: 600, width: 160, height: 220, backgroundColor: '#ffffff', borderRadius: 12, borderColor: '#B0C0ff', borderWidth: 2, borderStyle: 'dashed', isEmotionPlaceholder: true, rotation: 0 },
        { id: 't1-opt2', type: 'card', x: 320, y: 600, width: 160, height: 220, backgroundColor: '#ffffff', borderRadius: 12, borderColor: '#B0C0ff', borderWidth: 2, borderStyle: 'dashed', isEmotionPlaceholder: true, rotation: 0 },
        { id: 't1-opt3', type: 'card', x: 510, y: 600, width: 160, height: 220, backgroundColor: '#ffffff', borderRadius: 12, borderColor: '#B0C0ff', borderWidth: 2, borderStyle: 'dashed', isEmotionPlaceholder: true, rotation: 0 },

        // Footer Line
        { type: 'line', x: 340, y: 970, width: 220, height: 4, borderColor: '#000000', borderWidth: 4, rotation: 0 },

        // 2. Text Content (On Top)
        { type: 'text', x: 50, y: 50, width: 200, height: 40, content: 'MURU.AI', fontSize: 24, color: '#5500FF', rotation: 0 },
        { type: 'text', x: 550, y: 50, width: 200, height: 40, content: '   월    일    요일', fontSize: 20, color: '#000000', rotation: 0 },

        // Title
        { type: 'text', x: 100, y: 110, width: 600, height: 60, content: '제목을 입력하세요', fontSize: 40, color: '#000000', rotation: 0, fontFamily: "'Fredoka', sans-serif" },

        // Question
        { type: 'text', x: 100, y: 530, width: 600, height: 50, content: '기분이 어떨까요?', fontSize: 32, color: '#000000', rotation: 0, fontFamily: "'Fredoka', sans-serif" },

        // Option Hints
        { id: 't1-opt1-hint', type: 'text', x: 130, y: 680, width: 160, height: 60, content: '☺\n클릭하여\n감정 선택', fontSize: 16, color: '#B0C0ff', rotation: 0, isPassThrough: true },
        { id: 't1-opt2-hint', type: 'text', x: 320, y: 680, width: 160, height: 60, content: '☺\n클릭하여\n감정 선택', fontSize: 16, color: '#B0C0ff', rotation: 0, isPassThrough: true },
        { id: 't1-opt3-hint', type: 'text', x: 510, y: 680, width: 160, height: 60, content: '☺\n클릭하여\n감정 선택', fontSize: 16, color: '#B0C0ff', rotation: 0, isPassThrough: true },

        // Text Labels for Options
        { type: 'text', x: 130, y: 830, width: 160, height: 40, content: '(감정)', fontSize: 24, color: '#000000', rotation: 0 },
        { type: 'text', x: 320, y: 830, width: 160, height: 40, content: '(감정)', fontSize: 24, color: '#000000', rotation: 0 },
        { type: 'text', x: 510, y: 830, width: 160, height: 40, content: '(감정)', fontSize: 24, color: '#000000', rotation: 0 },

        // Footer Text
        { type: 'text', x: 230, y: 940, width: 100, height: 40, content: '아이는', fontSize: 32, color: '#000000', rotation: 0 },
    ] as Partial<DesignElement>[] as DesignElement[]
};
