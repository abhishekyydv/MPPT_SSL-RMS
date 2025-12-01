import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import useAuth from "../hooks/useAuth";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL);

export default function DeviceDetails() {
  const { imei } = useParams();
  const { user } = useAuth();

  const [latest, setLatest] = useState(null);
  const [logs, setLogs] = useState([]);
  const [device, setDevice] = useState(null);

  // Fetch device info
  const fetchDeviceInfo = async () => {
    const res = await api.get(`/devices`);
    const found = res.data.find((d) => d.imei === imei);
    setDevice(found || null);
  };

  // Fetch latest telemetry for this device
  const fetchLatest = async () => {
    const res = await api.get(`/telemetry/logs/${imei}`);
    if (res.data.length > 0) {
      setLatest(res.data[0]); // latest log
      setLogs(res.data);
    }
  };

  useEffect(() => {
    fetchDeviceInfo();
    fetchLatest();

    // Socket Real-Time Update
    socket.on("telemetry:update", (data) => {
      if (data.imei === imei) {
        setLatest(data);
      }
    });

    return () => {
      socket.off("telemetry:update");
    };
  }, [imei]);

  const downloadExcel = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/telemetry/download/${imei}?token=${user.token}`;
  };

  if (!device) {
    return (
      <>
        <Navbar />
        <div className="p-6">Loading device details...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Device Details</h1>

        {/* Device Info */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">Device Info</h2>
          <p><strong>IMEI:</strong> {device.imei}</p>
          <p><strong>Name:</strong> {device.name}</p>
          <p><strong>Location:</strong> {device.location}</p>
          <p><strong>Pole ID:</strong> {device.poleId}</p>
          <p><strong>SIM Number:</strong> {device.simNumber}</p>
          <p><strong>Installer:</strong> {device.installer}</p>
          <p><strong>Assigned To:</strong> {device.assignedTo ? device.assignedTo.username : "Not Assigned"}</p>
        </div>

        {/* Latest Telemetry */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Latest Telemetry</h2>

          {latest ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 border rounded">
                <strong>Battery Voltage:</strong>
                <div>{latest.batteryVoltage || latest.battery} V</div>
              </div>

              <div className="p-3 border rounded">
                <strong>Solar Voltage:</strong>
                <div>{latest.solarVoltage || latest.solar} V</div>
              </div>

              <div className="p-3 border rounded">
                <strong>Load Voltage:</strong>
                <div>{latest.loadVoltage || latest.load} V</div>
              </div>

              <div className="p-3 border rounded">
                <strong>Current:</strong>
                <div>{latest.current} A</div>
              </div>

              <div className="p-3 border rounded">
                <strong>Efficiency:</strong>
                <div>{latest.efficiency || latest.eff}%</div>
              </div>

              <div className="p-3 border rounded">
                <strong>Timestamp:</strong>
                <div>{new Date(latest.timestamp || latest.time).toLocaleString()}</div>
              </div>
            </div>
          ) : (
            <p>No telemetry received yet.</p>
          )}
        </div>

        {/* Excel Download (MASTER ONLY) */}
        {user?.role === "master" && (
          <button
            onClick={downloadExcel}
            className="bg-green-600 text-white px-4 py-2 rounded mb-6"
          >
            Download Excel Logs
          </button>
        )}

        {/* FULL LOGS */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">All Logs</h2>

          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">Time</th>
                <th className="p-2 border">Battery</th>
                <th className="p-2 border">Solar</th>
                <th className="p-2 border">Load</th>
                <th className="p-2 border">Current</th>
                <th className="p-2 border">Efficiency</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td className="p-2 border">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-2 border">{log.batteryVoltage}</td>
                  <td className="p-2 border">{log.solarVoltage}</td>
                  <td className="p-2 border">{log.loadVoltage}</td>
                  <td className="p-2 border">{log.current}</td>
                  <td className="p-2 border">{log.efficiency}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}
