import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, ChatUIProps, CanvasTrigger, CanvasPreviewData } from './chat/types';
import { ChatHeader } from './chat/ChatHeader';
import { MessagesContainer } from './chat/MessagesContainer';
import { ChatInput } from './chat/ChatInput';

interface ExtendedChatUIProps extends ChatUIProps {
  isCanvasOpen?: boolean;
}

export const ChatUI: React.FC<ExtendedChatUIProps> = ({ 
  onOpenCanvas, 
  onTriggerCanvas, 
  isCanvasOpen 
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  // Simplified detection - create fortu Questions canvas when ready
  const shouldCreateCanvasPreview = (
    message: string, 
    agentUsed?: string, 
    readyForFortu?: boolean, 
    refinedChallenge?: string
  ): CanvasPreviewData | null => {
    const lowerInput = message.toLowerCase();
    
    // Primary trigger: Prospect Agent indicates readiness
    if (readyForFortu && agentUsed === 'prospect') {
      return createCanvasPreviewData('fortuQuestions', {
        refinedChallenge: refinedChallenge || message,
        challengeContext: 'prospect_refined',
        searchReady: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Fallback triggers for explicit requests
    if (agentUsed === 'prospect' && messages.length >= 6) {
      // User explicitly asks for questions/solutions
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        text: msg.text
      }));

      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: currentInput,
          conversationHistory: conversationHistory
        }
      });

      if (error || data?.error) throw new Error(data?.error || error.message);

      let assistantText = data.response;
      const agentUsed = data.agentUsed;
      const readyForFortu = data.readyForFortu;
      const refinedChallenge = data.refinedChallenge;

      console.log('Agent used:', agentUsed);
      console.log('Ready for fortu:', readyForFortu);
      console.log('Refined challenge:', refinedChallenge);

      // Check if we should create a canvas preview
      const canvasPreviewData = shouldCreateCanvasPreview(
        currentInput, 
        agentUsed, 
        readyForFortu, 
        refinedChallenge
      );
      
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
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};
