import { Calendar, User2, MapPin, Heart, Grid } from "lucide-react";

export const ProfileData = ({ profile, formatValue }) => {
  const getIcon = (key) => {
    switch(key) {
      case "age": return <Calendar size={18} />;
      case "gender": return <User2 size={18} />;
      case "city": return <MapPin size={18} />;
      case "interests": return <Heart size={18} />;
      default: return <Grid size={18} />;
    }
  };

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {profile && Object.entries(profile).map(([key, value]) => {
        if (["user_id", "userName", "display_picture"].includes(key)) return null;
        
        return (
          <div key={key} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="text-blue-500">
                {getIcon(key)}
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
  );
};