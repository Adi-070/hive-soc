export const ErrorMessage = ({ message }) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-red-50 text-red-500 p-4 rounded-lg max-w-md text-center">
        <p>{message}</p>
      </div>
    </div>
  );