export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing url" });

  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error("Archivo no accesible");

    const buffer = Buffer.from(await r.arrayBuffer());

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="video.mp4"`);

    return res.send(buffer);

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
