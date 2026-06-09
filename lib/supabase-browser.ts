import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://adpksztfayylowsdjkuu.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGtzenRmYXl5bG93c2Rqa3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5OTk3MjUsImV4cCI6MjA5NjU3NTcyNX0.BJNfK65hPfgFXq6fDMwPcrCDF-EnIfLRz-tq8m37gyE";

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);
