/**
 * Template Constants - 템플릿 관련 상수
 * 학습지 디자인 템플릿
 * @module constants/template
 */

import { DesignElement } from '../types';

export const TEMPLATES = [
    {
        id: 't1',
        name: '감정 추론 활동',
        thumbnail: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=100&h=140&fit=crop',
        elements: [
            { type: 'text', x: 50, y: 50, width: 200, height: 40, content: 'MURU.AI', fontSize: 24, color: '#5500FF', rotation: 0 },
            { type: 'text', x: 550, y: 50, width: 200, height: 40, content: '   월    일    요일', fontSize: 20, color: '#000000', rotation: 0 },

            // Title
            { type: 'text', x: 100, y: 110, width: 600, height: 60, content: '제목을 입력하세요', fontSize: 40, color: '#000000', rotation: 0, fontFamily: "'Fredoka', sans-serif" },

            // Main Scene Box
            { type: 'shape', x: 150, y: 180, width: 500, height: 300, backgroundColor: '#C4C4C4', borderRadius: 20, rotation: 0 },

            // Question
            { type: 'text', x: 100, y: 530, width: 600, height: 50, content: '기분이 어떨까요?', fontSize: 32, color: '#000000', rotation: 0, fontFamily: "'Fredoka', sans-serif" },

            // Option Cards (Placeholders)
            { id: 't1-opt1', type: 'card', x: 130, y: 600, width: 160, height: 220, backgroundColor: '#ffffff', borderRadius: 12, borderColor: '#B0C0ff', borderWidth: 2, borderStyle: 'dashed', isEmotionPlaceholder: true, rotation: 0 },
            { id: 't1-opt1-hint', type: 'text', x: 130, y: 680, width: 160, height: 60, content: '☺\n클릭하여\n감정 선택', fontSize: 16, color: '#B0C0ff', rotation: 0, isPassThrough: true },

            { id: 't1-opt2', type: 'card', x: 320, y: 600, width: 160, height: 220, backgroundColor: '#ffffff', borderRadius: 12, borderColor: '#B0C0ff', borderWidth: 2, borderStyle: 'dashed', isEmotionPlaceholder: true, rotation: 0 },
            { id: 't1-opt2-hint', type: 'text', x: 320, y: 680, width: 160, height: 60, content: '☺\n클릭하여\n감정 선택', fontSize: 16, color: '#B0C0ff', rotation: 0, isPassThrough: true },

            { id: 't1-opt3', type: 'card', x: 510, y: 600, width: 160, height: 220, backgroundColor: '#ffffff', borderRadius: 12, borderColor: '#B0C0ff', borderWidth: 2, borderStyle: 'dashed', isEmotionPlaceholder: true, rotation: 0 },
            { id: 't1-opt3-hint', type: 'text', x: 510, y: 680, width: 160, height: 60, content: '☺\n클릭하여\n감정 선택', fontSize: 16, color: '#B0C0ff', rotation: 0, isPassThrough: true },

            // Text Labels for Options
            { type: 'text', x: 130, y: 830, width: 160, height: 40, content: '(감정)', fontSize: 24, color: '#000000', rotation: 0 },
            { type: 'text', x: 320, y: 830, width: 160, height: 40, content: '(감정)', fontSize: 24, color: '#000000', rotation: 0 },
            { type: 'text', x: 510, y: 830, width: 160, height: 40, content: '(감정)', fontSize: 24, color: '#000000', rotation: 0 },

            // Footer Sentence
            { type: 'shape', x: 200, y: 920, width: 400, height: 80, backgroundColor: '#E5E7EB', borderRadius: 40, rotation: 0 },
            { type: 'text', x: 230, y: 940, width: 100, height: 40, content: '아이는', fontSize: 32, color: '#000000', rotation: 0 },
            { type: 'line', x: 340, y: 970, width: 220, height: 4, borderColor: '#000000', borderWidth: 4, rotation: 0 },
        ] as Partial<DesignElement>[]
    },
    {
        id: 't2',
        name: '감정 워크시트 (심화)',
        thumbnail: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=100&h=140&fit=crop',
        elements: [
            { type: 'text', x: 50, y: 50, width: 200, height: 40, content: 'MURU.AI', fontSize: 24, color: '#5500FF', rotation: 0 },
            { type: 'text', x: 550, y: 50, width: 200, height: 40, content: '   월    일    요일', fontSize: 20, color: '#000000', rotation: 0 },

            // Title
            { type: 'text', x: 100, y: 110, width: 600, height: 60, content: '제목을 입력하세요', fontSize: 40, color: '#000000', rotation: 0, fontFamily: "'Fredoka', sans-serif" },

            // Scene
            { type: 'shape', x: 100, y: 200, width: 600, height: 250, backgroundColor: '#C4C4C4', borderRadius: 16, rotation: 0 },

            // Section 1
            { type: 'text', x: 100, y: 480, width: 600, height: 30, content: '1. 표정을 따라 그려보아요', fontSize: 20, color: '#000000', rotation: 0 },
            { type: 'image', x: 325, y: 520, width: 150, height: 150, content: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Smilies/Grinning%20face/3D/grinning_face_3d.png', borderRadius: 100, rotation: 0 },

            // Section 2
            { type: 'text', x: 100, y: 700, width: 600, height: 30, content: '2. 아이는 어떤 기분일까요?', fontSize: 20, color: '#000000', rotation: 0 },
            { type: 'shape', x: 100, y: 740, width: 600, height: 40, backgroundColor: '#F3E8FF', borderRadius: 8, rotation: 0 },
            { type: 'text', x: 150, y: 750, width: 50, height: 20, content: '①', fontSize: 16, color: '#000000', rotation: 0 },
            { type: 'text', x: 280, y: 750, width: 50, height: 20, content: '②', fontSize: 16, color: '#000000', rotation: 0 },
            { type: 'text', x: 410, y: 750, width: 50, height: 20, content: '③', fontSize: 16, color: '#000000', rotation: 0 },
            { type: 'text', x: 540, y: 750, width: 50, height: 20, content: '④', fontSize: 16, color: '#000000', rotation: 0 },

            // Section 3
            { type: 'text', x: 100, y: 810, width: 600, height: 30, content: '3. 내 기분은 어떨까요?', fontSize: 20, color: '#000000', rotation: 0 },
            { type: 'shape', x: 100, y: 850, width: 600, height: 40, backgroundColor: '#F3E8FF', borderRadius: 8, rotation: 0 },
            { type: 'text', x: 150, y: 860, width: 50, height: 20, content: '①', fontSize: 16, color: '#000000', rotation: 0 },
            { type: 'text', x: 280, y: 860, width: 50, height: 20, content: '②', fontSize: 16, color: '#000000', rotation: 0 },
            { type: 'text', x: 410, y: 860, width: 50, height: 20, content: '③', fontSize: 16, color: '#000000', rotation: 0 },
            { type: 'text', x: 540, y: 860, width: 50, height: 20, content: '④', fontSize: 16, color: '#000000', rotation: 0 },

            // Section 4
            { type: 'text', x: 100, y: 920, width: 600, height: 30, content: '4. 왜 그렇게 생각했나요?', fontSize: 20, color: '#000000', rotation: 0 },
            { type: 'shape', x: 100, y: 960, width: 600, height: 150, backgroundColor: '#F3E8FF', borderRadius: 16, rotation: 0 },
            { type: 'line', x: 120, y: 1000, width: 560, height: 1, borderColor: '#000000', borderWidth: 1, borderStyle: 'dashed', rotation: 0 },
            { type: 'line', x: 120, y: 1040, width: 560, height: 1, borderColor: '#000000', borderWidth: 1, borderStyle: 'dashed', rotation: 0 },
            { type: 'line', x: 120, y: 1080, width: 560, height: 1, borderColor: '#000000', borderWidth: 1, borderStyle: 'dashed', rotation: 0 },
        ] as Partial<DesignElement>[]
    }
] as const;
