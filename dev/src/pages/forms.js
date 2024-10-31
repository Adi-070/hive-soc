import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient"; // Import Supabase client
import { auth } from "../../lib/firebaseConfig"; // Import Firebase auth for user ID

export default function Form() {
  const router = useRouter();
  const { profile } = router.query;
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    age: "",
    city: "",
    interests: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.uid)
          .single();

        if (data) {
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            gender: data.gender || "",
            age: data.age || "",
            city: data.city || "",
            interests: data.interests || "",
          });
        } else if (error) {
          setError("Failed to load profile data.");
        }
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Attempt to fetch the existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.uid)
        .single();

      // Ignore the specific error indicating no rows were returned
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError; // Only throw if it's an unexpected error
      }

      if (existingProfile) {
        // Profile exists, so we update it
        const { error: updateError } = await supabase
          .from("profiles")
          .update(formData)
          .eq("user_id", user.uid);

        if (updateError) throw updateError;
      } else {
        // No existing profile, insert a new one
        const { error: insertError } = await supabase
          .from("profiles")
          .insert([{ ...formData, user_id: user.uid }]);

        if (insertError) throw insertError;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message); // Set the error message to display
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-200 to-purple-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-lg p-8 w-full max-w-lg border border-gray-200"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">Profile Form</h2>

        <div className="space-y-4 text-black">
          {Object.keys(formData).map((field) => {
            if (field === "gender") {
              return (
                <div key={field}>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Gender
                  </label>
                  <select
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              );
            }

            return (
              <div key={field}>
                <label className="block text-gray-700 font-semibold mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === "age" ? "number" : "text"}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
            );
          })}
        </div>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        <button
          type="submit"
          className="w-full mt-6 bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
