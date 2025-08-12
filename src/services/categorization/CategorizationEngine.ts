
import { RawGrantOpportunity, ProcessedGrantOpportunity } from '../dataIngestion/types';

export class CategorizationEngine {
  private industryKeywords: Map<string, string[]> = new Map([
    ['Technology', ['software', 'IT', 'tech', 'digital', 'innovation', 'computer', 'data', 'AI', 'artificial intelligence']],
    ['Healthcare', ['health', 'medical', 'medicine', 'clinical', 'patient', 'disease', 'treatment', 'therapy']],
    ['Education', ['education', 'school', 'university', 'learning', 'student', 'academic', 'teaching', 'curriculum']],
    ['Manufacturing', ['manufacturing', 'production', 'factory', 'industrial', 'assembly', 'fabrication']],
    ['Agriculture', ['agriculture', 'farming', 'crop', 'livestock', 'food', 'rural', 'harvest', 'soil']],
    ['Environment', ['environment', 'climate', 'green', 'sustainability', 'conservation', 'pollution', 'renewable']],
    ['Transportation', ['transportation', 'logistics', 'shipping', 'mobility', 'infrastructure', 'transit']],
    ['Energy', ['energy', 'power', 'electricity', 'renewable', 'solar', 'wind', 'nuclear', 'oil', 'gas']],
  ]);

  private categoryKeywords: Map<string, string[]> = new Map([
    ['Research & Development', ['research', 'development', 'innovation', 'R&D', 'study', 'investigation', 'discovery']],
    ['Small Business', ['small business', 'entrepreneur', 'startup', 'SME', 'minority', 'women-owned', 'veteran']],
    ['Infrastructure', ['infrastructure', 'construction', 'building', 'facility', 'maintenance', 'repair']],
    ['Training', ['training', 'workforce', 'skills', 'professional development', 'capacity building']],
    ['Community Development', ['community', 'development', 'social', 'economic development', 'housing', 'neighborhood']],
    ['Arts & Culture', ['arts', 'culture', 'creative', 'museum', 'library', 'heritage', 'humanities']],
  ]);

  async categorizeGrant(grant: RawGrantOpportunity): Promise<ProcessedGrantOpportunity> {
    const text = this.extractText(grant);
    const keywords = this.extractKeywords(text);
    const industries = this.matchIndustries(text);
    const categories = this.matchCategories(text);
    const tags = this.generateTags(grant, keywords);
    const qualityScore = this.calculateQualityScore(grant);

    return {
      ...grant,
      keywords,
      industries,
      categories,
      tags,
      dataQualityScore: qualityScore,
      processingStatus: 'processed',
    };
  }

  private extractText(grant: RawGrantOpportunity): string {
    return [
      grant.title,
      grant.description,
      grant.eligibilityRequirements,
      grant.applicationRequirements,
      grant.agency,
      grant.programName,
    ].filter(Boolean).join(' ').toLowerCase();
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - could be enhanced with NLP
    const words = text.split(/\s+/)
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));

    // Get word frequency
    const frequency: Record<string, number> = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Return top keywords
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private matchIndustries(text: string): string[] {
    const matches: string[] = [];
    
    for (const [industry, keywords] of this.industryKeywords) {
      const score = keywords.reduce((count, keyword) => {
        return count + (text.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);
      
      if (score > 0) {
        matches.push(industry);
      }
    }
    
    return matches;
  }

  private matchCategories(text: string): string[] {
    const matches: string[] = [];
    
    for (const [category, keywords] of this.categoryKeywords) {
      const score = keywords.reduce((count, keyword) => {
        return count + (text.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);
      
      if (score > 0) {
        matches.push(category);
      }
    }
    
    return matches.length > 0 ? matches : ['General'];
  }

  private generateTags(grant: RawGrantOpportunity, keywords: string[]): string[] {
    const tags: string[] = [];
    
    // Add funding level tags
    if (grant.estimatedFunding) {
      if (grant.estimatedFunding < 50000) tags.push('small-funding');
      else if (grant.estimatedFunding < 250000) tags.push('medium-funding');
      else tags.push('large-funding');
    }
    
    // Add applicant type tags
    if (grant.applicantTypes) {
      grant.applicantTypes.forEach(type => {
        if (type.toLowerCase().includes('nonprofit')) tags.push('nonprofit');
        if (type.toLowerCase().includes('education')) tags.push('educational');
        if (type.toLowerCase().includes('government')) tags.push('government');
      });
    }
    
    // Add deadline urgency tags
    if (grant.applicationDueDate) {
      const daysUntilDeadline = Math.ceil(
        (grant.applicationDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilDeadline < 30) tags.push('urgent');
      else if (daysUntilDeadline < 90) tags.push('moderate-timeline');
      else tags.push('flexible-timeline');
    }
    
    // Add top keywords as tags
    tags.push(...keywords.slice(0, 5));
    
    return [...new Set(tags)]; // Remove duplicates
  }

  private calculateQualityScore(grant: RawGrantOpportunity): number {
    let score = 0;
    const maxScore = 10;
    
    // Required fields
    if (grant.title) score += 1;
    if (grant.description && grant.description.length > 50) score += 2;
    if (grant.agency) score += 1;
    if (grant.applicationDueDate) score += 1;
    if (grant.estimatedFunding) score += 1;
    if (grant.applicationUrl) score += 1;
    if (grant.eligibilityRequirements) score += 1;
    if (grant.applicantTypes && grant.applicantTypes.length > 0) score += 1;
    if (grant.geographicScope && grant.geographicScope.length > 0) score += 1;
    
    return Math.round((score / maxScore) * 100) / 100;
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'could', 'can', 'may', 'might', 'must', 'shall', 'this', 'that', 'these',
      'those', 'a', 'an', 'they', 'them', 'their', 'we', 'us', 'our', 'you',
      'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its'
    ]);
    
    return stopWords.has(word.toLowerCase());
  }
}
