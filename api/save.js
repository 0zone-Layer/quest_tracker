import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  // ✅ CORS headers FIRST (required for preflight)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Proper body parsing
  let body = "";
  for await (const chunk of req) {
    body += chunk;
  }
  const { secret, key, value } = JSON.parse(body || "{}");

  console.log("Save attempt:", { secret: secret ? "provided" : "missing", key, value: value ? "provided" : "missing" });

  if (secret !== process.env.SAVE_SECRET) {
    console.error("Unauthorized save attempt - secret mismatch");
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!key) {
    console.error("Missing key");
    return res.status(400).json({ error: "Missing key" });
  }

  try {
    await redis.set(`knk:${key}`, value);
    console.log("Successfully saved:", `knk:${key}`);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Redis save error:", err);
    return res.status(500).json({ error: "Failed to save to Redis" });
  }
}
