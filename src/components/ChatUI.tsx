import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
      text: 'Hello! I\'m your AI assistant. I can help you with various tasks and answer questions. Try saying "open canvas" or "fortune questions" to see different canvas modules!',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);

    // Enhanced trigger system with pattern matching
    const lowerInput = inputValue.toLowerCase();
    
    setTimeout(() => {
      let assistantMessage: Message;
      
      if (lowerInput.includes('fortune') || lowerInput.includes('questions')) {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: 'Opening Fortune Questions canvas! This module will help you explore insights and possibilities.',
          timestamp: new Date(),
        };
        
        if (onTriggerCanvas) {
          onTriggerCanvas({ 
            type: 'fortuQuestions', 
            payload: { 
              challengeSummary: inputValue,
              timestamp: new Date().toISOString()
            } 
          });
        }
      } else if (lowerInput.includes('open canvas') || lowerInput.includes('canvas')) {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: 'Opening blank canvas mode! You can now see the canvas on the right side.',
          timestamp: new Date(),
        };
        
        if (onOpenCanvas) {
          onOpenCanvas('blank', { source: 'chat_trigger' });
        }
      } else {
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: 'I understand your message. Try saying "open canvas" for a blank canvas or "fortune questions" to explore the Fortune Questions module! I\'m here to help with any questions or tasks you have.',
          timestamp: new Date(),
        };
      }
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 500);

    setInputValue('');
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
        <h1 className="text-xl font-semibold text-[#003079] dark:text-white">AI Assistant</h1>
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
                      alt="AI Assistant"
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
                <p className="text-sm leading-relaxed">{message.text}</p>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
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
              placeholder="Type your message... (Press Enter to send)"
              className="border-[#6EFFC6]/30 focus:border-[#6EFFC6] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              disabled={false}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            className="bg-[#753BBD] hover:bg-[#753BBD]/90 text-white px-4 py-2 h-10"
            disabled={!inputValue.trim()}
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
