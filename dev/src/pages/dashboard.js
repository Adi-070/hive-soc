import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../lib/firebaseConfig";
import { supabase } from "../../lib/supabaseClient";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Camera, MapPin, Link as LinkIcon, Calendar, Edit2, LogOut, Grid, User2, Mail, Phone, Heart, Bell, Users } from 'lucide-react';

import { Header } from "@/components/dashboard/Header";
import { ErrorMessage } from "@/components/dashboard/ErrorMessage";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import { ProfileData } from "@/components/dashboard/ProfileData";
import { ProfileHeader } from "@/components/dashboard/ProfileHeader";
import { ProfileInfo } from "@/components/dashboard/ProfileInfo";
import { FriendCard } from "@/components/friends/FriendCard";
import { FriendRequestCard } from "@/components/friends/FriendRequestCard";
import { FriendRequests } from "@/components/friends/FriendRequests";
import { FriendsList } from "@/components/friends/FriendsList";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
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
        .select(`
          *,
          profiles:user_id (
            userName,
            firstName,
            lastName,
            user_id,
            display_picture
          )
        `)
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


  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={handleLogout} />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <FriendRequests 
            requests={friendRequests}
            onAccept={(id) => handleFriendRequest(id, "accepted")}
            onDecline={(id) => handleFriendRequest(id, "rejected")}
          />

          <FriendsList friends={friends} />

          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            
            <div className="px-6 pb-6">
              <ProfileHeader 
                profile={profile}
                onEditProfile={handleEditProfile}
              />

              <ProfileInfo 
                profile={profile}
                user={user}
                onEditProfile={handleEditProfile}
              />

              <ProfileData 
                profile={profile}
                formatValue={formatValue}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}