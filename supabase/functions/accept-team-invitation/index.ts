import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #dc3545;">Invalid Invitation</h1>
          <p>The invitation link is missing required information.</p>
        </body>
      </html>
    `, {
      status: 400,
      headers: { "Content-Type": "text/html" }
    });
  }

  try {
    // Find the invitation by token
    const { data: invitation, error: fetchError } = await supabase
      .from("team_members")
      .select("*")
      .eq("invite_token", token)
      .eq("status", "pending")
      .single();

    if (fetchError || !invitation) {
      return new Response(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #dc3545;">Invitation Not Found</h1>
            <p>This invitation is invalid, expired, or has already been accepted.</p>
          </body>
        </html>
      `, {
        status: 404,
        headers: { "Content-Type": "text/html" }
      });
    }

    // Check if invitation has expired
    const expiresAt = new Date(invitation.expires_at);
    const now = new Date();
    
    if (now > expiresAt) {
      // Update status to expired
      await supabase
        .from("team_members")
        .update({ status: "expired" })
        .eq("id", invitation.id);

      return new Response(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #ffc107;">Invitation Expired</h1>
            <p>This invitation has expired. Please contact your team administrator for a new invitation.</p>
          </body>
        </html>
      `, {
        status: 410,
        headers: { "Content-Type": "text/html" }
      });
    }

    // Update invitation status to accepted
    const { error: updateError } = await supabase
      .from("team_members")
      .update({ 
        status: "accepted",
        accepted_at: new Date().toISOString(),
        invite_token: null // Clear the token for security
      })
      .eq("id", invitation.id);

    if (updateError) {
      throw updateError;
    }

    // Success page
    return new Response(`
      <html>
        <head>
          <title>Invitation Accepted</title>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #28a745; margin-bottom: 20px;">🎉 Invitation Accepted!</h1>
            <p style="font-size: 18px; margin-bottom: 20px;">
              Welcome to the GrantSwipe team, <strong>${invitation.name}</strong>!
            </p>
            <p style="color: #666; margin-bottom: 30px;">
              You have been added as a <strong>${invitation.role}</strong> to the team.
            </p>
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2;">
                Please visit the GrantSwipe application and log in to access your team features.
              </p>
            </div>
            <p style="color: #888; font-size: 14px;">
              If you have any questions, please contact your team administrator.
            </p>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: { "Content-Type": "text/html" }
    });

  } catch (error: any) {
    console.error("Error accepting invitation:", error);
    
    return new Response(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #dc3545;">Error</h1>
          <p>An error occurred while processing your invitation. Please try again later.</p>
          <p style="color: #888; font-size: 14px;">Error: ${error.message}</p>
        </body>
      </html>
    `, {
      status: 500,
      headers: { "Content-Type": "text/html" }
    });
  }
};

serve(handler);