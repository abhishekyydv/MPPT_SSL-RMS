import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* LEFT MENU */}
        <div className="flex items-center space-x-6">

          <Link
            to="/dashboard"
            className="hover:text-yellow-400 transition"
          >
            Dashboard
          </Link>

          {/* MASTER ONLY OPTIONS */}
          {user?.role === "master" && (
            <>
              <Link
                to="/add-device"
                className="hover:text-yellow-400 transition"
              >
                Add Device
              </Link>

              <Link
                to="/assign-device"
                className="hover:text-yellow-400 transition"
              >
                Assign Device
              </Link>

              <Link
                to="/add-user"
                className="hover:text-yellow-400 transition"
              >
                Add User
              </Link>

              <Link
                to="/users"
                className="hover:text-yellow-400 transition"
              >
                Users
              </Link>
            </>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center space-x-4">
          {user && (
            <span className="text-sm opacity-80">
              {user.username} ({user.role})
            </span>
          )}

          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
