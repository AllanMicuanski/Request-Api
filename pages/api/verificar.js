import puppeteer from "puppeteer";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ message: "URL não fornecida." });
  }

  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // Aqui, você pode esperar um pouco para garantir que as requisições tenham sido feitas
    await page.waitForSelector("body", { timeout: 5000 });

    // Captura as requisições
    const requisitions = [];
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("static.sizebay")) {
        requisitions.push({
          url,
          method: request.method(),
        });
      }
    });

    const permalink = await page.evaluate(() => {
      if (window.SizebayPrescript) {
        return window.SizebayPrescript().getPermalink();
      }
      return null;
    });

    await page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 5000))
    );

    if (requisitions.length > 0) {
      res.status(200).json({ requisitions, permalink });
    } else {
      res
        .status(200)
        .json({ message: "Nenhuma requisição Sizebay encontrada.", permalink });
    }
  } catch (error) {
    console.error("Erro ao verificar:", error);
    res.status(500).json({ message: "Erro ao verificar URL." });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
