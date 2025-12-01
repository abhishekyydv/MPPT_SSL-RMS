import { useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function AddUser() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "user",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/users", form);
      alert("User created successfully");
      setForm({ username: "", password: "", role: "user" });
    } catch (err) {
      alert(err.response?.data?.msg || "Error");
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Add New User</h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md space-y-4"
        >
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 border rounded"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <select
            className="w-full p-2 border rounded"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="master">Master</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            Create User
          </button>
        </form>
      </div>
    </>
  );
}
