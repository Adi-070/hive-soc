import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import { auth } from "../../lib/firebaseConfig";

export default function Form() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    age: "",
    city: "",
    interests: [],
  });
  const [interestInput, setInterestInput] = useState("");
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
            interests: data.interests || [],
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

  const handleInterestChange = (e) => {
    setInterestInput(e.target.value);
  };

  const addInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData((prevData) => ({
        ...prevData,
        interests: [...prevData.interests, interestInput.trim()],
      }));
      setInterestInput("");
    }
  };

  const removeInterest = (interest) => {
    setFormData((prevData) => ({
      ...prevData,
      interests: prevData.interests.filter((item) => item !== interest),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.uid)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (existingProfile) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ ...formData, interests: formData.interests })
          .eq("user_id", user.uid);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert([{ ...formData, user_id: user.uid }]);

        if (insertError) throw insertError;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-200 to-purple-200 text-black">
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
                  <label className="block text-gray-700 font-semibold mb-1">Gender</label>
                  <select
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
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

            if (field === "interests") {
              return (
                <div key={field}>
                  <label className="block text-gray-700 font-semibold mb-1">Interests</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={interestInput}
                      onChange={handleInterestChange}
                      className="flex-grow p-3 border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={addInterest}
                      className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap">
                    {formData.interests.map((interest) => (
                      <span
                        key={interest}
                        className="mr-2 mb-2 px-3 py-1 bg-gray-200 rounded-full cursor-pointer"
                        onClick={() => removeInterest(interest)}
                      >
                        {interest} &times;
                      </span>
                    ))}
                  </div>
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
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
            );
          })}
        </div>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        <button
          type="submit"
          className="w-full mt-6 bg-blue-500 text-white font-bold py-3 rounded-lg"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
