
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Brain, FileText, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { useGrantAI } from '@/hooks/useGrantAI';
import { toast } from 'sonner';

const applicationSections = [
  {
    id: 'executive-summary',
    title: 'Executive Summary',
    description: 'Provide a concise overview of your project and its objectives',
    wordCount: { min: 200, max: 400 }
  },
  {
    id: 'project-description',
    title: 'Project Description',
    description: 'Detailed description of your project, methodology, and approach',
    wordCount: { min: 500, max: 1000 }
  },
  {
    id: 'budget-justification',
    title: 'Budget Justification',
    description: 'Detailed breakdown and justification of project costs',
    wordCount: { min: 300, max: 600 }
  },
  {
    id: 'team-qualifications',
    title: 'Team Qualifications',
    description: 'Overview of team members and their relevant experience',
    wordCount: { min: 300, max: 500 }
  },
  {
    id: 'impact-statement',
    title: 'Impact Statement',
    description: 'Expected outcomes and impact of your project',
    wordCount: { min: 250, max: 400 }
  }
];

// Mock grant details
const mockGrantDetails = {
  title: 'Small Business Innovation Research (SBIR)',
  agency: 'National Science Foundation',
  amount: '$500,000',
  description: 'Support for small businesses conducting research and development'
};

const mockBusinessProfile = {
  company_name: 'TechStart Inc.',
  industry: 'Technology',
  description: 'AI-powered software solutions'
};

const AIApplicationAssistant = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [sectionContent, setSectionContent] = useState({});
  const [sectionScores, setSectionScores] = useState({});
  const [suggestions, setSuggestions] = useState({});
  const { generateApplicationDraft, analyzeApplication, loading } = useGrantAI();

  const handleGenerateDraft = async (sectionId) => {
    try {
      const draft = await generateApplicationDraft(
        mockGrantDetails,
        mockBusinessProfile,
        applicationSections.find(s => s.id === sectionId)?.title
      );
      
      setSectionContent(prev => ({
        ...prev,
        [sectionId]: draft.content
      }));
      
      toast.success('Draft generated successfully!');
    } catch (error) {
      console.error('Draft generation failed:', error);
      toast.error('Failed to generate draft');
    }
  };

  const handleAnalyzeSection = async (sectionId) => {
    const content = sectionContent[sectionId];
    if (!content) {
      toast.error('Please add content before analyzing');
      return;
    }

    try {
      const analysis = await analyzeApplication(
        { [sectionId]: content },
        mockGrantDetails
      );
      
      setSectionScores(prev => ({
        ...prev,
        [sectionId]: analysis.sectionScores?.[sectionId] || 75
      }));
      
      setSuggestions(prev => ({
        ...prev,
        [sectionId]: analysis.improvements || []
      }));
      
      toast.success('Section analyzed successfully!');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze section');
    }
  };

  const getWordCount = (text) => {
    return text ? text.trim().split(/\s+/).length : 0;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const currentSectionData = applicationSections[currentSection];
  const currentContent = sectionContent[currentSectionData?.id] || '';
  const wordCount = getWordCount(currentContent);
  const score = sectionScores[currentSectionData?.id];
  const sectionSuggestions = suggestions[currentSectionData?.id] || [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">AI Application Assistant</h1>
        </div>
        <p className="text-slate-600">Let AI help you write winning grant applications</p>
      </div>

      {/* Grant Info */}
      <Card>
        <CardHeader>
          <CardTitle>Application for: {mockGrantDetails.title}</CardTitle>
          <p className="text-sm text-slate-600">{mockGrantDetails.agency} • {mockGrantDetails.amount}</p>
        </CardHeader>
      </Card>

      {/* Section Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Application Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {applicationSections.map((section, index) => (
              <Button 
                key={section.id}
                variant={currentSection === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentSection(index)}
                className="relative"
              >
                {section.title}
                {sectionScores[section.id] && (
                  <Badge 
                    className={`ml-2 ${getScoreColor(sectionScores[section.id])}`}
                    variant="secondary"
                  >
                    {sectionScores[section.id]}%
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Section Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{currentSectionData?.title}</span>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleGenerateDraft(currentSectionData?.id)}
                disabled={loading}
                size="sm"
              >
                <Brain className="h-4 w-4 mr-2" />
                Generate with AI
              </Button>
              <Button 
                onClick={() => handleAnalyzeSection(currentSectionData?.id)}
                disabled={loading || !currentContent}
                variant="outline"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Analyze Quality
              </Button>
            </div>
          </CardTitle>
          <p className="text-sm text-slate-600">{currentSectionData?.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={currentContent}
            onChange={(e) => setSectionContent(prev => ({
              ...prev,
              [currentSectionData?.id]: e.target.value
            }))}
            placeholder={`Write your ${currentSectionData?.title.toLowerCase()} here, or click "Generate with AI" for a draft...`}
            className="min-h-[300px]"
          />
          
          {/* Word Count and Quality Score */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Word Count: {wordCount} / {currentSectionData?.wordCount.min}-{currentSectionData?.wordCount.max} recommended
            </div>
            {score && (
              <div className="flex items-center gap-2">
                <span className="text-sm">Quality Score:</span>
                <Badge className={getScoreColor(score)}>
                  {score}%
                </Badge>
                <Progress value={score} className="w-20 h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {sectionSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              AI Improvement Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {sectionSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Navigation and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            variant="outline"
          >
            Previous Section
          </Button>
          <Button 
            onClick={() => setCurrentSection(Math.min(applicationSections.length - 1, currentSection + 1))}
            disabled={currentSection === applicationSections.length - 1}
            variant="outline"
          >
            Next Section
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            Save Draft
          </Button>
          <Button variant="outline">
            Export PDF
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            Submit Application
          </Button>
        </div>
      </div>

      {/* Quality Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Application Quality Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">All sections completed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Word count within range</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Grammar and spell check</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Supporting documents attached</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Budget calculations verified</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Deadline requirements met</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIApplicationAssistant;
