
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
      const url = new URL(req.url);
      const category = url.searchParams.get('category');
      const minAmount = url.searchParams.get('minAmount');
      const maxAmount = url.searchParams.get('maxAmount');
      const deadline = url.searchParams.get('deadline');

      let query = supabaseClient
        .from('grants')
        .select('*')
        .eq('status', 'active');

      if (category) {
        query = query.eq('category', category);
      }

      if (deadline) {
        query = query.gte('deadline', deadline);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Filter by amount if specified (since amount is stored as text)
      let filteredData = data;
      if (minAmount || maxAmount) {
        filteredData = data?.filter(grant => {
          if (!grant.amount) return true;
          const amount = parseFloat(grant.amount.replace(/[^\d.-]/g, '')) || 0;
          if (minAmount && amount < parseFloat(minAmount)) return false;
          if (maxAmount && amount > parseFloat(maxAmount)) return false;
          return true;
        }) || [];
      }

      return new Response(JSON.stringify({ grants: filteredData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in grants function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
