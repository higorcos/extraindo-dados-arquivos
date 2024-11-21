const { extractDataXLS_Servidores, extractDataXML_Servidores } = require('../ultils/extractData');

const {executeQuery,executeQueryTrx} = require('../database/type');
const { v4: uuid } = require('uuid');
const { Readable } = require('stream');
const readLine = require('readline');

const Firebird = require("node-firebird");
const options = require("../database/client");
const folhaSQL = require("../models/folhaPagamentosModels")
const rubricasModel = require("../models/rubricasModels");
const { formatDataDB, formatDataDB_importPI } = require('../ultils/formatDate');
const {getTypePortal} = require('../ultils/typePortal');

const { Worker } = require('worker_threads');
const {dividirArray} = require('../ultils/paralelo/ultils'); 

const runWorker = async (idPortal,dataFolhasAndRubricas)=>{
    return new Promise((resolve, reject) => {
        const worker = new Worker('./src/controllers/work-fl.js', {
        workerData:{
            idPortal,
            dataFolhasAndRubricas
        }  // Passa uma parte do array para o worker
        });

        worker.on('message', resolve); // Recebe mensagem do worker
        worker.on('error', reject); // Captura erros do worker
        worker.on('exit', (code) => { 
        if (code !== 0) {
            reject(new Error(`Worker parou com o código ${code}`));
        }
        });
    });
}
  
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
        dataAdmissao:   formatDataDB(lineSplit[columnDataAdmissao]),
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
        const columnMes_Periodo = 1
        const columnAno = 2
        const columnIdTipoPagamento = 3
        const columnCpf = 4
        const columnValor = 8
        const columnTipoPagamento = 7
        const columnDesconto = 14 

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
    // Filtra as rubricas que correspondem ao cpf, mes_periodo, ano e idTipoPagamento
    const rubricasCorrespondentes = dataRubricas.filter(rubrica =>
        rubrica.cpf === folha.cpf &&
        rubrica.mes_periodo === folha.mes_periodo &&
        rubrica.ano === folha.ano &&
        rubrica.idTipoPagamento === folha.idTipoPagamento
    );
    
    // Soma os valores da chave 'valor' dentro de 'rubricas' com a condição de desconto
    const totalValorRubricas = rubricasCorrespondentes.reduce((acc, rubrica) => {
        let desconto = rubrica.desconto;
    
        if (desconto === 'N') {
        desconto = 1; // Se desconto for 'N', inclui o valor na soma
        return acc + (rubrica.valor || 0); // Adiciona o valor à soma
        } else {
        desconto = 0; // Se desconto for diferente de 'N', não soma
        return acc;
        }
    }, 0);
    
    // Retorna o objeto 'folha' com a chave 'rubricas' e o total somado com duas casas decimais
    return {
        ...folha,
        rubricas: rubricasCorrespondentes,
        valorDesconto: totalValorRubricas.toFixed(2) // Formata com duas casas decimais
    };
    });
 
    const newArray = dividirArray(dataFolhasAndRubricas)

     Promise.all(newArray.map(array => runWorker(idPortal,array))) // Executa todos os workers
     .then((res) => {
        console.log(res)
        console.log('Todos os workers completaram a tarefa');

        return response.status(200).json({
            error: false,
            title: 'Sucesso, novos dados inserido via csv',
        });
    }).catch(err => {
        console.error(err)
        return response.status(500).json({
            err: true,
            msg: "Erro, rollback realizado",
            erro_msg: err,
        });

    });

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
const processXML = async(files, request, response)=>{
    const {fileFolha, fileCadastrosXML, fileHistoricoXML} = request.files;
  
    const {buffer: bufferFileFolha} = fileFolha[0]
    const {buffer: bufferCadastros} = fileCadastrosXML[0]
    const {buffer: bufferHistorico} = fileHistoricoXML[0]
    
    const rawFolha = transformObject(await extractDataXML_Servidores(bufferFileFolha))
    const rawCadastros = transformObject(await extractDataXML_Servidores(bufferCadastros))
    const rawHistorico = transformObject(await extractDataXML_Servidores(bufferHistorico))

    const newData = joinDataPI(rawHistorico,rawCadastros,rawFolha)



    
    //console.log(data)
    return response.status(200).json({
        error: false,
        title: 'Sucesso, novos dados inserido via XML',
        data: newData
    });
}
const transformObject = (obj) => {
    if (Array.isArray(obj)) {
      // Caso seja um array, transforma cada item recursivamente
      return obj.map((item) => transformObject(item));
    }
  
    if (typeof obj === "object" && obj !== null) {
      const newObject = {};
  
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
  
          // Remover o prefixo antes dos ":"
          const newKey = key.includes(":") ? key.split(":")[1] : key;
  
          // Caso o valor seja um objeto com a propriedade 'value'
          if (typeof value === "object" && value !== null && "value" in value) {
            newObject[newKey] = value.value; // Adiciona ao novo objeto
          }
          // Caso o valor seja outro objeto ou array, processa recursivamente
          else {
            newObject[newKey] = transformObject(value);
          }
        }
      }
  
      return newObject;
    }
  
    // Retorna diretamente valores simples (string, number, etc.)
    return obj;
};
const renameRubricasKeys = (eventoArray, cpf, mes,ano) => {
return eventoArray.map((evento) => ({
    cpf: cpf || "",
    mes_periodo: mes || "",
    ano: ano || "",
    tipoPagamento: evento.descricaoEvenUnidGestora || "", // Renomeando 'tipoEvento' para 'tipoPagamento'
    idTipoPagamento: "TCE-PI-ID-" + evento.tipoEvento || "", // Renomeando 'codigoEvento' para 'idTipoPagamento'
    desconto: evento.tipoEvento === "2" ? 'N' : 'S', // Exemplo: mapeando 'incideIR' para 'desconto'
    valor: parseFloat(evento.valor) || 0, // Mantendo a chave 'valor' ou ajustando formato
}));
};
const joinDataPI = (historicos, rawCadastros, folhaPagamento) => {
const cargos = rawCadastros.CadastrosAuxiliaresSagresFolha.Cargo;
const lotacoes = rawCadastros.CadastrosAuxiliaresSagresFolha.lotacao;
const servidores = rawCadastros.CadastrosAuxiliaresSagresFolha.Servidor;
const PrestacaoContas =  folhaPagamento.folhaPagamento.PrestacaoContas;


return historicos.historicos.HistoricoFuncional.map((historico) => {
    const { matricula, informacoesAlteradas } = historico;

    // Adicionar informações pessoais com base na matrícula
    const infoPessoais = servidores.find((servidor) => servidor.matricula === matricula);

    // Adicionar informações de Cargo e Lotação
    const { atoTipo01 } = informacoesAlteradas;
    const cargoRelacionado = cargos.find((cargo) => cargo.codigoCargo === atoTipo01.codigoCargo);
    const lotacaoRelacionada = lotacoes.find(
    (lotacao) => lotacao.codigoLotacao === atoTipo01.codigoLotacao
    );

    // Buscar as informações de folha de pagamento baseadas na matrícula
    const folhaPgInfo = folhaPagamento.folhaPagamento.servidorFolha.find(
    (folha) => folha.matricula === matricula
    );

    // Somar os valores dos eventos tipo 2 para calcular o desconto de remuneração
    let descontoRemuneracao = 0;
    if (folhaPgInfo && folhaPgInfo.evento) {
    folhaPgInfo.evento.forEach((evento) => {
        if (evento.tipoEvento === "2") {
        descontoRemuneracao += parseFloat(evento.valor); // Somando o valor dos eventos tipo 2
        }
    });
    } 
    // Construir o objeto final com chaves fixas e os dados processados
    return {
    cpf: infoPessoais?.cpfServidor || "", 
    nome: infoPessoais?.nomeServido || "", 
    mes_periodo: PrestacaoContas.mesReferencia || "", 
    ano: PrestacaoContas.anoReferencia || "",
    idTipoPagamento: "TCE-PI-ID-"+ folhaPgInfo.tipoFolha || "", 
    orgao: '',
    matricula:  infoPessoais?.matricula || "", 
    cargo: cargoRelacionado?.nomeDoCargo || "",
    lotacao: lotacaoRelacionada?.nomeLotacao || "",
    cbo: cargoRelacionado.tipoOcupacao || "", 
    vinculo: "TCE-PI-ID-"+informacoesAlteradas?.atoTipo01.tipoVinculo || "",  
    dataAdmissao: formatDataDB_importPI(informacoesAlteradas.atoTipo01.dataPosse) || "",
    cargaHoraria: cargoRelacionado?.cargaHoraria || "",
    valorBruto: parseFloat(folhaPgInfo?.remuneracaoTotal || 0), 
    valorLiquido: parseFloat(folhaPgInfo?.remuneracaoLiquida || 0), 
    valorDesconto: parseFloat(descontoRemuneracao.toFixed(2)) || "", 
    rubricas: renameRubricasKeys(folhaPgInfo.evento,infoPessoais.cpfServidor,PrestacaoContas.mesReferencia,PrestacaoContas.anoReferencia),
    };
 
});
};

module.exports = {
    insert: async( request, response)=>{
        const {fileFolha, fileRubricas, fileCadastrosXML, fileHistoricoXML} = request.files;
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
                if (
                    (!fileCadastrosXML || fileCadastrosXML.length === 0) ||
                    (!fileHistoricoXML || fileHistoricoXML.length === 0)
                ) {

                    return response.status(400).json({
                        err: true,
                        err_msg: "Error, Faltando Arquivos",
                    });
                }else{
                    processXML(files,request, response); 
                }
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
    list: async ( request, response)=>{
    
        //const a = await client.DadosExatraidosFolhaDePagementos.findMany();
        return response.status(200).json({
            error: false,
            title: 'Sucesso, listagem das folhas de pagamento',
            data: []
            });
    
    },
    listAll: async(request, response)=>{
    const {idPortal} = request.params;
    console.log(idPortal)

        try {    
            executeQuery(
                folhaSQL.listAll
                 ,[idPortal],
                (err, result) => {
                    if (err) {
                    return response.status(502).json({
                        error: true,
                        error_title: "Erro, na resposta do banco de dados",
                        error_msg: err,
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
    listAllAndNotDisplayed: async(request, response)=>{
        const {idPortal} = request.params;
        console.log(idPortal)
    
            try {    
                executeQuery(
                    folhaSQL.listAllAndNotDisplayed
                     ,[idPortal],
                    (err, result) => {
                        if (err) {
                        return response.status(502).json({
                            error: true,
                            error_title: "Erro, na resposta do banco de dados",
                            error_msg: err,
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
    searchByPeriod: async(request, response)=>{
        const {idPortal,month,year} = request.params;
        console.log(idPortal)
    
            try {    
                executeQuery(
                    folhaSQL.searchByPeriod
                     ,[month,year,idPortal],
                    (err, result) => {
                        if (err) {
                        return response.status(502).json({
                            error: true,
                            error_title: "Erro, na resposta do banco de dados",
                            error_msg: err,
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
    searchByPeriodAndTables: async(request, response)=>{
        const {idPortal,month,year} = request.params;

        Firebird.attach(options, (err, db) => {
            if (err) {
              return response.status(500).json({
                err: true,
                erro_msg: err,
                msg: "Erro, conexão",
              });
            }
      
            db.transaction(
              Firebird.ISOLATION_READ_COMMITTED,
              async (err, transaction) => {
                if (err) {
                  db.detach();  
                  return response.status(500).json({
                    err: true,
                    msg: err,
                  });
                } 
                    
                try{
                    const inforPortal = await executeQueryTrx(transaction,folhaSQL.checkPortal,[idPortal])
                    const periodos = await executeQueryTrx(transaction,folhaSQL.showPeriods,[idPortal,1])
                    const folhas = await executeQueryTrx(transaction,folhaSQL.searchByPeriod,[month,year,idPortal])
                    const folhasAgupadas = await executeQueryTrx(transaction,folhaSQL.selectByFunction,[month,year,idPortal])
                    
    
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
                            console.log("Sucesso, Listagem")
                            return response.status(200).json({
                                error: false,
                                title: 'Sucesso, Listagem das folhas',
                                data:{inforPortal:inforPortal[0],periodos,folhas,folhasAgupadas}
                            });
                        }})
                       
                    }catch(error){
                        transaction.rollback();
                        console.log(error)
                        return response.status(404).json({
                            error: true,
                            title: 'Erro, operação de listagem das folha',
                            err_msg: error
                        });
                }
              })
        })
    },
    searchByPeriodAndNotDisplayed: async(request, response)=>{
        const {idPortal,month,year} = request.params;
        console.log(idPortal)
    
            try {    
                executeQuery(
                    folhaSQL.searchByPeriodAndNotDisplayed
                     ,[month,year,idPortal],
                    (err, result) => {
                        if (err) {
                        return response.status(502).json({
                            error: true,
                            error_title: "Erro, na resposta do banco de dados",
                            error_msg: err,
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
    changeView: async(request, response)=>{
        const {idPortal,month,year,view} = request.params;
        console.log({idPortal,month,year,view})
    
            try {    
                executeQuery(
                    folhaSQL.changeView
                     ,[view,month,year,idPortal],
                    (err, result) => {
                        if (err) {
                        return response.status(502).json({
                            error: true,
                            error_title: "Erro, na ateração de visualização",
                            error_msg: err,
                            data: []
                        });
                        }
                     
                        return response.status(200).json({
                            error: false,
                            title: 'Sucesso, na ateração de visualização',
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
    delete: async(request, response)=>{
        const {idPortal,month,year} = request.params;

        Firebird.attach(options, (err, db) => {
            if (err) {
              return response.status(500).json({
                err: true,
                erro_msg: err,
                msg: "Erro, conexão",
              });
            }
      
            db.transaction(
              Firebird.ISOLATION_READ_COMMITTED,
              async (err, transaction) => {
                if (err) {
                  db.detach();  
                  return response.status(500).json({
                    err: true,
                    msg: err,
                  });
                } 
                    
                try{
                    await executeQueryTrx(transaction,folhaSQL.deleteRb,[idPortal,month,year])
                    await executeQueryTrx(transaction,folhaSQL.deleteFl,[idPortal,month,year])
                    
    
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
                            return response.status(200).json({
                                error: false,
                                title: `Sucesso, delete de folha ${month}/${year}`,
                                data:[]
                            });
                        }})
                       
                    }catch(error){
                        transaction.rollback();
                        console.log(error)
                        return response.status(404).json({
                            error: true,
                            title: 'Erro, operação de delete de folha',
                            err_msg: error
                        });
                }
              })
        })
    },
    showPeriods: async(request, response)=>{
        const {idPortal} = request.params;
        console.log({idPortal})
    
            try {    
                executeQuery(
                    folhaSQL.showPeriods
                     ,[idPortal,1],
                    (err, result) => {
                        if (err) {
                        return response.status(502).json({
                            error: true,
                            error_title: "Erro, na listagem de Periodos",
                            error_msg: err,
                            data: []
                        });
                        }
                     
                        return response.status(200).json({
                            error: false,
                            title: 'Sucesso, na listagem de Periodos',
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
    allPeriods: async(request, response)=>{
        const {idPortal} = request.params;
        console.log({idPortal})
    
            try {    
                executeQuery(
                    folhaSQL.allPeriods
                     ,[idPortal],
                    (err, result) => {
                        if (err) {
                        return response.status(502).json({
                            error: true,
                            error_title: "Erro, na listagem de todos os Periodos",
                            error_msg: err,
                            data: []
                        });
                        }
                     
                        return response.status(200).json({
                            error: false,
                            title: 'Sucesso, na listagem de Periodos',
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
} 