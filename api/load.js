import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const { key, secret } = req.query;
  if (secret !== process.env.SAVE_SECRET) return res.status(401).json({ error: "Unauthorized" });
  if (!key) return res.status(400).json({ error: "Missing key" });
  const value = await kv.get(`knk:${key}`);
  return res.status(200).json({ value: value ?? null });
}
