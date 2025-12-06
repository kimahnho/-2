/**
 * UI Types - UI 상호작용 타입 정의
 * 위치, 크기, 드래그, 리사이즈, 회전, 스냅 가이드
 * @module types/ui
 */

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface DragInfo {
    isDragging: boolean;
    startX: number;
    startY: number;
    initialPositions: Record<string, { x: number; y: number }>;
}

export interface ResizeInfo {
    isResizing: boolean;
    handle: string; // 'nw', 'ne', 'sw', 'se'
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
    initialX: number;
    initialY: number;
}

export interface RotateInfo {
    isRotating: boolean;
    id: string;
    pageId: string;
    centerX: number;
    centerY: number;
    startAngle: number;
}

export interface Guide {
    type: 'horizontal' | 'vertical';
    position: number;
}
