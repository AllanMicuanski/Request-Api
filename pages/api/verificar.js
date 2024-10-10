import puppeteer from "puppeteer";

// Função de atraso usando setTimeout no Node.js
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ message: "URL não fornecida." });
  }

  let browser;
  const deploymentStatus = { script: false, gtm: false, vtexIO: false };
  const requisitions = [];

  try {
    console.log("Iniciando Puppeteer...");
    browser = await puppeteer.launch({ headless: true });
    console.log("Puppeteer iniciado com sucesso.");

    const page = await browser.newPage();
    console.log(`Acessando a URL: ${url}`);

    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      console.log("Página carregada com sucesso.");
    } catch (gotoError) {
      console.error("Erro ao carregar a URL:", gotoError);
      throw new Error("Falha ao carregar a URL.");
    }

    // Captura as requisições em tempo real
    page.on("request", (request) => {
      const requestUrl = request.url();

      // Filtra apenas requisições que contenham "sizebay"
      if (requestUrl.includes("sizebay")) {
        console.log(`Capturado (sizebay): ${requestUrl}`);
        requisitions.push({
          url: requestUrl,
          method: request.method(),
        });

        // Verificação de VTEX IO
        if (requestUrl.includes("vtex_module.js")) {
          deploymentStatus.vtexIO = true;
          console.log("Identificado VTEX IO: vtex_module.js encontrado.");
        }

        // Verificação de GTM via prescript.js
        if (requestUrl.includes("prescript.js")) {
          deploymentStatus.gtm = true;
          console.log(
            "Identificado Google Tag Manager: prescript.js encontrado."
          );
        }
      }
    });

    // Usar delay no Node.js para esperar por requisições adicionais (ex: 10 segundos)
    await delay(10000);
    console.log("Esperando requisições...");

    // Verifica se o Sizebay está presente
    const permalink = await page.evaluate(() => {
      return window.SizebayPrescript
        ? window.SizebayPrescript().getPermalink()
        : null;
    });

    // Nova verificação do script baseado no permalink
    if (permalink && !deploymentStatus.gtm && !deploymentStatus.vtexIO) {
      deploymentStatus.script = true;
      deploymentStatus.vtexIO = false;
      deploymentStatus.gtm = false;

      console.log("Existe permalink então é Script");
    }

    console.log("Requisições capturadas. Respondendo...");

    res.status(200).json({
      requisitions,
      permalink,
      scriptStatus: deploymentStatus.script,
      gtmStatus: deploymentStatus.gtm,
      vtexIOStatus: deploymentStatus.vtexIO,
      message:
        requisitions.length > 0 ? "" : "Nenhuma requisição Sizebay encontrada.",
    });
  } catch (error) {
    console.error("Erro ao verificar URL:", error);
    res
      .status(500)
      .json({ message: `Erro ao verificar URL: ${error.message}` });
  } finally {
    if (browser) {
      await browser.close();
      console.log("Navegador Puppeteer fechado.");
    }
  }
}
