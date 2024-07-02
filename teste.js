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

const category =
  "MR\n" +
  "                                                    \n" +
  "                                                        \n" +
  "                                                         -";

const teste2 = category.split("\n");

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
