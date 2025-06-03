
import React, { useState, useRef, useEffect } from 'react';
import { Send, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onOpenCanvas: () => void;
  isCanvasOpen: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onOpenCanvas, isCanvasOpen }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. I can help you with various tasks. Try typing "open canvas" to switch to the canvas mode!',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);

    // Check for canvas trigger
    if (inputValue.toLowerCase().includes('open canvas') || inputValue.toLowerCase().includes('canvas')) {
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Opening canvas mode! You can now see the canvas on the right side.',
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        onOpenCanvas();
      }, 500);
    } else {
      // Simulate AI response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'I understand your message. Try saying "open canvas" to see the canvas feature!',
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }, 1000);
    }

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
    <div className="flex flex-col h-full bg-gradient-to-br from-[#F1EDFF] to-[#EEFFF3]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20 bg-white/50 backdrop-blur-sm">
        <h1 className="text-xl font-semibold text-[#003079]">AI Assistant</h1>
        {!isCanvasOpen && (
          <Button
            onClick={onOpenCanvas}
            variant="outline"
            size="sm"
            className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Open Canvas
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-[#753BBD] text-white ml-4'
                    : 'bg-white text-[#1D253A] mr-4 shadow-sm'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className={`text-xs mt-1 block ${
                  message.role === 'user' ? 'text-white/70' : 'text-[#1D253A]/60'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-white/20 bg-white/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (try 'open canvas')"
            className="flex-1 border-[#6EFFC6]/30 focus:border-[#6EFFC6] bg-white"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-[#753BBD] hover:bg-[#753BBD]/90 text-white"
            disabled={!inputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
