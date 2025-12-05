export default async function handler(req, res) {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const q = req.body?.q || req.query?.q;
  if (!q) return res.status(400).json({ error: "Falta el enlace" });

  try {
    // 1. Pedimos a SaveIG
    const r = await fetch("https://saveig.app/server", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: `url=${encodeURIComponent(q)}`
    });

    const html = await r.text();

    // 2. Extraer MP4 del HTML
    const mp4Match = html.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/);
    if (!mp4Match) {
      return res.status(500).json({ error: "No se pudo obtener el video" });
    }

    const videoUrl = mp4Match[1];

    // 3. (Opcional) Extraer thumbnail
    const thumbMatch = html.match(/<img[^>]+src="([^"]+)"[^>]*class="thumbnail"/i);
    const thumbnail = thumbMatch ? thumbMatch[1] : "";

    return res.json({
      status: "success",
      data: {
        title: "Video de Instagram",
        thumbnail,
        video: [{ url: videoUrl }]
      }
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
