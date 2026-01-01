import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";


type Profile = {
  full_name: string | null;
  phone_number: string | null;
};

export default function ProfileCard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneInput, setPhoneInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone_number")
        .eq("id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // profile does not exist → create it
        await supabase.from("profiles").insert({
          id: user.id,
          full_name: user.user_metadata?.full_name ?? null,
          phone_number: null,
        });

        setProfile({
          full_name: user.user_metadata?.full_name ?? null,
          phone_number: null,
        });
        setPhoneInput("");
      } else if (!error && data) {
        setProfile(data);
        setPhoneInput(data.phone_number ?? "");
      }

      setLoading(false);
    };

    loadProfile();
  }, [user]);

  const savePhoneNumber = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ phone_number: phoneInput })
      .eq("id", user.id);

    if (!error) {
      setProfile({ ...profile, phone_number: phoneInput });
    }

    setSaving(false);
  };

  if (!user) {
    return (
      <Card className="p-4 text-sm text-muted-foreground card-glass">
        No user data available
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-4 text-sm text-muted-foreground card-glass">
        Loading profile…
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4 card-glass hover-lift">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary)/1)] to-[hsl(var(--accent)/1)] flex items-center justify-center text-primary-foreground shadow-[0_8px_30px_rgba(255,0,0,0.12)] ring-2 ring-[hsl(var(--primary)/0.18)]">
          <User className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold neon-glow">User Profile</h2>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Name:</span>
          <span>{profile?.full_name || "Not set"}</span>
        </div>

        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Email:</span>
          <span>{user.email}</span>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Phone:</span>
          <span>{profile?.phone_number || "Not set"}</span>
        </div>

        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Role:</span>
          <span>User</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">
          Emergency Phone Number
        </label>

        <input
          type="tel"
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value)}
          placeholder="+91XXXXXXXXXX"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60 ring-offset-2"
        />

        <Button
          variant="default"
          size="sm"
          className="w-full btn-glow btn-tactile"
          onClick={savePhoneNumber}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Phone Number"}
        </Button>
      </div>
    </Card>
  );
}