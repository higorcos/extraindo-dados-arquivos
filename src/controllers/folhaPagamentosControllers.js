const { extractDataXLS_Servidores, extractDataXML_Servidores } = require('../ultils/extractData');

const {executeQuery,executeQueryTrx} = require('../database/type');
const { v4: uuid } = require('uuid');
const { Readable } = require('stream');
const readLine = require('readline');

const Firebird = require("node-firebird");
const options = require("../database/client");
const folhaSQL = require("../models/folhaPagamentosModels")


const processCSV =  async(file, request, response)=>{
    const {idPortal} = request.params;
    
    const {buffer} = file
    const {
        columnNome, 
        columnVinculo, 
        columnMes_Periodo,
        columnAno,
        columnOrgao,
        columnCpf, 
        columnMatricula, 
        columnCargo, 
        columnDataAdmissao, 
        columnCargaHoraria, 
        columnValorBruto, 
        columnValorLiquido, 
        columnValorDesconto
            } = request.body

    
    const readableFile = new Readable();
    readableFile.push(buffer)
    readableFile.push(null)
    const dataLine = readLine.createInterface({
        input: readableFile
    })
    const data = []
 
    for await(let line of dataLine){
        const lineSplit = line.split('|');

        data.push({
        nome: lineSplit[columnNome],
        vinculo: lineSplit[columnVinculo],       
        mes_periodo: lineSplit[columnMes_Periodo],
        ano: lineSplit[columnAno],
        orgao: lineSplit[columnOrgao],
        cpf: lineSplit[columnCpf],
        matricula: lineSplit[columnMatricula], 
        cargo: lineSplit[columnCargo],
        dataAdmissao: lineSplit[columnDataAdmissao],//10
        cargaHoraria: lineSplit[columnCargaHoraria],
        valorBruto: parseFloat(lineSplit[columnValorBruto]),
        valorLiquido: parseFloat(lineSplit[columnValorLiquido]),
        valorDesconto: parseFloat(lineSplit[columnValorDesconto]),
        })


    }
    
    Firebird.attach(options, (err, db) => {
        if (err) {
          return response.status(500).json({
            err: true,
            erro_msg: err,
            msg: "Erro, conexão",
          });
        }
  
        db.transaction(
          Firebird.ISOLATION_READ_COMMITED,
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
                //if(data)
                if(dataPortal.length == 0 ){
                    return response.status(404).json({
                        err: true,
                        msg: "Erro, Portal não encontrado no sistema",
                        erro_msg: "não encontrado",
                    });
                }
                console.log(dataPortal)

                for (let {nome,vinculo,mes_periodo,ano,orgao,cpf,matricula,cargo,dataAdmissao,cargaHoraria,valorBruto,valorLiquido,valorDesconto} of data){    
                    let newId = uuid()
                    await executeQueryTrx(transaction,folhaSQL.created,[newId,nome,vinculo,mes_periodo,ano,dataPortal[0]["ID"],cpf,matricula,cargo,"2001-06-23",cargaHoraria,valorBruto,valorLiquido,valorDesconto])
                }
                
                await executeQueryTrx(transaction,folhaSQL.checkPortal,[idPortal])


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
                    
                    return response.status(404).json({
                        error: true,
                        title: 'Erro, operação de cadastro de folha',
                        
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
        const file = request.file   
    
        switch (file.mimetype) {
            case 'text/csv':
                console.log("__CSV")
                processCSV(file, request, response);
                break;
            case 'application/vnd.ms-excel':
                console.log("__XLS_EXECEL")
                processXLS(file,request, response);
                break;
            case 'application/xml':
                console.log("__XML")
                processXML(file,request, response);
                break;
            case 'application/json':
                console.log("__JSON")
                processJSON(file,request, response);
                break;
            default:
                return response.status(502).json({
                    error: true,
                    error_title: "Error, Unsupported file type",
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


