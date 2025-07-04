
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/utils/api';
import { toast } from 'sonner';

export const useGrantAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeGrantMutation = useMutation({
    mutationFn: ({ businessProfile, grantDetails }: { businessProfile: any; grantDetails: any }) =>
      aiApi.analyzeGrant(businessProfile, grantDetails),
    onSuccess: () => {
      toast.success('Grant analysis completed successfully');
    },
    onError: (error: any) => {
      console.error('Grant analysis error:', error);
      toast.error('Failed to analyze grant compatibility');
      setError('Failed to analyze grant compatibility');
    },
  });

  const getRecommendationsMutation = useMutation({
    mutationFn: ({ businessProfile, availableGrants }: { businessProfile: any; availableGrants: any[] }) =>
      aiApi.getRecommendations(businessProfile, availableGrants),
    onSuccess: () => {
      toast.success('Grant recommendations generated successfully');
    },
    onError: (error: any) => {
      console.error('Recommendations error:', error);
      toast.error('Failed to generate grant recommendations');
      setError('Failed to generate grant recommendations');
    },
  });

  const getApplicationGuidanceMutation = useMutation({
    mutationFn: ({ grantDetails, businessProfile }: { grantDetails: any; businessProfile: any }) =>
      aiApi.getApplicationGuidance(grantDetails, businessProfile),
    onSuccess: () => {
      toast.success('Application guidance generated successfully');
    },
    onError: (error: any) => {
      console.error('Application guidance error:', error);
      toast.error('Failed to generate application guidance');
      setError('Failed to generate application guidance');
    },
  });

  const generateApplicationDraftMutation = useMutation({
    mutationFn: ({ grantDetails, businessProfile, section }: { grantDetails: any; businessProfile: any; section: string }) =>
      aiApi.generateApplicationDraft(grantDetails, businessProfile, section),
    onSuccess: () => {
      toast.success('Application draft generated successfully');
    },
    onError: (error: any) => {
      console.error('Application draft error:', error);
      toast.error('Failed to generate application draft');
      setError('Failed to generate application draft');
    },
  });

  const analyzeApplicationMutation = useMutation({
    mutationFn: ({ applicationData, grantRequirements }: { applicationData: any; grantRequirements: any }) =>
      aiApi.analyzeApplication(applicationData, grantRequirements),
    onSuccess: () => {
      toast.success('Application analysis completed successfully');
    },
    onError: (error: any) => {
      console.error('Application analysis error:', error);
      toast.error('Failed to analyze application quality');
      setError('Failed to analyze application quality');
    },
  });

  const analyzeGrant = async (businessProfile: any, grantDetails: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeGrantMutation.mutateAsync({ businessProfile, grantDetails });
      return result.data;
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async (businessProfile: any, availableGrants: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRecommendationsMutation.mutateAsync({ businessProfile, availableGrants });
      return result.data;
    } finally {
      setLoading(false);
    }
  };

  const getApplicationGuidance = async (grantDetails: any, businessProfile: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getApplicationGuidanceMutation.mutateAsync({ grantDetails, businessProfile });
      return result.data;
    } finally {
      setLoading(false);
    }
  };

  const generateApplicationDraft = async (grantDetails: any, businessProfile: any, section: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateApplicationDraftMutation.mutateAsync({ grantDetails, businessProfile, section });
      return result.data;
    } finally {
      setLoading(false);
    }
  };

  const analyzeApplication = async (applicationData: any, grantRequirements: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeApplicationMutation.mutateAsync({ applicationData, grantRequirements });
      return result.data;
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeGrant,
    getRecommendations,
    getApplicationGuidance,
    generateApplicationDraft,
    analyzeApplication,
    loading: loading || analyzeGrantMutation.isPending || getRecommendationsMutation.isPending || 
             getApplicationGuidanceMutation.isPending || generateApplicationDraftMutation.isPending || 
             analyzeApplicationMutation.isPending,
    error
  };
};
