export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type AgentType = 'voice' | 'chat' | 'whatsapp' | 'translator';

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  isTranslated?: boolean;
  originalText?: string;
  image?: string; // Base64 data url
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  type: AgentType;
  lastUpdated: Date;
}

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}