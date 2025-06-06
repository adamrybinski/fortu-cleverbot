
import React from 'react';
import { Plus, History, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatHistoryItem } from './ChatHistoryItem';
import { useChatHistory } from '@/hooks/useChatHistory';

interface ChatHistorySidebarProps {
  onNewChat: () => void;
  onClose: () => void;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({ onNewChat, onClose }) => {
  const {
    sessions,
    activeSessionId,
    switchToSession,
    deleteSession,
    renameSession,
    toggleStarSession,
    getActiveSession
  } = useChatHistory();

  console.log('🔍 ChatHistorySidebar render:', {
    sessionsCount: sessions.length,
    activeSessionId,
    sessionIds: sessions.map(s => s.id)
  });

  const starredSessions = sessions.filter(session => session.isStarred);
  const recentSessions = sessions.filter(session => !session.isStarred);

  const handleNewChat = () => {
    console.log('🆕 New chat requested from sidebar');
    onNewChat();
  };

  // Check if we can create a new chat (current session has user messages)
  const currentSession = getActiveSession();
  const canCreateNewChat = currentSession?.hasUserMessage || false;

  console.log('🔍 New chat button state:', {
    currentSessionId: currentSession?.id,
    hasUserMessage: currentSession?.hasUserMessage,
    canCreateNewChat
  });

  return (
    <div className="h-full flex flex-col bg-[#F1EDFF] border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#003079]" />
            <h2 className="text-lg font-semibold text-[#003079] font-['Montserrat']">Chat History</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-[#003079] hover:bg-[#753BBD]/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          onClick={handleNewChat}
          disabled={!canCreateNewChat}
          className="w-full bg-[#753BBD] hover:bg-[#753BBD]/90 text-white disabled:bg-gray-300 disabled:text-gray-500 font-['Montserrat']"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        
        {!canCreateNewChat && (
          <p className="text-xs text-gray-500 mt-2 text-center font-['Montserrat']">
            Send a message to save this chat
          </p>
        )}
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Starred Section */}
          {starredSessions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[#003079] mb-2 px-2 font-['Montserrat']">Starred</h3>
              <div className="space-y-2">
                {starredSessions.map((session) => (
                  <ChatHistoryItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onSelect={switchToSession}
                    onDelete={deleteSession}
                    onRename={renameSession}
                    onToggleStar={toggleStarSession}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Section */}
          {recentSessions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[#003079] mb-2 px-2 font-['Montserrat']">
                {starredSessions.length > 0 ? 'Recent' : 'Chats'}
              </h3>
              <div className="space-y-2">
                {recentSessions.map((session) => (
                  <ChatHistoryItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onSelect={switchToSession}
                    onDelete={deleteSession}
                    onRename={renameSession}
                    onToggleStar={toggleStarSession}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {sessions.length === 0 && (
            <div className="text-center text-gray-500 py-8 font-['Montserrat']">
              No chat history yet
            </div>
          )}
          
          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-400 p-2 border-t">
              Debug: {sessions.length} sessions visible
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
