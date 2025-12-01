import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // Not logged in
  if (!user) return <Navigate to="/" />;

  // Role-based restriction
  if (role && user.role !== role) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
