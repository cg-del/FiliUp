// Polyfill for sockjs-client global variable issue
if (typeof global === 'undefined') {
  (window as unknown as { global: typeof globalThis }).global = globalThis;
}

import { Client, StompSubscription } from '@stomp/stompjs';

export interface QuizWebSocketMessage {
  type: 'QUIZ_TIMEOUT' | 'TIME_WARNING' | 'QUIZ_UPDATE';
  attemptId: string;
  message: string;
  minutesRemaining?: number;
  data?: unknown;
}

export type QuizWebSocketHandler = (message: QuizWebSocketMessage) => void;

class QuizWebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private messageHandlers: Set<QuizWebSocketHandler> = new Set();
  private studentId: string | null = null;

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

    // Use native WebSocket with token as query parameter
    const wsUrl = `ws://localhost:8080/ws?token=${encodeURIComponent(token)}`;
    
    console.log('Initializing WebSocket connection to:', wsUrl);

    // Initialize the STOMP client with native WebSocket
    this.client = new Client({
      webSocketFactory: () => {
        console.log('Creating WebSocket connection...');
        return new WebSocket(wsUrl);
      },
      connectHeaders: {
        'Authorization': `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('Connected to WebSocket:', frame);
      this.isConnected = true;
      this.setupQuizSubscription();
    };

    this.client.onDisconnect = (frame) => {
      console.log('Disconnected from WebSocket:', frame);
      this.isConnected = false;
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP Error:', frame);
      // If it's an auth error, clear tokens and possibly redirect
      if (frame.headers.message?.toLowerCase().includes('unauthorized') || 
          frame.headers.message?.toLowerCase().includes('forbidden')) {
        console.error('WebSocket authentication failed');
      }
    };

    this.client.onWebSocketError = (error) => {
      console.error('WebSocket Error:', error);
    };

    this.client.onWebSocketClose = (closeEvent) => {
      console.log('WebSocket closed:', closeEvent);
      this.isConnected = false;
    };
  }

  connect(studentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.studentId = studentId;

      try {
        // Initialize client with current auth token
        this.initializeClient();
      } catch (error) {
        console.error('Failed to initialize WebSocket client:', error);
        reject(error);
        return;
      }

      if (!this.client) {
        reject(new Error('WebSocket client not initialized'));
        return;
      }

      if (this.isConnected) {
        resolve();
        return;
      }

      // Set up a timeout for the connection attempt
      const connectionTimeout = setTimeout(() => {
        console.error('WebSocket connection timeout');
        reject(new Error('WebSocket connection timeout'));
      }, 10000); // 10 second timeout

      const originalOnConnect = this.client.onConnect;
      this.client.onConnect = (frame) => {
        clearTimeout(connectionTimeout);
        originalOnConnect(frame);
        console.log('WebSocket connection successful');
        resolve();
      };

      const originalOnStompError = this.client.onStompError;
      this.client.onStompError = (frame) => {
        clearTimeout(connectionTimeout);
        originalOnStompError(frame);
        console.error('STOMP error during connection:', frame.headers);
        reject(new Error(`WebSocket connection failed: ${frame.headers.message || 'Unknown STOMP error'}`));
      };

      const originalOnWebSocketError = this.client.onWebSocketError;
      this.client.onWebSocketError = (error) => {
        clearTimeout(connectionTimeout);
        originalOnWebSocketError?.(error);
        console.error('WebSocket error during connection:', error);
        reject(new Error(`WebSocket connection error: ${error}`));
      };

      try {
        console.log('Activating WebSocket client...');
        this.client.activate();
      } catch (error) {
        clearTimeout(connectionTimeout);
        console.error('Failed to activate WebSocket client:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.client && this.isConnected) {
      // Send disconnect message
      if (this.studentId) {
        try {
          this.client.publish({
            destination: '/app/quiz/disconnect',
            body: JSON.stringify({ studentId: this.studentId })
          });
        } catch (error) {
          console.warn('Failed to send disconnect message:', error);
        }
      }

      // Clean up subscriptions
      this.subscriptions.forEach((subscription: StompSubscription) => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.warn('Failed to unsubscribe:', error);
        }
      });
      this.subscriptions.clear();

      try {
        this.client.deactivate();
      } catch (error) {
        console.warn('Failed to deactivate client:', error);
      }
      
      this.isConnected = false;
      this.studentId = null;
      this.client = null;
    }
  }

  private setupQuizSubscription(): void {
    if (!this.client || !this.studentId) return;

    // Subscribe to quiz messages for this student
    const subscription = this.client.subscribe(
      `/user/queue/quiz`,
      (message) => {
        try {
          const parsedMessage: QuizWebSocketMessage = JSON.parse(message.body);
          console.log('Received quiz message:', parsedMessage);
          
          // Notify all handlers
          this.messageHandlers.forEach((handler) => {
            try {
              handler(parsedMessage);
            } catch (error) {
              console.error('Error in message handler:', error);
            }
          });
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      }
    );

    this.subscriptions.set('quiz', subscription);

    // Send connect message
    try {
      this.client.publish({
        destination: '/app/quiz/connect',
        body: JSON.stringify({ studentId: this.studentId })
      });
    } catch (error) {
      console.error('Failed to send connect message:', error);
    }
  }

  addMessageHandler(handler: QuizWebSocketHandler): void {
    this.messageHandlers.add(handler);
  }

  removeMessageHandler(handler: QuizWebSocketHandler): void {
    this.messageHandlers.delete(handler);
  }

  sendHeartbeat(): void {
    if (this.client && this.isConnected && this.studentId) {
      try {
        this.client.publish({
          destination: '/app/quiz/heartbeat',
          body: JSON.stringify({ studentId: this.studentId })
        });
      } catch (error) {
        console.error('Failed to send heartbeat:', error);
      }
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const quizWebSocketService = new QuizWebSocketService(); 