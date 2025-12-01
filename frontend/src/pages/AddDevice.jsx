import { useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function AddDevice() {
  const [imei, setIMEI] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/devices", { imei, name, location });
      setMsg("Device Added Successfully!");
    } catch {
      setMsg("Error adding device");
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
        <h2 className="text-xl font-bold mb-4">Add Device</h2>

        {msg && <p className="text-green-600">{msg}</p>}

        <form onSubmit={handleSubmit}>
          <input
            placeholder="IMEI"
            className="w-full border p-2 mb-3"
            onChange={(e) => setIMEI(e.target.value)}
          />

          <input
            placeholder="Device Name"
            className="w-full border p-2 mb-3"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Location"
            className="w-full border p-2 mb-3"
            onChange={(e) => setLocation(e.target.value)}
          />

          <button className="bg-blue-600 text-white w-full py-2 rounded">
            Add Device
          </button>
        </form>
      </div>
    </>
  );
}
