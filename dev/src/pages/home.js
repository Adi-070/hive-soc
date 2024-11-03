'use client'

import { useState } from 'react'
import { Search, User, MessageSquare, Bell } from 'lucide-react'
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from 'next/router';

export default function Home() {
  const [query, setQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [mainSearchResults, setMainSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleInputChange = async (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    setShowDropdown(inputValue.length > 0);

    if (inputValue.length === 0) {
      setSearchResults([]);
      return;
    }

    // Fetch profiles for live search dropdown
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`firstName.ilike.%${inputValue}%`, `lastName.ilike.%${inputValue}%`)
      .limit(5); // Limit to 5 results for dropdown

    if (error) {
      console.error("Error fetching profiles:", error.message);
      setSearchResults([]);
    } else {
      setSearchResults(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowDropdown(false);  // Hide dropdown when performing main search
    setLoading(true);

    // Fetch profiles for main search results
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`firstName.ilike.%${query}%`, `lastName.ilike.%${query}%`);

    if (error) {
      console.error("Error fetching profiles:", error.message);
      setMainSearchResults([]);
    } else {
      setMainSearchResults(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex items-center justify-between">
        <div className="w-16"></div> {/* Spacer */}
        <div className="flex-grow flex justify-center">
          <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search users by name..."
              className="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Search className="h-5 w-5" />
            </button>

          {/* Live Search Dropdown */}
{showDropdown && searchResults.length > 0 && (
  <ul className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
    {searchResults.map((profile) => (
      <li
        key={profile.user_id}
        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer space-x-3"
        onClick={() => {
          setQuery(`${profile.firstName} ${profile.lastName}`);
          setShowDropdown(false);
        }}
      >
        {/* Profile Image Placeholder */}
        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {profile.firstName[0]}
          {profile.lastName[0]}
        </div>
        {/* Profile Details */}
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
)}

          </form>
        </div>
        <div className="relative w-16 flex justify-end space-x-10">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <User className="h-6 w-6 text-gray-600" />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-12 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
              <a
                href="/dashboard"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Your Profile
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Settings
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Sign out
              </a>
            </div>
          )}

{/* <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Bell className="h-5 w-5 text-gray-600" />
          </button>
          {isNotificationOpen && (
            <div className="absolute right-0 mt-12 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                New Notifications
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                All Notifications
              </a>
            </div>
          )} */}

{/* <button
            onClick={() => setIsMessageOpen(!isMessageOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <MessageSquare className="h-5 w-5 text-gray-600" />
          </button>
          {isMessageOpen && (
            <div className="absolute right-0 mt-12 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                New Message
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Inbox
              </a>
            </div>
          )} */}
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Welcome to Our Website</h1>

        {/* Main Search Results */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="w-full max-w-2xl mt-6">
            {mainSearchResults.length > 0 ? (
              <ul className="bg-white shadow-lg rounded-lg p-4 space-y-2">
                {mainSearchResults.map((profile) => (
                  <li key={profile.user_id} className="p-4 border-b last:border-none">
                    <h3 className="text-lg font-semibold">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <p>Age: {profile.age}</p>
                    <p>City: {profile.city}</p>
                    <p>Interests: {profile.interests}</p>
                  </li>
                ))}
              </ul>
            ) : (
              query && <p className="text-gray-600 text-center">No results found for "{query}"</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
