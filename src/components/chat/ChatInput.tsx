
import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  inputValue: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  isLoading,
  onInputChange,
  onSendMessage,
  onKeyPress,
}) => {
  return (
    <div className="p-4 border-t border-gray-200 bg-[#F1EDFF]/20 flex-shrink-0">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Textarea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="What challenge are you looking to crack?"
            className="min-h-[72px] max-h-[144px] overflow-y-auto resize-none border-[#6EFFC6]/30 focus:border-[#6EFFC6] bg-white"
            rows={3}
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={onSendMessage}
          className="bg-[#753BBD] hover:bg-[#753BBD]/90 text-white px-4 py-2 h-10"
          disabled={!inputValue.trim() || isLoading}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Press Enter to send • Shift+Enter for new line
      </p>
    </div>
  );
};
