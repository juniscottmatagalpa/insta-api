export default async function handler(req, res) {
  const url = req.query.url;
  const ext = req.query.ext || "mp4";
  if (!url) return res.status(400).json({error:"Missing url"});

  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error("Archivo no accesible");

    const data = Buffer.from(await r.arrayBuffer());

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", ext === "mp3" ? "audio/mpeg" : "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="video.${ext}"`);
    res.send(data);

  } catch (e) {
    return res.status(500).json({error:String(e)});
  }
}
