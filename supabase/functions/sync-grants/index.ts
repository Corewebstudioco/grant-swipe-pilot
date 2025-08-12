
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GrantsGovOpportunity {
  opportunityId: string;
  opportunityTitle: string;
  agencyName: string;
  description?: string;
  estimatedTotalProgramFunding?: string;
  applicationDueDate?: string;
  postedDate?: string;
  eligibilityRequirements?: string;
  applicationRequirements?: string;
  grantsGovApplicationPackageURL?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    if (req.method === 'POST') {
      console.log('Starting grant sync process...');
      
      // Fetch from Grants.gov API
      const grantsGovUrl = 'https://www.grants.gov/grantsws/rest/opportunities/search/?format=json&rows=100';
      
      try {
        const response = await fetch(grantsGovUrl, {
          headers: {
            'User-Agent': 'GrantSwipe/1.0',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Grants.gov API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received response from Grants.gov');

        if (!data || !data.opportunitiesDetails) {
          console.log('No opportunities found in response');
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'No new grants found',
            recordsProcessed: 0 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        let opportunities = data.opportunitiesDetails;
        if (!Array.isArray(opportunities)) {
          opportunities = [opportunities];
        }

        console.log(`Processing ${opportunities.length} opportunities`);
        
        let recordsProcessed = 0;
        let errors = 0;

        for (const opp of opportunities) {
          try {
            const grantData = {
              external_id: opp.opportunityId,
              source: 'Grants.gov',
              title: opp.opportunityTitle,
              description: opp.description || opp.synopsis,
              agency: opp.agencyName,
              estimated_funding: parseAmount(opp.estimatedTotalProgramFunding),
              application_due_date: parseDate(opp.applicationDueDate),
              posted_date: parseDate(opp.postedDate),
              eligibility_requirements: opp.eligibilityRequirements,
              application_requirements: opp.applicationRequirements,
              application_url: opp.grantsGovApplicationPackageURL,
              full_announcement_url: opp.grantsGovApplicationPackageURL,
              categories: categorizeGrant(opp),
              tags: generateTags(opp),
              industries: identifyIndustries(opp),
              keywords: extractKeywords(opp),
              data_quality_score: calculateQualityScore(opp),
              processing_status: 'processed',
              is_active: true,
            };

            const { error } = await supabaseClient
              .from('grant_opportunities')
              .upsert(grantData, { 
                onConflict: 'external_id',
                ignoreDuplicates: false 
              });

            if (error) {
              console.error('Error upserting grant:', error);
              errors++;
            } else {
              recordsProcessed++;
            }
          } catch (error) {
            console.error('Error processing opportunity:', error);
            errors++;
          }
        }

        // Log the sync activity
        await supabaseClient.from('pipeline_logs').insert({
          source: 'Grants.gov',
          operation: 'sync',
          status: 'success',
          records_processed: recordsProcessed,
          errors_count: errors,
        });

        // Update last sync time
        await supabaseClient
          .from('data_sources')
          .update({ last_sync: new Date().toISOString() })
          .eq('name', 'Grants.gov');

        console.log(`Sync completed: ${recordsProcessed} processed, ${errors} errors`);

        return new Response(JSON.stringify({ 
          success: true,
          recordsProcessed,
          errors,
          message: `Successfully processed ${recordsProcessed} grants with ${errors} errors`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('Error fetching from Grants.gov:', error);
        
        // Log the error
        await supabaseClient.from('pipeline_logs').insert({
          source: 'Grants.gov',
          operation: 'sync',
          status: 'failed',
          records_processed: 0,
          errors_count: 1,
          error_details: { error: error.message },
        });

        throw error;
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-grants function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseAmount(value: any): number | null {
  if (!value) return null;
  const cleaned = String(value).replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

function parseDate(value: any): string | null {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

function categorizeGrant(opp: GrantsGovOpportunity): string[] {
  const text = [opp.opportunityTitle, opp.description, opp.agencyName].join(' ').toLowerCase();
  const categories = [];
  
  if (text.includes('research') || text.includes('development') || text.includes('innovation')) {
    categories.push('Research & Development');
  }
  if (text.includes('education') || text.includes('school') || text.includes('university')) {
    categories.push('Education');
  }
  if (text.includes('health') || text.includes('medical') || text.includes('healthcare')) {
    categories.push('Healthcare');
  }
  if (text.includes('environment') || text.includes('climate') || text.includes('green')) {
    categories.push('Environment');
  }
  if (text.includes('technology') || text.includes('tech') || text.includes('digital')) {
    categories.push('Technology');
  }
  if (text.includes('small business') || text.includes('entrepreneur') || text.includes('startup')) {
    categories.push('Small Business');
  }
  
  return categories.length > 0 ? categories : ['General'];
}

function generateTags(opp: GrantsGovOpportunity): string[] {
  const tags = [];
  const funding = parseAmount(opp.estimatedTotalProgramFunding);
  
  if (funding) {
    if (funding < 50000) tags.push('small-funding');
    else if (funding < 250000) tags.push('medium-funding');
    else tags.push('large-funding');
  }
  
  if (opp.applicationDueDate) {
    const daysUntilDeadline = Math.ceil(
      (new Date(opp.applicationDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilDeadline < 30) tags.push('urgent');
    else if (daysUntilDeadline < 90) tags.push('moderate-timeline');
    else tags.push('flexible-timeline');
  }
  
  return tags;
}

function identifyIndustries(opp: GrantsGovOpportunity): string[] {
  const text = [opp.opportunityTitle, opp.description, opp.agencyName].join(' ').toLowerCase();
  const industries = [];
  
  if (text.includes('technology') || text.includes('software') || text.includes('digital')) {
    industries.push('Technology');
  }
  if (text.includes('health') || text.includes('medical') || text.includes('clinical')) {
    industries.push('Healthcare');
  }
  if (text.includes('education') || text.includes('academic') || text.includes('university')) {
    industries.push('Education');
  }
  if (text.includes('agriculture') || text.includes('farming') || text.includes('food')) {
    industries.push('Agriculture');
  }
  if (text.includes('manufacturing') || text.includes('production') || text.includes('industrial')) {
    industries.push('Manufacturing');
  }
  
  return industries;
}

function extractKeywords(opp: GrantsGovOpportunity): string[] {
  const text = [opp.opportunityTitle, opp.description].join(' ').toLowerCase();
  const words = text.split(/\s+/)
    .map(word => word.replace(/[^\w]/g, ''))
    .filter(word => word.length > 3)
    .filter(word => !isStopWord(word));

  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

function calculateQualityScore(opp: GrantsGovOpportunity): number {
  let score = 0;
  const maxScore = 10;
  
  if (opp.opportunityTitle) score += 1;
  if (opp.description && opp.description.length > 50) score += 2;
  if (opp.agencyName) score += 1;
  if (opp.applicationDueDate) score += 1;
  if (opp.estimatedTotalProgramFunding) score += 1;
  if (opp.grantsGovApplicationPackageURL) score += 1;
  if (opp.eligibilityRequirements) score += 1;
  if (opp.applicationRequirements) score += 1;
  if (opp.postedDate) score += 1;
  
  return Math.round((score / maxScore) * 100) / 100;
}

function isStopWord(word: string): boolean {
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
