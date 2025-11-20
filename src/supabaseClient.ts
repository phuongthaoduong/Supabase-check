import { createClient } from "@supabase/supabase-js";

declare global {
  interface Window {
    __APP_ENV__?: Record<string, string>;
  }
}

const runtime = typeof window !== "undefined" ? window.__APP_ENV__ : undefined;

const supabaseUrl =
  runtime?.SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL;
const supabaseAnonKey =
  runtime?.SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);