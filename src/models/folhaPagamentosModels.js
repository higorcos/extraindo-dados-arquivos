module.exports = {
    created: `INSERT INTO ARQ_FOLHADEPAGAMENTOS
            (ID, NOME, VINCULO, MES_PERIODO, ANO, ORGAO, CPF, MATRICULA, CARGO, DATAADMISSAO, CARGAHORARIA, VALORBRUTO, VALORLIQUIDO, VALORDESCONTO)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,

    checkPortal:`
            SELECT ID, CNPJ, NOME
            FROM ORGAO o
            WHERE UUID=?;`,
}