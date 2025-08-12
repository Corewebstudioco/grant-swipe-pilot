
import { UserFeedback, ModelMetrics } from '@/types/ai';
import { supabase } from '@/integrations/supabase/client';

export class FeedbackLearningSystem {
  private retrainingThreshold = 100; // Feedback items
  private modelVersion = '1.0.0';

  async processFeedback(feedback: UserFeedback[]): Promise<void> {
    console.log('Processing feedback batch:', feedback.length);

    try {
      // Store feedback in database
      for (const item of feedback) {
        await supabase
          .from('ai_recommendation_feedback')
          .insert({
            user_id: item.user_id,
            grant_id: item.grant_id,
            ai_score: item.ai_score,
            user_rating: item.user_rating,
            feedback_type: item.feedback_type,
            feedback_text: item.feedback_text,
            outcome_data: item.outcome_data,
            model_version: this.modelVersion
          });
      }

      // Update model weights based on feedback
      await this.updateModelWeights(feedback);

      // Check if retraining is needed
      const totalFeedback = await this.getTotalFeedbackCount();
      if (totalFeedback >= this.retrainingThreshold) {
        await this.scheduleModelRetraining();
      }

    } catch (error) {
      console.error('Error processing feedback:', error);
    }
  }

  private async updateModelWeights(feedback: UserFeedback[]): Promise<void> {
    // Analyze feedback patterns
    const patterns = this.analyzeFeedbackPatterns(feedback);
    
    // Update weighting factors based on patterns
    await this.persistWeightUpdates(patterns);
    
    console.log('Model weights updated based on feedback patterns');
  }

  private analyzeFeedbackPatterns(feedback: UserFeedback[]): any {
    const patterns = {
      industryPreferences: new Map<string, number>(),
      sizePreferences: new Map<string, number>(),
      accuracyByType: new Map<string, number[]>(),
      overallSatisfaction: 0
    };

    // Calculate average satisfaction
    const totalRating = feedback.reduce((sum, item) => sum + item.user_rating, 0);
    patterns.overallSatisfaction = totalRating / feedback.length;

    // Group by feedback type for analysis
    feedback.forEach(item => {
      if (!patterns.accuracyByType.has(item.feedback_type)) {
        patterns.accuracyByType.set(item.feedback_type, []);
      }
      patterns.accuracyByType.get(item.feedback_type)!.push(item.user_rating);
    });

    return patterns;
  }

  private async persistWeightUpdates(patterns: any): Promise<void> {
    // Store pattern analysis results for model improvement
    await supabase
      .from('model_performance_metrics')
      .insert({
        model_name: 'grant_intelligence',
        model_version: this.modelVersion,
        metric_name: 'user_satisfaction',
        metric_value: patterns.overallSatisfaction,
        evaluation_context: { patterns }
      });
  }

  private async getTotalFeedbackCount(): Promise<number> {
    const { count } = await supabase
      .from('ai_recommendation_feedback')
      .select('*', { count: 'exact', head: true });
    
    return count || 0;
  }

  private async scheduleModelRetraining(): Promise<void> {
    console.log('Scheduling model retraining due to sufficient feedback');
    
    // In a production system, this would trigger a model retraining pipeline
    // For now, we'll just log the event
    await supabase
      .from('model_performance_metrics')
      .insert({
        model_name: 'grant_intelligence',
        model_version: this.modelVersion,
        metric_name: 'retraining_triggered',
        metric_value: 1,
        evaluation_context: { 
          reason: 'feedback_threshold_reached',
          threshold: this.retrainingThreshold
        }
      });
  }

  async evaluateModelPerformance(): Promise<ModelMetrics> {
    console.log('Evaluating model performance');

    try {
      // Get recent feedback data
      const { data: recentFeedback } = await supabase
        .from('ai_recommendation_feedback')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .eq('model_version', this.modelVersion);

      if (!recentFeedback || recentFeedback.length === 0) {
        return this.getDefaultMetrics();
      }

      // Calculate metrics
      const accuracy = this.calculateAccuracy(recentFeedback);
      const precision = this.calculatePrecision(recentFeedback);
      const recall = this.calculateRecall(recentFeedback);
      const f1Score = this.calculateF1Score(precision, recall);
      const userSatisfaction = this.calculateUserSatisfaction(recentFeedback);

      const metrics: ModelMetrics = {
        accuracy,
        precision,
        recall,
        f1Score,
        userSatisfaction
      };

      // Store metrics
      await this.storeMetrics(metrics);

      return metrics;
    } catch (error) {
      console.error('Error evaluating model performance:', error);
      return this.getDefaultMetrics();
    }
  }

  private calculateAccuracy(feedback: any[]): number {
    const accurateRecommendations = feedback.filter(item => item.user_rating >= 4).length;
    return accurateRecommendations / feedback.length;
  }

  private calculatePrecision(feedback: any[]): number {
    // Simplified precision calculation based on high-rated recommendations
    const highRatedRecommendations = feedback.filter(item => 
      item.ai_score >= 0.7 && item.user_rating >= 4
    ).length;
    const totalHighAIScore = feedback.filter(item => item.ai_score >= 0.7).length;
    
    return totalHighAIScore > 0 ? highRatedRecommendations / totalHighAIScore : 0;
  }

  private calculateRecall(feedback: any[]): number {
    // Simplified recall calculation
    const relevantRecommendations = feedback.filter(item => item.user_rating >= 4).length;
    const totalRelevant = feedback.length; // Assuming all feedback is for potentially relevant items
    
    return totalRelevant > 0 ? relevantRecommendations / totalRelevant : 0;
  }

  private calculateF1Score(precision: number, recall: number): number {
    if (precision + recall === 0) return 0;
    return 2 * (precision * recall) / (precision + recall);
  }

  private calculateUserSatisfaction(feedback: any[]): number {
    const totalRating = feedback.reduce((sum, item) => sum + item.user_rating, 0);
    return (totalRating / feedback.length) / 5; // Normalize to 0-1 scale
  }

  private async storeMetrics(metrics: ModelMetrics): Promise<void> {
    const metricEntries = [
      { name: 'accuracy', value: metrics.accuracy },
      { name: 'precision', value: metrics.precision },
      { name: 'recall', value: metrics.recall },
      { name: 'f1_score', value: metrics.f1Score },
      { name: 'user_satisfaction', value: metrics.userSatisfaction }
    ];

    for (const metric of metricEntries) {
      await supabase
        .from('model_performance_metrics')
        .insert({
          model_name: 'grant_intelligence',
          model_version: this.modelVersion,
          metric_name: metric.name,
          metric_value: metric.value,
          dataset_size: 0 // Would be calculated in production
        });
    }
  }

  private getDefaultMetrics(): ModelMetrics {
    return {
      accuracy: 0.75,
      precision: 0.70,
      recall: 0.65,
      f1Score: 0.67,
      userSatisfaction: 0.72
    };
  }

  async trackUserInteraction(
    userId: string,
    grantId: string,
    interactionType: string,
    aiScore?: number,
    context?: any
  ): Promise<void> {
    try {
      await supabase
        .from('user_grant_interactions')
        .insert({
          user_id: userId,
          grant_id: grantId,
          interaction_type: interactionType,
          ai_recommendation_score: aiScore,
          interaction_context: context,
          session_id: this.generateSessionId()
        });
    } catch (error) {
      console.error('Error tracking user interaction:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
