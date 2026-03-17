import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  // Proper body parsing (Vercel doesn't auto-parse JSON)
  let body = "";
  for await (const chunk of req) {
    body += chunk;
  }
  const { secret, key, value } = JSON.parse(body || "{}");

  if (secret !== process.env.SAVE_SECRET) {
    console.error("Unauthorized save attempt");
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!key) {
    return res.status(400).json({ error: "Missing key" });
  }

  try {
    await redis.set(`knk:${key}`, value);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Redis save error:", err);
    return res.status(500).json({ error: "Failed to save to Redis" });
  }
}
