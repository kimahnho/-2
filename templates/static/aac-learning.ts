import { TemplateDefinition } from '../types';
import { aacTemplate } from '../../components/templates/templateData';
import thumbnailImg from '../../assets/images/aac-template-thumb.png';

export const AAC_LEARNING_TEMPLATE: TemplateDefinition = {
    id: 'aac-learning',
    name: '어휘 학습 카드',
    description: '이미지와 AAC 상징을 활용한 맞춤형 어휘 학습 카드 만들기',
    category: 'aac',
    thumbnail: thumbnailImg,
    elements: aacTemplate.elements
};
