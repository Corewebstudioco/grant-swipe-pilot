
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, FileText, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { useGrantAI } from '@/hooks/useGrantAI';
import { toast } from 'sonner';

// Mock grants data for demonstration
const sampleGrants = [
  {
    id: '1',
    title: 'Small Business Innovation Research (SBIR)',
    agency: 'National Science Foundation',
    amount: '$500,000',
    category: 'Innovation',
    description: 'Support for small businesses conducting research and development with commercial potential.',
    eligibility: 'Small businesses with fewer than 500 employees'
  },
  {
    id: '2',
    title: 'Rural Business Development Grant',
    agency: 'USDA',
    amount: '$100,000',
    category: 'Rural Development',
    description: 'Support for rural business development and job creation initiatives.',
    eligibility: 'Businesses located in rural areas'
  },
  {
    id: '3',
    title: 'Clean Energy Technology Grant',
    agency: 'Department of Energy',
    amount: '$750,000',
    category: 'Clean Energy',
    description: 'Funding for innovative clean energy technology development.',
    eligibility: 'Companies developing clean energy solutions'
  }
];

// Mock business profile
const mockBusinessProfile = {
  company_name: 'TechStart Inc.',
  industry: 'Technology',
  business_size: 'Small',
  location: 'California',
  description: 'AI-powered software solutions for small businesses',
  funding_needs: 'Product development and market expansion'
};

const AIGrantAnalyzer = () => {
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const { analyzeGrant, loading } = useGrantAI();

  const handleGrantSelect = async (grant) => {
    setSelectedGrant(grant);
    setAnalysisData(null);
    
    try {
      const analysis = await analyzeGrant(mockBusinessProfile, grant);
      setAnalysisData(analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze grant compatibility');
    }
  };

  const getCompatibilityColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCompatibilityBadgeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">AI Grant Analyzer</h1>
        </div>
        <p className="text-slate-600">Powered by Gemini AI</p>
      </div>

      {/* Sample Grants Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <h2 className="md:col-span-3 text-xl font-semibold text-slate-900 mb-4">Select a Grant to Analyze</h2>
        {sampleGrants.map((grant) => (
          <Card 
            key={grant.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedGrant?.id === grant.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleGrantSelect(grant)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{grant.title}</CardTitle>
              <p className="text-sm text-slate-600">{grant.agency}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">{grant.category}</Badge>
                <p className="text-sm text-slate-700">{grant.description}</p>
                <p className="font-semibold text-green-600">{grant.amount}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analysis Results */}
      {selectedGrant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analysis Results for {selectedGrant.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-4 text-slate-600">Analyzing compatibility...</span>
              </div>
            ) : analysisData ? (
              <div className="space-y-6">
                {/* Compatibility Score */}
                <div className="text-center space-y-4">
                  <Badge className={getCompatibilityBadgeColor(analysisData.compatibilityScore)}>
                    Compatibility Score: {analysisData.compatibilityScore}%
                  </Badge>
                  <Progress 
                    value={analysisData.compatibilityScore} 
                    className="w-full h-4"
                  />
                </div>

                {/* Tabbed Interface */}
                <Tabs defaultValue="analysis" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="guidance">Guidance</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="analysis" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysisData.strengths?.map((strength, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-orange-600">
                            <AlertCircle className="h-5 w-5" />
                            Concerns
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysisData.concerns?.map((concern, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{concern}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="guidance" className="space-y-4">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysisData.recommendations?.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="documents" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Required Documents Checklist
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Business registration documents</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Financial statements (last 3 years)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">Project budget and timeline</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">Letters of support</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">Technical specifications</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Start Application
                  </Button>
                  <Button variant="outline">
                    Generate Draft
                  </Button>
                  <Button variant="outline">
                    Save Analysis
                  </Button>
                  <Button variant="outline">
                    Export Report
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-600 py-8">
                Select a grant above to see AI-powered compatibility analysis
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feature Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <h2 className="md:col-span-3 text-xl font-semibold text-slate-900 mb-4">AI Capabilities</h2>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              Smart Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              AI analyzes your business profile against grant requirements to provide compatibility scores and insights.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Success Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Get personalized recommendations to improve your application's chances of success.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              Application Assistance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              AI-powered draft generation and quality analysis for your grant applications.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIGrantAnalyzer;
