export default function DeviceCard({ dev, live }) {
  const online =
    live &&
    Date.now() - new Date(live.time || live.timestamp).getTime() < 60 * 1000;

  return (
    <div className="border rounded shadow p-4 bg-white hover:shadow-lg">
      <h2 className="text-lg font-bold">IMEI: {dev.imei}</h2>
      <p>Name: {dev.name}</p>
      <p>Location: {dev.location}</p>

      <div className="mt-2">
        {live ? (
          <>
            <p>🔋 Battery: {live.battery} V</p>
            <p>☀ Solar: {live.solar} V</p>
            <p>💡 Load: {live.load} V</p>
            <p>⚡ Current: {live.current} A</p>
          </>
        ) : (
          <p className="text-gray-500">No telemetry yet</p>
        )}
      </div>

      <p className="text-sm text-gray-500 mt-2">
        Last Update:{" "}
        {live ? new Date(live.time || live.timestamp).toLocaleString() : "N/A"}
      </p>

      <p
        className={`mt-2 font-semibold ${
          online ? "text-green-600" : "text-red-600"
        }`}
      >
        {online ? "● Online" : "● Offline"}
      </p>
    </div>
  );
}
