import { useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function AddDevice() {
  const [form, setForm] = useState({
    imei: "",
    name: "",
    location: "",
    poleId: "",
    simNumber: "",
    installer: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/devices", form);
      alert("Device added");
      setForm({
        imei: "",
        name: "",
        location: "",
        poleId: "",
        simNumber: "",
        installer: "",
      });
    } catch (err) {
      alert(err.response?.data?.msg || "Error");
    }
  };

  return (
    <>
      <Navbar />

      <div className="max-w-xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Add New Device</h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 shadow rounded space-y-4"
        >
          {[
            "imei",
            "name",
            "location",
            "poleId",
            "simNumber",
            "installer",
          ].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.toUpperCase()}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full p-2 border rounded"
            />
          ))}

          <button className="bg-blue-600 w-full p-2 text-white rounded">
            Add Device
          </button>
        </form>
      </div>
    </>
  );
}
