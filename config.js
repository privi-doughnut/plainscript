// Plainscript — config. Fill these in as you go.
//
// SAFE TO COMMIT: the Supabase anon key is public by design and protected by
// Row-Level Security (see supabase/schema.sql). The Worker URL is public too.
// NEVER put your Anthropic API key here — it lives ONLY as a Cloudflare Worker
// secret (see worker.js).
//
// The app works fully with all of these blank: Decode and the interaction
// check need no keys. Fill them to unlock:
//   - CLAUDE_PROXY_URL  -> plain-English mode (Phase 1)
//   - SUPABASE_*        -> accounts + saved cabinet (Phase 2)
window.PLAINSCRIPT_CONFIG = {
  CLAUDE_PROXY_URL:  "",  // e.g. https://plainscript-proxy.<you>.workers.dev
  SUPABASE_URL:      "https://rxwbyyhukmxsknmhhzsn.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4d2J5eWh1a214c2tubWhoenNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0ODg5MDQsImV4cCI6MjEwMDA2NDkwNH0.g2XXOYsUaHLnMD1ObYGKYOU011v--z2RR83q1vsDkjA"
};
