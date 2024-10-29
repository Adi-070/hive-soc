import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../lib/firebaseConfig"; // Firebase auth for session management
import { supabase } from "../../lib/supabaseClient"; // Supabase client
import { signOut } from "firebase/auth";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state to manage display
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Listen for Firebase authentication state changes
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user); // Set the authenticated user
        await fetchUserProfile(user.uid); // Fetch profile for the authenticated user
      } else {
        router.push("/login"); // Redirect to login if not authenticated
      }
      setLoading(false); // Set loading to false once authentication check completes
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch the user's profile from Supabase based on the authenticated user ID
  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true); // Set loading state before fetching profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error; // Throw error if there's an issue fetching the data
      setProfile(data); // Set profile data
    } catch (err) {
      setError("Failed to load profile data. Please try again.");
    } finally {
      setLoading(false); // Reset loading state after fetching profile
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleEditProfile = () => {
    router.push("/forms"); // Navigate to the /forms endpoint
  };

  // Show loading screen if loading or no profile data yet
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Loading profile data...</p>
      </div>
    );
  }

  // Show error message if profile data failed to load
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-green-200 to-blue-200">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg border border-gray-200">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">Dashboard</h2>

        {user && (
          <>
            <p className="text-gray-700 font-semibold text-center">
              Welcome, {user.displayName || user.email}
            </p>

            <div className="space-y-4 mt-6">
              {profile ? (
                Object.entries(profile).map(([key, value]) => (
                  key !== "user_id" && (
                    <div key={key} className="flex justify-between text-gray-700 font-medium">
                      <span>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                      <span>{value}</span>
                    </div>
                  )
                ))
              ) : (
                <p className="text-gray-500">No profile data available.</p>
              )}
            </div>

            <button
              onClick={handleEditProfile}
              className="w-full mt-4 bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
            >
              Edit Profile
            </button>

            <button
              onClick={handleLogout}
              className="w-full mt-4 bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-300"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
