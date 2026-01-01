import NearestHospital from "@/components/NearestHospital";
import HospitalMap from "@/components/HospitalMap";
import { useLocation } from "@/hooks/useLocation";
import { useNearestHospital } from "@/hooks/useNearestHospital";

const Hospitals = () => {
  const { location, isLoading } = useLocation();
  const { hospitals, loading } = useNearestHospital(location);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-semibold neon-glow gradient-text">Nearby Hospitals</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass p-0 rounded-md overflow-hidden">
          <NearestHospital location={location} />
        </div>
        <div className="card-glass p-0 rounded-md overflow-hidden">
          <HospitalMap
            hospitals={hospitals.map((h, idx) => ({
              id: h.id ?? `${idx}`,
              name: h.name,
              address: h.address || "",
              phone: h.phone || "",
              latitude: h.lat,
              longitude: h.lon,
              distance_km: Number(((h.distanceMeters || 0) / 1000).toFixed(2)),
            }))}
            userLocation={location}
            isLoading={isLoading || loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Hospitals;
