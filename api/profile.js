import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  // ✅ CORS headers FIRST
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Username, X-Secret");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Validate secret
  const secret = req.headers["x-secret"];
  const username = req.headers["x-username"];

  console.log("profile handler:", {
    method: req.method,
    username,
    hasSecret: !!secret,
  });

  if (secret !== process.env.SAVE_SECRET) {
    console.error("Unauthorized: invalid secret");
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!username || typeof username !== "string") {
    console.error("Missing or invalid username");
    return res.status(400).json({ error: "Missing username header" });
  }

  const profileKey = `${username}:profile`;

  if (req.method === "GET") {
    return handleGet(res, profileKey);
  } else if (req.method === "POST") {
    return handlePost(req, res, profileKey);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleGet(res, profileKey) {
  try {
    console.log("GET: Loading profile from", profileKey);
    const value = await redis.get(profileKey);

    if (!value) {
      console.log("GET: No profile found, returning empty object");
      return res.status(200).json({
        completed: {},
        dailyFocus: { date: "", ids: [] },
      });
    }

    // value is already a JS object (Redis stores as JSON)
    console.log("GET: Retrieved profile:", value);
    return res.status(200).json(value);
  } catch (err) {
    console.error("GET: Redis error:", err);
    return res.status(500).json({ error: "Failed to load profile" });
  }
}

async function handlePost(req, res, profileKey) {
  try {
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }

    const profile = JSON.parse(body || "{}");
    console.log("POST: Saving profile to", profileKey, ":", profile);

    await redis.set(profileKey, profile);
    console.log("POST: Successfully saved profile");

    return res.status(200).json({
      ok: true,
      message: "Profile saved successfully",
    });
  } catch (err) {
    console.error("POST: Error:", err);
    return res.status(500).json({ error: "Failed to save profile" });
  }
}
