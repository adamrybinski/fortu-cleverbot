import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, ChatUIProps, CanvasTrigger, CanvasPreviewData, Question } from './chat/types';
import { ChatHeader } from './chat/ChatHeader';
import { MessagesContainer } from './chat/MessagesContainer';
import { ChatInput } from './chat/ChatInput';

interface ExtendedChatUIProps extends ChatUIProps {
  isCanvasOpen?: boolean;
  selectedQuestionsFromCanvas?: Question[];
  onClearSelectedQuestions?: () => void;
}

export const ChatUI: React.FC<ExtendedChatUIProps> = ({ 
  onOpenCanvas, 
  onTriggerCanvas, 
  isCanvasOpen,
  selectedQuestionsFromCanvas = [],
  onClearSelectedQuestions
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      text: 'Right, let\'s get started. What\'s the challenge you\'re looking to crack? Don\'t worry about having it perfectly formed — I\'ll help sharpen it.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasCanvasBeenTriggered, setHasCanvasBeenTriggered] = useState(false);
  const [pendingCanvasGuidance, setPendingCanvasGuidance] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Handle selected questions from canvas
  useEffect(() => {
    if (selectedQuestionsFromCanvas.length > 0) {
      const questionsList = selectedQuestionsFromCanvas.map(q => `• ${q.question}`).join('\n');
      const autoMessage = `I've selected these ${selectedQuestionsFromCanvas.length} questions from the canvas that seem most relevant to my challenge:\n\n${questionsList}\n\nCan you help me refine my challenge further based on these selections?`;
      
      // Auto-send the message
      handleSendMessage(autoMessage, true);
    }
  }, [selectedQuestionsFromCanvas]);

  // Handle canvas guidance when canvas opens
  useEffect(() => {
    if (isCanvasOpen && pendingCanvasGuidance) {
      const guidanceMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: pendingCanvasGuidance,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, guidanceMessage]);
      setPendingCanvasGuidance(null);
    }
  }, [isCanvasOpen, pendingCanvasGuidance]);

  const createCanvasPreviewData = (type: string, payload: Record<string, any>): CanvasPreviewData => {
    switch (type) {
      case 'fortuQuestions':
        return {
          type: 'fortuQuestions',
          title: 'fortu.ai Question Search',
          description: 'Discover relevant questions and insights from our database of business challenges. Explore proven approaches to your refined challenge.',
          payload
        };
      case 'blank':
      case 'canvas':
      default:
        return {
          type: 'blank',
          title: 'Blank Canvas Created',
          description: 'A blank canvas for drawing, brainstorming, and visual thinking. Click to expand and start creating.',
          payload
        };
    }
  };

  // Enhanced detection with confirmation requirement
  const shouldCreateCanvasPreview = (
    message: string, 
    agentUsed?: string, 
    readyForFortu?: boolean, 
    refinedChallenge?: string
  ): CanvasPreviewData | null => {
    const lowerInput = message.toLowerCase();
    
    // Primary trigger: Prospect Agent indicates readiness AND user has confirmed
    if (readyForFortu && agentUsed === 'prospect') {
      // Set guidance message for when canvas opens
      setPendingCanvasGuidance(
        "Perfect! I've opened the fortu.ai question search for you. You'll see questions matched from our database and AI-generated suggestions.\n\n" +
        "To refine your challenge further:\n" +
        "1. **Click on any question** to read a detailed summary and insights\n" +
        "2. **Select multiple questions** by clicking 'Select Questions' button\n" +
        "3. **Send selected questions back to me** to refine your challenge based on what resonates\n\n" +
        "Explore the questions and let me know which ones catch your attention!"
      );

      return createCanvasPreviewData('fortuQuestions', {
        refinedChallenge: refinedChallenge || message,
        challengeContext: 'user_confirmed',
        searchReady: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Fallback triggers for explicit requests
    if (agentUsed === 'prospect' && messages.length >= 6) {
      // User explicitly asks for questions/solutions after question presentation
      if (lowerInput.includes('question') || 
          lowerInput.includes('solution') || 
          lowerInput.includes('example') ||
          lowerInput.includes('what next') ||
          lowerInput.includes('how do we proceed')) {
        return createCanvasPreviewData('fortuQuestions', {
          challengeSummary: refinedChallenge || message,
          challengeContext: 'user_request',
          searchReady: false,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Manual fortu questions trigger
    if (lowerInput.includes('fortu questions') || lowerInput.includes('search questions')) {
      return createCanvasPreviewData('fortuQuestions', {
        challengeSummary: message,
        searchReady: false,
        timestamp: new Date().toISOString()
      });
    }
    
    // General canvas trigger (blank canvas only)
    if (lowerInput.includes('open canvas') || lowerInput.includes('blank canvas')) {
      return createCanvasPreviewData('blank', { 
        source: 'chat_trigger',
        timestamp: new Date().toISOString()
      });
    }
    
    return null;
  };

  const handleSendMessage = async (messageText?: string, isAutoMessage = false) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
      selectedQuestions: !isAutoMessage && selectedQuestionsFromCanvas.length > 0 ? selectedQuestionsFromCanvas : undefined,
    };

    setMessages(prev => [...prev, newMessage]);
    if (!isAutoMessage) {
      setInputValue('');
    }
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
          message: textToSend,
          conversationHistory: conversationHistory,
          selectedQuestions: selectedQuestionsFromCanvas.length > 0 ? selectedQuestionsFromCanvas : undefined
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

      // Handle fortu.ai instance guidance (Stage 6)
      if (readyForFortuInstance && refinedChallenge) {
        assistantText += `\n\n**🎯 Your Refined Challenge for fortu.ai:**\n\n"${refinedChallenge}"\n\n` +
          "**Next Step:** Take this refined question to your own fortu.ai instance to find specific, actionable solutions from organisations that have tackled this exact challenge.\n\n" +
          "In fortu.ai, search for this question and you'll get access to detailed case studies, proven approaches, and specific methodologies.";
      }

      // Check if we should create a canvas preview (only for initial fortu search, not instance guidance)
      const canvasPreviewData = !readyForFortuInstance ? shouldCreateCanvasPreview(
        textToSend, 
        agentUsed, 
        readyForFortu, 
        refinedChallenge
      ) : null;
      
      if (canvasPreviewData) {
        setHasCanvasBeenTriggered(true);
        
        // Only modify response for fortu Questions when ready for search
        if (canvasPreviewData.type === 'fortuQuestions' && readyForFortu) {
          assistantText += "\n\nBrilliant. I've found some relevant questions in fortu.ai that match your challenge. Click the expand button below to explore these proven approaches and see how other organisations have tackled similar challenges.";
        } else if (canvasPreviewData.type === 'fortuQuestions') {
          assistantText += "\n\nI've created a fortu Questions module for you. Click the expand button below to open it and start exploring your challenge.";
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 bg-white min-h-0">
      <ChatHeader 
        onOpenCanvas={onOpenCanvas}
        isCanvasOpen={isCanvasOpen}
        hasCanvasBeenTriggered={hasCanvasBeenTriggered}
      />
      
      <MessagesContainer
        messages={messages}
        isLoading={isLoading}
        messagesContainerRef={messagesContainerRef}
        scrollRef={scrollRef}
        onTriggerCanvas={onTriggerCanvas}
      />

      <ChatInput
        inputValue={inputValue}
        isLoading={isLoading}
        onInputChange={setInputValue}
        onSendMessage={() => handleSendMessage()}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};
