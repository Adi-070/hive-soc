'use client'

export const SearchResultsModal = ({ isOpen, onClose, query, loading, searchResults, onProfileClick }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto modal-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Search Results</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 mb-4">Results for &quot;{query}&quot;</p>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {searchResults.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {searchResults.map((profile) => (
                  <li
                    key={profile.user_id}
                    className="py-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => onProfileClick(profile.user_id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {profile.firstName[0]}
                        {profile.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {profile.firstName} {profile.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          Age: {profile.age}, City: {profile.city}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          Interests: {Array.isArray(profile?.interests) && profile?.interests.length > 0
    ? profile.interests.join(", ")
    : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 text-center">No results found for &quot;{query}&quot;</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}