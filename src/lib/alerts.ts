import emailjs from "@emailjs/browser";

type EmergencyPayload = {
  notes?: string;
  stemi_level?: number | null;
  heart_rate?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  nearest_hospital?: string | null;
  is_test?: boolean;
};

export async function callTriggerEmergency(payload: EmergencyPayload) {
  const {
    notes,
    stemi_level,
    heart_rate,
    latitude,
    longitude,
    nearest_hospital,
    is_test,
  } = payload;

  // ---- ENV VALIDATION (fail fast, no silent errors) ----
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error("EmailJS environment variables are missing");
  }

  const timestamp = new Date().toLocaleString();

  const googleMap =
    latitude && longitude
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : "Location unavailable";

  const osmMap =
    latitude && longitude
      ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`
      : "Location unavailable";

  const templateParams = {
    type: is_test ? "TEST ALERT" : "EMERGENCY ALERT",
    message: notes || "Possible ST Elevation (STEMI) detected",
    stemi_level: stemi_level != null ? `${stemi_level}%` : "N/A",
    heart_rate: heart_rate ?? "N/A",
    time: timestamp,
    latitude: latitude ?? "Unknown",
    longitude: longitude ?? "Unknown",
    nearest_hospital: nearest_hospital ?? "Not available",
    google_map: googleMap,
    osm_map: osmMap,
  };

  const result = await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    templateParams,
    PUBLIC_KEY
  );

  return {
    success: true,
    emailjs_status: result.status,
    emailjs_text: result.text,
  };
}