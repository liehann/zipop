/**
 * API Service for ZiPop Backend
 * Handles all HTTP requests to the backend API
 */

import { LessonData, Category, Level, DataIndex } from '../data/types';

// Backend configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3002/api/v1'  // Development
  : 'https://your-production-api.com/api/v1';  // Production

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query interface for content filtering
interface ContentQuery {
  category?: string;
  level?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Generic HTTP request handler
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Content endpoints
  async getAllContent(query?: ContentQuery): Promise<PaginatedResponse<LessonData>> {
    const searchParams = new URLSearchParams();
    
    if (query?.category) searchParams.set('category', query.category);
    if (query?.level) searchParams.set('level', query.level);
    if (query?.featured !== undefined) searchParams.set('featured', query.featured.toString());
    if (query?.search) searchParams.set('search', query.search);
    if (query?.page) searchParams.set('page', query.page.toString());
    if (query?.limit) searchParams.set('limit', query.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/content${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<LessonData>>(endpoint);
  }

  async getContentById(id: string): Promise<ApiResponse<LessonData>> {
    return this.request<ApiResponse<LessonData>>(`/content/${id}`);
  }

  async getFeaturedContent(): Promise<ApiResponse<LessonData[]>> {
    return this.request<ApiResponse<LessonData[]>>('/content/featured');
  }

  async getContentByCategory(category: string): Promise<ApiResponse<LessonData[]>> {
    return this.request<ApiResponse<LessonData[]>>(`/content/category/${category}`);
  }

  async getContentByLevel(level: string): Promise<ApiResponse<LessonData[]>> {
    return this.request<ApiResponse<LessonData[]>>(`/content/level/${level}`);
  }

  // Metadata endpoints
  async getCategories(): Promise<ApiResponse<Array<Category & { count: number }>>> {
    return this.request<ApiResponse<Array<Category & { count: number }>>>('/categories');
  }

  async getLevels(): Promise<ApiResponse<Array<Level & { count: number }>>> {
    return this.request<ApiResponse<Array<Level & { count: number }>>>('/levels');
  }

  async getDataIndex(): Promise<ApiResponse<DataIndex>> {
    return this.request<ApiResponse<DataIndex>>('/index');
  }

  // Audio endpoints
  async getAudioInfo(contentId: string): Promise<ApiResponse<{
    lessonId: string;
    filename: string;
    url: string;
    duration?: number;
    hasTimings: boolean;
  }>> {
    return this.request<ApiResponse<any>>(`/audio/${contentId}/info`);
  }

  // Get audio URL for streaming
  getAudioUrl(contentId: string): string {
    return `${this.baseUrl}/audio/${contentId}`;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; database: string }> {
    const healthUrl = this.baseUrl.replace('/api/v1', '/health');
    return this.request<{ status: string; database: string }>('', {
      ...{},
      // Override the base URL for health check
    });
  }

  // Search content
  async searchContent(query: string, filters?: Omit<ContentQuery, 'search'>): Promise<PaginatedResponse<LessonData>> {
    return this.getAllContent({ ...filters, search: query });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;