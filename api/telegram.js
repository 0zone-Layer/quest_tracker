export default async function handler(req, res) {
  // Security: only allow GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");

  const TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
  const USER_ID = process.env.TELEGRAM_USER_ID;

  if (!TOKEN || !USER_ID) {
    return res.status(500).json({ error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_USER_ID env vars" });
  }

  const BASE = `https://api.telegram.org/bot${TOKEN}`;

  try {
    const [chatRes, photosRes] = await Promise.all([
      fetch(`\( {BASE}/getChat?chat_id= \){USER_ID}`),
      fetch(`\( {BASE}/getUserProfilePhotos?user_id= \){USER_ID}&limit=1`),
    ]);

    // Fail fast if Telegram API itself failed
    if (!chatRes.ok || !photosRes.ok) {
      const errData = !chatRes.ok 
        ? await chatRes.json() 
        : await photosRes.json();
      console.error("Telegram API error:", errData);
      return res.status(500).json({ 
        error: errData.description || "Telegram API request failed" 
      });
    }

    const chatData   = await chatRes.json();
    const photosData = await photosRes.json();

    let photoUrl = null;
    if (photosData.result?.total_count > 0) {
      const photoSizes = photosData.result.photos[0];
      const bestPhoto  = photoSizes[photoSizes.length - 1]; // largest size

      const fileRes = await fetch(`\( {BASE}/getFile?file_id= \){bestPhoto.file_id}`);
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        if (fileData.ok) {
          photoUrl = `https://api.telegram.org/file/bot\( {TOKEN}/ \){fileData.result.file_path}`;
        }
      }
    }

    const u = chatData.result || {};
    return res.status(200).json({
      name:     [u.first_name, u.last_name].filter(Boolean).join(" ") || "KNKing",
      username: u.username || null,
      bio:      u.bio      || null,
      photoUrl,
    });

  } catch (err) {
    console.error("Telegram profile handler error:", err);
    return res.status(500).json({ error: err.message });
  }
}
