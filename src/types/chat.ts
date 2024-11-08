// First, let's create a shared types file
export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isAI: boolean;
  files?: File[];
  images?: File[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  isStarred: boolean;
  createdAt: Date;
  updatedAt: Date;
  backendSessionId?: string;
} 