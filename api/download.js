export default async function handler(req, res) {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing url" });

  try {
    const r = await fetch(url);
    const buffer = Buffer.from(await r.arrayBuffer());

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="video.mp4"`);

    res.send(buffer);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
