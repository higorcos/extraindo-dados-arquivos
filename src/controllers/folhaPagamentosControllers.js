const { extractDataXLS_Servidores, extractDataXML_Servidores } = require('../ultils/extractData');

const {executeQuery,executeQueryTrx} = require('../database/type');
const { v4: uuid } = require('uuid');
const { Readable } = require('stream');
const readLine = require('readline');

const Firebird = require("node-firebird");
const options = require("../database/client");
const folhaSQL = require("../models/folhaPagamentosModels")
const rubricasModel = require("../models/rubricasModels");
const { formatDataDB } = require('../ultils/formatDate');
const {getTypePortal} = require('../ultils/typePortal');


const processCSV =  async(file, request, response)=>{
    const {idPortal} = request.params;
    
    const {fileFolha, fileRubricas} = file
    const {
        columnNome, 
        columnMes_Periodo,
        columnAno,
        columnOrgao,
        columnCpf, 
        columnMatricula, 
        columnCBO,
        columnCargo, 
        columnLotacao,
        columnVinculo, 
        columnDataAdmissao, 
        columnCargaHoraria, 
        columnValorBruto, 
        columnValorLiquido, 
        columnValorDesconto,
        columnIdTipoPagamento,
            } = request.body

    const bufferFolha = fileFolha[0].buffer
    const bufferRubricas = fileRubricas[0].buffer
    
    console.log(bufferFolha)
    
    const rfileFolha = new Readable();
    rfileFolha.push(bufferFolha)
    rfileFolha.push(null)
    const dataLine = readLine.createInterface({
        input: rfileFolha
    })
    const dataFolha = []
 
    for await(let line of dataLine){
        const lineSplit = line.split('|');

        dataFolha.push({
        nome: lineSplit[columnNome],
        mes_periodo: lineSplit[columnMes_Periodo],
        ano: lineSplit[columnAno],
        idTipoPagamento: lineSplit[columnIdTipoPagamento],
        orgao: lineSplit[columnOrgao],
        cpf: lineSplit[columnCpf],
        cbo: lineSplit[columnCBO],
        matricula: lineSplit[columnMatricula], 
        cargo: lineSplit[columnCargo],
        lotacao: lineSplit[columnLotacao],       
        vinculo: "" ,//lineSplit[columnLotacao], // Alterar aqui - Criar logicas
        dataAdmissao:   formatDataDB(lineSplit[columnDataAdmissao]),//10
        cargaHoraria: lineSplit[columnCargaHoraria],
        valorBruto: parseFloat(lineSplit[columnValorBruto]),
        valorLiquido: parseFloat(lineSplit[columnValorLiquido]),
        valorDesconto: 0,
        })
    }
    
    const rfileRubricas = new Readable();
    rfileRubricas.push(bufferRubricas)
    rfileRubricas.push(null)
    const dataLineRubricas = readLine.createInterface({
        input: rfileRubricas
    })
    const dataRubricas = []
 
    for await(let lineRubricas of dataLineRubricas){
        const lineSplit = lineRubricas.split('|');
        const columnCpf = 4
        const columnMes_Periodo = 1
        const columnAno = 2
        const columnTipoPagamento = 7
        const columnValor = 8
        const columnDesconto = 14 
        const columnIdTipoPagamento = 3

        dataRubricas.push({
        cpf: lineSplit[columnCpf],
        mes_periodo: lineSplit[columnMes_Periodo],
        ano: lineSplit[columnAno],
        tipoPagamento: lineSplit[columnTipoPagamento],
        idTipoPagamento: lineSplit[columnIdTipoPagamento],
        desconto: lineSplit[columnDesconto],
        valor: parseFloat(lineSplit[columnValor]),
        })
    }

    const dataFolhasAndRubricas = dataFolha.map((folha) => {
        // Filtra as rubricas que correspondem ao cpf, mes_periodo e ano
        const rubricasCorrespondentes = dataRubricas.filter(rubrica =>
          rubrica.cpf === folha.cpf &&
          rubrica.mes_periodo === folha.mes_periodo &&
          rubrica.ano === folha.ano &&
          rubrica.idTipoPagamento === folha.idTipoPagamento
        );
      
        // Retorna o objeto folha com a chave rubricas adicionada
        return {
          ...folha,
          rubricas: rubricasCorrespondentes
        };
      });

    Firebird.attach(options, (err, db) => {
        if (err) {
          return response.status(500).json({
            err: true,
            erro_msg: err,
            msg: "Erro, conexão",
          });
        }
  
        db.transaction(
          Firebird.ISOLATION_READ_UNCOMMITTED,
          async (err, transaction) => {
            if (err) {
              db.detach();  
              return response.status(500).json({
                err: true,
                msg: err,
              });
            } 
                
            try{
                const dataPortal = await executeQueryTrx(transaction,folhaSQL.checkPortal,[idPortal])
                const {NOME:namePortal, ID: idOrgao, CNPJ: cnpjOrgao} = dataPortal[0]
                const typePortal = getTypePortal(namePortal)
                console.log(typePortal)
                
                //if(data)
                if(dataPortal.length == 0 ){
                    return response.status(404).json({
                        err: true,
                        msg: "Erro, Portal não encontrado no sistema",
                        erro_msg: "não encontrado",
                    });

                }
                //return response.json({dataFolhasAndRubricas})
                for (let {nome,mes_periodo,ano,idTipoPagamento,cpf,matricula,cbo,cargo,lotacao, vinculo,dataAdmissao,cargaHoraria,valorBruto,valorLiquido,valorDesconto,rubricas} of dataFolhasAndRubricas){    
                    
                    const idFolha = uuid();
                    await executeQueryTrx(transaction,folhaSQL.created,[idFolha,nome,mes_periodo,ano,idTipoPagamento,idOrgao,cpf,matricula,cbo,cargo,lotacao, vinculo,dataAdmissao,cargaHoraria,valorBruto,valorLiquido,valorDesconto])
                    
                    for (let {mes_periodo,ano,cpf,tipoPagamento,idTipoPagamento,desconto,valor} of rubricas){ 
                        if(desconto == 'N'){
                            desconto = 1
                        }else{
                            desconto = 0
                        }
                        await executeQueryTrx(transaction,rubricasModel.created,[uuid(),idFolha,cpf,mes_periodo,ano,idTipoPagamento, tipoPagamento,desconto,valor])
                    }  

                    const resultdesconto = await executeQueryTrx(transaction,rubricasModel.checkDescontos,[idFolha])
                    const desconto = resultdesconto[0]['DESCONTO_TOTAL']
                    
                    await executeQueryTrx(transaction,folhaSQL.updateDesconto,[desconto,idFolha])
                }

                // Commit...
                transaction.commit((err) => {
                    if (err) {
                    transaction.rollback();
                    response.status(500).json({
                        err: true,
                        msg: "Erro, rollback realizado",
                        erro_msg: err,
                    });
                    } else {
                        console.log("Sucesso, FL cadastradas")
                        return response.status(200).json({
                            error: false,
                            title: 'Sucesso, novos dados inserido via csv',
                            
                        });
                    }})
                   
                }catch(error){
                    transaction.rollback();
                    console.log(error)
                    return response.status(404).json({
                        error: true,
                        title: 'Erro, operação de cadastro de folha',
                        err_msg: error
                    });
            }
          })
    })
}
const processXLS = async(file, request, response)=>{

    const {buffer} = file
    const params = request.body
    
    const data = await extractDataXLS_Servidores(buffer,params)

    response.json({"resultExtract": resultExtract})
    return response.status(200).json({
        error: false,
        title: 'Sucesso, novos dados inserido via XLS',
        data
    });
}
const processXML = async(file, request, response)=>{
    const {buffer} = file

    const data = await extractDataXML_Servidores(buffer)

    return response.status(200).json({
        error: false,
        title: 'Sucesso, novos dados inserido via XML',
        data
    });
}

module.exports = {
    insert: async( request, response)=>{
        const {fileFolha, fileRubricas} = request.files;
        const files = request.files;

       
        //apenas o tipo csv aceita folha e rubicas juntos
        switch (fileFolha[0]['mimetype']) {
            case 'text/csv':
                console.log("__CSV")
                processCSV(files, request, response);
                break;
            case 'application/vnd.ms-excel':
                console.log("__XLS_EXECEL")
                processXLS(fileFolha,request, response);
                break;
            case 'application/xml':
                console.log("__XML")
                processXML(fileFolha,request, response);
                break;
            case 'application/json':
                console.log("__JSON")
                processJSON(fileFolha,request, response);
                break;
            default:
                return response.status(502).json({
                    err: true,
                    err_msg: "Error, Unsupported file type",
                    data: []
                });
        }
    },
    joinCSV: async( request, response)=>{
        //console.log(request.file);
        const {files} = request
        const {body} = request
        return response.status(200).json({
            error: false,
            title: 'Sucesso, novo arquivo gerado',
            data: files[0].buffer
        });
    },
    show: async (request, response)=>{
        try {    
        executeQuery(
            `SELECT * FROM ORGAO`
             ,[],
            (err, result) => {
                if (err) {
                return response.status(502).json({
                    error: true,
                    error_title: "Erro, na resposta do banco de dados",
                    error_msg: error,
                    data: []
                });
                }
             
                return response.status(200).json({
                    error: false,
                    title: 'Sucesso, listagem de dados',
                    data: result
                });
            }
            );
        }catch(error){       
            return response.status(500).json({
                error: true,
                error_title: "Erro inesperado",
                error_msg: error,
                data: []
            });
        }
    },
    list: async ( request, response)=>{
    
        //const a = await client.DadosExatraidosFolhaDePagementos.findMany();
        return response.status(200).json({
            error: false,
            title: 'Sucesso, listagem das folhas de pagamento',
            data: []
            });
    
    },

}