import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";


export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { username, role, id, token }
  const [loading, setLoading] = useState(true);

  // Auto-login / restore user from token
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        setUser({
          username: decoded.username,
          role: decoded.role,
          id: decoded.id,
          token: token,
        });
      } catch (err) {
        console.log("Invalid token, clearing...");
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  // Login function – called when API returns token
  const login = (token, role, username, id) => {
    localStorage.setItem("token", token);

    setUser({
      username,
      role,
      id,
      token,
    });
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
