// Base API client configuration
import { config } from '../config';

const API_BASE_URL = config.api.baseUrl;

export class ApiError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public success: boolean;
  public data?: any;

  constructor(
    message: string,
    statusCode: number,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = data?.isOperational ?? true;
    this.success = false;
    this.data = data;
  }

  /**
   * Create ApiError from backend response
   */
  static fromResponse(response: Response, data: any): ApiError {
    // Handle your backend's error response format
    const message = data?.message || data?.error?.message || 'An error occurred';
    const errorData = {
      ...data,
      isOperational: data?.error?.isOperational ?? data?.isOperational ?? true,
      stack: data?.error?.stack || data?.stack,
    };
    
    return new ApiError(message, response.status, errorData);
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    // In production, show generic message for server errors
    if (this.statusCode >= 500 && this.isOperational === false) {
      return 'Something went wrong! Please try again later.';
    }
    
    return this.message;
  }
}

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw ApiError.fromResponse(response, data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Handle network errors
      throw new ApiError(
        'Network error: Unable to connect to the server',
        0,
        { originalError: error }
      );
    }
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw ApiError.fromResponse(response, data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Handle network errors
      throw new ApiError(
        'Network error: Unable to connect to the server',
        0,
        { originalError: error }
      );
    }
  },

  async put<T>(endpoint: string, body: any): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw ApiError.fromResponse(response, data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Handle network errors
      throw new ApiError(
        'Network error: Unable to connect to the server',
        0,
        { originalError: error }
      );
    }
  },

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });

      const data = await response.json();

      if (!response.ok) {
        throw ApiError.fromResponse(response, data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Handle network errors
      throw new ApiError(
        'Network error: Unable to connect to the server',
        0,
        { originalError: error }
      );
    }
  },
};
