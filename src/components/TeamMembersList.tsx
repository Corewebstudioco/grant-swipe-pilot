import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Mail, Clock, CheckCircle, XCircle } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  invited_at: string;
  accepted_at?: string;
}

export const TeamMembersList = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUser();

  const fetchTeamMembers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("inviter_id", user.id)
        .order("invited_at", { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error: any) {
      console.error("Error fetching team members:", error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendInvitation = async (memberId: string, email: string, name: string, role: string) => {
    try {
      // Generate new invite token
      const newInviteToken = crypto.randomUUID();
      
      // Update the invite token in database
      const { error: updateError } = await supabase
        .from("team_members")
        .update({ 
          invite_token: newInviteToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq("id", memberId);

      if (updateError) throw updateError;

      // Resend invitation email
      const { error: emailError } = await supabase.functions.invoke("send-team-invitation", {
        body: {
          name,
          email,
          role,
          inviteToken: newInviteToken,
          inviterName: user?.email
        }
      });

      if (emailError) {
        toast({
          title: "Token Updated",
          description: "Invitation token was updated but email could not be sent",
          variant: "default"
        });
      } else {
        toast({
          title: "Invitation Resent",
          description: `Invitation resent successfully to ${email}`,
          variant: "default"
        });
      }

      // Refresh the list
      fetchTeamMembers();
    } catch (error: any) {
      console.error("Resend invitation error:", error);
      toast({
        title: "Error",
        description: "Failed to resend invitation",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "expired":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "accepted":
        return "default";
      case "expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [user]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members ({teamMembers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {teamMembers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No team members invited yet
          </p>
        ) : (
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(member.status)}
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(member.status) as any}>
                    {member.role}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="capitalize">
                    {member.status}
                  </Badge>
                  {member.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resendInvitation(member.id, member.email, member.name, member.role)}
                    >
                      Resend
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};