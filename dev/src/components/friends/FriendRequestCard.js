export const FriendRequestCard = ({ request, onAccept, onDecline }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          {request.profiles.display_picture ? (
            <img
              src={request.profiles.display_picture}
              alt={`${request.profiles.firstName} ${request.profiles.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
              {request.profiles.firstName?.[0]}{request.profiles.lastName?.[0]}
            </div>
          )}
        </div>
        <div>
          <p className="font-medium">
            {request.profiles.firstName} {request.profiles.lastName}
          </p>
          <p className="text-sm text-gray-500">Wants to connect with you</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(request.id)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          Accept
        </button>
        <button
          onClick={() => onDecline(request.id)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
        >
          Decline
        </button>
      </div>
    </div>
  );