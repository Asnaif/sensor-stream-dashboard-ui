
import { SensorData, AuthCredentials, AuthResponse, ApiResponse } from '@/types';

const API_URL = 'https://bright-aliza-asnaif-bfedfd0f.koyeb.app';

// Helper function to handle API responses with improved error handling
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    if (!response.ok) {
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          return { success: false, error: error.message || error.error || 'An error occurred' };
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
      
      // For empty responses, return success with null data
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return { success: true, data: null as unknown as T, message: 'No content' };
      }
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        // Validate sensor data when appropriate
        if (Array.isArray(data) && data.length > 0 && 'temperature' in data[0]) {
          console.log('Validating sensor data array:', data.length, 'items');
          // Basic validation for sensor data array
          const validData = data.filter(item => 
            typeof item.temperature === 'number' && 
            typeof item.humidity === 'number' && 
            typeof item.air_quality === 'number'
          );
          
          if (validData.length < data.length) {
            console.warn(`Filtered out ${data.length - validData.length} invalid sensor records`);
          }
          
          return { success: true, data: validData as unknown as T };
        } else if (!Array.isArray(data) && 'temperature' in data) {
          // Validate single sensor data object
          console.log('Validating single sensor data object');
          if (
            typeof data.temperature !== 'number' || 
            typeof data.humidity !== 'number' || 
            typeof data.air_quality !== 'number'
          ) {
            console.warn('Invalid sensor data received:', data);
            return { success: false, error: 'Invalid sensor data format' };
          }
        }
        
        return { success: true, data };
      } else if (contentType && contentType.includes('application/octet-stream')) {
        // For binary responses like firmware files
        const blob = await response.blob();
        return { success: true, data: blob as unknown as T };
      } else {
        // For text responses
        const text = await response.text();
        if (text) {
          try {
            // Try to parse as JSON in case content-type header is incorrect
            const jsonData = JSON.parse(text);
            return { success: true, data: jsonData as T };
          } catch {
            // If not valid JSON, return as text
            return { success: true, data: text as unknown as T, message: text };
          }
        }
        return { success: true, data: null as unknown as T };
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      return { success: false, error: 'Invalid response format from server' };
    }
  } catch (e) {
    console.error('Network error:', e);
    return { success: false, error: 'Network error occurred. Please check your connection.' };
  }
}

// Sensor data API calls
export const sensorApi = {
  // Get latest sensor data - using the correct endpoint for real-time data
  getLatest: async (): Promise<ApiResponse<SensorData>> => {
    try {
      console.log('Fetching latest sensor data from API');
      const response = await fetch(`${API_URL}/api/sensors`, {
        // Add cache-busting parameter to prevent caching
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('Latest sensor data response status:', response.status);
      return handleResponse<SensorData>(response);
    } catch (error) {
      console.error('Error fetching latest sensor data:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Get filtered sensor data by date range
  getFiltered: async (startDate: string, endDate: string): Promise<ApiResponse<SensorData[]>> => {
    try {
      console.log(`Fetching filtered sensor data from ${startDate} to ${endDate}`);
      const response = await fetch(`${API_URL}/api/sensors/filter?start=${startDate}&end=${endDate}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('Filtered sensor data response status:', response.status);
      return handleResponse<SensorData[]>(response);
    } catch (error) {
      console.error('Error fetching filtered sensor data:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Get all sensor data - using the correct endpoint for historical data
  getAll: async (): Promise<ApiResponse<SensorData[]>> => {
    try {
      console.log('Fetching all sensor data from API');
      const response = await fetch(`${API_URL}/api/sensors/all`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('All sensor data response status:', response.status);
      return handleResponse<SensorData[]>(response);
    } catch (error) {
      console.error('Error fetching all sensor data:', error);
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
      
      console.log('Uploading firmware file:', file.name, file.size);
      
      // Fix the endpoint URL - change from '/firmware/upload' to '/api/firmware/upload'
      const response = await fetch(`${API_URL}/api/firmware/upload`, {
        method: 'POST',
        headers: {
          'X-Firmware-Password': password
        },
        body: formData
      });
      
      console.log('Upload response status:', response.status, response.statusText);
      
      // Use the improved handleResponse function
      const result = await handleResponse<{ message: string }>(response);
      console.log('Parsed upload response:', result);
      return result;
    } catch (error) {
      console.error('Firmware upload error:', error);
      return { success: false, error: (error as Error).message };
    }
  },
  
  getLatestFirmware: async (): Promise<ApiResponse<Blob>> => {
    try {
      // Also update this endpoint to be consistent
      const response = await fetch(`${API_URL}/api/firmware/latest`);
      return handleResponse<Blob>(response);
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
};
