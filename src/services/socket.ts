
import { io, Socket } from 'socket.io-client';
import { SensorData } from '@/types';
import { toast } from "sonner";

// Using a mock socket service since the backend doesn't implement socket.io
class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private mockInterval: NodeJS.Timeout | null = null;
  private useMock = true; // Force using mock since backend doesn't have socket.io

  // Initialize socket connection or mock
  connect(): void {
    if (this.socket || this.mockInterval) return;
    
    if (this.useMock) {
      console.log('Setting up mock socket service...');
      this.setupMockSocket();
      return;
    }
    
    // This code isn't used since useMock is true, but kept for reference
    console.log('Socket service connecting to real server...');
    
    try {
      const SOCKET_URL = 'https://bright-aliza-asnaif-bfedfd0f.koyeb.app';
      this.socket = io(SOCKET_URL);
      
      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Failed to connect to real-time data source');
        
        // Fall back to mock if connection fails
        this.socket?.disconnect();
        this.socket = null;
        this.setupMockSocket();
      });
      
      this.socket.on('sensor_data', (data: SensorData) => {
        console.log('Received real-time sensor data:', data);
        const listeners = this.listeners.get('sensor_update') || [];
        listeners.forEach(callback => callback(data));
      });
    } catch (error) {
      console.error('Error initializing socket:', error);
      this.setupMockSocket();
    }
  }

  // Set up mock socket behavior
  private setupMockSocket(): void {
    console.log('Using mock socket implementation');
    
    // Clear any existing mock interval
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
    }
    
    // We won't simulate mock data since we're getting real data from the API
    // Instead, we'll just provide the socket interface without actual emulation
    
    console.log('Mock socket ready - real-time updates will come from API polling');
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
    console.log('Socket disconnected');
  }

  // Subscribe to sensor updates
  onSensorUpdate(callback: (data: SensorData) => void): () => void {
    this.addListener('sensor_update', callback);
    
    // Return unsubscribe function
    return () => {
      this.removeListener('sensor_update', callback);
    };
  }

  // Add event listener
  private addListener(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.push(callback);
    this.listeners.set(event, eventListeners);
  }

  // Remove event listener
  private removeListener(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) return;
    
    const eventListeners = this.listeners.get(event) || [];
    const index = eventListeners.indexOf(callback);
    
    if (index !== -1) {
      eventListeners.splice(index, 1);
      this.listeners.set(event, eventListeners);
    }
  }
  
  // Method to notify listeners with new data (used by external sources)
  notifyListeners(data: SensorData): void {
    const listeners = this.listeners.get('sensor_update') || [];
    listeners.forEach(callback => callback(data));
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
