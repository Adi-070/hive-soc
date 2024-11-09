'use client'

import { User } from 'lucide-react'

export const UserMenu = ({ isOpen, onToggle, onLogout }) => {
  return (
    <div className="relative w-16 flex justify-end">
      <button
        onClick={onToggle}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <User className="h-6 w-6 text-gray-600" />
      </button>
      {isOpen && (
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
            onClick={onLogout}
          >
            Sign out
          </a>
        </div>
      )}
    </div>
  )
}