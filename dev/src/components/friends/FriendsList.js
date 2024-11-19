import { Users } from "lucide-react";
import { FriendCard } from "./FriendCard";

export const FriendsList = ({ friends }) => (
  <div className="mt-8 text-black">
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="text-blue-500" size={20} />
        <h3 className="text-lg font-semibold">Friends</h3>
        <span className="bg-blue-100 text-blue-600 text-sm font-medium px-2 py-1 rounded-full">
          {friends.length}
        </span>
      </div>
      {friends.length === 0 ? (
        <p className="text-gray-500 text-center py-4">You haven&apos;t connected with any friends yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.map((friend) => (
            <FriendCard key={friend.user_id} friend={friend} />
          ))}
        </div>
      )}
    </div>
  </div>
);