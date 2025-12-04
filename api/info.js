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
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    const text = await r.text();

    // SnapInsta devuelve HTML — Extraemos JSON del script
    const jsonMatch = text.match(/"data":(\{.*?\}),"page"/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "No se pudo procesar el video" });
    }

    const data = JSON.parse(jsonMatch[1]);

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json({
      status: "success",
      data
    });

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
