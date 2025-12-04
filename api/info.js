export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  const q = req.body?.q || req.query?.q;
  if (!q) return res.status(400).json({ error: "Falta el enlace" });

  try {
    const apiUrl =
      "https://snapinsta.io/api/ajaxSearch?lang=es&url=" +
      encodeURIComponent(q);

    const r = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://snapinsta.io/",
      }
    });

    const text = await r.text();

    // ✅ 1. Parsear JSON principal
    let initialJson;
    try {
      initialJson = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "SnapInsta no devolvió JSON válido" });
    }

    // ✅ 2. Extraer HTML interno donde viene el video
    const innerHTML = initialJson.data;
    if (!innerHTML)
      return res.status(500).json({ error: "No se encontró contenido del video" });

    // ✅ 3. Extraer URL del video HD dentro del HTML
    const videoMatch = innerHTML.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/);
    if (!videoMatch)
      return res.status(500).json({ error: "No se encontró enlace de descarga HD" });

    const videoUrl = videoMatch[1];

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json({
      status: "success",
      data: {
        title: "Video de Instagram",
        thumbnail: "", // SnapInsta no envía thumb directo ahora
        video: [{ url: videoUrl }]
      }
    });

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
