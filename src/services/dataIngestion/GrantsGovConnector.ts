
import { BaseDataConnector } from './BaseDataConnector';
import { RawGrantOpportunity } from './types';

export class GrantsGovConnector extends BaseDataConnector {
  async fetchGrants(lastSyncDate?: Date): Promise<RawGrantOpportunity[]> {
    try {
      console.log(`Fetching grants from Grants.gov since ${lastSyncDate || 'beginning'}`);
      
      const baseUrl = this.source.apiUrl;
      const params = new URLSearchParams({
        format: 'json',
        rows: '1000',
        start: '0',
      });

      if (lastSyncDate) {
        // Add date filter for incremental updates
        const dateStr = lastSyncDate.toISOString().split('T')[0];
        params.append('modifiedSince', dateStr);
      }

      const url = `${baseUrl}?${params.toString()}`;
      const response = await this.rateLimitedRequest(url);
      const data = await response.json();

      if (!data || !data.opportunitiesDetails) {
        console.warn('No opportunities found in Grants.gov response');
        return [];
      }

      return this.transformData(data.opportunitiesDetails);
    } catch (error) {
      this.handleApiError(error, 'fetchGrants');
      return [];
    }
  }

  transformData(rawData: any): RawGrantOpportunity[] {
    if (!Array.isArray(rawData)) {
      rawData = [rawData];
    }

    return rawData.map((item: any) => {
      try {
        return {
          externalId: item.opportunityId || item.id,
          source: 'Grants.gov',
          title: item.opportunityTitle || item.title,
          description: item.description || item.synopsis,
          agency: item.agencyName || item.agency,
          programName: item.programName,
          opportunityNumber: item.opportunityNumber,
          cfdaNumber: item.cfdaNumber,
          estimatedFunding: this.parseAmount(item.estimatedTotalProgramFunding),
          awardCeiling: this.parseAmount(item.awardCeiling),
          awardFloor: this.parseAmount(item.awardFloor),
          numberOfAwards: parseInt(item.expectedNumberOfAwards) || undefined,
          postedDate: this.parseDate(item.postedDate),
          applicationDueDate: this.parseDate(item.applicationDueDate || item.dueDate),
          archiveDate: this.parseDate(item.archiveDate),
          eligibilityRequirements: item.eligibilityRequirements,
          applicationRequirements: item.applicationRequirements,
          applicationUrl: item.grantsGovApplicationPackageURL || item.applicationUrl,
          fullAnnouncementUrl: item.grantsGovApplicationPackageURL,
          geographicScope: this.parseArray(item.geographicEligibility),
          applicantTypes: this.parseArray(item.eligibleApplicants),
          relatedDocuments: item.relatedDocuments || {},
        } as RawGrantOpportunity;
      } catch (error) {
        console.error('Error transforming grant data:', error, item);
        return null;
      }
    }).filter(Boolean) as RawGrantOpportunity[];
  }

  private parseAmount(value: any): number | undefined {
    if (!value) return undefined;
    const cleaned = String(value).replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? undefined : parsed;
  }

  private parseDate(value: any): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }

  private parseArray(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }
}
