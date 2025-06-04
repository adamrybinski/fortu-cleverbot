
export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
  canvasData?: CanvasPreviewData;
  selectedQuestions?: Question[];
}

export interface Question {
  id: string | number;
  question: string;
  source: 'fortu' | 'openai';
  selected?: boolean;
}

export interface CanvasPreviewData {
  type: string;
  title: string;
  description: string;
  payload: Record<string, any>;
}

export interface CanvasTrigger {
  type: string;
  payload: Record<string, any>;
}

export interface ChatUIProps {
  onOpenCanvas?: (type?: string, payload?: Record<string, any>) => void;
  onTriggerCanvas?: (trigger: CanvasTrigger) => void;
}
