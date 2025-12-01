import { useState } from "react";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username, password });

      // backend response → { token, role }
      login(
        res.data.token,
        res.data.role,
        username,
        res.data.id || null // optional (if backend adds id later)
      );

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid username or password.");
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 w-96 shadow-xl rounded-xl border"
      >
        <h2 className="text-3xl font-bold mb-5 text-center text-gray-700">
          Login
        </h2>

        {error && (
          <p className="text-red-600 mb-4 text-center font-semibold">
            {error}
          </p>
        )}

        <input
          required
          className="w-full p-3 border rounded mb-4 focus:ring focus:ring-blue-300"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          required
          type="password"
          className="w-full p-3 border rounded mb-5 focus:ring focus:ring-blue-300"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className={`w-full text-white py-2 rounded-lg font-semibold transition
            ${loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}
          `}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
