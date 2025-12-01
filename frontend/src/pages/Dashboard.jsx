import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import DeviceCard from "../components/DeviceCard";
import useAuth from "../hooks/useAuth";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL);

export default function Dashboard() {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [latest, setLatest] = useState({}); // { imei: latestData }

  const loadDevices = async () => {
    const res = await api.get("/devices"); 
    setDevices(res.data);
  };

  const loadLatest = async () => {
    const res = await api.get("/telemetry/latest");
    const mapping = {};
    res.data.forEach((d) => {
      mapping[d.imei] = d;
    });
    setLatest(mapping);
  };

  useEffect(() => {
    loadDevices();
    loadLatest();

    // Live Update
    socket.on("telemetry:update", (data) => {
      setLatest((prev) => ({
        ...prev,
        [data.imei]: data,
      }));
    });

    return () => socket.off("telemetry:update");
  }, []);

  return (
    <>
      <Navbar />

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-5">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {devices.map((d) => (
            <DeviceCard key={d._id} dev={d} latest={latest[d.imei]} />
          ))}
        </div>
      </div>
    </>
  );
}
