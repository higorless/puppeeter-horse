const teste = {
  id: "15721",
  competicao:
    "\n                        IV ETAPA DO RANKING FEERJ DE SALTO INICIANTE",
  dados_prova:
    "\n" +
    "            PRELIMINAR - 0.60 X 0.80\n" +
    "            -\n" +
    "            0,60m\n" +
    "            -\n" +
    "            PRELI\n" +
    "            -\n" +
    "            1 PERCURSO COM FAIXA DE TEMPO Tab A Art. 238.5.2.3\n" +
    "            -\n" +
    "            ROBERTO MARINHO - AREIA GEOPAT\n" +
    "            -\n" +
    "            09h30 - 19/05/2024\n" +
    "        ",
  classificação: "6º",
  competidor:
    "CELINE YANG\n" +
    "                                                        SOCIEDADE HÍPICA BRASILEIRA\n" +
    "                                                        \n" +
    "                                                        BRASIL",
  cavalo:
    "VICTOR\n" +
    "                                                            \n" +
    "                                                        \n" +
    "                                                        11/05/2002\n" +
    "                                                        / M\n" +
    "                                                        / KWPN\n" +
    "                                                        / -\n" +
    "                                                        \n" +
    "                                                        SOCIEDADE HÍPICA BRASILEIRA",
  categoria: "PRELI",
  faltas: "0(0+0)",
  tempo: "60,47",
  federacao: "WWW.FEERJ.ORG",
};

const teste2 = teste.cavalo.split("\n");

const finalResult = teste2.map((item) => item.trim()).filter((line) => line);

console.log(finalResult);

dummy = [
  "PRELIMINAR",
  "0.60 X 0.80",
  "0,60m",
  "PRELI",
  "1 PERCURSO COM FAIXA DE TEMPO Tab A Art. 238.5.2.3",
  "ROBERTO MARINHO",
  "AREIA GEOPAT",
  "09h30",
  "19/05/2024",
];

if (tableElement) {
  const rows = await page.$$eval(".hold_table table tr", (rows) =>
    rows
      .filter((row) => row.querySelectorAll("td").length > 1)
      .map((row) => {
        const cells = Array.from(row.querySelectorAll("td"));
        return cells.map((cell) => cell.textContent.trim());
      })
  );

  new Promise((resolve) => setTimeout(resolve, 5000));

  for (const row of rows) {
    const cells = await row.$$("td");

    if (cells.length === 0) {
      console.log(`Nenhuma célula foi encontrada na linha: ${row}`);
      continue;
    }

    const rowData = [];

    new Promise((resolve) => setTimeout(resolve, 5000));

    for (const cell of cells) {
      const cellText = await cell.evaluate((element) =>
        element.textContent.trim()
      );

      rowData.push(cellText);
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
      competicao: nomeTorneio || "",
      dados_prova:
        {
          categoria: dadosProva[0] || "",
          altura_salto: dadosProva[3]
            ? `${dadosProva[1]} - ${dadosProva[2]}`
            : dadosProva[1] || "",
          tipo_percurso: dadosProva[4] || "",
          hora: dadosProva[7] || "",
          data: dadosProva[8],
        } || "",
      classificação: rowData[0] || "",
      competidorInfo:
        {
          competidor: competidorFormatado[0] || "",
          entidade: competidorFormatado[1] || "",
          paisOrigem: competidorFormatado[2] || "",
        } || "",
      cavalo:
        {
          nome: infoCavaloFormatado[0] || "",
          data_nascimento: infoCavaloFormatado[1] || "",
          Sexo: infoCavaloFormatado[2].replaceAll("/", "") || "",
          Raça: infoCavaloFormatado[3].replaceAll("/", "") || "",
          Proprietário: infoCavaloFormatado[4] || "",
        } || "",
      categoria: rowData[3] || "",
      faltas: rowData[4] || "",
      tempo: rowData[5] || "",
      federacao: hipica_url
        .replace("wwww.", "u")
        .replace(".com.br", "")
        .toLocaleUpperCase(),
    };

    finalResult.push(body);
  }
}
