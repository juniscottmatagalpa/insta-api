export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const url = req.body?.q || req.query?.q;
  if (!url) return res.status(400).json({ error: "Falta el enlace" });

  try {
    const r = await fetch("https://instasupersave.com/api/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
      },
      body: JSON.stringify({ url })
    });

    const data = await r.json();

    if (!data || !data.url || !data.url[0]) {
      return res.status(500).json({ error: "No se pudo obtener el video" });
    }

    return res.json({
      status: "success",
      data: {
        title: data.title || "Video de Instagram",
        thumbnail: data.thumbnail || "",
        video: [{ url: data.url[0] }]
      }
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

