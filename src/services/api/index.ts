import { IApiService } from '../../types/api';
import { MockApiService } from './mockApiService';
import { HttpApiService } from './httpApiService';

const mode = (import.meta.env.VITE_API_MODE || 'mock').toLowerCase();

export const isMockMode = mode !== 'http';

// Singleton instance used across entire application
export const apiService: IApiService = isMockMode ? new MockApiService() : new HttpApiService();

export * from '../../types/api';
export { MockApiService } from './mockApiService';
export { HttpApiService } from './httpApiService';
