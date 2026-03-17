export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=300");
  const TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
  const USER_ID = process.env.TELEGRAM_USER_ID;
  if (!TOKEN || !USER_ID) return res.status(500).json({ error: "Missing env vars" });
  const BASE = `https://api.telegram.org/bot${TOKEN}`;
  try {
    const [chatRes, photosRes] = await Promise.all([
      fetch(`${BASE}/getChat?chat_id=${USER_ID}`),
      fetch(`${BASE}/getUserProfilePhotos?user_id=${USER_ID}&limit=1`),
    ]);
    const chatData   = await chatRes.json();
    const photosData = await photosRes.json();
    let photoUrl = null;
    if (photosData.ok && photosData.result.total_count > 0) {
      const best    = photosData.result.photos[0].at(-1);
      const fileRes = await fetch(`${BASE}/getFile?file_id=${best.file_id}`);
      const fileData = await fileRes.json();
      if (fileData.ok) photoUrl = `https://api.telegram.org/file/bot${TOKEN}/${fileData.result.file_path}`;
    }
    const u = chatData.result || {};
    return res.status(200).json({
      name:     [u.first_name, u.last_name].filter(Boolean).join(" ") || "KNKing",
      username: u.username || null,
      bio:      u.bio      || null,
      photoUrl,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}