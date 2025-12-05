import { chromium } from "@playwright/test";

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const q = req.body?.q || req.query?.q;
  if (!q) return res.status(400).json({ error: "Falta enlace" });

  try {
    const browser = await chromium.launch({
      args: ['--no-sandbox'],
      headless: true
    });

    const page = await browser.newPage();

    await page.goto("https://saveig.app/", {
      waitUntil: "domcontentloaded",
      timeout: 20000
    });

    await page.fill("input[name=url]", q);
    await page.click("button[type=submit]");

    await page.waitForSelector("a[href$='.mp4']", { timeout: 15000 });

    const videoUrl = await page.getAttribute("a[href$='.mp4']", "href");

    const thumb = await page.getAttribute("img.thumbnail", "src").catch(() => "");

    await browser.close();

    if (!videoUrl) return res.status(500).json({ error: "No se pudo obtener video" });

    return res.json({
      status: "success",
      data: {
        title: "Video de Instagram",
        thumbnail: thumb || "",
        video: [{ url: videoUrl }]
      }
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

