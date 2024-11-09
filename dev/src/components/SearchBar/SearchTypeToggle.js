'use client'

export const SearchTypeToggle = ({ searchType, setSearchType }) => {
  return (
    <div className="flex space-x-2 mb-2">
      <button
        type="button"
        onClick={() => setSearchType('name')}
        className={`px-4 py-2 rounded-full ${
          searchType === 'name'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Search by Name
      </button>
      <button
        type="button"
        onClick={() => setSearchType('interests')}
        className={`px-4 py-2 rounded-full ${
          searchType === 'interests'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Search by Interests
      </button>
    </div>
  )
}