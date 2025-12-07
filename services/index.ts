/**
 * Services Index - 모든 서비스 통합 export
 * @module services
 */

// Individual MECE Services
export { studentService } from './studentService';
export { groupService } from './groupService';
export { scheduleService } from './scheduleService';
export { projectService } from './projectService';

// Auth Service
export { authService, type AuthUser } from './authService';

// AI Service
export { generateTherapyImage, generateCharacterEmotion, generateTherapyText } from './geminiService';

// Subscription Service
export { subscriptionService, type SubscriptionPlan, type UserSubscription, type AIUsage } from './subscriptionService';

// Storage Utilities
export { supabase, isSupabaseConfigured, STORAGE_KEYS } from './storageAdapter';

// Legacy (backward compatibility)
export { storageService } from './storageService';
