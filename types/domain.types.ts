/**
 * Domain Types - 도메인 모델 정의
 * 학생, 그룹, 스케줄, 프로젝트 관련 타입
 * @module types/domain
 */

export interface StudentProfile {
    id: string;
    name: string;
    birthYear?: number;
    notes?: string;
    avatarColor?: string;
    createdAt: number;
}

export interface StudentGroup {
    id: string;
    name: string;
    studentIds: string[];
    color?: string;
    description?: string;
    createdAt: number;
}

export interface ScheduleItem {
    id: string;
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
    date?: string; // YYYY-MM-DD. If present, only shows on this date.
    time: string; // "14:00"
    subject: string;
    targetId: string; // studentId or groupId
    targetType: 'student' | 'group';
}

export interface SavedProjectMetadata {
    id: string;
    studentId?: string;
    groupId?: string;
    title: string;
    thumbnail?: string;
    previewElements?: import('./editor.types').DesignElement[]; // For live preview
    updatedAt: number;
    createdAt: number;
}

export interface ProjectData {
    elements: import('./editor.types').DesignElement[];
    pages: import('./editor.types').Page[];
}
