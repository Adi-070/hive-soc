import Link from "next/link";
import { LogOut } from "lucide-react";

export const Header = ({ onLogout }) => {
  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/home" passHref>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text cursor-pointer">
            Home
          </h1>
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors duration-200"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
};