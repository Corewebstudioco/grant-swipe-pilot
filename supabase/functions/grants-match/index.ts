
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced AI-powered matching algorithm using Gemini
async function calculateCompatibilityWithAI(grant: any, profile: any): Promise<{
  score: number;
  reasons: string[];
  tips: string[];
}> {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!geminiApiKey) {
    // Fallback to simple matching if no API key
    return calculateSimpleCompatibility(grant, profile);
  }

  try {
    const prompt = `
Analyze the compatibility between this business profile and grant opportunity. Provide a detailed assessment.

BUSINESS PROFILE:
- Company: ${profile.company_name || 'Not specified'}
- Industry: ${profile.industry || 'Not specified'}
- Business Size: ${profile.business_size || 'Not specified'}
- Location: ${profile.location || 'Not specified'}
- Interests: ${profile.interests?.join(', ') || 'Not specified'}
- Funding Needs: ${profile.funding_needs || 'Not specified'}
- Description: ${profile.description || 'Not specified'}

GRANT OPPORTUNITY:
- Title: ${grant.title}
- Agency: ${grant.agency || 'Not specified'}
- Amount: ${grant.amount || 'Not specified'}
- Category: ${grant.category || 'Not specified'}
- Industry Tags: ${grant.industry_tags?.join(', ') || 'Not specified'}
- Business Size Requirements: ${grant.business_size_requirements?.join(', ') || 'Not specified'}
- Location Restrictions: ${grant.location_restrictions?.join(', ') || 'None'}
- Funding Type: ${grant.funding_type || 'Not specified'}
- Description: ${grant.description || 'Not specified'}
- Eligibility: ${grant.eligibility || 'Not specified'}

Please respond with a JSON object containing:
1. "compatibility_score": A number from 0-100 indicating match quality
2. "reasons": An array of 3-5 specific reasons why this grant matches or doesn't match
3. "application_tips": An array of 3-4 specific tips for applying to this grant

Focus on industry alignment, business size fit, location compatibility, funding amount relevance, and eligibility criteria.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (generatedText) {
      // Try to parse JSON from the response
      const jsonMatch = generatedText.match(/```json\n(.*?)\n```/s) || generatedText.match(/\{.*\}/s);
      if (jsonMatch) {
        const aiResult = JSON.parse(jsonMatch[0].replace(/```json\n|\n```/g, ''));
        return {
          score: Math.min(Math.max(aiResult.compatibility_score || 0, 0), 100),
          reasons: aiResult.reasons || ['AI analysis completed'],
          tips: aiResult.application_tips || ['Review grant requirements carefully']
        };
      }
    }
  } catch (error) {
    console.error('Gemini AI error:', error);
  }

  // Fallback to simple matching
  return calculateSimpleCompatibility(grant, profile);
}

// Simple fallback matching algorithm
function calculateSimpleCompatibility(grant: any, profile: any): {
  score: number;
  reasons: string[];
  tips: string[];
} {
  let score = 0;
  const reasons = [];
  
  // Industry match
  if (grant.industry_tags?.includes(profile.industry)) {
    score += 30;
    reasons.push(`Perfect industry match with ${profile.industry}`);
  } else if (grant.industry_tags?.some((tag: string) => 
    profile.interests?.some((interest: string) => 
      interest.toLowerCase().includes(tag.toLowerCase()) || 
      tag.toLowerCase().includes(interest.toLowerCase())
    )
  )) {
    score += 20;
    reasons.push('Industry alignment through your interests');
  }
  
  // Business size match
  if (grant.business_size_requirements?.includes(profile.business_size)) {
    score += 25;
    reasons.push(`Matches your business size: ${profile.business_size}`);
  }
  
  // Location compatibility
  if (!grant.location_restrictions || grant.location_restrictions.length === 0) {
    score += 15;
    reasons.push('No location restrictions');
  } else if (profile.location && grant.location_restrictions.some((loc: string) => 
    profile.location.toLowerCase().includes(loc.toLowerCase())
  )) {
    score += 15;
    reasons.push('Location requirements met');
  }
  
  // Interest match
  const interestMatches = grant.industry_tags?.filter((tag: string) => 
    profile.interests?.some((interest: string) => 
      interest.toLowerCase().includes(tag.toLowerCase()) || 
      tag.toLowerCase().includes(interest.toLowerCase())
    )
  )?.length || 0;
  
  if (interestMatches > 0) {
    score += Math.min(interestMatches * 10, 20);
    reasons.push(`${interestMatches} interest area matches`);
  }
  
  // Default tips
  const tips = [
    "Highlight your relevant experience in the application",
    "Align your proposal with the grant's specific objectives",
    "Provide detailed financial projections and budgets",
    "Demonstrate clear impact and measurable outcomes"
  ];
  
  return {
    score: Math.min(score, 100),
    reasons: reasons.length > 0 ? reasons : ["Basic compatibility assessment completed"],
    tips: tips.slice(0, 3)
  };
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
      console.log('Starting grant matching for user:', user.id);

      // Get user profile
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      console.log('Found user profile:', profile.company_name);

      // Get all active grants
      const { data: grants, error: grantsError } = await supabaseClient
        .from('grants')
        .select('*')
        .eq('status', 'active');

      if (grantsError) {
        console.error('Grants error:', grantsError);
        throw grantsError;
      }

      console.log(`Found ${grants?.length || 0} active grants`);

      // Calculate matches with AI
      const matches = [];
      for (const grant of grants || []) {
        console.log(`Analyzing grant: ${grant.title}`);
        
        const compatibility = await calculateCompatibilityWithAI(grant, profile);
        
        if (compatibility.score > 30) { // Only save meaningful matches
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
                compatibility_score: compatibility.score,
                ai_reasons: compatibility.reasons,
                eligibility_status: compatibility.score > 70 ? 'high' : compatibility.score > 50 ? 'medium' : 'low',
                application_tips: compatibility.tips
              })
              .select('*, grants(*)')
              .single();

            if (matchError) {
              console.error('Error creating match:', matchError);
            } else {
              matches.push(newMatch);
              console.log(`Created new match with score: ${compatibility.score}`);
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

      console.log(`Returning ${matches.length} new matches, ${topMatches?.length || 0} total top matches`);

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
