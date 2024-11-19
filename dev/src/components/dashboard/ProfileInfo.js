import { Edit2 } from "lucide-react";

export const ProfileInfo = ({ profile, user, onEditProfile }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">
        {profile?.userName} 
      </h2>
      <p className="text-gray-500 text-sm">
        Member since {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "N/A"}
      </p>
    </div>
    <button
      onClick={onEditProfile}
      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
    >
      <Edit2 size={16} />
      Edit Profile
    </button>
  </div>
);