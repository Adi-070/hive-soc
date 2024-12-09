import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../../lib/firebaseConfig";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";
import { ArrowLeft,Camera, MapPin, Link as LinkIcon, Calendar, Edit2, LogOut, Grid, User2, Mail, Phone, Heart, Bell, Users, KeyRound, ShieldCheck } from 'lucide-react'
import { onAuthStateChanged } from "firebase/auth";
import { ErrorMessage } from "@/components/dashboard/ErrorMessage";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import { ProfileData } from "@/components/dashboard/ProfileData";
import { ProfileHeader } from "@/components/dashboard/ProfileHeader";
import { ProfileInfo } from "@/components/dashboard/ProfileInfo";
import PostSection from "@/components/posts/PostSection"
import { FriendsList } from "@/components/friends/FriendsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/dashboard/Header";

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (id && currentUser) {
      fetchUserProfile(id);
      checkFriendStatus(id);
    }
  }, [id, currentUser]);

  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      setProfile(data);
    } catch (err) {
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
    console.log(id)
  };

  const checkFriendStatus = async (userId) => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .or(`user_id.eq.${currentUser.uid},friend_id.eq.${currentUser.uid}`)
        .eq("friend_id", userId)
        .single();

      if (error) throw error;

      if (data && data.status === "accepted") {
        setIsFriend(true);
      }
      if (data && data.status === "pending") {
        setRequestSent(true);
      }

    } catch (error) {
      console.error("Failed to check friend status", error);
    }
  };

  const handleAddFriend = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from("friends")
        .insert([{
          user_id: currentUser.uid,
          friend_id: id,
          status: "pending",
        }]);

      if (error) throw error;

      setRequestSent(true);
    } catch (error) {
      console.error("Failed to send friend request", error);
    }
  };

  

  const handleUnfriend = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from("friends")
        .delete()
        .match({
          user_id: currentUser.uid,
          friend_id: id,
        });

      if (error) throw error;

      setIsFriend(false);
      setRequestSent(false);
    } catch (error) {
      console.error("Failed to unfriend", error);
    }
  };

  const formatValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return value || "Not specified";
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4 sm:px-6">
          <Header showLogOut={false}/>
        </div>
      </header>

          {/* Main Profile Section */}
          <div className="container pt-8 sm:pt-16 px-4 sm:px-6">
        <div className="flex">
          <Tabs defaultValue="profile" className="w-full">
            <div className="flex flex-col md:flex-row md:pl-8">
              {/* Mobile Tab List */}
              <TabsList className="flex md:hidden h-auto w-full space-x-2 rounded-lg bg-background p-2 mb-4 overflow-x-auto">
                <TabsTrigger value="profile" className="flex-1 min-w-[80px]">
                  <User2 className="h-4 w-4 md:mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="posts" className="flex-1 min-w-[80px]">
                  <Grid className="h-4 w-4 md:mr-2" />
                  <span className="hidden sm:inline">Posts</span>
                </TabsTrigger>
              </TabsList>

              {/* Desktop Tab List */}
              <TabsList className="hidden md:flex flex-col h-full w-64 space-y-2 rounded-lg bg-background p-2">
                <TabsTrigger value="profile" className="justify-start w-full">
                  <User2 className="mr-2 h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="posts" className="justify-start w-full">
                  <Grid className="mr-2 h-4 w-4" />
                  Posts
                </TabsTrigger>
              </TabsList>
          
              <div className="flex-grow md:pl-8 w-full">
                <TabsContent value="profile">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-4 sm:px-6 py-4">
                      <ProfileHeader
                        profile={profile}
                        showProfileConfig={false}
                      />
                        {/* Add/Unfriend Button */}
                  <div className="flex justify-center">
                    {isFriend ? (
                      <button
                        onClick={handleUnfriend}
                        className="w-1/3 bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition"
                      >
                        Unfriend
                      </button>
                    ) : requestSent ? (
                      <p className="text-blue-900 font-medium">Request sent</p>
                    ) : (
                      <button
                        onClick={handleAddFriend}
                        className="w-1/3 bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition"
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                      <ProfileInfo
                        profile={profile}
                        showProfileConfig={false}
                      />
                      <ProfileData profile={profile} formatValue={formatValue} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="posts">
                  <div className="max-w-2xl mx-auto">
                    <PostSection userId={id} />
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
          </div>
                  {/* Add/Unfriend Button */}
                  {/* <div className="mt-6 flex justify-center">
                    {isFriend ? (
                      <button
                        onClick={handleUnfriend}
                        className="w-1/2 bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition"
                      >
                        Unfriend
                      </button>
                    ) : requestSent ? (
                      <p className="text-blue-900 font-medium">Request sent</p>
                    ) : (
                      <button
                        onClick={handleAddFriend}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition"
                      >
                        Add Friend
                      </button>
                    )}
                  </div> */}
            </div>
  );
}
