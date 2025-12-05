export default async function handler(req, res) {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  const q = req.body?.q || req.query?.q;
  if (!q) return res.status(400).json({ error: "Falta el enlace" });

  try {
    const apiUrl =
      "https://snapinsta.io/api/ajaxSearch?lang=es&url=" + encodeURIComponent(q);

    const r = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://snapinsta.io/"
      }
    });

    const text = await r.text();

    // SnapInsta ya NO devuelve JSON completo → solo algunos campos
    let info;
    try {
      info = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "SnapInsta no devolvió JSON válido" });
    }

    if (!info.data)
      return res.status(500).json({ error: "Falta la sección data en respuesta" });

    const inner = info.data;

    const match = inner.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/);
    if (!match)
      return res.status(500).json({ error: "No se encontró enlace MP4" });

    const videoUrl = match[1];

    return res.json({
      status: "success",
      data: {
        title: "Video de Instagram",
        thumbnail: "",
        video: [{ url: videoUrl }]
      }
    });

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
