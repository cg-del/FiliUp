// Polyfill for sockjs-client global variable issue
if (typeof global === 'undefined') {
  (window as unknown as { global: typeof globalThis }).global = globalThis;
}

import { Client, StompSubscription } from '@stomp/stompjs';
import type { PendingEnrollment } from './enrollmentService';

export interface EnrollmentWebSocketMessage {
  type: 'NEW_ENROLLMENT' | 'ENROLLMENT_ACCEPTED' | 'ENROLLMENT_REJECTED';
  classId: string;
  classCode: string;
  className?: string;
  enrollment?: PendingEnrollment;
  message: string;
}

export type EnrollmentWebSocketHandler = (message: EnrollmentWebSocketMessage) => void;

class EnrollmentWebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private messageHandlers: Set<EnrollmentWebSocketHandler> = new Set();
  private userId: string | null = null;
  private userRole: string | null = null;

  constructor() {
    // We'll initialize the client in the connect method to include auth headers
    this.client = null;
  }

  private initializeClient(): void {
    // Get the auth token
    const token = localStorage.getItem('accessToken') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    // Use native WebSocket without token in URL for better security
    const wsUrl = `ws://localhost:8080/ws`;
    
    console.log('Initializing enrollment WebSocket connection to:', wsUrl);

    // Initialize the STOMP client with native WebSocket
    this.client = new Client({
      webSocketFactory: () => {
        console.log('Creating enrollment WebSocket connection...');
        return new WebSocket(wsUrl);
      },
      connectHeaders: {
        'Authorization': `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('Enrollment STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('Connected to enrollment WebSocket:', frame);
      this.isConnected = true;
      this.setupEnrollmentSubscription();
    };

    this.client.onDisconnect = (frame) => {
      console.log('Disconnected from enrollment WebSocket:', frame);
      this.isConnected = false;
    };

    this.client.onStompError = (frame) => {
      console.error('Enrollment STOMP Error:', frame);
      console.error('STOMP Error Headers:', frame.headers);
      console.error('STOMP Error Body:', frame.body);
      
      // If it's an auth error, clear tokens and possibly redirect
      if (frame.headers.message?.toLowerCase().includes('unauthorized') || 
          frame.headers.message?.toLowerCase().includes('forbidden')) {
        console.error('Enrollment WebSocket authentication failed');
      }
    };

    this.client.onWebSocketError = (error) => {
      console.error('Enrollment WebSocket Error:', error);
    };

    this.client.onWebSocketClose = (closeEvent) => {
      console.log('Enrollment WebSocket closed:', closeEvent);
      console.log('Close code:', closeEvent.code, 'Close reason:', closeEvent.reason);
      this.isConnected = false;
    };
  }

  connect(userId: string, userRole: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userId = userId;
      this.userRole = userRole;

      try {
        // Initialize client with current auth token
        this.initializeClient();
      } catch (error) {
        console.error('Failed to initialize enrollment WebSocket client:', error);
        reject(error);
        return;
      }

      if (!this.client) {
        reject(new Error('Enrollment WebSocket client not initialized'));
        return;
      }

      if (this.isConnected) {
        resolve();
        return;
      }

      // Set up a timeout for the connection attempt
      const connectionTimeout = setTimeout(() => {
        console.error('Enrollment WebSocket connection timeout');
        reject(new Error('Enrollment WebSocket connection timeout'));
      }, 10000); // 10 second timeout

      const originalOnConnect = this.client.onConnect;
      this.client.onConnect = (frame) => {
        clearTimeout(connectionTimeout);
        originalOnConnect(frame);
        console.log('Enrollment WebSocket connection successful');
        resolve();
      };

      const originalOnStompError = this.client.onStompError;
      this.client.onStompError = (frame) => {
        clearTimeout(connectionTimeout);
        originalOnStompError(frame);
        console.error('Enrollment STOMP error during connection:', frame.headers);
        reject(new Error(`Enrollment WebSocket connection failed: ${frame.headers.message || 'Unknown STOMP error'}`));
      };

      const originalOnWebSocketError = this.client.onWebSocketError;
      this.client.onWebSocketError = (error) => {
        clearTimeout(connectionTimeout);
        originalOnWebSocketError?.(error);
        console.error('Enrollment WebSocket error during connection:', error);
        reject(new Error(`Enrollment WebSocket connection error: ${error}`));
      };

      try {
        console.log('Activating enrollment WebSocket client...');
        this.client.activate();
      } catch (error) {
        clearTimeout(connectionTimeout);
        console.error('Failed to activate enrollment WebSocket client:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.client && this.isConnected) {
      // Clean up subscriptions
      this.subscriptions.forEach((subscription: StompSubscription) => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.warn('Failed to unsubscribe from enrollment:', error);
        }
      });
      this.subscriptions.clear();

      try {
        this.client.deactivate();
      } catch (error) {
        console.warn('Failed to deactivate enrollment client:', error);
      }
      
      this.isConnected = false;
      this.userId = null;
      this.userRole = null;
      this.client = null;
    }
  }

  private setupEnrollmentSubscription(): void {
    if (!this.client || !this.userId) return;

    // Subscribe to enrollment messages for this user
    const subscription = this.client.subscribe(
      `/user/queue/enrollment`,
      (message) => {
        try {
          const parsedMessage: EnrollmentWebSocketMessage = JSON.parse(message.body);
          console.log('Received enrollment message:', parsedMessage);
          
          // Notify all handlers
          this.messageHandlers.forEach((handler) => {
            try {
              handler(parsedMessage);
            } catch (error) {
              console.error('Error in enrollment message handler:', error);
            }
          });
        } catch (error) {
          console.error('Error parsing enrollment WebSocket message:', error);
        }
      }
    );

    this.subscriptions.set('enrollment', subscription);
    console.log('Subscribed to enrollment notifications for user:', this.userId);
  }

  addMessageHandler(handler: EnrollmentWebSocketHandler): void {
    this.messageHandlers.add(handler);
  }

  removeMessageHandler(handler: EnrollmentWebSocketHandler): void {
    this.messageHandlers.delete(handler);
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getUserRole(): string | null {
    return this.userRole;
  }
}

// Export singleton instance
export const enrollmentWebSocketService = new EnrollmentWebSocketService(); 