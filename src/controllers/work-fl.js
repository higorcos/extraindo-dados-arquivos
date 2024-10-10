const { parentPort, workerData } = require('worker_threads');
const {executeQuery,executeQueryTrx} = require('../database/type');
const { v4: uuid } = require('uuid');
const Firebird = require("node-firebird");
const options = require("../database/client");
const rubricasModel = require("../models/rubricasModels");
const folhaSQL = require("../models/folhaPagamentosModels");
const { response } = require('express');

// `workerData` é a parte do array recebida do script principal
const {dataFolhasAndRubricas,idPortal} = workerData;

Firebird.attach(options,(err, db) => {
  if (err) {
    console.log('Erro, conexão com banco de dados')
    parentPort.postMessage({ success: false, message: 'Erro, conexão' }); 
  }

  db.transaction(
    Firebird.ISOLATION_READ_COMMITTED,
    async (err, transaction) => {
      if (err) {
        db.detach();  
        console.log('Erro, inesperado')
        parentPort.postMessage({ success: false, message: 'Erro, inesperado' }); 
      } 
      try{  
          const dataPortal = await executeQueryTrx(transaction,folhaSQL.checkPortal,[idPortal])
          const {NOME:namePortal, ID: idOrgao, CNPJ: cnpjOrgao} = dataPortal[0]
          
          //if(data)
          if(dataPortal.length == 0 ){
            console.log('Erro, portal não encontrado')
            parentPort.postMessage({ success: false, message: 'Erro, Portal não encontrado no sistema' });
          }

                  
          for (let {nome,mes_periodo,ano,idTipoPagamento,cpf,matricula,cbo,cargo,lotacao, vinculo,dataAdmissao,cargaHoraria,valorBruto,valorLiquido,valorDesconto,rubricas} of dataFolhasAndRubricas){    
              //console.log('.')
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

          }

          // Commit... 
          transaction.commit((err) => {
              if (err) {
                  transaction.rollback();
                  console.log('Erro, fl não cadastradas')
                  console.log(err)
                  parentPort.postMessage({ success: false, message: 'Erro, rollback realizado' });
              } else {
                  console.log("Sucesso, FL cadastradas")
                  parentPort.postMessage({ success: true, message: 'Processo concluído com sucesso' });
              }})
             
          }catch(err){
              transaction.rollback();
              console.log('Erro, fl não cadastradas')
              console.log(err)
              parentPort.postMessage({ success: false, message: 'Erro, rollback realizado' });           
          }finally{
            db.detach(); 
          } 
    })
})
