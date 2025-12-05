export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const link = req.body?.q || req.query?.q;
  if (!link) return res.status(400).json({ error: "Falta enlace" });

  try {
    // 1) Extraer código del post
    const match = link.match(/\/p\/([^\/]+)/) || link.match(/\/reel\/([^\/]+)/);
    if (!match) return res.status(400).json({ error: "Enlace inválido" });

    const code = match[1];

    // 2) API real de Instagram
    const apiUrl = `https://www.instagram.com/p/${code}/?__a=1&__d=dis`;

    const r = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    const data = await r.json();

    const media = data?.items?.[0] || data?.graphql?.shortcode_media;

    if (!media) return res.status(500).json({ error: "No se pudo obtener información" });

    const videoUrl = media.video_versions?.[0]?.url;
    const thumb = media.display_url;

    if (!videoUrl)
      return res.status(500).json({ error: "Este enlace no contiene video." });

    return res.json({
      status: "success",
      data: {
        title: media.title || "Video de Instagram",
        thumbnail: thumb,
        video: [{ url: videoUrl }]
      }
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

