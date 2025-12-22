import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, User, AlertCircle } from "lucide-react";

interface EmergencyContact {
  name: string;
  phone: string;
  email: string;
}

const SavedContacts = () => {
  const [contacts, setContacts] = useState<EmergencyContact | null>(null);

  useEffect(() => {
    const savedContacts = localStorage.getItem('emergencyContacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }

    // Listen for contact updates
    const handleStorageChange = () => {
      const updated = localStorage.getItem('emergencyContacts');
      if (updated) {
        setContacts(JSON.parse(updated));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!contacts || (!contacts.phone && !contacts.email)) {
    return (
      <Card className="border-2 glass-card animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-warning" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No emergency contacts configured</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 glass-card animate-fade-in hover-lift">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-success" />
            Emergency Contacts
          </CardTitle>
          <Badge variant="outline" className="text-success border-success">
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts.name && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <User className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">{contacts.name}</p>
              <p className="text-xs text-muted-foreground">Contact Name</p>
            </div>
          </div>
        )}

        {contacts.phone && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <Phone className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium font-mono">{contacts.phone}</p>
              <p className="text-xs text-muted-foreground">WhatsApp / SMS</p>
            </div>
          </div>
        )}

        {contacts.email && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <Mail className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium break-all">{contacts.email}</p>
              <p className="text-xs text-muted-foreground">Email Address</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedContacts;
