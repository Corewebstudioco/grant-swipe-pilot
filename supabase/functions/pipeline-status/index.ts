import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      data_sources: {
        Row: {
          id: string
          name: string
          is_active: boolean | null
          last_sync: string | null
          update_frequency: number | null
          created_at: string | null
        }
      }
      pipeline_logs: {
        Row: {
          id: string
          source: string
          operation: string
          status: string
          records_processed: number | null
          errors_count: number | null
          execution_time_ms: number | null
          error_details: any
          created_at: string | null
        }
      }
      grant_opportunities: {
        Row: {
          id: string
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for secure access
    const supabaseAdmin = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get recent pipeline logs
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('pipeline_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (logsError) {
      console.error('Error fetching pipeline logs:', logsError)
      throw logsError
    }

    // Get safe data sources status (excluding sensitive configuration)
    const { data: sources, error: sourcesError } = await supabaseAdmin
      .from('data_sources')
      .select('id, name, is_active, last_sync, update_frequency, created_at')

    if (sourcesError) {
      console.error('Error fetching data sources:', sourcesError)
      throw sourcesError
    }

    // Get grant opportunities count
    const { count: totalGrants } = await supabaseAdmin
      .from('grant_opportunities')
      .select('*', { count: 'exact', head: true })

    const response = {
      logs: logs || [],
      sources: sources || [],
      totalGrants: totalGrants || 0
    }

    return new Response(JSON.stringify(response), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
      status: 200,
    })

  } catch (error) {
    console.error('Pipeline status error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch pipeline status',
      details: error.message 
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
      status: 500,
    })
  }
})