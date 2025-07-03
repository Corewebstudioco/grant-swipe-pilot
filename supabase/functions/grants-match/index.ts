
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple matching algorithm (you can enhance this with AI later)
function calculateCompatibilityScore(grant: any, profile: any): number {
  let score = 0;
  
  // Industry match
  if (grant.industry_tags?.includes(profile.industry)) {
    score += 30;
  }
  
  // Business size match
  if (grant.business_size_requirements?.includes(profile.business_size)) {
    score += 25;
  }
  
  // Interest match
  const interestMatches = grant.industry_tags?.filter((tag: string) => 
    profile.interests?.some((interest: string) => 
      interest.toLowerCase().includes(tag.toLowerCase()) || 
      tag.toLowerCase().includes(interest.toLowerCase())
    )
  )?.length || 0;
  
  score += Math.min(interestMatches * 15, 30);
  
  // Location compatibility (if no restrictions, it's compatible)
  if (!grant.location_restrictions || grant.location_restrictions.length === 0) {
    score += 15;
  } else if (profile.location && grant.location_restrictions.some((loc: string) => 
    profile.location.toLowerCase().includes(loc.toLowerCase())
  )) {
    score += 15;
  }
  
  return Math.min(score, 100);
}

function generateAIReasons(grant: any, profile: any, score: number): string[] {
  const reasons = [];
  
  if (grant.industry_tags?.includes(profile.industry)) {
    reasons.push(`Perfect industry match with ${profile.industry}`);
  }
  
  if (grant.business_size_requirements?.includes(profile.business_size)) {
    reasons.push(`Matches your business size: ${profile.business_size}`);
  }
  
  if (score > 70) {
    reasons.push("High compatibility based on your business profile");
  }
  
  if (grant.funding_type) {
    reasons.push(`Suitable ${grant.funding_type.toLowerCase()} funding opportunity`);
  }
  
  return reasons.length > 0 ? reasons : ["Good potential match for your business"];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      throw new Error('Unauthorized');
    }

    if (req.method === 'POST') {
      // Get user profile
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get all active grants
      const { data: grants, error: grantsError } = await supabaseClient
        .from('grants')
        .select('*')
        .eq('status', 'active');

      if (grantsError) throw grantsError;

      // Calculate matches
      const matches = [];
      for (const grant of grants || []) {
        const compatibilityScore = calculateCompatibilityScore(grant, profile);
        
        if (compatibilityScore > 30) { // Only save meaningful matches
          const aiReasons = generateAIReasons(grant, profile, compatibilityScore);
          
          // Check if match already exists
          const { data: existingMatch } = await supabaseClient
            .from('matches')
            .select('id')
            .eq('user_id', user.id)
            .eq('grant_id', grant.id)
            .single();

          if (!existingMatch) {
            const { data: newMatch, error: matchError } = await supabaseClient
              .from('matches')
              .insert({
                user_id: user.id,
                grant_id: grant.id,
                compatibility_score: compatibilityScore,
                ai_reasons: aiReasons,
                eligibility_status: compatibilityScore > 70 ? 'high' : compatibilityScore > 50 ? 'medium' : 'low',
                application_tips: [
                  "Highlight your relevant experience",
                  "Align your proposal with the grant's objectives",
                  "Provide detailed financial projections"
                ]
              })
              .select('*, grants(*)')
              .single();

            if (matchError) {
              console.error('Error creating match:', matchError);
            } else {
              matches.push(newMatch);
            }
          }
        }
      }

      // Get top matches
      const { data: topMatches, error: topMatchesError } = await supabaseClient
        .from('matches')
        .select('*, grants(*)')
        .eq('user_id', user.id)
        .order('compatibility_score', { ascending: false })
        .limit(10);

      if (topMatchesError) throw topMatchesError;

      return new Response(JSON.stringify({ 
        success: true, 
        newMatches: matches.length,
        topMatches 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in grants-match function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
