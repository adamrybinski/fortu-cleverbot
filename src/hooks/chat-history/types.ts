
export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
  selectedQuestions?: any[];
  selectedAction?: 'refine' | 'instance' | 'both';
  isAutoMessage?: boolean;
  canvasData?: any;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
  isStarred?: boolean;
  isSaved?: boolean;
  hasUserMessage?: boolean;
}

export interface ChatHistoryState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isGeneratingTitle: boolean;
}
