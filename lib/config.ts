// Application configuration

export const config = {
  // Backend API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    timeout: 10000, // 10 seconds
  },
  
  // Development settings
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Default values
  defaults: {
    retryAttempts: 3,
    retryDelay: 1000,
  },
};

// Helper function to check if backend is accessible
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${config.api.baseUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Development helper to display configuration
export function logConfig() {
  if (config.isDevelopment) {
    console.log('🔧 API Configuration:', {
      baseUrl: config.api.baseUrl,
      environment: process.env.NODE_ENV,
      timeout: config.api.timeout,
    });
  }
}
