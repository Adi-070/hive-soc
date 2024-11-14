'use client'
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from "react";

export const SearchTypeToggle = ({ searchType, setSearchType,showDropdown }) => {
  const [showTypeDropdown, setShowTypeDropdown] = useState(null);
  return (
    <div className="relative w-full">
      <div className="flex gap-0">
        {/* Search Type Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className="flex items-center justify-between px-4 py-2 bg-white border border-r-0 rounded-r-full hover:bg-gray-50 focus:outline-none"
          >
            <span className="mr-2">{searchType === 'name' ? 'Name' : 'Interests'}</span>
            <ChevronDown size={16} />
          </button>
          
          {/* Search Type Options */}
          {showTypeDropdown && (
            <div className="absolute left-0 mt-1 w-full bg-white border rounded-lg shadow-lg z-20">
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSearchType('name');
                  setShowTypeDropdown(false);
                }}
              >
                Name
              </div>
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSearchType('interests');
                  setShowTypeDropdown(false);
                }}
              >
                Interests
              </div>
            </div>
          )}
        </div>
        {showDropdown && (
        <SearchDropdown
          searchResults={searchResults}
          searchType={searchType}
          onSelect={onSelect}
        />
      )}
    </div>
    </div>
  )
}