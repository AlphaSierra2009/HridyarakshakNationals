import { useAuth } from "@/contexts/AuthContext";

export default function Admin() {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <div className="p-6 text-red-500">Access Denied</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <p>Welcome, Admin!</p>
      <p>You can view all alerts, users, and data here.</p>
    </div>
  );
}