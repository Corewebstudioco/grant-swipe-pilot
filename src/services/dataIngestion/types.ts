
export interface GrantDataSource {
  id: string;
  name: string;
  apiUrl: string;
  authenticationType: 'none' | 'api_key' | 'oauth';
  rateLimits: {
    requestsPerHour: number;
    requestsPerMinute: number;
  };
  dataFormat: 'json' | 'xml' | 'csv';
  updateFrequency: number;
  configuration: Record<string, any>;
}

export interface RawGrantOpportunity {
  externalId: string;
  source: string;
  title: string;
  description?: string;
  agency: string;
  programName?: string;
  opportunityNumber?: string;
  cfdaNumber?: string;
  estimatedFunding?: number;
  awardCeiling?: number;
  awardFloor?: number;
  numberOfAwards?: number;
  postedDate?: Date;
  applicationDueDate?: Date;
  archiveDate?: Date;
  eligibilityRequirements?: string;
  applicationRequirements?: string;
  geographicScope?: string[];
  applicantTypes?: string[];
  applicationUrl?: string;
  fullAnnouncementUrl?: string;
  relatedDocuments?: any;
}

export interface ProcessedGrantOpportunity extends RawGrantOpportunity {
  categories: string[];
  tags: string[];
  industries: string[];
  keywords: string[];
  dataQualityScore: number;
  processingStatus: 'pending' | 'processed' | 'failed';
}

export interface DataIngestionResult {
  success: boolean;
  recordsProcessed: number;
  errorsCount: number;
  errors: any[];
  processingTime: number;
}
