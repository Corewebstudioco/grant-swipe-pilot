
import { BaseDataConnector } from './BaseDataConnector';
import { RawGrantOpportunity } from './types';

export class USASpendingConnector extends BaseDataConnector {
  async fetchGrants(lastSyncDate?: Date): Promise<RawGrantOpportunity[]> {
    try {
      console.log(`Fetching grants from USAspending.gov since ${lastSyncDate || 'beginning'}`);
      
      const baseUrl = `${this.source.apiUrl}api/v2/search/spending_by_award/`;
      
      const requestBody = {
        filters: {
          award_type_codes: ['06', '07', '08', '09', '10'], // Grant types
          time_period: [
            {
              start_date: lastSyncDate ? lastSyncDate.toISOString().split('T')[0] : '2024-01-01',
              end_date: new Date().toISOString().split('T')[0],
            }
          ],
        },
        fields: [
          'Award ID',
          'Recipient Name',
          'Award Amount',
          'Award Type',
          'Awarding Agency',
          'Awarding Sub Agency',
          'Award Description',
          'Start Date',
          'End Date',
          'Last Modified Date'
        ],
        page: 1,
        limit: 100,
        sort: 'Award Amount',
        order: 'desc'
      };

      const response = await this.rateLimitedRequest(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!data || !data.results) {
        console.warn('No results found in USAspending.gov response');
        return [];
      }

      return this.transformData(data.results);
    } catch (error) {
      this.handleApiError(error, 'fetchGrants');
      return [];
    }
  }

  transformData(rawData: any): RawGrantOpportunity[] {
    if (!Array.isArray(rawData)) {
      return [];
    }

    return rawData.map((item: any) => {
      try {
        return {
          externalId: `usaspending-${item['Award ID']}`,
          source: 'USAspending.gov',
          title: item['Award Description'] || `Grant from ${item['Awarding Agency']}`,
          description: item['Award Description'],
          agency: item['Awarding Agency'],
          programName: item['Awarding Sub Agency'],
          estimatedFunding: this.parseAmount(item['Award Amount']),
          postedDate: this.parseDate(item['Start Date']),
          applicationDueDate: this.parseDate(item['End Date']),
          applicantTypes: ['Organizations', 'Nonprofits', 'Educational Institutions'],
          geographicScope: ['United States'],
        } as RawGrantOpportunity;
      } catch (error) {
        console.error('Error transforming USAspending data:', error, item);
        return null;
      }
    }).filter(Boolean) as RawGrantOpportunity[];
  }

  private parseAmount(value: any): number | undefined {
    if (!value) return undefined;
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? undefined : parsed;
  }

  private parseDate(value: any): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }
}
