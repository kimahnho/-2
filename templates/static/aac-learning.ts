import { TemplateDefinition } from '../types';
import { aacTemplate } from '../../components/templates/templateData';

export const AAC_LEARNING_TEMPLATE: TemplateDefinition = {
    id: 'aac-learning',
    name: '어휘 학습 카드',
    description: '이미지와 AAC 상징을 활용한 맞춤형 어휘 학습 카드 만들기',
    category: 'aac', // 'aac' or 'communication' - types.ts says 'aac'
    thumbnail: '', // Elements will be used for preview
    elements: aacTemplate.elements
};
