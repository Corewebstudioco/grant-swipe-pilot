
import ProfileSetup from "@/components/ProfileSetup";

const Profile = () => {
  const handleProfileComplete = () => {
    console.log('Profile setup completed');
    // Add any additional logic needed after profile completion
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile information and preferences
        </p>
      </div>
      
      <ProfileSetup onComplete={handleProfileComplete} />
    </div>
  );
};

export default Profile;
