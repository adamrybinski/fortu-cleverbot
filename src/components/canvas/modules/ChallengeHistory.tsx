
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, PlayCircle, ArrowRight, Trash2 } from 'lucide-react';
import { ChallengeSession } from '@/hooks/useChallengeHistory';

interface ChallengeHistoryProps {
  challengeHistory: ChallengeSession[];
  currentSessionId: string | null;
  onSwitchToSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onStartNewChallenge: () => void;
  onExploreRemainingQuestions: (sessionId: string) => void;
}

export const ChallengeHistory: React.FC<ChallengeHistoryProps> = ({
  challengeHistory,
  currentSessionId,
  onSwitchToSession,
  onDeleteSession,
  onStartNewChallenge,
  onExploreRemainingQuestions
}) => {
  const getStatusIcon = (status: ChallengeSession['status']) => {
    switch (status) {
      case 'exploring':
        return <PlayCircle className="w-4 h-4 text-[#753BBD]" />;
      case 'refined':
        return <Clock className="w-4 h-4 text-[#6EFFC6]" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: ChallengeSession['status']) => {
    const variants = {
      exploring: 'bg-[#753BBD]/20 text-[#753BBD]',
      refined: 'bg-[#6EFFC6]/20 text-[#003079]',
      completed: 'bg-green-100 text-green-800'
    };

    return (
      <Badge className={`${variants[status]} border-0`}>
        {status === 'exploring' && 'Exploring'}
        {status === 'refined' && 'Refined'}
        {status === 'completed' && 'Completed'}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-[#F1EDFF] to-[#EEFFF3] min-h-full">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#003079] mb-2">Challenge History</h1>
          <p className="text-[#1D253A] mb-4">
            Track your challenge exploration journey and build a comprehensive action plan.
          </p>
          
          <Button
            onClick={onStartNewChallenge}
            className="bg-[#753BBD] hover:bg-[#753BBD]/90 text-white"
          >
            Start New Challenge
          </Button>
        </div>

        {/* Challenge Sessions */}
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4">
            {challengeHistory.length === 0 ? (
              <Card className="border-[#6EFFC6]/30">
                <CardContent className="p-8 text-center">
                  <PlayCircle className="w-12 h-12 text-[#6EFFC6] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#003079] mb-2">No Challenges Yet</h3>
                  <p className="text-[#1D253A] mb-4">
                    Start exploring challenges to build your comprehensive action plan.
                  </p>
                  <Button
                    onClick={onStartNewChallenge}
                    variant="outline"
                    className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
                  >
                    Begin Your First Challenge
                  </Button>
                </CardContent>
              </Card>
            ) : (
              challengeHistory.map((session) => (
                <Card 
                  key={session.id}
                  className={`border transition-all duration-200 hover:shadow-lg ${
                    currentSessionId === session.id 
                      ? 'border-[#753BBD] bg-[#753BBD]/5' 
                      : 'border-[#6EFFC6]/30 hover:border-[#6EFFC6]'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(session.status)}
                        <div>
                          <CardTitle className="text-[#003079] text-base">
                            Challenge #{challengeHistory.indexOf(session) + 1}
                          </CardTitle>
                          <p className="text-sm text-[#1D253A]/70">
                            {formatDate(session.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(session.status)}
                        <Button
                          onClick={() => onDeleteSession(session.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {/* Original Challenge */}
                      <div>
                        <h4 className="font-medium text-[#003079] text-sm mb-1">Original Challenge:</h4>
                        <p className="text-[#1D253A] text-sm leading-relaxed">
                          {session.originalChallenge}
                        </p>
                      </div>

                      {/* Refined Challenge */}
                      {session.refinedChallenge && (
                        <div>
                          <h4 className="font-medium text-[#003079] text-sm mb-1">Refined Challenge:</h4>
                          <p className="text-[#1D253A] text-sm leading-relaxed font-medium">
                            {session.refinedChallenge}
                          </p>
                        </div>
                      )}

                      {/* Questions Summary */}
                      <div className="flex items-center gap-4 text-sm text-[#1D253A]/70">
                        {session.selectedQuestions.length > 0 && (
                          <span>{session.selectedQuestions.length} questions selected</span>
                        )}
                        {session.allQuestions.length > 0 && (
                          <span>{session.allQuestions.length - session.selectedQuestions.length} remaining questions</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {currentSessionId !== session.id && (
                          <Button
                            onClick={() => onSwitchToSession(session.id)}
                            variant="outline"
                            size="sm"
                            className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            Switch To
                          </Button>
                        )}
                        
                        {session.allQuestions.length > session.selectedQuestions.length && (
                          <Button
                            onClick={() => onExploreRemainingQuestions(session.id)}
                            variant="outline"
                            size="sm"
                            className="border-[#753BBD] text-[#753BBD] hover:bg-[#753BBD]/20"
                          >
                            Explore Remaining
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
