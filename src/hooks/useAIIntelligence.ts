
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { GrantIntelligenceEngine } from '@/services/ai/GrantIntelligenceEngine';
import { ComplianceEngine } from '@/services/ai/ComplianceEngine';
import { FeedbackLearningSystem } from '@/services/ai/FeedbackLearningSystem';
import { BusinessProfile, AIRecommendation, ComplianceReport, SuccessPrediction, UserFeedback } from '@/types/ai';
import { toast } from 'sonner';

export const useAIIntelligence = () => {
  const [intelligenceEngine] = useState(() => new GrantIntelligenceEngine());
  const [complianceEngine] = useState(() => new ComplianceEngine());
  const [feedbackSystem] = useState(() => new FeedbackLearningSystem());

  const analyzeCompatibilityMutation = useMutation({
    mutationFn: async ({ businessProfile, grantDetails }: { 
      businessProfile: BusinessProfile; 
      grantDetails: any 
    }) => {
      return await intelligenceEngine.analyzeGrantCompatibility(businessProfile, grantDetails);
    },
    onSuccess: () => {
      toast.success('Compatibility analysis completed');
    },
    onError: (error: any) => {
      console.error('Compatibility analysis error:', error);
      toast.error('Failed to analyze grant compatibility');
    },
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: async ({ businessProfile, availableGrants }: { 
      businessProfile: BusinessProfile; 
      availableGrants: any[] 
    }) => {
      return await intelligenceEngine.generateRecommendations(businessProfile, availableGrants);
    },
    onSuccess: (data: AIRecommendation[]) => {
      toast.success(`Generated ${data.length} AI-powered recommendations`);
    },
    onError: (error: any) => {
      console.error('Recommendations generation error:', error);
      toast.error('Failed to generate AI recommendations');
    },
  });

  const checkComplianceMutation = useMutation({
    mutationFn: async ({ businessProfile, grantId, grantDescription }: { 
      businessProfile: BusinessProfile; 
      grantId: string;
      grantDescription: string;
    }) => {
      const requirements = await complianceEngine.extractRequirements(grantDescription, grantId);
      return await complianceEngine.checkBusinessCompliance(businessProfile, requirements);
    },
    onSuccess: () => {
      toast.success('Compliance check completed');
    },
    onError: (error: any) => {
      console.error('Compliance check error:', error);
      toast.error('Failed to check compliance requirements');
    },
  });

  const predictSuccessMutation = useMutation({
    mutationFn: async ({ businessProfile, grantOpportunity }: { 
      businessProfile: BusinessProfile; 
      grantOpportunity: any 
    }) => {
      return await intelligenceEngine.predictSuccessProbability(businessProfile, grantOpportunity);
    },
    onSuccess: () => {
      toast.success('Success prediction completed');
    },
    onError: (error: any) => {
      console.error('Success prediction error:', error);
      toast.error('Failed to predict success probability');
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedback: UserFeedback[]) => {
      return await feedbackSystem.processFeedback(feedback);
    },
    onSuccess: () => {
      toast.success('Feedback submitted successfully');
    },
    onError: (error: any) => {
      console.error('Feedback submission error:', error);
      toast.error('Failed to submit feedback');
    },
  });

  const trackInteractionMutation = useMutation({
    mutationFn: async ({ userId, grantId, interactionType, aiScore, context }: {
      userId: string;
      grantId: string;
      interactionType: string;
      aiScore?: number;
      context?: any;
    }) => {
      return await feedbackSystem.trackUserInteraction(userId, grantId, interactionType, aiScore, context);
    },
    onError: (error: any) => {
      console.error('Interaction tracking error:', error);
    },
  });

  // Query for model performance metrics
  const { data: modelMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['model-metrics'],
    queryFn: () => feedbackSystem.evaluateModelPerformance(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    // Analysis functions
    analyzeCompatibility: analyzeCompatibilityMutation.mutateAsync,
    generateRecommendations: generateRecommendationsMutation.mutateAsync,
    checkCompliance: checkComplianceMutation.mutateAsync,
    predictSuccess: predictSuccessMutation.mutateAsync,
    
    // Feedback functions
    submitFeedback: submitFeedbackMutation.mutateAsync,
    trackInteraction: trackInteractionMutation.mutateAsync,
    
    // Model metrics
    modelMetrics,
    metricsLoading,
    
    // Loading states
    isAnalyzing: analyzeCompatibilityMutation.isPending,
    isGeneratingRecommendations: generateRecommendationsMutation.isPending,
    isCheckingCompliance: checkComplianceMutation.isPending,
    isPredictingSuccess: predictSuccessMutation.isPending,
    isSubmittingFeedback: submitFeedbackMutation.isPending,
    isTrackingInteraction: trackInteractionMutation.isPending,
  };
};
