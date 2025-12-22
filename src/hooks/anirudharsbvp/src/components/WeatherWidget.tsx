import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, CloudSnow } from "lucide-react";

interface Weather {
  temperature: number;
  condition: string;
  location: string;
}

const WeatherWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Fetch weather on mount
    fetchWeather();

    return () => clearInterval(timeInterval);
  }, []);

  const fetchWeather = async () => {
    try {
      // Get user's location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Fetch weather from Open-Meteo (free API)
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
          );
          const data = await response.json();

          const weatherCode = data.current.weather_code;
          let condition = "Clear";
          
          if (weatherCode >= 51 && weatherCode <= 67) condition = "Rain";
          else if (weatherCode >= 71 && weatherCode <= 77) condition = "Snow";
          else if (weatherCode >= 80 && weatherCode <= 99) condition = "Storm";
          else if (weatherCode >= 1 && weatherCode <= 3) condition = "Cloudy";

          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            condition,
            location: "Current Location",
          });
        },
        (error) => {
          console.error("Location error:", error);
        }
      );
    } catch (error) {
      console.error("Weather fetch error:", error);
    }
  };

  const getWeatherIcon = () => {
    if (!weather) return <Sun className="h-5 w-5" />;
    
    switch (weather.condition) {
      case "Rain":
        return <CloudRain className="h-5 w-5 text-blue-400" />;
      case "Snow":
        return <CloudSnow className="h-5 w-5 text-blue-200" />;
      case "Cloudy":
        return <Cloud className="h-5 w-5 text-gray-400" />;
      default:
        return <Sun className="h-5 w-5 text-yellow-400" />;
    }
  };

  return (
    <Card className="glass-card border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-2xl font-bold tabular-nums">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          {weather && (
            <div className="flex items-center gap-2">
              {getWeatherIcon()}
              <div className="text-right">
                <p className="text-2xl font-bold">{weather.temperature}°C</p>
                <p className="text-xs text-muted-foreground">{weather.condition}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
