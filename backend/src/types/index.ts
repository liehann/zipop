// Re-export types from the native app for consistency
export * from '../../../native/data/types';
export * from '../../../native/types';

// Additional backend-specific types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LessonQuery {
  category?: string;
  level?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AudioInfo {
  lessonId: string;
  filename: string;
  url: string;
  duration?: number;
  hasTimings: boolean;
}