-- CreateTable
CREATE TABLE "DadosExatraidosFolhaDePagementos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "vinculo" TEXT NOT NULL,
    "mes_periodo" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "Orgao" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "dataAdmissao" DATETIME NOT NULL,
    "cargaHoraria" TEXT NOT NULL,
    "valorBruto" REAL NOT NULL,
    "valorLiquido" REAL NOT NULL,
    "valorDesconto" REAL NOT NULL
);
