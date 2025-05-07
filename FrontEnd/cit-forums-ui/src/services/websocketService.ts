import { Client, IFrame, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosInstance from './axiosConfig';

// Types for WebSocket messages
export enum MessageType {
  NEW_THREAD = 'NEW_THREAD',
  NEW_COMMENT = 'NEW_COMMENT',
  THREAD_UPDATE = 'THREAD_UPDATE',
  FORUM_UPDATE = 'FORUM_UPDATE',
  USER_JOINED = 'USER_JOINED'
}

export interface WebSocketMessage<T> {
  type: MessageType;
  content: T;
}

type MessageCallback<T> = (message: WebSocketMessage<T>) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private connected: boolean = false;
  private connectCallbacks: (() => void)[] = [];
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    // Get base URL from axios instance and convert to WebSocket URL
    const baseUrl = axiosInstance.defaults.baseURL || 'https://it342-cit-uforums.onrender.com';
    const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws';
    
    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      debug: function (str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.client.onConnect = this.onConnect.bind(this);
    this.client.onStompError = this.onError.bind(this);
    this.client.onWebSocketClose = this.onClose.bind(this);

    this.connect();
  }

  private connect(): void {
    if (this.client && !this.connected) {
      this.client.activate();
    }
  }

  private onConnect(frame: IFrame): void {
    this.connected = true;
    this.reconnectAttempts = 0;
    console.log('Connected to WebSocket server');
    
    // Execute any pending callbacks
    this.connectCallbacks.forEach(callback => callback());
    this.connectCallbacks = [];
  }

  private onError(frame: IFrame): void {
    console.error('WebSocket error:', frame);
  }

  private onClose(): void {
    this.connected = false;
    console.log('WebSocket connection closed');
    
    // Clear existing subscriptions
    this.subscriptions.clear();
    
    // Attempt to reconnect if not at max attempts
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      
      const delay = Math.min(30000, Math.pow(2, this.reconnectAttempts) * 1000);
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.initializeClient();
      }, delay);
    } else {
      console.error('Max reconnect attempts reached. Please refresh the page.');
    }
  }

  public disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions.clear();
    }
  }

  public subscribeToForum<T>(forumId: number, callback: MessageCallback<T>): () => void {
    return this.subscribe(`/topic/forum/${forumId}`, callback);
  }

  public subscribeToThread<T>(threadId: number, callback: MessageCallback<T>): () => void {
    return this.subscribe(`/topic/thread/${threadId}`, callback);
  }

  public subscribeToPublic<T>(callback: MessageCallback<T>): () => void {
    return this.subscribe('/topic/public', callback);
  }

  private subscribe<T>(destination: string, callback: MessageCallback<T>): () => void {
    const subscribeAction = () => {
      if (!this.client || !this.connected) {
        console.warn('WebSocket not connected. Adding to queue.');
        this.connectCallbacks.push(() => this.subscribe(destination, callback));
        return;
      }

      if (this.subscriptions.has(destination)) {
        // Unsubscribe first if already subscribed
        this.unsubscribe(destination);
      }

      const subscription = this.client.subscribe(destination, (message: IMessage) => {
        try {
          const parsedMessage = JSON.parse(message.body) as WebSocketMessage<T>;
          callback(parsedMessage);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      this.subscriptions.set(destination, subscription);
      console.log(`Subscribed to ${destination}`);
    };

    // If connected, subscribe immediately, otherwise queue it
    if (this.connected) {
      subscribeAction();
    } else {
      this.connectCallbacks.push(subscribeAction);
    }

    // Return unsubscribe function
    return () => this.unsubscribe(destination);
  }

  private unsubscribe(destination: string): void {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      console.log(`Unsubscribed from ${destination}`);
    }
  }

  public sendMessage<T>(destination: string, message: WebSocketMessage<T>): void {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected. Cannot send message.');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(message)
    });
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
