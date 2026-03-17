import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();   // ← automatically reads your Vercel env vars

export default async function handler(req, res) {
  // ✅ CORS headers FIRST (required for preflight + consistency)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { key, secret } = req.query;

  console.log("Load attempt:", { key, secret: secret ? "provided" : "missing" });

  if (secret !== process.env.SAVE_SECRET) {
    console.error("Unauthorized load attempt - secret mismatch");
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!key) {
    console.error("Missing key");
    return res.status(400).json({ error: "Missing key" });
  }

  try {
    const value = await redis.get(`knk:${key}`);
    console.log("Successfully loaded:", `knk:${key}`, value ? "found" : "not found");
    return res.status(200).json({ value: value ?? null });
  } catch (err) {
    console.error("Redis load error:", err);
    return res.status(500).json({ error: "Failed to load from Redis" });
  }
}
