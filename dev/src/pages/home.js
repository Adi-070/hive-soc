'use client'

import { useState, useEffect } from 'react'
import { signOut } from "firebase/auth"
import { auth } from "../../lib/firebaseConfig"
import { supabase } from "../../lib/supabaseClient"
import { useRouter } from 'next/navigation'
import { SearchInput, SearchDropdown, SearchTypeToggle } from '../components/SearchBar'
import { UserMenu } from '../components/UserMenu/Usermenu'
import { SearchResultsModal } from '../components/SearchResults/SearchResultsModal'
import { X } from 'lucide-react'
import { calculateRelevanceScore } from '../../lib/searchUtils'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FriendsPostInteractions } from '@/components/posts/FriendsPostInteractions'

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const validateImageFile = (file) => {
  if (!file) return 'No file selected';
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload a JPEG, PNG, or GIF';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File size too large. Maximum size is 5MB';
  }
  return null;
};

export default function Home() {
  const [query, setQuery] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [searchType, setSearchType] = useState('name')
  const [postDetails, setPostDetails] = useState({ title: '', content: '', category: [], image: null })
  const [currentCategory, setCurrentCategory] = useState('')
  const router = useRouter()
  const [friendsPosts, setFriendsPosts] = useState([])

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
  // Handle post creation

  const fetchFriendsPosts = async () => {
    try {
      // First, get the current user's friends
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', auth.currentUser?.uid)

      if (friendsError) {
        console.error("Error fetching friends:", friendsError)
        return
      }

      // Extract friend IDs
      const friendIds = friendsData.map(friendship => friendship.friend_id)

      // Fetch posts from friends
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*, profiles(*),likes: likes!post_id(count)')
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .limit(10)

      if (postsError) {
        console.error("Error fetching friends' posts:", postsError)
        return
      }

      setFriendsPosts(postsData)
    } catch (error) {
      console.error("Error in fetchFriendsPosts:", error)
    }
  }

  // Fetch friends' posts when component mounts
  useEffect(() => {
    if (auth.currentUser) {
      fetchFriendsPosts()
    }
  }, [])

  const handlePostUpload = async (e) => {
    e.preventDefault()
    const { title, content, category, image } = postDetails

    if (!title || !content) {
      alert("Please provide both title and content!")
      return
    }

    let imageUrl = null

    if (image) {
      // Validate the image
      const validationError = validateImageFile(image);
      if (validationError) {
        alert(validationError);
        return;
      }

      try {
        // Upload image to Supabase storage (posts-images bucket)
        const { data, error } = await supabase.storage
          .from('posts-images')
          .upload(`${Date.now()}_${image.name}`, image)

        if (error) {
          console.error("Error uploading image:", error.message)
          alert("Failed to upload image. Please try again.")
          return
        }

        imageUrl = `https://cqaaxqruurapltillhzq.supabase.co/storage/v1/object/public/posts-images/${data.path}`
      } catch (error) {
        console.error("Error uploading image:", error)
        alert("Failed to upload image. Please try again.")
        return
      }
    }

    try {
      // Insert post details into the 'posts' table
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          title,
          content,
          category,
          image_url: imageUrl,
          user_id: auth.currentUser?.uid // Replace with your user authentication logic
        })

      if (postError) {
        console.error("Error creating post:", postError.message)
        alert("Failed to create post. Please try again.")
        return
      }

      alert("Post created successfully!")
      setPostDetails({ title: '', content: '', category: [], image: null }) // Reset form
      setIsPostModalOpen(false) // Close the modal after post creation
    } catch (error) {
      console.error("Error submitting post:", error)
      alert("Failed to create post. Please try again.")
    }
  }

  const handleAddCategory = (e) => {
    e.preventDefault()
    if (currentCategory && !postDetails.category.includes(currentCategory)) {
      setPostDetails(prev => ({
        ...prev,
        category: [...prev.category, currentCategory]
      }))
      setCurrentCategory('')
    }
  }

  const handleRemoveCategory = (cat) => {
    setPostDetails(prev => ({
      ...prev,
      category: prev.category.filter(c => c !== cat)
    }))
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

  const handleSearch = async (searchTerms, fullQuery) => {
    if (searchType === 'name') {
      // Name search remains the same
      const querySearch = supabase
        .from("profiles")
        .select("*")
        .or(
          searchTerms.map(term => `firstName.ilike.%${term}%,lastName.ilike.%${term}%,userName.ilike.%${term}%`).join(',')
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
                    ? `${profile.firstName} ${profile.lastName} ${profile.userName}`
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
          onLogout={async () => {
            await signOut(auth)
            router.push("/authpage")
          }}
        />
      </header>
      <div className="w-full flex justify-center">
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <span className="text-gray-500">Click to start creating a post</span>
          <button
            className="ml-auto"
            onClick={() => setIsPostModalOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 5v14m7-7H5"
              />
            </svg>
          </button>
        </div>
      </div>
      <main className="flex-grow flex flex-col items-center px-4"></main>

      {/* Friends Posts Section */}
      <div className="w-full max-w-2xl mx-auto mt-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Friends&apos; Posts</h2>
        {friendsPosts.length === 0 ? (
          <p className="text-gray-500">No posts from friends yet</p>
        ) : (
          <div className="space-y-4">
            {friendsPosts.map((post) => (
              <Card key={post.id} className="border-b last:border-b-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 pb-2">
                  <div className="flex items-center space-x-4 sm:space-x-0">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                      <AvatarImage
                        src={post.profiles.display_picture || "/placeholder-avatar.png"}
                        alt={post.profiles.userName || "User"}
                      />
                      <AvatarFallback>
                        {post.profiles.userName?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1 mt-3 sm:mt-0">
                    <CardTitle className="text-sm sm:text-base font-medium">
                      {post.profiles.userName || "Unknown User"}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground truncate">
                      {post.title}
                    </CardDescription>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-0">
                    {post.created_at
                      ? new Date(post.created_at.replace(" ", "T")).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "Unknown date"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm sm:text-base text-gray-700">{post.content}</p>
                 
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {post.category && post.category.length > 0 ? (
                      post.category.map((cat, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs sm:text-sm px-2 py-1"
                        >
                          {cat.trim()}
                        </Badge>
                      ))
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-xs sm:text-sm px-2 py-1"
                      >
                        Uncategorized
                      </Badge>
                    )}
                  </div>
                  {post.image_url && (
                    <div className="relative w-full">
                      <img
                        src={post.image_url}
                        alt="Post Image"
                        className="w-full h-auto rounded-md object-cover max-h-[400px]"
                        loading="lazy"
                      />
                    </div>
                  )}
                </CardContent>
                <FriendsPostInteractions posts={[post] || []} />
              </Card>
            ))}
          </div>
        )}
      </div>


      <SearchResultsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        query={query}
        loading={loading}
        searchResults={searchResults}
        onProfileClick={(userId) => router.push(`/profile/${userId}`)}
      />

      {/* Post Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              onClick={() => setIsPostModalOpen(false)}
            >
              &times;
            </button>
            <form onSubmit={handlePostUpload} className="space-y-8">
              <div className="space-y-4">
                <input
                  type="text"
                  value={postDetails.title}
                  onChange={(e) => setPostDetails({ ...postDetails, title: e.target.value })}
                  placeholder="Post title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {postDetails.category.map((cat, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                        {cat}
                        <button type="button" onClick={() => handleRemoveCategory(cat)} className="ml-1 focus:outline-none">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={currentCategory}
                      onChange={(e) => setCurrentCategory(e.target.value)}
                      placeholder="Add a category"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-md"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <textarea
                  value={postDetails.content}
                  onChange={(e) => setPostDetails({ ...postDetails, content: e.target.value })}
                  placeholder="Write your content..."
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPostDetails({ ...postDetails, image: e.target.files[0] })}
                  className="block w-full"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Create Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}