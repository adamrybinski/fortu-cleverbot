
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Target, Users, TrendingUp, Lightbulb, Search } from 'lucide-react';

interface FortuQuestionsCanvasProps {
  payload?: Record<string, any>;
}

// Simulated fortune questions database
const simulatedQuestions = [
  {
    id: 1,
    question: "How do we reduce customer churn without sacrificing growth?",
    relevance: 95,
    category: "Customer Retention",
    context: "SaaS, B2B",
    insights: "47 organisations tackled this",
    icon: Users,
    details: {
      approaches: ["Predictive analytics", "Customer success programs", "Value realisation tracking"],
      outcomes: ["32% average churn reduction", "18% increase in LTV"],
      timeframe: "3-6 months implementation"
    }
  },
  {
    id: 2,
    question: "How do we accelerate revenue growth whilst maintaining quality?",
    relevance: 89,
    category: "Growth Strategy",
    context: "Scale-up, Tech",
    insights: "23 organisations tackled this",
    icon: TrendingUp,
    details: {
      approaches: ["Quality-first sales process", "Account expansion strategy", "Product-led growth"],
      outcomes: ["67% revenue increase", "Maintained 4.8/5 quality score"],
      timeframe: "6-12 months implementation"
    }
  },
  {
    id: 3,
    question: "How do we improve customer satisfaction while reducing costs?",
    relevance: 82,
    category: "Operational Excellence",
    context: "Service, Enterprise",
    insights: "31 organisations tackled this",
    icon: Target,
    details: {
      approaches: ["Self-service automation", "Proactive support", "Community building"],
      outcomes: ["45% cost reduction", "87% satisfaction increase"],
      timeframe: "4-8 months implementation"
    }
  }
];

export const FortuQuestionsCanvas: React.FC<FortuQuestionsCanvasProps> = ({ payload }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [searchActive, setSearchActive] = useState(false);

  const isSearchReady = payload?.searchReady;
  const refinedChallenge = payload?.refinedChallenge;

  // Simulate search animation
  const handleSearch = () => {
    setSearchActive(true);
    setTimeout(() => {
      setSearchActive(false);
    }, 2000);
  };

  const selectedQuestionData = simulatedQuestions.find(q => q.id === selectedQuestion);

  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-[#F1EDFF] to-[#EEFFF3]">
      <div className="w-full h-full bg-white rounded-lg border border-[#6EFFC6]/30 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-[#6EFFC6]/20 bg-gradient-to-r from-[#F1EDFF]/50 to-[#EEFFF3]/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#753BBD]/10 flex items-center justify-center">
              <Search className="w-6 h-6 text-[#753BBD]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#003079]">fortu.ai Question Search</h3>
              <p className="text-[#1D253A]/70 text-sm">Discover proven approaches to your business challenge</p>
            </div>
          </div>

          {refinedChallenge && (
            <div className="bg-white/80 rounded-lg p-4">
              <h4 className="font-medium text-[#003079] mb-2">Your Refined Challenge:</h4>
              <p className="text-[#1D253A]/80 text-sm italic">"{refinedChallenge}"</p>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          
          {/* Questions List */}
          <div className="w-1/2 border-r border-[#6EFFC6]/20 p-6">
            {isSearchReady ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-medium text-[#003079]">Matching Questions</h4>
                  <Button
                    onClick={handleSearch}
                    size="sm"
                    className="bg-[#753BBD] hover:bg-[#753BBD]/90 text-white"
                    disabled={searchActive}
                  >
                    {searchActive ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Searching...
                      </div>
                    ) : (
                      'Refresh Search'
                    )}
                  </Button>
                </div>

                <div className="space-y-3">
                  {simulatedQuestions.map((question) => {
                    const Icon = question.icon;
                    return (
                      <div
                        key={question.id}
                        onClick={() => setSelectedQuestion(question.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedQuestion === question.id
                            ? 'border-[#753BBD] bg-[#753BBD]/5'
                            : 'border-[#6EFFC6]/30 hover:border-[#6EFFC6]/60 hover:bg-[#EEFFF3]/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#6EFFC6]/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <Icon className="w-4 h-4 text-[#003079]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-[#753BBD]/10 text-[#753BBD] px-2 py-1 rounded-full font-medium">
                                {question.relevance}% match
                              </span>
                              <span className="text-xs text-[#1D253A]/60">{question.context}</span>
                            </div>
                            <p className="font-medium text-[#003079] text-sm mb-1 leading-tight">
                              {question.question}
                            </p>
                            <p className="text-xs text-[#1D253A]/70">{question.insights}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#1D253A]/40 flex-shrink-0 mt-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6EFFC6]/20 flex items-center justify-center">
                  <Search className="w-8 h-8 text-[#6EFFC6]" />
                </div>
                <h4 className="font-medium text-[#003079] mb-2">Search Ready</h4>
                <p className="text-[#1D253A]/70 text-sm mb-4">
                  Complete your challenge refinement in the chat to unlock relevant fortune questions.
                </p>
                <Button
                  onClick={handleSearch}
                  variant="outline"
                  size="sm"
                  className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
                >
                  Preview Search
                </Button>
              </div>
            )}
          </div>

          {/* Question Details */}
          <div className="w-1/2 p-6">
            {selectedQuestionData ? (
              <div>
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#753BBD]/10 flex items-center justify-center">
                    <selectedQuestionData.icon className="w-5 h-5 text-[#753BBD]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#003079] mb-2">{selectedQuestionData.question}</h4>
                    <div className="flex items-center gap-3 text-sm text-[#1D253A]/70">
                      <span className="bg-[#753BBD]/10 text-[#753BBD] px-2 py-1 rounded-full">
                        {selectedQuestionData.category}
                      </span>
                      <span>{selectedQuestionData.insights}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h5 className="font-medium text-[#003079] mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Proven Approaches
                    </h5>
                    <div className="space-y-2">
                      {selectedQuestionData.details.approaches.map((approach, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-[#EEFFF3]/50 rounded-lg">
                          <div className="w-2 h-2 bg-[#6EFFC6] rounded-full"></div>
                          <span className="text-sm text-[#1D253A]">{approach}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-[#003079] mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Typical Outcomes
                    </h5>
                    <div className="space-y-2">
                      {selectedQuestionData.details.outcomes.map((outcome, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-[#F1EDFF]/50 rounded-lg">
                          <div className="w-2 h-2 bg-[#753BBD] rounded-full"></div>
                          <span className="text-sm text-[#1D253A]">{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-[#6EFFC6]/10 rounded-lg">
                    <h5 className="font-medium text-[#003079] mb-2">Implementation Timeline</h5>
                    <p className="text-sm text-[#1D253A]/80">{selectedQuestionData.details.timeframe}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F1EDFF]/50 flex items-center justify-center">
                  <Target className="w-8 h-8 text-[#753BBD]/50" />
                </div>
                <h4 className="font-medium text-[#003079] mb-2">Select a Question</h4>
                <p className="text-[#1D253A]/70 text-sm">
                  Click on a question from the list to explore detailed insights and proven approaches.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
