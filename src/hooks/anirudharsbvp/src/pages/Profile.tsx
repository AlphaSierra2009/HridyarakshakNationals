import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen p-6 flex justify-center bg-background">
      <Card className="p-6 w-full max-w-lg space-y-4">
        <h1 className="text-2xl font-bold">User Profile</h1>

        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>

        <Button variant="destructive" onClick={logout}>
          Logout
        </Button>
      </Card>
    </div>
  );
}