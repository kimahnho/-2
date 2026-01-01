import { TemplateDefinition } from '../types';
import { AACConfigModal } from './AACConfigModal';

export const AAC_TEMPLATE: TemplateDefinition = {
    id: 'aac-config',
    name: 'AAC 의사소통 판',
    description: '1~8 그리드, 가로/세로 방향 설정',
    category: 'aac',
    thumbnail: 'https://images.unsplash.com/photo-1596464716127-f9a86255b619?w=100&h=140&fit=crop', // Use a generic thumb?
    isDynamic: true,
    ConfigComponent: AACConfigModal
};
