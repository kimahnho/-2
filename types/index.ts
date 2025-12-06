/**
 * Types Index - 모든 타입 통합 export
 * @module types
 */

// Domain Types
export type {
    StudentProfile,
    StudentGroup,
    ScheduleItem,
    SavedProjectMetadata,
    ProjectData
} from './domain.types';

// Editor Types
export type {
    ElementType,
    TabType,
    DesignElement,
    Page,
    EmotionCard,
    CharacterProfile
} from './editor.types';

// UI Types
export type {
    Position,
    Size,
    DragInfo,
    ResizeInfo,
    RotateInfo,
    Guide
} from './ui.types';
