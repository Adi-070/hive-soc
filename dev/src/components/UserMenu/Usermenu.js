'use client'

import { User } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const UserMenu = ({ isOpen, onToggle, onLogout, user }) => {
  return (
    <div className="relative w-16 flex justify-end">
      <button
        onClick={onToggle}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
         <Avatar>
          <AvatarImage src={user?.display_picture} alt={user?.firstName} />
          <AvatarFallback>
            <User className="h-6 w-6 text-gray-600" />
          </AvatarFallback>
        </Avatar>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-12 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Your Profile
          </Link>
          <Link
            href="/settings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Settings
          </Link>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={onLogout}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
