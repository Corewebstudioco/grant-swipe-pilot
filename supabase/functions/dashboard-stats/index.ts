
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    if (req.method === 'GET') {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Get active applications count
      const { data: activeApps, error: activeAppsError } = await supabaseClient
        .from('applications')
        .select('id')
        .eq('user_id', user.id)
        .in('status', ['draft', 'submitted', 'in_review']);

      if (activeAppsError) throw activeAppsError;

      // Get new matches today
      const { data: newMatches, error: newMatchesError } = await supabaseClient
        .from('matches')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', today);

      if (newMatchesError) throw newMatchesError;

      // Get total applications
      const { data: totalApps, error: totalAppsError } = await supabaseClient
        .from('applications')
        .select('id')
        .eq('user_id', user.id);

      if (totalAppsError) throw totalAppsError;

      // Get successful applications (for success rate)
      const { data: successfulApps, error: successfulAppsError } = await supabaseClient
        .from('applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'approved');

      if (successfulAppsError) throw successfulAppsError;

      // Try to use the database function for enhanced metrics
      const { data: enhancedMetrics, error: metricsError } = await supabaseClient
        .rpc('get_dashboard_metrics', { user_id: user.id });

      if (metricsError) {
        console.log('Enhanced metrics not available, using fallback calculations:', metricsError);
        
        // Fallback to basic calculations
        const successRate = totalApps?.length > 0 
          ? Math.round((successfulApps?.length || 0) / totalApps.length * 100)
          : 0;

        // Get applications from last week for comparison
        const { data: lastWeekApps, error: lastWeekAppsError } = await supabaseClient
          .from('applications')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', weekAgo);

        if (lastWeekAppsError) throw lastWeekAppsError;

        const stats = {
          activeApplications: {
            count: activeApps?.length || 0,
            change: `+${Math.max(0, (activeApps?.length || 0) - Math.max(0, (lastWeekApps?.length || 0) - (activeApps?.length || 0)))} this week`
          },
          newMatches: {
            count: newMatches?.length || 0,
            change: 'Updated today'
          },
          successRate: {
            percentage: successRate,
            change: successRate > 70 ? 'Above average' : 'Below average'
          },
          totalApplied: {
            count: totalApps?.length || 0,
            change: 'All time'
          }
        };

        return new Response(JSON.stringify({ stats }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Use enhanced metrics from database function
      const stats = enhancedMetrics;

      return new Response(JSON.stringify({ stats }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in dashboard-stats function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
