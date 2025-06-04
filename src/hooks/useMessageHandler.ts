
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, Question, CanvasPreviewData } from '@/components/chat/types';

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
    refinedChallenge?: string
  ) => CanvasPreviewData | null;
  setHasCanvasBeenTriggered: (value: boolean) => void;
}

export const useMessageHandler = ({
  messages,
  setMessages,
  selectedQuestionsFromCanvas,
  selectedAction,
  onClearSelectedQuestions,
  shouldCreateCanvasPreview,
  setHasCanvasBeenTriggered
}: UseMessageHandlerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageText: string, isAutoMessage = false) => {
    if (!messageText.trim() || isLoading) return;

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
      const readyForMultiChallenge = data.readyForMultiChallenge;
      const refinedChallenge = data.refinedChallenge;

      console.log('Agent used:', agentUsed);
      console.log('Ready for fortu:', readyForFortu);
      console.log('Ready for fortu instance:', readyForFortuInstance);
      console.log('Ready for multi-challenge:', readyForMultiChallenge);
      console.log('Refined challenge:', refinedChallenge);

      // Handle fortu.ai instance guidance (when user selects "create instance")
      if (readyForFortuInstance && refinedChallenge) {
        assistantText += `\n\n**🎯 Your Refined Challenge for fortu.ai:**\n\n"${refinedChallenge}"\n\n` +
          "**Next Step:** Take this refined question to your own fortu.ai instance to find specific, actionable solutions from organisations that have tackled this exact challenge.\n\n" +
          "In fortu.ai, search for this question and you'll get access to detailed case studies, proven approaches, and specific methodologies.";
      }

      // Check if we should create a canvas preview
      const canvasPreviewData = shouldCreateCanvasPreview(
        messageText, 
        agentUsed, 
        readyForFortu,
        readyForMultiChallenge,
        refinedChallenge
      );
      
      if (canvasPreviewData) {
        setHasCanvasBeenTriggered(true);
        
        // Handle different canvas preview types
        if (canvasPreviewData.type === 'fortuQuestions') {
          assistantText += "\n\nPerfect! I'm opening the question matching canvas where you can explore relevant approaches from organisations that have tackled similar challenges. Click the expand button below to start exploring.";
        } else if (canvasPreviewData.type === 'challengeHistory') {
          assistantText += "\n\nBrilliant! I've opened your challenge workspace where you can start a new challenge while preserving your current work. Click the expand button below to continue.";
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
