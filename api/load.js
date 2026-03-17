import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();   // ← automatically reads your Vercel env vars

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { key, secret } = req.query;

  if (secret !== process.env.SAVE_SECRET) {
    console.error("Unauthorized load attempt");
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!key) {
    return res.status(400).json({ error: "Missing key" });
  }

  try {
    const value = await redis.get(`knk:${key}`);
    return res.status(200).json({ value: value ?? null });
  } catch (err) {
    console.error("Redis load error:", err);
    return res.status(500).json({ error: "Failed to load from Redis" });
  }
}
