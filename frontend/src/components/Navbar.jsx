import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="flex justify-between items-center px-6 py-3 bg-blue-700 text-white">
      <h1 className="text-xl font-bold">MPPT Solar RMS</h1>
      <div className="flex items-center gap-4">
        <span>{user?.username?.toUpperCase()}</span>
        <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">
          Logout
        </button>
      </div>
    </div>
  );
}
