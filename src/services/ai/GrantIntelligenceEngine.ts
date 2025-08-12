
import { BusinessProfile, CompatibilityScore, ComplianceReport, SuccessPrediction, AIRecommendation } from '@/types/ai';
import { supabase } from '@/integrations/supabase/client';

export class GrantIntelligenceEngine {
  private modelVersion = '1.0.0';

  async analyzeGrantCompatibility(
    businessProfile: BusinessProfile, 
    grantDetails: any
  ): Promise<CompatibilityScore> {
    console.log('Analyzing grant compatibility for:', businessProfile.company_name);

    // Calculate individual compatibility scores
    const industryMatch = this.calculateIndustryMatch(businessProfile, grantDetails);
    const sizeCompatibility = this.calculateSizeCompatibility(businessProfile, grantDetails);
    const geographicFit = this.calculateGeographicFit(businessProfile, grantDetails);
    const historicalSuccess = await this.calculateHistoricalSuccess(businessProfile, grantDetails);
    const requirementsCompliance = await this.calculateRequirementsCompliance(businessProfile, grantDetails);
    const fundingAlignment = this.calculateFundingAlignment(businessProfile, grantDetails);

    const breakdown = {
      industry_match: industryMatch,
      size_compatibility: sizeCompatibility,
      geographic_fit: geographicFit,
      historical_success: historicalSuccess,
      requirements_compliance: requirementsCompliance,
      funding_alignment: fundingAlignment
    };

    // Calculate weighted overall score
    const weights = {
      industry_match: 0.25,
      size_compatibility: 0.15,
      geographic_fit: 0.10,
      historical_success: 0.20,
      requirements_compliance: 0.20,
      funding_alignment: 0.10
    };

    const overall = Object.entries(breakdown).reduce((sum, [key, value]) => {
      return sum + (value * weights[key as keyof typeof weights]);
    }, 0);

    const strengths = this.identifyStrengths(breakdown, businessProfile, grantDetails);
    const concerns = this.identifyConcerns(breakdown, businessProfile, grantDetails);
    const recommendations = this.generateRecommendationsList(breakdown, businessProfile, grantDetails);

    return {
      overall: Math.round(overall),
      breakdown,
      strengths,
      concerns,
      recommendations
    };
  }

  private calculateIndustryMatch(businessProfile: BusinessProfile, grantDetails: any): number {
    const businessIndustry = businessProfile.industry?.toLowerCase() || '';
    const grantIndustryTags = grantDetails.industry_tags || [];
    const grantDescription = grantDetails.description?.toLowerCase() || '';

    let score = 0;

    // Direct industry tag matching
    if (grantIndustryTags.some((tag: string) => 
      businessIndustry.includes(tag.toLowerCase()) || tag.toLowerCase().includes(businessIndustry)
    )) {
      score += 0.4;
    }

    // NAICS code matching
    if (businessProfile.naics_codes && grantDetails.naics_codes) {
      const matchingCodes = businessProfile.naics_codes.filter(code => 
        grantDetails.naics_codes.includes(code)
      );
      score += (matchingCodes.length / businessProfile.naics_codes.length) * 0.3;
    }

    // Focus areas alignment
    if (businessProfile.focus_areas) {
      const alignedAreas = businessProfile.focus_areas.filter(area =>
        grantDescription.includes(area.toLowerCase()) ||
        grantIndustryTags.some((tag: string) => tag.toLowerCase().includes(area.toLowerCase()))
      );
      score += (alignedAreas.length / businessProfile.focus_areas.length) * 0.3;
    }

    return Math.min(score * 100, 100);
  }

  private calculateSizeCompatibility(businessProfile: BusinessProfile, grantDetails: any): number {
    const businessSize = businessProfile.business_size;
    const sizeRequirements = grantDetails.business_size_requirements || [];

    if (sizeRequirements.length === 0) return 80; // No restrictions

    if (sizeRequirements.includes(businessSize)) return 100;

    // Partial compatibility for adjacent sizes
    const sizeHierarchy = ['startup', 'small', 'medium', 'large'];
    const businessIndex = sizeHierarchy.indexOf(businessSize);
    const compatibleSizes = sizeRequirements.filter((size: string) => {
      const reqIndex = sizeHierarchy.indexOf(size);
      return Math.abs(businessIndex - reqIndex) <= 1;
    });

    return compatibleSizes.length > 0 ? 60 : 20;
  }

  private calculateGeographicFit(businessProfile: BusinessProfile, grantDetails: any): number {
    const businessLocation = businessProfile.location;
    const locationRestrictions = grantDetails.location_restrictions || [];

    if (locationRestrictions.length === 0) return 90; // No restrictions

    // Check state-level restrictions
    if (locationRestrictions.includes(businessLocation.state)) return 100;

    // Check regional restrictions
    const regionalMatches = locationRestrictions.filter((restriction: string) => 
      restriction.toLowerCase().includes('national') || 
      restriction.toLowerCase().includes('usa') ||
      restriction.toLowerCase().includes('united states')
    );

    return regionalMatches.length > 0 ? 80 : 30;
  }

  private async calculateHistoricalSuccess(businessProfile: BusinessProfile, grantDetails: any): Promise<number> {
    try {
      // Query historical success rates for similar businesses and grants
      const { data: outcomes, error } = await supabase
        .from('grant_application_outcomes')
        .select('actual_outcome, application_score')
        .eq('user_id', businessProfile.company_name) // Simplified for demo
        .not('actual_outcome', 'is', null);

      if (error || !outcomes || outcomes.length === 0) return 50; // Default score

      const successfulApplications = outcomes.filter(outcome => outcome.actual_outcome);
      const successRate = successfulApplications.length / outcomes.length;

      return Math.min(successRate * 100, 100);
    } catch (error) {
      console.error('Error calculating historical success:', error);
      return 50;
    }
  }

  private async calculateRequirementsCompliance(businessProfile: BusinessProfile, grantDetails: any): Promise<number> {
    try {
      // Get compliance requirements for this grant
      const { data: requirements, error } = await supabase
        .from('compliance_requirements')
        .select('*')
        .eq('grant_id', grantDetails.id);

      if (error || !requirements) return 70; // Default if no requirements found

      const totalRequirements = requirements.length;
      if (totalRequirements === 0) return 90;

      let metRequirements = 0;

      requirements.forEach(req => {
        // Simplified compliance checking logic
        if (req.requirement_type === 'eligibility') {
          if (this.checkEligibilityCompliance(businessProfile, req)) {
            metRequirements++;
          }
        } else if (req.requirement_type === 'financial') {
          if (this.checkFinancialCompliance(businessProfile, req)) {
            metRequirements++;
          }
        } else {
          // Default partial compliance for other types
          metRequirements += 0.7;
        }
      });

      return Math.min((metRequirements / totalRequirements) * 100, 100);
    } catch (error) {
      console.error('Error calculating requirements compliance:', error);
      return 70;
    }
  }

  private checkEligibilityCompliance(businessProfile: BusinessProfile, requirement: any): boolean {
    const description = requirement.description?.toLowerCase() || '';
    
    // Business size checks
    if (description.includes('small business') && businessProfile.business_size === 'small') {
      return true;
    }
    
    // Industry checks
    if (businessProfile.industry && description.includes(businessProfile.industry.toLowerCase())) {
      return true;
    }

    return false;
  }

  private checkFinancialCompliance(businessProfile: BusinessProfile, requirement: any): boolean {
    const description = requirement.description?.toLowerCase() || '';
    
    // Revenue requirements
    if (description.includes('revenue') && businessProfile.annual_revenue) {
      // Simplified check - assume compliance if revenue data exists
      return true;
    }

    return false;
  }

  private calculateFundingAlignment(businessProfile: BusinessProfile, grantDetails: any): number {
    const grantAmount = grantDetails.amount || 0;
    const fundingNeeds = businessProfile.funding_needs || '';

    if (!grantAmount) return 60; // Unknown amount

    // Extract funding needs amount (simplified)
    const needsMatch = fundingNeeds.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (!needsMatch) return 70; // No specific amount mentioned

    const neededAmount = parseInt(needsMatch[1].replace(/,/g, ''));
    const ratio = Math.min(grantAmount / neededAmount, neededAmount / grantAmount);

    return Math.max(ratio * 100, 30);
  }

  private identifyStrengths(breakdown: any, businessProfile: BusinessProfile, grantDetails: any): string[] {
    const strengths: string[] = [];

    if (breakdown.industry_match > 80) {
      strengths.push('Strong industry alignment with grant focus areas');
    }
    
    if (breakdown.size_compatibility > 90) {
      strengths.push('Perfect business size match for grant requirements');
    }
    
    if (breakdown.geographic_fit > 90) {
      strengths.push('Ideal geographic location for this funding opportunity');
    }
    
    if (breakdown.historical_success > 70) {
      strengths.push('Strong track record with similar grant applications');
    }

    if (breakdown.requirements_compliance > 85) {
      strengths.push('High compliance with grant eligibility requirements');
    }

    return strengths;
  }

  private identifyConcerns(breakdown: any, businessProfile: BusinessProfile, grantDetails: any): string[] {
    const concerns: string[] = [];

    if (breakdown.industry_match < 50) {
      concerns.push('Limited industry alignment with grant focus areas');
    }
    
    if (breakdown.size_compatibility < 60) {
      concerns.push('Business size may not meet grant requirements');
    }
    
    if (breakdown.geographic_fit < 70) {
      concerns.push('Location restrictions may limit eligibility');
    }
    
    if (breakdown.requirements_compliance < 60) {
      concerns.push('May not meet all compliance requirements');
    }

    return concerns;
  }

  private generateRecommendationsList(breakdown: any, businessProfile: BusinessProfile, grantDetails: any): string[] {
    const recommendations: string[] = [];

    if (breakdown.industry_match < 70) {
      recommendations.push('Strengthen industry positioning and highlight relevant expertise');
    }
    
    if (breakdown.requirements_compliance < 80) {
      recommendations.push('Review and address compliance gaps before applying');
    }
    
    if (breakdown.historical_success < 60) {
      recommendations.push('Consider building grant application experience with smaller opportunities first');
    }

    recommendations.push('Develop a detailed project proposal that directly addresses grant objectives');
    recommendations.push('Prepare comprehensive supporting documentation and financial projections');

    return recommendations;
  }

  async predictSuccessProbability(
    businessProfile: BusinessProfile,
    grantOpportunity: any
  ): Promise<SuccessPrediction> {
    const compatibility = await this.analyzeGrantCompatibility(businessProfile, grantOpportunity);
    
    // Base probability on compatibility score
    let probability = compatibility.overall / 100;
    
    // Adjust based on business stage
    const stageMultipliers = {
      'idea': 0.8,
      'prototype': 0.9,
      'early_revenue': 1.0,
      'growth': 1.1,
      'mature': 1.0
    };
    
    if (businessProfile.business_stage) {
      probability *= stageMultipliers[businessProfile.business_stage];
    }

    // Calculate confidence based on data availability
    let confidence = 0.7; // Base confidence
    if (businessProfile.past_grant_history?.length) confidence += 0.1;
    if (businessProfile.annual_revenue) confidence += 0.1;
    if (businessProfile.certifications?.length) confidence += 0.1;

    const keyFactors = [
      'Industry alignment strength',
      'Compliance with eligibility requirements',
      'Business track record and experience',
      'Funding amount alignment with needs'
    ];

    const improvementSuggestions = [
      'Enhance business documentation and certifications',
      'Build stronger industry partnerships and references',
      'Develop detailed project timeline and milestones',
      'Prepare comprehensive budget justification'
    ];

    return {
      probability: Math.min(probability, 0.95),
      confidence: Math.min(confidence, 1.0),
      keyFactors,
      improvementSuggestions
    };
  }

  async generateRecommendations(
    businessProfile: BusinessProfile,
    availableGrants: any[]
  ): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    for (const grant of availableGrants) {
      const compatibility = await this.analyzeGrantCompatibility(businessProfile, grant);
      const successPrediction = await this.predictSuccessProbability(businessProfile, grant);

      if (compatibility.overall > 30) { // Only include viable matches
        const priority = compatibility.overall > 80 ? 'high' : 
                        compatibility.overall > 60 ? 'medium' : 'low';

        recommendations.push({
          grantId: grant.id,
          title: grant.title,
          score: compatibility.overall,
          reasoning: this.generateReasoningText(compatibility),
          priority,
          actionItems: compatibility.recommendations.slice(0, 3),
          compatibilityBreakdown: compatibility.breakdown,
          successPrediction
        });
      }
    }

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  private generateReasoningText(compatibility: CompatibilityScore): string {
    const topScores = Object.entries(compatibility.breakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);

    return `Strong match based on ${topScores.map(([key]) => 
      key.replace(/_/g, ' ')
    ).join(' and ')}. ${compatibility.strengths[0] || 'Good overall alignment with grant objectives.'}`;
  }
}
