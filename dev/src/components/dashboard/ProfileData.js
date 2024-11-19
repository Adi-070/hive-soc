export const ProfileData = ({ profile, formatValue }) => {
    const groupedFields = Object.entries(profile).filter(
      ([key]) =>
        !["user_id", "userName", "display_picture", "firstName", "lastName"].includes(key)
    );
  
    return (
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Account Settings</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupedFields.map(([key, value]) => (
              <div key={key} className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-700 capitalize"
                  htmlFor={key}
                >
                  {key.replace(/_/g, " ")}
                </label>
                
                <input
                  id={key}
                  value={formatValue(value)}
                  readOnly
                  className="w-full px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-200 
                            rounded-lg transition-all duration-200 ease-in-out
                            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                            hover:bg-gray-50/80 hover:border-gray-300
                            placeholder:text-gray-400 text-sm"
                />
                
                <p className="text-xs text-gray-500">
                  {key === 'email' && 'Your primary email address'}
                  {key === 'phone' && 'Your contact number'}
                  {key === 'address' && 'Your current address'}
                </p>
              </div>
            ))}
          </div>
        </div>
        
       
      </div>
    );
  };
  
  export default ProfileData;