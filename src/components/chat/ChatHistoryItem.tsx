
import React, { useState } from 'react';
import { MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChatSession } from '@/hooks/useChatHistory';

interface ChatHistoryItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onRename: (sessionId: string, newTitle: string) => void;
}

export const ChatHistoryItem: React.FC<ChatHistoryItemProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onRename
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(session.title);
  };

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== session.title) {
      onRename(session.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(session.title);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div
      className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
        isActive 
          ? 'bg-[#753BBD]/10 border border-[#753BBD]/20' 
          : 'hover:bg-[#F1EDFF]/30'
      }`}
      onClick={() => !isEditing && onSelect(session.id)}
    >
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            className="h-6 text-sm border-none p-0 focus-visible:ring-0"
            autoFocus
          />
        ) : (
          <>
            <div className="text-sm font-medium text-[#003079] truncate">
              {session.title}
            </div>
            <div className="text-xs text-gray-500">
              {formatTime(session.lastActivity)}
            </div>
          </>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onDelete(session.id)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
