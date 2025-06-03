
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { CanvasTrigger } from './canvas/CanvasContainer';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface ChatUIProps {
  onOpenCanvas?: (type?: string, payload?: Record<string, any>) => void;
  onTriggerCanvas?: (trigger: CanvasTrigger) => void;
}

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
    <div className="flex flex-col h-full bg-gradient-to-br from-[#F1EDFF] to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <h1 className="text-xl font-semibold text-[#003079] dark:text-white">CleverBot</h1>
        <span className="text-xs text-[#1D253A]/60 bg-white/50 px-2 py-1 rounded-md">
          ICS Consultant
        </span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}
            >
              {/* Bot Icon */}
              {message.role === 'bot' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full shadow-sm overflow-hidden bg-white p-1">
                    <img
                      src="/lovable-uploads/7fabe412-0da9-4efc-a1d8-ee6ee3349e4d.png"
                      alt="CleverBot"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
              )}
              
              {/* Message Bubble */}
              <div
                className={`max-w-[80%] md:max-w-[70%] p-3 rounded-lg shadow-sm ${
                  message.role === 'user'
                    ? 'bg-[#EEFFF3] text-[#1D253A] rounded-br-sm'
                    : 'bg-white text-[#1D253A] rounded-bl-sm dark:bg-gray-700 dark:text-white'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full shadow-sm overflow-hidden bg-white p-1">
                  <img
                    src="/lovable-uploads/7fabe412-0da9-4efc-a1d8-ee6ee3349e4d.png"
                    alt="CleverBot"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <div className="bg-white text-[#1D253A] rounded-lg rounded-bl-sm p-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#753BBD] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#753BBD] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#753BBD] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What challenge are you looking to crack?"
              className="border-[#6EFFC6]/30 focus:border-[#6EFFC6] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            className="bg-[#753BBD] hover:bg-[#753BBD]/90 text-white px-4 py-2 h-10"
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};
