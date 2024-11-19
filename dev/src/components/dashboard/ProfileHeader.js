import { Camera } from "lucide-react";

export const ProfileHeader = ({ profile, onEditProfile }) => (
  <div className="relative -mt-16 mb-4">
    <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
      {profile?.display_picture ? (
        <img 
          src={profile.display_picture}
          alt={`${profile.firstName} ${profile.lastName}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
          {profile?.firstName?.[0]}{profile?.lastName?.[0]}
        </div>
      )}
    </div>
    <button 
      onClick={onEditProfile}
      className="absolute bottom-2 right-2 bg-blue-500 p-2 rounded-full text-white hover:bg-blue-600 shadow-lg transition-colors duration-200"
    >
      <Camera size={16} />
    </button>
  </div>
);