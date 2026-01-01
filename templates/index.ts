import { TemplateDefinition } from './types';
import { EMOTION_INFERENCE_TEMPLATE } from './static/emotion-inference';
import { EMOTION_WORKSHEET_TEMPLATE } from './static/emotion-worksheet';
import { VISUAL_SCHEDULE_TEMPLATE } from './static/visual-schedule';
import { FIND_OBJECT_TEMPLATE } from './static/find-object';
import { WORD_PAIR_TEMPLATE } from './static/word-pair';
import { AAC_TEMPLATE } from './aac';
import { STORY_SEQUENCE_TEMPLATE } from './story';

export const ALL_TEMPLATES: TemplateDefinition[] = [
    // Static Templates (Cognitive)
    VISUAL_SCHEDULE_TEMPLATE,
    FIND_OBJECT_TEMPLATE,
    WORD_PAIR_TEMPLATE,

    // Static Templates (Emotion)
    EMOTION_INFERENCE_TEMPLATE,
    EMOTION_WORKSHEET_TEMPLATE,

    // Dynamic Templates
    AAC_TEMPLATE,
    STORY_SEQUENCE_TEMPLATE
];

export * from './types';
export { AAC_TEMPLATE, STORY_SEQUENCE_TEMPLATE }; // Explicit export if needed
