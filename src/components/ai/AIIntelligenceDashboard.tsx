
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Target, CheckCircle, TrendingUp, Star, AlertTriangle } from 'lucide-react';
import { useAIIntelligence } from '@/hooks/useAIIntelligence';
import { BusinessProfile, AIRecommendation, ComplianceReport, SuccessPrediction } from '@/types/ai';

interface AIIntelligenceDashboardProps {
  businessProfile: BusinessProfile;
  availableGrants: any[];
}

export const AIIntelligenceDashboard: React.FC<AIIntelligenceDashboardProps> = ({
  businessProfile,
  availableGrants
}) => {
  const {
    generateRecommendations,
    checkCompliance,
    predictSuccess,
    trackInteraction,
    modelMetrics,
    isGeneratingRecommendations,
    isCheckingCompliance,
    isPredictingSuccess
  } = useAIIntelligence();

  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [successPrediction, setSuccessPrediction] = useState<SuccessPrediction | null>(null);
  const [selectedGrant, setSelectedGrant] = useState<any>(null);

  const handleGenerateRecommendations = async () => {
    try {
      const results = await generateRecommendations({
        businessProfile,
        availableGrants
      });
      setRecommendations(results);
      
      // Track AI usage
      await trackInteraction({
        userId: businessProfile.company_name,
        grantId: 'ai_recommendations',
        interactionType: 'generated',
        context: { count: results.length }
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  };

  const handleCheckCompliance = async (grant: any) => {
    if (!grant) return;
    
    try {
      const report = await checkCompliance({
        businessProfile,
        grantId: grant.id,
        grantDescription: grant.description || ''
      });
      setComplianceReport(report);
      setSelectedGrant(grant);
      
      await trackInteraction({
        userId: businessProfile.company_name,
        grantId: grant.id,
        interactionType: 'compliance_check'
      });
    } catch (error) {
      console.error('Error checking compliance:', error);
    }
  };

  const handlePredictSuccess = async (grant: any) => {
    if (!grant) return;
    
    try {
      const prediction = await predictSuccess({
        businessProfile,
        grantOpportunity: grant
      });
      setSuccessPrediction(prediction);
      
      await trackInteraction({
        userId: businessProfile.company_name,
        grantId: grant.id,
        interactionType: 'success_prediction',
        aiScore: prediction.probability
      });
    } catch (error) {
      console.error('Error predicting success:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Grant Intelligence</h2>
          <p className="text-muted-foreground">
            Advanced AI-powered grant matching and analysis for {businessProfile.company_name}
          </p>
        </div>
        <Button 
          onClick={handleGenerateRecommendations}
          disabled={isGeneratingRecommendations}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          {isGeneratingRecommendations ? 'Analyzing...' : 'Generate AI Recommendations'}
        </Button>
      </div>

      {/* Model Performance Metrics */}
      {modelMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Model Performance
            </CardTitle>
            <CardDescription>
              Real-time performance metrics for our AI recommendation engine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(modelMetrics.accuracy * 100)}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(modelMetrics.precision * 100)}%</div>
                <div className="text-sm text-muted-foreground">Precision</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(modelMetrics.recall * 100)}%</div>
                <div className="text-sm text-muted-foreground">Recall</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(modelMetrics.f1Score * 100)}%</div>
                <div className="text-sm text-muted-foreground">F1 Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  {Math.round(modelMetrics.userSatisfaction * 5 * 10) / 10}
                  <Star className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="text-sm text-muted-foreground">User Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Analysis</TabsTrigger>
          <TabsTrigger value="predictions">Success Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length > 0 ? (
            <div className="grid gap-4">
              {recommendations.map((rec) => (
                <Card key={rec.grantId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {rec.title}
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{rec.reasoning}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{rec.score}%</div>
                        <div className="text-sm text-muted-foreground">Match Score</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Compatibility Breakdown */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(rec.compatibilityBreakdown).map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                              <span>{Math.round(value)}%</span>
                            </div>
                            <Progress value={value} className="h-2" />
                          </div>
                        ))}
                      </div>

                      {/* Success Prediction */}
                      <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                        <Target className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">
                            Success Probability: {Math.round(rec.successPrediction.probability * 100)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Confidence: {Math.round(rec.successPrediction.confidence * 100)}%
                          </div>
                        </div>
                      </div>

                      {/* Action Items */}
                      <div>
                        <h4 className="font-medium mb-2">Recommended Actions:</h4>
                        <ul className="space-y-1">
                          {rec.actionItems.map((action, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const grant = availableGrants.find(g => g.id === rec.grantId);
                            handleCheckCompliance(grant);
                          }}
                          disabled={isCheckingCompliance}
                        >
                          Check Compliance
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const grant = availableGrants.find(g => g.id === rec.grantId);
                            handlePredictSuccess(grant);
                          }}
                          disabled={isPredictingSuccess}
                        >
                          Detailed Prediction
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No AI Recommendations Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Click "Generate AI Recommendations" to get personalized grant matches
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          {complianceReport ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Compliance Analysis: {selectedGrant?.title}
                </CardTitle>
                <CardDescription>
                  Detailed compliance assessment for grant requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Overall Compliance Score */}
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <div className={`text-4xl font-bold ${getComplianceColor(complianceReport.overallCompliance)}`}>
                      {complianceReport.overallCompliance}%
                    </div>
                    <div className="text-muted-foreground">Overall Compliance</div>
                    <div className="text-sm mt-2">
                      Estimated preparation time: {complianceReport.estimatedPreparationTime} hours
                    </div>
                  </div>

                  {/* Individual Compliance Checks */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Compliance Requirements:</h4>
                    {complianceReport.checks.map((check, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium">{check.requirement.description}</div>
                            <Badge variant="outline" className="mt-1">
                              {check.requirement.type}
                            </Badge>
                          </div>
                          <Badge 
                            variant={check.status === 'compliant' ? 'default' : 'destructive'}
                          >
                            {check.status}
                          </Badge>
                        </div>
                        {check.recommendations.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm font-medium text-muted-foreground">Recommendations:</div>
                            <ul className="text-sm space-y-1 mt-1">
                              {check.recommendations.map((rec, recIndex) => (
                                <li key={recIndex} className="flex items-start gap-2">
                                  <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action Items */}
                  {complianceReport.actionItems.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Action Items:</h4>
                      <div className="space-y-2">
                        {complianceReport.actionItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{item.title}</div>
                              <div className="text-sm text-muted-foreground">{item.description}</div>
                            </div>
                            <div className="text-right">
                              <Badge className={getPriorityColor(item.priority)}>
                                {item.priority}
                              </Badge>
                              <div className="text-sm text-muted-foreground mt-1">
                                {item.estimatedTime}h
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Compliance Analysis Yet</h3>
                  <p className="text-muted-foreground">
                    Select a grant recommendation and click "Check Compliance" to see detailed requirements
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          {successPrediction ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Success Prediction Analysis
                </CardTitle>
                <CardDescription>
                  AI-powered probability assessment and improvement suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Success Probability */}
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <div className="text-4xl font-bold text-primary">
                      {Math.round(successPrediction.probability * 100)}%
                    </div>
                    <div className="text-muted-foreground">Success Probability</div>
                    <div className="text-sm mt-2">
                      Confidence Level: {Math.round(successPrediction.confidence * 100)}%
                    </div>
                  </div>

                  {/* Key Success Factors */}
                  <div>
                    <h4 className="font-medium mb-3">Key Success Factors:</h4>
                    <div className="grid gap-2">
                      {successPrediction.keyFactors.map((factor, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Improvement Suggestions */}
                  <div>
                    <h4 className="font-medium mb-3">Improvement Suggestions:</h4>
                    <div className="grid gap-2">
                      {successPrediction.improvementSuggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Success Prediction Yet</h3>
                  <p className="text-muted-foreground">
                    Select a grant recommendation and click "Detailed Prediction" to see success analysis
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
