import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, ChatUIProps, CanvasTrigger } from './chat/types';
import { ChatHeader } from './chat/ChatHeader';
import { MessagesContainer } from './chat/MessagesContainer';
import { ChatInput } from './chat/ChatInput';

export const ChatUI: React.FC<ChatUIProps> = ({ onOpenCanvas, onTriggerCanvas }) => {
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);

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
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        text: msg.text
      }));

      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: inputValue,
          conversationHistory: conversationHistory
        }
      });

      if (error || data?.error) throw new Error(data?.error || error.message);

      let assistantText = data.response;

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
      <ChatHeader />
      
      <MessagesContainer
        messages={messages}
        isLoading={isLoading}
        messagesContainerRef={messagesContainerRef}
        scrollRef={scrollRef}
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
