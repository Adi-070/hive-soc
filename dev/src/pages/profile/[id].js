import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../../lib/firebaseConfig"; // Importing the auth object from firebaseConfig
import { supabase } from "../../../lib/supabaseClient"; // Supabase Client
import Link from "next/link";
import { MapPin, Heart, User2, Calendar, ArrowLeft } from 'lucide-react';
import { onAuthStateChanged } from "firebase/auth"; // Firebase Auth State Listener

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // State to hold the current Firebase user
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    // Firebase Auth state listener to track user authentication
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user); // Set the current authenticated user
      } else {
        setCurrentUser(null); // If no user is authenticated
      }
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  useEffect(() => {
    if (id && currentUser) {
      fetchUserProfile(id);
      checkFriendStatus(id);
    }
  }, [id, currentUser]);

  // Fetch profile data from Supabase
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
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  // Check if the current user is already friends or has sent a friend request
  const checkFriendStatus = async (userId) => {
    if (!currentUser) return; // Ensure there's a logged-in user

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

  // Send a friend request (create a record in the 'friends' table)
  const handleAddFriend = async () => {
    if (!currentUser) return; // If no user is logged in, return

    try {
      const { data, error } = await supabase
        .from("friends")
        .insert([
          {
            user_id: currentUser.uid,
            friend_id: id,
            status: "pending", // Pending status until the other user accepts
          },
        ]);

      if (error) throw error;

      setRequestSent(true); // Set the request sent status to true
    } catch (error) {
      console.error("Failed to send friend request", error);
    }
  };

  // Remove a friend (delete the record from the 'friends' table)
  const handleUnfriend = async () => {
    if (!currentUser) return; // If no user is logged in, return

    try {
      const { data, error } = await supabase
        .from("friends")
        .delete()
        .match({
          user_id: currentUser.uid,
          friend_id: id,
        });

      if (error) throw error;

      setIsFriend(false); // Update the isFriend state
      setRequestSent(false); // Reset the requestSent state
    } catch (error) {
      console.error("Failed to unfriend", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

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

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            
            <div className="px-6 pb-6">
              <div className="relative -mt-16 mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                  <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                    {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile?.firstName} {profile?.lastName}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-blue-500" size={20} />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Age</p>
                        <p className="text-gray-900 font-medium">{profile?.age || "Not specified"}</p>
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
                      <User2 className="text-blue-500" size={20} />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Gender</p>
                        <p className="text-gray-900 font-medium">{profile?.gender || "Not specified"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Heart className="text-blue-500" size={20} />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Interests</p>
                        <p className="text-gray-900 font-medium">{profile?.interests || "Not specified"}</p>
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
        </div>
      </main>
    </div>
  );
}