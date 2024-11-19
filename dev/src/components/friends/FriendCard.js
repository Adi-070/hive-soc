import Link from 'next/link';

export const FriendCard = ({ friend }) => (
    <Link href={`/profile/${friend.user_id}`}>
      <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            {friend.display_picture ? (
              <img
                src={friend.display_picture}
                alt={`${friend.firstName} ${friend.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
                {friend.firstName?.[0]}{friend.lastName?.[0]}
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">
              {friend.firstName} {friend.lastName}
            </p>
            <p className="text-sm text-gray-500">
              {Array.isArray(friend.interests) && friend.interests.length > 0
                ? friend.interests.join(", ")
                : "Not specified"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );