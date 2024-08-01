/*
  Warnings:

  - You are about to drop the column `Orgao` on the `DadosExatraidosFolhaDePagementos` table. All the data in the column will be lost.
  - Added the required column `orgao` to the `DadosExatraidosFolhaDePagementos` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DadosExatraidosFolhaDePagementos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "vinculo" TEXT NOT NULL,
    "mes_periodo" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "orgao" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "dataAdmissao" DATETIME NOT NULL,
    "cargaHoraria" TEXT NOT NULL,
    "valorBruto" REAL NOT NULL,
    "valorLiquido" REAL NOT NULL,
    "valorDesconto" REAL NOT NULL
);
INSERT INTO "new_DadosExatraidosFolhaDePagementos" ("ano", "cargaHoraria", "cargo", "cpf", "dataAdmissao", "id", "matricula", "mes_periodo", "nome", "valorBruto", "valorDesconto", "valorLiquido", "vinculo") SELECT "ano", "cargaHoraria", "cargo", "cpf", "dataAdmissao", "id", "matricula", "mes_periodo", "nome", "valorBruto", "valorDesconto", "valorLiquido", "vinculo" FROM "DadosExatraidosFolhaDePagementos";
DROP TABLE "DadosExatraidosFolhaDePagementos";
ALTER TABLE "new_DadosExatraidosFolhaDePagementos" RENAME TO "DadosExatraidosFolhaDePagementos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
