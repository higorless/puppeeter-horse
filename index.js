const puppeteer = require("puppeteer");

(async () => {
  const cssSelectors = {
    dateSelect: '::-p-xpath(//*[@id="ctl00_ContentPlaceHolder1_ddlMes"])',
    yearSelect: '::-p-xpath(//*[@id="ctl00_ContentPlaceHolder1_ddlAno"])',
  };

  const finalResult = [];

  // const hipicas = ['www.shpr.com.br', 'www.fhbr.com.br', 'www.federacaoequestrepe.com.br','www.fph.com.br', 'www.feerj.org']
  const hipicas_urls = ["www.feerj.org"];

  // const months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
  const monthsOptions = ["5"];

  // const years = ["2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"]
  const yearsOptions = ["2024"];

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  for (const hipica_url of hipicas_urls) {
    console.log("Coletando dados da Hipica: " + hipica_url);

    function extractIdFromLink(link) {
      // Expressões regulares para os dois tipos de links
      const regexPdfLink = /\/(\d+)\//;
      const regexIdLink = /ID=(\d+)/;

      let match = link.match(regexPdfLink);
      if (match && match[1]) {
        return match[1];
      }

      match = link.match(regexIdLink);
      if (match && match[1]) {
        return match[1];
      }

      // Se nenhuma das expressões combinar, lança um erro
      throw new Error("ID não encontrado no link.");
    }

    let idsTorneiosColetadosArray = [];
    let resultsPdfArray = [];
    let resultsInfoArray = [];
    let loading = false;

    page.on("dialog", async (dialog) => {
      console.log("Diálogo detectado:", dialog.message());
      await dialog.accept();
    });

    await page.goto(`https://${hipica_url}/calendario`);

    for (const month of monthsOptions) {
      await page.select(cssSelectors.dateSelect, month);
    }

    for (const year of yearsOptions) {
      await page.select(cssSelectors.yearSelect, year);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const elements = await page.$$eval('a[title="Resultado"]', (anchors) => {
      return anchors.map((anchor) => anchor.href);
    });

    elements.map((link) => {
      idsTorneiosColetadosArray.push(extractIdFromLink(link));
    });

    const setIdsTorneiosColetados = new Set(idsTorneiosColetadosArray);
    const setResultsInfoArray = new Set(resultsInfoArray);
    const setResultsPdfArray = new Set(resultsPdfArray);

    const idsTorneiosColetados = [...setIdsTorneiosColetados];
    const resultsInfo = [...setResultsInfoArray];
    const resultsPdf = [...setResultsPdfArray];

    console.log(idsTorneiosColetados);

    for (const [index, id] of idsTorneiosColetados.entries()) {
      console.log(
        `Processando ${index + 1} de ${idsTorneiosColetados.length} torneios`
      );

      try {
        await page.goto(
          `https://${hipica_url}/calendario/ListaProvas?ID=${id}`
        );

        try {
          await page.waitForSelector('p[class="lstProva accordion"]', {
            timeout: 2000,
          });
        } catch (error) {
          console.warn(`Informações não encontrada para o torneio ID: ${id}`);
          continue;
        }

        const card_elements = await page.$$('p[class="lstProva accordion"]');

        for (const element of card_elements) {
          await element.evaluate((el) => el.click());
        }

        await page.waitForSelector("span.spanListaProvas strong");

        const resultsButtons = await page.$$('a[title="Resultados"]');

        if (resultsButtons.length === 0) {
          console.log(
            `Nenhum botão "Resultados" encontrado para o torneio ID: ${id}`
          );
          continue;
        } else {
          const elementsResultados = await page.$$eval(
            'a[title="Resultados"]',
            (anchors) => {
              return anchors.map((anchor) => anchor.href);
            }
          );
          elementsResultados.map((link) => {
            resultsInfo.push({ ID: extractIdFromLink(link), href: link });
          });
        }
      } catch (error) {
        console.error(`Erro ao processar o torneio ID: ${id}`, error);
      }
    }

    for (const [indice, result] of resultsInfo.entries()) {
      console.log(
        `Processando ${indice + 1} de ${resultsInfo.length} resultados`
      );

      if (result.href.includes(".pdf")) {
        resultsPdf.push(result);
        console.log("Resultado em PDF");
      } else {
        await page.goto(
          `https://${hipica_url}/calendario/Resultados?ID=${result.ID}`
        );

        let nomeTorneio = "";
        let dadosProva = "";

        await page.waitForSelector(".hold_h2.img_head_content h2");

        const divElement = await page.$(".hold_h2.img_head_content h2");

        if (divElement) {
          const conteudoDoDiv = await page.evaluate(
            (el) => el.innerHTML,
            divElement
          );
          nomeTorneio = conteudoDoDiv.trim();
        } else {
          console.log("Elemento <div> não encontrado.");
        }

        await page.waitForSelector(".dadosProva");

        const spanElement = await page.$(".dadosProva");

        if (spanElement) {
          const conteudoDoSpan = await page.evaluate(
            (el) => el.textContent,
            spanElement
          );

          const conteudoDoSpanArray = conteudoDoSpan.split(" -");
          const conteudoDoSpanFormatado = conteudoDoSpanArray.map((item) =>
            item.replace(/\n/g, " ").trim()
          );
          dadosProva = conteudoDoSpanFormatado;
        } else {
          console.log(`Dados faltantes na prova ${id}`);
        }

        await page.waitForSelector(".hold_table table");

        const tableElement = await page.$(".hold_table table");

        if (tableElement) {
          const rows = await page.$$eval(".hold_table table tr", (rows) =>
            rows
              .filter((row) => row.querySelectorAll("td").length > 1)
              .map((row) => {
                const cells = Array.from(row.querySelectorAll("td"));
                return cells.map((cell) => cell.textContent.trim());
              })
          );

          for (const rowData of rows) {
            if (rowData.length === 0) {
              console.log("Linha sem dados, ignorada.");
              continue;
            }

            const competidorFormatado = rowData[1]
              ? rowData[1]
                  .split("\n")
                  .map((item) => item.trim())
                  .filter((line) => line)
              : "";

            const infoCavaloFormatado = rowData[2]
              ? rowData[2]
                  .split("\n")
                  .map((item) => item.trim())
                  .filter((line) => line)
              : "";

            let body = {
              id: result.ID,
              competicao: nomeTorneio || "Nome do torneio não informado",
              dados_prova: {
                categoria: dadosProva[0] || "Categoria não informada",
                altura_salto: dadosProva[3]
                  ? `${dadosProva[1]} - ${dadosProva[2]}`
                  : dadosProva[1] || "Altura do salto não informada",
                tipo_percurso:
                  dadosProva[4] || "Tipo do percurso não informado",
                hora: dadosProva[7] || "Hora não informada",
                data: dadosProva[8] || "Data não informada",
              },
              classificação: rowData[0] || "Classificação não informada",
              competitorInfo: {
                competitor:
                  competidorFormatado[0] || "Competidor não informado",
                entity: competidorFormatado[1] || "Entidade não informada",
                country: competidorFormatado[2] || "País não informado",
              },
              cavalo: {
                name: infoCavaloFormatado[0] || "Nome do cavalo não informado",
                birth_date:
                  infoCavaloFormatado[1] ||
                  "Data de nascimento do cavalo não informada",
                sex:
                  infoCavaloFormatado[2].replaceAll("/", "") ||
                  "Sexo do cavalo não informado",
                race:
                  infoCavaloFormatado[3].replaceAll("/", "") ||
                  "Raça do cavalo não informada",
                owner:
                  infoCavaloFormatado[4].replaceAll("/", "") ||
                  "Proprietário do cavalo não informado",
              },
              category: rowData[3] || "Categoria não informada",
              fouls: rowData[4] || "Faltas não informadas",
              time: rowData[5] || "Tempo não informado",
              federation: hipica_url
                .replace("www.", "")
                .replace(".com.br", "")
                .toUpperCase(),
            };

            finalResult.push(body);
          }
        }
      }
    }

    console.log(finalResult);
  }
})();
