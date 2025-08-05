import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  name: string;
  email: string;
  role: string;
  inviteToken: string;
  inviterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, role, inviteToken, inviterName }: InvitationRequest = await req.json();

    console.log("Sending invitation email to:", email);

    const inviteUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/accept-team-invitation?token=${inviteToken}`;

    const emailResponse = await resend.emails.send({
      from: "GrantSwipe Team <onboarding@resend.dev>",
      to: [email],
      subject: `You've been invited to join the GrantSwipe team as ${role}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
            Team Invitation
          </h1>
          
          <p>Hello <strong>${name}</strong>,</p>
          
          <p>You've been invited by <strong>${inviterName}</strong> to join their GrantSwipe team as a <strong>${role}</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Role: ${role}</h3>
            <p style="margin-bottom: 0;">You'll have access to grant management features based on your assigned role.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold;
                      display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This invitation will expire in 7 days. If you can't click the button above, 
            copy and paste this link into your browser:
          </p>
          <p style="word-break: break-all; color: #007bff; font-size: 14px;">
            ${inviteUrl}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="color: #888; font-size: 12px; text-align: center;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-team-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);