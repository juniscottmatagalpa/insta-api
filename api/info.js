export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const q = req.body?.q || req.query?.q;
  if (!q) return res.status(400).json({ error: "Falta el enlace" });

  try {
    // 🔥 Servicio alternativo NO bloqueado
    const api = `https://snapinsta.io/api/ajaxSearch?q=${encodeURIComponent(q)}`;

    const r = await fetch(api, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0)",
        "Accept": "application/json,text/html"
      }
    });

    const data = await r.text();

    // Buscar MP4 directamente
    const mp4 = data.match(/(https:\/\/.*?\.mp4.*?)"/);
    if (!mp4) return res.status(500).json({ error: "No se pudo obtener el video." });

    const videoUrl = mp4[1];

    return res.json({
      status: "success",
      data: {
        title: "Video de Instagram",
        thumbnail: "",
        video: [{ url: videoUrl }]
      }
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

