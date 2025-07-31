/**
 * Environment Configuration for ZiPop
 * Configure backend URLs for different development and deployment scenarios
 */

export interface EnvironmentConfig {
  backendHost: string;
  apiUrl: string;
  staticUrl: string;
  environment: 'development' | 'production' | 'staging';
}

// Development configurations
const DEVELOPMENT_CONFIGS = {
  // For simulator/web development
  localhost: {
    backendHost: 'http://localhost:3002',
    apiUrl: 'http://localhost:3002/api/v1',
    staticUrl: 'http://localhost:3002/static',
    environment: 'development' as const,
  },
  
  // For mobile device testing - your machine's IP
  deviceTesting: {
    backendHost: 'http://192.168.1.68:3002',
    apiUrl: 'http://192.168.1.68:3002/api/v1',
    staticUrl: 'http://192.168.1.68:3002/static',
    environment: 'development' as const,
  },
};

// Production configuration
const PRODUCTION_CONFIG: EnvironmentConfig = {
  backendHost: 'https://your-production-api.com',
  apiUrl: 'https://your-production-api.com/api/v1',
  staticUrl: 'https://your-production-api.com/static',
  environment: 'production',
};

// Safe process.env access for web compatibility
const getProcessEnv = (key: string): string | undefined => {
  try {
    return typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
  } catch {
    return undefined;
  }
};

// Configuration selection
const getEnvironmentConfig = (): EnvironmentConfig => {
  // Check for environment variable override (useful for CI/CD)
  const backendHostEnv = getProcessEnv('REACT_NATIVE_BACKEND_HOST');
  const nodeEnv = getProcessEnv('NODE_ENV');
  
  if (backendHostEnv) {
    return {
      backendHost: backendHostEnv,
      apiUrl: `${backendHostEnv}/api/v1`,
      staticUrl: `${backendHostEnv}/static`,
      environment: nodeEnv === 'production' ? 'production' : 'development',
    };
  }

  // Production mode
  if (nodeEnv === 'production') {
    return PRODUCTION_CONFIG;
  }

  // Development mode - choose config here:
  // Change this line to switch between localhost and device testing
  return DEVELOPMENT_CONFIGS.deviceTesting; // Using IP address for Android device access
};

export const config = getEnvironmentConfig();

// Export individual values for convenience
export const { backendHost, apiUrl, staticUrl, environment } = config;

// Helper function to get audio URL
export const getAudioUrl = (filename: string): string => {
  return `${staticUrl}/audio/${filename}`;
};

// Debug logging (only in development)
if (environment === 'development') {
  console.log('🔧 ZiPop Environment Config:', {
    backendHost,
    apiUrl,
    staticUrl,
    environment,
  });
}