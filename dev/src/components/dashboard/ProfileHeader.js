import { Camera } from 'lucide-react';

export const ProfileHeader = ({ profile, onEditProfile }) => (
  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 mb-6">
    <div className="relative">
      {profile?.display_picture ? (
        <img 
          src={profile.display_picture}
          alt={`${profile.firstName} ${profile.lastName}`}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
        />
      ) : (
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
          {profile?.firstName?.[0]}{profile?.lastName?.[0]}
        </div>
      )}
      <button 
        onClick={onEditProfile}
        className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md"
      >
        <Camera className="w-4 h-4 text-gray-600" />
      </button>
    </div>
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <button 
        onClick={onEditProfile} 
        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm w-full sm:w-auto"
      >
        Upload New
      </button>
      <button 
        onClick={onEditProfile} 
        className="px-3 py-1 border border-gray-300 text-gray-600 rounded-md text-sm w-full sm:w-auto"
      >
        Delete Avatar
      </button>
    </div>
  </div>
);
