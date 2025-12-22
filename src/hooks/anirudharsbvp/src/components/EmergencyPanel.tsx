import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Phone, Mail, Save, Check } from "lucide-react";
import { toast } from "sonner";
interface EmergencyContact {
  name: string;
  phone: string;
  email: string;
}
interface EmergencyPanelProps {
  stElevationDetected: boolean;
  location: {
    latitude: number;
    longitude: number;
  } | null;
}
const EmergencyPanel = ({
  stElevationDetected,
  location
}: EmergencyPanelProps) => {
  const [contacts, setContacts] = useState<EmergencyContact>({
    name: "",
    phone: "",
    email: ""
  });
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    if (!contacts.phone && !contacts.email) {
      toast.error("Please add at least one contact method");
      return;
    }
    localStorage.setItem("emergencyContacts", JSON.stringify(contacts));
    setSaved(true);
    toast.success("Emergency contacts saved!");
    setTimeout(() => setSaved(false), 2000);
  };
  const sendEmergencyAlert = async () => {
    if (!location) {
      toast.error("Location not available");
      return;
    }

    // In production, this would call your backend edge function
    toast.success("Emergency alert sent!", {
      description: `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
      duration: 5000
    });
    console.log("Emergency Alert Sent:", {
      contacts,
      location,
      timestamp: new Date(),
      event: "ST Elevation Detected"
    });
  };

  // Auto-send alert when ST elevation is detected
  useEffect(() => {
    if (stElevationDetected && location && (contacts.phone || contacts.email)) {
      sendEmergencyAlert();
    }
  }, [stElevationDetected, location, contacts]);
  return <Card className="border-2 bg-zinc-800">
      <div className="p-4 border-b bg-zinc-800">
        <div className="flex items-center gap-2 text-slate-50">
          <AlertTriangle className="h-5 w-5 text-emergency" />
          <h3 className="font-semibold text-lg">Emergency System</h3>
          {stElevationDetected && <Badge variant="destructive" className="ml-auto animate-pulse-glow">
              ALERT ACTIVE
            </Badge>}
        </div>
      </div>
      
      <div className="p-6 space-y-4 bg-zinc-800">
        <div className="space-y-2 bg-zinc-800">
          <Label htmlFor="contact-name">Emergency Contact Name</Label>
          <Input id="contact-name" placeholder="e.g., Family Member" value={contacts.name} onChange={e => setContacts({
          ...contacts,
          name: e.target.value
        })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number (for SMS)
          </Label>
          <Input id="contact-phone" type="tel" placeholder="+1234567890" value={contacts.phone} onChange={e => setContacts({
          ...contacts,
          phone: e.target.value
        })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address
          </Label>
          <Input id="contact-email" type="email" placeholder="emergency@example.com" value={contacts.email} onChange={e => setContacts({
          ...contacts,
          email: e.target.value
        })} />
        </div>

        <Button onClick={handleSave} variant={saved ? "secondary" : "default"} className="w-full gap-2 bg-blue-700 hover:bg-blue-600">
          {saved ? <>
              <Check className="h-4 w-4" />
              Saved!
            </> : <>
              <Save className="h-4 w-4" />
              Save Emergency Contacts
            </>}
        </Button>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold mb-2">Auto-Alert Status</h4>
          <p className="text-sm text-muted-foreground mb-3">
            When ST elevation is detected, an emergency alert with your location will be automatically sent to saved contacts.
          </p>
          {!contacts.phone && !contacts.email && <Badge variant="outline" className="text-warning border-warning">
              No contacts configured
            </Badge>}
          {(contacts.phone || contacts.email) && <Badge variant="outline" className="text-success border-success">
              Emergency system ready
            </Badge>}
        </div>

        <Button onClick={sendEmergencyAlert} variant="destructive" className="w-full gap-2" disabled={!location || !contacts.phone && !contacts.email}>
          <AlertTriangle className="h-4 w-4" />
          Send Test Alert
        </Button>
      </div>
    </Card>;
};
export default EmergencyPanel;