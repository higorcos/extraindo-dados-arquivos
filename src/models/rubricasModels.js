module.exports = {
    created: `INSERT INTO ARQ_RUBRICAS
        (ID, FK_FL, CPF, MES_PERIODO, ANO, TIPO_FOLHA, NOME_FOLHA, DESCONTO, VALOR)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);`,

    checkDescontos:`SELECT SUM(RUB.VALOR) AS DESCONTO_TOTAL 
        FROM ARQ_RUBRICAS RUB
        WHERE RUB.FK_FL = ? AND RUB.DESCONTO = 1;`,
    }