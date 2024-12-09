import { Edit2 } from 'lucide-react';

export const ProfileInfo = ({ profile, user, onEditProfile,showProfileConfig = true }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-2xl font-semibold text-gray-900">
        {profile?.userName || `${profile?.firstName} ${profile?.lastName}`}
      </h2>
      {showProfileConfig &&(
      <button
        onClick={onEditProfile}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 text-sm"
      >
        <Edit2 size={16} />
        Edit Profile
      </button>
      )}
    </div>
    {user && (
    <p className="text-sm text-gray-500">
      Member since {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "N/A"}
    </p>
    )}
  </div>
);