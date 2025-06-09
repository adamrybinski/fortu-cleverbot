
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu, X, Plus, Database, Bot, Check, Settings } from 'lucide-react';
import { QuestionSession } from '@/hooks/useQuestionSessions';

interface CanvasQuestionMenuProps {
  questionSessions: QuestionSession[];
  activeSessionId: string | null;
  onSwitchToSession: (sessionId: string) => void;
  onCreateNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onSendMessageToChat?: (message: string) => void;
  currentTriggerType?: string;
  onSwitchToModule?: (moduleType: 'questions' | 'setup') => void;
  activeModule?: 'questions' | 'setup';
}

export const CanvasQuestionMenu: React.FC<CanvasQuestionMenuProps> = ({
  questionSessions,
  activeSessionId,
  onSwitchToSession,
  onCreateNewSession,
  onDeleteSession,
  onSendMessageToChat,
  currentTriggerType,
  onSwitchToModule,
  activeModule = 'questions'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Show menu if there are multiple sessions with refined challenges OR if fortu instance setup is active
  const sessionsWithRefinedChallenges = questionSessions.filter(session => 
    session.refinedChallenge && (session.status === 'searching' || session.status === 'matches_found' || session.status === 'refined')
  );

  const shouldShowMenu = sessionsWithRefinedChallenges.length > 1 || currentTriggerType === 'fortuInstanceSetup';

  if (!shouldShowMenu) {
    return null;
  }

  const getStatusBadge = (session: QuestionSession) => {
    const totalQuestions = session.fortuQuestions.length + session.aiQuestions.length;
    const selectedCount = session.selectedQuestions.length;

    switch (session.status) {
      case 'asking':
        return <span className="text-xs text-[#753BBD]">Asking...</span>;
      case 'searching':
        return <span className="text-xs text-[#003079]">Searching...</span>;
      case 'matches_found':
        return (
          <div className="flex items-center gap-1 text-xs text-[#003079]">
            <Database className="w-3 h-3" />
            <span>{totalQuestions} matches</span>
          </div>
        );
      case 'refined':
        return (
          <div className="flex items-center gap-1 text-xs text-[#6EFFC6]">
            <Check className="w-3 h-3" />
            <span>{selectedCount} selected</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getDisplayTitle = (session: QuestionSession) => {
    return session.refinedChallenge || session.question;
  };

  const handleAskNewQuestion = () => {
    if (onSendMessageToChat) {
      onSendMessageToChat("I'd like to explore a new challenge. Can you help me identify and refine it?");
    }
    setIsOpen(false);
  };

  const handleModuleSwitch = (moduleType: 'questions' | 'setup') => {
    if (onSwitchToModule) {
      onSwitchToModule(moduleType);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Menu Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="text-[#003079] hover:bg-white/50 p-2"
      >
        <Menu className="w-4 h-4" />
      </Button>

      {/* Menu Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-10 left-0 z-50 w-80 bg-white rounded-lg shadow-lg border border-[#6EFFC6]/20 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-[#003079]">Canvas Modules</h3>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-[#003079] hover:bg-white/50 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Module Navigation */}
            {currentTriggerType === 'fortuInstanceSetup' && (
              <div className="mb-4 p-2 bg-[#F1EDFF] rounded-lg">
                <div className="space-y-2">
                  <Button
                    onClick={() => handleModuleSwitch('questions')}
                    variant={activeModule === 'questions' ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-full justify-start ${
                      activeModule === 'questions'
                        ? 'bg-[#753BBD] text-white'
                        : 'text-[#003079] hover:bg-white/50'
                    }`}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Question Search
                  </Button>
                  <Button
                    onClick={() => handleModuleSwitch('setup')}
                    variant={activeModule === 'setup' ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-full justify-start ${
                      activeModule === 'setup'
                        ? 'bg-[#753BBD] text-white'
                        : 'text-[#003079] hover:bg-white/50'
                    }`}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Fortu.ai Setup
                  </Button>
                </div>
              </div>
            )}

            {/* Question Sessions */}
            {sessionsWithRefinedChallenges.length > 1 && (
              <>
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-[#003079] mb-2">Question Sessions</h4>
                </div>

                <ScrollArea className="max-h-60 mb-4">
                  <div className="space-y-2">
                    {sessionsWithRefinedChallenges.map((session) => (
                      <div
                        key={session.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          session.id === activeSessionId
                            ? 'border-[#6EFFC6] bg-[#EEFFF3]'
                            : 'border-gray-200 hover:border-[#6EFFC6]/50 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          onSwitchToSession(session.id);
                          handleModuleSwitch('questions');
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#003079] truncate">
                              {getDisplayTitle(session)}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              {getStatusBadge(session)}
                              <span className="text-xs text-gray-500">
                                {session.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}

            {/* New Question Button */}
            <Button
              onClick={handleAskNewQuestion}
              variant="outline"
              size="sm"
              className="w-full border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ask New Question
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
