
import { useState, useEffect } from 'react';
import { Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { CanvasTrigger } from '@/components/canvas/CanvasContainer';

interface UseMessageHandlerProps {
  onOpenCanvas?: (type?: string, payload?: Record<string, any>) => void;
  onTriggerCanvas?: (trigger: CanvasTrigger) => void;
  scrollToBottom: () => void;
  isAtBottom: boolean;
}

export const useMessageHandler = ({ 
  onOpenCanvas, 
  onTriggerCanvas, 
  scrollToBottom, 
  isAtBottom 
}: UseMessageHandlerProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      text: 'Right, let\'s get started. What\'s the challenge you\'re looking to crack? Don\'t worry about having it perfectly formed — I\'ll help sharpen it.',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll on new messages if user is at bottom
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom, scrollToBottom]);

  const sendMessage = async (inputValue: string) => {
    if (!inputValue.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    // Check for canvas triggers first
    const lowerInput = inputValue.toLowerCase();
    let canvasTriggered = false;

    if (lowerInput.includes('fortune') || lowerInput.includes('questions')) {
      if (onTriggerCanvas) {
        onTriggerCanvas({ 
          type: 'fortuQuestions', 
          payload: { 
            challengeSummary: inputValue,
            timestamp: new Date().toISOString()
          } 
        });
        canvasTriggered = true;
      }
    } else if (lowerInput.includes('open canvas') || lowerInput.includes('canvas')) {
      if (onOpenCanvas) {
        onOpenCanvas('blank', { source: 'chat_trigger' });
        canvasTriggered = true;
      }
    }

    try {
      // Call the edge function with conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        text: msg.text
      }));

      console.log('Calling chat function with message:', inputValue);
      
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: inputValue,
          conversationHistory: conversationHistory
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data.error) {
        console.error('Edge function error:', data.error);
        throw new Error(data.error);
      }

      let assistantText = data.response;

      // Add canvas context if triggered
      if (canvasTriggered) {
        if (lowerInput.includes('fortune') || lowerInput.includes('questions')) {
          assistantText += "\n\nI've opened the Fortune Questions module on the right. Let's explore this together.";
        } else if (lowerInput.includes('canvas')) {
          assistantText += "\n\nCanvas is now open on the right. Ready to visualise your thinking.";
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: assistantText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error calling chat function:', error);
      
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
    messages,
    isLoading,
    sendMessage
  };
};
