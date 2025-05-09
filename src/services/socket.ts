
import { io, Socket } from 'socket.io-client';
import { SensorData } from '@/types';

const SOCKET_URL = 'https://bright-aliza-asnaif-bfedfd0f.koyeb.app';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  // Initialize socket connection
  connect(): void {
    if (this.socket) return;
    
    // Currently mocked - would connect to the actual server in production
    console.log('Socket service connecting...');
    
    // Mock socket events for development (would use real socket in production)
    this.mockSocketEvents();
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

  // Mock socket events for development
  private mockSocketEvents(): void {
    console.log('Setting up mock socket events');
    
    // Generate random sensor data every few seconds
    setInterval(() => {
      const mockData: SensorData = {
        _id: Math.random().toString(36).substring(2, 15),
        timestamp: new Date().toISOString(),
        temperature: 20 + Math.random() * 10, // 20-30°C
        humidity: 40 + Math.random() * 30, // 40-70%
        air_quality: 50 + Math.random() * 150 // 50-200 (higher is worse)
      };
      
      // Emit to all listeners
      const listeners = this.listeners.get('sensor_update') || [];
      listeners.forEach(callback => callback(mockData));
    }, 5000); // Every 5 seconds
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
