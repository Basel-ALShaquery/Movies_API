import dotenv from "dotenv";

dotenv.config();

const required = ["PORT", "SUPABASE_URL", "SUPABASE_KEY", "API_KEY"];

const missing = required.filter((k) => {
  const v = process.env[k];
  return v === undefined || v === null || String(v).trim() === "";
});

if (missing.length) {
  throw new Error(
    `Missing required environment variables: ${missing.join(
      ", "
    )}. Add them to your environment or .env file.`
  );
}

const PORT = Number.parseInt(process.env.PORT, 10);
if (!Number.isFinite(PORT) || PORT <= 0) {
  throw new Error(`Invalid PORT: "${process.env.PORT}". Must be a positive integer.`);
}

const SUPABASE_URL = process.env.SUPABASE_URL.trim();
try {
  // Ensures it's a valid absolute URL
  new URL(SUPABASE_URL);
} catch {
  throw new Error(`Invalid SUPABASE_URL: "${process.env.SUPABASE_URL}". Must be a valid URL.`);
}

const NODE_ENV = process.env.NODE_ENV ?? "development";
const VALID_ENVS = ["development", "production", "test"];
if (!VALID_ENVS.includes(NODE_ENV)) {
  throw new Error(
    `Invalid NODE_ENV: "${NODE_ENV}". Must be one of: ${VALID_ENVS.join(", ")}`
  );
}

export const config = Object.freeze({
  port: PORT,
  nodeEnv: NODE_ENV,
  isDev: NODE_ENV === "development",
  isProd: NODE_ENV === "production",
  apiKey: process.env.API_KEY.trim(),
  supabase: {
    url: SUPABASE_URL,
    key: process.env.SUPABASE_KEY.trim(),
  },
});