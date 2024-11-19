export const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    </div>
  );