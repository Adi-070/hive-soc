'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { auth } from "../../lib/firebaseConfig"
import { supabase } from "../../lib/supabaseClient"
import { signOut } from "firebase/auth"
import Link from "next/link"
import { Header } from "@/components/dashboard/Header";
import { ErrorMessage } from "@/components/dashboard/ErrorMessage";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import { ProfileData } from "@/components/dashboard/ProfileData";
import { ProfileHeader } from "@/components/dashboard/ProfileHeader";
import { ProfileInfo } from "@/components/dashboard/ProfileInfo";
import { FriendRequests } from "@/components/friends/FriendRequests";
import PostSection from "@/components/posts/PostSection"
import { FriendsList } from "@/components/friends/FriendsList";
import { Camera, MapPin, Link as LinkIcon, Calendar, Edit2, LogOut, Grid, User2, Mail, Phone, Heart, Bell, Users, KeyRound, ShieldCheck } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [friendRequests, setFriendRequests] = useState([])
  const [friends, setFriends] = useState([])
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user)
        await fetchUserProfile(user.uid)
        await fetchFriendRequests(user.uid)
        await fetchFriends(user.uid)

        const friendRequestSubscription = supabase
          .channel('friend_requests')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'friends',
              filter: `friend_id=eq.${user.uid}`,
            },
            () => {
              fetchFriendRequests(user.uid)
              fetchFriends(user.uid)
            }
          )
          .subscribe()

        return () => {
          friendRequestSubscription.unsubscribe()
        }
      } else {
        router.push("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      setError("Failed to load profile data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchFriends = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("friends")
        .select(`
          *,
          user_profile:profiles!friends_user_id_fkey (
            firstName,
            lastName,
            user_id,
            city,
            interests,
            display_picture
          ),
          friend_profile:profiles!friends_friend_id_fkey (
            firstName,
            lastName,
            user_id,
            city,
            interests,
            display_picture
          )
        `)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted')

      if (error) throw error

      const processedFriends = data.map(friendship => {
        const friendProfile = friendship.user_id === userId 
          ? friendship.friend_profile 
          : friendship.user_profile

        return {
          ...friendProfile,
          friendshipId: friendship.id
        }
      })

      const uniqueFriends = Array.from(
        new Map(processedFriends.map(friend => [friend.user_id, friend]))
        .values()
      )

      setFriends(uniqueFriends)
    } catch (err) {
      console.error("Error fetching friends:", err)
    }
  }

  const fetchFriendRequests = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("friends")
        .select(`*,
          profiles:user_id (
            userName,
            firstName,
            lastName,
            user_id,
            display_picture
          )`)
        .eq("friend_id", userId)
        .eq("status", "pending")

      if (error) throw error
      setFriendRequests(data)
    } catch (err) {
      console.error("Error fetching friend requests:", err)
    }
  }

  const formatValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(", ")
    }
    return value || "Not specified"
  }

  const handleFriendRequest = async (requestId, status) => {
    try {
      const { error } = await supabase
        .from("friends")
        .update({ status })
        .eq("id", requestId)

      if (error) throw error

      if (user) {
        await fetchFriendRequests(user.uid)
        await fetchFriends(user.uid)
      }
    } catch (err) {
      console.error("Error handling friend request:", err)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (err) {
      console.error("Error logging out:", err)
    }
  }

  const handleEditProfile = () => {
    router.push({
      pathname: "/forms",
      query: { profile: JSON.stringify(profile) },
    })
  }
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
       <Header/>
        </div>
      </header>

      <div className="container pt-16">
        <div className="flex">
          <Tabs defaultValue="profile" className="flex-1">
            <div className="flex pl-16">
           
              <TabsList className="flex-col h-full w-64 space-y-2 rounded-lg bg-background p-2">
                <TabsTrigger value="profile" className="justify-start w-full">
                  <User2 className="mr-2 h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="password" className="justify-start w-full">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Password
                </TabsTrigger>
                <TabsTrigger value="notifications" className="justify-start w-full">
                  <Bell className="mr-2 h-4 w-4" />
                  Requests
                </TabsTrigger>
                <TabsTrigger value="friends" className="justify-start w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Friends
                </TabsTrigger>
                <TabsTrigger value="posts" className="justify-start w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Posts
                </TabsTrigger>
              </TabsList>
          
              <div className="flex-grow pl-8">
                <TabsContent value="profile">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4">
                    <ProfileHeader
                      profile={profile}
                      onEditProfile={handleEditProfile}
                    />
                    <ProfileInfo
                      profile={profile}
                      user={user}
                      onEditProfile={handleEditProfile}
                    />
                    <ProfileData profile={profile} formatValue={formatValue} />
                  </div>
                </div>
                </TabsContent>
                <TabsContent value="password">
                  <Card>
                    <CardHeader>
                      <CardTitle>Password</CardTitle>
                      <CardDescription>
                        Change your password here. After saving, you'll be logged out.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Add password change form here */}
                      <p>Password change functionality to be implemented.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Friend Requests</CardTitle>
                      <div>  <FriendRequests 
                requests={friendRequests}
                onAccept={(id) => handleFriendRequest(id, "accepted")}
                onDecline={(id) => handleFriendRequest(id, "rejected")}
              /></div>
                    </CardHeader>
                  </Card>
                </TabsContent>
                <TabsContent value="friends">
               
                  <Card>
                    <CardHeader>
                      <CardTitle>Friends</CardTitle>
                      <div className="mt-8 space-y-8">
                  <FriendsList friends={friends} />
                </div>
                    </CardHeader>
                  </Card>
                </TabsContent>
                <TabsContent value="posts">
            <PostSection userId={user?.uid} />
          </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}