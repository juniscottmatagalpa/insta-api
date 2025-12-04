export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  const q = req.body?.q || req.query?.q;
  if (!q) return res.status(400).json({ error: "Falta el enlace" });

  try {
    const form = new URLSearchParams({ url: q });

    const r = await fetch("https://instafix.net/api/details", {
      method: "POST",
      body: form,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    const json = await r.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json(json);

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
