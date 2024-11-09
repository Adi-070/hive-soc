'use client'

export const SearchDropdown = ({ searchResults, searchType, onSelect }) => {
  if (!searchResults.length) return null

  return (
    <ul className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
      {searchResults.map((profile) => (
        <li
          key={profile.user_id}
          className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer space-x-3"
          onClick={() => onSelect(profile)}
        >
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {profile.firstName[0]}
            {profile.lastName[0]}
          </div>
          <div>
            <p className="text-gray-900 font-medium">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-gray-500 text-sm">
              {profile.city ? `${profile.city}, ` : ""}{profile.age ? `Age: ${profile.age}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}