import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import { auth } from "../../lib/firebaseConfig";
import { User2, MapPin, Calendar, Tag, X, Plus } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const validateImageFile = (file) => {
  if (!file) return 'No file selected';
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload a JPEG, PNG, or GIF';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File size too large. Maximum size is 5MB';
  }
  return null;
};

export default function Form() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userName:"",
    firstName: "",
    lastName: "",
    gender: "",
    age: "",
    country: "",
    state: "",
    city: "",
    interests: [],
    display_picture: ""
  });
  const [interestInput, setInterestInput] = useState("");
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Loading states
  const [isCountryLoading, setIsCountryLoading] = useState(false);
  const [isStateLoading, setIsStateLoading] = useState(false);
  const [isCityLoading, setIsCityLoading] = useState(false);

  // Authorization token for Universal Tutorial API
  const authToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJfZW1haWwiOiJtaXNocmFzYW50b3NoMDgxQGdtYWlsLmNvbSIsImFwaV90b2tlbiI6IkdhZXliRnp4VU1uVHJXZHVNanlIYnhTcThGRUZZVTc5LVFKNzNnZ0pRbmVKYzkydkhNREdKUlZoR3RyakJvVWoxWFkifSwiZXhwIjoxNzMxODY0MTI0fQ.qPVwns38RMuiyIbcD-sDnPfVVKzK4usIKHoGVekqvAg";
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
            userName:data.userName || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            gender: data.gender || "",
            age: data.age || "",
            city: data.city || "",
            country: data.country || "",
            state: data.state || "",
            interests: data.interests || [],
            display_picture: data.display_picture || "",
          });
          if (data.country) await fetchStates(data.country);
          if (data.state) await fetchCities(data.state);
        } else if (error) {
          setError("Failed to load profile data.");
        }
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    // Fetch countries when the component mounts
    const fetchCountries = async () => {
      setIsCountryLoading(true);
      try {
        const response = await axios.get(
          "https://www.universal-tutorial.com/api/countries/",
          {
            headers: {
              Authorization: authToken,
              Accept: "application/json",
            },
          }
        );
        setCountries(response.data);
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setIsCountryLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const fetchStates = async (country) => {
    setIsStateLoading(true);
    try {
      const response = await axios.get(
        `https://www.universal-tutorial.com/api/states/${country}`,
        {
          headers: {
            Authorization: authToken,
            Accept: "application/json",
          },
        }
      );
      setStates(response.data);
    } catch (error) {
      console.error("Error fetching states:", error);
    } finally {
      setIsStateLoading(false);
    }
  };

  const fetchCities = async (state) => {
    setIsCityLoading(true);
    try {
      const response = await axios.get(
        `https://www.universal-tutorial.com/api/cities/${state}`,
        {
          headers: {
            Authorization: authToken,
            Accept: "application/json",
          },
        }
      );
      setCities(response.data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setIsCityLoading(false);
    }
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setFormData((prevData) => ({ ...prevData, country, state: "", city: "" }));
    setStates([]);
    setCities([]);
    if (country) fetchStates(country);
  };

  const handleStateChange = (e) => {
    const state = e.target.value;
    setFormData((prevData) => ({ ...prevData, state, city: "" }));
    setCities([]);
    if (state) fetchCities(state);
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setFormData((prevData) => ({ ...prevData, city }));
  };

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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInterest();
    }
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const uploadImage = async (file) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
  
    const validationError = validateImageFile(file);
    if (validationError) throw new Error(validationError);
  
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.uid}-${Date.now()}.${fileExt}`;
  
      // Delete old profile picture if it exists
      const oldImageUrl = formData.display_picture;
      if (oldImageUrl) {
        const oldFileName = oldImageUrl.split('/').pop();
        await supabase.storage
          .from('profile-pictures')
          .remove([oldFileName]);
      }
  
      // Upload new image
      const { data, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
  
      if (uploadError) throw uploadError;
  
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);
  
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
  
      let displayPictureUrl = formData.display_picture;
  
      // Upload image if a new file is selected
      if (imageFile) {
        displayPictureUrl = await uploadImage(imageFile);
      }
  
      const updatedData = {
        ...formData,
        display_picture: displayPictureUrl,
        // updated_at: new Date().toISOString()
      };
  
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.uid)
        .single();
  
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
  
      if (existingProfile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updatedData)  // Fixed: Remove the extra object wrapper
          .eq('user_id', user.uid);
  
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ ...updatedData, user_id: user.uid }]);
  
        if (insertError) throw insertError;
      }
  
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-2xl rounded-2xl p-8 space-y-8 border border-gray-100"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Complete Your Profile</h2>
            <p className="mt-2 text-gray-600">Tell us more about yourself</p>
          </div>

         

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700">User Name</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                  required
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
                </select>
                <User2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <div className="relative">
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
        
            <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleCountryChange}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg"
              required
            >
              <option value="" disabled>Select Country</option>
              {countries.map((country) => (
                <option key={country.country_name} value={country.country_name}>
                  {country.country_name}
                </option>
              ))}
            </select>
            {isCountryLoading && <p>Loading countries...</p>}
          </div>

          {/* State Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleStateChange}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg"
              required
            >
              <option value="" disabled>Select State</option>
              {states.map((state) => (
                <option key={state.state_name} value={state.state_name}>
                  {state.state_name}
                </option>
              ))}
            </select>
            {isStateLoading && <p>Loading states...</p>}
          </div>

          {/* City Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleCityChange}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg"
              required
            >
              <option value="" disabled>Select City</option>
              {cities.map((city) => (
                <option key={city.city_name} value={city.city_name}>
                  {city.city_name}
                </option>
              ))}
            </select>
            {isCityLoading && <p>Loading cities...</p>}
          </div>

          <div>
  <label className="block text-sm font-medium text-gray-700">Upload Display Picture</label>
  <input
    type="file"
    accept="image/*"
    onChange={handleImageChange}
    className="mt-1 block w-full"
  />
  {imageFile && (
    <p className="mt-2 text-sm text-gray-500">
      Selected file: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)}MB)
    </p>
  )}
  {formData.display_picture && (
    <div className="mt-4 relative">
      <img
        src={formData.display_picture}
        alt="Display Picture"
        className="w-32 h-32 rounded-full object-cover"
      />
      <p className="mt-2 text-xs text-gray-500">Current profile picture</p>
    </div>
  )}
</div>



            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Interests</label>
              <div className="relative mt-1 flex">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={handleInterestChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Add your interests..."
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
                <button
                  type="button"
                  onClick={addInterest}
                  className="ml-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-1.5 hover:text-blue-900 focus:outline-none"
                    >
                      <X size={16} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}