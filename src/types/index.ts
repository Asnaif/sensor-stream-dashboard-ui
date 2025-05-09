
// Sensor data types
export interface SensorData {
  _id?: string;
  timestamp: Date | string;
  temperature: number;
  humidity: number;
  air_quality: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// User types
export interface User {
  id: string;
  username: string;
  name?: string;
  email?: string;
  role: 'admin' | 'user' | 'viewer';
}

// Auth types
export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Dashboard preferences
export interface ChartPreference {
  id: string;
  name: string;
  chartType: 'line' | 'bar' | 'area';
  sensors: ('temperature' | 'humidity' | 'air_quality')[];
  timeRange: 'hour' | 'day' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  thresholds?: {
    temperature?: { min: number; max: number };
    humidity?: { min: number; max: number };
    air_quality?: { min: number; max: number };
  };
  layout: {
    columns: number;
    rows: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  viewMode: 'grid' | 'list';
  chartPreferences: ChartPreference[];
  defaultChartId?: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
