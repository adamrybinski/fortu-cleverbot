import React, { useState } from 'react';
import { MoreHorizontal, Trash2, Edit2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChatSession } from '@/hooks/useChatHistory';

interface ChatHistoryItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onRename: (sessionId: string, newTitle: string) => void;
  onToggleStar: (sessionId: string) => void;
}

export const ChatHistoryItem: React.FC<ChatHistoryItemProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onRename,
  onToggleStar
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete(session.id);
  };

  return (
    <>
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
              <div className="flex items-center gap-2">
                {session.isStarred && (
                  <Star className="h-3 w-3 text-[#753BBD] fill-current" />
                )}
                <div className="text-sm font-medium text-[#003079] truncate">
                  {session.title}
                </div>
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
            <DropdownMenuItem onClick={() => onToggleStar(session.id)}>
              <Star className="h-4 w-4 mr-2" />
              {session.isStarred ? 'Unstar' : 'Star'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#003079] font-['Montserrat']">Delete Chat</AlertDialogTitle>
            <AlertDialogDescription className="text-[#1D253A] font-['Montserrat']">
              Are you sure you want to delete "{session.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20 font-['Montserrat']">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-['Montserrat']"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
