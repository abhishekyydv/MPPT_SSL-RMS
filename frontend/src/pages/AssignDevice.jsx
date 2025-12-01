import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function AssignDevice() {
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);

  const [selected, setSelected] = useState({
    userId: "",
    deviceId: "",
  });

  const loadData = async () => {
    const u = await api.get("/users");
    const d = await api.get("/devices");
    setUsers(u.data);
    setDevices(d.data);
  };

  const handleAssign = async () => {
    await api.post("/devices/assign", selected);
    alert("Device assigned successfully");
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Assign Device</h1>

        <div className="bg-white p-5 shadow rounded space-y-4">

          <select
            className="w-full p-2 border rounded"
            onChange={(e) =>
              setSelected({ ...selected, userId: e.target.value })
            }
          >
            <option>Select User</option>
            {users.map((u) => (
              <option value={u._id} key={u._id}>
                {u.username} ({u.role})
              </option>
            ))}
          </select>

          <select
            className="w-full p-2 border rounded"
            onChange={(e) =>
              setSelected({ ...selected, deviceId: e.target.value })
            }
          >
            <option>Select Device</option>
            {devices.map((d) => (
              <option value={d._id} key={d._id}>
                {d.name || d.imei} – {d.imei}
              </option>
            ))}
          </select>

          <button
            onClick={handleAssign}
            className="bg-blue-600 text-white w-full p-2 rounded"
          >
            Assign
          </button>
        </div>
      </div>
    </>
  );
}
