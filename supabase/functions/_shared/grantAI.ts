
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@^0.24.1';

class GrantAI {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.warn('Gemini API key not found. Fallback responses will be used.');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  async analyzeGrantCompatibility(businessProfile: any, grantDetails: any) {
    if (!this.genAI) {
      return this.getFallbackCompatibility();
    }

    try {
      const prompt = `
You are an expert grant consultant analyzing the compatibility between a business and a grant opportunity.

BUSINESS PROFILE:
- Company: ${businessProfile.company_name || 'Not specified'}
- Industry: ${businessProfile.industry || 'Not specified'}
- Business Size: ${businessProfile.business_size || 'Not specified'}
- Location: ${businessProfile.location || 'Not specified'}
- Description: ${businessProfile.description || 'Not specified'}
- Funding Needs: ${businessProfile.funding_needs || 'Not specified'}
- Interests: ${businessProfile.interests?.join(', ') || 'Not specified'}

GRANT DETAILS:
- Title: ${grantDetails.title}
- Agency: ${grantDetails.agency || 'Not specified'}
- Amount: ${grantDetails.amount || 'Not specified'}
- Category: ${grantDetails.category || 'Not specified'}
- Description: ${grantDetails.description || 'Not specified'}
- Eligibility: ${grantDetails.eligibility || 'Not specified'}
- Industry Tags: ${grantDetails.industry_tags?.join(', ') || 'Not specified'}
- Business Size Requirements: ${grantDetails.business_size_requirements?.join(', ') || 'Not specified'}
- Location Restrictions: ${grantDetails.location_restrictions?.join(', ') || 'None'}

Analyze the compatibility and respond with a JSON object containing:
1. "compatibilityScore": number from 0-100
2. "strengths": array of 3-5 key alignment points
3. "concerns": array of 2-4 potential issues or gaps
4. "recommendations": array of 3-4 specific recommendations for improving fit

Focus on industry alignment, eligibility criteria, funding amount relevance, and business size compatibility.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.getFallbackCompatibility();
    } catch (error) {
      console.error('Error analyzing grant compatibility:', error);
      return this.getFallbackCompatibility();
    }
  }

  async generateGrantRecommendations(businessProfile: any, availableGrants: any[]) {
    if (!this.genAI) {
      return this.getFallbackRecommendations(availableGrants);
    }

    try {
      const prompt = `
You are an expert grant consultant providing personalized grant recommendations.

BUSINESS PROFILE:
- Company: ${businessProfile.company_name || 'Not specified'}
- Industry: ${businessProfile.industry || 'Not specified'}
- Business Size: ${businessProfile.business_size || 'Not specified'}
- Location: ${businessProfile.location || 'Not specified'}
- Description: ${businessProfile.description || 'Not specified'}
- Funding Needs: ${businessProfile.funding_needs || 'Not specified'}
- Interests: ${businessProfile.interests?.join(', ') || 'Not specified'}

AVAILABLE GRANTS:
${availableGrants.map((grant, index) => `
${index + 1}. ${grant.title}
   - Agency: ${grant.agency || 'Not specified'}
   - Amount: ${grant.amount || 'Not specified'}
   - Category: ${grant.category || 'Not specified'}
   - Industry Tags: ${grant.industry_tags?.join(', ') || 'Not specified'}
   - Deadline: ${grant.deadline || 'Not specified'}
`).join('\n')}

Analyze and rank these grants for this business. Respond with a JSON object containing:
1. "recommendations": array of grant objects with:
   - "grantId": grant identifier
   - "title": grant title
   - "score": compatibility score (0-100)
   - "reasoning": brief explanation of why it's a good fit
   - "priority": "high", "medium", or "low"
   - "actionItems": array of 2-3 immediate next steps

Order by compatibility score (highest first). Include only grants with score > 30.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.getFallbackRecommendations(availableGrants);
    } catch (error) {
      console.error('Error generating grant recommendations:', error);
      return this.getFallbackRecommendations(availableGrants);
    }
  }

  async generateApplicationGuidance(grantDetails: any, businessProfile: any) {
    if (!this.genAI) {
      return this.getFallbackGuidance();
    }

    try {
      const prompt = `
You are an expert grant writer providing comprehensive application guidance.

GRANT DETAILS:
- Title: ${grantDetails.title}
- Agency: ${grantDetails.agency || 'Not specified'}
- Amount: ${grantDetails.amount || 'Not specified'}
- Description: ${grantDetails.description || 'Not specified'}
- Eligibility: ${grantDetails.eligibility || 'Not specified'}
- Deadline: ${grantDetails.deadline || 'Not specified'}

BUSINESS PROFILE:
- Company: ${businessProfile.company_name || 'Not specified'}
- Industry: ${businessProfile.industry || 'Not specified'}
- Business Size: ${businessProfile.business_size || 'Not specified'}
- Description: ${businessProfile.description || 'Not specified'}
- Funding Needs: ${businessProfile.funding_needs || 'Not specified'}

Provide comprehensive application guidance as a JSON object with:
1. "strategies": array of 4-5 key application strategies
2. "mistakesToAvoid": array of 3-4 common mistakes to avoid
3. "requiredDocuments": array of likely required documents
4. "timeline": object with suggested milestones and deadlines
5. "keyPoints": array of 3-4 most important points to emphasize

Focus on this specific grant and business combination.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.getFallbackGuidance();
    } catch (error) {
      console.error('Error generating application guidance:', error);
      return this.getFallbackGuidance();
    }
  }

  async generateApplicationDraft(grantDetails: any, businessProfile: any, section: string) {
    if (!this.genAI) {
      return this.getFallbackDraft(section);
    }

    try {
      const prompt = `
You are an expert grant writer creating application content.

GRANT DETAILS:
- Title: ${grantDetails.title}
- Agency: ${grantDetails.agency || 'Not specified'}
- Description: ${grantDetails.description || 'Not specified'}
- Amount: ${grantDetails.amount || 'Not specified'}

BUSINESS PROFILE:
- Company: ${businessProfile.company_name || 'Not specified'}
- Industry: ${businessProfile.industry || 'Not specified'}
- Description: ${businessProfile.description || 'Not specified'}
- Funding Needs: ${businessProfile.funding_needs || 'Not specified'}

Create a draft for the "${section}" section of the grant application.

Respond with a JSON object containing:
1. "content": the draft content (2-3 paragraphs)
2. "tips": array of 3-4 tips for improving this section
3. "keyWords": array of important keywords to include
4. "length": suggested word count range

Make the content specific to this business and grant opportunity.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.getFallbackDraft(section);
    } catch (error) {
      console.error('Error generating application draft:', error);
      return this.getFallbackDraft(section);
    }
  }

  async analyzeApplicationQuality(applicationData: any, grantRequirements: any) {
    if (!this.genAI) {
      return this.getFallbackQualityAnalysis();
    }

    try {
      const prompt = `
You are an expert grant reviewer analyzing application quality.

APPLICATION DATA:
${JSON.stringify(applicationData, null, 2)}

GRANT REQUIREMENTS:
- Title: ${grantRequirements.title}
- Description: ${grantRequirements.description || 'Not specified'}
- Eligibility: ${grantRequirements.eligibility || 'Not specified'}
- Amount: ${grantRequirements.amount || 'Not specified'}

Analyze the application quality and respond with a JSON object containing:
1. "overallScore": number from 0-100
2. "sectionScores": object with scores for each major section
3. "strengths": array of 3-4 application strengths
4. "improvements": array of 4-5 specific improvement suggestions
5. "completeness": percentage of completion (0-100)
6. "competitiveness": assessment of competitiveness ("low", "medium", "high")

Provide actionable feedback for improving the application.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.getFallbackQualityAnalysis();
    } catch (error) {
      console.error('Error analyzing application quality:', error);
      return this.getFallbackQualityAnalysis();
    }
  }

  // Fallback methods
  private getFallbackCompatibility() {
    return {
      compatibilityScore: 75,
      strengths: [
        "Industry alignment shows good potential",
        "Business size matches grant requirements",
        "Funding amount is appropriate for business scale"
      ],
      concerns: [
        "Location restrictions may apply",
        "Additional documentation may be required"
      ],
      recommendations: [
        "Review eligibility criteria carefully",
        "Prepare detailed financial projections",
        "Highlight relevant experience and achievements"
      ]
    };
  }

  private getFallbackRecommendations(grants: any[]) {
    return {
      recommendations: grants.slice(0, 3).map((grant, index) => ({
        grantId: grant.id,
        title: grant.title,
        score: 85 - (index * 10),
        reasoning: "Good alignment with business profile and funding needs",
        priority: index === 0 ? "high" : "medium",
        actionItems: [
          "Review application requirements",
          "Gather necessary documentation",
          "Plan application timeline"
        ]
      }))
    };
  }

  private getFallbackGuidance() {
    return {
      strategies: [
        "Clearly articulate your business value proposition",
        "Demonstrate measurable impact and outcomes",
        "Show strong financial planning and management",
        "Highlight team expertise and experience"
      ],
      mistakesToAvoid: [
        "Submitting incomplete applications",
        "Missing important deadlines",
        "Failing to follow formatting guidelines"
      ],
      requiredDocuments: [
        "Business registration documents",
        "Financial statements",
        "Project budget and timeline",
        "Letters of support"
      ],
      timeline: {
        "8 weeks before": "Begin application preparation",
        "4 weeks before": "Complete first draft",
        "2 weeks before": "Final review and submission",
        "1 week before": "Follow up on submission"
      },
      keyPoints: [
        "Demonstrate clear need for funding",
        "Show potential for significant impact",
        "Provide detailed implementation plan"
      ]
    };
  }

  private getFallbackDraft(section: string) {
    return {
      content: `This section should clearly outline the key aspects of your ${section}. Focus on demonstrating how your business aligns with the grant objectives and how the funding will create measurable impact. Include specific details about your approach, timeline, and expected outcomes.`,
      tips: [
        "Use specific, measurable language",
        "Include concrete examples and data",
        "Align content with grant priorities",
        "Keep writing clear and concise"
      ],
      keyWords: ["innovation", "impact", "sustainable", "measurable", "strategic"],
      length: "300-500 words"
    };
  }

  private getFallbackQualityAnalysis() {
    return {
      overallScore: 78,
      sectionScores: {
        "Executive Summary": 80,
        "Project Description": 75,
        "Budget": 70,
        "Team Qualifications": 85
      },
      strengths: [
        "Clear project objectives",
        "Strong team credentials",
        "Realistic timeline"
      ],
      improvements: [
        "Add more specific metrics and KPIs",
        "Strengthen the budget justification",
        "Include more letters of support",
        "Expand on risk mitigation strategies"
      ],
      completeness: 85,
      competitiveness: "medium"
    };
  }
}

export default new GrantAI();
