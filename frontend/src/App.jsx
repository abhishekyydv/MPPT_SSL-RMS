import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddDevice from "./pages/AddDevice";
import DeviceDetails from "./pages/DeviceDetails";
import AddUser from "./pages/AddUser";          // NEW
import UsersList from "./pages/UsersList";      // NEW
import PrivateRoute from "./components/PrivateRoute";
import AuthProvider from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Route */}
          <Route path="/" element={<Login />} />

          {/* Dashboard – MASTER + USER both allowed */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Add Device – MASTER ONLY */}
          <Route
            path="/add-device"
            element={
              <PrivateRoute role="master">
                <AddDevice />
              </PrivateRoute>
            }
          />

          {/* Add User – MASTER ONLY */}
          <Route
            path="/add-user"
            element={
              <PrivateRoute role="master">
                <AddUser />
              </PrivateRoute>
            }
          />

          {/* Users List – MASTER ONLY */}
          <Route
            path="/users"
            element={
              <PrivateRoute role="master">
                <UsersList />
              </PrivateRoute>
            }
          />

          {/* Device Details – USER sees only assigned, MASTER sees all */}
          <Route
            path="/device/:imei"
            element={
              <PrivateRoute>
                <DeviceDetails />
              </PrivateRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
