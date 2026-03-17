import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { secret, key, value } = req.body || {};
  if (secret !== process.env.SAVE_SECRET) return res.status(401).json({ error: "Unauthorized" });
  if (!key) return res.status(400).json({ error: "Missing key" });
  await kv.set(`knk:${key}`, value);
  return res.status(200).json({ ok: true });
}
