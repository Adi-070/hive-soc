import { useState } from "react";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, provider } from "../../lib/firebaseConfig";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient"; // Import Supabase client
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react"; // Import Lucide icons

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [error, setError] = useState(null);
  const router = useRouter();

  const checkUserProfile = async (userId) => {
    try {
      // Fetch user profile from Supabase
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data; // Return true if profile exists, otherwise false
    } catch (err) {
      console.error("Error checking user profile:", err);
      return false;
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const profileExists = await checkUserProfile(user.uid);
      router.push(profileExists ? "/dashboard" : "/forms"); // Redirect accordingly
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailPasswordSignIn = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      const profileExists = await checkUserProfile(user.uid);
      router.push(profileExists ? "/dashboard" : "/forms"); // Redirect accordingly
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-semibold text-center text-gray-800">Login</h2>
        <form onSubmit={handleEmailPasswordSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"} // Toggle input type
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center"
              style={{ top: '70%', transform: 'translateY(-50%)' }}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-600" />
              ) : (
                <Eye className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-2 mt-4 text-white bg-blue-500 hover:bg-blue-600 transition rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign in with Email
          </button>
        </form>
        <div className="flex items-center justify-center my-4">
          <span className="text-sm text-gray-500">or</span>
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-white bg-red-400 hover:bg-red-600 transition rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
          <span>Sign in with Google</span>
        </button>
        {error && (
          <p className="mt-2 text-center text-sm text-red-500">
            {error}
          </p>
        )}
        <p className="text-sm text-center text-gray-600 mt-4">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
