import { createClient } from "@supabase/supabase-js";
import { config } from "./env.js";

const DB_TIMEOUT_MS = 10_000;

function buildFetchWithTimeout() {
  return async (url, opts = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DB_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...opts,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timer);
    }
  };
}

export const supabase = createClient(
  config.supabase.url,
  config.supabase.key,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: buildFetchWithTimeout(),
    },
  }
);