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
    await page.waitForSelector("body", { timeout: 5000 }); // Espera até que o corpo da página esteja carregado

    // Captura as requisições
    const requisições = [];
    page.on("request", (request) => {
      const reqUrl = request.url(); // Mudei a variável para reqUrl para não colidir
      if (reqUrl.includes("static.sizebay")) {
        requisições.push({
          url: reqUrl,
          method: request.method(),
          headers: request.headers(), // Captura os headers da requisição
        });
        console.log("Requisição capturada:", reqUrl); // Adicione isto para log
      }
    });

    // Realiza a requisição e espera até que as requisições estejam concluídas
    await page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 5000))
    ); // Aguarda 5 segundos

    // Verifica se foram encontradas requisições
    if (requisições.length > 0) {
      res.status(200).json({ requisitions: requisições }); // Retorna como 'requisitions'
    } else {
      res
        .status(200)
        .json({ message: "Nenhuma requisição Sizebay encontrada." });
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
