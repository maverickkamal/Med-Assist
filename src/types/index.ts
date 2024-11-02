export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isStarred: boolean;
  messages: Message[];
}

export interface Message {
  id: string;
  content: string;
  files?: File[];
  images?: File[];
  timestamp: Date;
  isAI?: boolean;
} 