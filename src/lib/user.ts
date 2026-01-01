import { User } from "@supabase/supabase-js";

export function getDisplayName(user?: User | null): string {
  if (!user) return "User";
  // User metadata may contain name variants depending on provider
  const metadata = (user as unknown as { user_metadata?: { full_name?: string; name?: string } })?.user_metadata;
  return metadata?.full_name ?? metadata?.name ?? user.email?.split("@")?.[0] ?? "User";
}
