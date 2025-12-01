import { Link } from "react-router-dom";

export default function DeviceCard({ dev, latest }) {
  return (
    <Link to={`/device/${dev.imei}`}>
      <div className="border rounded shadow p-4 bg-white hover:shadow-lg transition cursor-pointer">
        <h2 className="text-xl font-bold mb-2">{dev.name || "Unnamed Device"}</h2>
        <p><strong>IMEI:</strong> {dev.imei}</p>
        <p><strong>Location:</strong> {dev.location || "-"}</p>

        {latest ? (
          <div className="mt-3 bg-gray-100 p-3 rounded">
            <p><strong>Battery:</strong> {latest.batteryVoltage || latest.battery} V</p>
            <p><strong>Solar:</strong> {latest.solarVoltage || latest.solar} V</p>
            <p><strong>Load:</strong> {latest.loadVoltage || latest.load} V</p>
            <p><strong>Current:</strong> {latest.current} A</p>
          </div>
        ) : (
          <div className="mt-3 text-gray-500 text-sm">No data received yet</div>
        )}
      </div>
    </Link>
  );
}
