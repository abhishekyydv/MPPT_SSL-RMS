import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import DeviceCard from "../components/DeviceCard";
import { io } from "socket.io-client";

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [latestData, setLatestData] = useState({}); // IMEI → latest telemetry map

  // ⬅️ 1. Fetch all devices
  const fetchDevices = async () => {
    try {
      const res = await api.get("/devices");
      setDevices(res.data);
    } catch (err) {
      console.error("Error fetching devices:", err);
    }
  };

  // ⬅️ 2. Fetch latest telemetry for all devices
  const fetchLatestTelemetry = async () => {
    try {
      const res = await api.get("/telemetry/latest"); // you'll add this API next
      const map = {};
      res.data.forEach((item) => {
        map[item.imei] = item;
      });
      setLatestData(map);
    } catch (err) {
      console.error("Error fetching latest telemetry:", err);
    }
  };

  // ⬅️ 3. Setup socket listeners
  useEffect(() => {
    const socket = io("http://localhost:4001");

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("telemetry:update", (data) => {
      console.log("LIVE UPDATE RECEIVED:", data);

      setLatestData((prev) => ({
        ...prev,
        [data.imei]: {
          ...data,
          timestamp: new Date(),
        },
      }));
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    fetchDevices();
    fetchLatestTelemetry();
  }, []);

  return (
    <>
      <Navbar />

      <div className="p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-4">All Devices</h1>

          <button
            onClick={() => {
              fetchDevices();
              fetchLatestTelemetry();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {devices.length === 0 ? (
          <p className="text-gray-600">No devices found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {devices.map((dev) => (
              <DeviceCard
                key={dev._id}
                dev={dev}
                live={latestData[dev.imei]} // pass live telemetry
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
