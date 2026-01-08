import { ProjectData, DesignElement } from '../../types';

export const aacTemplate: ProjectData = {
    pages: [
        {
            id: 'page-1',
            orientation: 'portrait',
            width: 794, // A4 pixel width (approx) @ 96dpi
            height: 1123, // A4 pixel height
            background: '#ffffff',
            elements: []
        }
    ],
    elements: [
        // Title
        {
            id: 'title',
            type: 'text',
            x: 0, // Center aligned later
            y: 80,
            width: 794,
            height: 60,
            rotation: 0,
            content: '어휘 학습 카드 제작 템플릿',
            richTextHtml: '<div style="text-align: center;"><span style="font-size: 36px; font-weight: bold; font-family: Pretendard, sans-serif;">어휘 학습 카드 제작 템플릿</span></div>',
            fontSize: 36,
            fontWeight: 700,
            textAlign: 'center',
            color: '#000000',
            zIndex: 1,
            pageId: 'page-1'
        },
        // Card 1: Placeholder (Top Left)
        {
            id: 'card-1',
            type: 'card',
            x: 100,
            y: 200,
            width: 280,
            height: 380,
            rotation: 0,
            zIndex: 2,
            pageId: 'page-1',
            backgroundColor: '#ffffff',
            borderColor: '#000000',
            borderWidth: 1,
            borderRadius: 0, // 이미지처럼 직각에 가까움
            metadata: {
                isAACCard: true,
                aacData: {
                    emoji: '',
                    label: '목표 어휘',
                    isFilled: false,
                    isPlaceholder: true, // Placeholder Mode
                    labelPosition: 'below',
                    symbolScale: 0.6,
                    fontSize: 24
                }
            }
        },
        // Card 2: Filled Example 1 - 기쁘다 (Top Right)
        {
            id: 'card-2',
            type: 'card',
            x: 414,
            y: 200,
            width: 280,
            height: 380,
            rotation: 0,
            zIndex: 2,
            pageId: 'page-1',
            backgroundColor: '#ffffff',
            borderColor: '#000000',
            borderWidth: 1,
            borderRadius: 0,
            metadata: {
                isAACCard: true,
                aacData: {
                    emoji: 'https://res.cloudinary.com/dheikvmsp/image/upload/v1733221971/muru-assets/aac/emotion/happy.png', // 기쁨 (예시)
                    label: '기쁘다',
                    isFilled: true,
                    labelPosition: 'below',
                    symbolScale: 0.7,
                    fontSize: 24
                }
            }
        },
        // Card 3: Filled Example 2 - 화나다 (Bottom Left)
        {
            id: 'card-3',
            type: 'card',
            x: 100,
            y: 600,
            width: 280,
            height: 380,
            rotation: 0,
            zIndex: 2,
            pageId: 'page-1',
            backgroundColor: '#ffffff',
            borderColor: '#000000',
            borderWidth: 1,
            borderRadius: 0,
            metadata: {
                isAACCard: true,
                aacData: {
                    emoji: 'https://res.cloudinary.com/dheikvmsp/image/upload/v1733221966/muru-assets/aac/emotion/angry.png', // 화남 (예시)
                    label: '화나다',
                    isFilled: true,
                    labelPosition: 'below',
                    symbolScale: 0.7,
                    fontSize: 24
                }
            }
        },
        // Card 4: Placeholder (Bottom Right)
        {
            id: 'card-4',
            type: 'card',
            x: 414,
            y: 600,
            width: 280,
            height: 380,
            rotation: 0,
            zIndex: 2,
            pageId: 'page-1',
            backgroundColor: '#ffffff',
            borderColor: '#000000',
            borderWidth: 1,
            borderRadius: 0,
            metadata: {
                isAACCard: true,
                aacData: {
                    emoji: '',
                    label: '목표 어휘',
                    isFilled: false,
                    isPlaceholder: true,
                    labelPosition: 'below',
                    symbolScale: 0.6,
                    fontSize: 24
                }
            }
        }
    ]
};
