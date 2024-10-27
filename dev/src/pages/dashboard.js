// pages/dashboard.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../lib/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/login"); // Redirect to login if not authenticated
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleProfileEdit = () => {
    router.push("/forms");
  };

  const handleLogout = () => {
    signOut(auth);
    router.push("/login");
  };
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const storedProfile = JSON.parse(localStorage.getItem("userProfile"));
    setProfile(storedProfile);
  }, []);

  if (!profile) {
    return <p className="text-center mt-10">No data available. Please fill out the form.</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-200 to-purple-200">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-gray-800">
          Dashboard
        </h2>
        {user && (
          <div className="text-center">
            <p className="text-xl font-medium text-gray-700 mb-4">
              Welcome, {user.displayName || user.email}
            </p>
            <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <span className="font-semibold text-gray-600">First Name:</span>
            <span className="text-gray-800">{profile.firstName}</span>
          </div>

          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <span className="font-semibold text-gray-600">Last Name:</span>
            <span className="text-gray-800">{profile.lastName}</span>
          </div>

          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <span className="font-semibold text-gray-600">Gender:</span>
            <span className="text-gray-800">{profile.gender}</span>
          </div>

          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <span className="font-semibold text-gray-600">Age:</span>
            <span className="text-gray-800">{profile.age}</span>
          </div>

          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <span className="font-semibold text-gray-600">City:</span>
            <span className="text-gray-800">{profile.city}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-600">Interests:</span>
            <span className="text-gray-800">{profile.interests}</span>
          </div>
        </div>
            <button
              onClick={handleProfileEdit}
              className="w-full py-2 mt-4 text-white bg-blue-500 hover:bg-blue-600 transition rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2 mt-4 text-white bg-blue-500 hover:bg-blue-600 transition rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
