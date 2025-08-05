import { TeamInviteForm } from "@/components/TeamInviteForm";
import { TeamMembersList } from "@/components/TeamMembersList";

const TeamManagement = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
        <p className="text-gray-600">
          Invite team members and manage your collaborative workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <TeamInviteForm />
        </div>
        <div>
          <TeamMembersList />
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;