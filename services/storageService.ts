/**
 * Storage Service - 하위 호환성 유지 + 크로스 도메인 연동
 * 
 * @deprecated 개별 서비스 사용 권장:
 * - studentService (학생 관리)
 * - groupService (그룹 관리)
 * - scheduleService (스케줄 관리)
 * - projectService (프로젝트 관리)
 * 
 * @module services/storageService
 */

import { SavedProjectMetadata, ProjectData, StudentProfile, StudentGroup, ScheduleItem } from '../types';
import { studentService } from './studentService';
import { groupService } from './groupService';
import { scheduleService } from './scheduleService';
import { projectService } from './projectService';

// Re-export individual services for convenience
export { studentService } from './studentService';
export { groupService } from './groupService';
export { scheduleService } from './scheduleService';
export { projectService } from './projectService';

/**
 * @deprecated Use individual services instead
 * This unified storageService is maintained for backward compatibility.
 * It delegates to individual services while handling cross-domain operations.
 */
export const storageService = {
  // --- Student Management (delegates to studentService) ---
  getAllStudents: (): Promise<StudentProfile[]> => studentService.getAllStudents(),

  createStudent: (name: string, birthYear?: string, notes?: string): Promise<StudentProfile> =>
    studentService.createStudent(name, birthYear, notes),

  updateStudent: (id: string, updates: Partial<Omit<StudentProfile, 'id' | 'createdAt'>>): Promise<void> =>
    studentService.updateStudent(id, updates),

  /**
   * Deletes a student and handles cross-domain cleanup:
   * - Removes from all groups
   * - Deletes associated projects
   * - Deletes schedule items
   */
  deleteStudent: async (id: string): Promise<void> => {
    // 1. Delete the student
    await studentService.deleteStudent(id);

    // 2. Remove student from all groups
    await groupService.removeStudentFromAllGroups(id);

    // 3. Delete student's projects
    await projectService.deleteByStudentId(id);

    // 4. Delete student's schedule items
    await scheduleService.deleteByTargetId(id);
  },

  // --- Group Management (delegates to groupService) ---
  getAllGroups: (): Promise<StudentGroup[]> => groupService.getAllGroups(),

  createGroup: (name: string, studentIds: string[], description?: string): Promise<StudentGroup> =>
    groupService.createGroup(name, studentIds, description),

  updateGroup: (id: string, updates: Partial<Omit<StudentGroup, 'id' | 'createdAt'>>): Promise<void> =>
    groupService.updateGroup(id, updates),

  /**
   * Deletes a group and handles cross-domain cleanup:
   * - Deletes associated projects
   * - Deletes schedule items
   */
  deleteGroup: async (id: string): Promise<void> => {
    // 1. Delete the group
    await groupService.deleteGroup(id);

    // 2. Delete group's projects
    await projectService.deleteByGroupId(id);

    // 3. Delete group's schedule items
    await scheduleService.deleteByTargetId(id);
  },

  // --- Schedule Management (delegates to scheduleService) ---
  getAllScheduleItems: (): Promise<ScheduleItem[]> => scheduleService.getAllScheduleItems(),

  addScheduleItem: (item: Omit<ScheduleItem, 'id'>): Promise<ScheduleItem> =>
    scheduleService.addScheduleItem(item),

  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>): Promise<void> =>
    scheduleService.updateScheduleItem(id, updates),

  deleteScheduleItem: (id: string): Promise<void> =>
    scheduleService.deleteScheduleItem(id),

  // --- Project Management (delegates to projectService) ---
  getAllProjects: (): Promise<SavedProjectMetadata[]> => projectService.getAllProjects(),

  getProject: (id: string): Promise<ProjectData | null> => projectService.getProject(id),

  createProject: (title?: string, ownerId?: string, isGroup?: boolean): Promise<string> =>
    projectService.createProject(title, ownerId, isGroup),

  saveProject: (id: string, data: ProjectData, title?: string, thumbnail?: string, previewElements?: any[]): Promise<void> =>
    projectService.saveProject(id, data, title, thumbnail, previewElements),

  deleteProject: (id: string): Promise<void> => projectService.deleteProject(id),

  duplicateProject: (id: string, newOwnerId?: string, isGroup?: boolean): Promise<string> =>
    projectService.duplicateProject(id, newOwnerId, isGroup),
};
