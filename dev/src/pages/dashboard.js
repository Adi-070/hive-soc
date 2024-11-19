import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../lib/firebaseConfig";
import { supabase } from "../../lib/supabaseClient";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Camera, MapPin, Link as LinkIcon, Calendar, Edit2, LogOut, Grid, User2, Mail, Phone, Heart, Bell, Users, KeyRound, ShieldCheck } from 'lucide-react';

import { Header } from "@/components/dashboard/Header";
import { ErrorMessage } from "@/components/dashboard/ErrorMessage";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import { ProfileData } from "@/components/dashboard/ProfileData";
import { ProfileHeader } from "@/components/dashboard/ProfileHeader";
import { ProfileInfo } from "@/components/dashboard/ProfileInfo";
import { FriendRequests } from "@/components/friends/FriendRequests";
import { FriendsList } from "@/components/friends/FriendsList";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeSection, setActiveSection] = useState('profile');  // State to track the active section
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        await fetchUserProfile(user.uid);
        await fetchFriendRequests(user.uid);
        await fetchFriends(user.uid);

        // Set up real-time subscription for friend requests
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
              fetchFriendRequests(user.uid);
              fetchFriends(user.uid);
            }
          )
          .subscribe();

        return () => {
          friendRequestSubscription.unsubscribe();
        };
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError("Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        .eq('status', 'accepted');
  
      if (error) throw error;
  
      const processedFriends = data.map(friendship => {
        const friendProfile = friendship.user_id === userId 
          ? friendship.friend_profile 
          : friendship.user_profile;
  
        return {
          ...friendProfile,
          friendshipId: friendship.id
        };
      });
  
      const uniqueFriends = Array.from(
        new Map(processedFriends.map(friend => [friend.user_id, friend]))
        .values()
      );
  
      setFriends(uniqueFriends);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

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
        .eq("status", "pending");

      if (error) throw error;
      setFriendRequests(data);
    } catch (err) {
      console.error("Error fetching friend requests:", err);
    }
  };

  const formatValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return value || "Not specified";
  };

  const handleFriendRequest = async (requestId, status) => {
    try {
      const { error } = await supabase
        .from("friends")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;

      if (user) {
        await fetchFriendRequests(user.uid);
        await fetchFriends(user.uid);
      }
    } catch (err) {
      console.error("Error handling friend request:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const handleEditProfile = () => {
    router.push({
      pathname: "/forms",
      query: { profile: JSON.stringify(profile) },
    });
  };

  const handleSidebarClick = (section) => {
    setActiveSection(section); // Update the active section when a sidebar item is clicked
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header onLogout={handleLogout} />
  
      {/* Main Content */}
      <div className="pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 shrink-0">
              <nav className="space-y-1">
                <Link
                  href="#"
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeSection === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => handleSidebarClick('profile')}
                >
                  <User2 className="mr-3 h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>
                <Link
                  href="#"
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeSection === 'password' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => handleSidebarClick('password')}
                >
                  <KeyRound className="mr-3 h-4 w-4" />
                  <span>Password</span>
                </Link>
                <Link
                  href="#"
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeSection === 'notifications' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => handleSidebarClick('notifications')}
                >
                  <Bell className="mr-3 h-4 w-4" />
                  <span>Requests</span>
                </Link>
                <Link
                  href="#"
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeSection === 'friends' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => handleSidebarClick('friends')}
                >
                  <ShieldCheck className="mr-3 h-4 w-4" />
                  <span>Friends</span>
                </Link>
              </nav>
            </aside>
  
            {/* Main Content Area */}
            <main className="flex-1">
              {/* Profile Card */}
              {activeSection === 'profile' && (
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
              )}
  
              {/* Friends List */}
              {activeSection === 'friends' && (
                <div className="mt-8 space-y-8">
                  <FriendsList friends={friends} />
                </div>
              )}
  
              {/* Additional Sections */}
              {activeSection === 'notifications' && (
                <div>  <FriendRequests 
                requests={friendRequests}
                onAccept={(id) => handleFriendRequest(id, "accepted")}
                onDecline={(id) => handleFriendRequest(id, "rejected")}
              /></div>
              )}
              {activeSection === 'password' && (
                <div> {/* Password Section Content */} </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
