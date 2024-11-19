import { Bell } from "lucide-react";
import { FriendRequestCard } from "./FriendRequestCard";

export const FriendRequests = ({ requests, onAccept, onDecline }) => {
  if (requests.length === 0) return null;

  return (
    <div className="mt-8 text-black">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold">Friend Requests</h3>
          <span className="bg-blue-100 text-blue-600 text-sm font-medium px-2 py-1 rounded-full">
            {requests.length}
          </span>
        </div>
        <div className="space-y-4">
          {requests.map((request) => (
            <FriendRequestCard
              key={request.id}
              request={request}
              onAccept={onAccept}
              onDecline={onDecline}
            />
          ))}
        </div>
      </div>
    </div>
  );
};