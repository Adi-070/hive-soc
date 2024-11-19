import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../../lib/firebaseConfig";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";
import { MapPin, Heart, User2, Calendar, ArrowLeft, KeyRound, Bell, ShieldCheck } from 'lucide-react';
import { onAuthStateChanged } from "firebase/auth";
import { ErrorMessage } from "@/components/dashboard/ErrorMessage";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import ProfileData from "@/components/dashboard/ProfileData";



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
    <div className="min-h-screen bg-gray-50 text-black">
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
          <Link href="/home" passHref>
            <div className="flex items-center gap-2 text-gray-600 hover:text-blue-500 cursor-pointer">
              <ArrowLeft size={18} />
              <span>Back to Search</span>
            </div>
          </Link>
        </div>
      </header>

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <nav className="space-y-1">
              <Link href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
                <User2 className="mr-3 h-4 w-4" />
                <span>Friend&apos;s Profile</span>
              </Link>
            </nav>
          </aside>

          {/* Main Profile Section */}
          <main className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500"></div>

              <div className="px-6 pb-6">
                <div className="relative -mt-16 mb-4">
                  <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                    <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                      {profile?.display_picture ? (
                        <img
                          src={profile.display_picture}
                          alt={`${profile.firstName} ${profile.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                          {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <h2 className="text-2xl font-bold text-gray-900">{profile?.userName}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Profile Details */}

                    
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="text-blue-500" size={20} />
                        <div>
                          <p className="text-sm font-medium text-gray-500">First Name</p>
                          <p className="text-gray-900 font-medium">{profile?.firstName || "Not specified"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="text-blue-500" size={20} />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Gender</p>
                          <p className="text-gray-900 font-medium">{profile?.gender || "Not specified"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="text-blue-500" size={20} />
                        <div>
                          <p className="text-sm font-medium text-gray-500">City</p>
                          <p className="text-gray-900 font-medium">{profile?.city || "Not specified"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="text-blue-500" size={20} />
                        <div>
                          <p className="text-sm font-medium text-gray-500">State</p>
                          <p className="text-gray-900 font-medium">{profile?.state || "Not specified"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="text-blue-500" size={20} />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Country</p>
                          <p className="text-gray-900 font-medium">{profile?.country || "Not specified"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="text-blue-500" size={20} />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Interests</p>
                          <p className="text-gray-900 font-medium">{formatValue(profile?.interests)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add/Unfriend Button */}
                  <div className="mt-6">
                    {isFriend ? (
                      <button
                        onClick={handleUnfriend}
                        className="w-full bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition"
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
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
