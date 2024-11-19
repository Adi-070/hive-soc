import { Camera } from 'lucide-react';

export const ProfileHeader = ({ profile, onEditProfile }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="relative">
      {profile?.display_picture ? (
        <img 
          src={profile.display_picture}
          alt={`${profile.firstName} ${profile.lastName}`}
          className="w-24 h-24 rounded-full object-cover"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
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
    <div className="space-x-4">
      <button onClick={onEditProfile} className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">
        Upload New
      </button>
      <button onClick={onEditProfile} className="px-3 py-1 border border-gray-300 text-gray-600 rounded-md text-sm">
        Delete avatar
      </button>
    </div>
  </div>
);