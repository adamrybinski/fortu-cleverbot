
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus, Building2, Globe, Lock, Users } from 'lucide-react';
import { Question } from './types';

interface FortuInstanceSetupProps {
  payload?: {
    refinedChallenge?: string;
    fortuQuestions?: Question[];
    aiQuestions?: Question[];
  };
  onComplete?: (instanceData: any) => void;
  onCancel?: () => void;
}

export const FortuInstanceSetup: React.FC<FortuInstanceSetupProps> = ({
  payload,
  onComplete,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    instanceName: '',
    company: '',
    industry: '',
    description: payload?.refinedChallenge || '',
    accessLevel: 'private' as 'public' | 'private' | 'team',
    teamMembers: ['']
  });

  const [approvedQuestions, setApprovedQuestions] = useState<Question[]>(() => {
    const allQuestions = [
      ...(payload?.fortuQuestions || []),
      ...(payload?.aiQuestions || [])
    ];
    return allQuestions.map(q => ({ ...q, status: 'Pre-approved' as const }));
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, '']
    }));
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  const updateTeamMember = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => i === index ? value : member)
    }));
  };

  const toggleQuestionApproval = (questionId: string | number, approved: boolean) => {
    setApprovedQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? { ...q, selected: approved }
          : q
      )
    );
  };

  const handleSubmit = () => {
    const instanceData = {
      ...formData,
      teamMembers: formData.teamMembers.filter(member => member.trim()),
      questions: approvedQuestions.filter(q => q.selected),
      totalQuestions: approvedQuestions.length,
      approvedQuestions: approvedQuestions.filter(q => q.selected).length
    };

    if (onComplete) {
      onComplete(instanceData);
    }
  };

  const getAccessIcon = (level: string) => {
    switch (level) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'team': return <Users className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  const approvedCount = approvedQuestions.filter(q => q.selected).length;

  return (
    <div className="p-6 bg-gradient-to-br from-[#F1EDFF] to-[#EEFFF3] min-h-full">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[#003079] flex items-center justify-center gap-2">
            <Building2 className="w-6 h-6 text-[#753BBD]" />
            Setup fortu.ai Instance
          </h1>
          <p className="text-[#1D253A]">
            Create your fortu.ai instance with pre-approved questions from your challenge exploration
          </p>
        </div>

        {/* Instance Configuration */}
        <Card className="border-[#6EFFC6]/30">
          <CardHeader>
            <CardTitle className="text-[#003079]">Instance Configuration</CardTitle>
            <CardDescription>Configure your fortu.ai instance settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instanceName" className="text-[#003079]">Instance Name *</Label>
                <Input
                  id="instanceName"
                  value={formData.instanceName}
                  onChange={(e) => handleInputChange('instanceName', e.target.value)}
                  placeholder="e.g., Customer Retention Initiative"
                  className="border-[#6EFFC6]/30 focus:border-[#753BBD]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-[#003079]">Company/Organisation *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="e.g., Acme Corp"
                  className="border-[#6EFFC6]/30 focus:border-[#753BBD]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-[#003079]">Industry/Sector</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder="e.g., Technology, Healthcare, Finance"
                className="border-[#6EFFC6]/30 focus:border-[#753BBD]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#003079]">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your challenge or initiative"
                className="border-[#6EFFC6]/30 focus:border-[#753BBD] min-h-20"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[#003079]">Access Level</Label>
              <RadioGroup
                value={formData.accessLevel}
                onValueChange={(value) => handleInputChange('accessLevel', value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                    <Globe className="w-4 h-4" />
                    Public - Anyone can view and participate
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                    <Lock className="w-4 h-4" />
                    Private - Only you can access
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="team" id="team" />
                  <Label htmlFor="team" className="flex items-center gap-2 cursor-pointer">
                    <Users className="w-4 h-4" />
                    Team - Invite specific team members
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.accessLevel === 'team' && (
              <div className="space-y-2">
                <Label className="text-[#003079]">Team Members</Label>
                {formData.teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={member}
                      onChange={(e) => updateTeamMember(index, e.target.value)}
                      placeholder="email@example.com"
                      className="border-[#6EFFC6]/30 focus:border-[#753BBD]"
                    />
                    {formData.teamMembers.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTeamMember(index)}
                        className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTeamMember}
                  className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Team Member
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions Review */}
        <Card className="border-[#6EFFC6]/30">
          <CardHeader>
            <CardTitle className="text-[#003079] flex items-center justify-between">
              <span>Pre-approved Questions</span>
              <Badge variant="outline" className="border-[#753BBD] text-[#753BBD]">
                {approvedCount} of {approvedQuestions.length} selected
              </Badge>
            </CardTitle>
            <CardDescription>
              Review and approve questions to include in your fortu.ai instance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvedQuestions.map((question) => (
                <div
                  key={question.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    question.selected
                      ? 'border-[#753BBD] bg-[#753BBD]/5'
                      : 'border-[#6EFFC6]/30 bg-white/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={question.selected || false}
                      onCheckedChange={(checked) => toggleQuestionApproval(question.id, !!checked)}
                      className="mt-1 border-[#753BBD] data-[state=checked]:bg-[#753BBD] data-[state=checked]:text-white"
                    />
                    <div className="flex-1">
                      <p className="text-[#003079] font-medium">{question.question}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {question.source === 'fortu' ? 'fortu.ai match' : 'AI suggestion'}
                        </Badge>
                        {question.status && (
                          <Badge variant="outline" className="text-xs border-[#753BBD] text-[#753BBD]">
                            {question.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!formData.instanceName || !formData.company || approvedCount === 0}
            className="bg-[#753BBD] hover:bg-[#753BBD]/90 text-white"
          >
            Create fortu.ai Instance
          </Button>
        </div>
      </div>
    </div>
  );
};
