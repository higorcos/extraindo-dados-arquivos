module.exports = {
        created: `INSERT INTO ARQ_FOLHADEPAGAMENTOS
                (ID, NOME, MES_PERIODO, ANO, TIPO_FOLHA, ORGAO, CPF, MATRICULA, CBO, CARGO, LOTACAO, VINCULO, DATAADMISSAO, CARGAHORARIA, VALORBRUTO, VALORLIQUIDO, VALORDESCONTO)
                VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,

        checkPortal:`
                SELECT ID, CNPJ, NOME
                FROM ORGAO o
                WHERE UUID=?;`,

        updateDesconto:`
                UPDATE ARQ_FOLHADEPAGAMENTOS
                SET  VALORDESCONTO=?
                WHERE ID=?;`,

        select: `SELECT ID, NOME, MES_PERIODO, ANO, TIPO_FOLHA, ORGAO, CPF, MATRICULA, CBO, CARGO, LOTACAO, VINCULO, DATAADMISSAO, CARGAHORARIA, VALORBRUTO, VALORLIQUIDO, VALORDESCONTO
                FROM ARQ_FOLHADEPAGAMENTOS;`
}