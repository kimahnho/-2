/**
 * Constants - 하위 호환성을 위한 re-export
 * 
 * @deprecated 새 프로젝트에서는 constants/ 디렉토리에서 import하세요:
 * import { PRESET_COLORS } from './constants/style.constants';
 * import { EMOTION_CARDS } from './constants/emotion.constants';
 * import { TEMPLATES } from './constants/template.constants';
 * 
 * 또는 통합 export:
 * import { PRESET_COLORS, EMOTION_CARDS, TEMPLATES } from './constants';
 */

// Re-export all constants for backward compatibility
export * from './constants/index';
