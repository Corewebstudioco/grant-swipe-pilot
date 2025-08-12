
import { BusinessProfile, ComplianceRequirement, ComplianceReport, ComplianceCheck, ActionItem } from '@/types/ai';
import { supabase } from '@/integrations/supabase/client';

export class ComplianceEngine {
  
  async extractRequirements(grantDescription: string, grantId: string): Promise<ComplianceRequirement[]> {
    console.log('Extracting compliance requirements for grant:', grantId);

    // Check if requirements already extracted
    const { data: existingRequirements } = await supabase
      .from('compliance_requirements')
      .select('*')
      .eq('grant_id', grantId);

    if (existingRequirements && existingRequirements.length > 0) {
      return existingRequirements.map(req => ({
        id: req.id,
        type: req.requirement_type as any,
        description: req.description,
        mandatory: req.is_mandatory,
        validation_criteria: req.validation_criteria as string[] || [],
        documentation_needed: req.documentation_needed || [],
        confidence_score: req.confidence_score
      }));
    }

    // AI-powered requirement extraction (simplified for demo)
    const requirements = await this.performAIExtraction(grantDescription);
    
    // Store extracted requirements
    for (const req of requirements) {
      await supabase
        .from('compliance_requirements')
        .insert({
          grant_id: grantId,
          requirement_type: req.type,
          description: req.description,
          is_mandatory: req.mandatory,
          validation_criteria: req.validation_criteria,
          documentation_needed: req.documentation_needed,
          extracted_by_ai: true,
          confidence_score: req.confidence_score || 0.8
        });
    }

    return requirements;
  }

  private async performAIExtraction(grantDescription: string): Promise<ComplianceRequirement[]> {
    // Simplified AI extraction logic
    const requirements: ComplianceRequirement[] = [];
    const description = grantDescription.toLowerCase();

    // Eligibility requirements
    if (description.includes('small business') || description.includes('sme')) {
      requirements.push({
        id: 'small-business-req',
        type: 'eligibility',
        description: 'Must be a qualified small business',
        mandatory: true,
        validation_criteria: ['SBA certification', 'Employee count < 500', 'Revenue thresholds'],
        documentation_needed: ['SBA certification documents', 'Tax returns', 'Employee records']
      });
    }

    // Financial requirements
    if (description.includes('matching funds') || description.includes('cost share')) {
      requirements.push({
        id: 'matching-funds-req',
        type: 'financial',
        description: 'Matching funds or cost-sharing required',
        mandatory: true,
        validation_criteria: ['Demonstrate available matching funds', 'Provide cost-share commitment'],
        documentation_needed: ['Financial statements', 'Bank statements', 'Commitment letters']
      });
    }

    // Documentation requirements
    if (description.includes('business plan') || description.includes('proposal')) {
      requirements.push({
        id: 'business-plan-req',
        type: 'documentation',
        description: 'Detailed business plan required',
        mandatory: true,
        validation_criteria: ['Executive summary', 'Market analysis', 'Financial projections'],
        documentation_needed: ['Business plan document', 'Market research', 'Financial models']
      });
    }

    // Technical requirements
    if (description.includes('prototype') || description.includes('technology')) {
      requirements.push({
        id: 'tech-readiness-req',
        type: 'technical',
        description: 'Technology readiness demonstration required',
        mandatory: false,
        validation_criteria: ['Working prototype', 'Technical specifications', 'Test results'],
        documentation_needed: ['Technical documentation', 'Test reports', 'Prototype demonstrations']
      });
    }

    // Certification requirements
    if (description.includes('minority-owned') || description.includes('women-owned')) {
      requirements.push({
        id: 'certification-req',
        type: 'certification',
        description: 'Business certification requirements',
        mandatory: false,
        validation_criteria: ['Valid certification status', 'Current documentation'],
        documentation_needed: ['Certification documents', 'Verification letters']
      });
    }

    return requirements;
  }

  async checkBusinessCompliance(
    businessProfile: BusinessProfile,
    requirements: ComplianceRequirement[]
  ): Promise<ComplianceReport> {
    console.log('Checking compliance for business:', businessProfile.company_name);

    const complianceChecks: ComplianceCheck[] = [];

    for (const requirement of requirements) {
      const check = await this.validateRequirement(businessProfile, requirement);
      complianceChecks.push(check);
    }

    const overallCompliance = this.calculateOverallCompliance(complianceChecks);
    const actionItems = this.generateActionItems(complianceChecks);
    const estimatedPreparationTime = this.estimatePreparationTime(complianceChecks);

    return {
      overallCompliance,
      checks: complianceChecks,
      actionItems,
      estimatedPreparationTime
    };
  }

  private async validateRequirement(
    businessProfile: BusinessProfile,
    requirement: ComplianceRequirement
  ): Promise<ComplianceCheck> {
    let status: ComplianceCheck['status'] = 'unknown';
    let confidence = 0.5;
    const recommendations: string[] = [];

    switch (requirement.type) {
      case 'eligibility':
        ({ status, confidence } = this.checkEligibility(businessProfile, requirement));
        break;
      case 'financial':
        ({ status, confidence } = this.checkFinancial(businessProfile, requirement));
        break;
      case 'documentation':
        ({ status, confidence } = this.checkDocumentation(businessProfile, requirement));
        break;
      case 'technical':
        ({ status, confidence } = this.checkTechnical(businessProfile, requirement));
        break;
      case 'certification':
        ({ status, confidence } = this.checkCertification(businessProfile, requirement));
        break;
    }

    // Generate recommendations based on status
    if (status === 'non_compliant' || status === 'partial') {
      recommendations.push(`Address ${requirement.type} requirements: ${requirement.description}`);
      if (requirement.documentation_needed.length > 0) {
        recommendations.push(`Prepare required documents: ${requirement.documentation_needed.join(', ')}`);
      }
    }

    return {
      requirement,
      status,
      confidence,
      recommendations
    };
  }

  private checkEligibility(businessProfile: BusinessProfile, requirement: ComplianceRequirement) {
    const description = requirement.description.toLowerCase();
    let status: ComplianceCheck['status'] = 'unknown';
    let confidence = 0.6;

    if (description.includes('small business')) {
      if (businessProfile.business_size === 'small' || businessProfile.business_size === 'startup') {
        status = 'compliant';
        confidence = 0.9;
      } else {
        status = 'non_compliant';
        confidence = 0.8;
      }
    }

    if (description.includes('revenue')) {
      if (businessProfile.annual_revenue !== undefined) {
        status = 'compliant';
        confidence = 0.7;
      } else {
        status = 'unknown';
        confidence = 0.3;
      }
    }

    return { status, confidence };
  }

  private checkFinancial(businessProfile: BusinessProfile, requirement: ComplianceRequirement) {
    const description = requirement.description.toLowerCase();
    let status: ComplianceCheck['status'] = 'unknown';
    let confidence = 0.4;

    if (description.includes('matching funds') || description.includes('cost share')) {
      // Simplified check - assume partial compliance if revenue data exists
      if (businessProfile.annual_revenue && businessProfile.annual_revenue > 0) {
        status = 'partial';
        confidence = 0.6;
      } else {
        status = 'unknown';
        confidence = 0.3;
      }
    }

    return { status, confidence };
  }

  private checkDocumentation(businessProfile: BusinessProfile, requirement: ComplianceRequirement) {
    let status: ComplianceCheck['status'] = 'partial';
    let confidence = 0.5;

    // Assume partial documentation compliance based on profile completeness
    const profileCompleteness = this.calculateProfileCompleteness(businessProfile);
    
    if (profileCompleteness > 0.8) {
      status = 'compliant';
      confidence = 0.7;
    } else if (profileCompleteness > 0.5) {
      status = 'partial';
      confidence = 0.6;
    } else {
      status = 'non_compliant';
      confidence = 0.8;
    }

    return { status, confidence };
  }

  private checkTechnical(businessProfile: BusinessProfile, requirement: ComplianceRequirement) {
    let status: ComplianceCheck['status'] = 'unknown';
    let confidence = 0.4;

    if (businessProfile.technology_stack && businessProfile.technology_stack.length > 0) {
      status = 'partial';
      confidence = 0.6;
    }

    if (businessProfile.business_stage === 'prototype' || businessProfile.business_stage === 'growth') {
      status = 'compliant';
      confidence = 0.7;
    }

    return { status, confidence };
  }

  private checkCertification(businessProfile: BusinessProfile, requirement: ComplianceRequirement) {
    let status: ComplianceCheck['status'] = 'unknown';
    let confidence = 0.5;

    if (businessProfile.certifications && businessProfile.certifications.length > 0) {
      status = 'compliant';
      confidence = 0.8;
    } else {
      status = 'non_compliant';
      confidence = 0.6;
    }

    return { status, confidence };
  }

  private calculateProfileCompleteness(businessProfile: BusinessProfile): number {
    const fields = [
      businessProfile.company_name,
      businessProfile.industry,
      businessProfile.business_size,
      businessProfile.location,
      businessProfile.description,
      businessProfile.funding_needs
    ];

    const completedFields = fields.filter(field => field && field !== '').length;
    return completedFields / fields.length;
  }

  private calculateOverallCompliance(checks: ComplianceCheck[]): number {
    const statusScores = {
      'compliant': 1.0,
      'partial': 0.6,
      'non_compliant': 0.2,
      'unknown': 0.4
    };

    const totalScore = checks.reduce((sum, check) => {
      const baseScore = statusScores[check.status];
      const weightedScore = baseScore * check.confidence;
      return sum + (check.requirement.mandatory ? weightedScore * 1.5 : weightedScore);
    }, 0);

    const totalWeight = checks.reduce((sum, check) => {
      return sum + (check.requirement.mandatory ? 1.5 : 1.0);
    }, 0);

    return Math.round((totalScore / totalWeight) * 100);
  }

  private generateActionItems(checks: ComplianceCheck[]): ActionItem[] {
    const actionItems: ActionItem[] = [];

    checks.forEach(check => {
      if (check.status === 'non_compliant' || check.status === 'partial') {
        const priority = check.requirement.mandatory ? 'high' : 'medium';
        const estimatedTime = this.estimateTaskTime(check.requirement.type);

        actionItems.push({
          title: `Address ${check.requirement.type} requirement`,
          description: check.requirement.description,
          priority,
          estimatedTime,
          type: check.requirement.type as any
        });

        // Add documentation tasks
        if (check.requirement.documentation_needed.length > 0) {
          actionItems.push({
            title: 'Prepare required documentation',
            description: `Gather and prepare: ${check.requirement.documentation_needed.join(', ')}`,
            priority: priority === 'high' ? 'high' : 'medium',
            estimatedTime: check.requirement.documentation_needed.length * 2,
            type: 'documentation'
          });
        }
      }
    });

    return actionItems;
  }

  private estimateTaskTime(type: string): number {
    const timeEstimates = {
      'eligibility': 4,
      'documentation': 8,
      'certification': 16,
      'financial': 12,
      'technical': 20
    };

    return timeEstimates[type as keyof typeof timeEstimates] || 8;
  }

  private estimatePreparationTime(checks: ComplianceCheck[]): number {
    const nonCompliantChecks = checks.filter(check => 
      check.status === 'non_compliant' || check.status === 'partial'
    );

    return nonCompliantChecks.reduce((total, check) => {
      return total + this.estimateTaskTime(check.requirement.type);
    }, 0);
  }
}
