import { chromium } from 'playwright';  // o puppeteer

export default async function handler(req, res) {
  // ... tus headers CORS como ya tienes

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const q = req.body?.q || req.query?.q;
  if (!q) return res.status(400).json({ error: 'Falta el enlace' });

  try {
    const browser = await chromium.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36');
    await page.goto('https://saveig.app/server', { waitUntil: 'networkidle' });

    // Completar el formulario si SaveIG lo espera
    await page.fill('input[name="url"]', q);
    await page.click('button[type="submit"]');

    // Esperar que cargue el resultado
    await page.waitForSelector('a[href$=".mp4"]', { timeout: 15000 });
    const videoUrl = await page.getAttribute('a[href$=".mp4"]', 'href');
    const thumbnail = await page.getAttribute('img.thumbnail', 'src').catch(() => '');

    await browser.close();

    if (!videoUrl) {
      return res.status(500).json({ error: 'No se pudo extraer video' });
    }

    return res.json({
      status: 'success',
      data: { title: 'Video de Instagram', thumbnail, video: [{ url: videoUrl }] }
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

