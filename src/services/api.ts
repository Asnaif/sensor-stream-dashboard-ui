import { SensorData, AuthCredentials, AuthResponse, ApiResponse } from '@/types';

const API_URL = 'https://bright-aliza-asnaif-bfedfd0f.koyeb.app';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        return { success: false, error: error.message || 'An error occurred' };
      } else {
        // Handle text responses for non-JSON errors
        const errorText = await response.text();
        return { success: false, error: errorText || `Server error: ${response.status} ${response.statusText}` };
      }
    } catch (e) {
      // If parsing fails, return the status text
      return { success: false, error: `Server error: ${response.status} ${response.statusText}` };
    }
  }
  
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return { success: true, data };
    } else if (response.headers.get('content-type')?.includes('application/octet-stream')) {
      // For binary responses like firmware files
      const blob = await response.blob();
      return { success: true, data: blob as unknown as T };
    } else {
      // For text responses
      const text = await response.text();
      return { success: true, data: text as unknown as T, message: text };
    }
  } catch (e) {
    return { success: false, error: 'Invalid response format from server' };
  }
}

// Sensor data API calls
export const sensorApi = {
  // Get latest sensor data
  getLatest: async (): Promise<ApiResponse<SensorData>> => {
    try {
      const response = await fetch(`${API_URL}/api/sensors`);
      return handleResponse<SensorData>(response);
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Get filtered sensor data by date range
  getFiltered: async (startDate: string, endDate: string): Promise<ApiResponse<SensorData[]>> => {
    try {
      const response = await fetch(`${API_URL}/api/sensors/filter?start=${startDate}&end=${endDate}`);
      return handleResponse<SensorData[]>(response);
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Get all sensor data
  getAll: async (): Promise<ApiResponse<SensorData[]>> => {
    try {
      const response = await fetch(`${API_URL}/api/sensors/all`);
      return handleResponse<SensorData[]>(response);
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Mock function to simulate posting sensor data (only for testing UI)
  mockPostData: async (data: Omit<SensorData, '_id' | 'timestamp'>): Promise<ApiResponse<SensorData>> => {
    try {
      // Simulating an API call
      const mockResponse: SensorData = {
        ...data,
        timestamp: new Date().toISOString(),
        _id: Math.random().toString(36).substring(2, 15)
      };
      
      return { success: true, data: mockResponse };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
};

// Authentication API (mocked for frontend development)
export const authApi = {
  login: async (credentials: AuthCredentials): Promise<ApiResponse<AuthResponse>> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock authentication logic
      if (credentials.username === 'admin' && credentials.password === 'password') {
        const response: AuthResponse = {
          user: {
            id: '1',
            username: 'admin',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin'
          },
          token: 'mock-jwt-token-' + Math.random().toString(36).substring(2)
        };
        
        return { success: true, data: response };
      }
      
      return { success: false, error: 'Invalid username or password' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
  
  logout: async (): Promise<ApiResponse<null>> => {
    // Clear local storage or cookies if needed
    return { success: true };
  }
};

// Firmware API
export const firmwareApi = {
  uploadFirmware: async (file: File, password: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const formData = new FormData();
      formData.append('firmware', file);
      
      const response = await fetch(`${API_URL}/api/firmware/upload`, {
        method: 'POST',
        headers: {
          'X-Firmware-Password': password
        },
        body: formData
      });
      
      // Use the improved handleResponse function
      return handleResponse<{ message: string }>(response);
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
  
  getLatestFirmware: async (): Promise<ApiResponse<Blob>> => {
    try {
      const response = await fetch(`${API_URL}/api/firmware/latest`);
      return handleResponse<Blob>(response);
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
};
