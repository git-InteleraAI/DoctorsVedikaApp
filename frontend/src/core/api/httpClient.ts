/**
 * frontend/src/core/api/httpClient.ts
 * Enterprise HTTP Client for routing frontend API calls through Express API Gateway.
 */
import { API_CONFIG } from '../config/api';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = API_CONFIG.baseUrl;
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    ...API_CONFIG.headers,
    ...(options.headers || {}),
  };

  // Standard 15-second connection timeout for network requests & DB calls
  const controller = new AbortController();
  const timeoutMs = API_CONFIG.timeout || 15000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await response.json();

    if (!response.ok || json.success === false) {
      throw new ApiError(
        json.message || `API Error (${response.status}): Could not connect to backend server.`,
        response.status
      );
    }

    return json.data !== undefined ? json.data : json;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new ApiError(`Backend Connection Timeout (${baseUrl}). Please verify Node.js backend server is running on port 5000.`, 504);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error.message || `Cannot reach Backend API Server (${baseUrl}). Make sure your Node.js backend is running.`,
      503
    );
  }
}
