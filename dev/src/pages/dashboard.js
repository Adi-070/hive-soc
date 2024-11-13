import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../lib/firebaseConfig";
import { supabase } from "../../lib/supabaseClient";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Camera, MapPin, Link as LinkIcon, Calendar, Edit2, LogOut, Grid, User2, Mail, Phone, Heart, Bell, Users } from 'lucide-react';

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
      // Fetch both cases where user is either user_id or friend_id
      const { data, error } = await supabase
        .from("friends")
        .select(`
          *,
          user_profile:profiles!friends_user_id_fkey (
            firstName,
            lastName,
            user_id,
            city,
            interests
          ),
          friend_profile:profiles!friends_friend_id_fkey (
            firstName,
            lastName,
            user_id,
            city,
            interests
          )
        `)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');
  
      if (error) throw error;
  
      // Process the friends data to get unique friends
      const processedFriends = data.map(friendship => {
        // If the current user is user_id, then get the friend's profile from friend_id
        // If the current user is friend_id, then get the friend's profile from user_id
        const friendProfile = friendship.user_id === userId 
          ? friendship.friend_profile 
          : friendship.user_profile;
  
        return {
          ...friendProfile,
          friendshipId: friendship.id
        };
      });
  
      // Remove duplicates based on user_id
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
            firstName,
            lastName,
            user_id
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
      return value.join(", "); // Join array elements with comma and space
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

      // Refresh friend requests and friends list
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

  const FriendRequestsSection = () => {
    if (friendRequests.length === 0) return null;

    return (
      <div className="mt-8 text-black">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold">Friend Requests</h3>
            <span className="bg-blue-100 text-blue-600 text-sm font-medium px-2 py-1 rounded-full">
              {friendRequests.length}
            </span>
          </div>
          <div className="space-y-4">
            {friendRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">
                    {request.profiles.firstName} {request.profiles.lastName}
                  </p>
                  <p className="text-sm text-gray-500">Wants to connect with you</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFriendRequest(request.id, "accepted")}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleFriendRequest(request.id, "rejected")}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const FriendsSection = () => {
    if (friends.length === 0) {
      return (
        <div className="mt-8 text-black">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-blue-500" size={20} />
              <h3 className="text-lg font-semibold">Friends</h3>
            </div>
            <p className="text-gray-500 text-center py-4">You haven&apos;t connected with any friends yet.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-8 text-black">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold">Friends</h3>
            <span className="bg-blue-100 text-blue-600 text-sm font-medium px-2 py-1 rounded-full">
              {friends.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map((friend) => (
              <Link href={`/profile/${friend.user_id}`} key={friend.user_id}>
                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
                      {friend.firstName?.[0]}{friend.lastName?.[0]}
                    </div>
                    <div>
                  <p className="font-medium">
                    {friend.firstName} {friend.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {friend.city || "No location"} •{" "}
                    {Array.isArray(friend.interests) && friend.interests.length > 0
                    ? friend.interests.join(", ")
                    : "Not specified"}{/* Fallback if interests is empty or not specified */}
                  </p>
                </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg max-w-md text-center">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
          <Link href="/home" passHref>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text cursor-pointer">
              Home
            </h1>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors duration-200"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Friend Requests Section */}
          <FriendRequestsSection />

          {/* Friends Section */}
          <FriendsSection />

          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Profile Header */}
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            
            <div className="px-6 pb-6">
              {/* Profile Image */}
              <div className="relative -mt-16 mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                  <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                    {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                  </div>
                </div>
                <button 
                  onClick={handleEditProfile}
                  className="absolute bottom-2 right-2 bg-blue-500 p-2 rounded-full text-white hover:bg-blue-600 shadow-lg transition-colors duration-200"
                >
                  <Camera size={16} />
                </button>
              </div>

              {/* Profile Info */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile?.firstName} {profile?.lastName}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Member since {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <button
                  onClick={handleEditProfile}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              </div>

              {/* Profile Data */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile && Object.entries(profile).map(([key, value]) => {
                  if (key === "user_id") return null;
                  
                  let icon;
                  switch(key) {
                    case "age":
                      icon = <Calendar size={18} />;
                      break;
                    case "gender":
                      icon = <User2 size={18} />;
                      break;
                    case "city":
                      icon = <MapPin size={18} />;
                      break;
                    case "interests":
                      icon = <Heart size={18} />;
                      break;
                    default:
                      icon = <Grid size={18} />;
                  }

                 return (
          <div key={key} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="text-blue-500">
                {icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </p>
                <p className="text-gray-900 font-medium">
                  {formatValue(value)}
                </p>
              </div>
            </div>
          </div>
        );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}