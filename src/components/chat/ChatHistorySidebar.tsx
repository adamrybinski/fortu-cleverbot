
import React, { useState } from 'react';
import { Plus, Search, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChatHistoryItem } from './ChatHistoryItem';
import { useChatHistory } from '@/hooks/useChatHistory';

interface ChatHistorySidebarProps {
  onNewChat: () => void;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({ onNewChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    sessions,
    activeSessionId,
    switchToSession,
    deleteSession,
    renameSession
  } = useChatHistory();

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    onNewChat();
  };

  return (
    <div className="h-full flex flex-col bg-[#F1EDFF]/30 border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-[#003079]" />
          <h2 className="text-lg font-semibold text-[#003079]">Chat History</h2>
        </div>
        
        <Button
          onClick={handleNewChat}
          className="w-full bg-[#753BBD] hover:bg-[#753BBD]/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-[#6EFFC6]/30 focus:border-[#6EFFC6]"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-4 pt-2 space-y-2">
          {filteredSessions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {searchQuery ? 'No chats found' : 'No chat history yet'}
            </div>
          ) : (
            filteredSessions.map((session) => (
              <ChatHistoryItem
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onSelect={switchToSession}
                onDelete={deleteSession}
                onRename={renameSession}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
