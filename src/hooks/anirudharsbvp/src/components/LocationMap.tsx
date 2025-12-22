import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";
interface LocationMapProps {
  onLocationUpdate?: (coords: {
    latitude: number;
    longitude: number;
  }) => void;
}
const LocationMap = ({
  onLocationUpdate
}: LocationMapProps) => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [address, setAddress] = useState<string>("Getting location...");
  const [mapUrl, setMapUrl] = useState<string>("");
  useEffect(() => {
    // Get user's current location
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition(position => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(coords);
        if (onLocationUpdate) {
          onLocationUpdate(coords);
        }

        // Create Google Maps static image URL
        // Note: In production, you should use Google Maps JavaScript API with an API key
        const googleMapsUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coords.latitude},${coords.longitude}&zoom=15&size=600x300&markers=color:red%7C${coords.latitude},${coords.longitude}&key=YOUR_API_KEY`;

        // For now, use OpenStreetMap as fallback (no API key required)
        const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude - 0.01},${coords.latitude - 0.01},${coords.longitude + 0.01},${coords.latitude + 0.01}&layer=mapnik&marker=${coords.latitude},${coords.longitude}`;
        setMapUrl(osmUrl);

        // Reverse geocode to get address
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`).then(res => res.json()).then(data => {
          setAddress(data.display_name || "Address not found");
        }).catch(() => {
          setAddress(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
        });
      }, error => {
        console.error("Geolocation error:", error);
        toast.error("Unable to access location. Please enable location services.");
        setAddress("Location unavailable");
      }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    } else {
      toast.error("Geolocation is not supported by your browser");
      setAddress("Geolocation not supported");
    }
  }, [onLocationUpdate]);
  return <Card className="overflow-hidden border-2">
      <div className="p-4 border-b bg-zinc-800">
        <div className="flex items-center justify-between bg-zinc-800">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg text-gray-50">Live Location</h3>
          </div>
          {location && <Badge variant="secondary" className="gap-1">
              <Navigation className="h-3 w-3" />
              Tracking
            </Badge>}
        </div>
      </div>
      <div className="relative h-64 bg-muted">
        {mapUrl ? <iframe src={mapUrl} className="w-full h-full border-0" title="Location Map" loading="lazy" /> : <div className="flex items-center justify-center h-full bg-zinc-500">
            <div className="text-center space-y-2">
              <Navigation className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
              <p className="text-sm text-muted-foreground">Getting your location...</p>
            </div>
          </div>}
      </div>
      <div className="p-4 border-t bg-zinc-800">
        <div className="text-xs text-muted-foreground mb-1">Current Address</div>
        <div className="text-sm font-medium">{address}</div>
        {location && <div className="text-xs text-muted-foreground mt-2">
            Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </div>}
      </div>
    </Card>;
};
export default LocationMap;