module.exports = {
    created: `INSERT INTO ARQ_FOLHADEPAGAMENTOS
            (ID, NOME, VINCULO, MES_PERIODO, ANO, ORGAO, CPF, MATRICULA, CARGO, DATAADMISSAO, CARGAHORARIA, VALORBRUTO, VALORLIQUIDO, VALORDESCONTO)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,

    checkPortal:`
            SELECT ID, CNPJ, NOME
            FROM ORGAO o
            WHERE UUID=?;`,
        updateDesconto:`
        UPDATE ARQ_FOLHADEPAGAMENTOS
        SET  VALORDESCONTO=0
        WHERE CPF='01659729394';`
}