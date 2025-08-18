import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActivityLogRequest {
  activity_type: string;
  metadata?: any;
  grant_id?: string;
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
      const { activity_type, metadata, grant_id }: ActivityLogRequest = await req.json();

      console.log('Logging activity:', { activity_type, metadata, grant_id, user_id: user.id });

      // Insert into user_activity table
      const { data: activity, error: activityError } = await supabaseClient
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type,
          grant_id,
          metadata
        })
        .select()
        .single();

      if (activityError) {
        console.error('Error logging activity:', activityError);
        throw activityError;
      }

      // Also insert into activities table for broader tracking
      const { error: legacyActivityError } = await supabaseClient
        .from('activities')
        .insert({
          user_id: user.id,
          action_type: activity_type,
          message: formatActivityMessage(activity_type, metadata),
          metadata
        });

      if (legacyActivityError) {
        console.warn('Warning: Could not log to legacy activities table:', legacyActivityError);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        activity: activity 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in log-activity function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function formatActivityMessage(activityType: string, metadata?: any): string {
  switch (activityType) {
    case 'match':
      return `New grant match found${metadata?.grant_title ? `: ${metadata.grant_title}` : ''}`;
    case 'application':
      return `Application ${metadata?.status || 'submitted'}${metadata?.grant_title ? ` for ${metadata.grant_title}` : ''}`;
    case 'application_submit':
      return `Submitted application${metadata?.grant_title ? ` for ${metadata.grant_title}` : ''}`;
    case 'application_draft':
      return `Created application draft${metadata?.grant_title ? ` for ${metadata.grant_title}` : ''}`;
    case 'document_upload':
      return `Uploaded document: ${metadata?.file_name || 'Unknown file'}`;
    case 'team_invite':
      return `Invited team member: ${metadata?.email || 'Unknown'}`;
    case 'ai_analysis':
      return `AI completed grant analysis${metadata?.grant_title ? ` for ${metadata.grant_title}` : ''}`;
    case 'ai_assistance':
      return `Used AI assistance${metadata?.type ? ` for ${metadata.type}` : ''}`;
    case 'ai_recommendation':
      return `AI generated new recommendations`;
    case 'profile_update':
      return `Updated profile information`;
    case 'grant_view':
      return `Viewed grant details${metadata?.grant_title ? `: ${metadata.grant_title}` : ''}`;
    case 'grant_bookmark':
      return `Bookmarked grant${metadata?.grant_title ? `: ${metadata.grant_title}` : ''}`;
    case 'reminder':
      return `Deadline reminder${metadata?.grant_title ? ` for ${metadata.grant_title}` : ''}`;
    default:
      return `New activity: ${activityType}`;
  }
}