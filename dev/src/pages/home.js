// app/page.js
'use client'

import { useState, useEffect } from 'react'
import { signOut } from "firebase/auth"
import { auth } from "../../lib/firebaseConfig"
import { supabase } from "../../lib/supabaseClient"
import { useRouter } from 'next/navigation'
import { SearchTypeToggle, SearchInput, SearchDropdown } from '../components/SearchBar'
import { UserMenu } from '../components/UserMenu/Usermenu'
import { SearchResultsModal } from '../components/SearchResults/SearchResultsModal'
import { calculateRelevanceScore } from '../../lib/searchUtils'

export default function Home() {
  const [query, setQuery] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchType, setSearchType] = useState('name')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isModalOpen && !event.target.closest('.modal-content')) {
        setIsModalOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isModalOpen])

  const handleSearch = async (searchTerms, fullQuery) => {
    if (searchType === 'name') {
      // Name search remains the same
      const querySearch = supabase
        .from("profiles")
        .select("*")
        .or(
          searchTerms.map(term => `firstName.ilike.%${term}%,lastName.ilike.%${term}%`).join(',')
        )
  
      const { data, error } = await querySearch
  
      if (error) {
        console.error("Error fetching profiles:", error.message)
        return []
      }
  
      return data
        .map(profile => ({
          ...profile,
          relevanceScore: calculateRelevanceScore(profile, searchTerms, fullQuery, searchType)
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
  
    } else {
      // Interests search with array containment
      const { data, error } = await supabase
      .from("profiles")
      .select("*")

    if (error) {
      console.error("Error fetching profiles:", error.message)
      return []
    }

    // Filter and score profiles in JavaScript
    const filteredData = data.filter(profile => {
      if (!Array.isArray(profile.interests)) return false;
      return searchTerms.some(term => 
        profile.interests.some(interest => 
          interest.toLowerCase().includes(term.toLowerCase())
        )
      );
    });

    return filteredData
      .map(profile => ({
        ...profile,
        relevanceScore: calculateRelevanceScore(profile, searchTerms, fullQuery, searchType)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
    }
  }

  const handleInputChange = async (e) => {
    const inputValue = e.target.value
    setQuery(inputValue)
    setShowDropdown(inputValue.length > 0)

    if (inputValue.length === 0) {
      setSearchResults([])
      return
    }

    const searchTerms = inputValue.trim().split(/\s+/)
    const results = await handleSearch(searchTerms, inputValue.trim())
    setSearchResults(results.slice(0, 5))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setShowDropdown(false)
    setLoading(true)
    setIsModalOpen(true)

    const trimmedQuery = query.trim()
    if (trimmedQuery.length === 0) {
      setSearchResults([])
      setLoading(false)
      return
    }

    const searchTerms = trimmedQuery.split(/\s+/)
    const results = await handleSearch(searchTerms, trimmedQuery)
    setSearchResults(results.map(({ relevanceScore, ...profile }) => profile))
    setLoading(false)
  }

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex flex-col text-black">
      <header className="p-4 flex items-center justify-between">
        <div className="w-16"></div>
        <div className="flex-grow flex justify-center">
          <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
            {/* <SearchTypeToggle 
              searchType={searchType}
              setSearchType={setSearchType}
            /> */}
            <SearchInput
              query={query}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              searchType={searchType}
              setSearchType={setSearchType}
            />
            {showDropdown && (
              <SearchDropdown
                searchResults={searchResults}
                searchType={searchType}
                onSelect={(profile) => {
                  setQuery(searchType === 'name' 
                    ? `${profile.firstName} ${profile.lastName}`
                    : profile.interests.join(', '))
                  setShowDropdown(false)
                }}
              />
            )}
          </form>
        </div>
        <UserMenu 
          isOpen={isProfileOpen}
          onToggle={() => setIsProfileOpen(!isProfileOpen)}
          onLogout={handleLogout}
        />
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Welcome to Our Website</h1>
      </main>

      <SearchResultsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        query={query}
        loading={loading}
        searchResults={searchResults}
        onProfileClick={(userId) => router.push(`/profile/${userId}`)}
      />
    </div>
  )
}