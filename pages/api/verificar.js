import puppeteer from "puppeteer";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ message: "URL não fornecida." });
  }

  let browser;
  const deploymentStatus = {
    script: false,
    gtm: false,
    vtexIO: false,
  };

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // Espera um pouco para garantir que as requisições tenham sido feitas
    await page.waitForSelector("body", { timeout: 5000 });

    // Captura as requisições
    const requisitions = [];
    page.on("request", (request) => {
      const requestUrl = request.url();
      if (requestUrl.includes("static.sizebay")) {
        requisitions.push({
          url: requestUrl,
          method: request.method(),
        });

        // Verificando o método de implantação
        if (requestUrl.includes("sizebay.sizebay-tracker")) {
          deploymentStatus.script = true;
        }
        if (requestUrl.includes("vtex.assets")) {
          deploymentStatus.vtexIO = true;
        }
        // Para GTM, você pode usar a lógica do request initiator chain
        if (request.redirectedFrom()) {
          deploymentStatus.gtm = true;
        }
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
      res.status(200).json({
        requisitions,
        permalink,
        scriptStatus: deploymentStatus.script,
        gtmStatus: deploymentStatus.gtm,
        vtexIOStatus: deploymentStatus.vtexIO,
      });
    } else {
      res.status(200).json({
        message: "Nenhuma requisição Sizebay encontrada.",
        permalink,
        scriptStatus: deploymentStatus.script,
        gtmStatus: deploymentStatus.gtm,
        vtexIOStatus: deploymentStatus.vtexIO,
      });
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
