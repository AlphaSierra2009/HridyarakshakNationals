import { useState } from "react";
import { Activity, Heart, MapPin, Usb } from "lucide-react";
import { Button } from "@/components/ui/button";
import ECGMonitor from "@/components/ECGMonitor";
import LocationMap from "@/components/LocationMap";
import AlertConfigPanel from "@/components/AlertConfigPanel";
import AlertHistory from "@/components/AlertHistory";
import SavedContacts from "@/components/SavedContacts";
import NearestHospital from "@/components/NearestHospital";
import WeatherWidget from "@/components/WeatherWidget";
import { useSerialConnection } from "@/hooks/useSerialConnection";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

<<<<<<< Updated upstream

const Index = () => {
  const { username, setUsername, clearUsername } = useUser();
=======
export default function Index() {
  const { user, logout } = useAuth();
>>>>>>> Stashed changes
  const { theme, toggleTheme } = useTheme();
  const { isConnected, connectArduino, disconnectArduino } = useSerialConnection();

  const [ecgBuffer, setEcgBuffer] = useState<number[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleLocationUpdate = (coords: { latitude: number; longitude: number }) => {
    setLocation(coords);
  };

  const handleBufferUpdate = (buffer: number[]) => {
    setEcgBuffer(buffer);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 transition-colors">

      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-xl shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">

            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Hridaya Rakshak
                </h1>
                <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">

              {/* Serial Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-success animate-pulse" : "bg-emergency"}`} />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? "Connected" : "Not Connected"}
                </span>
              </div>

              {/* Arduino Connect */}
              {!isConnected ? (
                <Button onClick={connectArduino} size="sm" className="gap-2">
                  <Usb className="h-4 w-4" /> Connect Arduino
                </Button>
              ) : (
                <Button onClick={disconnectArduino} variant="outline" size="sm">
                  Disconnect
                </Button>
              )}

              {/* Theme Toggle */}
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </Button>

              {/* Logout */}
              <Button variant="destructive" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">

        {/* Weather */}
        <div className="mb-6">
          <WeatherWidget />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

<<<<<<< Updated upstream
            <div className="animate-fade-in-up">
              <ECGMonitor onBufferUpdate={handleBufferUpdate} />
            </div>

            {/* ⬇⬇ NEW BLOCK WITH COMPASS ADDED ⬇⬇ */}
            <div className="flex gap-4 items-start animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <LocationMap onLocationUpdate={handleLocationUpdate} />
              <Compass />   {/* Import Compass from "@/components/Compass" */}
            </div>

=======
            {/* ECG */}
            <ECGMonitor onBufferUpdate={handleBufferUpdate} />

            {/* Map */}
            <LocationMap onLocationUpdate={handleLocationUpdate} />
>>>>>>> Stashed changes
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            <AlertConfigPanel />
            <NearestHospital location={location} />
            <SavedContacts />
            <AlertHistory />
          </div>
        </div>
      </main>
    </div>
  );
}