/**
 * Types - 하위 호환성을 위한 re-export
 * 
 * @deprecated 새 프로젝트에서는 types/ 디렉토리에서 import하세요:
 * import { StudentProfile } from './types/domain.types';
 * import { DesignElement } from './types/editor.types';
 * import { Position } from './types/ui.types';
 * 
 * 또는 통합 export:
 * import { StudentProfile, DesignElement, Position } from './types';
 */

// Re-export all types for backward compatibility
export * from './types/index';
