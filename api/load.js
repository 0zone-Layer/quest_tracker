import { Redis } from "@upstash/redis";

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const { key, secret } = req.query;
  if (secret !== process.env.SAVE_SECRET) return res.status(401).json({ error: "Unauthorized" });
  if (!key) return res.status(400).json({ error: "Missing key" });
  const value = await redis.get(`knk:${key}`);
  return res.status(200).json({ value: value ?? null });
}
