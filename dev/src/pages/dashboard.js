import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../lib/firebaseConfig";
import { supabase } from "../../lib/supabaseClient";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Camera, MapPin, Link as LinkIcon, Calendar, Edit2, LogOut, Grid, Mail, Phone } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        await fetchUserProfile(user.uid);
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

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleEditProfile = () => {
    router.push({
      pathname: "/forms",
      query: { profile: JSON.stringify(profile) }, // Pass profile data as a query parameter
    });
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Profile Header */}
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            
            <div className="px-6 pb-6">
              {/* Profile Image */}
              <div className="relative -mt-16 mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                  <img
                    src={user?.photoURL || "globe.svg"}
                   
                    className="w-full h-full object-cover"
                  />
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
                    {user?.displayName || user?.email}
                  </h2>
                  <p className="text-gray-500 text-sm">Member since {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "N/A"}</p>
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
                    case "email":
                      icon = <Mail size={18} />;
                      break;
                    case "phone":
                      icon = <Phone size={18} />;
                      break;
                    case "location":
                      icon = <MapPin size={18} />;
                      break;
                    case "website":
                      icon = <LinkIcon size={18} />;
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
                            {value || "Not specified"}
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