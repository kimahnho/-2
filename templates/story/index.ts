import { TemplateDefinition } from '../types';
import { StorySequenceConfigModal } from './StorySequenceConfigModal';

export const STORY_SEQUENCE_TEMPLATE: TemplateDefinition = {
    id: 'story-sequence',
    name: '이야기 장면 순서 맞추기',
    description: '2~8개 카드, 순서 화살표 자동 생성',
    category: 'cognitive',
    thumbnail: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=100&h=140&fit=crop', // Generic thumb
    isDynamic: true,
    ConfigComponent: StorySequenceConfigModal
};
