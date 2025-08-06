
import ProfileSetup from "@/components/ProfileSetup";

const Profile = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile information and preferences
        </p>
      </div>
      
      <ProfileSetup />
    </div>
  );
};

export default Profile;
