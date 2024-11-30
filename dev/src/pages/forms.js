import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import { auth } from "../../lib/firebaseConfig";
import { User2, MapPin, Calendar, Tag, X, Plus, Navigation } from "lucide-react";

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

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Dropdown data
  // const [countries, setCountries] = useState([]);
  // const [states, setStates] = useState([]);
  // const [cities, setCities] = useState([]);

  // // Loading states
  // const [isCountryLoading, setIsCountryLoading] = useState(false);
  // const [isStateLoading, setIsStateLoading] = useState(false);
  // const [isCityLoading, setIsCityLoading] = useState(false);

  // // Authorization token for Universal Tutorial API
  // const authToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJfZW1haWwiOiJhZGl0eWFtaXNocmF3b3JraW5nLjc1QGdtYWlsLmNvbSIsImFwaV90b2tlbiI6IjBVMm5OaEljNlNDQkphVjhPSndtOHlzZ3o1TUp0RlFJVVk4cW9oSV83ZV9LT3Y1UlhyV3ZSQnJSN21lUGw0WGdHZncifSwiZXhwIjoxNzMyMTE5Nzg1fQ.fvF0lsFg8JoNkR8N4DJhuH_L1d6fXgE2tZoe1rfduzY";
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
        
        } else if (error) {
          setError("Failed to load profile data.");
        }
      }
    };

    loadProfile();
  }, []);

  const detectLocation = () => {
    setIsDetectingLocation(true);
    setLocationError(null);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Use OpenCage Geocoding API to get detailed location information
            const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=08e98005a9ca4ec3b99369f7b3245f7f`);
            
            if (response.data.results && response.data.results.length > 0) {
              const locationComponents = response.data.results[0].components;
              
              setFormData(prevData => ({
                ...prevData,
                country: locationComponents.country || "",
                state: locationComponents.state || locationComponents.province || "",
                city: locationComponents.city || locationComponents.town || locationComponents.village || ""
              }));
            }
          } catch (err) {
            setLocationError("Failed to retrieve location details. Please try again.");
            console.error("Geolocation error:", err);
          } finally {
            setIsDetectingLocation(false);
          }
        },
        (error) => {
          setIsDetectingLocation(false);
          switch(error.code) {
            case error.PERMISSION_DENIED:
              setLocationError("Location detection denied. Please manually enter your location.");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              setLocationError("Location request timed out.");
              break;
            default:
              setLocationError("An unknown error occurred.");
          }
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setIsDetectingLocation(false);
    }
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

          <div className="md:col-span-2">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={detectLocation}
                disabled={isDetectingLocation}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-200"
              >
                <Navigation className="mr-2" size={20} />
                {isDetectingLocation ? "Detecting..." : "Detect My Location"}
              </button>
              {locationError && (
                <p className="text-sm text-red-600">{locationError}</p>
              )}
            </div>
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
        
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Country Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg"
                required
              />
            </div>

            {/* State Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg"
                required
              />
            </div>

            {/* City Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg"
                required
              />
            </div>
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