
import { io, Socket } from 'socket.io-client';
import { SensorData } from '@/types';

const SOCKET_URL = 'https://bright-aliza-asnaif-bfedfd0f.koyeb.app';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  // Initialize socket connection
  connect(): void {
    if (this.socket) return;
    
    console.log('Socket service connecting to real server...');
    
    try {
      this.socket = io(SOCKET_URL);
      
      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      this.socket.on('sensor_data', (data: SensorData) => {
        console.log('Received real-time sensor data:', data);
        const listeners = this.listeners.get('sensor_update') || [];
        listeners.forEach(callback => callback(data));
      });
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }

  // Disconnect socket
  disconnect(): void {
    if (!this.socket) return;
    
    this.socket.disconnect();
    this.socket = null;
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
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
