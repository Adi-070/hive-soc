'use client'

import { Search } from 'lucide-react'

export const SearchInput = ({ query, onChange, onSubmit, searchType }) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={onChange}
        placeholder={searchType === 'name' ? "Search users by name..." : "Search users by interests..."}
        className="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="submit"
        onClick={onSubmit}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  )
}