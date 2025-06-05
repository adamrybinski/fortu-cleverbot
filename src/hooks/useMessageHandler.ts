
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, Question, CanvasPreviewData } from '@/components/chat/types';
import { QuestionSession } from './useQuestionSessions';

interface QuestionSessionsHook {
  questionSessions: QuestionSession[];
  activeSessionId: string | null;
  getActiveSession: () => QuestionSession | null;
  createNewSession: (question: string) => string;
  updateSession: (sessionId: string, updates: Partial<QuestionSession>) => void;
  switchToSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
}

interface UseMessageHandlerProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  selectedQuestionsFromCanvas: Question[];
  selectedAction: 'refine' | 'instance' | 'both';
  onClearSelectedQuestions?: () => void;
  shouldCreateCanvasPreview: (
    message: string, 
    agentUsed?: string, 
    readyForFortu?: boolean, 
    readyForMultiChallenge?: boolean,
    refinedChallenge?: string,
    onTriggerCanvas?: (trigger: any) => void
  ) => CanvasPreviewData | null;
  setHasCanvasBeenTriggered: (value: boolean) => void;
  onTriggerCanvas?: (trigger: any) => void;
  questionSessions?: QuestionSessionsHook;
}

export const useMessageHandler = ({
  messages,
  setMessages,
  selectedQuestionsFromCanvas,
  selectedAction,
  onClearSelectedQuestions,
  shouldCreateCanvasPreview,
  setHasCanvasBeenTriggered,
  onTriggerCanvas,
  questionSessions
}: UseMessageHandlerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastProcessedQuestions, setLastProcessedQuestions] = useState<string>('');

  const handleSendMessage = async (messageText: string, isAutoMessage = false) => {
    if (!messageText.trim() || isLoading) return;

    // Prevent duplicate processing of the same selected questions
    if (isAutoMessage && selectedQuestionsFromCanvas.length > 0) {
      const questionsKey = selectedQuestionsFromCanvas.map(q => q.id).join(',');
      if (questionsKey === lastProcessedQuestions) {
        console.log('Skipping duplicate question processing');
        return;
      }
      setLastProcessedQuestions(questionsKey);
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: messageText,
      timestamp: new Date(),
      selectedQuestions: !isAutoMessage && selectedQuestionsFromCanvas.length > 0 ? selectedQuestionsFromCanvas : undefined,
      selectedAction: !isAutoMessage && selectedQuestionsFromCanvas.length > 0 ? selectedAction : undefined,
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    // Clear selected questions after sending (only for manual messages)
    if (!isAutoMessage && onClearSelectedQuestions && selectedQuestionsFromCanvas.length > 0) {
      onClearSelectedQuestions();
    }

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        text: msg.text
      }));

      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: messageText,
          conversationHistory: conversationHistory,
          selectedQuestions: selectedQuestionsFromCanvas.length > 0 ? selectedQuestionsFromCanvas : undefined,
          selectedAction: selectedQuestionsFromCanvas.length > 0 ? selectedAction : undefined
        }
      });

      if (error || data?.error) throw new Error(data?.error || error.message);

      let assistantText = data.response;
      const agentUsed = data.agentUsed;
      const readyForFortu = data.readyForFortu;
      const readyForFortuInstance = data.readyForFortuInstance;
      const refinedChallenge = data.refinedChallenge;

      console.log('Agent used:', agentUsed);
      console.log('Ready for fortu:', readyForFortu);
      console.log('Ready for fortu instance:', readyForFortuInstance);
      console.log('Refined challenge:', refinedChallenge);

      // Create new session only when we have both refined challenge and are ready for fortu search
      if (readyForFortu && refinedChallenge && questionSessions) {
        console.log('Creating new session with refined challenge:', refinedChallenge);
        const sessionId = questionSessions.createNewSession(refinedChallenge);
        questionSessions.updateSession(sessionId, {
          refinedChallenge,
          status: 'searching'
        });
      }

      // Update active session with refined challenge if we have one but session already exists
      if (refinedChallenge && questionSessions?.activeSessionId && !readyForFortu) {
        questionSessions.updateSession(questionSessions.activeSessionId, {
          refinedChallenge
        });
      }

      // Handle fortu.ai instance guidance (when user selects what to submit)
      if (readyForFortuInstance && refinedChallenge) {
        assistantText += `\n\n**🎯 Ready for fortu.ai Instance Setup**\n\n` +
          "Perfect! Based on your selection, here's what you'll submit to your fortu.ai instance:\n\n" +
          `**Your Challenge:** "${refinedChallenge}"\n\n` +
          "**Next Step:** Take this to your fortu.ai instance to find specific, actionable solutions from organisations that have successfully tackled this exact challenge.";
      }

      // Check if we should create a canvas preview and auto-open
      const canvasPreviewData = shouldCreateCanvasPreview(
        messageText, 
        agentUsed, 
        readyForFortu,
        false, // No multi-challenge in simplified flow
        refinedChallenge,
        onTriggerCanvas
      );
      
      if (canvasPreviewData) {
        setHasCanvasBeenTriggered(true);
        
        if (canvasPreviewData.type === 'fortuQuestions') {
          assistantText += "\n\nI've opened the question explorer below where you can browse relevant approaches from our database. Select the questions that best align with your challenge to help me create the perfect refined statement for your fortu.ai instance.";
        } else {
          assistantText += "\n\nI've set up a blank canvas for you. Click the expand button below to open it and start visualising your ideas.";
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: assistantText,
        timestamp: new Date(),
        canvasData: canvasPreviewData || undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: 'Right, hit a snag there. Technical hiccup on my end. Give it another go?',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSendMessage
  };
};
