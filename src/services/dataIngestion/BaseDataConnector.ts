
import { GrantDataSource, RawGrantOpportunity, DataIngestionResult } from './types';

export abstract class BaseDataConnector {
  protected source: GrantDataSource;
  protected lastRequestTime: number = 0;
  protected requestCount: number = 0;
  protected hourlyRequestCount: number = 0;
  protected hourlyResetTime: number = Date.now() + 3600000; // 1 hour from now

  constructor(source: GrantDataSource) {
    this.source = source;
  }

  abstract fetchGrants(lastSyncDate?: Date): Promise<RawGrantOpportunity[]>;
  abstract transformData(rawData: any): RawGrantOpportunity[];

  protected async rateLimitedRequest(url: string, options?: RequestInit): Promise<Response> {
    await this.checkRateLimit();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'GrantSwipe/1.0',
        'Accept': 'application/json',
        ...options?.headers,
      },
    });

    this.updateRequestCounts();
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response;
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Reset hourly counter if needed
    if (now > this.hourlyResetTime) {
      this.hourlyRequestCount = 0;
      this.hourlyResetTime = now + 3600000;
    }

    // Check hourly limit
    if (this.hourlyRequestCount >= this.source.rateLimits.requestsPerHour) {
      const waitTime = this.hourlyResetTime - now;
      console.log(`Rate limit reached for ${this.source.name}. Waiting ${waitTime}ms`);
      await this.sleep(waitTime);
      this.hourlyRequestCount = 0;
      this.hourlyResetTime = now + 3600000;
    }

    // Check per-minute rate limiting
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 60000 / this.source.rateLimits.requestsPerMinute; // ms between requests
    
    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      await this.sleep(waitTime);
    }
  }

  private updateRequestCounts(): void {
    this.lastRequestTime = Date.now();
    this.requestCount++;
    this.hourlyRequestCount++;
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected handleApiError(error: any, context: string): void {
    console.error(`Error in ${this.source.name} ${context}:`, error);
    throw new Error(`${this.source.name} API error: ${error.message}`);
  }
}
