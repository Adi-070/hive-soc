'use client'

import { Search } from 'lucide-react'
import { SearchTypeToggle } from './SearchTypeToggle'

export const SearchInput = ({ query, onChange, onSubmit, searchType,setSearchType }) => {
  return (
    <div className="flex items-center gap-2 max-w-2xl w-full">
      <div className="relative flex-grow">
        <input
          type="text"
          value={query}
          onChange={onChange}
          placeholder={searchType === 'name' ? "Search users by name..." : "Search users by interests..."}
          className="w-full py-2 px-4 pr-10 rounded-l-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          onClick={onSubmit}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
      {/* Search Type Toggle - rounded left side only */}
      <div className="flex-shrink-0">
        <SearchTypeToggle 
          searchType={searchType} 
          setSearchType={setSearchType}
          className="rounded-r-full border-r-0" // Add these classes to your SearchTypeToggle
        />
      </div>
    </div>
  )
}