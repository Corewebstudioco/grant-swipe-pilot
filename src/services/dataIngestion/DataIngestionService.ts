
import { supabase } from '@/integrations/supabase/client';
import { GrantsGovConnector } from './GrantsGovConnector';
import { USASpendingConnector } from './USASpendingConnector';
import { CategorizationEngine } from '../categorization/CategorizationEngine';
import { GrantDataSource, DataIngestionResult, ProcessedGrantOpportunity } from './types';

export class DataIngestionService {
  private connectors: Map<string, any> = new Map();
  private categorization = new CategorizationEngine();

  constructor() {
    this.initializeConnectors();
  }

  private async initializeConnectors() {
    try {
      // Fetch data sources from database
      const { data: sources, error } = await supabase
        .from('data_sources')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      sources?.forEach(source => {
        const dataSource: GrantDataSource = {
          id: source.id,
          name: source.name,
          apiUrl: source.api_url,
          authenticationType: 'none',
          rateLimits: {
            requestsPerHour: source.rate_limit_per_hour || 1000,
            requestsPerMinute: Math.floor((source.rate_limit_per_hour || 1000) / 60),
          },
          dataFormat: source.configuration?.format || 'json',
          updateFrequency: source.update_frequency,
          configuration: source.configuration || {},
        };

        // Initialize connectors based on source name
        if (source.name === 'Grants.gov') {
          this.connectors.set(source.name, new GrantsGovConnector(dataSource));
        } else if (source.name === 'USAspending.gov') {
          this.connectors.set(source.name, new USASpendingConnector(dataSource));
        }
      });

      console.log(`Initialized ${this.connectors.size} data connectors`);
    } catch (error) {
      console.error('Failed to initialize connectors:', error);
    }
  }

  async syncAllSources(): Promise<Record<string, DataIngestionResult>> {
    const results: Record<string, DataIngestionResult> = {};

    for (const [sourceName, connector] of this.connectors) {
      try {
        console.log(`Starting sync for ${sourceName}`);
        const result = await this.syncSource(sourceName, connector);
        results[sourceName] = result;
        
        // Log pipeline activity
        await this.logPipelineActivity(sourceName, 'sync', result);
      } catch (error) {
        console.error(`Sync failed for ${sourceName}:`, error);
        results[sourceName] = {
          success: false,
          recordsProcessed: 0,
          errorsCount: 1,
          errors: [error],
          processingTime: 0,
        };
      }
    }

    return results;
  }

  private async syncSource(sourceName: string, connector: any): Promise<DataIngestionResult> {
    const startTime = Date.now();
    let recordsProcessed = 0;
    let errorsCount = 0;
    const errors: any[] = [];

    try {
      // Get last sync time
      const { data: sourceData } = await supabase
        .from('data_sources')
        .select('last_sync')
        .eq('name', sourceName)
        .single();

      const lastSync = sourceData?.last_sync ? new Date(sourceData.last_sync) : undefined;

      // Fetch grants from source
      const rawGrants = await connector.fetchGrants(lastSync);
      console.log(`Fetched ${rawGrants.length} grants from ${sourceName}`);

      // Process and categorize grants
      for (const rawGrant of rawGrants) {
        try {
          const processedGrant = await this.categorization.categorizeGrant(rawGrant);
          await this.storeGrant(processedGrant);
          recordsProcessed++;
        } catch (error) {
          console.error(`Error processing grant ${rawGrant.externalId}:`, error);
          errors.push(error);
          errorsCount++;
        }
      }

      // Update last sync time
      await supabase
        .from('data_sources')
        .update({ last_sync: new Date().toISOString() })
        .eq('name', sourceName);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        recordsProcessed,
        errorsCount,
        errors,
        processingTime,
      };
    } catch (error) {
      console.error(`Sync error for ${sourceName}:`, error);
      return {
        success: false,
        recordsProcessed,
        errorsCount: errorsCount + 1,
        errors: [...errors, error],
        processingTime: Date.now() - startTime,
      };
    }
  }

  private async storeGrant(grant: ProcessedGrantOpportunity): Promise<void> {
    try {
      const grantData = {
        external_id: grant.externalId,
        source: grant.source,
        title: grant.title,
        description: grant.description,
        agency: grant.agency,
        program_name: grant.programName,
        opportunity_number: grant.opportunityNumber,
        cfda_number: grant.cfdaNumber,
        estimated_funding: grant.estimatedFunding,
        award_ceiling: grant.awardCeiling,
        award_floor: grant.awardFloor,
        number_of_awards: grant.numberOfAwards,
        posted_date: grant.postedDate?.toISOString(),
        application_due_date: grant.applicationDueDate?.toISOString(),
        archive_date: grant.archiveDate?.toISOString(),
        eligibility_requirements: grant.eligibilityRequirements,
        application_requirements: grant.applicationRequirements,
        geographic_scope: grant.geographicScope,
        applicant_types: grant.applicantTypes,
        categories: grant.categories,
        tags: grant.tags,
        industries: grant.industries,
        keywords: grant.keywords,
        application_url: grant.applicationUrl,
        full_announcement_url: grant.fullAnnouncementUrl,
        related_documents: grant.relatedDocuments,
        data_quality_score: grant.dataQualityScore,
        processing_status: grant.processingStatus,
        is_active: true,
      };

      const { error } = await supabase
        .from('grant_opportunities')
        .upsert(grantData, { 
          onConflict: 'external_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error storing grant:', error);
      throw error;
    }
  }

  private async logPipelineActivity(
    source: string, 
    operation: string, 
    result: DataIngestionResult
  ): Promise<void> {
    try {
      await supabase.from('pipeline_logs').insert({
        source,
        operation,
        status: result.success ? 'success' : 'failed',
        records_processed: result.recordsProcessed,
        errors_count: result.errorsCount,
        execution_time_ms: result.processingTime,
        error_details: result.errors.length > 0 ? { errors: result.errors } : null,
      });
    } catch (error) {
      console.error('Failed to log pipeline activity:', error);
    }
  }
}
